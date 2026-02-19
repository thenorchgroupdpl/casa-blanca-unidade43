import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import {
  Building2,
  ChevronDown,
  ExternalLink,
  Filter,
  Globe,
  MapPin,
  Search,
  TrendingUp,
  Users,
  X,
  FileText,
  AlertCircle,
  Loader2,
  Crown,
  Rocket,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

// ─── Label Maps ───────────────────────────────────────────
const CLIENT_STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Ativo", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
  disabled: { label: "Desativado", color: "text-red-400", bg: "bg-red-500/15 border-red-500/30" },
  implementing: { label: "Em Implementação", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" },
};

const LANDING_STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  published: { label: "Publicada", color: "text-emerald-400", bg: "bg-emerald-500/15", icon: Globe },
  draft: { label: "Rascunho", color: "text-zinc-400", bg: "bg-zinc-500/15", icon: FileText },
  error: { label: "Erro", color: "text-red-400", bg: "bg-red-500/15", icon: AlertCircle },
};

const PLAN_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  starter: { label: "Starter", color: "text-zinc-300", bg: "bg-zinc-700/50", icon: Zap },
  professional: { label: "Professional", color: "text-blue-400", bg: "bg-blue-500/15", icon: Rocket },
  enterprise: { label: "Enterprise", color: "text-purple-400", bg: "bg-purple-500/15", icon: Crown },
};

// ─── Filter Chip Component ────────────────────────────────
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
        active
          ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
          : "bg-zinc-800/60 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Multi-Select Dropdown ────────────────────────────────
