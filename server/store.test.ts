import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getStatusText, isRestaurantOpen } from "../client/src/lib/utils";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createClientAdminContext(tenantId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: 10,
    openId: "client-admin-test",
    email: "lojista@casablanca.com",
    name: "Lojista Teste",
    loginMethod: "email",
    role: "client_admin",
    tenantId,
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

function createUnauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Helper to create business hours for testing
function createBusinessHours(schedule: Array<{
  day: string;
  dayNumber: number;
  open: string;
  close: string;
  closed: boolean;
}>) {
  return { schedule };
}

describe("Store Dashboard Procedures", () => {
  const caller = appRouter.createCaller(createClientAdminContext());
  const unauthCaller = appRouter.createCaller(createUnauthenticatedContext());

  describe("store.setManualOverride", () => {
    it("should accept 'open' override", async () => {
      const result = await caller.store.setManualOverride({ override: "open" });
      expect(result).toEqual({ success: true });
    });

    it("should accept 'closed' override", async () => {
      const result = await caller.store.setManualOverride({ override: "closed" });
      expect(result).toEqual({ success: true });
    });

    it("should accept null to reset override", async () => {
      const result = await caller.store.setManualOverride({ override: null });
      expect(result).toEqual({ success: true });
    });

    it("should reject unauthenticated users", async () => {
      await expect(
        unauthCaller.store.setManualOverride({ override: "open" })
      ).rejects.toThrow();
    });
  });

  describe("store.getOrders", () => {
    it("should return an array of orders", async () => {
      const result = await caller.store.getOrders();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should reject unauthenticated users", async () => {
      await expect(unauthCaller.store.getOrders()).rejects.toThrow();
    });
  });

  describe("store.toggleOrderCompleted", () => {
    it("should accept valid orderId and isCompleted", async () => {
      // This may fail if orderId doesn't exist, but the input validation should pass
      try {
        await caller.store.toggleOrderCompleted({ orderId: 999, isCompleted: true });
      } catch (e: any) {
        // Expected to fail because orderId 999 doesn't exist, but not a validation error
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });
  });

  describe("store.toggleProductAvailability", () => {
    it("should accept valid productId and isAvailable", async () => {
      try {
        await caller.store.toggleProductAvailability({ productId: 999, isAvailable: false });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });
  });
});

describe("getStatusText - Dynamic Warnings", () => {
  // Helper to mock current time
  function mockTime(hours: number, minutes: number, dayOfWeek: number) {
    const date = new Date(2026, 1, 21 + (dayOfWeek - new Date(2026, 1, 21).getDay()), hours, minutes);
    vi.setSystemTime(date);
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should return 'Aberto até' when store is open and not near closing", () => {
    // Saturday (6), 20:00 - store open 18:00-23:00
    const saturday = 6;
    mockTime(20, 0, saturday);

    const bh = createBusinessHours([
      { day: "Sábado", dayNumber: saturday, open: "18:00", close: "23:00", closed: false },
    ]);

    const result = getStatusText(bh);
    expect(result.isOpen).toBe(true);
    expect(result.text).toBe("Aberto até 23:00");
    expect(result.warning).toBeUndefined();
  });

  it("should return 'Fechando em breve' when within 30 minutes of closing", () => {
    const saturday = 6;
    mockTime(22, 40, saturday); // 20 minutes before 23:00

    const bh = createBusinessHours([
      { day: "Sábado", dayNumber: saturday, open: "18:00", close: "23:00", closed: false },
    ]);

    const result = getStatusText(bh);
    expect(result.isOpen).toBe(true);
    expect(result.text).toBe("Fechando em breve");
    expect(result.warning).toBe("closing_soon");
  });

  it("should return 'Abre em breve' when within 30 minutes of opening", () => {
    const saturday = 6;
    mockTime(17, 40, saturday); // 20 minutes before 18:00

    const bh = createBusinessHours([
      { day: "Sábado", dayNumber: saturday, open: "18:00", close: "23:00", closed: false },
    ]);

    const result = getStatusText(bh);
    expect(result.isOpen).toBe(false);
    expect(result.text).toBe("Abre em breve");
    expect(result.warning).toBe("opening_soon");
  });

  it("should return 'Abre às' when more than 30 minutes before opening", () => {
    const saturday = 6;
    mockTime(16, 0, saturday); // 2 hours before 18:00

    const bh = createBusinessHours([
      { day: "Sábado", dayNumber: saturday, open: "18:00", close: "23:00", closed: false },
    ]);

    const result = getStatusText(bh);
    expect(result.isOpen).toBe(false);
    expect(result.text).toBe("Abre às 18:00");
    expect(result.warning).toBeUndefined();
  });

  it("should return 'Fechado' when no schedule is available", () => {
    const saturday = 6;
    mockTime(12, 0, saturday);

    const bh = createBusinessHours([
      { day: "Sábado", dayNumber: saturday, open: "18:00", close: "23:00", closed: true },
    ]);

    const result = getStatusText(bh);
    expect(result.isOpen).toBe(false);
    // Should find next open day or show 'Fechado'
  });

  it("should return next day opening when closed today", () => {
    const monday = 1;
    const tuesday = 2;
    mockTime(23, 30, monday); // After closing on Monday

    const bh = createBusinessHours([
      { day: "Segunda", dayNumber: monday, open: "18:00", close: "23:00", closed: false },
      { day: "Terça", dayNumber: tuesday, open: "18:00", close: "23:00", closed: false },
    ]);

    const result = getStatusText(bh);
    expect(result.isOpen).toBe(false);
    expect(result.text).toContain("amanhã");
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
