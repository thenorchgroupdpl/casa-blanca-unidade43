import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";

// ============================================
// BILLING AUTOMATION - Régua de 5 dias
// ============================================

/**
 * Process billing notifications for all tenants approaching their billing date.
 * This function should be called daily via CRON job or admin trigger.
 * 
 * Rules:
 * - Checks tenants with nextBillingDate within the next 5 days
 * - Sends exactly 1 notification per day per tenant (no spam)
 * - Uses the template from globalSettings with variable substitution
 * - Updates subscription status to 'warning' when within 5 days
 */
export async function checkBillingNotifications(): Promise<{
  processed: number;
  notified: number;
  skipped: number;
  errors: string[];
}> {
  const result = { processed: 0, notified: 0, skipped: 0, errors: [] as string[] };

  try {
    // 1. Get the notification template from global settings
    const template = await db.getGlobalSetting("billing_notification_template");
    const defaultTemplate = "Olá {{store_name}}! Seu vencimento é em {{days_left}} dia(s), no dia {{due_date}}. Por favor, regularize seu pagamento para manter sua loja ativa.";
    const messageTemplate = template || defaultTemplate;

    // 2. Get all tenants with billing date within the next 5 days
    const approachingTenants = await db.getTenantsApproachingBilling(5);
    result.processed = approachingTenants.length;

    for (const tenant of approachingTenants) {
      try {
        if (!tenant.nextBillingDate) continue;

        // 3. Check if we already sent a notification today
        const alreadySent = await db.hasBillingNotificationToday(tenant.id);
        if (alreadySent) {
          result.skipped++;
          continue;
        }

        // 4. Calculate days left
        const now = new Date();
        const dueDate = new Date(tenant.nextBillingDate);
        const diffMs = dueDate.getTime() - now.getTime();
        const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

        // 5. Process template with variables
        const formattedDate = dueDate.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        const processedMessage = messageTemplate
          .replace(/\{\{store_name\}\}/g, tenant.name)
          .replace(/\{\{due_date\}\}/g, formattedDate)
          .replace(/\{\{days_left\}\}/g, String(daysLeft));

        const title = daysLeft === 0
          ? "⚠️ Vencimento Hoje!"
          : daysLeft === 1
            ? "⚠️ Vencimento Amanhã!"
            : `📋 Vencimento em ${daysLeft} dias`;

        // 6. Create notification
        await db.createNotification({
          tenantId: tenant.id,
          title,
          message: processedMessage,
          type: "billing",
        });

        // 7. Update subscription status to 'warning' if still 'active'
        if (tenant.subscriptionStatus === "active") {
          await db.updateTenantSubscriptionStatus(tenant.id, "warning");
        }

        result.notified++;
      } catch (err) {
        result.errors.push(`Tenant ${tenant.id} (${tenant.name}): ${String(err)}`);
      }
    }
  } catch (err) {
    result.errors.push(`Global error: ${String(err)}`);
  }

  return result;
}

// ============================================
// BILLING ROUTER (Super Admin)
// ============================================

const superAdminGuard = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "super_admin" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao Super Admin" });
  }
  return next({ ctx });
});

