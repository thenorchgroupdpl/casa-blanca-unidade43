/**
 * BillingPopupModal - Shown automatically on the lojista dashboard
 * when the tenant's billing status requires attention.
 *
 * Three modes:
 *   - warning:   Dismissible modal with "Lembrar depois"
 *   - overdue:   Dismissible modal with PIX checkout
 *   - suspended: HARD BLOCK – fullscreen, no escape, blur backdrop
 *
 * PIX key and support WhatsApp are fetched from global settings.
 */

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  Clock,
  Ban,
  Copy,
  CheckCircle2,
  MessageCircle,
  CreditCard,
  X,
  ShieldAlert,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

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
// PIX CHECKOUT COMPONENT
// ============================================

function PixCheckout({
  pixKey,
  buttonColor,
  buttonTextColor,
  textColor,
}: {
  pixKey: string;
  buttonColor: string;
  buttonTextColor: string;
  textColor: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      toast.success("Chave PIX copiada!", {
        description: "Cole no app do seu banco para realizar o pagamento.",
        duration: 4000,
      });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = pixKey;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      toast.success("Chave PIX copiada!");
      setTimeout(() => setCopied(false), 3000);
    }
  }, [pixKey]);

  return (
    <div className="space-y-3">
      {/* PIX Key Display */}
      <div className="rounded-xl p-3 border border-white/10" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <CreditCard className="h-3.5 w-3.5 opacity-60" style={{ color: textColor }} />
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-50" style={{ color: textColor }}>
            Chave PIX
          </span>
        </div>
        <p
          className="text-sm font-mono break-all leading-relaxed"
          style={{ color: textColor }}
        >
          {pixKey}
        </p>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 hover:opacity-90 active:scale-[0.98]"
        style={{
          backgroundColor: buttonColor,
          color: buttonTextColor,
          boxShadow: `0 4px 14px ${buttonColor}40`,
        }}
      >
        {copied ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            Chave Copiada!
          </>
        ) : (
          <>
            <Copy className="h-5 w-5" />
            Copiar Chave PIX
          </>
        )}
      </button>
    </div>
  );
}

// ============================================
// SUPPORT BUTTON COMPONENT
// ============================================

