import { z } from "zod";
import { router, clientAdminProcedure } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { ANALYTICS_EPOCH_DATE } from "@shared/const";

// Helper to get tenant ID from user context
function getTenantIdFromUser(user: { tenantId: number | null; role: string }) {
  if (!user.tenantId && user.role !== 'super_admin') {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Usuário não está associado a nenhuma loja",
    });
  }
  return user.tenantId!;
}

/** All supported analytics periods */
const analyticsPeriodSchema = z.enum(['today', '7d', '30d', 'month', 'year', 'all']);

export const analyticsRouter = router({
  /**
   * getDashboardSummary — All 6 card metrics in a single call.
   * Returns: revenueToday, revenueYesterday, ordersToday, ordersInProgress,
   *          ticketMediaMonth, ticketMediaLastMonth, revenueMonth, revenueLastMonth,
   *          ordersMonth, ordersLastMonth, dailyAverage
   */
  getDashboardSummary: clientAdminProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantIdFromUser(ctx.user);
    return db.getDashboardSummary(tenantId);
  }),

  /**
   * getRevenueByDay — Revenue time series for charts.
   * Now accepts a period string instead of raw days count.
   * For 'all', queries from ANALYTICS_EPOCH (2026-01-01) to today.
   */
  getRevenueByDay: clientAdminProcedure
    .input(z.object({ period: analyticsPeriodSchema.default('30d') }))
    .query(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      const { startDate, days } = periodToDateRange(input.period);
      return db.getRevenueByDay(tenantId, days, startDate);
    }),

  /**
   * getOrdersByWeekday — Average orders by day of week.
   * Now accepts a period to scope the weekday analysis.
   */
  getOrdersByWeekday: clientAdminProcedure
    .input(z.object({ period: analyticsPeriodSchema.default('30d') }).optional())
    .query(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      const period = input?.period || '30d';
      const { days } = periodToDateRange(period);
      return db.getOrdersByWeekday(tenantId, days);
    }),

  /**
   * getTopProducts — Top N products by order count for a period.
   * Now supports 'year' and 'all' periods.
   */
  getTopProducts: clientAdminProcedure
    .input(z.object({
      period: analyticsPeriodSchema.default('30d'),
    }))
    .query(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      return db.getTopProducts(tenantId, input.period);
    }),
});

/**
 * Convert a period string to a start date and day count.
 * Ensures the start date is never before ANALYTICS_EPOCH (2026-01-01).
 */
function periodToDateRange(period: string): { startDate: Date; days: number } {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  let startDate: Date;

  switch (period) {
    case 'today':
      startDate = todayStart;
      break;
    case '7d':
      startDate = new Date(todayStart);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate = new Date(todayStart);
      startDate.setDate(startDate.getDate() - 30);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
      startDate = new Date(ANALYTICS_EPOCH_DATE);
      break;
    default:
      startDate = new Date(todayStart);
      startDate.setDate(startDate.getDate() - 30);
  }

  // Clamp to epoch
  if (startDate < ANALYTICS_EPOCH_DATE) {
    startDate = new Date(ANALYTICS_EPOCH_DATE);
  }

  const days = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  return { startDate, days };
}
