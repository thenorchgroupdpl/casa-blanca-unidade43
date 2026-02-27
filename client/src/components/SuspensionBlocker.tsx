/**
 * SuspensionBlocker — Hard block overlay for suspended tenants.
 *
 * When the tenant's subscription status is "suspended", this component
 * renders a full-screen overlay with extreme blur that makes the
 * dashboard completely inaccessible. The modal cannot be closed by
 * any user action (no X button, no click-outside, no ESC key).
 *
 * The only way out is to resolve the payment via WhatsApp support.
 */

import { trpc } from "@/lib/trpc";
import {
  ShieldAlert,
  CreditCard,
  MessageCircle,
  Lock,
} from "lucide-react";
import { useEffect } from "react";

// ============================================
// WHATSAPP HELPERS
// ============================================

const FALLBACK_SUPPORT_WHATSAPP = "5511999999999";

function buildWhatsAppUrl(phone: string | null, message: string): string {
  const cleanPhone = (phone || FALLBACK_SUPPORT_WHATSAPP).replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

function buildSuspendedRegularizeMessage(tenantName: string): string {
  return `Olá, suporte! Sou da loja *${tenantName}*. Meu painel foi suspenso e eu preciso regularizar o pagamento urgente para voltar a vender.`;
}

function buildSuspendedAlreadyPaidMessage(tenantName: string): string {
  return `Olá, suporte! Sou da loja *${tenantName}*. Meu painel está suspenso, mas eu já realizei o pagamento. Segue o meu comprovante para liberação:`;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SuspensionBlocker() {
  const { data: popup, isLoading } = trpc.billingPopup.getPopup.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isSuspended = popup?.type === "suspended";

  // Block ESC key globally when suspended
  useEffect(() => {
    if (!isSuspended) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isSuspended]);

  // Block scrolling on the body when suspended
  useEffect(() => {
    if (!isSuspended) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSuspended]);

  if (isLoading || !isSuspended || !popup) return null;

  const tenantName = popup.tenantName || "Minha Loja";

  const handleRegularize = () => {
    const message = buildSuspendedRegularizeMessage(tenantName);
    const url = buildWhatsAppUrl(popup.supportWhatsapp, message);
    window.open(url, "_blank");
  };

  const handleAlreadyPaid = () => {
    const message = buildSuspendedAlreadyPaidMessage(tenantName);
    const url = buildWhatsAppUrl(popup.supportWhatsapp, message);
    window.open(url, "_blank");
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 99999,
        backgroundColor: "rgba(0, 0, 0, 0.80)",
        backdropFilter: "blur(64px)",
        WebkitBackdropFilter: "blur(64px)",
      }}
      // Prevent click-through
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Modal Card — unclosable */}
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl border border-white/10 relative animate-in fade-in zoom-in-95 duration-500"
        style={{ backgroundColor: "#111111" }}
      >
        {/* NO close button — intentionally omitted */}

        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-t-2xl" />

        <div className="p-8">
          {/* Icon cluster */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-red-500/15 flex items-center justify-center">
                <ShieldAlert className="h-10 w-10 text-red-500" />
              </div>
              {/* Lock badge */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center border-2 border-[#111111]">
                <Lock className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-white mb-2">
            Acesso Suspenso
          </h2>

          {/* Status badge */}
          <div className="flex justify-center mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
              Conta Suspensa
            </span>
          </div>

          {/* Message */}
          <p className="text-sm text-center leading-relaxed text-zinc-400 mb-8">
            Sua loja e seu painel foram suspensos por falta de pagamento.
            Para voltar a operar e receber pedidos, regularize sua situação imediatamente.
          </p>

          {/* PIX Key (if available) */}
          {popup.pixKey && (
            <div className="rounded-xl p-4 border border-zinc-800 bg-zinc-900/50 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Chave PIX para pagamento
                </span>
              </div>
              <p className="text-sm font-mono break-all text-zinc-200">
                {popup.pixKey}
              </p>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(popup.pixKey!);
                    // Visual feedback via button text change
                    const btn = document.getElementById("pix-copy-btn");
                    if (btn) {
                      btn.textContent = "✓ Copiada!";
                      setTimeout(() => { btn.textContent = "Copiar chave PIX"; }, 2000);
                    }
                  } catch {
                    // Fallback
                    const textarea = document.createElement("textarea");
                    textarea.value = popup.pixKey!;
                    textarea.style.position = "fixed";
                    textarea.style.opacity = "0";
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textarea);
                  }
                }}
                id="pix-copy-btn"
                className="mt-2 text-xs font-medium text-red-400 hover:text-red-300 transition-colors underline underline-offset-2"
              >
                Copiar chave PIX
              </button>
            </div>
          )}

          {/* Primary CTA: Regularizar Pagamento */}
          <button
            onClick={handleRegularize}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] mb-3"
            style={{
              boxShadow: "0 4px 20px rgba(239, 68, 68, 0.3)",
            }}
          >
            <CreditCard className="h-5 w-5" />
            Regularizar Pagamento agora
          </button>

          {/* Secondary CTA: Já paguei */}
          <button
            onClick={handleAlreadyPaid}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            Já paguei / Enviar comprovante
          </button>

          {/* Fine print */}
          <p className="text-[10px] text-center mt-5 text-zinc-600">
            Após a confirmação do pagamento, o acesso será restaurado automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
