/**
 * BillingPopupModal - Lightweight dismissible notification shown on the
 * lojista dashboard when the tenant's billing status requires attention.
 *
 * NO hard block — the lojista can always dismiss and navigate freely.
 * The actual billing action (WhatsApp buttons) lives in the Notifications page.
 *
 * Three modes (all dismissible):
 *   - warning:   Gentle reminder about upcoming due date
 *   - overdue:   Urgent notice about overdue payment
 *   - suspended: Critical alert about suspended account
 *
 * After dismissal, the popup won't reappear for the current session.
 */

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  Clock,
  Bell,
  X,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

// ============================================
// CONSTANTS
// ============================================

const POPUP_ICONS = {
  warning: AlertTriangle,
  overdue: Clock,
  suspended: ShieldAlert,
};

const POPUP_ICON_COLORS = {
  warning: { bg: "rgba(245,158,11,0.15)", fg: "#f59e0b" },
  overdue: { bg: "rgba(239,68,68,0.15)", fg: "#ef4444" },
  suspended: { bg: "rgba(220,38,38,0.20)", fg: "#dc2626" },
};

const SESSION_KEY = "billing_popup_dismissed";

// ============================================
// MAIN COMPONENT
// ============================================

export default function BillingPopupModal() {
  const { data: popup, isLoading } = trpc.billingPopup.getPopup.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!popup || isLoading) return;

    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (dismissed) return;

    const timer = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(timer);
  }, [popup, isLoading]);

  if (!popup || isLoading) return null;

  const Icon = POPUP_ICONS[popup.type];
  const iconColors = POPUP_ICON_COLORS[popup.type];

  const handleDismiss = () => {
    setOpen(false);
    sessionStorage.setItem(SESSION_KEY, "true");
  };

  const handleGoToNotifications = () => {
    setOpen(false);
    sessionStorage.setItem(SESSION_KEY, "true");
    setLocation("/admin/dashboard/notifications");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) handleDismiss();
      }}
    >
      <DialogContent
        className="sm:max-w-sm p-0 border-0 overflow-hidden [&>button]:hidden"
        style={{ backgroundColor: "transparent" }}
      >
        <DialogTitle className="sr-only">Aviso de Pagamento</DialogTitle>
        <div
          className="rounded-2xl p-6 shadow-2xl border border-white/10 relative"
          style={{ backgroundColor: popup.colors.bgColor }}
        >
          {/* Close button — always available */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" style={{ color: popup.colors.textColor }} />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: iconColors.bg }}
            >
              <Icon className="h-7 w-7" style={{ color: iconColors.fg }} />
            </div>
          </div>

          {/* Title */}
          <h3
            className="text-lg font-bold text-center mb-2"
            style={{ color: popup.colors.textColor }}
          >
            {popup.title}
          </h3>

          {/* Days left indicator for warning */}
          {popup.type === "warning" && popup.daysLeft !== null && (
            <div className="flex justify-center mb-3">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: "rgba(245,158,11,0.15)",
                  color: "#f59e0b",
                }}
              >
                {popup.daysLeft <= 0
                  ? "Vence hoje!"
                  : popup.daysLeft === 1
                    ? "Vence amanhã!"
                    : `Faltam ${popup.daysLeft} dias`}
              </span>
            </div>
          )}

          {/* Overdue badge */}
          {popup.type === "overdue" && (
            <div className="flex justify-center mb-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-500/15 text-red-400">
                Pagamento em atraso
              </span>
            </div>
          )}

          {/* Suspended badge */}
          {popup.type === "suspended" && (
            <div className="flex justify-center mb-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-500/20 text-red-400">
                Conta suspensa
              </span>
            </div>
          )}

          {/* Message */}
          <p
            className="text-sm text-center leading-relaxed mb-6 opacity-80"
            style={{ color: popup.colors.textColor }}
          >
            {popup.message}
          </p>

          {/* Primary CTA: Go to Notifications */}
          <button
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: popup.colors.buttonColor,
              color: popup.colors.buttonTextColor,
            }}
            onClick={handleGoToNotifications}
          >
            <Bell className="h-4 w-4" />
            Ver detalhes em Notificações
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Dismiss link */}
          <button
            onClick={handleDismiss}
            className="w-full mt-2 py-2 text-xs opacity-50 hover:opacity-70 transition-opacity"
            style={{ color: popup.colors.textColor }}
          >
            Lembrar depois
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
