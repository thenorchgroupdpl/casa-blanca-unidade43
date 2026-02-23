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
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
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
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
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
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

// Generate unique email for each test run to avoid conflicts
const testEmail = `test-create-${Date.now()}@casablanca.com`;

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

    it("users list includes isActive and plainPassword fields", async () => {
      const ctx = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      const users = await caller.users.list();

      expect(users.length).toBeGreaterThanOrEqual(1);
      if (users.length > 0) {
        const user = users[0];
        expect(user).toHaveProperty("isActive");
        expect(typeof user.isActive).toBe("boolean");
        // plainPassword can be null for OAuth users
        expect(user).toHaveProperty("plainPassword");
      }
    });

    it("users list includes enriched fields (tenantName, loginMethod, createdAt)", async () => {
      const ctx = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      const users = await caller.users.list();

      expect(users.length).toBeGreaterThanOrEqual(1);
      if (users.length > 0) {
        const user = users[0];
        expect(user).toHaveProperty("tenantName");
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

  describe("users.create", () => {
    it("super admin can create a new user with password", async () => {
      const ctx = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.users.create({
        name: "Test User Create",
        email: testEmail,
        password: "test1234",
        role: "user",
        tenantId: null,
        isActive: true,
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("userId");
      expect(typeof result.userId).toBe("number");
    });

    it("created user appears in list with plainPassword", async () => {
      const ctx = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      const users = await caller.users.list();
      const createdUser = users.find((u) => u.email === testEmail);

      expect(createdUser).toBeDefined();
      expect(createdUser!.name).toBe("Test User Create");
      expect(createdUser!.plainPassword).toBe("test1234");
      expect(createdUser!.loginMethod).toBe("email");
      expect(createdUser!.isActive).toBe(true);
    });

    it("rejects duplicate email", async () => {
      const ctx = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.create({
          name: "Duplicate User",
          email: testEmail,
          password: "test1234",
          role: "user",
          tenantId: null,
          isActive: true,
        })
      ).rejects.toThrow(/já está cadastrado/);
    });

    it("rejects short password (< 4 chars)", async () => {
      const ctx = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.create({
          name: "Short Pass User",
          email: `short-pass-${Date.now()}@test.com`,
          password: "abc",
          role: "user",
          tenantId: null,
          isActive: true,
        })
      ).rejects.toThrow();
    });

    it("regular user cannot create users (forbidden)", async () => {
      const ctx = createRegularUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.create({
          name: "Forbidden User",
          email: `forbidden-${Date.now()}@test.com`,
          password: "test1234",
          role: "user",
          tenantId: null,
          isActive: true,
        })
      ).rejects.toThrow();
    });

    it("client admin cannot create users (forbidden)", async () => {
      const ctx = createClientAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.create({
          name: "Forbidden User",
          email: `forbidden-ca-${Date.now()}@test.com`,
          password: "test1234",
          role: "user",
          tenantId: null,
          isActive: true,
        })
      ).rejects.toThrow();
    });

    it("can create user as inactive", async () => {
      const ctx = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);
      const inactiveEmail = `inactive-${Date.now()}@test.com`;

      const result = await caller.users.create({
        name: "Inactive User",
        email: inactiveEmail,
        password: "test1234",
        role: "user",
        tenantId: null,
        isActive: false,
      });

      expect(result.success).toBe(true);

      const users = await caller.users.list();
      const inactiveUser = users.find((u) => u.email === inactiveEmail);
      expect(inactiveUser).toBeDefined();
      expect(inactiveUser!.isActive).toBe(false);

      // Cleanup
      await caller.users.delete({ id: inactiveUser!.id });
    });
  });

  describe("users.updatePassword", () => {
    it("super admin can update user password", async () => {
      const ctx = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Find the test user we created
      const users = await caller.users.list();
      const testUser = users.find((u) => u.email === testEmail);
      expect(testUser).toBeDefined();

      const result = await caller.users.updatePassword({
        userId: testUser!.id,
        password: "newpass5678",
      });

      expect(result).toEqual({ success: true });

      // Verify plainPassword was updated
      const updatedUsers = await caller.users.list();
      const updatedUser = updatedUsers.find((u) => u.email === testEmail);
      expect(updatedUser!.plainPassword).toBe("newpass5678");
    });

    it("rejects short password on update", async () => {
      const ctx = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.updatePassword({
          userId: 1,
          password: "ab",
        })
      ).rejects.toThrow();
    });

    it("regular user cannot update passwords (forbidden)", async () => {
      const ctx = createRegularUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.updatePassword({
          userId: 1,
          password: "newpass1234",
        })
      ).rejects.toThrow();
    });
  });

  describe("users.updateRole", () => {
    it("rejects non-super-admin from updating roles", async () => {
      const ctx = createRegularUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.users.updateRole({ userId: 1, role: "admin" })).rejects.toThrow();
    });

    it("rejects client admin from updating roles", async () => {
      const ctx = createClientAdminContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.users.updateRole({ userId: 1, role: "admin" })).rejects.toThrow();
    });
  });

  describe("users.toggleActive", () => {
    it("super admin can toggle user active status", async () => {
      const ctx = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      const users = await caller.users.list();
      expect(users.length).toBeGreaterThanOrEqual(1);

      const targetUser = users[users.length - 1];
      const originalStatus = targetUser.isActive;

      const result = await caller.users.toggleActive({ userId: targetUser.id, isActive: !originalStatus });
      expect(result).toEqual({ success: true });

      const updatedUsers = await caller.users.list();
      const updatedUser = updatedUsers.find((u) => u.id === targetUser.id);
      expect(updatedUser?.isActive).toBe(!originalStatus);

      // Restore
      await caller.users.toggleActive({ userId: targetUser.id, isActive: originalStatus });
    });

    it("rejects non-super-admin from toggling active status", async () => {
      const ctx = createRegularUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.users.toggleActive({ userId: 1, isActive: false })).rejects.toThrow();
    });

    it("rejects client admin from toggling active status", async () => {
      const ctx = createClientAdminContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.users.toggleActive({ userId: 1, isActive: false })).rejects.toThrow();
    });
  });

  describe("users.delete", () => {
    it("super admin can delete the test user (cleanup)", async () => {
      const ctx = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      const users = await caller.users.list();
      const testUser = users.find((u) => u.email === testEmail);
      if (testUser) {
        const result = await caller.users.delete({ id: testUser.id });
        expect(result).toEqual({ success: true });
      }
    });

    it("rejects non-super-admin from deleting users", async () => {
      const ctx = createRegularUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.users.delete({ id: 999 })).rejects.toThrow();
    });

    it("rejects client admin from deleting users", async () => {
      const ctx = createClientAdminContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.users.delete({ id: 999 })).rejects.toThrow();
    });
  });
});

