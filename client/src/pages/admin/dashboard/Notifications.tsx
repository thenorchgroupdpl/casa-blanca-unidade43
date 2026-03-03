import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import ClientAdminLayout from "@/components/ClientAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
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
  Webhook,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
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
          <div className={`p-3 rounded-xl shrink-0 ${isSuspended ? "bg-red-500/20" : "bg-red-500/15"}`}>
            {isSuspended ? (
              <ShieldAlert className="h-6 w-6 text-red-400" />
            ) : (
              <Clock className="h-6 w-6 text-red-400" />
            )}
          </div>
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
            {popup.pixKey && (
              <div className="rounded-lg p-3 border border-red-500/20 bg-red-500/5 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="h-3.5 w-3.5 text-red-300/60" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-red-300/50">
                    Chave PIX
                  </span>
                </div>
                <p className="text-sm font-mono break-all text-red-100">{popup.pixKey}</p>
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
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleRegularize}
                className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]"
              >
                <CreditCard className="h-4 w-4" />
                Regularizar Pagamento
              </button>
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
// WEBHOOK CONFIG COMPONENT
// ============================================

function WebhookConfigSection() {
  const utils = trpc.useUtils();
  const { data: config, isLoading } = trpc.store.getWebhookConfig.useQuery();

  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testError, setTestError] = useState("");

  // Sync local state with server data
  useEffect(() => {
    if (config) {
      setWebhookUrl(config.webhookUrl || "");
      setWebhookEnabled(config.webhookEnabled);
      setHasChanges(false);
    }
  }, [config]);

  const updateMutation = trpc.store.updateWebhookConfig.useMutation({
    onSuccess: () => {
      utils.store.getWebhookConfig.invalidate();
      toast.success("Configuração de webhook salva!");
      setHasChanges(false);
    },
    onError: (err) => {
      toast.error(`Erro ao salvar: ${err.message}`);
    },
  });

  const testMutation = trpc.store.testWebhook.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        setTestStatus("success");
        toast.success("Webhook testado com sucesso! Verifique seu dispositivo.");
      } else {
        setTestStatus("error");
        setTestError(result.error || "Erro desconhecido");
        toast.error(`Falha no teste: ${result.error}`);
      }
      setTimeout(() => setTestStatus("idle"), 5000);
    },
    onError: (err) => {
      setTestStatus("error");
      setTestError(err.message);
      toast.error(`Erro: ${err.message}`);
      setTimeout(() => setTestStatus("idle"), 5000);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ webhookUrl, webhookEnabled });
  };

  const handleTest = () => {
    if (!webhookUrl) {
      toast.error("Insira a URL do webhook antes de testar");
      return;
    }
    try {
      new URL(webhookUrl);
    } catch {
      toast.error("URL inválida. Verifique o formato.");
      return;
    }
    setTestStatus("loading");
    setTestError("");
    testMutation.mutate({ webhookUrl });
  };

  const handleUrlChange = (value: string) => {
    setWebhookUrl(value);
    setHasChanges(true);
  };

  const handleToggle = (checked: boolean) => {
    setWebhookEnabled(checked);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800 animate-pulse">
        <CardContent className="p-6">
          <div className="h-5 bg-zinc-800 rounded w-1/3 mb-4" />
          <div className="h-10 bg-zinc-800 rounded w-full mb-3" />
          <div className="h-4 bg-zinc-800 rounded w-2/3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Webhook className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Webhook de Pedidos</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Receba notificações push a cada novo pedido
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">
                {webhookEnabled ? "Ativo" : "Inativo"}
              </span>
              <Switch
                checked={webhookEnabled}
                onCheckedChange={handleToggle}
              />
            </div>
          </div>
        </div>

        {/* Config Body */}
        <div className="p-5 space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
              URL do Endpoint
            </label>
            <Input
              value={webhookUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://api.pushcut.io/..."
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 font-mono text-sm"
            />
            <p className="text-xs text-zinc-500 leading-relaxed">
              Cole a URL do seu webhook (ex: Pushcut, Make, Zapier, n8n). A cada novo pedido, enviaremos um POST com os dados do pedido.
            </p>
          </div>

          {/* Pushcut Helper */}
          <div className="rounded-lg p-3 border border-violet-500/20 bg-violet-500/5">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
              <div className="text-xs text-violet-300/80 leading-relaxed">
                <span className="font-semibold text-violet-300">Usando Pushcut?</span>{" "}
                Crie uma notificação no app, copie o webhook URL e cole aqui. Você receberá uma push notification no iPhone a cada novo pedido.{" "}
                <a
                  href="https://www.pushcut.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 underline underline-offset-2 inline-flex items-center gap-0.5"
                >
                  pushcut.io <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Payload Preview */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Exemplo de Payload
            </label>
            <pre className="rounded-lg p-3 bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 font-mono overflow-x-auto leading-relaxed">
{`{
  "event": "new_order",
  "title": "Novo Pedido #42",
  "text": "João Silva — R$ 89.90",
  "order": {
    "id": 42,
    "customerName": "João Silva",
    "summary": "2x Pizza Margherita, 1x Coca",
    "totalValue": "89.90",
    "deliveryZone": "Centro",
    "deliveryFee": "5.00"
  },
  "timestamp": "2026-03-03T18:00:00Z"
}`}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700 text-white"
              size="sm"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
              )}
              Salvar
            </Button>

            <Button
              onClick={handleTest}
              disabled={!webhookUrl || testMutation.isPending}
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
            >
              {testMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : testStatus === "success" ? (
                <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-400" />
              ) : testStatus === "error" ? (
                <XCircle className="h-4 w-4 mr-1.5 text-red-400" />
              ) : (
                <Send className="h-4 w-4 mr-1.5" />
              )}
              {testStatus === "success"
                ? "Enviado!"
                : testStatus === "error"
                  ? "Falhou"
                  : "Testar Webhook"}
            </Button>
          </div>

          {/* Test Error Message */}
          {testStatus === "error" && testError && (
            <div className="rounded-lg p-3 border border-red-500/20 bg-red-500/5">
              <p className="text-xs text-red-300">
                <span className="font-semibold">Erro:</span> {testError}
              </p>
            </div>
          )}
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

      {/* Webhook Configuration */}
      <WebhookConfigSection />

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
                    <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
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
