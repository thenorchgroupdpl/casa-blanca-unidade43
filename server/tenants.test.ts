import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createSuperAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "super-admin-test",
    email: "admin@casablanca.com",
    name: "Super Admin",
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

describe("tenants.listFiltered", () => {
  it("returns filtered tenants for super admin", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tenants.listFiltered({});
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("supports search filter", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tenants.listFiltered({
      search: "restaurante",
    });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    // Should find tenants matching "restaurante"
    if (result.length > 0) {
      const names = result.map((t: any) => t.name.toLowerCase());
      expect(names.some((n: string) => n.includes("restaurante"))).toBe(true);
    }
  });

  it("supports status filter", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tenants.listFiltered({
      clientStatus: ["active"],
    });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("supports multiple filters combined", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tenants.listFiltered({
      clientStatus: ["active"],
      subscriptionPlan: ["professional"],
    });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("rejects non-super-admin users", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.tenants.listFiltered({})).rejects.toThrow();
  });
});

describe("tenants.filterOptions", () => {
  it("returns filter options for super admin", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tenants.filterOptions();
    expect(result).toBeDefined();
    expect(result).toHaveProperty("niches");
    expect(result).toHaveProperty("cities");
    expect(result).toHaveProperty("states");
    expect(Array.isArray(result.niches)).toBe(true);
    expect(Array.isArray(result.cities)).toBe(true);
    expect(Array.isArray(result.states)).toBe(true);
  });
});

describe("tenants.dashboardStats", () => {
  it("returns dashboard stats for super admin", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tenants.dashboardStats();
    expect(result).toBeDefined();
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("active");
    expect(result).toHaveProperty("published");
    expect(result).toHaveProperty("totalUsers");
    expect(typeof result.total).toBe("number");
    expect(typeof result.active).toBe("number");
  });
});

describe("tenants.updateContractual", () => {
  it("updates contractual data for a tenant", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    // First get a tenant to update
    const tenants = await caller.tenants.list();
    if (tenants.length > 0) {
      const tenant = tenants[0];
      const result = await caller.tenants.updateContractual({
        id: tenant.id,
        cnpj: "99.999.999/0001-99",
        razaoSocial: "Empresa Teste Ltda",
        emailDono: "teste@empresa.com",
        telefoneDono: "(11) 99999-9999",
      });
      expect(result).toEqual({ success: true });
    }
  });

  it("rejects non-super-admin users", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.tenants.updateContractual({
        id: 1,
        cnpj: "99.999.999/0001-99",
      })
    ).rejects.toThrow();
  });
});

describe("tenants.getTenantWithSettings", () => {
  it("returns tenant with store settings", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.list();
    if (tenants.length > 0) {
      const result = await caller.tenants.getTenantWithSettings({
        id: tenants[0].id,
      });
      expect(result).toBeDefined();
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("storeSettings");
    }
  });
});

describe("tenants.assumeTenant", () => {
  it("allows super admin to assume a tenant", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.list();
    if (tenants.length > 0) {
      const result = await caller.tenants.assumeTenant({
        tenantId: tenants[0].id,
      });
      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("tenantName");
    }
  });

  it("throws error for non-existent tenant", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.tenants.assumeTenant({ tenantId: 99999 })
    ).rejects.toThrow("Loja não encontrada");
  });

  it("rejects non-super-admin users", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.tenants.assumeTenant({ tenantId: 1 })
    ).rejects.toThrow();
  });
});