export const billingRouter = router({
  /** List all tenants with billing info */
  listTenants: superAdminGuard.query(async () => {
    const allTenants = await db.getAllTenantsWithBilling();
    return allTenants.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      clientStatus: t.clientStatus,
      subscriptionPlan: t.subscriptionPlan,
      nextBillingDate: t.nextBillingDate,
      billingAmount: t.billingAmount,
      subscriptionStatus: t.subscriptionStatus,
      telefoneDono: t.telefoneDono,
    }));
  }),

  /** Update billing date for a tenant */
  updateBillingDate: superAdminGuard
    .input(z.object({
      tenantId: z.number(),
      nextBillingDate: z.string(), // ISO date string
    }))
    .mutation(async ({ input }) => {
      await db.updateTenantBillingDate(input.tenantId, new Date(input.nextBillingDate));
      return { success: true };
    }),

  /** Update billing amount for a tenant */
  updateBillingAmount: superAdminGuard
    .input(z.object({
      tenantId: z.number(),
      billingAmount: z.string(),
    }))
    .mutation(async ({ input }) => {
      await db.updateTenantBillingAmount(input.tenantId, input.billingAmount);
      return { success: true };
    }),

  /** Update subscription status for a tenant */
  updateSubscriptionStatus: superAdminGuard
    .input(z.object({
      tenantId: z.number(),
      status: z.enum(["active", "warning", "overdue", "suspended"]),
    }))
    .mutation(async ({ input }) => {
      await db.updateTenantSubscriptionStatus(input.tenantId, input.status);
      return { success: true };
    }),

  /** Manually trigger billing check (for testing or manual runs) */
  runBillingCheck: superAdminGuard.mutation(async () => {
    const result = await checkBillingNotifications();
    return result;
  }),

  /** Send a manual notification to a tenant */
  sendNotification: superAdminGuard
    .input(z.object({
      tenantId: z.number(),
      title: z.string().min(1),
      message: z.string().min(1),
      type: z.enum(["billing", "system", "info", "warning"]).default("info"),
    }))
    .mutation(async ({ input }) => {
      await db.createNotification({
        tenantId: input.tenantId,
        title: input.title,
        message: input.message,
        type: input.type,
      });
      return { success: true };
    }),

  /** Generate WhatsApp billing link for a tenant */
  getWhatsAppLink: superAdminGuard
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      const tenant = await db.getTenantById(input.tenantId);
      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant não encontrado" });
      }

      // Get PIX key from global settings
      const pixKey = await db.getGlobalSetting("billing_pix_key") || "Não configurada";

      // Get phone number — clean it to digits only
      const rawPhone = tenant.telefoneDono || "";
      const cleanPhone = rawPhone.replace(/\D/g, "");
      // Ensure it has country code (55 for Brazil)
      const phone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;

      if (!cleanPhone) {
        return {
          available: false as const,
          reason: "Telefone do dono não cadastrado neste tenant",
          link: null,
          message: null,
        };
      }

      // Calculate days left
      let daysLeftText = "";
      let dueDateText = "não definida";
      if (tenant.nextBillingDate) {
        const now = new Date();
        const due = new Date(tenant.nextBillingDate);
        const diffMs = due.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        dueDateText = due.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

        if (daysLeft > 0) {
          daysLeftText = `${daysLeft} dia${daysLeft !== 1 ? "s" : ""}`;
        } else if (daysLeft === 0) {
          daysLeftText = "hoje";
        } else {
          daysLeftText = `${Math.abs(daysLeft)} dia${Math.abs(daysLeft) !== 1 ? "s" : ""} atrás`;
        }
      }

      const amount = tenant.billingAmount
        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(tenant.billingAmount))
        : "R$ 150,00";

      // Build message based on status
      let message = "";
      const status = tenant.subscriptionStatus || "active";

      if (status === "warning" || (status === "active" && daysLeftText)) {
        message = `Olá, ${tenant.name}! 👋 Sua mensalidade do Casa Blanca vence em ${daysLeftText} (dia ${dueDateText}). O valor é ${amount}. Para renovar, use a chave PIX: ${pixKey}. Qualquer dúvida, é só chamar! 😊`;
      } else if (status === "overdue") {
        message = `Olá, ${tenant.name}! ⚠️ Sua mensalidade do Casa Blanca venceu no dia ${dueDateText} (${daysLeftText}). O valor é ${amount}. Para regularizar, use a chave PIX: ${pixKey}. Sua loja pode ser suspensa caso o pagamento não seja realizado. Qualquer dúvida, estamos à disposição!`;
      } else if (status === "suspended") {
        message = `Olá, ${tenant.name}! 🚫 Sua loja no Casa Blanca foi suspensa por falta de pagamento. O valor pendente é ${amount}. Para reativar imediatamente, realize o pagamento via PIX: ${pixKey}. Após o pagamento, entre em contato para liberação.`;
      } else {
        message = `Olá, ${tenant.name}! 👋 Informamos que sua mensalidade do Casa Blanca é de ${amount}. Para pagamento, use a chave PIX: ${pixKey}. Qualquer dúvida, é só chamar! 😊`;
      }

      const encodedMessage = encodeURIComponent(message);
      const link = `https://wa.me/${phone}?text=${encodedMessage}`;

      return {
        available: true as const,
        reason: null,
        link,
        message,
      };
    }),
});

