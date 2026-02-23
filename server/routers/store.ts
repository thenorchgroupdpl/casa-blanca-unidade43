import { z } from "zod";
import { router, clientAdminProcedure, publicProcedure } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

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

// Opening hours schema
const openingHoursSchema = z.object({
  monday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  tuesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  wednesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  thursday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  friday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  saturday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  sunday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
}).optional();

// Social links schema
const socialLinksSchema = z.object({
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  youtube: z.string().optional(),
  tiktok: z.string().optional(),
}).optional();

export const storeRouter = router({
  // Get store settings for current tenant
  getSettings: clientAdminProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantIdFromUser(ctx.user);
    return db.getStoreSettings(tenantId);
  }),

  // Get store settings by tenant ID (Super Admin)
  getSettingsByTenant: clientAdminProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'super_admin' && ctx.user.tenantId !== input.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return db.getStoreSettings(input.tenantId);
    }),

  // Update store settings (Client Admin can edit these)
  updateSettings: clientAdminProcedure
    .input(z.object({
      whatsapp: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional().or(z.literal("")),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      cep: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      openingHours: openingHoursSchema,
      socialLinks: socialLinksSchema,
      heroTitle: z.string().optional(),
      heroSubtitle: z.string().optional(),
      aboutTitle: z.string().optional(),
      aboutText: z.string().optional(),
      ownerName: z.string().optional(),
      ownerPhoto: z.string().optional(),
      deliveryFee: z.string().optional().nullable(),
      attendantName: z.string().optional(),
      attendantPhoto: z.string().optional(),
      tenantId: z.number().optional(), // For super_admin
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = input.tenantId && ctx.user.role === 'super_admin'
        ? input.tenantId
        : getTenantIdFromUser(ctx.user);

      await db.upsertStoreSettings(tenantId, {
        whatsapp: input.whatsapp,
        phone: input.phone,
        email: input.email || null,
        address: input.address,
        city: input.city,
        state: input.state,
        cep: input.cep,
        latitude: input.latitude,
        longitude: input.longitude,
        openingHours: input.openingHours,
        socialLinks: input.socialLinks,
        heroTitle: input.heroTitle,
        heroSubtitle: input.heroSubtitle,
        aboutTitle: input.aboutTitle,
        aboutText: input.aboutText,
        ownerName: input.ownerName,
        ownerPhoto: input.ownerPhoto,
        deliveryFee: input.deliveryFee === '' ? null : input.deliveryFee,
        attendantName: input.attendantName,
        attendantPhoto: input.attendantPhoto,
      });

      return { success: true };
    }),

  // Get home rows configuration
  getHomeRows: clientAdminProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantIdFromUser(ctx.user);
    return db.getHomeRowsByTenant(tenantId);
  }),

  // Get home rows by tenant (Super Admin)
  getHomeRowsByTenant: clientAdminProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'super_admin' && ctx.user.tenantId !== input.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return db.getHomeRowsByTenant(input.tenantId);
    }),

  // Update home row (vitrine configuration)
  updateHomeRow: clientAdminProcedure
    .input(z.object({
      rowNumber: z.number().min(1).max(3),
      categoryId: z.number(),
      customTitle: z.string().optional(),
      tenantId: z.number().optional(), // For super_admin
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = input.tenantId && ctx.user.role === 'super_admin'
        ? input.tenantId
        : getTenantIdFromUser(ctx.user);

      // Verify category belongs to tenant
      const category = await db.getCategoryById(input.categoryId);
      if (!category || category.tenantId !== tenantId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Categoria inválida" });
      }

      await db.upsertHomeRow(tenantId, input.rowNumber, input.categoryId, input.customTitle);
      return { success: true };
    }),

  // Delete home row
  deleteHomeRow: clientAdminProcedure
    .input(z.object({
      rowNumber: z.number().min(1).max(3),
      tenantId: z.number().optional(), // For super_admin
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = input.tenantId && ctx.user.role === 'super_admin'
        ? input.tenantId
        : getTenantIdFromUser(ctx.user);

      await db.deleteHomeRow(tenantId, input.rowNumber);
      return { success: true };
    }),

  // ============================================
  // MANUAL OVERRIDE (Loja Aberta/Fechada)
  // ============================================
  setManualOverride: clientAdminProcedure
    .input(z.object({
      override: z.enum(['open', 'closed']).nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      await db.setManualOverride(tenantId, input.override);
      return { success: true };
    }),

  // ============================================
  // ORDERS LOG
  // ============================================
  getOrders: clientAdminProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantIdFromUser(ctx.user);
    return db.getOrdersByTenant(tenantId);
  }),

  createOrder: clientAdminProcedure
    .input(z.object({
      customerName: z.string().min(1),
      customerPhone: z.string().optional(),
      summary: z.string().min(1),
      totalValue: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      const id = await db.createOrder({
        tenantId,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        summary: input.summary,
        totalValue: input.totalValue,
      });
      return { success: true, id };
    }),

  toggleOrderCompleted: clientAdminProcedure
    .input(z.object({
      orderId: z.number(),
      isCompleted: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      await db.toggleOrderCompleted(input.orderId, input.isCompleted);
      return { success: true };
    }),

  // ============================================
  // QUICK PRODUCT AVAILABILITY TOGGLE
  // ============================================
  toggleProductAvailability: clientAdminProcedure
    .input(z.object({
      productId: z.number(),
      isAvailable: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      await db.toggleProductAvailability(input.productId, input.isAvailable);
      return { success: true };
    }),
});

// ============================================
// PUBLIC STORE DATA (for Landing Page)
// ============================================

export const publicStoreRouter = router({
  // Get full store data by slug (public endpoint for landing page)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const data = await db.getFullTenantDataBySlug(input.slug);
      
      if (!data || !data.tenant.isActive) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Loja não encontrada" });
      }

      // Remove sensitive data before returning
      const { googleApiKey, ...tenantPublic } = data.tenant;

      return {
        tenant: tenantPublic,
        settings: data.settings,
        categories: data.categories.filter(c => c.isActive),
        products: data.products.filter(p => p.isAvailable),
        homeRows: data.homeRows,
        reviews: data.reviews,
      };
    }),

  // Get store data by ID (for preview in admin)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const data = await db.getFullTenantData(input.id);
      
      if (!data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Loja não encontrada" });
      }

      // Remove sensitive data before returning
      const { googleApiKey, ...tenantPublic } = data.tenant;

      return {
        tenant: tenantPublic,
        settings: data.settings,
        categories: data.categories,
        products: data.products,
        homeRows: data.homeRows,
        reviews: data.reviews,
      };
    }),
});
