import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { router, superAdminProcedure } from "../_core/trpc";
import * as db from "../db";

export const usersRouter = router({
  // List all users (with enriched tenant names)
  list: superAdminProcedure.query(async () => {
    const usersList = await db.getAllUsers();
    const tenantsList = await db.getAllTenants();
    
    // Enrich users with tenant name
    return usersList.map(user => ({
      ...user,
      tenantName: user.tenantId 
        ? tenantsList.find(t => t.id === user.tenantId)?.name || null
        : null,
    }));
  }),

  // Create a new user (Super Admin only)
  create: superAdminProcedure
    .input(z.object({
      name: z.string().min(1, "Nome é obrigatório"),
      email: z.string().email("E-mail inválido"),
      password: z.string().min(4, "Senha deve ter no mínimo 4 caracteres"),
      role: z.enum(["user", "admin", "super_admin", "client_admin"]),
      tenantId: z.number().nullable().optional(),
      isActive: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input }) => {
      // Check for duplicate email
      const existingUser = await db.getUserByEmail(input.email);
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Este e-mail já está cadastrado no sistema.",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Create user with plain password stored for admin retrieval
      const userId = await db.createUserWithPassword({
        email: input.email,
        passwordHash,
        plainPassword: input.password,
        name: input.name,
        role: input.role,
        tenantId: input.tenantId ?? null,
        isActive: input.isActive,
      });

      return { success: true, userId };
    }),

  // Update user role
  updateRole: superAdminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin", "super_admin", "client_admin"]),
      tenantId: z.number().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.updateUserRole(input.userId, input.role, input.tenantId ?? undefined);
      return { success: true };
    }),

  // Update user password (Super Admin can reset passwords)
  updatePassword: superAdminProcedure
    .input(z.object({
      userId: z.number(),
      password: z.string().min(4, "Senha deve ter no mínimo 4 caracteres"),
    }))
    .mutation(async ({ input }) => {
      const passwordHash = await bcrypt.hash(input.password, 10);
      await db.updateUserPassword(input.userId, passwordHash);
      // Also update plainPassword for admin retrieval
      await db.updateUserPlainPassword(input.userId, input.password);
      return { success: true };
    }),

  // Toggle user active status
  toggleActive: superAdminProcedure
    .input(z.object({
      userId: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      await db.toggleUserActive(input.userId, input.isActive);
      return { success: true };
    }),

  // Delete user
  delete: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteUser(input.id);
      return { success: true };
    }),
});