// ============================================
// BILLING POPUP ROUTER (Client Admin / Lojista)
// ============================================

/**
 * Determine which billing popup (if any) to show the lojista.
 * Based on next_billing_date and subscription_status.
 * Returns null if no popup should be shown.
 */
export const billingPopupRouter = router({
  /** Get the billing popup state for the current tenant */
  getPopup: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.tenantId) return null;

    const tenant = await db.getTenantById(ctx.user.tenantId);
    if (!tenant) return null;

    // Determine popup type based on subscription status and billing date
    let popupType: "warning" | "overdue" | "suspended" | null = null;

    if (tenant.subscriptionStatus === "suspended") {
      popupType = "suspended";
    } else if (tenant.subscriptionStatus === "overdue") {
      popupType = "overdue";
    } else if (tenant.subscriptionStatus === "warning") {
      popupType = "warning";
    } else if (tenant.nextBillingDate) {
      // Auto-detect from date even if status hasn't been updated yet
      const now = new Date();
      const due = new Date(tenant.nextBillingDate);
      const diffMs = due.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysLeft < 0) {
        popupType = "overdue";
      } else if (daysLeft <= 5) {
        popupType = "warning";
      }
    }

    if (!popupType) return null;

    // Fetch popup config from global settings
    const popupConfigStr = await db.getGlobalSetting(`billing_popup_${popupType}`);
    const colorsStr = await db.getGlobalSetting("billing_popup_colors");
    const pixKey = await db.getGlobalSetting("billing_pix_key");
    const supportWhatsapp = await db.getGlobalSetting("billing_support_whatsapp");

    // Default popup configs
    const defaultPopups: Record<string, { title: string; message: string }> = {
      warning: {
        title: "Sua mensalidade vence em breve",
        message: "Faltam poucos dias para o vencimento da sua mensalidade. Regularize seu pagamento para manter sua loja ativa.",
      },
      overdue: {
        title: "Mensalidade Atrasada",
        message: "Sua mensalidade est\u00e1 vencida. Sua loja pode ser suspensa a qualquer momento. Pague agora para evitar a interrup\u00e7\u00e3o do servi\u00e7o.",
      },
      suspended: {
        title: "Acesso Bloqueado",
        message: "O acesso ao painel foi restrito por falta de pagamento. Entre em contato com o suporte ou realize o pagamento para reativar sua loja.",
      },
    };

    const defaultColors = {
      bgColor: "#18181b",
      textColor: "#fafafa",
      buttonColor: "#f59e0b",
      buttonTextColor: "#000000",
    };

    let popupConfig = defaultPopups[popupType];
    let colors = defaultColors;

    if (popupConfigStr) {
      try { popupConfig = JSON.parse(popupConfigStr); } catch { /* use default */ }
    }
    if (colorsStr) {
      try { colors = { ...defaultColors, ...JSON.parse(colorsStr) }; } catch { /* use default */ }
    }

    return {
      type: popupType,
      title: popupConfig.title,
      message: popupConfig.message,
      colors,
      pixKey: pixKey || null,
      supportWhatsapp: supportWhatsapp || null,
      tenantName: tenant.name || "Minha Loja",
      daysLeft: tenant.nextBillingDate
        ? Math.ceil((new Date(tenant.nextBillingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null,
    };
  }),
});

// ============================================
// NOTIFICATIONS ROUTER (Client Admin / Lojista)
// ============================================

export const notificationsRouter = router({
  /** Get all notifications for the current tenant */
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.tenantId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Sem tenant associado" });
    }
    return await db.getNotificationsByTenant(ctx.user.tenantId);
  }),

  /** Get unread count for badge */
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.tenantId) return 0;
    return await db.getUnreadNotificationCount(ctx.user.tenantId);
  }),

  /** Mark a single notification as read */
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sem tenant associado" });
      }
      await db.markNotificationAsRead(input.id, ctx.user.tenantId);
      return { success: true };
    }),

  /** Mark all notifications as read */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user.tenantId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Sem tenant associado" });
    }
    await db.markAllNotificationsAsRead(ctx.user.tenantId);
    return { success: true };
  }),
});
