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

describe("tenants.updateIntegrations", () => {
  it("updates Google Places fields for super admin", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    // First get a tenant to update
    const tenants = await caller.tenants.list();
    if (tenants.length === 0) return; // skip if no tenants

    const tenantId = tenants[0].id;
    const result = await caller.tenants.updateIntegrations({
      id: tenantId,
      googleApiKey: "AIzaTestKey123",
      googlePlaceId: "ChIJTestPlaceId",
    });
    expect(result).toEqual({ success: true });
  });

  it("updates marketing tracking fields for super admin", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.list();
    if (tenants.length === 0) return;

    const tenantId = tenants[0].id;
    const result = await caller.tenants.updateIntegrations({
      id: tenantId,
      metaPixelId: "1234567890",
      ga4MeasurementId: "G-XXXXXXXXXX",
      gtmContainerId: "GTM-XXXXXXX",
    });
    expect(result).toEqual({ success: true });

    // Verify the data was saved
    const updatedTenants = await caller.tenants.list();
    const updated = updatedTenants.find((t: any) => t.id === tenantId);
    expect(updated?.metaPixelId).toBe("1234567890");
    expect(updated?.ga4MeasurementId).toBe("G-XXXXXXXXXX");
    expect(updated?.gtmContainerId).toBe("GTM-XXXXXXX");
  });

  it("clears tracking fields when empty strings are passed", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.list();
    if (tenants.length === 0) return;

    const tenantId = tenants[0].id;
    
    // First set values
    await caller.tenants.updateIntegrations({
      id: tenantId,
      metaPixelId: "9999999999",
    });

    // Then clear them
    const result = await caller.tenants.updateIntegrations({
      id: tenantId,
      metaPixelId: "",
    });
    expect(result).toEqual({ success: true });

    // Verify cleared
    const updatedTenants = await caller.tenants.list();
    const updated = updatedTenants.find((t: any) => t.id === tenantId);
    expect(updated?.metaPixelId).toBeNull();
  });

  it("allows partial updates (only some fields)", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.list();
    if (tenants.length === 0) return;

    const tenantId = tenants[0].id;
    
    // Update only Meta Pixel
    const result = await caller.tenants.updateIntegrations({
      id: tenantId,
      metaPixelId: "111222333",
    });
    expect(result).toEqual({ success: true });
  });

  it("rejects non-super-admin users", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.tenants.updateIntegrations({
        id: 1,
        metaPixelId: "1234567890",
      })
    ).rejects.toThrow();
  });
});

describe("tenants.update (name and slug)", () => {
  it("updates tenant name via update procedure", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.list();
    if (tenants.length === 0) return;

    const tenant = tenants[0];
    const result = await caller.tenants.update({
      id: tenant.id,
      data: { name: "Loja Atualizada Teste" },
    });
    expect(result).toEqual({ success: true });

    // Verify the name was updated
    const updated = await caller.tenants.list();
    const found = updated.find((t: any) => t.id === tenant.id);
    expect(found?.name).toBe("Loja Atualizada Teste");

    // Restore original name
    await caller.tenants.update({
      id: tenant.id,
      data: { name: tenant.name },
    });
  });

  it("updates slug and validates uniqueness", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.list();
    if (tenants.length < 2) return;

    const tenant1 = tenants[0];
    const tenant2 = tenants[1];

    // Try to set tenant2's slug to tenant1's slug - should fail
    await expect(
      caller.tenants.update({
        id: tenant2.id,
        data: { slug: tenant1.slug },
      })
    ).rejects.toThrow("Slug já está em uso");
  });

  it("allows updating slug to a new unique value", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.list();
    if (tenants.length === 0) return;

    const tenant = tenants[0];
    const originalSlug = tenant.slug;
    const testSlug = `test-slug-${Date.now()}`;

    const result = await caller.tenants.update({
      id: tenant.id,
      data: { slug: testSlug },
    });
    expect(result).toEqual({ success: true });

    // Restore original slug
    await caller.tenants.update({
      id: tenant.id,
      data: { slug: originalSlug },
    });
  });
});

describe("tenants.updateContractual (clientStatus)", () => {
  it("updates clientStatus to active", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.list();
    if (tenants.length === 0) return;

    const tenant = tenants[0];
    const result = await caller.tenants.updateContractual({
      id: tenant.id,
      clientStatus: "active",
    });
    expect(result).toEqual({ success: true });

    const updated = await caller.tenants.list();
    const found = updated.find((t: any) => t.id === tenant.id);
    expect(found?.clientStatus).toBe("active");
  });

  it("updates clientStatus to disabled", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.list();
    if (tenants.length === 0) return;

    const tenant = tenants[0];
    const originalStatus = tenant.clientStatus;

    const result = await caller.tenants.updateContractual({
      id: tenant.id,
      clientStatus: "disabled",
    });
    expect(result).toEqual({ success: true });

    // Restore original status
    await caller.tenants.updateContractual({
      id: tenant.id,
      clientStatus: originalStatus as "active" | "disabled" | "implementing",
    });
  });

  it("updates clientStatus to implementing (maintenance)", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.list();
    if (tenants.length === 0) return;

    const tenant = tenants[0];
    const originalStatus = tenant.clientStatus;

    const result = await caller.tenants.updateContractual({
      id: tenant.id,
      clientStatus: "implementing",
    });
    expect(result).toEqual({ success: true });

    // Restore original status
    await caller.tenants.updateContractual({
      id: tenant.id,
      clientStatus: originalStatus as "active" | "disabled" | "implementing",
    });
  });

  it("validates slug uniqueness via updateContractual", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.list();
    if (tenants.length < 2) return;

    const tenant1 = tenants[0];
    const tenant2 = tenants[1];

    // Try to set tenant2's slug to tenant1's slug
    await expect(
      caller.tenants.updateContractual({
        id: tenant2.id,
        slug: tenant1.slug,
      })
    ).rejects.toThrow();
  });
});
