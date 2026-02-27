import { trpc } from "@/lib/trpc";
import ClientAdminLayout from "@/components/ClientAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Bell,
  BellOff,
  CheckCheck,
  DollarSign,
  Info,
  AlertTriangle,
  Settings,
  Clock,
  CreditCard,
  MessageCircle,
  ShieldAlert,
} from "lucide-react";

// ============================================
// WHATSAPP HELPERS
// ============================================

const FALLBACK_SUPPORT_WHATSAPP = "5511999999999";

function buildWhatsAppUrl(phone: string | null, message: string): string {
  const cleanPhone = (phone || FALLBACK_SUPPORT_WHATSAPP).replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

function buildRegularizeMessage(tenantName: string): string {
  return `Olá, suporte! Sou da loja *${tenantName}* e gostaria de regularizar o pagamento da minha mensalidade atrasada.`;
}

function buildAlreadyPaidMessage(tenantName: string): string {
  return `Olá, suporte! Sou da loja *${tenantName}* e estou enviando mensagem pois o painel acusa mensalidade atrasada, mas eu já realizei o pagamento.`;
}

// ============================================
// BILLING CARD COMPONENT
// ============================================

function BillingAlertCard({
  popup,
}: {
  popup: {
    type: string;
    title: string;
    message: string;
    supportWhatsapp: string | null;
    tenantName: string;
    pixKey: string | null;
    daysLeft: number | null;
  };
}) {
  const tenantName = popup.tenantName || "Minha Loja";
  const isSuspended = popup.type === "suspended";

  const handleRegularize = () => {
    const message = buildRegularizeMessage(tenantName);
    const url = buildWhatsAppUrl(popup.supportWhatsapp, message);
    window.open(url, "_blank");
  };

  const handleAlreadyPaid = () => {
    const message = buildAlreadyPaidMessage(tenantName);
    const url = buildWhatsAppUrl(popup.supportWhatsapp, message);
    window.open(url, "_blank");
  };

  return (
    <Card className="bg-red-500/10 border-red-500/50 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-xl shrink-0 ${isSuspended ? "bg-red-500/20" : "bg-red-500/15"}`}>
            {isSuspended ? (
              <ShieldAlert className="h-6 w-6 text-red-400" />
            ) : (
              <Clock className="h-6 w-6 text-red-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-bold text-base text-red-100">
                {popup.title || "Mensalidade Atrasada"}
              </h3>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 text-red-400 bg-red-500/10 border-red-500/30"
              >
                {isSuspended ? "Urgente" : "Cobrança"}
              </Badge>
            </div>

            <p className="text-sm leading-relaxed text-red-200/80 mb-4">
              {popup.message ||
                "Sua mensalidade está vencida. Sua loja pode ser suspensa a qualquer momento. Pague agora para evitar a interrupção do serviço."}
            </p>

            {/* PIX Key (if available) */}
            {popup.pixKey && (
              <div className="rounded-lg p-3 border border-red-500/20 bg-red-500/5 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="h-3.5 w-3.5 text-red-300/60" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-red-300/50">
                    Chave PIX
                  </span>
                </div>
                <p className="text-sm font-mono break-all text-red-100">
                  {popup.pixKey}
                </p>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(popup.pixKey!);
                      toast.success("Chave PIX copiada!");
                    } catch {
                      toast.error("Não foi possível copiar");
                    }
                  }}
                  className="mt-2 text-xs font-medium text-red-300 hover:text-red-100 transition-colors underline underline-offset-2"
                >
                  Copiar chave
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Primary: Regularizar Pagamento */}
              <button
                onClick={handleRegularize}
                className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]"
              >
                <CreditCard className="h-4 w-4" />
                Regularizar Pagamento
              </button>

              {/* Secondary: Já realizei o pagamento */}
              <button
                onClick={handleAlreadyPaid}
                className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-red-500/30 text-red-200 hover:bg-red-500/10 active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" />
                Já realizei o pagamento
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// NOTIFICATION TYPE CONFIG
// ============================================

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  billing: { icon: DollarSign, color: "text-amber-400 bg-amber-500/10", label: "Cobrança" },
  system: { icon: Settings, color: "text-blue-400 bg-blue-500/10", label: "Sistema" },
  info: { icon: Info, color: "text-cyan-400 bg-cyan-500/10", label: "Informação" },
  warning: { icon: AlertTriangle, color: "text-red-400 bg-red-500/10", label: "Aviso" },
};

// ============================================
// MAIN PAGE
// ============================================

export default function NotificationsPage() {
  const utils = trpc.useUtils();
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery();

  // Billing popup data for the priority card
  const { data: billingPopup } = trpc.billingPopup.getPopup.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const showBillingCard =
    billingPopup?.type === "overdue" || billingPopup?.type === "suspended";

  const markReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const markAllReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
      toast.success("Todas as notificações marcadas como lidas");
    },
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Agora mesmo";
    if (diffMin < 60) return `${diffMin}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <ClientAdminLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Bell className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Notificações</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {unreadCount > 0
                ? `Você tem ${unreadCount} notificação${unreadCount > 1 ? "ões" : ""} não lida${unreadCount > 1 ? "s" : ""}`
                : "Todas as notificações foram lidas"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Billing Alert Card (fixed at top when overdue/suspended) */}
      {showBillingCard && billingPopup && (
        <BillingAlertCard popup={billingPopup} />
      )}

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-zinc-900 border-zinc-800 animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-zinc-800 rounded w-1/3 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !notifications?.length && !showBillingCard ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-zinc-800 mb-4">
              <BellOff className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-100 mb-1">Nenhuma notificação</h3>
            <p className="text-sm text-zinc-400">Você receberá avisos sobre pagamentos e atualizações aqui</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications?.map(notif => {
            const config = TYPE_CONFIG[notif.type || "info"] || TYPE_CONFIG.info;
            const TypeIcon = config.icon;

            return (
              <Card
                key={notif.id}
                className={`bg-zinc-900 border-zinc-800 transition-all cursor-pointer hover:bg-zinc-800/70 ${
                  !notif.isRead ? "border-l-2 border-l-amber-500" : "opacity-70"
                }`}
                onClick={() => {
                  if (!notif.isRead) {
                    markReadMutation.mutate({ id: notif.id });
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium text-sm ${!notif.isRead ? "text-white" : "text-zinc-400"}`}>
                          {notif.title}
                        </h3>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.color} border-current/20`}>
                          {config.label}
                        </Badge>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${!notif.isRead ? "text-zinc-300" : "text-zinc-500"}`}>
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock className="h-3 w-3 text-zinc-600" />
                        <span className="text-xs text-zinc-600">{formatDate(notif.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
    </ClientAdminLayout>
  );
}
