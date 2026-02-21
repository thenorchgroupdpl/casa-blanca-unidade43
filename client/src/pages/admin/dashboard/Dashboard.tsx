/**
 * Dashboard do Lojista - Painel Operacional
 * Grid moderno com: Switch de funcionamento, QR Code, Feed de Pedidos, Disponibilidade Rápida
 */

import { useState, useMemo, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import ClientAdminLayout from '@/components/ClientAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Copy,
  Download,
  QrCode,
  ShoppingBag,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

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

  // Get products for quick availability toggle
  const productsQuery = trpc.products.list.useQuery(undefined, {
    enabled: !!tenantId,
  });

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
  const [showCompleted, setShowCompleted] = useState(false);

  // Derived data
  const storeUrl = tenantSlug
    ? `${window.location.origin}/${tenantSlug}`
    : '';

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

  // Products filtered by search
  const filteredProducts = useMemo(() => {
    const allProducts = productsQuery.data || [];
    if (!productSearch.trim()) return allProducts;
    const term = productSearch.toLowerCase();
    return allProducts.filter(p => p.name.toLowerCase().includes(term));
  }, [productsQuery.data, productSearch]);

  // Orders filtered
  const filteredOrders = useMemo(() => {
    const allOrders = ordersQuery.data || [];
    if (showCompleted) return allOrders;
    return allOrders.filter(o => !o.isCompleted);
  }, [ordersQuery.data, showCompleted]);

  const pendingOrdersCount = useMemo(() => {
    return (ordersQuery.data || []).filter(o => !o.isCompleted).length;
  }, [ordersQuery.data]);

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

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(storeUrl);
    toast.success('Link copiado!', { description: 'Cole no Instagram, WhatsApp ou onde quiser.' });
  }, [storeUrl]);

  const handleDownloadQR = useCallback(async () => {
    if (!storeUrl) return;
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(storeUrl)}&bgcolor=1a1a1a&color=ffffff&format=png`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${tenantSlug || 'loja'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('QR Code baixado!');
    } catch {
      toast.error('Erro ao baixar QR Code');
    }
  }, [storeUrl, tenantSlug]);

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
        <Card className="border-0 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5">
              {/* Left: Store Status */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isStoreOpen
                      ? 'bg-emerald-500/20 ring-2 ring-emerald-500/40'
                      : 'bg-red-500/20 ring-2 ring-red-500/40'
                  }`}
                >
                  {isStoreOpen ? (
                    <Power className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <PowerOff className="w-7 h-7 text-red-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">
                      {tenantName || 'Minha Loja'}
                    </h2>
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold ${
                        isStoreOpen
                          ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                          : 'border-red-500/50 text-red-400 bg-red-500/10'
                      }`}
                    >
                      {isStoreOpen ? 'Aberta' : 'Fechada'}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400">
                    {manualOverride
                      ? `Controle manual: ${manualOverride === 'open' ? 'Forçado aberto' : 'Forçado fechado'}`
                      : 'Seguindo horário automático'}
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
                    className="text-zinc-400 border-zinc-700 hover:bg-zinc-800 hover:text-white"
                  >
                    <Clock className="w-4 h-4 mr-1.5" />
                    Restaurar Automático
                  </Button>
                )}
                <button
                  onClick={handleToggleStore}
                  disabled={setOverrideMutation.isPending}
                  className={`relative inline-flex h-10 w-20 shrink-0 cursor-pointer rounded-full border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isStoreOpen
                      ? 'bg-emerald-500 border-emerald-400'
                      : 'bg-red-500/80 border-red-400'
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-8 w-8 rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ${
                      isStoreOpen ? 'translate-x-10' : 'translate-x-0.5'
                    } mt-[1px]`}
                  />
                </button>
              </div>
            </div>

            {/* Override warning bar */}
            {manualOverride && (
              <div className="px-5 py-2 bg-amber-500/10 border-t border-amber-500/20 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-300">
                  O controle manual está ativo. A loja está{' '}
                  <strong>{manualOverride === 'open' ? 'aberta' : 'fechada'}</strong>{' '}
                  independentemente do horário de funcionamento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* MAIN GRID: Orders (center) + Side widgets */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============================================ */}
          {/* LEFT COLUMN: QR Code + Quick Availability */}
          {/* ============================================ */}
          <div className="space-y-6 lg:col-span-1 order-2 lg:order-1">
            {/* QR Code & Share Card */}
            <Card className="border-zinc-800 bg-zinc-900/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-amber-400" />
                  Compartilhar Loja
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code Preview */}
                {storeUrl && (
                  <div className="flex justify-center">
                    <div className="bg-zinc-800 rounded-xl p-3 border border-zinc-700">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(storeUrl)}&bgcolor=1a1a1a&color=ffffff&format=svg`}
                        alt="QR Code da loja"
                        className="w-40 h-40 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* URL Display */}
                <div className="bg-zinc-800/60 rounded-lg p-3 border border-zinc-700/50">
                  <p className="text-xs text-zinc-500 mb-1">Link da sua loja</p>
                  <p className="text-sm text-amber-400 font-mono break-all">
                    {storeUrl || 'Configurando...'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    disabled={!storeUrl}
                    className="border-zinc-700 hover:bg-zinc-800 text-white"
                  >
                    <Copy className="w-4 h-4 mr-1.5" />
                    Copiar Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadQR}
                    disabled={!storeUrl}
                    className="border-zinc-700 hover:bg-zinc-800 text-white"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Baixar QR
                  </Button>
                </div>

                {/* Visit Store */}
                {storeUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-zinc-400 hover:text-amber-400"
                    onClick={() => window.open(storeUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    Visitar minha loja
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Availability Widget */}
            <Card className="border-zinc-800 bg-zinc-900/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  Disponibilidade Rápida
                </CardTitle>
                <p className="text-xs text-zinc-500 mt-1">
                  Pause ou ative produtos instantaneamente
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    placeholder="Buscar produto..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-9 bg-zinc-800/60 border-zinc-700 text-white placeholder:text-zinc-500 h-9 text-sm"
                  />
                </div>

                {/* Products List */}
                <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1">
                  {productsQuery.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-6">
                      <Package className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                      <p className="text-sm text-zinc-500">
                        {productSearch ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                      </p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                          product.isAvailable
                            ? 'bg-zinc-800/40 hover:bg-zinc-800/60'
                            : 'bg-red-500/5 hover:bg-red-500/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-8 h-8 rounded-md object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-md bg-zinc-700 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-zinc-500" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              product.isAvailable ? 'text-white' : 'text-zinc-500 line-through'
                            }`}>
                              {product.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={product.isAvailable}
                          onCheckedChange={() => handleToggleProduct(product.id, product.isAvailable)}
                          disabled={toggleProductMutation.isPending}
                          className="shrink-0 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-red-500/60"
                        />
                      </div>
                    ))
                  )}
                </div>

                {/* Summary */}
                {productsQuery.data && productsQuery.data.length > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-zinc-400">
                        {productsQuery.data.filter(p => p.isAvailable).length} ativos
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs text-zinc-400">
                        {productsQuery.data.filter(p => !p.isAvailable).length} pausados
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ============================================ */}
          {/* CENTER/RIGHT: FEED DE PEDIDOS */}
          {/* ============================================ */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card className="border-zinc-800 bg-zinc-900/80 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-amber-400" />
                      Solicitações Recentes
                    </CardTitle>
                    {pendingOrdersCount > 0 && (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                        {pendingOrdersCount} pendente{pendingOrdersCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={showCompleted}
                        onCheckedChange={(checked) => setShowCompleted(checked === true)}
                        className="border-zinc-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                      <span className="text-xs text-zinc-400">Mostrar concluídos</span>
                    </label>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Log de backup dos pedidos enviados via WhatsApp
                </p>
              </CardHeader>
              <CardContent>
                {ordersQuery.isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
                      <ShoppingBag className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-1">
                      {showCompleted ? 'Nenhum pedido registrado' : 'Nenhum pedido pendente'}
                    </h3>
                    <p className="text-xs text-zinc-600 max-w-xs">
                      Os pedidos feitos pelo site aparecerão aqui como log de segurança.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-800 hover:bg-transparent">
                          <TableHead className="text-zinc-500 text-xs w-10">Status</TableHead>
                          <TableHead className="text-zinc-500 text-xs">Hora</TableHead>
                          <TableHead className="text-zinc-500 text-xs">Cliente</TableHead>
                          <TableHead className="text-zinc-500 text-xs">Resumo</TableHead>
                          <TableHead className="text-zinc-500 text-xs text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow
                            key={order.id}
                            className={`border-zinc-800/50 transition-colors ${
                              order.isCompleted
                                ? 'opacity-50 hover:opacity-70'
                                : 'hover:bg-zinc-800/30'
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
                                  <p className="text-xs text-zinc-500">{order.customerPhone}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-3 max-w-[200px]">
                              <p className={`text-sm truncate ${
                                order.isCompleted ? 'text-zinc-600' : 'text-zinc-300'
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
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ClientAdminLayout>
  );
}
