import { z } from "zod";
import { router, clientAdminProcedure } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

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
   * Input: { days: number } (default 30)
   * Returns: Array<{ date, revenue, orders }>
   */
  getRevenueByDay: clientAdminProcedure
    .input(z.object({ days: z.number().min(1).max(365).default(30) }))
    .query(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      return db.getRevenueByDay(tenantId, input.days);
    }),

  /**
   * getOrdersByWeekday — Average orders by day of week (last 30 days).
   * Returns: Array<{ weekday, weekdayIndex, average, total }>
   */
  getOrdersByWeekday: clientAdminProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantIdFromUser(ctx.user);
    return db.getOrdersByWeekday(tenantId);
  }),

  /**
   * getTopProducts — Top N products by order count for a period.
   * Input: { period: 'today' | '7d' | '30d' | 'month' }
   * Returns: Array<{ productId, name, imageUrl, category, count }>
   */
  getTopProducts: clientAdminProcedure
    .input(z.object({
      period: z.enum(['today', '7d', '30d', 'month']).default('30d'),
    }))
    .query(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      return db.getTopProducts(tenantId, input.period);
    }),
});
