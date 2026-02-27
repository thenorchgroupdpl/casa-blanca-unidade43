import { z } from "zod";
import { router, clientAdminProcedure, publicProcedure } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { notifyTenant, type OrderEvent } from "../sse";

// Helper to get tenant ID from user context
function getTenantIdFromUser(user: { tenantId: number | null; role: string }) {
  if (!user.tenantId && user.role !== 'super_admin') {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Usuário não está associado a nenhuma loja",
    });
  }
  return user.tenantId!;
}

// ============================================
// ORDERS ROUTER (Kanban)
// ============================================

export const ordersRouter = router({
  // List orders (optionally filtered by status)
  list: clientAdminProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      return db.getOrdersByStatus(tenantId, input?.status);
    }),

  // Get single order
  getById: clientAdminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const order = await db.getOrderById(input.id);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pedido não encontrado" });
      }
      const tenantId = getTenantIdFromUser(ctx.user);
      if (order.tenantId !== tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return order;
    }),

  // Update order status (drag-and-drop Kanban)
  updateStatus: clientAdminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["novo", "em_preparacao", "saiu_entrega", "concluido", "cancelado"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const order = await db.getOrderById(input.id);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pedido não encontrado" });
      }
      const tenantId = getTenantIdFromUser(ctx.user);
      if (order.tenantId !== tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await db.updateOrderStatus(input.id, input.status);
      return { success: true };
    }),

  // Create order (from public checkout)
  create: publicProcedure
    .input(z.object({
      tenantId: z.number(),
      customerName: z.string().min(1),
      customerPhone: z.string().optional(),
      summary: z.string().min(1),
      items: z.array(z.object({
        productId: z.number(),
        name: z.string(),
        quantity: z.number(),
        price: z.number(),
      })).optional(),
      totalValue: z.string(),
      deliveryZoneId: z.number().optional(),
      deliveryZoneName: z.string().optional(),
      deliveryFee: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createOrderFull(input);

      // Notify tenant via SSE
      try {
        const event: OrderEvent = {
          orderId: id,
          customerName: input.customerName,
          total: parseFloat(input.totalValue),
          itemCount: input.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
          createdAt: new Date().toISOString(),
          zone: input.deliveryZoneName || "Retirada no Local",
        };
        notifyTenant(input.tenantId, event);
      } catch (err) {
        console.error("[SSE] Failed to notify tenant:", err);
      }

      return { id };
    }),

  // Create order manually (from lojista admin)
  createManual: clientAdminProcedure
    .input(z.object({
      customerName: z.string().min(1, "Nome do cliente é obrigatório"),
      customerPhone: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(),
        name: z.string(),
        quantity: z.number().min(1),
        price: z.number().min(0),
      })).min(1, "Adicione pelo menos 1 item"),
      deliveryZoneId: z.number().optional(),
      deliveryZoneName: z.string().optional(),
      deliveryFee: z.string().optional(),
      observation: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);

      const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const fee = input.deliveryFee ? parseFloat(input.deliveryFee) : 0;
      const totalValue = (subtotal + fee).toFixed(2);

      const summary = input.items
        .map((item) => `${item.quantity}x ${item.name}`)
        .join(', ')
        + (input.observation ? ` | Obs: ${input.observation}` : '');

      const id = await db.createOrderFull({
        tenantId,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        summary,
        items: input.items,
        totalValue,
        deliveryZoneId: input.deliveryZoneId,
        deliveryZoneName: input.deliveryZoneName,
        deliveryFee: input.deliveryFee,
        status: 'novo',
      });

      return { id };
    }),

  // Cancel order (soft cancel — changes status to cancelado, excluded from metrics)
  cancel: clientAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const order = await db.getOrderById(input.id);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pedido não encontrado" });
      }
      const tenantId = getTenantIdFromUser(ctx.user);
      if (order.tenantId !== tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (order.status === 'cancelado') {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Pedido já está cancelado" });
      }
      if (order.status === 'concluido') {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Pedido concluído não pode ser cancelado" });
      }
      await db.updateOrderStatus(input.id, 'cancelado');
      return { success: true };
    }),

  // Get count of unviewed new orders (for badge)
  unviewedCount: clientAdminProcedure
    .query(async ({ ctx }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      const count = await db.getUnviewedOrdersCount(tenantId);
      return { count };
    }),

  // Mark all new orders as viewed (when lojista opens orders page)
  markViewed: clientAdminProcedure
    .mutation(async ({ ctx }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      await db.markOrdersAsViewed(tenantId);
      return { success: true };
    }),
});

