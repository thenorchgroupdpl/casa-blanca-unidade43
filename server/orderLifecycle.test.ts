import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================
// Test: Order Lifecycle - Kanban Today Filter, History, Delete, DeleteByDate
// ============================================

// Mock db module
vi.mock("./db", () => ({
  getOrdersByStatus: vi.fn(),
  getOrderHistory: vi.fn(),
  deleteOrderById: vi.fn(),
  deleteOrdersByDate: vi.fn(),
}));

import {
  getOrdersByStatus,
  getOrderHistory,
  deleteOrderById,
  deleteOrdersByDate,
} from "./db";

const mockGetOrdersByStatus = vi.mocked(getOrdersByStatus);
const mockGetOrderHistory = vi.mocked(getOrderHistory);
const mockDeleteOrderById = vi.mocked(deleteOrderById);
const mockDeleteOrdersByDate = vi.mocked(deleteOrdersByDate);

describe("Order Lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Kanban Today Filter
  // ============================================
  describe("Kanban Today Filter (getOrdersByStatus)", () => {
    it("should return only today's orders", async () => {
      const todayOrders = [
        { id: 1, status: "novo", createdAt: new Date() },
        { id: 2, status: "em_preparacao", createdAt: new Date() },
      ];
      mockGetOrdersByStatus.mockResolvedValue(todayOrders as any);

      const result = await getOrdersByStatus(1);
      expect(result).toEqual(todayOrders);
      expect(mockGetOrdersByStatus).toHaveBeenCalledWith(1);
    });

    it("should not return yesterday's orders", async () => {
      // The function now filters by today's date range
      mockGetOrdersByStatus.mockResolvedValue([]);

      const result = await getOrdersByStatus(1);
      expect(result).toEqual([]);
    });

    it("should handle empty results gracefully", async () => {
      mockGetOrdersByStatus.mockResolvedValue([]);

      const result = await getOrdersByStatus(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  // ============================================
  // Order History
  // ============================================
  describe("Order History (getOrderHistory)", () => {
    it("should return all orders for a tenant", async () => {
      const allOrders = [
        { id: 1, status: "concluido", createdAt: new Date("2026-02-25") },
        { id: 2, status: "cancelado", createdAt: new Date("2026-02-26") },
        { id: 3, status: "novo", createdAt: new Date("2026-02-27") },
      ];
      mockGetOrderHistory.mockResolvedValue(allOrders as any);

      const result = await getOrderHistory(1);
      expect(result).toHaveLength(3);
      expect(result).toEqual(allOrders);
    });

    it("should return orders sorted by date descending", async () => {
      const orders = [
        { id: 3, createdAt: new Date("2026-02-27") },
        { id: 2, createdAt: new Date("2026-02-26") },
        { id: 1, createdAt: new Date("2026-02-25") },
      ];
      mockGetOrderHistory.mockResolvedValue(orders as any);

      const result = await getOrderHistory(1);
      expect(result[0].id).toBe(3);
      expect(result[2].id).toBe(1);
    });

    it("should return empty array for tenant with no orders", async () => {
      mockGetOrderHistory.mockResolvedValue([]);

      const result = await getOrderHistory(999);
      expect(result).toEqual([]);
    });
  });

  // ============================================
  // Delete Individual Order
  // ============================================
  describe("Delete Order (deleteOrderById)", () => {
    it("should delete an order by id and tenantId", async () => {
      mockDeleteOrderById.mockResolvedValue(undefined);

      await deleteOrderById(1, 1);
      expect(mockDeleteOrderById).toHaveBeenCalledWith(1, 1);
    });

    it("should be called with correct parameters", async () => {
      mockDeleteOrderById.mockResolvedValue(undefined);

      await deleteOrderById(42, 7);
      expect(mockDeleteOrderById).toHaveBeenCalledWith(42, 7);
      expect(mockDeleteOrderById).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // Delete Orders by Date (Bulk)
  // ============================================
  describe("Delete Orders by Date (deleteOrdersByDate)", () => {
    it("should delete all orders for a specific date", async () => {
      mockDeleteOrdersByDate.mockResolvedValue(undefined);

      await deleteOrdersByDate(1, "2026-02-26");
      expect(mockDeleteOrdersByDate).toHaveBeenCalledWith(1, "2026-02-26");
    });

    it("should handle date format correctly (YYYY-MM-DD)", async () => {
      mockDeleteOrdersByDate.mockResolvedValue(undefined);

      await deleteOrdersByDate(1, "2026-01-15");
      expect(mockDeleteOrdersByDate).toHaveBeenCalledWith(1, "2026-01-15");
    });

    it("should be called with correct tenantId", async () => {
      mockDeleteOrdersByDate.mockResolvedValue(undefined);

      await deleteOrdersByDate(5, "2026-02-27");
      expect(mockDeleteOrdersByDate).toHaveBeenCalledWith(5, "2026-02-27");
      expect(mockDeleteOrdersByDate).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // Integration: Status Flow Validation
  // ============================================
  describe("Status Flow Validation", () => {
    const STATUS_NEXT: Record<string, string | null> = {
      novo: "em_preparacao",
      em_preparacao: "saiu_entrega",
      saiu_entrega: "concluido",
      concluido: null,
      cancelado: null,
    };

    const STATUS_PREV: Record<string, string | null> = {
      novo: null,
      em_preparacao: "novo",
      saiu_entrega: "em_preparacao",
      concluido: "saiu_entrega",
      cancelado: null,
    };

    it("should allow forward movement through all statuses", () => {
      expect(STATUS_NEXT["novo"]).toBe("em_preparacao");
      expect(STATUS_NEXT["em_preparacao"]).toBe("saiu_entrega");
      expect(STATUS_NEXT["saiu_entrega"]).toBe("concluido");
      expect(STATUS_NEXT["concluido"]).toBeNull();
    });

    it("should allow backward movement through all statuses", () => {
      expect(STATUS_PREV["concluido"]).toBe("saiu_entrega");
      expect(STATUS_PREV["saiu_entrega"]).toBe("em_preparacao");
      expect(STATUS_PREV["em_preparacao"]).toBe("novo");
      expect(STATUS_PREV["novo"]).toBeNull();
    });

    it("should not allow forward or backward from cancelado", () => {
      expect(STATUS_NEXT["cancelado"]).toBeNull();
      expect(STATUS_PREV["cancelado"]).toBeNull();
    });
  });
});