function SupportButton({
  supportWhatsapp,
  textColor,
}: {
  supportWhatsapp: string | null;
  textColor: string;
}) {
  const whatsappUrl = supportWhatsapp
    ? `https://wa.me/${supportWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Preciso de ajuda com minha mensalidade no Casa Blanca.")}`
    : null;

  return (
    <a
      href={whatsappUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (!whatsappUrl) {
          e.preventDefault();
          toast.info("Suporte não configurado. Entre em contato pelo canal habitual.");
        }
      }}
      className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-white/15 hover:bg-white/5 active:scale-[0.98]"
      style={{ color: textColor }}
    >
      <MessageCircle className="h-4 w-4" />
      Já realizei o pagamento / Falar com suporte
    </a>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function BillingPopupModal() {
  const { data: popup, isLoading } = trpc.billingPopup.getPopup.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const [open, setOpen] = useState(false);

  const isSuspended = popup?.type === "suspended";
  const isOverdueOrSuspended = popup?.type === "overdue" || popup?.type === "suspended";

  useEffect(() => {
    if (!popup || isLoading) return;

    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (dismissed && !isSuspended) return;

    const timer = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(timer);
  }, [popup, isLoading, isSuspended]);

  if (!popup || isLoading) return null;

  const Icon = POPUP_ICONS[popup.type];
  const iconColors = POPUP_ICON_COLORS[popup.type];

  const handleDismiss = () => {
    if (isSuspended) return; // Cannot dismiss suspended
    setOpen(false);
    sessionStorage.setItem(SESSION_KEY, "true");
  };

  // ============================================
  // SUSPENDED: Full-screen hard block
  // ============================================
  if (isSuspended) {
    return (
      <>
        {open && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{
              zIndex: 99999,
              backgroundColor: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            {/* Modal Card */}
            <div
              className="w-full max-w-md rounded-2xl p-8 shadow-2xl border border-white/10 relative animate-in fade-in zoom-in-95 duration-300"
              style={{ backgroundColor: popup.colors.bgColor }}
            >
              {/* NO close button for suspended */}

              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
                  style={{ backgroundColor: iconColors.bg }}
                >
                  <Icon className="h-8 w-8" style={{ color: iconColors.fg }} />
                </div>
              </div>

              {/* Title */}
              <DialogTitle className="sr-only">Acesso Bloqueado</DialogTitle>
              <h2
                className="text-xl font-bold text-center mb-2"
                style={{ color: popup.colors.textColor }}
              >
                {popup.title}
              </h2>

              {/* Status Badge */}
              <div className="flex justify-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-red-500/15 text-red-400">
                  Acesso Restrito
                </span>
              </div>

              {/* Message */}
              <p
                className="text-sm text-center leading-relaxed mb-6 opacity-80"
                style={{ color: popup.colors.textColor }}
              >
                {popup.message}
              </p>

              {/* PIX Checkout (if key configured) */}
              {popup.pixKey && (
                <div className="mb-4">
                  <PixCheckout
                    pixKey={popup.pixKey}
                    buttonColor={popup.colors.buttonColor}
                    buttonTextColor={popup.colors.buttonTextColor}
                    textColor={popup.colors.textColor}
                  />
                </div>
              )}

              {/* If no PIX key, show generic CTA */}
              {!popup.pixKey && (
                <button
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 hover:opacity-90 mb-4"
                  style={{
                    backgroundColor: popup.colors.buttonColor,
                    color: popup.colors.buttonTextColor,
                    boxShadow: `0 4px 14px ${popup.colors.buttonColor}40`,
                  }}
                  onClick={() => {
                    const url = popup.supportWhatsapp
                      ? `https://wa.me/${popup.supportWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Preciso regularizar minha mensalidade no Casa Blanca.")}`
                      : "#";
                    if (url !== "#") window.open(url, "_blank");
                    else toast.info("Suporte não configurado.");
                  }}
                >
                  <CreditCard className="h-5 w-5" />
                  Regularizar Pagamento
                </button>
              )}

              {/* Support Button */}
              <SupportButton
                supportWhatsapp={popup.supportWhatsapp}
                textColor={popup.colors.textColor}
              />

              {/* Fine print */}
              <p
                className="text-[10px] text-center mt-4 opacity-30"
                style={{ color: popup.colors.textColor }}
              >
                Após a confirmação do pagamento, o acesso será restaurado automaticamente.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  // ============================================
  // WARNING / OVERDUE: Dismissible dialog
  // ============================================
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
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          // Allow ESC for warning/overdue but not suspended (handled above)
        }}
      >
        <DialogTitle className="sr-only">Aviso de Pagamento</DialogTitle>
        <div
          className="rounded-2xl p-6 shadow-2xl border border-white/10 relative"
          style={{ backgroundColor: popup.colors.bgColor }}
        >
          {/* Close button */}
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

          {/* Message */}
          <p
            className="text-sm text-center leading-relaxed mb-6 opacity-80"
            style={{ color: popup.colors.textColor }}
          >
            {popup.message}
          </p>

          {/* PIX Checkout for overdue */}
          {isOverdueOrSuspended && popup.pixKey && (
            <div className="mb-4">
              <PixCheckout
                pixKey={popup.pixKey}
                buttonColor={popup.colors.buttonColor}
                buttonTextColor={popup.colors.buttonTextColor}
                textColor={popup.colors.textColor}
              />
            </div>
          )}

          {/* Simple CTA for warning (no PIX) */}
          {popup.type === "warning" && (
            <button
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:opacity-90"
              style={{
                backgroundColor: popup.colors.buttonColor,
                color: popup.colors.buttonTextColor,
              }}
              onClick={handleDismiss}
            >
              <CreditCard className="h-4 w-4" />
              Entendi, vou pagar
            </button>
          )}

          {/* Simple CTA for overdue without PIX key */}
          {popup.type === "overdue" && !popup.pixKey && (
            <button
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:opacity-90"
              style={{
                backgroundColor: popup.colors.buttonColor,
                color: popup.colors.buttonTextColor,
              }}
              onClick={() => {
                if (popup.supportWhatsapp) {
                  window.open(
                    `https://wa.me/${popup.supportWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Preciso regularizar minha mensalidade.")}`,
                    "_blank"
                  );
                } else {
                  toast.info("Entre em contato com o suporte para regularizar.");
                }
              }}
            >
              <CreditCard className="h-4 w-4" />
              Regularizar Pagamento
            </button>
          )}

          {/* Support button for overdue */}
          {popup.type === "overdue" && (
            <div className="mt-3">
              <SupportButton
                supportWhatsapp={popup.supportWhatsapp}
                textColor={popup.colors.textColor}
              />
            </div>
          )}

          {/* Dismiss link for warning */}
          {popup.type === "warning" && (
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
