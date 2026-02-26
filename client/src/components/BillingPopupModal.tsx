/**
 * BillingPopupModal - Shown automatically on the lojista dashboard
 * when the tenant's billing status requires attention.
 * 
 * The popup type (warning/overdue/suspended) and content are
 * determined server-side based on next_billing_date and subscription_status.
 */

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Clock, Ban, CreditCard, X } from "lucide-react";
import { useState, useEffect } from "react";

const POPUP_ICONS = {
  warning: AlertTriangle,
  overdue: Clock,
  suspended: Ban,
};

const POPUP_ICON_COLORS = {
  warning: { bg: "rgba(245,158,11,0.15)", fg: "#f59e0b" },
  overdue: { bg: "rgba(239,68,68,0.15)", fg: "#ef4444" },
  suspended: { bg: "rgba(161,161,170,0.15)", fg: "#a1a1aa" },
};

// Session key to avoid showing popup multiple times per session
const SESSION_KEY = "billing_popup_dismissed";

export default function BillingPopupModal() {
  const { data: popup, isLoading } = trpc.billingPopup.getPopup.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 min cache
    retry: false,
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!popup || isLoading) return;

    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (dismissed) {
      // For suspended, always show (can't dismiss permanently)
      if (popup.type !== "suspended") return;
    }

    // Show popup after a short delay for better UX
    const timer = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(timer);
  }, [popup, isLoading]);

  if (!popup || isLoading) return null;

  const Icon = POPUP_ICONS[popup.type];
  const iconColors = POPUP_ICON_COLORS[popup.type];

  const handleDismiss = () => {
    setOpen(false);
    if (popup.type !== "suspended") {
      sessionStorage.setItem(SESSION_KEY, "true");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) handleDismiss();
    }}>
      <DialogContent
        className="sm:max-w-sm p-0 border-0 overflow-hidden"
        style={{ backgroundColor: "transparent" }}
        // Remove the default close button from DialogContent
        onPointerDownOutside={(e) => {
          if (popup.type === "suspended") e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (popup.type === "suspended") e.preventDefault();
        }}
      >
        <div
          className="rounded-2xl p-6 shadow-2xl border border-white/10 relative"
          style={{ backgroundColor: popup.colors.bgColor }}
        >
          {/* Close button (hidden for suspended) */}
          {popup.type !== "suspended" && (
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" style={{ color: popup.colors.textColor }} />
            </button>
          )}

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

          {/* Message */}
          <p
            className="text-sm text-center leading-relaxed mb-6 opacity-80"
            style={{ color: popup.colors.textColor }}
          >
            {popup.message}
          </p>

          {/* CTA Button */}
          <button
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:opacity-90"
            style={{
              backgroundColor: popup.colors.buttonColor,
              color: popup.colors.buttonTextColor,
            }}
            onClick={() => {
              // For now, just dismiss. In the future, this could open a payment page.
              if (popup.type === "suspended") {
                // Open WhatsApp or support link
                window.open("https://wa.me/", "_blank");
              } else {
                handleDismiss();
              }
            }}
          >
            <CreditCard className="h-4 w-4" />
            {popup.type === "suspended" ? "Entrar em Contato" : "Pagar / Copiar PIX"}
          </button>

          {/* Dismiss link (not for suspended) */}
          {popup.type !== "suspended" && (
            <button
              onClick={handleDismiss}
              className="w-full mt-2 py-2 text-xs opacity-50 hover:opacity-70 transition-opacity"
              style={{ color: popup.colors.textColor }}
            >
              Lembrar depois
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
