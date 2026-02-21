import { z } from "zod";
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
