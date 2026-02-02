import { z } from "zod";
import { router, superAdminProcedure } from "../_core/trpc";
import * as db from "../db";

// Schema for theme colors
const themeColorsSchema = z.object({
  primary: z.string(),
  background: z.string(),
  foreground: z.string(),
  accent: z.string(),
  muted: z.string(),
}).optional();

// Schema for creating/updating tenant
const tenantInputSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  googleApiKey: z.string().optional(),
  googlePlaceId: z.string().optional(),
  themeColors: themeColorsSchema,
  fontFamily: z.string().optional(),
  fontDisplay: z.string().optional(),
  borderRadius: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const tenantsRouter = router({
  // List all tenants
  list: superAdminProcedure.query(async () => {
    return db.getAllTenants();
  }),

  // Get single tenant by ID
  getById: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getTenantById(input.id);
    }),

  // Get tenant by slug (for public landing page)
  getBySlug: superAdminProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return db.getTenantBySlug(input.slug);
    }),

  // Create new tenant
  create: superAdminProcedure
    .input(tenantInputSchema)
    .mutation(async ({ input }) => {
      // Check if slug already exists
      const existing = await db.getTenantBySlug(input.slug);
      if (existing) {
        throw new Error("Slug já está em uso");
      }

      const tenantId = await db.createTenant({
        name: input.name,
        slug: input.slug,
        googleApiKey: input.googleApiKey,
        googlePlaceId: input.googlePlaceId,
        themeColors: input.themeColors,
        fontFamily: input.fontFamily,
        fontDisplay: input.fontDisplay,
        borderRadius: input.borderRadius,
        isActive: input.isActive ?? true,
      });

      // Create default store settings
      await db.upsertStoreSettings(tenantId, {
        heroTitle: input.name,
        heroSubtitle: "Experiência única",
      });

      return { id: tenantId };
    }),

  // Update tenant
  update: superAdminProcedure
    .input(z.object({
      id: z.number(),
      data: tenantInputSchema.partial(),
    }))
    .mutation(async ({ input }) => {
      // If updating slug, check if it's already in use
      if (input.data.slug) {
        const existing = await db.getTenantBySlug(input.data.slug);
        if (existing && existing.id !== input.id) {
          throw new Error("Slug já está em uso");
        }
      }

      await db.updateTenant(input.id, input.data);
      return { success: true };
    }),

  // Update API integrations (separate endpoint for security)
  updateIntegrations: superAdminProcedure
    .input(z.object({
      id: z.number(),
      googleApiKey: z.string().optional(),
      googlePlaceId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.updateTenant(input.id, {
        googleApiKey: input.googleApiKey,
        googlePlaceId: input.googlePlaceId,
      });
      return { success: true };
    }),

  // Update design system
  updateDesign: superAdminProcedure
    .input(z.object({
      id: z.number(),
      themeColors: themeColorsSchema,
      fontFamily: z.string().optional(),
      fontDisplay: z.string().optional(),
      borderRadius: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.updateTenant(input.id, {
        themeColors: input.themeColors,
        fontFamily: input.fontFamily,
        fontDisplay: input.fontDisplay,
        borderRadius: input.borderRadius,
      });
      return { success: true };
    }),

  // Delete tenant
  delete: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteTenant(input.id);
      return { success: true };
    }),

  // Get full tenant data (for preview)
  getFullData: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getFullTenantData(input.id);
    }),

  // Assume tenant (Super Admin temporarily becomes that tenant's admin)
  assumeTenant: superAdminProcedure
    .input(z.object({ tenantId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Verify tenant exists
      const tenant = await db.getTenantById(input.tenantId);
      if (!tenant) {
        throw new Error("Loja não encontrada");
      }

      // Update user's tenantId to assume this tenant
      await db.updateUserTenant(ctx.user.id, input.tenantId);

      return { success: true, tenantName: tenant.name };
    }),

  // Release tenant (Super Admin goes back to no tenant)
  releaseTenant: superAdminProcedure
    .mutation(async ({ ctx }) => {
      await db.updateUserTenant(ctx.user.id, null);
      return { success: true };
    }),
});
