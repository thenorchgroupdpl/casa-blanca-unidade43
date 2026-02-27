/**
 * Tests for Order Sync, Manual Creation, and Cancellation
 * Covers: createManual, cancel, and metrics exclusion of cancelled orders
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================
// Mock DB
// ============================================
const mockDb = {
  createOrderFull: vi.fn(),
  getOrderById: vi.fn(),
  updateOrderStatus: vi.fn(),
  getOrdersByStatus: vi.fn(),
  getUnviewedOrdersCount: vi.fn(),
  markOrdersAsViewed: vi.fn(),
  getProductsByTenant: vi.fn(),
  getDeliveryZonesByTenant: vi.fn(),
  getDashboardSummary: vi.fn(),
  getRevenueByDay: vi.fn(),
  getOrdersByWeekday: vi.fn(),
  getTopProducts: vi.fn(),
};

vi.mock("./db", () => mockDb);
vi.mock("./_core/trpc", () => {
  const mockProcedure = {
    input: () => mockProcedure,
    query: (fn: any) => ({ _def: { query: fn }, _handler: fn }),
    mutation: (fn: any) => ({ _def: { mutation: fn }, _handler: fn }),
    use: () => mockProcedure,
  };
  return {
    router: (routes: any) => routes,
    publicProcedure: mockProcedure,
    protectedProcedure: mockProcedure,
    clientAdminProcedure: mockProcedure,
  };
});
vi.mock("./sse", () => ({
  notifyTenant: vi.fn(),
}));

// ============================================
// TESTS: createManual procedure
// ============================================
describe("orders.createManual", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a manual order with correct data", async () => {
    mockDb.createOrderFull.mockResolvedValue(42);

    const { ordersRouter } = await import("./routers/orders");
    const handler = (ordersRouter as any).createManual._handler;

    const ctx = { user: { tenantId: 1, role: "client_admin" } };
    const input = {
      customerName: "João Silva",
      customerPhone: "11999999999",
      items: [
        { productId: 1, name: "Pizza Margherita", quantity: 2, price: 35.90 },
        { productId: 2, name: "Coca-Cola", quantity: 1, price: 8.00 },
      ],
      deliveryZoneId: 5,
      deliveryZoneName: "Centro",
      deliveryFee: "5.00",
      observation: "Sem cebola",
    };

    const result = await handler({ ctx, input });

    expect(result).toEqual({ id: 42 });
    expect(mockDb.createOrderFull).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 1,
        customerName: "João Silva",
        customerPhone: "11999999999",
        status: "novo",
        deliveryZoneId: 5,
        deliveryZoneName: "Centro",
        deliveryFee: "5.00",
      })
    );

    // Check total calculation: (2*35.90 + 1*8.00) + 5.00 = 84.80
    const callArgs = mockDb.createOrderFull.mock.calls[0][0];
    expect(callArgs.totalValue).toBe("84.80");
    expect(callArgs.summary).toContain("2x Pizza Margherita");
    expect(callArgs.summary).toContain("1x Coca-Cola");
    expect(callArgs.summary).toContain("Obs: Sem cebola");
  });

  it("should create order without delivery fee when no zone selected", async () => {
    mockDb.createOrderFull.mockResolvedValue(43);

    const { ordersRouter } = await import("./routers/orders");
    const handler = (ordersRouter as any).createManual._handler;

    const ctx = { user: { tenantId: 1, role: "client_admin" } };
    const input = {
      customerName: "Maria",
      items: [{ productId: 1, name: "Hambúrguer", quantity: 1, price: 25.00 }],
    };

    const result = await handler({ ctx, input });

    expect(result).toEqual({ id: 43 });
    const callArgs = mockDb.createOrderFull.mock.calls[0][0];
    expect(callArgs.totalValue).toBe("25.00");
  });

  it("should reject if user has no tenantId", async () => {
    const { ordersRouter } = await import("./routers/orders");
    const handler = (ordersRouter as any).createManual._handler;

    const ctx = { user: { tenantId: null, role: "user" } };
    const input = {
      customerName: "Test",
      items: [{ productId: 1, name: "Item", quantity: 1, price: 10 }],
    };

    await expect(handler({ ctx, input })).rejects.toThrow();
  });
});

// ============================================
// TESTS: orders.cancel procedure
// ============================================
describe("orders.cancel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should cancel an active order", async () => {
    mockDb.getOrderById.mockResolvedValue({ id: 1, tenantId: 1, status: "novo" });
    mockDb.updateOrderStatus.mockResolvedValue(undefined);

    const { ordersRouter } = await import("./routers/orders");
    const handler = (ordersRouter as any).cancel._handler;

    const ctx = { user: { tenantId: 1, role: "client_admin" } };
    const result = await handler({ ctx, input: { id: 1 } });

    expect(result).toEqual({ success: true });
    expect(mockDb.updateOrderStatus).toHaveBeenCalledWith(1, "cancelado");
  });

  it("should cancel an order in preparation", async () => {
    mockDb.getOrderById.mockResolvedValue({ id: 2, tenantId: 1, status: "em_preparacao" });
    mockDb.updateOrderStatus.mockResolvedValue(undefined);

    const { ordersRouter } = await import("./routers/orders");
    const handler = (ordersRouter as any).cancel._handler;

    const ctx = { user: { tenantId: 1, role: "client_admin" } };
    const result = await handler({ ctx, input: { id: 2 } });

    expect(result).toEqual({ success: true });
  });

  it("should reject cancelling an already cancelled order", async () => {
    mockDb.getOrderById.mockResolvedValue({ id: 3, tenantId: 1, status: "cancelado" });

    const { ordersRouter } = await import("./routers/orders");
    const handler = (ordersRouter as any).cancel._handler;

    const ctx = { user: { tenantId: 1, role: "client_admin" } };
    await expect(handler({ ctx, input: { id: 3 } })).rejects.toThrow("já está cancelado");
  });

  it("should allow cancelling a completed order (lojista correction)", async () => {
    mockDb.getOrderById.mockResolvedValue({ id: 4, tenantId: 1, status: "concluido" });
    mockDb.updateOrderStatus.mockResolvedValue(undefined);

    const { ordersRouter } = await import("./routers/orders");
    const handler = (ordersRouter as any).cancel._handler;

    const ctx = { user: { tenantId: 1, role: "client_admin" } };
    const result = await handler({ ctx, input: { id: 4 } });
    expect(result).toEqual({ success: true });
    expect(mockDb.updateOrderStatus).toHaveBeenCalledWith(4, "cancelado");
  });

  it("should reject cancelling order from another tenant", async () => {
    mockDb.getOrderById.mockResolvedValue({ id: 5, tenantId: 2, status: "novo" });

    const { ordersRouter } = await import("./routers/orders");
    const handler = (ordersRouter as any).cancel._handler;

    const ctx = { user: { tenantId: 1, role: "client_admin" } };
    await expect(handler({ ctx, input: { id: 5 } })).rejects.toThrow();
  });

  it("should reject cancelling non-existent order", async () => {
    mockDb.getOrderById.mockResolvedValue(null);

    const { ordersRouter } = await import("./routers/orders");
    const handler = (ordersRouter as any).cancel._handler;

    const ctx = { user: { tenantId: 1, role: "client_admin" } };
    await expect(handler({ ctx, input: { id: 999 } })).rejects.toThrow("não encontrado");
  });
});

// ============================================
// TESTS: Checkout flow (save before WhatsApp)
// ============================================
describe("Checkout flow - order saved before WhatsApp", () => {
  it("public create endpoint saves order and returns id", async () => {
    mockDb.createOrderFull.mockResolvedValue(100);

    const { ordersRouter } = await import("./routers/orders");
    const handler = (ordersRouter as any).create._handler;

    const input = {
      tenantId: 1,
      customerName: "Cliente via WhatsApp",
      summary: "2x Pizza, 1x Suco",
      items: [
        { productId: 1, name: "Pizza", quantity: 2, price: 30 },
        { productId: 2, name: "Suco", quantity: 1, price: 8 },
      ],
      totalValue: "68.00",
    };

    const result = await handler({ input });

    expect(result).toEqual({ id: 100 });
    expect(mockDb.createOrderFull).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 1,
        customerName: "Cliente via WhatsApp",
        totalValue: "68.00",
      })
    );
  });

  it("public create endpoint handles delivery zone info", async () => {
    mockDb.createOrderFull.mockResolvedValue(101);

    const { ordersRouter } = await import("./routers/orders");
    const handler = (ordersRouter as any).create._handler;

    const input = {
      tenantId: 1,
      customerName: "Cliente",
      summary: "1x Hambúrguer",
      totalValue: "30.00",
      deliveryZoneId: 3,
      deliveryZoneName: "Zona Sul",
      deliveryFee: "5.00",
    };

    const result = await handler({ input });
    expect(result).toEqual({ id: 101 });
  });
});

// ============================================
// TESTS: Metrics exclude cancelled orders
// ============================================
describe("Metrics exclusion of cancelled orders", () => {
  it("getDashboardSummary is called with tenantId (metrics use ne cancelado)", async () => {
    // This test verifies the analytics router calls getDashboardSummary correctly
    // The actual SQL filtering (ne cancelado) is tested at the DB level
    mockDb.getDashboardSummary.mockResolvedValue({
      revenueToday: 100,
      revenueYesterday: 80,
      ordersToday: 5,
      ordersInProgress: 2,
      ticketMediaMonth: 50,
      ticketMediaLastMonth: 45,
      revenueMonth: 3000,
      revenueLastMonth: 2500,
      ordersMonth: 60,
      ordersLastMonth: 55,
      dailyAverage: 2,
    });

    const analyticsRouter = await import("./routers/analytics");
    const handler = (analyticsRouter.analyticsRouter as any).getDashboardSummary._handler;

    const ctx = { user: { tenantId: 1, role: "client_admin" } };
    const result = await handler({ ctx });

    expect(result.revenueToday).toBe(100);
    expect(mockDb.getDashboardSummary).toHaveBeenCalledWith(1);
  });
});
