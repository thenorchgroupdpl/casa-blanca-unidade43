/**
 * Orders Page - Kanban Board
 * Gestão de Pedidos com colunas de status drag-and-drop
 * Dark mode, warm luxury theme
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import ClientAdminLayout from "@/components/ClientAdminLayout";
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
  ArrowLeft,
  Plus,
  Minus,
  Ban,
  Loader2,
  AlertTriangle,
  Undo2,
  Trash2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

// Forward flow: next status options (excluding cancel — handled separately)
const STATUS_NEXT: Record<OrderStatus, OrderStatus | null> = {
  novo: "em_preparacao",
  em_preparacao: "saiu_entrega",
  saiu_entrega: "concluido",
  concluido: null,
  cancelado: null,
};

// Backward flow: previous status to revert to
const STATUS_PREV: Record<OrderStatus, OrderStatus | null> = {
  novo: null,
  em_preparacao: "novo",
  saiu_entrega: "em_preparacao",
  concluido: "saiu_entrega",
  cancelado: null, // can't revert cancel
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
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeView, setActiveView] = useState<"kanban" | "list">("kanban");

  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.orders.list.useQuery();
  const [highlightedOrderId, setHighlightedOrderId] = useState<number | null>(null);

  // ---- New Order Dialog State ----
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newObservation, setNewObservation] = useState("");
  const [newSelectedZoneId, setNewSelectedZoneId] = useState<string>("");
  const [newOrderItems, setNewOrderItems] = useState<Array<{ productId: number; name: string; quantity: number; price: number }>>([]);

  const { data: productsData } = trpc.products.list.useQuery(undefined, { enabled: newOrderOpen });
  const { data: zonesData } = trpc.deliveryZones.list.useQuery(undefined, { enabled: newOrderOpen });

  const createManual = trpc.orders.createManual.useMutation({
    onSuccess: () => {
      toast.success("Pedido criado com sucesso!");
      utils.orders.list.invalidate();
      resetNewOrderForm();
      setNewOrderOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const cancelOrder = trpc.orders.cancel.useMutation({
    onSuccess: () => {
      toast.success("Pedido cancelado!");
      utils.orders.list.invalidate();
      setConfirmCancel(false);
      setDetailOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteOrder = trpc.orders.delete.useMutation({
    onSuccess: () => {
      toast.success("Pedido excluído!");
      utils.orders.list.invalidate();
      setConfirmDelete(false);
      setDetailOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  function resetNewOrderForm() {
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewObservation("");
    setNewSelectedZoneId("");
    setNewOrderItems([]);
  }

  function addProductToOrder(product: { id: number; name: string; price: string | number }) {
    setNewOrderItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId: product.id, name: product.name, quantity: 1, price: typeof product.price === 'string' ? parseFloat(product.price) : product.price }];
    });
  }

  function updateItemQuantity(productId: number, delta: number) {
    setNewOrderItems((prev) => {
      return prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0);
    });
  }

  function handleCreateManualOrder() {
    if (!newCustomerName.trim()) {
      toast.error("Nome do cliente é obrigatório");
      return;
    }
    if (newOrderItems.length === 0) {
      toast.error("Adicione pelo menos 1 item");
      return;
    }
    const selectedZone = zonesData?.find((z: any) => z.id === Number(newSelectedZoneId));
    createManual.mutate({
      customerName: newCustomerName.trim(),
      customerPhone: newCustomerPhone.trim() || undefined,
      items: newOrderItems,
      deliveryZoneId: selectedZone?.id,
      deliveryZoneName: selectedZone?.zoneName,
      deliveryFee: selectedZone ? String(selectedZone.feeAmount) : undefined,
      observation: newObservation.trim() || undefined,
    });
  }

  const newOrderSubtotal = newOrderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const selectedNewZone = zonesData?.find((z: any) => z.id === Number(newSelectedZoneId));
  const newOrderDeliveryFee = selectedNewZone ? parseFloat(String(selectedNewZone.feeAmount)) : 0;
  const newOrderTotal = newOrderSubtotal + newOrderDeliveryFee;

  // Check for highlight param from SSE toast navigation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const highlightId = params.get('highlight');
    if (highlightId) {
      const id = parseInt(highlightId, 10);
      if (!isNaN(id)) {
        setHighlightedOrderId(id);
        // Clear highlight after 3 seconds
        const timer = setTimeout(() => setHighlightedOrderId(null), 3000);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
        return () => clearTimeout(timer);
      }
    }
  }, []);

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
    setConfirmCancel(false);
    setConfirmDelete(false);
    setDetailOpen(true);
  }, []);

  const handleDeleteFromCard = useCallback((orderId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este pedido? Esta ação é permanente.")) {
      deleteOrder.mutate({ id: orderId });
    }
  }, [deleteOrder]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <ClientAdminLayout>
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
          <Button
            size="sm"
            onClick={() => setNewOrderOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pedido
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
              onDeleteOrder={handleDeleteFromCard}
              isUpdating={updateStatus.isPending}
              highlightedOrderId={highlightedOrderId}
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
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-zinc-400">Alterar Status</h4>
                
                {selectedOrder.status === 'cancelado' ? (
                  <p className="text-xs text-zinc-500">Pedidos cancelados não podem ser movidos.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {/* Back button */}
                    {STATUS_PREV[selectedOrder.status as OrderStatus] && (
                      (() => {
                        const prevStatus = STATUS_PREV[selectedOrder.status as OrderStatus]!;
                        const prevCol = COLUMNS.find((c) => c.id === prevStatus);
                        return (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              handleMoveOrder(selectedOrder.id, prevStatus);
                              setDetailOpen(false);
                            }}
                            className={`border-zinc-700 hover:bg-zinc-800 ${prevCol?.color || "text-zinc-300"}`}
                          >
                            <ArrowLeft className="w-3 h-3 mr-1" />
                            <Undo2 className="w-3 h-3 mr-1" />
                            <span>Voltar: {getStatusLabel(prevStatus)}</span>
                          </Button>
                        );
                      })()
                    )}

                    {/* Forward button */}
                    {STATUS_NEXT[selectedOrder.status as OrderStatus] && (
                      (() => {
                        const nextStatus = STATUS_NEXT[selectedOrder.status as OrderStatus]!;
                        const nextCol = COLUMNS.find((c) => c.id === nextStatus);
                        return (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              handleMoveOrder(selectedOrder.id, nextStatus);
                              setDetailOpen(false);
                            }}
                            className={`border-zinc-700 hover:bg-zinc-800 ${nextCol?.color || "text-zinc-300"}`}
                          >
                            {nextCol?.icon}
                            <span className="ml-1">{getStatusLabel(nextStatus)}</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        );
                      })()
                    )}
                  </div>
                )}
              </div>

              {/* Delete Button with Confirmation */}
              <div className="pt-2 border-t border-zinc-800">
                {!confirmDelete ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full border-zinc-700 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Pedido
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-300">Tem certeza que deseja excluir permanentemente este pedido? Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita.</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                      >
                        N\u00e3o, manter
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

              {/* Cancel Button with Confirmation */}
              {selectedOrder.status !== 'cancelado' && (
                <div className="pt-2 border-t border-zinc-800">
                  {!confirmCancel ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmCancel(true)}
                      className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Cancelar Pedido
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-300">Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmCancel(false)}
                          className="flex-1 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                        >
                          Não, manter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelOrder.mutate({ id: selectedOrder.id })}
                          disabled={cancelOrder.isPending}
                          className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20 bg-red-500/10"
                        >
                          {cancelOrder.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Ban className="w-4 h-4 mr-2" />
                          )}
                          Sim, cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* New Order Dialog */}
      <Dialog open={newOrderOpen} onOpenChange={(open) => { if (!open) resetNewOrderForm(); setNewOrderOpen(open); }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              Novo Pedido Manual
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-zinc-400 text-xs">Nome do Cliente *</Label>
                <Input
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Telefone</Label>
                <Input
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>
            </div>

            {/* Product Selection */}
            <div>
              <Label className="text-zinc-400 text-xs">Produtos do Catálogo</Label>
              <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-zinc-800 divide-y divide-zinc-800">
                {productsData && productsData.length > 0 ? (
                  productsData.filter((p: any) => p.isAvailable).map((product: any) => {
                    const inOrder = newOrderItems.find((i) => i.productId === product.id);
                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between px-3 py-2 hover:bg-zinc-800/50 cursor-pointer"
                        onClick={() => !inOrder && addProductToOrder(product)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {product.imageUrl && (
                            <img src={product.imageUrl} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm text-white truncate">{product.name}</p>
                            <p className="text-xs text-zinc-500">{formatCurrency(product.price)}</p>
                          </div>
                        </div>
                        {inOrder ? (
                          <div className="flex items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); updateItemQuantity(product.id, -1); }} className="p-1 rounded bg-zinc-700 hover:bg-zinc-600">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm w-6 text-center">{inOrder.quantity}</span>
                            <button onClick={(e) => { e.stopPropagation(); updateItemQuantity(product.id, 1); }} className="p-1 rounded bg-zinc-700 hover:bg-zinc-600">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 text-xs border-zinc-700 text-zinc-400 hover:bg-zinc-800">
                            <Plus className="w-3 h-3 mr-1" /> Adicionar
                          </Button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-zinc-500 p-3">Nenhum produto disponível</p>
                )}
              </div>
            </div>

            {/* Selected Items Summary */}
            {newOrderItems.length > 0 && (
              <div className="rounded-lg bg-zinc-800 p-3 space-y-1">
                <p className="text-xs text-zinc-400 font-medium mb-2">Itens do Pedido</p>
                {newOrderItems.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-zinc-300">{item.quantity}x {item.name}</span>
                    <span className="text-zinc-400">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Delivery Zone */}
            {zonesData && zonesData.length > 0 && (
              <div>
                <Label className="text-zinc-400 text-xs">Zona de Entrega</Label>
                <Select value={newSelectedZoneId} onValueChange={setNewSelectedZoneId}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                    <SelectValue placeholder="Selecione (opcional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {zonesData.map((zone: any) => (
                      <SelectItem key={zone.id} value={String(zone.id)} className="text-white">
                        {zone.zoneName} {zone.feeAmount !== '0.00' ? `(${formatCurrency(zone.feeAmount)})` : '(Grátis)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Observation */}
            <div>
              <Label className="text-zinc-400 text-xs">Observação</Label>
              <Input
                value={newObservation}
                onChange={(e) => setNewObservation(e.target.value)}
                placeholder="Observações do pedido..."
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
              />
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div>
                <span className="text-sm text-amber-300">Subtotal: {formatCurrency(newOrderSubtotal)}</span>
                {newOrderDeliveryFee > 0 && (
                  <span className="text-sm text-amber-300 ml-3">+ Entrega: {formatCurrency(newOrderDeliveryFee)}</span>
                )}
              </div>
              <span className="text-lg font-bold text-amber-400">{formatCurrency(newOrderTotal)}</span>
            </div>

            {/* Submit */}
            <Button
              onClick={handleCreateManualOrder}
              disabled={createManual.isPending || newOrderItems.length === 0 || !newCustomerName.trim()}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {createManual.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando...</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" /> Criar Pedido</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </ClientAdminLayout>
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
  onDeleteOrder,
  isUpdating,
  highlightedOrderId,
}: {
  column: KanbanColumn;
  orders: any[];
  onMoveOrder: (orderId: number, newStatus: OrderStatus) => void;
  onViewOrder: (order: any) => void;
  onDeleteOrder: (orderId: number) => void;
  isUpdating: boolean;
  highlightedOrderId?: number | null;
}) {
  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-900 p-3 min-h-[300px]`}>
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
            <Package className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">Nenhum pedido</p>
          </div>
        ) : (
          orders.map((order: any) => (
            <OrderCard
              key={order.id}
              order={order}
              column={column}
              onMoveOrder={onMoveOrder}
              onViewOrder={onViewOrder}
              onDeleteOrder={onDeleteOrder}
              isUpdating={isUpdating}
              isHighlighted={order.id === highlightedOrderId}
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
  onDeleteOrder,
  isUpdating,
  isHighlighted,
}: {
  order: any;
  column: KanbanColumn;
  onMoveOrder: (orderId: number, newStatus: OrderStatus) => void;
  onViewOrder: (order: any) => void;
  onDeleteOrder: (orderId: number) => void;
  isUpdating: boolean;
  isHighlighted?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const nextStatus = STATUS_NEXT[order.status as OrderStatus];

  // Auto-scroll to highlighted card
  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  // Check if this is a new order (created in the last 10 seconds) for entrance animation
  const isNew = useMemo(() => {
    if (!order.createdAt) return false;
    const created = new Date(order.createdAt).getTime();
    return Date.now() - created < 10_000;
  }, [order.createdAt]);

  return (
    <div
      ref={cardRef}
      className={`bg-zinc-800 border rounded-lg p-3 cursor-pointer hover:border-zinc-600 transition-all group ${
        isHighlighted
          ? 'border-amber-500 ring-2 ring-amber-500/50 animate-pulse'
          : isNew && !order.viewedAt
            ? 'border-amber-500/50 animate-[slideDown_0.3s_ease-out]'
            : 'border-zinc-700'
      }`}
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

        {/* Quick action button - advance to next status */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {nextStatus ? (() => {
            const nextCol = COLUMNS.find((c) => c.id === nextStatus);
            return (
              <button
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
          })() : null}          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewOrder(order);
            }}
            className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-400"
            title="Ver detalhes"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteOrder(order.id);
            }}
            className="p-1.5 rounded-md bg-zinc-800 hover:bg-red-900/50 transition-colors text-zinc-500 hover:text-red-400"
            title="Excluir pedido"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>        </div>
      </div>
    </div>
  );
}
