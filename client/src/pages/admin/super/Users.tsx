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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import {
  Users,
  Search,
  Building2,
  Trash2,
  UserCog,
  Filter,
  X,
  Calendar,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
  Mail,
  KeyRound,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  user: "Usuário",
  admin: "Admin",
  super_admin: "Super Admin",
  client_admin: "Lojista",
};

const roleBadgeColors: Record<string, string> = {
  super_admin: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  client_admin: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  admin: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  user: "bg-zinc-700/50 text-zinc-400 border border-zinc-600/30",
};

const statusBadge = {
  active: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  inactive: "bg-red-500/20 text-red-400 border border-red-500/30",
};

type FilterState = {
  search: string;
  tenantId: string; // "all" | tenant id
  role: string; // "all" | role value
  status: string; // "all" | "active" | "inactive"
  authMethod: string; // "all" | "email" | "google" | "manus"
  dateFrom: string; // ISO date string or ""
  dateTo: string; // ISO date string or ""
};

const defaultFilters: FilterState = {
  search: "",
  tenantId: "all",
  role: "all",
  status: "all",
  authMethod: "all",
  dateFrom: "",
  dateTo: "",
};

export default function UsersPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingUser, setEditingUser] = useState<{
    id: number;
    role: string;
    tenantId: number | null;
  } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: usersList, isLoading } = trpc.users.list.useQuery();
  const { data: tenants } = trpc.tenants.list.useQuery();

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Papel do usuário atualizado!");
      utils.users.list.invalidate();
      setEditingUser(null);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const toggleActiveMutation = trpc.users.toggleActive.useMutation({
    onSuccess: (_data: any, variables: any) => {
      toast.success(
        variables.isActive ? "Usuário ativado!" : "Usuário desativado!"
      );
      utils.users.list.invalidate();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("Usuário excluído!");
      utils.users.list.invalidate();
      setDeleteConfirmId(null);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateFilter = useCallback(
    (key: keyof FilterState, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const hasActiveAdvancedFilters = useMemo(() => {
    return (
      filters.role !== "all" ||
      filters.status !== "all" ||
      filters.authMethod !== "all" ||
      filters.dateFrom !== "" ||
      filters.dateTo !== ""
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.role !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.authMethod !== "all") count++;
    if (filters.dateFrom || filters.dateTo) count++;
    return count;
  }, [filters]);

  const clearAdvancedFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      role: "all",
      status: "all",
      authMethod: "all",
      dateFrom: "",
      dateTo: "",
    }));
  }, []);

  const filteredUsers = useMemo(() => {
    if (!usersList) return [];

    return usersList.filter((u) => {
      // Search filter (name, email, login)
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesSearch =
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.loginMethod?.toLowerCase().includes(q) ||
          roleLabels[u.role]?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Tenant filter
      if (filters.tenantId !== "all") {
        if (u.tenantId?.toString() !== filters.tenantId) return false;
      }

      // Role filter
      if (filters.role !== "all") {
        if (u.role !== filters.role) return false;
      }

      // Status filter
      if (filters.status !== "all") {
        const isActive = u.isActive !== false; // default true
        if (filters.status === "active" && !isActive) return false;
        if (filters.status === "inactive" && isActive) return false;
      }

      // Auth method filter
      if (filters.authMethod !== "all") {
        const method = (u.loginMethod || "").toLowerCase();
        if (filters.authMethod === "email" && method !== "email") return false;
        if (filters.authMethod === "google" && method !== "google")
          return false;
        if (filters.authMethod === "manus" && method !== "manus") return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        const created = new Date(u.createdAt);
        if (created < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        const created = new Date(u.createdAt);
        if (created > to) return false;
      }

      return true;
    });
  }, [usersList, filters]);

  // Stats
  const stats = useMemo(() => {
    if (!usersList) return { total: 0, superAdmins: 0, lojistas: 0, users: 0, active: 0, inactive: 0 };
    return {
      total: usersList.length,
      superAdmins: usersList.filter((u) => u.role === "super_admin").length,
      lojistas: usersList.filter((u) => u.role === "client_admin").length,
      users: usersList.filter((u) => u.role === "user" || u.role === "admin").length,
      active: usersList.filter((u) => u.isActive !== false).length,
      inactive: usersList.filter((u) => u.isActive === false).length,
    };
  }, [usersList]);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Usuários</h1>
          <p className="text-zinc-400 mt-1">
            Gerencie todos os usuários da plataforma
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="bg-zinc-900/80 border-zinc-800/60">
            <CardContent className="p-3">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Total</p>
              <p className="text-2xl font-bold text-white mt-0.5">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/80 border-zinc-800/60">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="h-3 w-3 text-amber-500" />
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Super Admins</p>
              </div>
              <p className="text-2xl font-bold text-amber-500 mt-0.5">{stats.superAdmins}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/80 border-zinc-800/60">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-blue-400" />
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Lojistas</p>
              </div>
              <p className="text-2xl font-bold text-blue-400 mt-0.5">{stats.lojistas}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/80 border-zinc-800/60">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-zinc-400" />
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Usuários</p>
              </div>
              <p className="text-2xl font-bold text-zinc-300 mt-0.5">{stats.users}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/80 border-zinc-800/60">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5">
                <UserCheck className="h-3 w-3 text-emerald-400" />
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Ativos</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400 mt-0.5">{stats.active}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/80 border-zinc-800/60">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5">
                <UserX className="h-3 w-3 text-red-400" />
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Inativos</p>
              </div>
              <p className="text-2xl font-bold text-red-400 mt-0.5">{stats.inactive}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="space-y-3">
          {/* Primary Filters (always visible) */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Buscar por nome, email ou login..."
                className="pl-10 bg-zinc-900/80 border-zinc-800/60 focus:border-amber-500/50 focus:ring-amber-500/20 h-10"
              />
              {filters.search && (
                <button
                  onClick={() => updateFilter("search", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Tenant Filter */}
            <Select
              value={filters.tenantId}
              onValueChange={(v) => updateFilter("tenantId", v)}
            >
              <SelectTrigger className="w-full sm:w-[220px] bg-zinc-900/80 border-zinc-800/60 h-10">
                <Building2 className="h-4 w-4 text-zinc-500 mr-2 shrink-0" />
                <SelectValue placeholder="Todas as lojas" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">Todas as lojas</SelectItem>
                {tenants?.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`h-10 border-zinc-800/60 gap-2 shrink-0 ${
                hasActiveAdvancedFilters
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="bg-amber-500 text-black text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              {showAdvanced ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          {/* Advanced Filters Panel (collapsible) */}
          {showAdvanced && (
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-lg p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-amber-500" />
                  Filtros Avançados
                </h3>
                {hasActiveAdvancedFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAdvancedFilters}
                    className="text-zinc-500 hover:text-white h-7 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpar filtros
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Role Filter */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="h-3 w-3" />
                    Nível de Acesso
                  </Label>
                  <Select
                    value={filters.role}
                    onValueChange={(v) => updateFilter("role", v)}
                  >
                    <SelectTrigger className="bg-zinc-900/80 border-zinc-800/60 h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="all">Todos os papéis</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="client_admin">Lojista</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">Usuário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="h-3 w-3" />
                    Status
                  </Label>
                  <Select
                    value={filters.status}
                    onValueChange={(v) => updateFilter("status", v)}
                  >
                    <SelectTrigger className="bg-zinc-900/80 border-zinc-800/60 h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Auth Method Filter */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="h-3 w-3" />
                    Autenticação
                  </Label>
                  <Select
                    value={filters.authMethod}
                    onValueChange={(v) => updateFilter("authMethod", v)}
                  >
                    <SelectTrigger className="bg-zinc-900/80 border-zinc-800/60 h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="all">Todos os métodos</SelectItem>
                      <SelectItem value="email">E-mail/Senha</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="manus">Manus OAuth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Data de Cadastro
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => updateFilter("dateFrom", e.target.value)}
                      className="bg-zinc-900/80 border-zinc-800/60 h-9 text-xs flex-1"
                      placeholder="De"
                    />
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => updateFilter("dateTo", e.target.value)}
                      className="bg-zinc-900/80 border-zinc-800/60 h-9 text-xs flex-1"
                      placeholder="Até"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {(filters.search || filters.tenantId !== "all" || hasActiveAdvancedFilters) && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>
                Exibindo {filteredUsers.length} de {usersList?.length || 0} usuários
              </span>
              {(filters.search || filters.tenantId !== "all" || hasActiveAdvancedFilters) && (
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="text-amber-500 hover:text-amber-400 underline"
                >
                  Limpar todos
                </button>
              )}
            </div>
          )}
        </div>

        {/* Users Table */}
        <Card className="bg-zinc-900/80 border-zinc-800/60">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-zinc-500">
                <div className="w-8 h-8 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
                Carregando usuários...
              </div>
            ) : !filteredUsers?.length ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">Nenhum usuário encontrado</p>
                {hasActiveAdvancedFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters(defaultFilters)}
                    className="mt-2 text-amber-500 hover:text-amber-400"
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/60">
                      <th className="text-left p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="text-left p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                        Papel
                      </th>
                      <th className="text-left p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                        Loja
                      </th>
                      <th className="text-left p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                        Auth
                      </th>
                      <th className="text-left p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                        Cadastro
                      </th>
                      <th className="text-right p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const isActive = user.isActive !== false;
                      return (
                        <tr
                          key={user.id}
                          className={`border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors ${
                            !isActive ? "opacity-50" : ""
                          }`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                                  isActive
                                    ? "bg-zinc-800 text-zinc-300"
                                    : "bg-zinc-800/50 text-zinc-600"
                                }`}
                              >
                                {user.avatarUrl ? (
                                  <img
                                    src={user.avatarUrl}
                                    alt=""
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  user.name?.charAt(0)?.toUpperCase() || "?"
                                )}
                              </div>
                              <span className="text-white font-medium text-sm">
                                {user.name || "—"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-zinc-400 text-sm">
                            {user.email || "—"}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                roleBadgeColors[user.role] ||
                                roleBadgeColors.user
                              }`}
                            >
                              {roleLabels[user.role] || user.role}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-400 text-sm">
                            {user.tenantName ? (
                              <span className="flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                                {user.tenantName}
                              </span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="flex items-center gap-1.5 text-zinc-400 text-sm">
                              {user.loginMethod === "google" ? (
                                <>
                                  <svg
                                    className="h-3.5 w-3.5"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                  </svg>
                                  Google
                                </>
                              ) : user.loginMethod === "email" ? (
                                <>
                                  <Mail className="h-3.5 w-3.5" />
                                  Email
                                </>
                              ) : (
                                <>
                                  <KeyRound className="h-3.5 w-3.5" />
                                  {user.loginMethod || "Manus"}
                                </>
                              )}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                isActive
                                  ? statusBadge.active
                                  : statusBadge.inactive
                              }`}
                            >
                              {isActive ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-500 text-sm">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "pt-BR"
                                )
                              : "—"}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-1">
                              {/* Toggle Active */}
                              <Switch
                                checked={isActive}
                                onCheckedChange={(checked) =>
                                  toggleActiveMutation.mutate({
                                    userId: user.id,
                                    isActive: checked,
                                  })
                                }
                                className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-zinc-700 scale-75"
                              />
                              {/* Edit Role */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-400 hover:text-white"
                                onClick={() =>
                                  setEditingUser({
                                    id: user.id,
                                    role: user.role,
                                    tenantId: user.tenantId,
                                  })
                                }
                              >
                                <UserCog className="h-4 w-4" />
                              </Button>
                              {/* Delete */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-400 hover:text-red-400"
                                onClick={() => setDeleteConfirmId(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
      </div>

      {/* Edit Role Dialog */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              Alterar Papel do Usuário
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Defina o papel e a loja associada ao usuário.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Papel</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) =>
                    setEditingUser({ ...editingUser, role: value })
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client_admin">Lojista</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(editingUser.role === "client_admin" ||
                editingUser.role === "user") && (
                <div className="space-y-2">
                  <Label className="text-white">Loja Associada</Label>
                  <Select
                    value={editingUser.tenantId?.toString() || "none"}
                    onValueChange={(value) =>
                      setEditingUser({
                        ...editingUser,
                        tenantId: value === "none" ? null : parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Selecione uma loja" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {tenants?.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingUser(null)}
              className="border-zinc-700 text-zinc-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!editingUser) return;
                updateRoleMutation.mutate({
                  userId: editingUser.id,
                  role: editingUser.role as any,
                  tenantId: editingUser.tenantId,
                });
              }}
              disabled={updateRoleMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {updateRoleMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Excluir Usuário</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser
              desfeita. Considere desativar o usuário ao invés de excluí-lo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="border-zinc-700 text-zinc-300"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirmId &&
                deleteMutation.mutate({ id: deleteConfirmId })
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
}
