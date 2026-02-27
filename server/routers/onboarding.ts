import { publicProcedure, router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { storagePut } from "../storage";

// ============================================
// ONBOARDING BRIEFING ROUTER
// Public procedures for the briefing form
// ============================================

// Super Admin procedure helper
const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "super_admin" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao Super Admin" });
  }
  return next({ ctx });
});

export const onboardingRouter = router({
  // Validate token and return tenant info + status
  validateToken: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ input }) => {
      const tenant = await db.getTenantByOnboardingToken(input.token);
      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link de briefing inválido ou expirado." });
      }

      // Get support WhatsApp from global settings
      let supportWhatsapp = "";
      try {
        const settings = await db.getAllGlobalSettings();
        const whatsappSetting = settings.find(s => s.key === "support_whatsapp");
        supportWhatsapp = whatsappSetting?.value || "";
      } catch {}

      return {
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
        onboardingStatus: tenant.onboardingStatus,
        supportWhatsapp,
      };
    }),

  // Upload image for briefing (public - no auth required)
  uploadImage: publicProcedure
    .input(z.object({
      token: z.string().min(1),
      imageData: z.string(), // base64
      fileName: z.string(),
      contentType: z.string(),
      category: z.enum(["logo", "hero", "owner_photo", "product"]),
    }))
    .mutation(async ({ input }) => {
      // Validate token
      const tenant = await db.getTenantByOnboardingToken(input.token);
      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Token inválido." });
      }
      if (tenant.onboardingStatus === "submitted" || tenant.onboardingStatus === "reviewed") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Briefing já foi enviado." });
      }

      const buffer = Buffer.from(input.imageData, "base64");
      
      // Limit file size to 5MB
      if (buffer.length > 5 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Imagem muito grande. Máximo 5MB." });
      }

      const suffix = Date.now() + "-" + Math.random().toString(36).substring(2, 8);
      const fileKey = `onboarding/${tenant.id}/${input.category}/${suffix}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.contentType);

      return { url };
    }),

  // Submit the complete briefing
  submitBriefing: publicProcedure
    .input(z.object({
      token: z.string().min(1),
      data: z.object({
        // Step 1 - Basic Info
        storeName: z.string().min(1),
        niche: z.string().min(1),
        description: z.string().max(300).optional(),
        ownerStory: z.string().max(500).optional(),
        ownerName: z.string().min(1),
        ownerPhotoUrl: z.string().optional(),
        
        // Step 2 - Contact & Location
        whatsapp: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        address: z.object({
          street: z.string().min(1),
          number: z.string().min(1),
          neighborhood: z.string().min(1),
          city: z.string().min(1),
          state: z.string().min(1),
          cep: z.string().min(1),
        }),
        googleMapsLink: z.string().optional(),
        socialLinks: z.object({
          instagram: z.string().optional(),
          facebook: z.string().optional(),
          tiktok: z.string().optional(),
          youtube: z.string().optional(),
        }).optional(),
        
        // Step 3 - Business Hours
        workByOrder: z.boolean().default(false),
        businessHours: z.record(z.string(), z.object({
          open: z.boolean(),
          shift1Start: z.string().optional(),
          shift1End: z.string().optional(),
          hasSecondShift: z.boolean().optional(),
          shift2Start: z.string().optional(),
          shift2End: z.string().optional(),
        })).optional(),
        
        // Step 4 - Visual Identity
        logoUrl: z.string().optional(),
        heroImageUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        visualStyle: z.enum(["dark_sophisticated", "light_modern", "rustic_cozy", "colorful_vibrant"]).optional(),
        
        // Step 5 - Menu
        categories: z.array(z.object({
          name: z.string().min(1),
        })).min(1),
        products: z.array(z.object({
          name: z.string().min(1),
          categoryName: z.string().min(1),
          description: z.string().optional(),
          price: z.number().positive(),
          originalPrice: z.number().positive().optional(),
          imageUrl: z.string().optional(),
          highlightTag: z.string().optional(),
        })).min(1),
      }),
    }))
    .mutation(async ({ input }) => {
      // Validate token
      const tenant = await db.getTenantByOnboardingToken(input.token);
      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Token inválido." });
      }
      if (tenant.onboardingStatus === "submitted" || tenant.onboardingStatus === "reviewed") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Briefing já foi enviado." });
      }

      // Save the briefing data
      await db.submitOnboardingBriefing(input.token, input.data);

      // Create notification for Super Admin
      // Find all super admin users to notify
      try {
        const allUsers = await db.getAllUsers();
        const superAdmins = allUsers.filter((u: { role: string; tenantId: number | null }) => u.role === "super_admin" || u.role === "admin");
        
        for (const admin of superAdmins) {
          if (admin.tenantId) {
            await db.createNotification({
              tenantId: admin.tenantId,
              title: `Briefing recebido — ${input.data.storeName}`,
              message: `${input.data.storeName} preencheu o formulário de onboarding. Acesse Clientes para revisar os dados e configurar a loja.`,
              type: "info",
            });
          }
        }
        
        // Also create a system-level notification (tenantId = 0 for global)
        await db.createNotification({
          tenantId: 0,
          title: `Briefing recebido — ${input.data.storeName}`,
          message: `${input.data.storeName} preencheu o formulário de onboarding. Acesse Clientes para revisar os dados e configurar a loja.`,
          type: "info",
        });
      } catch (err) {
        console.error("[Onboarding] Failed to create notification:", err);
        // Don't fail the submission if notification fails
      }

      return { success: true };
    }),

  // Super Admin: mark as reviewed
  markReviewed: superAdminProcedure
    .input(z.object({ tenantId: z.number() }))
    .mutation(async ({ input }) => {
      await db.markOnboardingReviewed(input.tenantId);
      return { success: true };
    }),

  // Super Admin: generate token for existing tenant (if missing)
  generateToken: superAdminProcedure
    .input(z.object({ tenantId: z.number() }))
    .mutation(async ({ input }) => {
      const token = await db.generateOnboardingTokenForExistingTenant(input.tenantId);
      return { token };
    }),
});
