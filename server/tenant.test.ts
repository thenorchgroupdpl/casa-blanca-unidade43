import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user types
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Helper to create mock context for super admin
function createSuperAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "super-admin-123",
    email: "admin@casablanca.com",
    name: "Super Admin",
    loginMethod: "google",
    role: "super_admin",
    tenantId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

// Helper to create mock context for client admin
function createClientAdminContext(tenantId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "client-admin-456",
    email: "lojista@restaurante.com",
    name: "Lojista",
    loginMethod: "google",
    role: "client_admin",
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

// Helper to create mock context for regular user
function createUserContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 3,
    openId: "user-789",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "google",
    role: "user",
    tenantId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("Tenant Router - Access Control", () => {
  it("super admin can access tenant list", async () => {
    const { ctx } = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    // This should not throw - super admin has access
    const result = await caller.tenants.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("client admin cannot access tenant list", async () => {
    const { ctx } = createClientAdminContext(1);
    const caller = appRouter.createCaller(ctx);
    
    // This should throw - client admin doesn't have super admin access
    await expect(caller.tenants.list()).rejects.toThrow();
  });

  it("regular user cannot access tenant list", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    // This should throw - regular user doesn't have super admin access
    await expect(caller.tenants.list()).rejects.toThrow();
  });
});

describe("Catalog Router - Access Control", () => {
  it("client admin with tenant can access categories", async () => {
    const { ctx } = createClientAdminContext(1);
    const caller = appRouter.createCaller(ctx);
    
    // This should not throw - client admin with tenant has access
    const result = await caller.categories.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("super admin with assumed tenant can access categories", async () => {
    // Super admin who has "assumed" a tenant (tenantId set)
    const user: AuthenticatedUser = {
      id: 1,
      openId: "super-admin-123",
      email: "admin@casablanca.com",
      name: "Super Admin",
      loginMethod: "google",
      role: "super_admin",
      tenantId: 1, // Assumed tenant
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx: TrpcContext = {
      user,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    
    // This should not throw - super admin with assumed tenant has access
    const result = await caller.categories.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Public Router - Tenant by Slug", () => {
  it("public route returns tenant not found for invalid slug", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    
    // This should throw - tenant not found
    await expect(
      caller.public.getTenantBySlug({ slug: "non-existent-tenant-xyz" })
    ).rejects.toThrow("Loja não encontrada");
  });
});

describe("Auth Router", () => {
  it("returns user info for authenticated user", async () => {
    const { ctx } = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("admin@casablanca.com");
    expect(result?.role).toBe("super_admin");
  });

  it("returns null for unauthenticated user", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});
