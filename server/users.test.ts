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
      // Should return at least the test users
      expect(users.length).toBeGreaterThanOrEqual(1);
      // Each user should have expected fields
      if (users.length > 0) {
        const user = users[0];
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("role");
        expect(user).toHaveProperty("tenantName");
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
