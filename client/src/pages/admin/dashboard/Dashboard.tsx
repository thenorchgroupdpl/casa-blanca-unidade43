/**
 * Dashboard do Lojista - Cockpit de Comando
 * KPIs, Drawer de Pedidos avançado, Disponibilidade Rápida lateral
 */

import { useState, useMemo, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import ClientAdminLayout from '@/components/ClientAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  Power,
  PowerOff,
  ShoppingBag,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Search,
  ChevronRight,
  PauseCircle,
  Eye,
  TrendingUp,
  Calendar,
  Filter,
  LayoutGrid,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function ClientDashboard() {
  const utils = trpc.useUtils();

  // Get tenant info
  const roleQuery = trpc.auth.getRole.useQuery();
  const tenantSlug = roleQuery.data?.tenantSlug;
  const tenantName = roleQuery.data?.tenantName;
  const tenantId = roleQuery.data?.tenantId;

  // Get store settings (for manual override and opening hours)
  const settingsQuery = trpc.store.getSettings.useQuery(undefined, {
    enabled: !!tenantId,
  });

  // Get products grouped by category for quick availability toggle
  const groupedQuery = trpc.products.grouped.useQuery(undefined, {
    enabled: !!tenantId,
  });

  // Backward compat: flat products list derived from grouped
  const productsQuery = {
    data: groupedQuery.data?.products || [],
    isLoading: groupedQuery.isLoading,
  };

  // Get orders
  const ordersQuery = trpc.store.getOrders.useQuery(undefined, {
    enabled: !!tenantId,
  });

  // Mutations
  const setOverrideMutation = trpc.store.setManualOverride.useMutation({
    onSuccess: () => {
      utils.store.getSettings.invalidate();
    },
  });

  const toggleProductMutation = trpc.store.toggleProductAvailability.useMutation({
    onSuccess: () => {
      utils.products.grouped.invalidate();
      utils.products.list.invalidate();
    },
  });

  const toggleOrderMutation = trpc.store.toggleOrderCompleted.useMutation({
    onSuccess: () => {
      utils.store.getOrders.invalidate();
    },
  });

  // State
  const [productSearch, setProductSearch] = useState('');
  const [ordersDrawerOpen, setOrdersDrawerOpen] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('pending');
  const [orderDateFilter, setOrderDateFilter] = useState('');

  // Derived data
  const manualOverride = settingsQuery.data?.manualOverride as 'open' | 'closed' | null;

  // Check if store is currently open based on opening hours
  const isStoreOpenBySchedule = useMemo(() => {
    const hours = settingsQuery.data?.openingHours as any;
    if (!hours) return false;

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[now.getDay()];
    const todayHours = hours[today];

    if (!todayHours || todayHours.closed) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = todayHours.open.split(':').map(Number);
    const [closeH, closeM] = todayHours.close.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }, [settingsQuery.data?.openingHours]);

  // Final store status considering manual override
  const isStoreOpen = manualOverride === 'open'
    ? true
    : manualOverride === 'closed'
      ? false
      : isStoreOpenBySchedule;

  // Categories from grouped data
  const groupedCategories = groupedQuery.data?.categories || [];

  // Products filtered by search (flat list for KPIs)
  const filteredProducts = useMemo(() => {
    const allProducts = productsQuery.data || [];
    if (!productSearch.trim()) return allProducts;
    const term = productSearch.toLowerCase();
    // Search by product name or category name
    return allProducts.filter(p => {
      const cat = groupedCategories.find(c => c.id === p.categoryId);
      return p.name.toLowerCase().includes(term) || (cat?.name.toLowerCase().includes(term) ?? false);
    });
  }, [productsQuery.data, productSearch, groupedCategories]);

  // Products grouped by category for accordion
  const productsByCategory = useMemo(() => {
    const allProducts = productsQuery.data || [];
    const term = productSearch.trim().toLowerCase();
    return groupedCategories
      .filter(cat => cat.isActive)
      .map(cat => {
        let catProducts = allProducts.filter(p => p.categoryId === cat.id);
        if (term) {
          catProducts = catProducts.filter(p =>
            p.name.toLowerCase().includes(term) || cat.name.toLowerCase().includes(term)
          );
        }
        return { category: cat, products: catProducts };
      })
      .filter(group => group.products.length > 0);
  }, [productsQuery.data, groupedCategories, productSearch]);

  // KPI data
  const allOrders = ordersQuery.data || [];
  const pendingOrdersCount = useMemo(() => allOrders.filter(o => !o.isCompleted).length, [allOrders]);
  const todayOrdersCount = useMemo(() => {
    const today = new Date().toDateString();
    return allOrders.filter(o => new Date(o.createdAt).toDateString() === today).length;
  }, [allOrders]);
  const pausedProductsCount = useMemo(() => {
    return (productsQuery.data || []).filter(p => !p.isAvailable).length;
  }, [productsQuery.data]);

  // Orders filtered for drawer
  const filteredOrders = useMemo(() => {
    let orders = [...allOrders];

    // Status filter
    if (orderStatusFilter === 'pending') {
      orders = orders.filter(o => !o.isCompleted);
    } else if (orderStatusFilter === 'completed') {
      orders = orders.filter(o => o.isCompleted);
    }

    // Search filter
    if (orderSearch.trim()) {
      const term = orderSearch.toLowerCase();
      orders = orders.filter(o =>
        o.customerName.toLowerCase().includes(term) ||
        o.summary.toLowerCase().includes(term)
      );
    }

    // Date filter
    if (orderDateFilter) {
      orders = orders.filter(o => {
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDate === orderDateFilter;
      });
    }

    return orders;
  }, [allOrders, orderStatusFilter, orderSearch, orderDateFilter]);

  // Last 3 orders for the summary card
  const recentOrders = useMemo(() => {
    return allOrders.filter(o => !o.isCompleted).slice(0, 3);
  }, [allOrders]);

  // Handlers
  const handleToggleStore = useCallback(() => {
    const newOverride = isStoreOpen ? 'closed' : 'open';
    setOverrideMutation.mutate(
      { override: newOverride as 'open' | 'closed' },
      {
        onSuccess: () => {
          toast.success(
            newOverride === 'open' ? 'Loja aberta manualmente!' : 'Loja fechada manualmente!',
            { description: 'O status foi atualizado no site.' }
          );
        },
        onError: () => toast.error('Erro ao alterar status da loja'),
      }
    );
  }, [isStoreOpen, setOverrideMutation]);

  const handleResetOverride = useCallback(() => {
    setOverrideMutation.mutate(
      { override: null },
      {
        onSuccess: () => {
          toast.success('Controle automático restaurado', {
            description: 'A loja seguirá o horário de funcionamento cadastrado.',
          });
        },
      }
    );
  }, [setOverrideMutation]);

  const handleToggleProduct = useCallback((productId: number, currentAvailable: boolean) => {
    toggleProductMutation.mutate(
      { productId, isAvailable: !currentAvailable },
      {
        onSuccess: () => {
          toast.success(!currentAvailable ? 'Produto disponível' : 'Produto pausado', {
            description: 'Atualizado no site instantaneamente.',
          });
        },
        onError: () => toast.error('Erro ao alterar disponibilidade'),
      }
    );
  }, [toggleProductMutation]);

  const handleToggleOrder = useCallback((orderId: number, currentCompleted: boolean) => {
    toggleOrderMutation.mutate(
      { orderId, isCompleted: !currentCompleted },
      {
        onSuccess: () => {
          toast.success(!currentCompleted ? 'Pedido concluído' : 'Pedido reaberto');
        },
        onError: () => toast.error('Erro ao alterar pedido'),
      }
    );
  }, [toggleOrderMutation]);

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Loading state
  if (roleQuery.isLoading || settingsQuery.isLoading) {
    return (
      <ClientAdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </ClientAdminLayout>
    );
  }

  return (
    <ClientAdminLayout>
      <div className="space-y-6">
        {/* ============================================ */}
        {/* TOP BAR: CONTROLE DE EXPEDIENTE */}
        {/* ============================================ */}
        <Card className="border-zinc-800/60 bg-zinc-900/80 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5">
              {/* Left: Store Status */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isStoreOpen
                      ? 'bg-emerald-500/15 ring-1 ring-emerald-500/30'
                      : 'bg-red-500/15 ring-1 ring-red-500/30'
                  }`}
                >
                  {isStoreOpen ? (
                    <Power className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <PowerOff className="w-6 h-6 text-red-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-white">
                      {tenantName || 'Minha Loja'}
                    </h2>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold px-2 py-0 ${
                        isStoreOpen
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                          : 'border-red-500/40 text-red-400 bg-red-500/10'
                      }`}
                    >
                      {isStoreOpen ? 'Aberta' : 'Fechada'}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {manualOverride
                      ? `Manual: ${manualOverride === 'open' ? 'Forçado aberto' : 'Forçado fechado'}`
                      : 'Horário automático'}
                  </p>
                </div>
              </div>

              {/* Right: Toggle + Reset */}
              <div className="flex items-center gap-3">
                {manualOverride && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetOverride}
                    disabled={setOverrideMutation.isPending}
                    className="text-zinc-400 border-zinc-700 hover:bg-zinc-800 hover:text-white text-xs h-8"
                  >
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    Restaurar Automático
                  </Button>
                )}
                <button
                  onClick={handleToggleStore}
                  disabled={setOverrideMutation.isPending}
                  className={`relative inline-flex h-9 w-[72px] shrink-0 cursor-pointer rounded-full border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isStoreOpen
                      ? 'bg-emerald-500 border-emerald-400'
                      : 'bg-red-500/80 border-red-400'
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-7 w-7 rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ${
                      isStoreOpen ? 'translate-x-[38px]' : 'translate-x-0.5'
                    } mt-[1px]`}
                  />
                </button>
              </div>
            </div>

            {/* Override warning bar */}
            {manualOverride && (
              <div className="px-5 py-2 bg-amber-500/5 border-t border-amber-500/15 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <p className="text-[11px] text-amber-300/80">
                  Controle manual ativo. Loja{' '}
                  <strong>{manualOverride === 'open' ? 'aberta' : 'fechada'}</strong>{' '}
                  independente do horário.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* KPI CARDS */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Pedidos Hoje */}
          <Card className="border-zinc-800/60 bg-zinc-900/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Pedidos Hoje</p>
                  <p className="text-2xl font-bold text-white mt-1">{todayOrdersCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pendentes */}
          <Card className="border-zinc-800/60 bg-zinc-900/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Pendentes</p>
                  <p className={`text-2xl font-bold mt-1 ${pendingOrdersCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                    {pendingOrdersCount}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  pendingOrdersCount > 0 ? 'bg-amber-500/10' : 'bg-zinc-800'
                }`}>
                  <Clock className={`w-5 h-5 ${pendingOrdersCount > 0 ? 'text-amber-400' : 'text-zinc-500'}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Itens Pausados */}
          <Card className="border-zinc-800/60 bg-zinc-900/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Itens Pausados</p>
                  <p className={`text-2xl font-bold mt-1 ${pausedProductsCount > 0 ? 'text-red-400' : 'text-white'}`}>
                    {pausedProductsCount}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  pausedProductsCount > 0 ? 'bg-red-500/10' : 'bg-zinc-800'
                }`}>
                  <PauseCircle className={`w-5 h-5 ${pausedProductsCount > 0 ? 'text-red-400' : 'text-zinc-500'}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acessos LP */}
          <Card className="border-zinc-800/60 bg-zinc-900/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Acessos na LP</p>
                  <p className="text-2xl font-bold text-white mt-1">—</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">Em breve</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-zinc-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============================================ */}
        {/* MAIN GRID: Orders Summary + Quick Availability */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============================================ */}
          {/* CENTER: SOLICITAÇÕES RECENTES (CARD RESUMO) */}
          {/* ============================================ */}
          <div className="lg:col-span-2">
            <Card
              className="border-zinc-800/60 bg-zinc-900/60 cursor-pointer hover:border-zinc-700/60 transition-colors group"
              onClick={() => setOrdersDrawerOpen(true)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-white">
                        Solicitações Recentes
                      </CardTitle>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Log de pedidos via WhatsApp
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingOrdersCount > 0 && (
                      <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-xs">
                        {pendingOrdersCount} pendente{pendingOrdersCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {ordersQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-3">
                      <ShoppingBag className="w-6 h-6 text-zinc-600" />
                    </div>
                    <p className="text-sm text-zinc-400">Nenhum pedido pendente</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      Clique para ver o histórico completo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Checkbox
                            checked={order.isCompleted}
                            onCheckedChange={() => handleToggleOrder(order.id, order.isCompleted)}
                            disabled={toggleOrderMutation.isPending}
                            className="border-zinc-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white truncate">
                                {order.customerName}
                              </p>
                              <span className="text-[10px] text-zinc-500 shrink-0">
                                {formatTime(order.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 truncate mt-0.5">
                              {order.summary}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-amber-400 shrink-0 ml-3">
                          {formatCurrency(order.totalValue)}
                        </span>
                      </div>
                    ))}

                    {pendingOrdersCount > 3 && (
                      <div className="text-center pt-2">
                        <p className="text-xs text-zinc-500">
                          + {pendingOrdersCount - 3} pedido{pendingOrdersCount - 3 > 1 ? 's' : ''} pendente{pendingOrdersCount - 3 > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-zinc-800/60">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-zinc-400 hover:text-amber-400 text-xs h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOrdersDrawerOpen(true);
                        }}
                      >
                        <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                        Ver todos os pedidos
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ============================================ */}
          {/* RIGHT COLUMN: DISPONIBILIDADE RÁPIDA (ACCORDION) */}
          {/* ============================================ */}
          <div className="lg:col-span-1">
            <Card className="border-zinc-800/60 bg-zinc-900/60 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-white">
                      Disponibilidade
                    </CardTitle>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Pause ou ative produtos por categoria
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <Input
                    placeholder="Buscar produto ou categoria..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-8 bg-zinc-800/60 border-zinc-700/60 text-white placeholder:text-zinc-600 h-8 text-xs"
                  />
                </div>

                {/* Accordion by Category */}
                <div className="max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                  {productsQuery.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                    </div>
                  ) : productsByCategory.length === 0 ? (
                    <div className="text-center py-6">
                      <Package className="w-7 h-7 text-zinc-700 mx-auto mb-2" />
                      <p className="text-xs text-zinc-500">
                        {productSearch ? 'Nenhum encontrado' : 'Nenhum produto'}
                      </p>
                    </div>
                  ) : (
                    <Accordion type="multiple" defaultValue={[]} className="space-y-1">
                      {productsByCategory.map((group) => {
                        const activeCount = group.products.filter(p => p.isAvailable).length;
                        const totalCount = group.products.length;
                        return (
                          <AccordionItem
                            key={group.category.id}
                            value={String(group.category.id)}
                            className="border-zinc-800/40 rounded-lg overflow-hidden bg-zinc-800/20"
                          >
                            <AccordionTrigger className="px-3 py-2.5 hover:no-underline hover:bg-zinc-800/40 transition-colors text-white">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
                                  <LayoutGrid className="w-3 h-3 text-amber-400" />
                                </div>
                                <span className="text-xs font-semibold truncate">{group.category.name}</span>
                                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ml-auto mr-2 shrink-0 ${
                                  activeCount === totalCount
                                    ? 'border-emerald-500/40 text-emerald-400'
                                    : activeCount === 0
                                      ? 'border-red-500/40 text-red-400'
                                      : 'border-amber-500/40 text-amber-400'
                                }`}>
                                  {activeCount}/{totalCount}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-1 pb-1">
                              <div className="space-y-0.5">
                                {group.products.map((product) => (
                                  <div
                                    key={product.id}
                                    className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                                      product.isAvailable
                                        ? 'bg-zinc-800/30 hover:bg-zinc-800/50'
                                        : 'bg-red-500/5 hover:bg-red-500/10'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      {product.imageUrl ? (
                                        <img
                                          src={product.imageUrl}
                                          alt={product.name}
                                          className="w-7 h-7 rounded-md object-cover shrink-0"
                                        />
                                      ) : (
                                        <div className="w-7 h-7 rounded-md bg-zinc-700/60 flex items-center justify-center shrink-0">
                                          <Package className="w-3.5 h-3.5 text-zinc-500" />
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <p className={`text-xs font-medium truncate ${
                                          product.isAvailable ? 'text-white' : 'text-zinc-500 line-through'
                                        }`}>
                                          {product.name}
                                        </p>
                                        <p className="text-[10px] text-zinc-600">
                                          {formatCurrency(product.price)}
                                        </p>
                                      </div>
                                    </div>
                                    <Switch
                                      checked={product.isAvailable}
                                      onCheckedChange={() => handleToggleProduct(product.id, product.isAvailable)}
                                      disabled={toggleProductMutation.isPending}
                                      className="shrink-0 scale-90 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-red-500/60"
                                    />
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  )}
                </div>

                {/* Summary */}
                {productsQuery.data && productsQuery.data.length > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] text-zinc-400">
                        {productsQuery.data.filter(p => p.isAvailable).length} ativos
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <XCircle className="w-3 h-3 text-red-400" />
                      <span className="text-[10px] text-zinc-400">
                        {productsQuery.data.filter(p => !p.isAvailable).length} pausados
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* DRAWER: VISÃO AVANÇADA DE PEDIDOS */}
      {/* ============================================ */}
      <Sheet open={ordersDrawerOpen} onOpenChange={setOrdersDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl bg-zinc-950 border-zinc-800 p-0 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="px-6 py-5 border-b border-zinc-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <SheetTitle className="text-white text-base">Solicitações</SheetTitle>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {allOrders.length} pedido{allOrders.length !== 1 ? 's' : ''} no total
                    </p>
                  </div>
                </div>
              </div>
            </SheetHeader>

            {/* Filters */}
            <div className="px-6 py-4 border-b border-zinc-800/40 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  placeholder="Buscar por nome do cliente..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 h-9 text-sm"
                />
              </div>

              {/* Status + Date */}
              <div className="flex gap-2">
                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-8 text-xs w-36">
                    <Filter className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative flex-1">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                  <Input
                    type="date"
                    value={orderDateFilter}
                    onChange={(e) => setOrderDateFilter(e.target.value)}
                    className="pl-8 bg-zinc-900 border-zinc-800 text-white h-8 text-xs [color-scheme:dark]"
                  />
                </div>

                {(orderSearch || orderDateFilter || orderStatusFilter !== 'pending') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setOrderSearch('');
                      setOrderDateFilter('');
                      setOrderStatusFilter('pending');
                    }}
                    className="text-zinc-500 hover:text-white h-8 px-2 text-xs shrink-0"
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            {/* Orders Table */}
            <div className="flex-1 overflow-y-auto px-6">
              {ordersQuery.isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-xl bg-zinc-900 flex items-center justify-center mb-3">
                    <ShoppingBag className="w-7 h-7 text-zinc-700" />
                  </div>
                  <p className="text-sm text-zinc-400">Nenhum pedido encontrado</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Ajuste os filtros ou aguarde novos pedidos
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800/50 hover:bg-transparent">
                      <TableHead className="text-zinc-500 text-[10px] uppercase tracking-wider w-10">
                        OK
                      </TableHead>
                      <TableHead className="text-zinc-500 text-[10px] uppercase tracking-wider">
                        Hora
                      </TableHead>
                      <TableHead className="text-zinc-500 text-[10px] uppercase tracking-wider">
                        Cliente
                      </TableHead>
                      <TableHead className="text-zinc-500 text-[10px] uppercase tracking-wider">
                        Resumo
                      </TableHead>
                      <TableHead className="text-zinc-500 text-[10px] uppercase tracking-wider text-right">
                        Valor
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className={`border-zinc-800/30 transition-colors ${
                          order.isCompleted
                            ? 'opacity-50 hover:opacity-70'
                            : 'hover:bg-zinc-900/50'
                        }`}
                      >
                        <TableCell className="py-3">
                          <Checkbox
                            checked={order.isCompleted}
                            onCheckedChange={() => handleToggleOrder(order.id, order.isCompleted)}
                            disabled={toggleOrderMutation.isPending}
                            className="border-zinc-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="text-xs">
                            <span className="text-zinc-300 font-medium">
                              {formatTime(order.createdAt)}
                            </span>
                            <span className="text-zinc-600 ml-1">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div>
                            <p className={`text-sm font-medium ${
                              order.isCompleted ? 'text-zinc-500 line-through' : 'text-white'
                            }`}>
                              {order.customerName}
                            </p>
                            {order.customerPhone && (
                              <p className="text-[10px] text-zinc-600">{order.customerPhone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 max-w-[200px]">
                          <p className={`text-xs truncate ${
                            order.isCompleted ? 'text-zinc-600' : 'text-zinc-400'
                          }`}>
                            {order.summary}
                          </p>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <span className={`text-sm font-semibold ${
                            order.isCompleted ? 'text-zinc-500' : 'text-amber-400'
                          }`}>
                            {formatCurrency(order.totalValue)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Footer summary */}
            <div className="px-6 py-3 border-t border-zinc-800/60 bg-zinc-900/50">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} exibido{filteredOrders.length !== 1 ? 's' : ''}</span>
                <span className="text-amber-400 font-medium">
                  Total: {formatCurrency(filteredOrders.reduce((sum, o) => sum + (typeof o.totalValue === 'string' ? parseFloat(o.totalValue) : o.totalValue), 0))}
                </span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </ClientAdminLayout>
  );
}
