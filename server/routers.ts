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
import { emailAuthRouter } from "./routers/auth";
import { usersRouter } from "./routers/users";
import { globalSettingsRouter, publicGlobalSettingsRouter } from "./routers/globalSettings";

export const appRouter = router({
  // System routes
  system: systemRouter,
  
  // Auth routes (OAuth)
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
    getRole: protectedProcedure.query(async ({ ctx }) => {
      let tenantName: string | null = null;
      let tenantSlug: string | null = null;
      if (ctx.user.tenantId) {
        const tenant = await db.getTenantById(ctx.user.tenantId);
        tenantName = tenant?.name || null;
        tenantSlug = tenant?.slug || null;
      }
      return {
        role: ctx.user.role,
        tenantId: ctx.user.tenantId,
        tenantName,
        tenantSlug,
        name: ctx.user.name,
        email: ctx.user.email,
        avatarUrl: ctx.user.avatarUrl || null,
      };
    }),
  }),

  // Profile routes
  profile: router({
    update: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(100) }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserName(ctx.user.id, input.name);
        return { success: true };
      }),
    uploadAvatar: protectedProcedure
      .input(z.object({
        imageData: z.string(),
        fileName: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { storagePut } = await import('./storage');
        const buffer = Buffer.from(input.imageData, 'base64');
        const fileKey = `avatars/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        await db.updateUserAvatar(ctx.user.id, url);
        return { url };
      }),
    removeAvatar: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.updateUserAvatar(ctx.user.id, null);
        return { success: true };
      }),
  }),

  // Email/Password Auth routes
  emailAuth: emailAuthRouter,

  // ============================================
  // SUPER ADMIN ROUTES
  // ============================================
  
  // Tenant management (Super Admin only)
  tenants: tenantsRouter,

  // User management (Super Admin only)
  users: usersRouter,

  // Global settings (Super Admin only)
  globalSettings: globalSettingsRouter,

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

  // Public global settings (no auth required - for Login page etc.)
  publicSettings: publicGlobalSettingsRouter,

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

        // Cascade: inactive categories hide all their products
        const activeCategories = data.categories.filter(c => c.isActive);
        const activeCategoryIds = new Set(activeCategories.map(c => c.id));

        return {
          tenant: tenantPublic,
          settings: data.settings,
          categories: activeCategories,
          products: data.products.filter(p => p.isAvailable && activeCategoryIds.has(p.categoryId)),
          homeRows: data.homeRows,
          reviews: data.reviews,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
