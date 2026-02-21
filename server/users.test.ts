import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createSuperAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "super-admin-test",
    email: "admin@casablanca.com",
    name: "Administrador",
    loginMethod: "email",
    role: "super_admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createRegularUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user-test",
    email: "user@test.com",
    name: "Regular User",
    loginMethod: "email",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createClientAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 3,
    openId: "client-admin-test",
    email: "lojista@casablanca.com",
    name: "Lojista Demo",
    loginMethod: "email",
    role: "client_admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("users router", () => {
  describe("users.list", () => {
    it("super admin can list all users", async () => {
      const ctx = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      const users = await caller.users.list();

      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(1);
      if (users.length > 0) {
        const user = users[0];
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("role");
        expect(user).toHaveProperty("tenantName");
      }
    });

    it("users list includes isActive field", async () => {
      const ctx = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      const users = await caller.users.list();

      expect(users.length).toBeGreaterThanOrEqual(1);
      if (users.length > 0) {
        const user = users[0];
        expect(user).toHaveProperty("isActive");
        expect(typeof user.isActive).toBe("boolean");
      }
    });

    it("users list includes enriched fields (tenantName, loginMethod, createdAt)", async () => {
      const ctx = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      const users = await caller.users.list();

      expect(users.length).toBeGreaterThanOrEqual(1);
      if (users.length > 0) {
        const user = users[0];
        // tenantName is enriched from tenants table (can be null)
        expect(user).toHaveProperty("tenantName");
        // loginMethod and createdAt come from schema
        expect(user).toHaveProperty("loginMethod");
        expect(user).toHaveProperty("createdAt");
      }
    });

    it("regular user cannot list users (forbidden)", async () => {
      const ctx = createRegularUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.users.list()).rejects.toThrow();
    });

    it("client admin cannot list users (forbidden)", async () => {
      const ctx = createClientAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.users.list()).rejects.toThrow();
    });
  });

  describe("users.updateRole", () => {
    it("rejects non-super-admin from updating roles", async () => {
      const ctx = createRegularUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.updateRole({
          userId: 1,
          role: "admin",
        })
      ).rejects.toThrow();
    });

    it("rejects client admin from updating roles", async () => {
      const ctx = createClientAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.updateRole({
          userId: 1,
          role: "admin",
        })
      ).rejects.toThrow();
    });
  });

  describe("users.toggleActive", () => {
    it("super admin can toggle user active status", async () => {
      const ctx = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Get a user to toggle
      const users = await caller.users.list();
      expect(users.length).toBeGreaterThanOrEqual(1);

      const targetUser = users[users.length - 1]; // Use last user to avoid self-toggle issues
      const originalStatus = targetUser.isActive;

      // Toggle to opposite
      const result = await caller.users.toggleActive({
        userId: targetUser.id,
        isActive: !originalStatus,
      });
      expect(result).toEqual({ success: true });

      // Verify change
      const updatedUsers = await caller.users.list();
      const updatedUser = updatedUsers.find((u) => u.id === targetUser.id);
      expect(updatedUser?.isActive).toBe(!originalStatus);

      // Restore original status
      await caller.users.toggleActive({
        userId: targetUser.id,
        isActive: originalStatus,
      });
    });

    it("rejects non-super-admin from toggling active status", async () => {
      const ctx = createRegularUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.toggleActive({
          userId: 1,
          isActive: false,
        })
      ).rejects.toThrow();
    });

    it("rejects client admin from toggling active status", async () => {
      const ctx = createClientAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.toggleActive({
          userId: 1,
          isActive: false,
        })
      ).rejects.toThrow();
    });
  });

  describe("users.delete", () => {
    it("rejects non-super-admin from deleting users", async () => {
      const ctx = createRegularUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.delete({ id: 999 })
      ).rejects.toThrow();
    });

    it("rejects client admin from deleting users", async () => {
      const ctx = createClientAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.delete({ id: 999 })
      ).rejects.toThrow();
    });
  });
});
