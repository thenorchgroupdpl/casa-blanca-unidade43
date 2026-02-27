import { describe, it, expect } from "vitest";
import { getEffectiveStatus } from "../shared/billingUtils";

// Helper to create dates relative to a reference date
function daysFromNow(days: number, ref: Date = new Date("2026-02-27")): string {
  const d = new Date(ref);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const NOW = new Date("2026-02-27");

describe("getEffectiveStatus", () => {
  // ============================================
  // EXPLICIT STATUS OVERRIDES
  // ============================================

  describe("explicit status overrides", () => {
    it("returns 'suspended' when subscriptionStatus is suspended, regardless of date", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: "suspended",
        nextBillingDate: daysFromNow(30, NOW), // date in the future
      }, NOW)).toBe("suspended");
    });

    it("returns 'suspended' even with overdue date", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: "suspended",
        nextBillingDate: daysFromNow(-10, NOW), // date in the past
      }, NOW)).toBe("suspended");
    });

    it("returns 'overdue' when subscriptionStatus is overdue, regardless of date", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: "overdue",
        nextBillingDate: daysFromNow(30, NOW), // date in the future
      }, NOW)).toBe("overdue");
    });

    it("returns 'overdue' when subscriptionStatus is overdue and no date set", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: "overdue",
        nextBillingDate: null,
      }, NOW)).toBe("overdue");
    });

    it("returns 'warning' when subscriptionStatus is warning and no date set", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: "warning",
        nextBillingDate: null,
      }, NOW)).toBe("warning");
    });
  });

  // ============================================
  // DATE-BASED AUTO-DETECTION
  // ============================================

  describe("date-based auto-detection (subscriptionStatus = active)", () => {
    it("returns 'overdue' when billing date is in the past (Aldeia scenario)", () => {
      // This is the exact bug scenario: Aldeia has nextBillingDate 25/02/2026
      // but subscriptionStatus is still "active"
      expect(getEffectiveStatus({
        subscriptionStatus: "active",
        nextBillingDate: "2026-02-25", // 2 days ago
      }, NOW)).toBe("overdue");
    });

    it("returns 'overdue' when billing date was yesterday", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: "active",
        nextBillingDate: daysFromNow(-1, NOW),
      }, NOW)).toBe("overdue");
    });

    it("returns 'overdue' when billing date was 30 days ago", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: "active",
        nextBillingDate: daysFromNow(-30, NOW),
      }, NOW)).toBe("overdue");
    });

    it("returns 'warning' when billing date is today (0 days)", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: "active",
        nextBillingDate: daysFromNow(0, NOW),
      }, NOW)).toBe("warning");
    });

    it("returns 'warning' when billing date is in 1 day", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: "active",
        nextBillingDate: daysFromNow(1, NOW),
      }, NOW)).toBe("warning");
    });

    it("returns 'warning' when billing date is in 3 days", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: "active",
        nextBillingDate: daysFromNow(3, NOW),
      }, NOW)).toBe("warning");
    });

    it("returns 'warning' when billing date is in 5 days", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: "active",
        nextBillingDate: daysFromNow(5, NOW),
      }, NOW)).toBe("warning");
    });

    it("returns 'active' when billing date is in 6 days (beyond warning threshold)", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: "active",
        nextBillingDate: daysFromNow(6, NOW),
      }, NOW)).toBe("active");
    });

    it("returns 'active' when billing date is in 30 days", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: "active",
        nextBillingDate: daysFromNow(30, NOW),
      }, NOW)).toBe("active");
    });
  });

  // ============================================
  // NULL / MISSING VALUES
  // ============================================

  describe("null and missing values", () => {
    it("returns 'active' when no date and status is active", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: "active",
        nextBillingDate: null,
      }, NOW)).toBe("active");
    });

    it("returns 'active' when no date and status is null", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: null,
        nextBillingDate: null,
      }, NOW)).toBe("active");
    });

    it("returns 'active' when status is null but date is far in the future", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: null,
        nextBillingDate: daysFromNow(60, NOW),
      }, NOW)).toBe("active");
    });

    it("returns 'overdue' when status is null but date is in the past", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: null,
        nextBillingDate: daysFromNow(-5, NOW),
      }, NOW)).toBe("overdue");
    });

    it("returns 'warning' when status is null but date is within 5 days", () => {
      expect(getEffectiveStatus({
        subscriptionStatus: null,
        nextBillingDate: daysFromNow(3, NOW),
      }, NOW)).toBe("warning");
    });
  });

  // ============================================
  // CARD COUNTING SIMULATION
  // ============================================

  describe("card counting simulation (matching screenshot scenario)", () => {
    const tenants = [
      { name: "Aldeia", subscriptionStatus: "active" as const, nextBillingDate: "2026-02-25" }, // vencido
      { name: "Empresa teste 01", subscriptionStatus: "active" as const, nextBillingDate: null }, // no date
      { name: "Mirian Carvalho", subscriptionStatus: "active" as const, nextBillingDate: null }, // no date
      { name: "Restaurante Teste", subscriptionStatus: "active" as const, nextBillingDate: null }, // no date
    ];

    it("counts 3 active (not 4, because Aldeia is overdue)", () => {
      const activeCount = tenants.filter(t => getEffectiveStatus(t, NOW) === "active").length;
      expect(activeCount).toBe(3);
    });

    it("counts 1 overdue (Aldeia)", () => {
      const overdueCount = tenants.filter(t => getEffectiveStatus(t, NOW) === "overdue").length;
      expect(overdueCount).toBe(1);
    });

    it("counts 0 warning", () => {
      const warningCount = tenants.filter(t => getEffectiveStatus(t, NOW) === "warning").length;
      expect(warningCount).toBe(0);
    });

    it("counts 0 suspended", () => {
      const suspendedCount = tenants.filter(t => getEffectiveStatus(t, NOW) === "suspended").length;
      expect(suspendedCount).toBe(0);
    });
  });

  // ============================================
  // MIXED SCENARIOS
  // ============================================

  describe("mixed tenant scenarios", () => {
    const mixedTenants = [
      { subscriptionStatus: "active", nextBillingDate: daysFromNow(-10, NOW) }, // overdue by date
      { subscriptionStatus: "active", nextBillingDate: daysFromNow(3, NOW) },   // warning by date
      { subscriptionStatus: "suspended", nextBillingDate: daysFromNow(-10, NOW) }, // suspended (override)
      { subscriptionStatus: "warning", nextBillingDate: null },                   // warning explicit
      { subscriptionStatus: "active", nextBillingDate: daysFromNow(30, NOW) },   // active
      { subscriptionStatus: "overdue", nextBillingDate: daysFromNow(30, NOW) },  // overdue explicit
    ];

    it("correctly counts all statuses", () => {
      const counts = {
        active: mixedTenants.filter(t => getEffectiveStatus(t, NOW) === "active").length,
        warning: mixedTenants.filter(t => getEffectiveStatus(t, NOW) === "warning").length,
        overdue: mixedTenants.filter(t => getEffectiveStatus(t, NOW) === "overdue").length,
        suspended: mixedTenants.filter(t => getEffectiveStatus(t, NOW) === "suspended").length,
      };

      expect(counts.active).toBe(1);     // only the one with date 30 days out
      expect(counts.warning).toBe(2);     // date within 5 days + explicit warning
      expect(counts.overdue).toBe(2);     // date in past + explicit overdue
      expect(counts.suspended).toBe(1);   // explicit suspended
    });

    it("total of all statuses equals total tenants", () => {
      const total = mixedTenants.length;
      const sum = ["active", "warning", "overdue", "suspended"]
        .reduce((acc, s) => acc + mixedTenants.filter(t => getEffectiveStatus(t, NOW) === s).length, 0);
      expect(sum).toBe(total);
    });
  });
});