// ============================================
// PRODUCT UPSELLS ROUTER (Order Bump)
// ============================================

export const upsellsRouter = router({
  // Get upsell product IDs for a product (admin)
  getIds: clientAdminProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ ctx, input }) => {
      return db.getProductUpsellIds(input.productId);
    }),

  // Get upsell products with full data (public - for landing page)
  getProducts: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      return db.getProductUpsells(input.productId);
    }),

  // Set upsell products for a product (admin)
  set: clientAdminProcedure
    .input(z.object({
      productId: z.number(),
      upsellProductIds: z.array(z.number()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify product ownership
      const product = await db.getProductById(input.productId);
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Produto não encontrado" });
      }
      const tenantId = getTenantIdFromUser(ctx.user);
      if (product.tenantId !== tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      await db.setProductUpsells(input.productId, input.upsellProductIds);
      return { success: true };
    }),
});

// ============================================
// DELIVERY ZONES ROUTER (Logística)
// ============================================

export const deliveryZonesRouter = router({
  // List delivery zones for current tenant
  list: clientAdminProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantIdFromUser(ctx.user);
    return db.getDeliveryZonesByTenant(tenantId);
  }),

  // List delivery zones for a specific tenant (public - for checkout)
  listPublic: publicProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getDeliveryZonesByTenant(input.tenantId);
    }),

  // Create delivery zone
  create: clientAdminProcedure
    .input(z.object({
      zoneName: z.string().min(1, "Nome da zona é obrigatório"),
      feeAmount: z.string(),
      isPickup: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      
      // Validate: only 1 pickup zone per tenant
      if (input.isPickup) {
        const pickupCount = await db.countPickupZones(tenantId);
        if (pickupCount > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Já existe uma zona de retirada no local. Apenas uma é permitida.",
          });
        }
      }
      
      // Validate fee >= 0
      const fee = parseFloat(input.feeAmount);
      if (isNaN(fee) || fee < 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A taxa de entrega deve ser maior ou igual a zero.",
        });
      }
      
      const id = await db.createDeliveryZone({
        tenantId,
        zoneName: input.zoneName,
        feeAmount: input.isPickup ? "0.00" : input.feeAmount,
        isPickup: input.isPickup ?? false,
      });
      
      return { id };
    }),

  // Update delivery zone
  update: clientAdminProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        zoneName: z.string().optional(),
        feeAmount: z.string().optional(),
        isPickup: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const zone = await db.getDeliveryZoneById(input.id);
      if (!zone) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Zona não encontrada" });
      }
      const tenantId = getTenantIdFromUser(ctx.user);
      if (zone.tenantId !== tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      // Validate: only 1 pickup zone per tenant
      if (input.data.isPickup && !zone.isPickup) {
        const pickupCount = await db.countPickupZones(tenantId);
        if (pickupCount > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Já existe uma zona de retirada no local.",
          });
        }
      }
      
      // Validate fee >= 0
      if (input.data.feeAmount !== undefined) {
        const fee = parseFloat(input.data.feeAmount);
        if (isNaN(fee) || fee < 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A taxa de entrega deve ser maior ou igual a zero.",
          });
        }
      }
      
      // If switching to pickup, force fee to 0
      const updateData = { ...input.data };
      if (input.data.isPickup) {
        updateData.feeAmount = "0.00";
      }
      
      await db.updateDeliveryZone(input.id, updateData);
      return { success: true };
    }),

  // Delete delivery zone
  delete: clientAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const zone = await db.getDeliveryZoneById(input.id);
      if (!zone) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Zona não encontrada" });
      }
      const tenantId = getTenantIdFromUser(ctx.user);
      if (zone.tenantId !== tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      await db.deleteDeliveryZone(input.id);
      return { success: true };
    }),
});
