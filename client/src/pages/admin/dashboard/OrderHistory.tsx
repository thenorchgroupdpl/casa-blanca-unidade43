/**
 * Order History Page
 * Histórico de pedidos agrupados por data
 * Exclusão individual e em massa (relatório do dia)
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import ClientAdminLayout from "@/components/ClientAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  History,
  Search,
  ChevronDown,
  ChevronRight,
  Trash2,
  AlertTriangle,
  Package,
  User,
  Phone,
  MapPin,
  Clock,
  Loader2,
  CalendarDays,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ============================================
// TYPES
// ============================================

type OrderStatus = "novo" | "em_preparacao" | "saiu_entrega" | "concluido" | "cancelado";

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    novo: "Novo",
    em_preparacao: "Preparando",
    saiu_entrega: "Saiu p/ Entrega",
    concluido: "Concluído",
    cancelado: "Cancelado",
  };
  return labels[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    novo: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    em_preparacao: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    saiu_entrega: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    concluido: "text-green-400 bg-green-500/10 border-green-500/30",
    cancelado: "text-red-400 bg-red-500/10 border-red-500/30",
  };
  return colors[status] || "text-zinc-400 bg-zinc-500/10 border-zinc-500/30";
}

function formatCurrency(value: string | number | null): string {
  if (!value) return "R$ 0,00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `R$ ${num.toFixed(2).replace(".", ",")}`;
}

interface DayGroup {
  date: string; // YYYY-MM-DD
  label: string; // "26/02/2026 - Quinta-feira"
  orders: any[];
  totalRevenue: number;
  orderCount: number;
}

// ============================================
// COMPONENT
// ============================================

export default function OrderHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmDeleteDay, setConfirmDeleteDay] = useState<string | null>(null);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.orders.history.useQuery();

  const deleteOrder = trpc.orders.delete.useMutation({
    onSuccess: () => {
      toast.success("Pedido excluído!");
      utils.orders.history.invalidate();
      setConfirmDeleteOrder(null);
      setDetailOpen(false);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteByDate = trpc.orders.deleteByDate.useMutation({
    onSuccess: () => {
      toast.success("Relatório do dia excluído!");
      utils.orders.history.invalidate();
      setConfirmDeleteDay(null);
    },
    onError: (error: any) => toast.error(error.message),
  });

  // Group orders by date
  const dayGroups: DayGroup[] = useMemo(() => {
    if (!orders) return [];

    // Filter by search
    const filtered = searchQuery
      ? orders.filter(
          (o: any) =>
            o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(o.id).includes(searchQuery)
        )
      : orders;

    // Group by date (local timezone)
    const groups = new Map<string, any[]>();
    filtered.forEach((order: any) => {
      const date = new Date(order.createdAt);
      const dateKey = format(date, "yyyy-MM-dd");
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(order);
    });

    // Convert to array and sort by date descending
    return Array.from(groups.entries())
      .map(([dateKey, dayOrders]) => {
        const date = new Date(dateKey + "T12:00:00");
        return {
          date: dateKey,
          label: format(date, "dd/MM/yyyy - EEEE", { locale: ptBR }),
          orders: dayOrders.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
          totalRevenue: dayOrders
            .filter((o: any) => o.status !== "cancelado")
            .reduce(
              (sum: number, o: any) =>
                sum + (parseFloat(o.totalValue) || 0),
              0
            ),
          orderCount: dayOrders.length,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [orders, searchQuery]);

  // Toggle day expansion
  function toggleDay(date: string) {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  }

  // Stats
  const stats = useMemo(() => {
    if (!orders) return { totalOrders: 0, totalDays: 0, totalRevenue: 0 };
    const nonCancelled = orders.filter((o: any) => o.status !== "cancelado");
    return {
      totalOrders: orders.length,
      totalDays: dayGroups.length,
      totalRevenue: nonCancelled.reduce(
        (sum: number, o: any) => sum + (parseFloat(o.totalValue) || 0),
        0
      ),
    };
  }, [orders, dayGroups]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <ClientAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <History className="w-6 h-6 text-amber-400" />
              Histórico de Pedidos
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Todos os pedidos da sua loja, agrupados por data
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Package className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                  <p className="text-xs text-zinc-500">Total de Pedidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <CalendarDays className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalDays}</p>
                  <p className="text-xs text-zinc-500">Dias com Pedidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Package className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-zinc-500">Faturamento Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Buscar por nome, pedido ou resumo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>

        {/* Day Groups */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : dayGroups.length === 0 ? (
          <div className="text-center py-20">
            <History className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-zinc-400">Nenhum pedido encontrado</h3>
            <p className="text-sm text-zinc-500 mt-1">
              {searchQuery ? "Tente uma busca diferente" : "Os pedidos aparecerão aqui conforme forem criados"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayGroups.map((group) => (
              <DayGroupCard
                key={group.date}
                group={group}
                isExpanded={expandedDays.has(group.date)}
                onToggle={() => toggleDay(group.date)}
                onViewOrder={(order) => {
                  setSelectedOrder(order);
                  setConfirmDeleteOrder(null);
                  setDetailOpen(true);
                }}
                onDeleteOrder={(orderId) => {
                  if (window.confirm("Tem certeza que deseja excluir este pedido? Esta ação é permanente.")) {
                    deleteOrder.mutate({ id: orderId });
                  }
                }}
                onDeleteDay={() => setConfirmDeleteDay(group.date)}
                isDeleting={deleteOrder.isPending || deleteByDate.isPending}
              />
            ))}
          </div>
        )}

        {/* Order Detail Modal */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                Pedido #{selectedOrder?.id}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="p-4 rounded-lg bg-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-300">{selectedOrder.customerName || "—"}</span>
                  </div>
                  {selectedOrder.customerPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-300">{selectedOrder.customerPhone}</span>
                    </div>
                  )}
                  {selectedOrder.deliveryZoneName && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-300">
                        {selectedOrder.deliveryZoneName}
                        {selectedOrder.deliveryFee && ` (${formatCurrency(selectedOrder.deliveryFee)})`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-300">
                      {format(new Date(selectedOrder.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="p-4 rounded-lg bg-zinc-800">
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Resumo do Pedido</h4>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">{selectedOrder.summary}</p>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Status</span>
                  <Badge variant="outline" className={getStatusColor(selectedOrder.status)}>
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="text-sm font-medium text-amber-300">Total</span>
                  <span className="text-lg font-bold text-amber-400">
                    {formatCurrency(selectedOrder.totalValue)}
                  </span>
                </div>

                {/* Delete Button */}
                <div className="pt-2 border-t border-zinc-800">
                  {confirmDeleteOrder !== selectedOrder.id ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDeleteOrder(selectedOrder.id)}
                      className="w-full border-zinc-700 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Pedido
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-300">Tem certeza? Esta ação é permanente.</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmDeleteOrder(null)}
                          className="flex-1 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                        >
                          Não, manter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteOrder.mutate({ id: selectedOrder.id })}
                          disabled={deleteOrder.isPending}
                          className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20 bg-red-500/10"
                        >
                          {deleteOrder.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Sim, excluir
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Confirm Delete Day Dialog */}
        <Dialog open={!!confirmDeleteDay} onOpenChange={() => setConfirmDeleteDay(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Excluir Relatório do Dia
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-300">
                  Tem certeza que deseja excluir <strong>todos os pedidos</strong> do dia{" "}
                  <strong>
                    {confirmDeleteDay
                      ? format(new Date(confirmDeleteDay + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })
                      : ""}
                  </strong>
                  ? Esta ação é permanente e não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDeleteDay(null)}
                  className="flex-1 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                >
                  Cancelar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirmDeleteDay) {
                      deleteByDate.mutate({ date: confirmDeleteDay });
                    }
                  }}
                  disabled={deleteByDate.isPending}
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20 bg-red-500/10"
                >
                  {deleteByDate.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Excluir Tudo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ClientAdminLayout>
  );
}

// ============================================
// DAY GROUP CARD
// ============================================

function DayGroupCard({
  group,
  isExpanded,
  onToggle,
  onViewOrder,
  onDeleteOrder,
  onDeleteDay,
  isDeleting,
}: {
  group: DayGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onViewOrder: (order: any) => void;
  onDeleteOrder: (orderId: number) => void;
  onDeleteDay: () => void;
  isDeleting: boolean;
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
      {/* Day Header - Clickable */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          )}
          <div>
            <h3 className="text-sm font-medium text-white capitalize">
              Relatório de {group.label}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {group.orderCount} pedido{group.orderCount !== 1 ? "s" : ""} · Faturamento:{" "}
              <span className="text-amber-400">{formatCurrency(group.totalRevenue)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-zinc-400 border-zinc-700 text-xs">
            {group.orderCount}
          </Badge>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-zinc-800">
          {/* Delete Day Button */}
          <div className="px-4 pt-3 pb-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteDay();
              }}
              disabled={isDeleting}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Excluir Relatório do Dia
            </Button>
          </div>

          {/* Orders Table */}
          <div className="px-4 pb-4">
            <div className="rounded-lg border border-zinc-800 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-zinc-800/50 text-xs font-medium text-zinc-500">
                <div className="col-span-1">#</div>
                <div className="col-span-2">Hora</div>
                <div className="col-span-3">Cliente</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Valor</div>
                <div className="col-span-2 text-right">Ações</div>
              </div>

              {/* Table Rows */}
              {group.orders.map((order: any) => (
                <div
                  key={order.id}
                  className="grid grid-cols-12 gap-2 px-3 py-2.5 border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors items-center"
                >
                  <div className="col-span-1 text-xs font-mono text-zinc-500">
                    {order.id}
                  </div>
                  <div className="col-span-2 text-xs text-zinc-400">
                    {format(new Date(order.createdAt), "HH:mm")}
                  </div>
                  <div className="col-span-3 text-sm text-white truncate">
                    {order.customerName || "—"}
                  </div>
                  <div className="col-span-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-sm text-amber-400 font-medium text-right">
                    {formatCurrency(order.totalValue)}
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
                    <button
                      onClick={() => onViewOrder(order)}
                      className="p-1.5 rounded-md hover:bg-zinc-700 transition-colors text-zinc-400"
                      title="Ver detalhes"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteOrder(order.id)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-md hover:bg-red-900/50 transition-colors text-zinc-500 hover:text-red-400"
                      title="Excluir pedido"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
