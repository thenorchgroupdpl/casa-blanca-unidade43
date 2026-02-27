import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";
import { trpc } from "@/lib/trpc";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Key,
  Palette,
  Search,
  Store,
  LogIn,
  Globe,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  X,
  ChevronDown,
  Filter,
  ExternalLink,
  Settings2,
  Wifi,
  WifiOff,
  MapPin,
  Crown,
  Sparkles,
  Zap,
  ClipboardCopy,
  FileCheck,
} from "lucide-react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLocation } from "wouter";

// ============================================
// TYPES
// ============================================

type TenantFormData = {
  name: string;
  slug: string;
  cnpj: string;
  razaoSocial: string;
  emailDono: string;
  telefoneDono: string;
  domainCustom: string;
  subscriptionPlan: "starter" | "professional" | "enterprise";
  clientStatus: "active" | "disabled" | "implementing";
  landingStatus: "published" | "draft" | "error";
  niche: string;
  city: string;
  state: string;
  googleApiKey: string;
  googlePlaceId: string;
  themeColors: {
    primary: string;
    background: string;
    foreground: string;
    accent: string;
    muted: string;
  };
  fontFamily: string;
  fontDisplay: string;
  borderRadius: string;
  isActive: boolean;
};

const defaultFormData: TenantFormData = {
  name: "",
  slug: "",
  cnpj: "",
  razaoSocial: "",
  emailDono: "",
  telefoneDono: "",
  domainCustom: "",
  subscriptionPlan: "starter",
  clientStatus: "implementing",
  landingStatus: "draft",
  niche: "",
  city: "",
  state: "",
  googleApiKey: "",
  googlePlaceId: "",
  themeColors: {
    primary: "#D4AF37",
    background: "#121212",
    foreground: "#FFFFFF",
    accent: "#1a1a1a",
    muted: "#a1a1aa",
  },
  fontFamily: "DM Sans",
  fontDisplay: "DM Serif Display",
  borderRadius: "0.75rem",
  isActive: true,
};

// ============================================
// HELPER COMPONENTS
// ============================================

