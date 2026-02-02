import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

// Feature Routers
import { tenantsRouter } from "./routers/tenants";
import { categoriesRouter, productsRouter } from "./routers/catalog";
import { storeRouter, publicStoreRouter } from "./routers/store";

export const appRouter = router({
  // System routes
  system: systemRouter,
  
  // Auth routes
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    // Get current user's role and tenant info
    getRole: protectedProcedure.query(({ ctx }) => {
      return {
        role: ctx.user.role,
        tenantId: ctx.user.tenantId,
        name: ctx.user.name,
        email: ctx.user.email,
      };
    }),
  }),

  // ============================================
  // SUPER ADMIN ROUTES
  // ============================================
  
  // Tenant management (Super Admin only)
  tenants: tenantsRouter,

  // ============================================
  // CLIENT ADMIN ROUTES
  // ============================================
  
  // Catalog management (Client Admin)
  categories: categoriesRouter,
  products: productsRouter,
  
  // Store settings (Client Admin)
  store: storeRouter,

  // ============================================
  // PUBLIC ROUTES (Landing Page)
  // ============================================
  
  // Public store data
  publicStore: publicStoreRouter,

  // Alias for backward compatibility
  public: router({
    getTenantBySlug: publicProcedure
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
  }),
});

export type AppRouter = typeof appRouter;
