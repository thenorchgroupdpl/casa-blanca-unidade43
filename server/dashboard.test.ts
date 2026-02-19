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
    id: 99,
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

describe("tenants.dashboardStats", () => {
  it("returns dashboard stats for super admin", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.tenants.dashboardStats();

    expect(stats).toBeDefined();
    expect(typeof stats.total).toBe("number");
    expect(typeof stats.active).toBe("number");
    expect(typeof stats.implementing).toBe("number");
    expect(typeof stats.disabled).toBe("number");
    expect(typeof stats.published).toBe("number");
    expect(typeof stats.draft).toBe("number");
    expect(typeof stats.totalUsers).toBe("number");
    expect(stats.byPlan).toBeDefined();
    expect(typeof stats.byPlan.starter).toBe("number");
    expect(typeof stats.byPlan.professional).toBe("number");
    expect(typeof stats.byPlan.enterprise).toBe("number");
  });

  it("rejects non-super-admin users", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.tenants.dashboardStats()).rejects.toThrow();
  });
});

describe("tenants.filterOptions", () => {
  it("returns filter options for super admin", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const options = await caller.tenants.filterOptions();

    expect(options).toBeDefined();
    expect(Array.isArray(options.niches)).toBe(true);
    expect(Array.isArray(options.cities)).toBe(true);
    expect(Array.isArray(options.states)).toBe(true);
  });

  it("returns populated filter values from existing data", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const options = await caller.tenants.filterOptions();

    // We have test data with niches, cities and states
    expect(options.niches.length).toBeGreaterThanOrEqual(1);
    expect(options.cities.length).toBeGreaterThanOrEqual(1);
    expect(options.states.length).toBeGreaterThanOrEqual(1);
  });
});

describe("tenants.listFiltered", () => {
  it("returns all tenants with no filters", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.listFiltered({});

    expect(Array.isArray(tenants)).toBe(true);
    expect(tenants.length).toBeGreaterThanOrEqual(1);
  });

  it("filters by clientStatus", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const activeTenants = await caller.tenants.listFiltered({
      clientStatus: ["active"],
    });

    expect(Array.isArray(activeTenants)).toBe(true);
    activeTenants.forEach((t) => {
      expect(t.clientStatus).toBe("active");
    });
  });

  it("filters by subscriptionPlan", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const proTenants = await caller.tenants.listFiltered({
      subscriptionPlan: ["professional"],
    });

    expect(Array.isArray(proTenants)).toBe(true);
    proTenants.forEach((t) => {
      expect(t.subscriptionPlan).toBe("professional");
    });
  });

  it("filters by landingStatus", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const publishedTenants = await caller.tenants.listFiltered({
      landingStatus: ["published"],
    });

    expect(Array.isArray(publishedTenants)).toBe(true);
    publishedTenants.forEach((t) => {
      expect(t.landingStatus).toBe("published");
    });
  });

  it("filters by search term", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.tenants.listFiltered({
      search: "restaurante",
    });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((t) => t.name.toLowerCase().includes("restaurante") || t.slug.includes("restaurante"))).toBe(true);
  });

  it("filters by state", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const mgTenants = await caller.tenants.listFiltered({
      state: ["MG"],
    });

    expect(Array.isArray(mgTenants)).toBe(true);
    mgTenants.forEach((t) => {
      expect(t.state).toBe("MG");
    });
  });

  it("combines multiple filters", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.tenants.listFiltered({
      clientStatus: ["active"],
      subscriptionPlan: ["professional"],
      state: ["MG"],
    });

    expect(Array.isArray(results)).toBe(true);
    results.forEach((t) => {
      expect(t.clientStatus).toBe("active");
      expect(t.subscriptionPlan).toBe("professional");
      expect(t.state).toBe("MG");
    });
  });

  it("returns empty array for impossible filter combination", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.tenants.listFiltered({
      search: "nonexistent-tenant-xyz-12345",
    });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it("rejects non-super-admin users", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.tenants.listFiltered({})).rejects.toThrow();
  });
});

describe("tenants.list (original)", () => {
  it("returns all tenants including new fields", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.list();

    expect(Array.isArray(tenants)).toBe(true);
    expect(tenants.length).toBeGreaterThanOrEqual(1);

    // Verify new fields exist on at least one tenant
    const tenantWithData = tenants.find((t) => t.cnpj);
    expect(tenantWithData).toBeDefined();
    if (tenantWithData) {
      expect(tenantWithData.cnpj).toBeDefined();
      expect(["starter", "professional", "enterprise"]).toContain(tenantWithData.subscriptionPlan);
      expect(["active", "disabled", "implementing"]).toContain(tenantWithData.clientStatus);
      expect(["published", "draft", "error"]).toContain(tenantWithData.landingStatus);
    }
  });
});
