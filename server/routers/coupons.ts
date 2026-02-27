import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import type { Coupon } from "../../drizzle/schema";

// Helper to get tenantId from authenticated client_admin or super_admin
function getTenantIdFromUser(user: { role: string; tenantId: number | null }): number {
  if (user.role === "client_admin" && user.tenantId) return user.tenantId;
  if (user.role === "super_admin" && user.tenantId) return user.tenantId;
  throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
}

// Client Admin procedure (reusable)
const clientAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "client_admin" && ctx.user.role !== "super_admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Apenas lojistas podem gerenciar cupons" });
  }
  return next({ ctx });
});

export const couponsRouter = router({
  // List all coupons for the tenant
  list: clientAdminProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantIdFromUser(ctx.user);
    return db.listCoupons(tenantId);
  }),

  // Create a new coupon
  create: clientAdminProcedure
    .input(
      z.object({
        code: z.string().min(2).max(50),
        discountPercentage: z.number().min(0.01).max(100),
        isActive: z.boolean().optional().default(true),
        expiresAt: z.string().nullable().optional(), // ISO date string or null
        usageLimit: z.number().int().min(1).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      
      // Check for duplicate code within tenant
      const existing = await db.validateCoupon(tenantId, input.code);
      if (existing.valid || (existing as any).coupon) {
        // Also check if code exists even if expired/inactive
        const allCoupons = await db.listCoupons(tenantId);
        const duplicate = allCoupons.find(
          (c: Coupon) => c.code === input.code.toUpperCase().trim()
        );
        if (duplicate) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe um cupom com este código",
          });
        }
      }
      
      const result = await db.createCoupon({
        tenantId,
        code: input.code,
        discountPercentage: input.discountPercentage.toFixed(2),
        isActive: input.isActive,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        usageLimit: input.usageLimit ?? null,
      });
      
      return { id: result.id, success: true };
    }),

  // Update a coupon
  update: clientAdminProcedure
    .input(
      z.object({
        id: z.number(),
        code: z.string().min(2).max(50).optional(),
        discountPercentage: z.number().min(0.01).max(100).optional(),
        isActive: z.boolean().optional(),
        expiresAt: z.string().nullable().optional(),
        usageLimit: z.number().int().min(1).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      
      const existing = await db.getCouponById(input.id, tenantId);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cupom não encontrado" });
      }
      
      // Check for duplicate code if changing code
      if (input.code && input.code.toUpperCase().trim() !== existing.code) {
        const allCoupons = await db.listCoupons(tenantId);
        const duplicate = allCoupons.find(
          (c: Coupon) => c.code === input.code!.toUpperCase().trim() && c.id !== input.id
        );
        if (duplicate) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe um cupom com este código",
          });
        }
      }
      
      await db.updateCoupon(input.id, tenantId, {
        code: input.code,
        discountPercentage: input.discountPercentage?.toFixed(2),
        isActive: input.isActive,
        expiresAt: input.expiresAt !== undefined
          ? (input.expiresAt ? new Date(input.expiresAt) : null)
          : undefined,
        usageLimit: input.usageLimit,
      });
      
      return { success: true };
    }),

  // Toggle active status
  toggleActive: clientAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      const coupon = await db.getCouponById(input.id, tenantId);
      if (!coupon) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cupom não encontrado" });
      }
      await db.updateCoupon(input.id, tenantId, { isActive: !coupon.isActive });
      return { success: true, isActive: !coupon.isActive };
    }),

  // Delete a coupon
  delete: clientAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      await db.deleteCoupon(input.id, tenantId);
      return { success: true };
    }),

  // Public: Validate a coupon code (for the cart)
  validate: publicProcedure
    .input(
      z.object({
        tenantId: z.number(),
        code: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const result = await db.validateCoupon(input.tenantId, input.code);
      return result;
    }),

  // Public: Increment usage count after order is placed
  incrementUsage: publicProcedure
    .input(z.object({ couponId: z.number() }))
    .mutation(async ({ input }) => {
      await db.incrementCouponUsage(input.couponId);
      return { success: true };
    }),
});
