import { z } from "zod";
import { router, superAdminProcedure } from "../_core/trpc";
import * as db from "../db";
import { storagePut } from "../storage";

// Schema for theme colors
const themeColorsSchema = z.object({
  primary: z.string(),
  background: z.string(),
  foreground: z.string(),
  accent: z.string(),
  muted: z.string(),
  buttonPrimary: z.string().optional(),
  highlight: z.string().optional(),
  success: z.string().optional(),
}).optional();

// Schema for creating/updating tenant
const tenantInputSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  cnpj: z.string().optional(),
  razaoSocial: z.string().optional(),
  emailDono: z.string().optional(),
  telefoneDono: z.string().optional(),
  domainCustom: z.string().optional(),
  subscriptionPlan: z.enum(["starter", "professional", "enterprise"]).optional(),
  clientStatus: z.enum(["active", "disabled", "implementing"]).optional(),
  landingStatus: z.enum(["published", "draft", "error"]).optional(),
  niche: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  googleApiKey: z.string().optional(),
  googlePlaceId: z.string().optional(),
  themeColors: themeColorsSchema,
  fontFamily: z.string().optional(),
  fontDisplay: z.string().optional(),
  borderRadius: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Schema for advanced filters
const filtersSchema = z.object({
  search: z.string().optional(),
  clientStatus: z.array(z.string()).optional(),
  landingStatus: z.array(z.string()).optional(),
  subscriptionPlan: z.array(z.string()).optional(),
  niche: z.array(z.string()).optional(),
  city: z.array(z.string()).optional(),
  state: z.array(z.string()).optional(),
});

export const tenantsRouter = router({
  // List all tenants
  list: superAdminProcedure.query(async () => {
    return db.getAllTenants();
  }),

  // List tenants with advanced filters
  listFiltered: superAdminProcedure
    .input(filtersSchema)
    .query(async ({ input }) => {
      return db.getTenantsFiltered(input);
    }),

  // Get filter options (distinct niches, cities, states)
  filterOptions: superAdminProcedure.query(async () => {
    return db.getTenantFilterOptions();
  }),

  // Get dashboard stats
  dashboardStats: superAdminProcedure.query(async () => {
    return db.getDashboardStats();
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
      metaPixelId: z.string().optional(),
      ga4MeasurementId: z.string().optional(),
      gtmContainerId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.updateTenant(input.id, {
        googleApiKey: input.googleApiKey,
        googlePlaceId: input.googlePlaceId,
        metaPixelId: input.metaPixelId || null,
        ga4MeasurementId: input.ga4MeasurementId || null,
        gtmContainerId: input.gtmContainerId || null,
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

  // Update contractual data (razaoSocial, emailDono, telefoneDono, cnpj, domainCustom)
  updateContractual: superAdminProcedure
    .input(z.object({
      id: z.number(),
      cnpj: z.string().optional(),
      razaoSocial: z.string().optional(),
      emailDono: z.string().optional(),
      telefoneDono: z.string().optional(),
      domainCustom: z.string().optional(),
      slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
      niche: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      clientStatus: z.enum(["active", "disabled", "implementing"]).optional(),
      subscriptionPlan: z.enum(["starter", "professional", "enterprise"]).optional(),
      landingStatus: z.enum(["published", "draft", "error"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      // If updating slug, check uniqueness
      if (data.slug) {
        const existing = await db.getTenantBySlug(data.slug);
        if (existing && existing.id !== id) {
          throw new Error("Slug j\u00e1 est\u00e1 em uso");
        }
      }
      await db.updateTenant(id, data);
      return { success: true };
    }),

  // Upload image for landing page design
  uploadDesignImage: superAdminProcedure
    .input(z.object({
      tenantId: z.number(),
      imageData: z.string(), // base64 encoded
      fileName: z.string(),
      contentType: z.string(),
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.imageData, 'base64');
      const suffix = Math.random().toString(36).substring(2, 10);
      const ext = input.fileName.split('.').pop() || 'png';
      const key = `tenants/${input.tenantId}/design/${Date.now()}-${suffix}.${ext}`;
      const { url } = await storagePut(key, buffer, input.contentType);
      return { url };
    }),

  // Get landing design for a tenant
  getLandingDesign: superAdminProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      const tenant = await db.getTenantById(input.tenantId);
      if (!tenant) throw new Error("Loja não encontrada");
      const settings = await db.getStoreSettings(input.tenantId);
      const cats = await db.getCategoriesByTenant(input.tenantId);
      return {
        tenant,
        settings,
        categories: cats,
        landingDesign: settings?.landingDesign ?? null,
      };
    }),

  // Update landing design for a tenant
  updateLandingDesign: superAdminProcedure
    .input(z.object({
      tenantId: z.number(),
      landingDesign: z.any(),
      themeColors: themeColorsSchema,
      fontFamily: z.string().optional(),
      fontDisplay: z.string().optional(),
      borderRadius: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Update design on tenant table
      await db.updateTenant(input.tenantId, {
        themeColors: input.themeColors,
        fontFamily: input.fontFamily,
        fontDisplay: input.fontDisplay,
        borderRadius: input.borderRadius,
      });
      // Update landing design on store settings
      await db.upsertStoreSettings(input.tenantId, {
        landingDesign: input.landingDesign,
      });
      return { success: true };
    }),

  // Get tenant with store settings for management panel
  getTenantWithSettings: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const tenant = await db.getTenantById(input.id);
      if (!tenant) throw new Error("Tenant n\u00e3o encontrado");
      const settings = await db.getStoreSettings(input.id);
      return { ...tenant, storeSettings: settings ?? null };
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