// ─── Fase 53: Testes de validação de email e criação de usuário ───

describe("users.create - email validation", () => {
  function createSuperAdminContext(): TrpcContext {
    const user: NonNullable<TrpcContext["user"]> = {
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
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };
  }

  it("rejects email without @ symbol", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.users.create({
        name: "No At User",
        email: "invalidemail.com",
        password: "test1234",
        role: "user",
        tenantId: null,
        isActive: true,
      })
    ).rejects.toThrow();
  });

  it("rejects email with spaces", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.users.create({
        name: "Space Email User",
        email: "user @test.com",
        password: "test1234",
        role: "user",
        tenantId: null,
        isActive: true,
      })
    ).rejects.toThrow();
  });

  it("rejects empty email", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.users.create({
        name: "Empty Email User",
        email: "",
        password: "test1234",
        role: "user",
        tenantId: null,
        isActive: true,
      })
    ).rejects.toThrow();
  });

  it("rejects empty name", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.users.create({
        name: "",
        email: `empty-name-${Date.now()}@test.com`,
        password: "test1234",
        role: "user",
        tenantId: null,
        isActive: true,
      })
    ).rejects.toThrow();
  });

  it("accepts valid email with tenant binding", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);
    const validEmail = `tenant-bind-${Date.now()}@test.com`;

    const result = await caller.users.create({
      name: "Tenant Bind User",
      email: validEmail,
      password: "test1234",
      role: "client_admin",
      tenantId: 1,
      isActive: true,
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("userId");

    // Verify tenant binding
    const users = await caller.users.list();
    const createdUser = users.find((u) => u.email === validEmail);
    expect(createdUser).toBeDefined();
    expect(createdUser!.tenantId).toBe(1);
    expect(createdUser!.role).toBe("client_admin");

    // Cleanup
    await caller.users.delete({ id: createdUser!.id });
  });

  it("accepts valid email without tenant (admin role)", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);
    const validEmail = `no-tenant-${Date.now()}@test.com`;

    const result = await caller.users.create({
      name: "No Tenant Admin",
      email: validEmail,
      password: "test1234",
      role: "super_admin",
      tenantId: null,
      isActive: true,
    });

    expect(result).toHaveProperty("success", true);

    // Verify no tenant binding
    const users = await caller.users.list();
    const createdUser = users.find((u) => u.email === validEmail);
    expect(createdUser).toBeDefined();
    expect(createdUser!.tenantId).toBeNull();

    // Cleanup
    await caller.users.delete({ id: createdUser!.id });
  });
});
