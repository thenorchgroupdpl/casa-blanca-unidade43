import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";

// Super Admin guard
const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "super_admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao Super Admin" });
  }
  return next({ ctx });
});

export const globalSettingsRouter = router({
  // Get all settings (Super Admin only)
  getAll: superAdminProcedure.query(async () => {
    return await db.getAllGlobalSettings();
  }),

  // Get a specific setting by key (Super Admin only)
  get: superAdminProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      return await db.getGlobalSetting(input.key);
    }),

  // Set/update a setting (Super Admin only)
  set: superAdminProcedure
    .input(z.object({
      key: z.string().min(1).max(100),
      value: z.string().max(5000),
      description: z.string().max(500).optional(),
    }))
    .mutation(async ({ input }) => {
      await db.setGlobalSetting(input.key, input.value, input.description);
      return { success: true };
    }),

  // Bulk update multiple settings at once (Super Admin only)
  bulkSet: superAdminProcedure
    .input(z.array(z.object({
      key: z.string().min(1).max(100),
      value: z.string().max(5000),
      description: z.string().max(500).optional(),
    })))
    .mutation(async ({ input }) => {
      for (const setting of input) {
        await db.setGlobalSetting(setting.key, setting.value, setting.description);
      }
      return { success: true };
    }),

  // Delete a setting (Super Admin only)
  delete: superAdminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      await db.deleteGlobalSetting(input.key);
      return { success: true };
    }),
});

// Public router for settings that need to be accessible without auth (e.g., Login page)
export const publicGlobalSettingsRouter = router({
  // Get a specific public setting (no auth required)
  // Only expose whitelisted keys for security
  get: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const ALLOWED_PUBLIC_KEYS = [
        "support_whatsapp",
        "support_email",
        "platform_name",
      ];

      if (!ALLOWED_PUBLIC_KEYS.includes(input.key)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Esta configuração não está disponível publicamente",
        });
      }

      return await db.getGlobalSetting(input.key);
    }),
});
