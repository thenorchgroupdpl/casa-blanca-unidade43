import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// ============================================
// HELPERS
// ============================================

function createClientAdminContext(tenantId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "client-admin-mod",
    email: "lojista@test.com",
    name: "Lojista Módulos",
    loginMethod: "google",
    role: "client_admin",
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

function createOtherClientContext(tenantId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 5,
    openId: "other-client-mod",
    email: "other@test.com",
    name: "Outro Lojista",
    loginMethod: "google",
    role: "client_admin",
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
  return { ctx };
}

function createNoTenantContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 99,
    openId: "no-tenant-mod",
    email: "notenant@test.com",
    name: "Sem Tenant",
    loginMethod: "google",
    role: "client_admin",
    tenantId: null as unknown as number,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

const caller = appRouter.createCaller;

// ============================================
// ORDERS ROUTER TESTS
// ============================================

describe("Orders Router", () => {
  describe("orders.list", () => {
    it("should return orders for authenticated client admin", async () => {
      const { ctx } = createClientAdminContext(1);
      const result = await caller(ctx).orders.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should reject unauthenticated access", async () => {
      const { ctx } = createPublicContext();
      await expect(caller(ctx).orders.list()).rejects.toThrow();
    });

    it("should reject client admin without tenant", async () => {
      const { ctx } = createNoTenantContext();
      await expect(caller(ctx).orders.list()).rejects.toThrow();
    });
  });

  describe("orders.updateStatus", () => {
    it("should reject status update for non-existent order", async () => {
      const { ctx } = createClientAdminContext(1);
      await expect(
        caller(ctx).orders.updateStatus({ id: 999999, status: "em_preparacao" })
      ).rejects.toThrow();
    });

    it("should reject unauthenticated status update", async () => {
      const { ctx } = createPublicContext();
      await expect(
        caller(ctx).orders.updateStatus({ id: 1, status: "em_preparacao" })
      ).rejects.toThrow();
    });
  });

  describe("orders.create (public)", () => {
    it("should create an order from public checkout", async () => {
      const { ctx } = createPublicContext();
      const result = await caller(ctx).orders.create({
        tenantId: 1,
        customerName: "Cliente Teste",
        customerPhone: "11999999999",
        summary: "2x Hambúrguer, 1x Refrigerante",
        totalValue: "45.90",
        items: [
          { productId: 1, name: "Hambúrguer", quantity: 2, price: 18.95 },
          { productId: 2, name: "Refrigerante", quantity: 1, price: 7.00 },
        ],
      });
      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("number");
    });

    it("should create order with delivery zone info", async () => {
      const { ctx } = createPublicContext();
      const result = await caller(ctx).orders.create({
        tenantId: 1,
        customerName: "Cliente Delivery",
        summary: "1x Pizza",
        totalValue: "55.00",
        deliveryZoneName: "Centro",
        deliveryFee: "5.00",
      });
      expect(result).toHaveProperty("id");
    });

    it("should reject order without customer name", async () => {
      const { ctx } = createPublicContext();
      await expect(
        caller(ctx).orders.create({
          tenantId: 1,
          customerName: "",
          summary: "Teste",
          totalValue: "10.00",
        })
      ).rejects.toThrow();
    });

    it("should reject order without summary", async () => {
      const { ctx } = createPublicContext();
      await expect(
        caller(ctx).orders.create({
          tenantId: 1,
          customerName: "Teste",
          summary: "",
          totalValue: "10.00",
        })
      ).rejects.toThrow();
    });
  });

  describe("orders.getById", () => {
    it("should reject access to non-existent order", async () => {
      const { ctx } = createClientAdminContext(1);
      await expect(caller(ctx).orders.getById({ id: 999999 })).rejects.toThrow();
    });
  });
});

// ============================================
// DELIVERY ZONES ROUTER TESTS
// ============================================

describe("Delivery Zones Router", () => {
  let createdZoneId: number | null = null;

  describe("deliveryZones.list", () => {
    it("should return delivery zones for authenticated client admin", async () => {
      const { ctx } = createClientAdminContext(1);
      const result = await caller(ctx).deliveryZones.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should reject unauthenticated access to admin list", async () => {
      const { ctx } = createPublicContext();
      await expect(caller(ctx).deliveryZones.list()).rejects.toThrow();
    });
  });

  describe("deliveryZones.listPublic", () => {
    it("should return delivery zones for any tenant (public)", async () => {
      const { ctx } = createPublicContext();
      const result = await caller(ctx).deliveryZones.listPublic({ tenantId: 1 });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("deliveryZones.create", () => {
    it("should create a delivery zone", async () => {
      const { ctx } = createClientAdminContext(1);
      const result = await caller(ctx).deliveryZones.create({
        zoneName: "Zona Teste Módulos",
        feeAmount: "8.50",
      });
      expect(result).toHaveProperty("id");
      createdZoneId = result.id;
    });

    it("should create a pickup zone with zero fee", async () => {
      const { ctx } = createClientAdminContext(1);
      const result = await caller(ctx).deliveryZones.create({
        zoneName: "Retirada Teste",
        feeAmount: "0.00",
        isPickup: true,
      });
      expect(result).toHaveProperty("id");
      // Clean up
      await caller(ctx).deliveryZones.delete({ id: result.id });
    });

    it("should reject negative fee", async () => {
      const { ctx } = createClientAdminContext(1);
      await expect(
        caller(ctx).deliveryZones.create({
          zoneName: "Zona Inválida",
          feeAmount: "-5.00",
        })
      ).rejects.toThrow();
    });

    it("should reject empty zone name", async () => {
      const { ctx } = createClientAdminContext(1);
      await expect(
        caller(ctx).deliveryZones.create({
          zoneName: "",
          feeAmount: "5.00",
        })
      ).rejects.toThrow();
    });

    it("should reject unauthenticated zone creation", async () => {
      const { ctx } = createPublicContext();
      await expect(
        caller(ctx).deliveryZones.create({
          zoneName: "Zona Hack",
          feeAmount: "5.00",
        })
      ).rejects.toThrow();
    });
  });

  describe("deliveryZones.update", () => {
    it("should update a delivery zone", async () => {
      if (!createdZoneId) return;
      const { ctx } = createClientAdminContext(1);
      const result = await caller(ctx).deliveryZones.update({
        id: createdZoneId,
        data: { zoneName: "Zona Atualizada", feeAmount: "12.00" },
      });
      expect(result.success).toBe(true);
    });

    it("should reject update of non-existent zone", async () => {
      const { ctx } = createClientAdminContext(1);
      await expect(
        caller(ctx).deliveryZones.update({
          id: 999999,
          data: { zoneName: "Inexistente" },
        })
      ).rejects.toThrow();
    });

    it("should reject cross-tenant zone update", async () => {
      if (!createdZoneId) return;
      const { ctx } = createOtherClientContext(999);
      await expect(
        caller(ctx).deliveryZones.update({
          id: createdZoneId,
          data: { zoneName: "Hack" },
        })
      ).rejects.toThrow();
    });
  });

  describe("deliveryZones.delete", () => {
    it("should reject deletion of non-existent zone", async () => {
      const { ctx } = createClientAdminContext(1);
      await expect(
        caller(ctx).deliveryZones.delete({ id: 999999 })
      ).rejects.toThrow();
    });

    it("should reject cross-tenant zone deletion", async () => {
      if (!createdZoneId) return;
      const { ctx } = createOtherClientContext(999);
      await expect(
        caller(ctx).deliveryZones.delete({ id: createdZoneId })
      ).rejects.toThrow();
    });

    it("should delete a delivery zone", async () => {
      if (!createdZoneId) return;
      const { ctx } = createClientAdminContext(1);
      const result = await caller(ctx).deliveryZones.delete({ id: createdZoneId });
      expect(result.success).toBe(true);
    });
  });
});

// ============================================
// UPSELLS ROUTER TESTS
// ============================================

describe("Upsells Router", () => {
  describe("upsells.getIds", () => {
    it("should return upsell IDs for a product (admin)", async () => {
      const { ctx } = createClientAdminContext(1);
      const result = await caller(ctx).upsells.getIds({ productId: 1 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should reject unauthenticated access", async () => {
      const { ctx } = createPublicContext();
      await expect(
        caller(ctx).upsells.getIds({ productId: 1 })
      ).rejects.toThrow();
    });
  });

  describe("upsells.getProducts", () => {
    it("should return upsell products for any product (public)", async () => {
      const { ctx } = createPublicContext();
      const result = await caller(ctx).upsells.getProducts({ productId: 1 });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("upsells.set", () => {
    it("should reject setting upsells for non-existent product", async () => {
      const { ctx } = createClientAdminContext(1);
      await expect(
        caller(ctx).upsells.set({ productId: 999999, upsellProductIds: [1, 2] })
      ).rejects.toThrow();
    });

    it("should reject unauthenticated upsell setting", async () => {
      const { ctx } = createPublicContext();
      await expect(
        caller(ctx).upsells.set({ productId: 1, upsellProductIds: [2] })
      ).rejects.toThrow();
    });
  });
});

// ============================================
// BILLING POPUP ROUTER TESTS
// ============================================

describe("Billing Popup Router", () => {
  describe("billingPopup.getPopup", () => {
    it("should return popup data for authenticated client admin", async () => {
      const { ctx } = createClientAdminContext(1);
      const result = await caller(ctx).billingPopup.getPopup();
      // Should return popup state (could be null if no billing issue)
      expect(result === null || typeof result === "object").toBe(true);
    });

    it("should reject unauthenticated access", async () => {
      const { ctx } = createPublicContext();
      await expect(caller(ctx).billingPopup.getPopup()).rejects.toThrow();
    });
  });
});
