import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import {
  notifyTenant,
  getConnectionCount,
  getTotalConnectionCount,
  _connections,
  type OrderEvent,
} from "./sse";
import type { Response } from "express";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// ============================================
// HELPERS
// ============================================

function createClientAdminContext(tenantId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "client-admin-sse",
    email: "lojista@restaurante.com",
    name: "Lojista Teste",
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

function createRegularUserContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 4,
    openId: "regular-user-sse",
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
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

function createUnauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createMockResponse(): Response {
  const written: string[] = [];
  return {
    write: vi.fn((data: string) => {
      written.push(data);
      return true;
    }),
    _written: written,
  } as unknown as Response & { _written: string[] };
}

function createSampleOrderEvent(overrides?: Partial<OrderEvent>): OrderEvent {
  return {
    orderId: 123,
    customerName: "João Silva",
    total: 89.9,
    itemCount: 3,
    createdAt: new Date().toISOString(),
    zone: "Centro",
    ...overrides,
  };
}

// ============================================
// SSE CONNECTION MANAGER TESTS
// ============================================

describe("SSE Connection Manager", () => {
  beforeEach(() => {
    // Clear all connections before each test
    _connections.clear();
  });

  afterEach(() => {
    _connections.clear();
  });

  describe("notifyTenant", () => {
    it("returns 0 when no connections exist for tenant", () => {
      const event = createSampleOrderEvent();
      const result = notifyTenant(999, event);
      expect(result).toBe(0);
    });

    it("sends event to single connection", () => {
      const tenantId = 1;
      const mockRes = createMockResponse();
      _connections.set(tenantId, new Set([mockRes]));

      const event = createSampleOrderEvent();
      const result = notifyTenant(tenantId, event);

      expect(result).toBe(1);
      expect(mockRes.write).toHaveBeenCalledTimes(1);

      const writtenData = (mockRes as any)._written[0];
      expect(writtenData).toContain("event: new_order");
      expect(writtenData).toContain('"orderId":123');
      expect(writtenData).toContain('"customerName":"João Silva"');
      expect(writtenData).toContain('"total":89.9');
    });

    it("sends event to multiple connections for same tenant", () => {
      const tenantId = 1;
      const mockRes1 = createMockResponse();
      const mockRes2 = createMockResponse();
      const mockRes3 = createMockResponse();
      _connections.set(tenantId, new Set([mockRes1, mockRes2, mockRes3]));

      const event = createSampleOrderEvent();
      const result = notifyTenant(tenantId, event);

      expect(result).toBe(3);
      expect(mockRes1.write).toHaveBeenCalledTimes(1);
      expect(mockRes2.write).toHaveBeenCalledTimes(1);
      expect(mockRes3.write).toHaveBeenCalledTimes(1);
    });

    it("does not send to other tenants", () => {
      const mockRes1 = createMockResponse();
      const mockRes2 = createMockResponse();
      _connections.set(1, new Set([mockRes1]));
      _connections.set(2, new Set([mockRes2]));

      const event = createSampleOrderEvent();
      notifyTenant(1, event);

      expect(mockRes1.write).toHaveBeenCalledTimes(1);
      expect(mockRes2.write).not.toHaveBeenCalled();
    });

    it("removes broken connections that throw on write", () => {
      const tenantId = 1;
      const goodRes = createMockResponse();
      const brokenRes = {
        write: vi.fn(() => {
          throw new Error("Connection closed");
        }),
      } as unknown as Response;

      _connections.set(tenantId, new Set([goodRes, brokenRes]));

      const event = createSampleOrderEvent();
      const result = notifyTenant(tenantId, event);

      // Only the good connection was notified
      expect(result).toBe(1);
      expect(goodRes.write).toHaveBeenCalledTimes(1);

      // Broken connection was removed
      expect(getConnectionCount(tenantId)).toBe(1);
    });

    it("cleans up tenant entry when all connections are broken", () => {
      const tenantId = 1;
      const brokenRes = {
        write: vi.fn(() => {
          throw new Error("Connection closed");
        }),
      } as unknown as Response;

      _connections.set(tenantId, new Set([brokenRes]));

      const event = createSampleOrderEvent();
      const result = notifyTenant(tenantId, event);

      expect(result).toBe(0);
      expect(_connections.has(tenantId)).toBe(false);
    });

    it("formats SSE event correctly", () => {
      const tenantId = 1;
      const mockRes = createMockResponse();
      _connections.set(tenantId, new Set([mockRes]));

      const event = createSampleOrderEvent({
        orderId: 456,
        customerName: "Maria",
        total: 150.0,
        itemCount: 5,
        zone: "Bairro Novo",
      });
      notifyTenant(tenantId, event);

      const writtenData = (mockRes as any)._written[0];
      // SSE format: event: <type>\ndata: <json>\n\n
      expect(writtenData.startsWith("event: new_order\n")).toBe(true);
      expect(writtenData.includes("data: ")).toBe(true);
      expect(writtenData.endsWith("\n\n")).toBe(true);

      // Parse the JSON data
      const dataLine = writtenData.split("\n").find((l: string) => l.startsWith("data: "));
      const jsonStr = dataLine!.replace("data: ", "");
      const parsed = JSON.parse(jsonStr);
      expect(parsed.orderId).toBe(456);
      expect(parsed.customerName).toBe("Maria");
      expect(parsed.total).toBe(150.0);
      expect(parsed.itemCount).toBe(5);
      expect(parsed.zone).toBe("Bairro Novo");
    });
  });

  describe("getConnectionCount", () => {
    it("returns 0 for unknown tenant", () => {
      expect(getConnectionCount(999)).toBe(0);
    });

    it("returns correct count for tenant", () => {
      const mockRes1 = createMockResponse();
      const mockRes2 = createMockResponse();
      _connections.set(1, new Set([mockRes1, mockRes2]));

      expect(getConnectionCount(1)).toBe(2);
    });
  });

  describe("getTotalConnectionCount", () => {
    it("returns 0 when no connections", () => {
      expect(getTotalConnectionCount()).toBe(0);
    });

    it("returns total across all tenants", () => {
      _connections.set(1, new Set([createMockResponse(), createMockResponse()]));
      _connections.set(2, new Set([createMockResponse()]));

      expect(getTotalConnectionCount()).toBe(3);
    });
  });
});

// ============================================
// BADGE (UNVIEWED ORDERS) TESTS
// ============================================

describe("Order Badge (Unviewed Count)", () => {
  describe("orders.unviewedCount", () => {
    it("client admin gets unviewed count", async () => {
      const { ctx } = createClientAdminContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.orders.unviewedCount();

      expect(result).toHaveProperty("count");
      expect(typeof result.count).toBe("number");
      expect(result.count).toBeGreaterThanOrEqual(0);
    });

    it("regular user is rejected", async () => {
      const { ctx } = createRegularUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.orders.unviewedCount()).rejects.toThrow();
    });

    it("unauthenticated user is rejected", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.orders.unviewedCount()).rejects.toThrow();
    });

    it("different tenants return isolated counts", async () => {
      const { ctx: ctx1 } = createClientAdminContext(1);
      const { ctx: ctx2 } = createClientAdminContext(999);
      const caller1 = appRouter.createCaller(ctx1);
      const caller2 = appRouter.createCaller(ctx2);

      const result1 = await caller1.orders.unviewedCount();
      const result2 = await caller2.orders.unviewedCount();

      // Tenant 999 should have 0 unviewed orders
      expect(result2.count).toBe(0);
      // Both should return valid numbers
      expect(typeof result1.count).toBe("number");
      expect(typeof result2.count).toBe("number");
    });
  });

  describe("orders.markViewed", () => {
    it("client admin can mark orders as viewed", async () => {
      const { ctx } = createClientAdminContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.orders.markViewed();

      expect(result).toEqual({ success: true });
    });

    it("regular user is rejected", async () => {
      const { ctx } = createRegularUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.orders.markViewed()).rejects.toThrow();
    });

    it("unauthenticated user is rejected", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.orders.markViewed()).rejects.toThrow();
    });

    it("marking viewed reduces unviewed count", async () => {
      const { ctx } = createClientAdminContext(1);
      const caller = appRouter.createCaller(ctx);

      // Get initial count
      const before = await caller.orders.unviewedCount();

      // Mark all as viewed
      await caller.orders.markViewed();

      // Count should be 0 after marking
      const after = await caller.orders.unviewedCount();
      expect(after.count).toBe(0);
    });
  });
});

// ============================================
// ORDER EVENT STRUCTURE TESTS
// ============================================

describe("OrderEvent Structure", () => {
  it("creates valid event with all fields", () => {
    const event = createSampleOrderEvent();

    expect(event.orderId).toBe(123);
    expect(event.customerName).toBe("João Silva");
    expect(event.total).toBe(89.9);
    expect(event.itemCount).toBe(3);
    expect(event.zone).toBe("Centro");
    expect(typeof event.createdAt).toBe("string");
  });

  it("serializes to valid JSON", () => {
    const event = createSampleOrderEvent();
    const json = JSON.stringify(event);
    const parsed = JSON.parse(json);

    expect(parsed.orderId).toBe(event.orderId);
    expect(parsed.customerName).toBe(event.customerName);
    expect(parsed.total).toBe(event.total);
    expect(parsed.itemCount).toBe(event.itemCount);
    expect(parsed.zone).toBe(event.zone);
  });
});