const statusConfig = {
  active: { label: "Ativo", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  disabled: { label: "Desativado", color: "bg-red-500/15 text-red-400 border-red-500/30", icon: XCircle },
  implementing: { label: "Implementação", color: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: Clock },
};

const landingConfig = {
  published: { label: "Publicada", color: "bg-emerald-500/15 text-emerald-400" },
  draft: { label: "Rascunho", color: "bg-zinc-500/15 text-zinc-400" },
  error: { label: "Erro", color: "bg-red-500/15 text-red-400" },
};

const planConfig = {
  starter: { label: "Starter", color: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30", icon: Zap },
  professional: { label: "Professional", color: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: Sparkles },
  enterprise: { label: "Enterprise", color: "bg-purple-500/15 text-purple-400 border-purple-500/30", icon: Crown },
};

function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function PlanBadge({ plan }: { plan: keyof typeof planConfig }) {
  const config = planConfig[plan];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

const onboardingConfig = {
  pending: { label: "Briefing Pendente", color: "bg-orange-500/15 text-orange-400 border-orange-500/30", icon: FileText },
  submitted: { label: "Briefing Enviado", color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30", icon: FileCheck },
  reviewed: { label: "Briefing Revisado", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
};

function OnboardingBadge({ status, token }: { status?: string | null; token?: string | null }) {
  const effectiveStatus = status || "pending";
  const config = onboardingConfig[effectiveStatus as keyof typeof onboardingConfig] || onboardingConfig.pending;
  const Icon = config.icon;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    const url = `${window.location.origin}/onboarding/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link de briefing copiado!");
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
      {token && effectiveStatus === "pending" && (
        <button onClick={handleCopyLink} className="ml-1 hover:opacity-70" title="Copiar link de briefing">
          <ClipboardCopy className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

// Searchable Dropdown Filter
function SearchableFilter({
  label,
  options,
  selected,
  onSelect,
  icon: Icon,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onSelect: (values: string[]) => void;
  icon?: React.ElementType;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onSelect(selected.filter((v) => v !== value));
    } else {
      onSelect([...selected, value]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
          selected.length > 0
            ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
            : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
        }`}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {label}
        {selected.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
            {selected.length}
          </span>
        )}
        <ChevronDown className="h-3 w-3 ml-1" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {options.length > 5 && (
            <div className="p-2 border-b border-zinc-800">
              <Input
                placeholder={`Buscar ${label.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 bg-zinc-800 border-zinc-700 text-sm"
                autoFocus
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length > 0 ? (
              filtered.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggle(option.value)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    selected.includes(option.value)
                      ? "bg-amber-500/15 text-amber-400"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      selected.includes(option.value)
                        ? "border-amber-500 bg-amber-500"
                        : "border-zinc-600"
                    }`}
                  >
                    {selected.includes(option.value) && (
                      <CheckCircle2 className="h-3 w-3 text-black" />
                    )}
                  </div>
                  {option.label}
                </button>
              ))
            ) : (
              <p className="text-xs text-zinc-500 text-center py-3">Nenhum resultado</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TenantsPage() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [manageTenantId, setManageTenantId] = useState<number | null>(null);
  const [formData, setFormData] = useState<TenantFormData>(defaultFormData);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [planFilter, setPlanFilter] = useState<string[]>([]);
  const [nicheFilter, setNicheFilter] = useState<string[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  const utils = trpc.useUtils();
  const { data: tenants, isLoading } = trpc.tenants.list.useQuery();
  const { data: filterOptions } = trpc.tenants.filterOptions.useQuery();

  // Management panel data
  const { data: managedTenant, isLoading: isLoadingManaged } = trpc.tenants.getTenantWithSettings.useQuery(
    { id: manageTenantId! },
    { enabled: manageTenantId !== null }
  );

  // Mutations
  const createMutation = trpc.tenants.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente criado com sucesso!");
      utils.tenants.list.invalidate();
      utils.tenants.filterOptions.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateContractualMutation = trpc.tenants.updateContractual.useMutation({
    onSuccess: () => {
      toast.success("Dados atualizados com sucesso!");
      utils.tenants.list.invalidate();
      utils.tenants.getTenantWithSettings.invalidate();
      utils.tenants.filterOptions.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.tenants.delete.useMutation({
    onSuccess: () => {
      toast.success("Cliente excluído com sucesso!");
      utils.tenants.list.invalidate();
      utils.tenants.filterOptions.invalidate();
      setDeleteConfirmId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const assumeTenantMutation = trpc.tenants.assumeTenant.useMutation({
    onSuccess: () => {
      toast.success("Acesso direto ativado!");
      utils.auth.getRole.invalidate();
      setLocation("/admin/dashboard");
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  // Filter logic
  const filteredTenants = useMemo(() => {
    if (!tenants) return [];
    return tenants.filter((t) => {
      // Search
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchSlug = t.slug.toLowerCase().includes(q);
        const matchCnpj = t.cnpj?.toLowerCase().includes(q);
        if (!matchName && !matchSlug && !matchCnpj) return false;
      }
      // Status filter
      if (statusFilter.length > 0 && !statusFilter.includes(t.clientStatus)) return false;
      // Plan filter
      if (planFilter.length > 0 && !planFilter.includes(t.subscriptionPlan)) return false;
      // Niche filter
      if (nicheFilter.length > 0 && (!t.niche || !nicheFilter.includes(t.niche))) return false;
      return true;
    });
  }, [tenants, debouncedSearch, statusFilter, planFilter, nicheFilter]);

  const activeFilterCount = statusFilter.length + planFilter.length + nicheFilter.length;

  const clearAllFilters = () => {
    setStatusFilter([]);
    setPlanFilter([]);
    setNicheFilter([]);
    setSearchQuery("");
    setDebouncedSearch("");
  };

  const resetForm = () => setFormData(defaultFormData);

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleCreateSubmit = () => {
    createMutation.mutate(formData);
  };

  // ============================================
  // MANAGEMENT PANEL STATE
  // ============================================
  const [editFields, setEditFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (managedTenant) {
      setEditFields({
        cnpj: managedTenant.cnpj || "",
        razaoSocial: managedTenant.razaoSocial || "",
        emailDono: managedTenant.emailDono || "",
        telefoneDono: managedTenant.telefoneDono || "",
        domainCustom: managedTenant.domainCustom || "",
        slug: managedTenant.slug || "",
        niche: managedTenant.niche || "",
        city: managedTenant.city || "",
        state: managedTenant.state || "",
        clientStatus: managedTenant.clientStatus || "implementing",
        subscriptionPlan: managedTenant.subscriptionPlan || "starter",
        landingStatus: managedTenant.landingStatus || "draft",
      });
    }
  }, [managedTenant]);

  const handleSaveContractual = () => {
    if (!manageTenantId) return;
    updateContractualMutation.mutate({
      id: manageTenantId,
      cnpj: editFields.cnpj || undefined,
      razaoSocial: editFields.razaoSocial || undefined,
      emailDono: editFields.emailDono || undefined,
      telefoneDono: editFields.telefoneDono || undefined,
      domainCustom: editFields.domainCustom || undefined,
      slug: editFields.slug || undefined,
      niche: editFields.niche || undefined,
      city: editFields.city || undefined,
      state: editFields.state || undefined,
      clientStatus: editFields.clientStatus as any || undefined,
      subscriptionPlan: editFields.subscriptionPlan as any || undefined,
      landingStatus: editFields.landingStatus as any || undefined,
    });
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Clientes</h1>
            <p className="text-zinc-400 mt-1">
              Gerencie as lojas cadastradas na plataforma
            </p>
          </div>
          <Button
            onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Search & Filters Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar por nome, slug ou CNPJ..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 h-11"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setDebouncedSearch(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <Filter className="h-4 w-4" />
              FILTROS
            </div>

            <SearchableFilter
              label="Status"
              icon={CheckCircle2}
              options={[
                { value: "active", label: "Ativo" },
                { value: "disabled", label: "Desativado" },
                { value: "implementing", label: "Em Implementação" },
              ]}
              selected={statusFilter}
              onSelect={setStatusFilter}
            />

            <SearchableFilter
              label="Plano"
              icon={Crown}
              options={[
                { value: "starter", label: "Starter" },
                { value: "professional", label: "Professional" },
                { value: "enterprise", label: "Enterprise" },
              ]}
              selected={planFilter}
              onSelect={setPlanFilter}
            />

            <SearchableFilter
              label="Nicho"
              icon={Store}
              options={(filterOptions?.niches || []).map((n) => ({ value: n, label: n }))}
              selected={nicheFilter}
              onSelect={setNicheFilter}
            />

            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
                Limpar ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-zinc-500">
          {filteredTenants.length} cliente{filteredTenants.length !== 1 ? "s" : ""} encontrado{filteredTenants.length !== 1 ? "s" : ""}
        </p>

        {/* Tenants List */}
        {isLoading ? (
          <div className="text-zinc-500 text-center py-12">Carregando...</div>
        ) : filteredTenants.length > 0 ? (
          <div className="space-y-3">
            {filteredTenants.map((tenant) => (
              <Card
                key={tenant.id}
                className="bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 transition-all group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: tenant.themeColors?.primary
                            ? `${tenant.themeColors.primary}20`
                            : "rgba(212, 175, 55, 0.15)",
                        }}
                      >
                        <Building2
                          className="h-6 w-6"
                          style={{ color: tenant.themeColors?.primary || "#D4AF37" }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-white text-lg truncate">
                            {tenant.name}
                          </h3>
                          <StatusBadge status={tenant.clientStatus as keyof typeof statusConfig} />
                          <PlanBadge plan={tenant.subscriptionPlan as keyof typeof planConfig} />
                          <OnboardingBadge status={(tenant as any).onboardingStatus} token={(tenant as any).onboardingToken} />
                        </div>

                        <div className="flex items-center gap-4 mt-1.5 text-sm text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" />
                            /{tenant.slug}
                          </span>
                          {tenant.cnpj && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              {tenant.cnpj}
                            </span>
                          )}
                          {tenant.city && tenant.state && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {tenant.city}/{tenant.state}
                            </span>
                          )}
                          {tenant.niche && (
                            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                              {tenant.niche}
                            </Badge>
                          )}
                        </div>

                        {/* Landing & Integration indicators */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${landingConfig[tenant.landingStatus as keyof typeof landingConfig]?.color || "bg-zinc-500/15 text-zinc-400"}`}>
                            {landingConfig[tenant.landingStatus as keyof typeof landingConfig]?.label || "—"}
                          </span>
                          {tenant.googleApiKey ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                              <Wifi className="h-3 w-3" /> API conectada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-600">
                              <WifiOff className="h-3 w-3" /> Sem API
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Login As */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 gap-1.5"
                        onClick={() => assumeTenantMutation.mutate({ tenantId: tenant.id })}
                        disabled={assumeTenantMutation.isPending}
                        title="Acesso Direto - Entrar como lojista"
                      >
                        <LogIn className="h-4 w-4" />
                        <span className="text-xs font-medium hidden lg:inline">Acesso Direto</span>
                      </Button>

                      {/* Design System Editor */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-1.5"
                        onClick={() => setLocation(`/admin/super/design?tenant=${tenant.id}`)}
                        title="Editor de Design System"
                      >
                        <Palette className="h-4 w-4" />
                        <span className="text-xs font-medium hidden lg:inline">Design</span>
                      </Button>

                      {/* View Landing */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-700"
                        onClick={() => window.open(`/${tenant.slug}`, "_blank")}
                        title="Ver Landing Page"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Manage */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 text-zinc-400 hover:text-white hover:bg-zinc-700 gap-1.5"
                        onClick={() => setManageTenantId(tenant.id)}
                        title="Gerenciar Cliente"
                      >
                        <Settings2 className="h-4 w-4" />
                        <span className="text-xs font-medium hidden lg:inline">Gerenciar</span>
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => setDeleteConfirmId(tenant.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg font-medium">Nenhum cliente encontrado</p>
            <p className="text-sm text-zinc-600 mt-2">
              {activeFilterCount > 0 || searchQuery
                ? "Tente ajustar os filtros ou a busca"
                : 'Clique em "Novo Cliente" para adicionar o primeiro'}
            </p>
          </div>
        )}

        {/* ============================================ */}
        {/* CREATE DIALOG */}
        {/* ============================================ */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Preencha os dados para criar um novo cliente
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="bg-zinc-800 border-zinc-700">
                <TabsTrigger value="basic" className="data-[state=active]:bg-zinc-700">Básico</TabsTrigger>
                <TabsTrigger value="contract" className="data-[state=active]:bg-zinc-700">
                  <FileText className="h-4 w-4 mr-2" />Contrato
                </TabsTrigger>
                <TabsTrigger value="integrations" className="data-[state=active]:bg-zinc-700">
                  <Key className="h-4 w-4 mr-2" />APIs
                </TabsTrigger>

              </TabsList>

              {/* Basic Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nome da Loja</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      });
                    }}
                    placeholder="Ex: Casa Blanca"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">/</span>
                    <Input
                      value={formData.slug}
                      onChange={(e) => {
                        const sanitized = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")
                          .replace(/-+/g, "-")
                          .replace(/^-/, "");
                        setFormData({ ...formData, slug: sanitized });
                      }}
                      placeholder="casa-blanca"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nicho</Label>
                    <CreatableCombobox
                      value={formData.niche}
                      onChange={(val) => setFormData({ ...formData, niche: val })}
                      options={filterOptions?.niches || []}
                      placeholder="Selecione o nicho..."
                      searchPlaceholder="Buscar nicho..."
                      createLabel="Criar nicho"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plano</Label>
                    <select
                      value={formData.subscriptionPlan}
                      onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm"
                    >
                      <option value="starter">Starter</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <CreatableCombobox
                      value={formData.city}
                      onChange={(val) => setFormData({ ...formData, city: val })}
                      options={filterOptions?.cities || []}
                      placeholder="Selecione a cidade..."
                      searchPlaceholder="Buscar cidade..."
                      createLabel="Criar cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado (UF)</Label>
                    <CreatableCombobox
                      value={formData.state}
                      onChange={(val) => setFormData({ ...formData, state: val.toUpperCase().slice(0, 2) })}
                      options={filterOptions?.states || []}
                      placeholder="Selecione o estado..."
                      searchPlaceholder="Buscar estado..."
                      createLabel="Criar estado"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800">
                  <div>
                    <Label>Status</Label>
                    <p className="text-sm text-zinc-500">
                      {formData.isActive ? "Loja ativa e visível" : "Loja desativada"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </TabsContent>

              {/* Contract Tab */}
              <TabsContent value="contract" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="12.345.678/0001-90"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Razão Social</Label>
                  <Input
                    value={formData.razaoSocial}
                    onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                    placeholder="Empresa Ltda."
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail do Dono</Label>
                  <Input
                    value={formData.emailDono}
                    onChange={(e) => setFormData({ ...formData, emailDono: e.target.value })}
                    placeholder="dono@empresa.com"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone de Contato</Label>
                  <Input
                    value={formData.telefoneDono}
                    onChange={(e) => setFormData({ ...formData, telefoneDono: e.target.value })}
                    placeholder="(34) 99120-1913"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              </TabsContent>

              {/* Integrations Tab */}
              <TabsContent value="integrations" className="space-y-4 mt-4">
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-400">
                    Estas configurações são sensíveis e só podem ser editadas pelo Super Admin.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Google Places API Key</Label>
                  <Input
                    type="password"
                    value={formData.googleApiKey}
                    onChange={(e) => setFormData({ ...formData, googleApiKey: e.target.value })}
                    placeholder="AIza..."
                    className="bg-zinc-800 border-zinc-700 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Google Place ID</Label>
                  <Input
                    value={formData.googlePlaceId}
                    onChange={(e) => setFormData({ ...formData, googlePlaceId: e.target.value })}
                    placeholder="ChIJ..."
                    className="bg-zinc-800 border-zinc-700 font-mono"
                  />
                </div>
              </TabsContent>


            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                Cancelar
              </Button>
              <Button
                onClick={handleCreateSubmit}
                disabled={createMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                {createMutation.isPending ? "Criando..." : "Criar Cliente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================ */}
        {/* MANAGEMENT PANEL (MODAL) */}
        {/* ============================================ */}
        <Dialog open={manageTenantId !== null} onOpenChange={(open) => { if (!open) setManageTenantId(null); }}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            {isLoadingManaged ? (
              <>
                <DialogHeader>
                  <DialogTitle>Gerenciar Cliente</DialogTitle>
                  <DialogDescription className="text-zinc-400">Carregando dados...</DialogDescription>
                </DialogHeader>
                <div className="text-center py-12 text-zinc-500">Carregando dados do cliente...</div>
              </>
            ) : managedTenant ? (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: managedTenant.themeColors?.primary
                          ? `${managedTenant.themeColors.primary}20`
                          : "rgba(212, 175, 55, 0.15)",
                      }}
                    >
                      <Building2
                        className="h-5 w-5"
                        style={{ color: managedTenant.themeColors?.primary || "#D4AF37" }}
                      />
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{managedTenant.name}</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Painel de gerenciamento detalhado
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <Tabs defaultValue="contractual" className="mt-4">
                  <TabsList className="bg-zinc-800 border-zinc-700 w-full justify-start">
                    <TabsTrigger value="contractual" className="data-[state=active]:bg-zinc-700">
                      <FileText className="h-4 w-4 mr-2" />Dados Contratuais
                    </TabsTrigger>
                    <TabsTrigger value="domain" className="data-[state=active]:bg-zinc-700">
                      <Globe className="h-4 w-4 mr-2" />Domínio
                    </TabsTrigger>
                    <TabsTrigger value="integrations" className="data-[state=active]:bg-zinc-700">
                      <Wifi className="h-4 w-4 mr-2" />Integrações
                    </TabsTrigger>
                    <TabsTrigger value="briefing" className="data-[state=active]:bg-zinc-700">
                      <FileCheck className="h-4 w-4 mr-2" />Briefing
                    </TabsTrigger>
                  </TabsList>

                  {/* Contractual Tab */}
                  <TabsContent value="contractual" className="space-y-5 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-400">CNPJ</Label>
                        <Input
                          value={editFields.cnpj || ""}
                          onChange={(e) => setEditFields({ ...editFields, cnpj: e.target.value })}
                          placeholder="12.345.678/0001-90"
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Razão Social</Label>
                        <Input
                          value={editFields.razaoSocial || ""}
                          onChange={(e) => setEditFields({ ...editFields, razaoSocial: e.target.value })}
                          placeholder="Empresa Ltda."
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-400">E-mail do Dono</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <Input
                            value={editFields.emailDono || ""}
                            onChange={(e) => setEditFields({ ...editFields, emailDono: e.target.value })}
                            placeholder="dono@empresa.com"
                            className="bg-zinc-800 border-zinc-700 pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Telefone de Contato</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <Input
                            value={editFields.telefoneDono || ""}
                            onChange={(e) => setEditFields({ ...editFields, telefoneDono: e.target.value })}
                            placeholder="(34) 99120-1913"
                            className="bg-zinc-800 border-zinc-700 pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-zinc-800" />

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Status do Cliente</Label>
                        <select
                          value={editFields.clientStatus || "implementing"}
                          onChange={(e) => setEditFields({ ...editFields, clientStatus: e.target.value })}
                          className="w-full h-10 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm"
                        >
                          <option value="active">Ativo</option>
                          <option value="disabled">Desativado</option>
                          <option value="implementing">Em Implementação</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Plano</Label>
                        <select
                          value={editFields.subscriptionPlan || "starter"}
                          onChange={(e) => setEditFields({ ...editFields, subscriptionPlan: e.target.value })}
                          className="w-full h-10 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm"
                        >
                          <option value="starter">Starter</option>
                          <option value="professional">Professional</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Landing Page</Label>
                        <select
                          value={editFields.landingStatus || "draft"}
                          onChange={(e) => setEditFields({ ...editFields, landingStatus: e.target.value })}
                          className="w-full h-10 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm"
                        >
                          <option value="published">Publicada</option>
                          <option value="draft">Rascunho</option>
                          <option value="error">Erro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Nicho</Label>
                        <Input
                          value={editFields.niche || ""}
                          onChange={(e) => setEditFields({ ...editFields, niche: e.target.value })}
                          placeholder="Restaurante"
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Cidade</Label>
                        <Input
                          value={editFields.city || ""}
                          onChange={(e) => setEditFields({ ...editFields, city: e.target.value })}
                          placeholder="Patos de Minas"
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Estado</Label>
                        <Input
                          value={editFields.state || ""}
                          onChange={(e) => setEditFields({ ...editFields, state: e.target.value.toUpperCase().slice(0, 2) })}
                          placeholder="MG"
                          maxLength={2}
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Domain Tab */}
                  <TabsContent value="domain" className="space-y-5 mt-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Subdomínio / Slug</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-sm whitespace-nowrap">seusite.com/</span>
                        <Input
                          value={editFields.slug || ""}
                          onChange={(e) => {
                            const sanitized = e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, "-")
                              .replace(/-+/g, "-")
                              .replace(/^-/, "");
                            setEditFields({ ...editFields, slug: sanitized });
                          }}
                          placeholder="restaurante-teste"
                          className="bg-zinc-800 border-zinc-700 font-mono"
                        />
                      </div>
                      <p className="text-xs text-zinc-500">
                        URL atual: /{editFields.slug || managedTenant.slug}
                      </p>
                    </div>

                    <Separator className="bg-zinc-800" />

                    <div className="space-y-2">
                      <Label className="text-zinc-400">Domínio Próprio (opcional)</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                          value={editFields.domainCustom || ""}
                          onChange={(e) => setEditFields({ ...editFields, domainCustom: e.target.value })}
                          placeholder="www.restaurante.com.br"
                          className="bg-zinc-800 border-zinc-700 pl-10 font-mono"
                        />
                      </div>
                      <p className="text-xs text-zinc-500">
                        Configure o DNS do domínio para apontar para a plataforma. Deixe vazio para usar apenas o slug.
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                      <h4 className="text-sm font-medium text-zinc-300 mb-2">Links de Acesso</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Landing Page:</span>
                          <a
                            href={`/${managedTenant.slug}`}
                            target="_blank"
                            className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                          >
                            /{managedTenant.slug} <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        {editFields.domainCustom && (
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500">Domínio Próprio:</span>
                            <span className="text-zinc-300 font-mono">{editFields.domainCustom}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Integrations Tab */}
                  <TabsContent value="integrations" className="space-y-5 mt-4">
                    <div className="grid grid-cols-1 gap-4">
                      {/* WhatsApp Status */}
                      <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              managedTenant.storeSettings?.whatsapp
                                ? "bg-emerald-500/15"
                                : "bg-zinc-700/50"
                            }`}>
                              <Phone className={`h-5 w-5 ${
                                managedTenant.storeSettings?.whatsapp
                                  ? "text-emerald-400"
                                  : "text-zinc-500"
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-white">WhatsApp</p>
                              <p className="text-sm text-zinc-500">
                                {managedTenant.storeSettings?.whatsapp || "Não configurado"}
                              </p>
                            </div>
                          </div>
                          {managedTenant.storeSettings?.whatsapp ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3" /> Conectado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-700/50 text-zinc-500 border border-zinc-600">
                              <XCircle className="h-3 w-3" /> Desconectado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Google API Status */}
                      <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              managedTenant.googleApiKey
                                ? "bg-blue-500/15"
                                : "bg-zinc-700/50"
                            }`}>
                              <Key className={`h-5 w-5 ${
                                managedTenant.googleApiKey
                                  ? "text-blue-400"
                                  : "text-zinc-500"
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-white">Google Places API</p>
                              <p className="text-sm text-zinc-500">
                                {managedTenant.googleApiKey ? "Chave configurada" : "Não configurado"}
                              </p>
                            </div>
                          </div>
                          {managedTenant.googleApiKey ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              <CheckCircle2 className="h-3 w-3" /> Conectado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-700/50 text-zinc-500 border border-zinc-600">
                              <XCircle className="h-3 w-3" /> Desconectado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Google Place ID Status */}
                      <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              managedTenant.googlePlaceId
                                ? "bg-emerald-500/15"
                                : "bg-zinc-700/50"
                            }`}>
                              <MapPin className={`h-5 w-5 ${
                                managedTenant.googlePlaceId
                                  ? "text-emerald-400"
                                  : "text-zinc-500"
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-white">Google Place ID</p>
                              <p className="text-sm text-zinc-500">
                                {managedTenant.googlePlaceId
                                  ? `${managedTenant.googlePlaceId.substring(0, 20)}...`
                                  : "Não configurado"}
                              </p>
                            </div>
                          </div>
                          {managedTenant.googlePlaceId ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3" /> Configurado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-700/50 text-zinc-500 border border-zinc-600">
                              <XCircle className="h-3 w-3" /> Pendente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs text-amber-400">
                        Para editar as chaves de API, use a aba "Integrações" na página de Integrações do Super Admin.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Briefing Tab */}
                  <TabsContent value="briefing" className="space-y-5 mt-4">
                    <BriefingPanel tenant={managedTenant} />
                  </TabsContent>
                </Tabs>

                <DialogFooter className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setManageTenantId(null)}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Fechar
                  </Button>
                  <Button
                    onClick={handleSaveContractual}
                    disabled={updateContractualMutation.isPending}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  >
                    {updateContractualMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Gerenciar Cliente</DialogTitle>
                  <DialogDescription className="text-zinc-400">Cliente não encontrado</DialogDescription>
                </DialogHeader>
                <div className="text-center py-12 text-zinc-500">Dados do cliente não disponíveis.</div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ============================================ */}
        {/* DELETE CONFIRMATION */}
        {/* ============================================ */}
        <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                Cancelar
              </Button>
              <Button
                onClick={() => deleteConfirmId && deleteMutation.mutate({ id: deleteConfirmId })}
                disabled={deleteMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {deleteMutation.isPending ? "Excluindo..." : "Excluir Cliente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
}

// ============================================
// BRIEFING PANEL COMPONENT
// ============================================

function BriefingPanel({ tenant }: { tenant: any }) {
  const utils = trpc.useUtils();
  const onboardingStatus = tenant.onboardingStatus || "pending";
  const onboardingToken = tenant.onboardingToken;
  const briefingData = tenant.onboardingData ? (typeof tenant.onboardingData === 'string' ? JSON.parse(tenant.onboardingData) : tenant.onboardingData) : null;

  const markReviewedMutation = trpc.onboarding.markReviewed.useMutation({
    onSuccess: () => {
      toast.success("Briefing marcado como revisado!");
      utils.tenants.getTenantWithSettings.invalidate();
      utils.tenants.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const generateTokenMutation = trpc.onboarding.generateToken.useMutation({
    onSuccess: (data) => {
      const url = `${window.location.origin}/onboarding/${data.token}`;
      navigator.clipboard.writeText(url);
      toast.success("Token gerado e link copiado!");
      utils.tenants.getTenantWithSettings.invalidate();
      utils.tenants.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCopyLink = () => {
    if (!onboardingToken) return;
    const url = `${window.location.origin}/onboarding/${onboardingToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Link de briefing copiado!");
  };

  // Pending state
  if (onboardingStatus === "pending") {
    return (
      <div className="space-y-4">
        <div className="p-6 rounded-xl bg-zinc-800/50 border border-zinc-700 text-center">
          <FileText className="h-12 w-12 text-orange-400 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-white mb-1">Briefing Pendente</h4>
          <p className="text-sm text-zinc-400 mb-4">O lojista ainda não preencheu o formulário de briefing.</p>
          {onboardingToken ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-3 border border-zinc-700">
                <code className="text-xs text-amber-400 flex-1 truncate">
                  {window.location.origin}/onboarding/{onboardingToken}
                </code>
                <Button size="sm" variant="outline" onClick={handleCopyLink} className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 shrink-0">
                  <ClipboardCopy className="h-3.5 w-3.5 mr-1" /> Copiar
                </Button>
              </div>
              <p className="text-xs text-zinc-500">Envie este link para o lojista preencher o briefing.</p>
            </div>
          ) : (
            <Button
              onClick={() => generateTokenMutation.mutate({ tenantId: tenant.id })}
              disabled={generateTokenMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              {generateTokenMutation.isPending ? "Gerando..." : "Gerar Link de Briefing"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Submitted or Reviewed state
  if (!briefingData) {
    return (
      <div className="p-6 rounded-xl bg-zinc-800/50 border border-zinc-700 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-3" />
        <p className="text-zinc-400">Dados do briefing não disponíveis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className={`p-4 rounded-lg border flex items-center justify-between ${
        onboardingStatus === "submitted"
          ? "bg-cyan-500/10 border-cyan-500/30"
          : "bg-emerald-500/10 border-emerald-500/30"
      }`}>
        <div className="flex items-center gap-3">
          {onboardingStatus === "submitted" ? (
            <FileCheck className="h-5 w-5 text-cyan-400" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          )}
          <div>
            <p className={`font-medium ${onboardingStatus === "submitted" ? "text-cyan-400" : "text-emerald-400"}`}>
              {onboardingStatus === "submitted" ? "Briefing Enviado — Aguardando Revisão" : "Briefing Revisado"}
            </p>
            <p className="text-xs text-zinc-500">
              Enviado em {briefingData.submittedAt ? new Date(briefingData.submittedAt).toLocaleDateString("pt-BR") : "—"}
            </p>
          </div>
        </div>
        {onboardingStatus === "submitted" && (
          <Button
            size="sm"
            onClick={() => markReviewedMutation.mutate({ tenantId: tenant.id })}
            disabled={markReviewedMutation.isPending}
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
          >
            {markReviewedMutation.isPending ? "Marcando..." : "Marcar como Revisado"}
          </Button>
        )}
      </div>

      {/* Briefing Data Sections */}
      <div className="space-y-3">
        {/* Identity */}
        <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
          <h5 className="text-sm font-semibold text-amber-400 mb-3">1. Identidade</h5>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-zinc-500">Loja:</span> <span className="text-white ml-1">{briefingData.storeName || "—"}</span></div>
            <div><span className="text-zinc-500">Nicho:</span> <span className="text-white ml-1">{briefingData.niche || "—"}</span></div>
            <div><span className="text-zinc-500">Proprietário:</span> <span className="text-white ml-1">{briefingData.ownerName || "—"}</span></div>
            <div><span className="text-zinc-500">Slogan:</span> <span className="text-white ml-1">{briefingData.slogan || "—"}</span></div>
          </div>
          {briefingData.description && (
            <div className="mt-2 text-sm"><span className="text-zinc-500">Descrição:</span> <span className="text-zinc-300 ml-1">{briefingData.description}</span></div>
          )}
        </div>

        {/* Contact */}
        <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
          <h5 className="text-sm font-semibold text-amber-400 mb-3">2. Contato & Endereço</h5>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-zinc-500">WhatsApp:</span> <span className="text-white ml-1">{briefingData.whatsapp || "—"}</span></div>
            <div><span className="text-zinc-500">Email:</span> <span className="text-white ml-1">{briefingData.email || "—"}</span></div>
            <div><span className="text-zinc-500">Instagram:</span> <span className="text-white ml-1">{briefingData.instagram || "—"}</span></div>
          </div>
          {briefingData.address && (
            <div className="mt-2 text-sm text-zinc-300">
              <span className="text-zinc-500">Endereço:</span>{" "}
              {briefingData.address.street}, {briefingData.address.number} {briefingData.address.complement && `- ${briefingData.address.complement}`}, {briefingData.address.neighborhood}, {briefingData.address.city}/{briefingData.address.state} - {briefingData.address.cep}
            </div>
          )}
        </div>

        {/* Visual */}
        <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
          <h5 className="text-sm font-semibold text-amber-400 mb-3">3. Visual</h5>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-zinc-500">Cor primária:</span> <span className="inline-flex items-center gap-1.5 ml-1"><span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: briefingData.primaryColor || "#D4AF37" }} /><span className="text-white">{briefingData.primaryColor || "—"}</span></span></div>
            <div><span className="text-zinc-500">Cor secundária:</span> <span className="inline-flex items-center gap-1.5 ml-1"><span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: briefingData.secondaryColor || "#121212" }} /><span className="text-white">{briefingData.secondaryColor || "—"}</span></span></div>
          </div>
          {briefingData.visualNotes && (
            <div className="mt-2 text-sm"><span className="text-zinc-500">Notas visuais:</span> <span className="text-zinc-300 ml-1">{briefingData.visualNotes}</span></div>
          )}
          <div className="flex gap-3 mt-3">
            {briefingData.logoUrl && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Logo</p>
                <img src={briefingData.logoUrl} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-zinc-700" />
              </div>
            )}
            {briefingData.bannerUrl && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Banner</p>
                <img src={briefingData.bannerUrl} alt="Banner" className="w-32 h-16 rounded-lg object-cover border border-zinc-700" />
              </div>
            )}
          </div>
        </div>

        {/* Operations */}
        <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
          <h5 className="text-sm font-semibold text-amber-400 mb-3">4. Operação</h5>
          {briefingData.operatingHours && (
            <div className="text-sm mb-2"><span className="text-zinc-500">Horário:</span> <span className="text-white ml-1">{briefingData.operatingHours}</span></div>
          )}
          {briefingData.deliveryInfo && (
            <div className="text-sm mb-2"><span className="text-zinc-500">Entrega:</span> <span className="text-white ml-1">{briefingData.deliveryInfo}</span></div>
          )}
          {briefingData.paymentMethods && briefingData.paymentMethods.length > 0 && (
            <div className="text-sm"><span className="text-zinc-500">Pagamentos:</span> <span className="text-white ml-1">{briefingData.paymentMethods.join(", ")}</span></div>
          )}
        </div>

        {/* Menu */}
        {briefingData.categories && briefingData.categories.length > 0 && (
          <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
            <h5 className="text-sm font-semibold text-amber-400 mb-3">5. Cardápio ({briefingData.categories.length} categorias, {briefingData.products?.length || 0} produtos)</h5>
            <div className="space-y-2">
              {briefingData.categories.map((cat: any, i: number) => (
                <div key={i} className="text-sm">
                  <span className="text-zinc-300 font-medium">{cat.name}</span>
                  {cat.description && <span className="text-zinc-500 ml-2">— {cat.description}</span>}
                </div>
              ))}
            </div>
            {briefingData.products && briefingData.products.length > 0 && (
              <div className="mt-3 border-t border-zinc-700 pt-3">
                <div className="grid gap-2">
                  {briefingData.products.slice(0, 10).map((prod: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-300">{prod.name}</span>
                      <span className="text-amber-400 font-medium">R$ {Number(prod.price).toFixed(2)}</span>
                    </div>
                  ))}
                  {briefingData.products.length > 10 && (
                    <p className="text-xs text-zinc-500">...e mais {briefingData.products.length - 10} produtos</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
