/**
 * Dashboard do Lojista - Central de Inteligência
 * 6 KPI Cards + Gráficos Recharts + Ranking Top 5 + Disponibilidade Rápida
 */

import { useState, useMemo, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import ClientAdminLayout from '@/components/ClientAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import {
  Power,
  PowerOff,
  ShoppingBag,
  Clock,
  Package,
  Loader2,
  AlertTriangle,
  Search,
  PauseCircle,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Copy,
  DollarSign,
  Target,
  BarChart3,
  CalendarDays,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  Trophy,
  Medal,
  Minus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

// ============================================
// TYPES
// ============================================
type AnalyticsPeriod = 'today' | '7d' | '30d' | 'month';

// ============================================
// HELPER FUNCTIONS
// ============================================
const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatCurrencyShort = (value: number) => {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1).replace('.', ',')}k`;
  }
  return formatCurrency(value);
};

const formatPercent = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? { value: 100, label: '+100%' } : { value: 0, label: '0%' };
  const pct = ((current - previous) / previous) * 100;
  return {
    value: pct,
    label: `${pct >= 0 ? '↑' : '↓'} ${Math.abs(pct).toFixed(0)}%`,
  };
};

const periodDaysMap: Record<AnalyticsPeriod, number> = {
  today: 1,
  '7d': 7,
  '30d': 30,
  month: 30,
};

// ============================================
// SKELETON COMPONENTS
// ============================================
function MetricCardSkeleton() {
  return (
    <Card className="border-zinc-800/60 bg-zinc-900/60">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
            <div className="h-7 w-20 bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-32 bg-zinc-800/60 rounded animate-pulse" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-800 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <Card className="border-zinc-800/60 bg-zinc-900/60">
      <CardContent className="p-5">
        <div className="h-5 w-48 bg-zinc-800 rounded animate-pulse mb-1" />
        <div className="h-3 w-64 bg-zinc-800/60 rounded animate-pulse mb-4" />
        <div className={`bg-zinc-800/30 rounded-lg animate-pulse`} style={{ height }} />
      </CardContent>
    </Card>
  );
}

// ============================================
// CUSTOM TOOLTIP COMPONENTS
// ============================================
function RevenueTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const [year, month, day] = (data.date || '').split('-');
  const dateFormatted = day && month ? `${day}/${month}/${year}` : label;

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-zinc-400 mb-1">{dateFormatted}</p>
      <p className="text-sm font-semibold text-amber-400">
        {formatCurrency(data.revenue || 0)}
      </p>
      <p className="text-xs text-zinc-500 mt-0.5">
        {data.orders || 0} pedido{(data.orders || 0) !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

function WeekdayTooltipContent({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
      <p className="text-sm font-semibold text-white">
        {data.average} pedido{data.average !== 1 ? 's' : ''} em média
      </p>
      <p className="text-xs text-zinc-400 mt-0.5">
        nas {data.weekday}s
      </p>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
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

  // ============================================
  // ANALYTICS QUERIES
  // ============================================
  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>('30d');

  const summaryQuery = trpc.analytics.getDashboardSummary.useQuery(undefined, {
    enabled: !!tenantId,
  });

  const [revenueDays] = useState(30);
  const revenueByDayQuery = trpc.analytics.getRevenueByDay.useQuery(
    { days: analyticsPeriod === 'today' ? 1 : analyticsPeriod === '7d' ? 7 : 30 },
    { enabled: !!tenantId }
  );

  const weekdayQuery = trpc.analytics.getOrdersByWeekday.useQuery(undefined, {
    enabled: !!tenantId,
  });

  const topProductsQuery = trpc.analytics.getTopProducts.useQuery(
    { period: analyticsPeriod },
    { enabled: !!tenantId }
  );

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

  // State
  const [productSearch, setProductSearch] = useState('');

  // Derived data
  const manualOverride = settingsQuery.data?.manualOverride as 'open' | 'closed' | null;

  // Check if store is currently open based on opening hours (supports 2 shifts)
  const isStoreOpenBySchedule = useMemo(() => {
    const hours = settingsQuery.data?.openingHours as any;
    if (!hours) return false;

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[now.getDay()];
    const todayHours = hours[today];

    if (!todayHours || todayHours.closed) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const s1Start = todayHours.shift1_start || todayHours.open;
    const s1End = todayHours.shift1_end || todayHours.close;
    
    if (s1Start && s1End) {
      const [openH, openM] = s1Start.split(':').map(Number);
      const [closeH, closeM] = s1End.split(':').map(Number);
      let openMinutes = openH * 60 + openM;
      let closeMinutes = closeH * 60 + closeM;
      if (closeMinutes === 0) closeMinutes = 24 * 60;
      if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) return true;
    }
    
    if (todayHours.shift2_start && todayHours.shift2_end) {
      const [s2OpenH, s2OpenM] = todayHours.shift2_start.split(':').map(Number);
      const [s2CloseH, s2CloseM] = todayHours.shift2_end.split(':').map(Number);
      let s2OpenMinutes = s2OpenH * 60 + s2OpenM;
      let s2CloseMinutes = s2CloseH * 60 + s2CloseM;
      if (s2CloseMinutes === 0) s2CloseMinutes = 24 * 60;
      if (currentMinutes >= s2OpenMinutes && currentMinutes <= s2CloseMinutes) return true;
    }
    
    return false;
  }, [settingsQuery.data?.openingHours]);

  const isStoreOpen = manualOverride === 'open'
    ? true
    : manualOverride === 'closed'
      ? false
      : isStoreOpenBySchedule;

  // Next relevant time for status card
  const nextTimeLabel = useMemo(() => {
    const hours = settingsQuery.data?.openingHours as any;
    if (!hours) return '';

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[now.getDay()];
    const todayHours = hours[today];
    if (!todayHours || todayHours.closed) return 'Fechada hoje';

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const s1End = todayHours.shift1_end || todayHours.close;
    const s2End = todayHours.shift2_end;

    if (isStoreOpen) {
      // Find closing time
      if (s2End) {
        return `Fecha às ${s2End}`;
      }
      if (s1End) {
        return `Fecha às ${s1End}`;
      }
    } else {
      // Find opening time
      const s1Start = todayHours.shift1_start || todayHours.open;
      if (s1Start) {
        const [h, m] = s1Start.split(':').map(Number);
        if (h * 60 + m > currentMinutes) {
          return `Abre às ${s1Start}`;
        }
      }
      if (todayHours.shift2_start) {
        const [h, m] = todayHours.shift2_start.split(':').map(Number);
        if (h * 60 + m > currentMinutes) {
          return `Abre às ${todayHours.shift2_start}`;
        }
      }
      return 'Fechada agora';
    }
    return '';
  }, [settingsQuery.data?.openingHours, isStoreOpen]);

  // Categories from grouped data
  const groupedCategories = groupedQuery.data?.categories || [];

  // Products filtered by search
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

  const pausedProductsCount = useMemo(() => {
    return (productsQuery.data || []).filter(p => !p.isAvailable).length;
  }, [productsQuery.data]);

  // Revenue chart data
  const revenueChartData = useMemo(() => {
    const data = revenueByDayQuery.data || [];
    return data.map(d => {
      const [, m, day] = (d.date || '').split('-');
      return {
        ...d,
        label: `${day}/${m}`,
      };
    });
  }, [revenueByDayQuery.data]);

  const totalRevenuePeriod = useMemo(() => {
    return revenueChartData.reduce((sum, d) => sum + d.revenue, 0);
  }, [revenueChartData]);

  // Weekday chart data with highlight for today
  const weekdayChartData = useMemo(() => {
    const data = weekdayQuery.data || [];
    const todayIndex = new Date().getDay();
    return data.map(d => ({
      ...d,
      isToday: d.weekdayIndex === todayIndex,
      fill: d.weekdayIndex === todayIndex ? '#D4AF37' : '#D4AF3766',
    }));
  }, [weekdayQuery.data]);

  const busiestDay = useMemo(() => {
    if (!weekdayChartData.length) return null;
    return weekdayChartData.reduce((max, d) => d.average > max.average ? d : max, weekdayChartData[0]);
  }, [weekdayChartData]);

  // Top products
  const topProducts = topProductsQuery.data || [];
  const maxProductCount = topProducts.length > 0 ? topProducts[0].count : 1;

  // Summary data
  const summary = summaryQuery.data;

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

              {/* Right: Store Link + Toggle + Reset */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                {tenantSlug && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = `${window.location.origin}/${tenantSlug}`;
                        window.open(url, '_blank');
                      }}
                      className="text-zinc-400 border-zinc-700 hover:bg-zinc-800 hover:text-white text-xs h-8"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Ver Loja
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-zinc-400 border-zinc-700 hover:bg-zinc-800 hover:text-white h-8 w-8"
                      onClick={() => {
                        const url = `${window.location.origin}/${tenantSlug}`;
                        navigator.clipboard.writeText(url).then(() => {
                          toast.success('Link copiado!', {
                            description: 'Cole no Instagram, WhatsApp ou onde preferir.',
                          });
                        }).catch(() => {
                          toast.error('Não foi possível copiar o link');
                        });
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
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
        {/* 6 KPI CARDS (2 rows x 3 cols desktop, 2x3 mobile) */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Card 1 — Faturamento Hoje */}
          {summaryQuery.isLoading ? <MetricCardSkeleton /> : (
            <Card className="border-zinc-800/60 bg-zinc-900/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Faturamento Hoje</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1 truncate">
                      {formatCurrency(summary?.revenueToday || 0)}
                    </p>
                    {summary && (
                      <p className={`text-[11px] mt-1 ${
                        summary.revenueToday >= summary.revenueYesterday ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {summary.revenueYesterday > 0
                          ? formatPercent(summary.revenueToday, summary.revenueYesterday).label + ' vs ontem'
                          : summary.revenueToday > 0 ? '↑ Primeiro faturamento!' : 'Sem vendas ontem'
                        }
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 2 — Pedidos Hoje */}
          {summaryQuery.isLoading ? <MetricCardSkeleton /> : (
            <Card className="border-zinc-800/60 bg-zinc-900/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Pedidos Hoje</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-1">{summary?.ordersToday || 0}</p>
                    {summary && summary.ordersInProgress > 0 && (
                      <p className="text-[11px] text-amber-400 mt-1">
                        {summary.ordersInProgress} em andamento
                      </p>
                    )}
                    {summary && summary.ordersInProgress === 0 && (
                      <p className="text-[11px] text-zinc-500 mt-1">Nenhum em andamento</p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 3 — Ticket Médio */}
          {summaryQuery.isLoading ? <MetricCardSkeleton /> : (
            <Card className="border-zinc-800/60 bg-zinc-900/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Ticket Médio</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-1 truncate">
                      {formatCurrency(summary?.ticketMediaMonth || 0)}
                    </p>
                    {summary && (
                      <p className={`text-[11px] mt-1 ${
                        summary.ticketMediaMonth >= summary.ticketMediaLastMonth ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {summary.ticketMediaLastMonth > 0
                          ? `${summary.ticketMediaMonth >= summary.ticketMediaLastMonth ? '↑' : '↓'} ${formatCurrency(Math.abs(summary.ticketMediaMonth - summary.ticketMediaLastMonth))} vs mês passado`
                          : summary.ticketMediaMonth > 0 ? '↑ Primeiro mês!' : 'Sem dados'
                        }
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-violet-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 4 — Faturamento do Mês */}
          {summaryQuery.isLoading ? <MetricCardSkeleton /> : (
            <Card className="border-zinc-800/60 bg-zinc-900/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Faturamento Mês</p>
                    <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-1 truncate">
                      {formatCurrency(summary?.revenueMonth || 0)}
                    </p>
                    {summary && (
                      <p className={`text-[11px] mt-1 ${
                        summary.revenueMonth >= summary.revenueLastMonth ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {summary.revenueLastMonth > 0
                          ? formatPercent(summary.revenueMonth, summary.revenueLastMonth).label + ' vs mês passado'
                          : summary.revenueMonth > 0 ? '↑ Primeiro mês!' : 'Sem dados'
                        }
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 5 — Total Pedidos do Mês */}
          {summaryQuery.isLoading ? <MetricCardSkeleton /> : (
            <Card className="border-zinc-800/60 bg-zinc-900/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Pedidos no Mês</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-1">{summary?.ordersMonth || 0}</p>
                    {summary && (
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Média: {summary.dailyAverage.toFixed(1)} pedidos/dia
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 6 — Status da Loja */}
          <Card className="border-zinc-800/60 bg-zinc-900/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Status da Loja</p>
                  <p className={`text-xl sm:text-2xl font-bold mt-1 ${isStoreOpen ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isStoreOpen ? 'Aberta' : 'Fechada'}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">{nextTimeLabel}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isStoreOpen ? 'bg-emerald-500/10' : 'bg-red-500/10'
                }`}>
                  <div className={`w-4 h-4 rounded-full ${isStoreOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============================================ */}
        {/* PERIOD SELECTOR */}
        {/* ============================================ */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            Analytics
          </h3>
          <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800/60 rounded-lg p-0.5">
            {([
              { key: 'today' as const, label: 'Hoje' },
              { key: '7d' as const, label: '7 dias' },
              { key: '30d' as const, label: '30 dias' },
              { key: 'month' as const, label: 'Este mês' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setAnalyticsPeriod(key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  analyticsPeriod === key
                    ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================ */}
        {/* CHARTS ROW */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart (2/3 width) */}
          <div className="lg:col-span-2">
            {revenueByDayQuery.isLoading ? (
              <ChartSkeleton height={280} />
            ) : (
              <Card className="border-zinc-800/60 bg-zinc-900/60">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Faturamento {analyticsPeriod === 'today' ? 'de Hoje' : analyticsPeriod === '7d' ? 'dos Últimos 7 Dias' : 'dos Últimos 30 Dias'}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Total: <span className="text-amber-400 font-semibold">{formatCurrency(totalRevenuePeriod)}</span> no período
                      </p>
                    </div>
                  </div>

                  {revenueChartData.length < 3 || totalRevenuePeriod === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-14 h-14 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-3">
                        <TrendingUp className="w-7 h-7 text-zinc-600" />
                      </div>
                      <p className="text-sm text-zinc-400">Dados insuficientes</p>
                      <p className="text-xs text-zinc-600 mt-1 max-w-xs">
                        Seus dados de faturamento aparecerão aqui conforme os pedidos forem sendo concluídos.
                      </p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={revenueChartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: '#71717a' }}
                          tickLine={false}
                          axisLine={{ stroke: '#27272a' }}
                          interval={analyticsPeriod === '7d' ? 0 : 4}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#71717a' }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => formatCurrencyShort(v)}
                        />
                        <RechartsTooltip content={<RevenueTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#D4AF37"
                          strokeWidth={2}
                          fill="url(#revenueGradient)"
                          dot={false}
                          activeDot={{ r: 5, fill: '#D4AF37', stroke: '#0a0a0a', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Weekday Chart (1/3 width) */}
          <div className="lg:col-span-1">
            {weekdayQuery.isLoading ? (
              <ChartSkeleton height={280} />
            ) : (
              <Card className="border-zinc-800/60 bg-zinc-900/60 h-full">
                <CardContent className="p-5">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-white">Dias Mais Movimentados</h4>
                    {busiestDay && busiestDay.average > 0 && (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        <span className="text-amber-400">{busiestDay.weekday}</span> é seu dia mais forte
                      </p>
                    )}
                  </div>

                  {weekdayChartData.every(d => d.average === 0) ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-14 h-14 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-3">
                        <CalendarDays className="w-7 h-7 text-zinc-600" />
                      </div>
                      <p className="text-sm text-zinc-400">Sem dados ainda</p>
                      <p className="text-xs text-zinc-600 mt-1">
                        Dados dos últimos 30 dias aparecerão aqui.
                      </p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={weekdayChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis
                          dataKey="weekday"
                          tick={{ fontSize: 10, fill: '#71717a' }}
                          tickLine={false}
                          axisLine={{ stroke: '#27272a' }}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#71717a' }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <RechartsTooltip content={<WeekdayTooltipContent />} />
                        <Bar
                          dataKey="average"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        >
                          {weekdayChartData.map((entry, index) => (
                            <rect key={index} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* TOP 5 PRODUCTS RANKING */}
        {/* ============================================ */}
        {topProductsQuery.isLoading ? (
          <Card className="border-zinc-800/60 bg-zinc-900/60">
            <CardContent className="p-5">
              <div className="h-5 w-56 bg-zinc-800 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-zinc-800 rounded animate-pulse" />
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
                      <div className="h-2 w-full bg-zinc-800/40 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-zinc-800/60 bg-zinc-900/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Produtos Mais Pedidos
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {analyticsPeriod === 'today' ? 'Hoje' : analyticsPeriod === '7d' ? 'Últimos 7 dias' : analyticsPeriod === 'month' ? 'Este mês' : 'Últimos 30 dias'}
                  </p>
                </div>
              </div>

              {topProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-3">
                    <Trophy className="w-7 h-7 text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-400">Sem dados suficientes</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Seus produtos mais pedidos aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={product.productId} className="flex items-center gap-3">
                      {/* Position */}
                      <div className="w-7 flex items-center justify-center shrink-0">
                        {index === 0 ? (
                          <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center">
                            <Medal className="w-4 h-4 text-amber-400" />
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-zinc-500">{index + 1}º</span>
                        )}
                      </div>

                      {/* Product Image */}
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-zinc-500">
                            {product.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Product Info + Progress Bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{product.name}</p>
                            <p className="text-[10px] text-zinc-500">{product.category}</p>
                          </div>
                          <span className="text-xs font-semibold text-amber-400 shrink-0">
                            {product.count}x
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(product.count / maxProductCount) * 100}%`,
                              backgroundColor: index === 0 ? '#D4AF37' : index === 1 ? '#A0A0A0' : index === 2 ? '#CD7F32' : '#52525b',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ============================================ */}
        {/* DISPONIBILIDADE RÁPIDA (moved below analytics) */}
        {/* ============================================ */}
        <Card className="border-zinc-800/60 bg-zinc-900/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-white">
                  Disponibilidade Rápida
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
                                      {formatCurrency(typeof product.price === 'string' ? parseFloat(product.price) : product.price)}
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
                    {pausedProductsCount} pausados
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientAdminLayout>
  );
}
