import { useState } from "react";
import SuperAdminLayout from "@/components/SuperAdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban,
  Play,
  Send,
  Pencil,
  Bell,
  X,
  Save,
} from "lucide-react";

// ============================================
// STATUS CONFIG
// ============================================

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Ativo", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
  warning: { label: "Em Aviso", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: AlertTriangle },
  overdue: { label: "Vencido", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: Clock },
  suspended: { label: "Suspenso", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", icon: Ban },
};

const STATUS_OPTIONS = [
  { value: "active", label: "Ativo" },
  { value: "warning", label: "Em Aviso" },
  { value: "overdue", label: "Vencido" },
  { value: "suspended", label: "Suspenso" },
];

// ============================================
// TYPES
// ============================================

interface TenantBilling {
  id: number;
  name: string;
  slug: string;
  clientStatus: string | null;
  subscriptionPlan: string | null;
  nextBillingDate: Date | string | null;
  billingAmount: string | null;
  subscriptionStatus: string | null;
}

interface EditModalState {
  tenant: TenantBilling;
  nextBillingDate: string;
  billingAmount: string;
  subscriptionStatus: string;
}

// ============================================
// COMPONENT
// ============================================

export default function BillingPage() {
  const utils = trpc.useUtils();
  const { data: tenants, isLoading } = trpc.billing.listTenants.useQuery();

  // Mutations
  const updateDateMutation = trpc.billing.updateBillingDate.useMutation({
    onSuccess: () => {
      utils.billing.listTenants.invalidate();
      toast.success("Data de vencimento atualizada");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateAmountMutation = trpc.billing.updateBillingAmount.useMutation({
    onSuccess: () => {
      utils.billing.listTenants.invalidate();
      toast.success("Valor atualizado");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatusMutation = trpc.billing.updateSubscriptionStatus.useMutation({
    onSuccess: () => {
      utils.billing.listTenants.invalidate();
      toast.success("Status atualizado");
    },
    onError: (err) => toast.error(err.message),
  });

  const runCheckMutation = trpc.billing.runBillingCheck.useMutation({
    onSuccess: (result) => {
      utils.billing.listTenants.invalidate();
      toast.success(`Verificação concluída: ${result.notified} notificados, ${result.skipped} já notificados hoje`);
    },
    onError: (err) => toast.error(err.message),
  });

  const sendNotifMutation = trpc.billing.sendNotification.useMutation({
    onSuccess: () => {
      toast.success("Notificação enviada com sucesso! O lojista verá no painel dele.");
      setNotifDialog(null);
    },
    onError: (err) => toast.error(err.message),
  });

  // State
  const [editModal, setEditModal] = useState<EditModalState | null>(null);
  const [notifDialog, setNotifDialog] = useState<{ tenantId: number; tenantName: string } | null>(null);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState<"billing" | "system" | "info" | "warning">("billing");

  // Stats
  const activeCount = tenants?.filter(t => t.subscriptionStatus === "active").length ?? 0;
  const warningCount = tenants?.filter(t => t.subscriptionStatus === "warning").length ?? 0;
  const overdueCount = tenants?.filter(t => t.subscriptionStatus === "overdue").length ?? 0;
  const suspendedCount = tenants?.filter(t => t.subscriptionStatus === "suspended").length ?? 0;

  // Helpers
  const formatCurrency = (value: string | null) => {
    const num = parseFloat(value || "0");
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
  };

  const formatDate = (date: Date | string | null): string => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDaysUntil = (date: Date | string | null) => {
    if (!date) return null;
    const now = new Date();
    const due = new Date(date);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const toISODate = (date: Date | string | null): string => {
    if (!date) return new Date().toISOString().split("T")[0];
    return new Date(date).toISOString().split("T")[0];
  };

  // Open edit modal
  const openEditModal = (tenant: TenantBilling) => {
    setEditModal({
      tenant,
      nextBillingDate: toISODate(tenant.nextBillingDate),
      billingAmount: tenant.billingAmount || "150.00",
      subscriptionStatus: tenant.subscriptionStatus || "active",
    });
  };

  // Save all fields from edit modal
  const handleSaveEdit = async () => {
    if (!editModal) return;
    const { tenant, nextBillingDate, billingAmount, subscriptionStatus } = editModal;

    try {
      await Promise.all([
        updateDateMutation.mutateAsync({ tenantId: tenant.id, nextBillingDate }),
        updateAmountMutation.mutateAsync({ tenantId: tenant.id, billingAmount }),
        updateStatusMutation.mutateAsync({
          tenantId: tenant.id,
          status: subscriptionStatus as "active" | "warning" | "overdue" | "suspended",
        }),
      ]);
      toast.success(`Dados de "${tenant.name}" atualizados com sucesso`);
      setEditModal(null);
    } catch {
      // Individual mutation errors are already handled by onError
    }
  };

  // Open notify dialog — simple manual notification
  const openNotifyDialog = (tenant: TenantBilling) => {
    const daysLeft = getDaysUntil(tenant.nextBillingDate);
    const formattedDate = formatDate(tenant.nextBillingDate) || "não definida";

    setNotifDialog({ tenantId: tenant.id, tenantName: tenant.name });
    setNotifTitle("Lembrete de Pagamento");
    setNotifMessage(
      `Olá ${tenant.name}! Seu vencimento é ${formattedDate !== "" ? `no dia ${formattedDate}` : "não definido"}${daysLeft !== null ? ` (${daysLeft} dia${daysLeft !== 1 ? "s" : ""})` : ""}. Por favor, regularize seu pagamento para manter sua loja ativa.`
    );
    setNotifType("billing");
  };

  const isSaving = updateDateMutation.isPending || updateAmountMutation.isPending || updateStatusMutation.isPending;

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Gestão Financeira</h1>
            <p className="text-sm text-zinc-400 mt-1">Controle de vencimentos e notificações de cobrança</p>
          </div>
          <Button
            onClick={() => runCheckMutation.mutate()}
            disabled={runCheckMutation.isPending}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            <Play className="h-4 w-4 mr-2" />
            {runCheckMutation.isPending ? "Processando..." : "Executar Régua"}
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900/60 border-zinc-800/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{activeCount}</p>
                  <p className="text-xs text-zinc-400">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/60 border-zinc-800/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{warningCount}</p>
                  <p className="text-xs text-zinc-400">Em Aviso</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/60 border-zinc-800/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Clock className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{overdueCount}</p>
                  <p className="text-xs text-zinc-400">Vencidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/60 border-zinc-800/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-500/10">
                  <Ban className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{suspendedCount}</p>
                  <p className="text-xs text-zinc-400">Suspensos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tenants Table */}
        <Card className="bg-zinc-900/60 border-zinc-800/60">
          <CardHeader>
            <CardTitle className="text-white text-lg">Lojistas</CardTitle>
            <CardDescription className="text-zinc-400">
              Gerencie vencimentos e status de assinatura de cada lojista
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : !tenants?.length ? (
              <p className="text-zinc-500 text-center py-8">Nenhum lojista cadastrado</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-3 text-zinc-400 font-medium">Lojista</th>
                      <th className="text-left py-3 px-3 text-zinc-400 font-medium">Status</th>
                      <th className="text-left py-3 px-3 text-zinc-400 font-medium">Próx. Vencimento</th>
                      <th className="text-left py-3 px-3 text-zinc-400 font-medium">Valor</th>
                      <th className="text-right py-3 px-3 text-zinc-400 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map(tenant => {
                      const statusInfo = STATUS_MAP[tenant.subscriptionStatus || "active"];
                      const StatusIcon = statusInfo.icon;
                      const daysUntil = getDaysUntil(tenant.nextBillingDate);
                      const hasDate = !!tenant.nextBillingDate;

                      return (
                        <tr key={tenant.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                          {/* Lojista */}
                          <td className="py-3 px-3">
                            <div>
                              <p className="font-medium text-white">{tenant.name}</p>
                              <p className="text-xs text-zinc-500">/{tenant.slug}</p>
                            </div>
                          </td>

                          {/* Status — clean badge only */}
                          <td className="py-3 px-3">
                            <Badge variant="outline" className={`${statusInfo.color} text-xs`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </td>

                          {/* Próx. Vencimento */}
                          <td className="py-3 px-3">
                            {hasDate ? (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                                <span className="text-white">{formatDate(tenant.nextBillingDate)}</span>
                                {daysUntil !== null && daysUntil <= 5 && daysUntil >= 0 && (
                                  <span className={`text-xs font-semibold ml-1 ${daysUntil <= 1 ? "text-red-400" : "text-amber-400"}`}>
                                    ({daysUntil}d)
                                  </span>
                                )}
                                {daysUntil !== null && daysUntil < 0 && (
                                  <span className="text-xs font-semibold ml-1 text-red-400">
                                    (vencido)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => openEditModal(tenant)}
                                className="flex items-center gap-1.5 text-amber-400/70 hover:text-amber-400 transition-colors text-xs"
                              >
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="underline underline-offset-2">Definir data</span>
                              </button>
                            )}
                          </td>

                          {/* Valor */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                              <span className="text-white">
                                {tenant.billingAmount ? formatCurrency(tenant.billingAmount) : (
                                  <span className="text-zinc-500 italic">Não definido</span>
                                )}
                              </span>
                            </div>
                          </td>

                          {/* Ações */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                      onClick={() => openEditModal(tenant)}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-zinc-800 text-white border-zinc-700">
                                    Editar dados de cobrança
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10"
                                      onClick={() => openNotifyDialog(tenant)}
                                    >
                                      <Send className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-zinc-800 text-white border-zinc-700">
                                    Enviar notificação
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* MODAL: Editar Dados de Cobrança */}
        {/* ============================================ */}
        <Dialog open={!!editModal} onOpenChange={(open) => !open && setEditModal(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-amber-400" />
                Editar Cobrança
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Configurar dados de cobrança de{" "}
                <span className="text-white font-medium">{editModal?.tenant.name}</span>
              </DialogDescription>
            </DialogHeader>

            {editModal && (
              <div className="space-y-5 py-2">
                {/* Data de Vencimento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-400" />
                    Próximo Vencimento
                  </label>
                  <Input
                    type="date"
                    value={editModal.nextBillingDate}
                    onChange={(e) => setEditModal({ ...editModal, nextBillingDate: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white h-10"
                  />
                  <p className="text-xs text-zinc-500">
                    Data em que o lojista será cobrado pela próxima mensalidade
                  </p>
                </div>

                {/* Valor da Recorrência */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    Valor da Recorrência (R$)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editModal.billingAmount}
                    onChange={(e) => setEditModal({ ...editModal, billingAmount: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white h-10"
                    placeholder="150.00"
                  />
                  <p className="text-xs text-zinc-500">
                    Valor mensal cobrado do lojista (ex: 150.00)
                  </p>
                </div>

                {/* Status da Assinatura */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-400" />
                    Status da Assinatura
                  </label>
                  <Select
                    value={editModal.subscriptionStatus}
                    onValueChange={(val) => setEditModal({ ...editModal, subscriptionStatus: val })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-10">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                opt.value === "active" ? "bg-emerald-400" :
                                opt.value === "warning" ? "bg-amber-400" :
                                opt.value === "overdue" ? "bg-red-400" :
                                "bg-zinc-400"
                              }`}
                            />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-zinc-500">
                    Ativo = em dia &bull; Em Aviso = próximo do vencimento &bull; Vencido = não pagou &bull; Suspenso = loja desativada
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setEditModal(null)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4 mr-1.5" />
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                <Save className="h-4 w-4 mr-1.5" />
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================ */}
        {/* MODAL: Enviar Notificação Manual */}
        {/* ============================================ */}
        <Dialog open={!!notifDialog} onOpenChange={(open) => !open && setNotifDialog(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-400" />
                Enviar Notificação
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Enviar notificação para <span className="text-white font-medium">{notifDialog?.tenantName}</span>.
                O lojista verá essa notificação no painel dele.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Tipo</label>
                <Select value={notifType} onValueChange={(v) => setNotifType(v as typeof notifType)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="billing">Cobrança</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                    <SelectItem value="info">Informação</SelectItem>
                    <SelectItem value="warning">Aviso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Título</label>
                <Input
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="Ex: Lembrete de pagamento"
                  className="bg-zinc-800 border-zinc-700 text-white h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Mensagem</label>
                <Textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Digite a mensagem da notificação..."
                  className="min-h-[120px] bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setNotifDialog(null)} className="text-zinc-400 hover:text-white">
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (!notifDialog || !notifTitle.trim() || !notifMessage.trim()) {
                    toast.error("Preencha título e mensagem");
                    return;
                  }
                  sendNotifMutation.mutate({
                    tenantId: notifDialog.tenantId,
                    title: notifTitle,
                    message: notifMessage,
                    type: notifType,
                  });
                }}
                disabled={sendNotifMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                <Send className="h-4 w-4 mr-1.5" />
                {sendNotifMutation.isPending ? "Enviando..." : "Enviar Notificação"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
}
