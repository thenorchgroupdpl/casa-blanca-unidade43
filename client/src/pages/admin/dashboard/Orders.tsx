/**
 * Orders Page - Kanban Board
 * Gestão de Pedidos com colunas de status drag-and-drop
 * Dark mode, warm luxury theme
 */

import { useState, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ClipboardList,
  ChefHat,
  Truck,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  ChevronRight,
  Clock,
  User,
  Phone,
  MapPin,
  Package,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// ============================================
// TYPES & CONSTANTS
// ============================================

type OrderStatus = "novo" | "em_preparacao" | "saiu_entrega" | "concluido" | "cancelado";

interface KanbanColumn {
  id: OrderStatus;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const COLUMNS: KanbanColumn[] = [
  {
    id: "novo",
    title: "Novos",
    icon: <ClipboardList className="w-4 h-4" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    id: "em_preparacao",
    title: "Preparando",
    icon: <ChefHat className="w-4 h-4" />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  {
    id: "saiu_entrega",
    title: "Saiu p/ Entrega",
    icon: <Truck className="w-4 h-4" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    id: "concluido",
    title: "Concluídos",
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  {
    id: "cancelado",
    title: "Cancelados",
    icon: <XCircle className="w-4 h-4" />,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
];

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  novo: ["em_preparacao", "cancelado"],
  em_preparacao: ["saiu_entrega", "cancelado"],
  saiu_entrega: ["concluido"],
  concluido: [],
  cancelado: [],
};

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

function formatTimeAgo(dateStr: string | Date | null): string {
  if (!dateStr) return "";
  try {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch {
    return "";
  }
}

function formatCurrency(value: string | number | null): string {
  if (!value) return "R$ 0,00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `R$ ${num.toFixed(2).replace(".", ",")}`;
}

// ============================================
// COMPONENT
// ============================================

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeView, setActiveView] = useState<"kanban" | "list">("kanban");

  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.orders.list.useQuery();

  const updateStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      utils.orders.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  // Group orders by status
  const ordersByStatus = useMemo(() => {
    const grouped: Record<OrderStatus, any[]> = {
      novo: [],
      em_preparacao: [],
      saiu_entrega: [],
      concluido: [],
      cancelado: [],
    };

    if (!orders) return grouped;

    const filtered = searchQuery
      ? orders.filter(
          (o: any) =>
            o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(o.id).includes(searchQuery)
        )
      : orders;

    filtered.forEach((order: any) => {
      const status = order.status as OrderStatus;
      if (grouped[status]) {
        grouped[status].push(order);
      }
    });

    return grouped;
  }, [orders, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    if (!orders) return { total: 0, novos: 0, preparando: 0, entrega: 0 };
    return {
      total: orders.length,
      novos: orders.filter((o: any) => o.status === "novo").length,
      preparando: orders.filter((o: any) => o.status === "em_preparacao").length,
      entrega: orders.filter((o: any) => o.status === "saiu_entrega").length,
    };
  }, [orders]);

  const handleMoveOrder = useCallback(
    (orderId: number, newStatus: OrderStatus) => {
      updateStatus.mutate({ id: orderId, status: newStatus });
    },
    [updateStatus]
  );

  const handleViewOrder = useCallback((order: any) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  }, []);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pedidos</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Gerencie os pedidos da sua loja
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => utils.orders.list.invalidate()}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-zinc-800">
                <Package className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-zinc-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <ClipboardList className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.novos}</p>
                <p className="text-xs text-zinc-500">Novos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <ChefHat className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.preparando}</p>
                <p className="text-xs text-zinc-500">Preparando</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Truck className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.entrega}</p>
                <p className="text-xs text-zinc-500">Em Entrega</p>
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

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {COLUMNS.map((column) => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              orders={ordersByStatus[column.id]}
              onMoveOrder={handleMoveOrder}
              onViewOrder={handleViewOrder}
              isUpdating={updateStatus.isPending}
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
                  <span className="text-zinc-300">{formatTimeAgo(selectedOrder.createdAt)}</span>
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="text-sm font-medium text-zinc-400 mb-2">Resumo do Pedido</h4>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{selectedOrder.summary}</p>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-sm font-medium text-amber-300">Total</span>
                <span className="text-lg font-bold text-amber-400">
                  {formatCurrency(selectedOrder.totalValue)}
                </span>
              </div>

              {/* Status & Actions */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-400">Alterar Status</h4>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FLOW[selectedOrder.status as OrderStatus]?.map((nextStatus) => {
                    const col = COLUMNS.find((c) => c.id === nextStatus);
                    return (
                      <Button
                        key={nextStatus}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleMoveOrder(selectedOrder.id, nextStatus);
                          setDetailOpen(false);
                        }}
                        className={`border-zinc-700 hover:bg-zinc-800 ${col?.color || "text-zinc-300"}`}
                      >
                        {col?.icon}
                        <span className="ml-1">{getStatusLabel(nextStatus)}</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    );
                  })}
                  {(!STATUS_FLOW[selectedOrder.status as OrderStatus] ||
                    STATUS_FLOW[selectedOrder.status as OrderStatus].length === 0) && (
                    <p className="text-xs text-zinc-500">Este pedido não pode ser movido.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// KANBAN COLUMN COMPONENT
// ============================================

function KanbanColumnComponent({
  column,
  orders,
  onMoveOrder,
  onViewOrder,
  isUpdating,
}: {
  column: KanbanColumn;
  orders: any[];
  onMoveOrder: (orderId: number, newStatus: OrderStatus) => void;
  onViewOrder: (order: any) => void;
  isUpdating: boolean;
}) {
  return (
    <div className={`rounded-xl border ${column.borderColor} ${column.bgColor} p-3 min-h-[300px]`}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 ${column.color}`}>
          {column.icon}
          <span className="font-medium text-sm">{column.title}</span>
        </div>
        <Badge variant="outline" className={`${column.color} border-current text-xs`}>
          {orders.length}
        </Badge>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-zinc-500">Nenhum pedido</p>
          </div>
        ) : (
          orders.map((order: any) => (
            <OrderCard
              key={order.id}
              order={order}
              column={column}
              onMoveOrder={onMoveOrder}
              onViewOrder={onViewOrder}
              isUpdating={isUpdating}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// ORDER CARD COMPONENT
// ============================================

function OrderCard({
  order,
  column,
  onMoveOrder,
  onViewOrder,
  isUpdating,
}: {
  order: any;
  column: KanbanColumn;
  onMoveOrder: (orderId: number, newStatus: OrderStatus) => void;
  onViewOrder: (order: any) => void;
  isUpdating: boolean;
}) {
  const nextStatuses = STATUS_FLOW[order.status as OrderStatus] || [];

  return (
    <div
      className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 cursor-pointer hover:border-zinc-700 transition-colors group"
      onClick={() => onViewOrder(order)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-zinc-500">#{order.id}</span>
        <span className="text-xs text-zinc-500">{formatTimeAgo(order.createdAt)}</span>
      </div>

      {/* Customer */}
      <h4 className="text-sm font-medium text-white truncate">
        {order.customerName || "Cliente"}
      </h4>

      {/* Summary (truncated) */}
      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{order.summary}</p>

      {/* Delivery Zone */}
      {order.deliveryZoneName && (
        <div className="flex items-center gap-1 mt-1.5">
          <MapPin className="w-3 h-3 text-zinc-500" />
          <span className="text-xs text-zinc-500 truncate">{order.deliveryZoneName}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
        <span className="text-sm font-semibold text-amber-400">
          {formatCurrency(order.totalValue)}
        </span>

        {/* Quick action buttons */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {nextStatuses.slice(0, 1).map((nextStatus) => {
            const nextCol = COLUMNS.find((c) => c.id === nextStatus);
            return (
              <button
                key={nextStatus}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveOrder(order.id, nextStatus);
                }}
                disabled={isUpdating}
                className={`p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors ${nextCol?.color || "text-zinc-400"}`}
                title={`Mover para ${getStatusLabel(nextStatus)}`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            );
          })}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewOrder(order);
            }}
            className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-400"
            title="Ver detalhes"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
