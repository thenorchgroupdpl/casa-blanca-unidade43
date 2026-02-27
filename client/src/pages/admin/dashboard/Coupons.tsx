/**
 * Coupons Page - Marketing
 * Gestão de cupons de desconto para a loja
 * Dark mode, warm luxury theme
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import ClientAdminLayout from "@/components/ClientAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Ticket,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Percent,
  Calendar,
  Hash,
  ToggleLeft,
  Search,
} from "lucide-react";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

interface CouponFormData {
  code: string;
  discountPercentage: string;
  isActive: boolean;
  expiresAt: string; // ISO date string or ""
  usageLimit: string; // number as string or ""
}

const defaultCouponForm: CouponFormData = {
  code: "",
  discountPercentage: "",
  isActive: true,
  expiresAt: "",
  usageLimit: "",
};

// ============================================
// COMPONENT
// ============================================

export default function CouponsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CouponFormData>(defaultCouponForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const utils = trpc.useUtils();
  const { data: coupons, isLoading } = trpc.coupons.list.useQuery();

  const createCoupon = trpc.coupons.create.useMutation({
    onSuccess: () => {
      toast.success("Cupom criado com sucesso!");
      utils.coupons.list.invalidate();
      closeDialog();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateCoupon = trpc.coupons.update.useMutation({
    onSuccess: () => {
      toast.success("Cupom atualizado!");
      utils.coupons.list.invalidate();
      closeDialog();
    },
    onError: (error) => toast.error(error.message),
  });

  const toggleActive = trpc.coupons.toggleActive.useMutation({
    onSuccess: (data) => {
      toast.success(data.isActive ? "Cupom ativado!" : "Cupom desativado!");
      utils.coupons.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteCoupon = trpc.coupons.delete.useMutation({
    onSuccess: () => {
      toast.success("Cupom excluído!");
      utils.coupons.list.invalidate();
      setDeleteId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(defaultCouponForm);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultCouponForm);
    setDialogOpen(true);
  };

  const openEdit = (coupon: any) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      discountPercentage: String(Number(coupon.discountPercentage)),
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split("T")[0]
        : "",
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const code = form.code.trim().toUpperCase();
    if (!code) {
      toast.error("Código do cupom é obrigatório");
      return;
    }
    if (code.length < 2) {
      toast.error("Código deve ter pelo menos 2 caracteres");
      return;
    }

    const discount = parseFloat(form.discountPercentage);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      toast.error("Desconto deve ser entre 0.01% e 100%");
      return;
    }

    const usageLimit = form.usageLimit ? parseInt(form.usageLimit) : null;
    if (form.usageLimit && (isNaN(usageLimit!) || usageLimit! < 1)) {
      toast.error("Limite de uso deve ser pelo menos 1");
      return;
    }

    const expiresAt = form.expiresAt || null;

    if (editingId) {
      updateCoupon.mutate({
        id: editingId,
        code,
        discountPercentage: discount,
        isActive: form.isActive,
        expiresAt,
        usageLimit,
      });
    } else {
      createCoupon.mutate({
        code,
        discountPercentage: discount,
        isActive: form.isActive,
        expiresAt,
        usageLimit,
      });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Código "${code}" copiado!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCouponStatus = (coupon: any) => {
    if (!coupon.isActive) return { label: "Inativo", variant: "secondary" as const, color: "text-zinc-400" };
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { label: "Expirado", variant: "destructive" as const, color: "text-red-400" };
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { label: "Esgotado", variant: "outline" as const, color: "text-orange-400" };
    }
    return { label: "Ativo", variant: "default" as const, color: "text-emerald-400" };
  };

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    if (!coupons) return [];
    if (!searchTerm.trim()) return coupons;
    const term = searchTerm.toUpperCase().trim();
    return coupons.filter((c: any) => c.code.includes(term));
  }, [coupons, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    if (!coupons) return { total: 0, active: 0, expired: 0, totalUsage: 0 };
    return {
      total: coupons.length,
      active: coupons.filter((c: any) => {
        const status = getCouponStatus(c);
        return status.label === "Ativo";
      }).length,
      expired: coupons.filter((c: any) => {
        const status = getCouponStatus(c);
        return status.label === "Expirado" || status.label === "Esgotado";
      }).length,
      totalUsage: coupons.reduce((sum: number, c: any) => sum + (c.usageCount || 0), 0),
    };
  }, [coupons]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <ClientAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Cupons de Desconto</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Crie e gerencie cupons promocionais para sua loja
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cupom
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Ticket className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Total</p>
                  <p className="text-xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ToggleLeft className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Ativos</p>
                  <p className="text-xl font-bold text-white">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Expirados</p>
                  <p className="text-xl font-bold text-white">{stats.expired}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Hash className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Usos Totais</p>
                  <p className="text-xl font-bold text-white">{stats.totalUsage}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar por código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-amber-500/50"
          />
        </div>

        {/* Coupons List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-zinc-900 border-zinc-800 animate-pulse">
                <CardContent className="p-4">
                  <div className="h-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCoupons.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-12 text-center">
              <Ticket className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                {searchTerm ? "Nenhum cupom encontrado" : "Nenhum cupom cadastrado"}
              </h3>
              <p className="text-zinc-400 text-sm mb-6">
                {searchTerm
                  ? "Tente buscar com outro código"
                  : "Crie seu primeiro cupom de desconto para atrair mais clientes"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={openCreate}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Cupom
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredCoupons.map((coupon: any) => {
              const status = getCouponStatus(coupon);
              return (
                <Card
                  key={coupon.id}
                  className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Code & Discount */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="flex items-center gap-2 group"
                            title="Clique para copiar"
                          >
                            <span className="font-mono text-lg font-bold text-amber-500 tracking-wider">
                              {coupon.code}
                            </span>
                            {copiedCode === coupon.code ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                            )}
                          </button>
                          <Badge
                            variant={status.variant}
                            className={`text-xs ${
                              status.label === "Ativo"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : status.label === "Expirado"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : status.label === "Esgotado"
                                ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                : "bg-zinc-800 text-zinc-400 border-zinc-700"
                            }`}
                          >
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Percent className="h-3.5 w-3.5" />
                            {Number(coupon.discountPercentage)}% de desconto
                          </span>
                          {coupon.expiresAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Expira em{" "}
                              {new Date(coupon.expiresAt).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Hash className="h-3.5 w-3.5" />
                            {coupon.usageCount} uso{coupon.usageCount !== 1 ? "s" : ""}
                            {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Switch
                          checked={coupon.isActive}
                          onCheckedChange={() => toggleActive.mutate({ id: coupon.id })}
                          className="data-[state=checked]:bg-amber-500"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEdit(coupon)}
                          className="h-9 w-9 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteId(coupon.id)}
                          className="h-9 w-9 border-zinc-700 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingId ? "Editar Cupom" : "Novo Cupom"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Code */}
              <div className="space-y-2">
                <Label className="text-zinc-300">Código do Cupom *</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  placeholder="Ex: PROMO10"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 font-mono tracking-wider uppercase"
                  maxLength={50}
                />
                <p className="text-xs text-zinc-500">
                  O código será convertido automaticamente para maiúsculas
                </p>
              </div>

              {/* Discount Percentage */}
              <div className="space-y-2">
                <Label className="text-zinc-300">Desconto (%) *</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.discountPercentage}
                    onChange={(e) =>
                      setForm({ ...form, discountPercentage: e.target.value })
                    }
                    placeholder="Ex: 10"
                    min="0.01"
                    max="100"
                    step="0.01"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-8"
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-300">Ativo</Label>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Cupom disponível para uso
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, isActive: checked })
                  }
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>

              {/* Expiration Date (optional) */}
              <div className="space-y-2">
                <Label className="text-zinc-300">
                  Data de Expiração{" "}
                  <span className="text-zinc-500 font-normal">(opcional)</span>
                </Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white [color-scheme:dark]"
                />
                {form.expiresAt && (
                  <button
                    onClick={() => setForm({ ...form, expiresAt: "" })}
                    className="text-xs text-amber-500 hover:text-amber-400"
                  >
                    Remover data de expiração
                  </button>
                )}
              </div>

              {/* Usage Limit (optional) */}
              <div className="space-y-2">
                <Label className="text-zinc-300">
                  Limite de Usos{" "}
                  <span className="text-zinc-500 font-normal">(opcional)</span>
                </Label>
                <Input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) =>
                    setForm({ ...form, usageLimit: e.target.value })
                  }
                  placeholder="Ilimitado"
                  min="1"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
                {form.usageLimit && (
                  <button
                    onClick={() => setForm({ ...form, usageLimit: "" })}
                    className="text-xs text-amber-500 hover:text-amber-400"
                  >
                    Remover limite de usos
                  </button>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={closeDialog}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createCoupon.isPending || updateCoupon.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                {createCoupon.isPending || updateCoupon.isPending
                  ? "Salvando..."
                  : editingId
                  ? "Salvar Alterações"
                  : "Criar Cupom"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteId !== null}
          onOpenChange={() => setDeleteId(null)}
        >
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Excluir Cupom
              </DialogTitle>
            </DialogHeader>
            <p className="text-zinc-400 text-sm">
              Tem certeza que deseja excluir este cupom? Esta ação não pode ser
              desfeita.
            </p>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => deleteId && deleteCoupon.mutate({ id: deleteId })}
                disabled={deleteCoupon.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteCoupon.isPending ? "Excluindo..." : "Excluir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ClientAdminLayout>
  );
}