function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  icon: Icon,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  icon?: any;
}) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-9 gap-2 border-zinc-700/60 bg-zinc-800/40 text-zinc-300 hover:bg-zinc-800 hover:text-white ${
            selected.length > 0 ? "border-amber-500/40 text-amber-400" : ""
          }`}
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {label}
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-amber-500/20 text-amber-400 border-0">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 bg-zinc-900 border-zinc-700" align="start">
        <div className="space-y-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                selected.includes(opt.value)
                  ? "bg-amber-500/15 text-amber-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  selected.includes(opt.value)
                    ? "bg-amber-500 border-amber-500"
                    : "border-zinc-600"
                }`}
              >
                {selected.includes(opt.value) && (
                  <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {opt.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Main Dashboard Component ─────────────────────────────
export default function SuperAdminDashboard() {
  const [search, setSearch] = useState("");
  const [clientStatusFilter, setClientStatusFilter] = useState<string[]>([]);
  const [landingStatusFilter, setLandingStatusFilter] = useState<string[]>([]);
  const [planFilter, setPlanFilter] = useState<string[]>([]);
  const [nicheFilter, setNicheFilter] = useState<string[]>([]);
  const [cityFilter, setCityFilter] = useState<string[]>([]);
  const [stateFilter, setStateFilter] = useState<string[]>([]);

  // Build filter input for the query
  const filterInput = useMemo(
    () => ({
      search: search || undefined,
      clientStatus: clientStatusFilter.length > 0 ? clientStatusFilter : undefined,
      landingStatus: landingStatusFilter.length > 0 ? landingStatusFilter : undefined,
      subscriptionPlan: planFilter.length > 0 ? planFilter : undefined,
      niche: nicheFilter.length > 0 ? nicheFilter : undefined,
      city: cityFilter.length > 0 ? cityFilter : undefined,
      state: stateFilter.length > 0 ? stateFilter : undefined,
    }),
    [search, clientStatusFilter, landingStatusFilter, planFilter, nicheFilter, cityFilter, stateFilter]
  );

  const { data: stats, isLoading: statsLoading } = trpc.tenants.dashboardStats.useQuery();
  const { data: tenants, isLoading: tenantsLoading } = trpc.tenants.listFiltered.useQuery(filterInput);
  const { data: filterOptions } = trpc.tenants.filterOptions.useQuery();

  const hasActiveFilters =
    clientStatusFilter.length > 0 ||
    landingStatusFilter.length > 0 ||
    planFilter.length > 0 ||
    nicheFilter.length > 0 ||
    cityFilter.length > 0 ||
    stateFilter.length > 0 ||
    search.length > 0;

  const clearAllFilters = () => {
    setSearch("");
    setClientStatusFilter([]);
    setLandingStatusFilter([]);
    setPlanFilter([]);
    setNicheFilter([]);
    setCityFilter([]);
    setStateFilter([]);
  };

  const activeFilterCount =
    clientStatusFilter.length +
    landingStatusFilter.length +
    planFilter.length +
    nicheFilter.length +
    cityFilter.length +
    stateFilter.length;

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-zinc-400 mt-1">
              Visão geral da plataforma Casa Blanca
            </p>
          </div>
        </div>

        {/* ─── Stats Grid ─── */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-zinc-900/80 border-zinc-800/60 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Clientes</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {statsLoading ? "..." : stats?.total ?? 0}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <Building2 className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-emerald-400">{stats?.active ?? 0} ativos</span>
                <span className="text-xs text-zinc-600">•</span>
                <span className="text-xs text-amber-400">{stats?.implementing ?? 0} impl.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/80 border-zinc-800/60 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Landing Pages</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {statsLoading ? "..." : stats?.published ?? 0}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-green-500/10">
                  <Globe className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-emerald-400">{stats?.published ?? 0} publicadas</span>
                <span className="text-xs text-zinc-600">•</span>
                <span className="text-xs text-zinc-400">{stats?.draft ?? 0} rascunho</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/80 border-zinc-800/60 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Planos</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {statsLoading ? "..." : stats?.byPlan?.professional ?? 0}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-purple-400">{stats?.byPlan?.enterprise ?? 0} enterprise</span>
                <span className="text-xs text-zinc-600">•</span>
                <span className="text-xs text-zinc-400">{stats?.byPlan?.starter ?? 0} starter</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/80 border-zinc-800/60 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Usuários</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {statsLoading ? "..." : stats?.totalUsers ?? 0}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-500/10">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-zinc-400">Total cadastrados</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Search & Filters ─── */}
        <Card className="bg-zinc-900/80 border-zinc-800/60">
          <CardContent className="p-4 space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Buscar por nome, slug ou CNPJ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 bg-zinc-800/60 border-zinc-700/60 text-white placeholder:text-zinc-500 focus:border-amber-500/50 focus:ring-amber-500/20"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-zinc-400 hover:text-white shrink-0"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Limpar ({activeFilterCount})
                </Button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-zinc-500 mr-1">
                <Filter className="h-3.5 w-3.5" />
                <span className="text-xs font-medium uppercase tracking-wider">Filtros</span>
              </div>

              <Separator orientation="vertical" className="h-6 bg-zinc-800" />

              {/* Operação */}
              <FilterDropdown
                label="Status"
                options={[
                  { value: "active", label: "Ativo" },
                  { value: "disabled", label: "Desativado" },
                  { value: "implementing", label: "Em Implementação" },
                ]}
                selected={clientStatusFilter}
                onChange={setClientStatusFilter}
              />

              <FilterDropdown
                label="Landing Page"
                icon={Globe}
                options={[
                  { value: "published", label: "Publicada" },
                  { value: "draft", label: "Rascunho" },
                  { value: "error", label: "Erro" },
                ]}
                selected={landingStatusFilter}
                onChange={setLandingStatusFilter}
              />

              <FilterDropdown
                label="Plano"
                icon={Crown}
                options={[
                  { value: "starter", label: "Starter" },
                  { value: "professional", label: "Professional" },
                  { value: "enterprise", label: "Enterprise" },
                ]}
                selected={planFilter}
                onChange={setPlanFilter}
              />

              <Separator orientation="vertical" className="h-6 bg-zinc-800" />

              {/* Segmentação */}
              {filterOptions && filterOptions.niches.length > 0 && (
                <FilterDropdown
                  label="Nicho"
                  options={filterOptions.niches.map((n) => ({ value: n, label: n }))}
                  selected={nicheFilter}
                  onChange={setNicheFilter}
                />
              )}

              {filterOptions && filterOptions.states.length > 0 && (
                <FilterDropdown
                  label="Estado"
                  icon={MapPin}
                  options={filterOptions.states.map((s) => ({ value: s, label: s }))}
                  selected={stateFilter}
                  onChange={setStateFilter}
                />
              )}

              {filterOptions && filterOptions.cities.length > 0 && (
                <FilterDropdown
                  label="Cidade"
                  icon={MapPin}
                  options={filterOptions.cities.map((c) => ({ value: c, label: c }))}
                  selected={cityFilter}
                  onChange={setCityFilter}
                />
              )}
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 pt-1">
                {clientStatusFilter.map((s) => (
                  <FilterChip
                    key={`cs-${s}`}
                    label={CLIENT_STATUS_MAP[s]?.label ?? s}
                    active
                    onClick={() => setClientStatusFilter((prev) => prev.filter((v) => v !== s))}
                  />
                ))}
                {landingStatusFilter.map((s) => (
                  <FilterChip
                    key={`ls-${s}`}
                    label={LANDING_STATUS_MAP[s]?.label ?? s}
                    active
                    onClick={() => setLandingStatusFilter((prev) => prev.filter((v) => v !== s))}
                  />
                ))}
                {planFilter.map((s) => (
                  <FilterChip
                    key={`pl-${s}`}
                    label={PLAN_MAP[s]?.label ?? s}
                    active
                    onClick={() => setPlanFilter((prev) => prev.filter((v) => v !== s))}
                  />
                ))}
                {nicheFilter.map((s) => (
                  <FilterChip key={`ni-${s}`} label={s} active onClick={() => setNicheFilter((prev) => prev.filter((v) => v !== s))} />
                ))}
                {stateFilter.map((s) => (
                  <FilterChip key={`st-${s}`} label={s} active onClick={() => setStateFilter((prev) => prev.filter((v) => v !== s))} />
                ))}
                {cityFilter.map((s) => (
                  <FilterChip key={`ci-${s}`} label={s} active onClick={() => setCityFilter((prev) => prev.filter((v) => v !== s))} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Results Header ─── */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            {tenantsLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Carregando...
              </span>
            ) : (
              <>
                <span className="text-white font-medium">{tenants?.length ?? 0}</span>{" "}
                {(tenants?.length ?? 0) === 1 ? "cliente encontrado" : "clientes encontrados"}
              </>
            )}
          </p>
        </div>

        {/* ─── Client Cards ─── */}
        {tenantsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-zinc-900/80 border-zinc-800/60 animate-pulse">
                <CardContent className="p-5 space-y-4">
                  <div className="h-5 bg-zinc-800 rounded w-2/3" />
                  <div className="h-4 bg-zinc-800 rounded w-1/2" />
                  <div className="h-4 bg-zinc-800 rounded w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tenants && tenants.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tenants.map((tenant) => {
              const statusInfo = CLIENT_STATUS_MAP[tenant.clientStatus] ?? CLIENT_STATUS_MAP.implementing;
              const landingInfo = LANDING_STATUS_MAP[tenant.landingStatus] ?? LANDING_STATUS_MAP.draft;
              const planInfo = PLAN_MAP[tenant.subscriptionPlan] ?? PLAN_MAP.starter;
              const LandingIcon = landingInfo.icon;
              const PlanIcon = planInfo.icon;

              return (
                <Card
                  key={tenant.id}
                  className="bg-zinc-900/80 border-zinc-800/60 hover:border-zinc-700/80 transition-all group"
                >
                  <CardContent className="p-5">
                    {/* Top Row: Name + Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white text-base truncate group-hover:text-amber-400 transition-colors">
                          {tenant.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs text-zinc-500 font-mono">/{tenant.slug}</span>
                          <a
                            href={`/${tenant.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-600 hover:text-amber-400 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.bg}`}
                      >
                        <span className={statusInfo.color}>{statusInfo.label}</span>
                      </span>
                    </div>

                    {/* CNPJ */}
                    {tenant.cnpj && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">CNPJ</span>
                        <span className="text-xs text-zinc-300 font-mono">{tenant.cnpj}</span>
                      </div>
                    )}

                    <Separator className="bg-zinc-800/60 my-3" />

                    {/* Bottom Row: Plan + Landing + Location */}
                    <div className="flex items-center justify-between gap-2">
                      {/* Plan Badge */}
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${planInfo.bg}`}>
                        <PlanIcon className={`h-3 w-3 ${planInfo.color}`} />
                        <span className={`text-[11px] font-medium ${planInfo.color}`}>
                          {planInfo.label}
                        </span>
                      </div>

                      {/* Landing Status */}
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${landingInfo.bg}`}>
                        <LandingIcon className={`h-3 w-3 ${landingInfo.color}`} />
                        <span className={`text-[11px] font-medium ${landingInfo.color}`}>
                          {landingInfo.label}
                        </span>
                      </div>

                      {/* Location */}
                      {(tenant.city || tenant.state) && (
                        <div className="flex items-center gap-1 text-zinc-500">
                          <MapPin className="h-3 w-3" />
                          <span className="text-[11px]">
                            {[tenant.city, tenant.state].filter(Boolean).join("/")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Niche Tag */}
                    {tenant.niche && (
                      <div className="mt-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                          {tenant.niche}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-zinc-900/80 border-zinc-800/60">
            <CardContent className="py-16 text-center">
              <Building2 className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 font-medium">Nenhum cliente encontrado</p>
              <p className="text-sm text-zinc-600 mt-1">
                {hasActiveFilters
                  ? "Tente ajustar os filtros para ver mais resultados"
                  : 'Clique em "Clientes" no menu para adicionar'}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="mt-4 border-zinc-700 text-zinc-400 hover:text-white"
                >
                  Limpar Filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </SuperAdminLayout>
  );
}
