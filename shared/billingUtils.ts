/**
 * Derive effective billing status from both subscriptionStatus and nextBillingDate.
 * This ensures cards reflect reality even if the Régua hasn't run yet.
 */

export interface TenantBillingInput {
  subscriptionStatus: string | null;
  nextBillingDate: Date | string | null;
}

export function getEffectiveStatus(t: TenantBillingInput, now?: Date): string {
  const currentDate = now || new Date();

  // Suspended is always respected (manual override)
  if (t.subscriptionStatus === "suspended") return "suspended";
  // If explicitly overdue, keep it
  if (t.subscriptionStatus === "overdue") return "overdue";

  // Auto-detect from date
  if (t.nextBillingDate) {
    const due = new Date(t.nextBillingDate);
    // Compare dates only (ignore time)
    const nowDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const dueDate = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diffDays = Math.ceil((dueDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "overdue";
    if (diffDays <= 5) return "warning";
  }

  // If explicitly warning, keep it
  if (t.subscriptionStatus === "warning") return "warning";

  return t.subscriptionStatus || "active";
}
