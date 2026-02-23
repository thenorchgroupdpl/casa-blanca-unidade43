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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  ChevronsUpDown,
  Mail,
  KeyRound,
  UserPlus,
  Eye,
  EyeOff,
  Lock,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { useState, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  user: "Funcionário",
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
  tenantId: string;
  role: string;
  status: string;
  authMethod: string;
  dateFrom: string;
  dateTo: string;
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

// ─── Password Reveal Cell ─────────────────────────────────────────
function PasswordCell({ password }: { password: string | null }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!password) {
    return <span className="text-zinc-600 text-xs italic">—</span>;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-zinc-300 font-mono min-w-[60px]">
        {visible ? password : "••••••"}
      </span>
      <button
        onClick={() => setVisible(!visible)}
        className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5"
        title={visible ? "Ocultar senha" : "Revelar senha"}
      >
        {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
      <button
        onClick={handleCopy}
        className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5"
        title="Copiar senha"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

// ─── Create User Form State ───────────────────────────────────────
type CreateUserForm = {
  name: string;
  email: string;
  password: string;
  role: string;
  tenantId: string;
  isActive: boolean;
};

const defaultCreateForm: CreateUserForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
  tenantId: "none",
  isActive: true,
};

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

// Strict email regex: no accents, no spaces, must have @ and valid domain
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const HAS_ACCENTS_OR_SPACES = /[\u00C0-\u024F\u1E00-\u1EFF\s]/;

export default function UsersPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Create user drawer
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserForm>(defaultCreateForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Edit user modal
  const [editingUser, setEditingUser] = useState<{
    id: number;
    role: string;
    tenantId: number | null;
    plainPassword: string | null;
    newPassword: string;
  } | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [editPasswordVisible, setEditPasswordVisible] = useState(false);

  // Combobox popover states
  const [filterTenantOpen, setFilterTenantOpen] = useState(false);
  const [createTenantOpen, setCreateTenantOpen] = useState(false);
  const [editTenantOpen, setEditTenantOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data: usersList, isLoading } = trpc.users.list.useQuery();
  const { data: tenants } = trpc.tenants.list.useQuery();

  const createUserMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      utils.users.list.invalidate();
      setShowCreateDrawer(false);
      setCreateForm(defaultCreateForm);
      setFieldErrors({});
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar usuário. Tente novamente.");
    },
  });

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Papel do usuário atualizado!");
      utils.users.list.invalidate();
      setEditingUser(null);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updatePasswordMutation = trpc.users.updatePassword.useMutation({
    onSuccess: () => {
      toast.success("Senha atualizada com sucesso!");
      utils.users.list.invalidate();
      if (editingUser) {
        setEditingUser({ ...editingUser, newPassword: "", plainPassword: editingUser.newPassword || editingUser.plainPassword });
      }
    },
    onError: (error: any) => toast.error(error.message),
  });

  const toggleActiveMutation = trpc.users.toggleActive.useMutation({
    onSuccess: (_data: any, variables: any) => {
      toast.success(variables.isActive ? "Usuário ativado!" : "Usuário desativado!");
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

  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const hasActiveAdvancedFilters = useMemo(() => {
    return filters.role !== "all" || filters.status !== "all" || filters.authMethod !== "all" || filters.dateFrom !== "" || filters.dateTo !== "";
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
    setFilters((prev) => ({ ...prev, role: "all", status: "all", authMethod: "all", dateFrom: "", dateTo: "" }));
  }, []);

  const filteredUsers = useMemo(() => {
    if (!usersList) return [];
    return usersList.filter((u) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesSearch = u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.loginMethod?.toLowerCase().includes(q) || roleLabels[u.role]?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (filters.tenantId !== "all" && u.tenantId?.toString() !== filters.tenantId) return false;
      if (filters.role !== "all" && u.role !== filters.role) return false;
      if (filters.status !== "all") {
        const isActive = u.isActive !== false;
        if (filters.status === "active" && !isActive) return false;
        if (filters.status === "inactive" && isActive) return false;
      }
      if (filters.authMethod !== "all") {
        const method = (u.loginMethod || "").toLowerCase();
        if (filters.authMethod === "email" && method !== "email") return false;
        if (filters.authMethod === "google" && method !== "google") return false;
        if (filters.authMethod === "manus" && method !== "manus") return false;
      }
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        if (new Date(u.createdAt) < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(u.createdAt) > to) return false;
      }
      return true;
    });
  }, [usersList, filters]);

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

  const validateCreateForm = (): FieldErrors => {
    const errors: FieldErrors = {};
    const name = createForm.name.trim();
    const email = createForm.email.trim();
    const password = createForm.password;

    if (!name) {
      errors.name = "Nome é obrigatório";
    }

    if (!email) {
      errors.email = "E-mail é obrigatório";
    } else if (HAS_ACCENTS_OR_SPACES.test(email)) {
      errors.email = "Formato de e-mail inválido (não use acentos ou espaços)";
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = "Formato de e-mail inválido";
    }

    if (!password) {
      errors.password = "Senha é obrigatória";
    } else if (password.length < 4) {
      errors.password = "Senha deve ter no mínimo 4 caracteres";
    }

    return errors;
  };

  const handleCreateUser = async () => {
    const errors = validateCreateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Corrija os campos destacados antes de salvar.");
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        name: createForm.name.trim(),
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password,
        role: createForm.role as any,
        tenantId: createForm.tenantId === "none" ? null : parseInt(createForm.tenantId),
        isActive: createForm.isActive,
      });
    } catch (error: any) {
      // Error is already handled by mutation's onError callback
      // This catch prevents unhandled promise rejection
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header with New User button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Usuários</h1>
            <p className="text-zinc-400 mt-1">Gerencie todos os usuários da plataforma</p>
          </div>
          <Button
            onClick={() => { setCreateForm(defaultCreateForm); setFieldErrors({}); setShowCreateDrawer(true); }}
            className="bg-amber-500 hover:bg-amber-600 text-black font-medium gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Novo Usuário
          </Button>
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
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Funcionários</p>
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
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Buscar por nome, email ou login..."
                className="pl-10 bg-zinc-900/80 border-zinc-800/60 focus:border-amber-500/50 focus:ring-amber-500/20 h-10"
              />
              {filters.search && (
                <button onClick={() => updateFilter("search", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Popover open={filterTenantOpen} onOpenChange={setFilterTenantOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={filterTenantOpen} className="w-full sm:w-[220px] bg-zinc-900/80 border-zinc-800/60 h-10 justify-between text-sm font-normal text-white hover:bg-zinc-800/80 hover:text-white">
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span className="truncate">{filters.tenantId === "all" ? "Todas as lojas" : tenants?.find(t => t.id.toString() === filters.tenantId)?.name || "Todas as lojas"}</span>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0 bg-zinc-900 border-zinc-800" align="start">
                <Command className="bg-zinc-900">
                  <CommandInput placeholder="Buscar empresa..." className="text-white" />
                  <CommandList>
                    <CommandEmpty className="text-zinc-400">Nenhuma empresa encontrada.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem value="all" onSelect={() => { updateFilter("tenantId", "all"); setFilterTenantOpen(false); }} className="text-white cursor-pointer">
                        <Check className={`mr-2 h-4 w-4 ${filters.tenantId === "all" ? "opacity-100 text-amber-500" : "opacity-0"}`} />
                        Todas as lojas
                      </CommandItem>
                      {tenants?.map((t) => (
                        <CommandItem key={t.id} value={t.name} onSelect={() => { updateFilter("tenantId", t.id.toString()); setFilterTenantOpen(false); }} className="text-white cursor-pointer">
                          <Check className={`mr-2 h-4 w-4 ${filters.tenantId === t.id.toString() ? "opacity-100 text-amber-500" : "opacity-0"}`} />
                          {t.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`h-10 border-zinc-800/60 gap-2 shrink-0 ${hasActiveAdvancedFilters ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" : "text-zinc-400 hover:text-white"}`}
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="bg-amber-500 text-black text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">{activeFilterCount}</span>
              )}
              {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvanced && (
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-lg p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-amber-500" />
                  Filtros Avançados
                </h3>
                {hasActiveAdvancedFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAdvancedFilters} className="text-zinc-500 hover:text-white h-7 text-xs">
                    <X className="h-3 w-3 mr-1" />Limpar filtros
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><Shield className="h-3 w-3" />Nível de Acesso</Label>
                  <Select value={filters.role} onValueChange={(v) => updateFilter("role", v)}>
                    <SelectTrigger className="bg-zinc-900/80 border-zinc-800/60 h-9"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="all">Todos os papéis</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="client_admin">Lojista</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">Funcionário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><UserCheck className="h-3 w-3" />Status</Label>
                  <Select value={filters.status} onValueChange={(v) => updateFilter("status", v)}>
                    <SelectTrigger className="bg-zinc-900/80 border-zinc-800/60 h-9"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><KeyRound className="h-3 w-3" />Autenticação</Label>
                  <Select value={filters.authMethod} onValueChange={(v) => updateFilter("authMethod", v)}>
                    <SelectTrigger className="bg-zinc-900/80 border-zinc-800/60 h-9"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="all">Todos os métodos</SelectItem>
                      <SelectItem value="email">E-mail/Senha</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="manus">Manus OAuth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><Calendar className="h-3 w-3" />Data de Cadastro</Label>
                  <div className="flex gap-2">
                    <Input type="date" value={filters.dateFrom} onChange={(e) => updateFilter("dateFrom", e.target.value)} className="bg-zinc-900/80 border-zinc-800/60 h-9 text-xs flex-1" />
                    <Input type="date" value={filters.dateTo} onChange={(e) => updateFilter("dateTo", e.target.value)} className="bg-zinc-900/80 border-zinc-800/60 h-9 text-xs flex-1" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {(filters.search || filters.tenantId !== "all" || hasActiveAdvancedFilters) && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>Exibindo {filteredUsers.length} de {usersList?.length || 0} usuários</span>
              <button onClick={() => setFilters(defaultFilters)} className="text-amber-500 hover:text-amber-400 underline">Limpar todos</button>
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
                  <Button variant="ghost" size="sm" onClick={() => setFilters(defaultFilters)} className="mt-2 text-amber-500 hover:text-amber-400">Limpar filtros</Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/60">
                      <th className="text-left p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Usuário</th>
                      <th className="text-left p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Email</th>
                      <th className="text-left p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Papel</th>
                      <th className="text-left p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Loja</th>
                      <th className="text-left p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Senha</th>
                      <th className="text-left p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Auth</th>
                      <th className="text-left p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                      <th className="text-left p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Cadastro</th>
                      <th className="text-right p-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const isActive = user.isActive !== false;
                      return (
                        <tr key={user.id} className={`border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors ${!isActive ? "opacity-50" : ""}`}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${isActive ? "bg-zinc-800 text-zinc-300" : "bg-zinc-800/50 text-zinc-600"}`}>
                                {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" /> : user.name?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <span className="text-white font-medium text-sm">{user.name || "—"}</span>
                            </div>
                          </td>
                          <td className="p-4 text-zinc-400 text-sm">{user.email || "—"}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${roleBadgeColors[user.role] || roleBadgeColors.user}`}>
                              {roleLabels[user.role] || user.role}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-400 text-sm">
                            {user.tenantName ? (
                              <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-zinc-500" />{user.tenantName}</span>
                            ) : <span className="text-zinc-600">—</span>}
                          </td>
                          <td className="p-4">
                            <PasswordCell password={user.plainPassword} />
                          </td>
                          <td className="p-4">
                            <span className="flex items-center gap-1.5 text-zinc-400 text-sm">
                              {user.loginMethod === "google" ? (
                                <><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>Google</>
                              ) : user.loginMethod === "email" ? (
                                <><Mail className="h-3.5 w-3.5" />Email</>
                              ) : (
                                <><KeyRound className="h-3.5 w-3.5" />{user.loginMethod || "Manus"}</>
                              )}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${isActive ? statusBadge.active : statusBadge.inactive}`}>
                              {isActive ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-500 text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "—"}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-1">
                              <Switch
                                checked={isActive}
                                onCheckedChange={(checked) => toggleActiveMutation.mutate({ userId: user.id, isActive: checked })}
                                className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-zinc-700 scale-75"
                              />
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white"
                                onClick={() => setEditingUser({ id: user.id, role: user.role, tenantId: user.tenantId, plainPassword: user.plainPassword, newPassword: "" })}>
                                <UserCog className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-400" onClick={() => setDeleteConfirmId(user.id)}>
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

      {/* ─── Create User Drawer (Sheet) ─────────────────────────────── */}
      <Sheet open={showCreateDrawer} onOpenChange={setShowCreateDrawer}>
        <SheetContent side="right" className="bg-zinc-950 border-zinc-800 w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-white text-xl flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-amber-500" />
              Novo Usuário
            </SheetTitle>
            <SheetDescription className="text-zinc-400">
              Preencha os dados para criar um novo usuário na plataforma.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 px-4 pb-4">
            {/* Informações Pessoais */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <div className="h-6 w-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 text-amber-500" />
                </div>
                Informações Pessoais
              </div>
              <div className="space-y-2">
                <Label className={`text-xs ${fieldErrors.name ? 'text-red-400' : 'text-zinc-400'}`}>Nome Completo *</Label>
                <Input
                  value={createForm.name}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Ex: João da Silva"
                  className={`bg-zinc-900/80 focus:ring-amber-500/20 ${
                    fieldErrors.name
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-zinc-800/60 focus:border-amber-500/50'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />{fieldErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className={`text-xs ${fieldErrors.email ? 'text-red-400' : 'text-zinc-400'}`}>E-mail (Login) *</Label>
                <Input
                  type="text"
                  value={createForm.email}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="Ex: joao@empresa.com"
                  className={`bg-zinc-900/80 focus:ring-amber-500/20 ${
                    fieldErrors.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-zinc-800/60 focus:border-amber-500/50'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />{fieldErrors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Credenciais */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <div className="h-6 w-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                </div>
                Credenciais
              </div>
              <div className="space-y-2">
                <Label className={`text-xs ${fieldErrors.password ? 'text-red-400' : 'text-zinc-400'}`}>Senha *</Label>
                <Input
                  type="text"
                  value={createForm.password}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, password: e.target.value });
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Mínimo 4 caracteres"
                  className={`bg-zinc-900/80 font-mono focus:ring-amber-500/20 ${
                    fieldErrors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-zinc-800/60 focus:border-amber-500/50'
                  }`}
                />
                {fieldErrors.password ? (
                  <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />{fieldErrors.password}
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-600">A senha ficará visível no painel para fins de suporte.</p>
                )}
              </div>
            </div>

            {/* Vínculos e Permissões */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <div className="h-6 w-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <Shield className="h-3.5 w-3.5 text-amber-500" />
                </div>
                Vínculos e Permissões
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Empresa / Tenant</Label>
                <Popover open={createTenantOpen} onOpenChange={setCreateTenantOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={createTenantOpen} className="w-full bg-zinc-900/80 border-zinc-800/60 justify-between text-sm font-normal text-white hover:bg-zinc-800/80 hover:text-white">
                      <span className="truncate">{createForm.tenantId === "none" ? "Nenhuma / Administração" : tenants?.find(t => t.id.toString() === createForm.tenantId)?.name || "Selecione..."}</span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-900 border-zinc-800" align="start">
                    <Command className="bg-zinc-900">
                      <CommandInput placeholder="Buscar empresa..." className="text-white" />
                      <CommandList>
                        <CommandEmpty className="text-zinc-400">Nenhuma empresa encontrada.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem value="Nenhuma / Administração" onSelect={() => { setCreateForm({ ...createForm, tenantId: "none" }); setCreateTenantOpen(false); }} className="text-white cursor-pointer">
                            <Check className={`mr-2 h-4 w-4 ${createForm.tenantId === "none" ? "opacity-100 text-amber-500" : "opacity-0"}`} />
                            Nenhuma / Administração
                          </CommandItem>
                          {tenants?.map((t) => (
                            <CommandItem key={t.id} value={t.name} onSelect={() => { setCreateForm({ ...createForm, tenantId: t.id.toString() }); setCreateTenantOpen(false); }} className="text-white cursor-pointer">
                              <Check className={`mr-2 h-4 w-4 ${createForm.tenantId === t.id.toString() ? "opacity-100 text-amber-500" : "opacity-0"}`} />
                              {t.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Nível Hierárquico</Label>
                <Select value={createForm.role} onValueChange={(v) => setCreateForm({ ...createForm, role: v })}>
                  <SelectTrigger className="bg-zinc-900/80 border-zinc-800/60"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="client_admin">Lojista</SelectItem>
                    <SelectItem value="user">Funcionário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-zinc-400 text-xs">Status</Label>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    {createForm.isActive ? "O usuário poderá acessar o sistema imediatamente" : "O usuário será criado como inativo"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${createForm.isActive ? "text-emerald-400" : "text-red-400"}`}>
                    {createForm.isActive ? "Ativo" : "Inativo"}
                  </span>
                  <Switch checked={createForm.isActive} onCheckedChange={(checked) => setCreateForm({ ...createForm, isActive: checked })} className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-zinc-700" />
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button onClick={handleCreateUser} disabled={createUserMutation.isPending} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium h-11">
              {createUserMutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />Criando...</>
              ) : (
                <><UserPlus className="h-4 w-4 mr-2" />Salvar Usuário</>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── Edit User Dialog ───────────────────────────────────────── */}
      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) { setEditingUser(null); setEditPasswordVisible(false); } }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Usuário</DialogTitle>
            <DialogDescription className="text-zinc-400">Altere o papel, loja associada ou senha do usuário.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-zinc-300 text-xs uppercase tracking-wider">Papel</Label>
                <Select value={editingUser.role} onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="user">Funcionário</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client_admin">Lojista</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(editingUser.role === "client_admin" || editingUser.role === "user") && (
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-xs uppercase tracking-wider">Loja Associada</Label>
                  <Popover open={editTenantOpen} onOpenChange={setEditTenantOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={editTenantOpen} className="w-full bg-zinc-800 border-zinc-700 justify-between text-sm font-normal text-white hover:bg-zinc-700 hover:text-white">
                        <span className="truncate">{!editingUser.tenantId ? "Nenhuma" : tenants?.find(t => t.id === editingUser.tenantId)?.name || "Selecione uma loja"}</span>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-800 border-zinc-700" align="start">
                      <Command className="bg-zinc-800">
                        <CommandInput placeholder="Buscar empresa..." className="text-white" />
                        <CommandList>
                          <CommandEmpty className="text-zinc-400">Nenhuma empresa encontrada.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem value="Nenhuma" onSelect={() => { setEditingUser({ ...editingUser, tenantId: null }); setEditTenantOpen(false); }} className="text-white cursor-pointer">
                              <Check className={`mr-2 h-4 w-4 ${!editingUser.tenantId ? "opacity-100 text-amber-500" : "opacity-0"}`} />
                              Nenhuma
                            </CommandItem>
                            {tenants?.map((t) => (
                              <CommandItem key={t.id} value={t.name} onSelect={() => { setEditingUser({ ...editingUser, tenantId: t.id }); setEditTenantOpen(false); }} className="text-white cursor-pointer">
                                <Check className={`mr-2 h-4 w-4 ${editingUser.tenantId === t.id ? "opacity-100 text-amber-500" : "opacity-0"}`} />
                                {t.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Password Section */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <Label className="text-zinc-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="h-3 w-3" />Senha
                </Label>
                {editingUser.plainPassword && (
                  <div className="bg-zinc-800/50 rounded-lg p-3 space-y-1">
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Senha Atual</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-200 font-mono flex-1">
                        {editPasswordVisible ? editingUser.plainPassword : "••••••••"}
                      </span>
                      <button onClick={() => setEditPasswordVisible(!editPasswordVisible)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                        {editPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={async () => { await navigator.clipboard.writeText(editingUser.plainPassword!); toast.success("Senha copiada!"); }} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <p className="text-[11px] text-zinc-500">Definir nova senha (opcional)</p>
                  <div className="flex gap-2">
                    <Input type="text" value={editingUser.newPassword} onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })} placeholder="Nova senha..." className="bg-zinc-800 border-zinc-700 font-mono flex-1" />
                    <Button variant="outline" size="sm"
                      disabled={!editingUser.newPassword || editingUser.newPassword.length < 4 || updatePasswordMutation.isPending}
                      onClick={() => updatePasswordMutation.mutate({ userId: editingUser.id, password: editingUser.newPassword })}
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 shrink-0">
                      {updatePasswordMutation.isPending ? "..." : "Alterar"}
                    </Button>
                  </div>
                  {editingUser.newPassword && editingUser.newPassword.length > 0 && editingUser.newPassword.length < 4 && (
                    <p className="text-[11px] text-red-400">Mínimo 4 caracteres</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingUser(null); setEditPasswordVisible(false); }} className="border-zinc-700 text-zinc-300">Cancelar</Button>
            <Button
              onClick={() => { if (!editingUser) return; updateRoleMutation.mutate({ userId: editingUser.id, role: editingUser.role as any, tenantId: editingUser.tenantId }); }}
              disabled={updateRoleMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-black">
              {updateRoleMutation.isPending ? "Salvando..." : "Salvar Papel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ────────────────────────────────────── */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Excluir Usuário</DialogTitle>
            <DialogDescription className="text-zinc-400">Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita. Considere desativar o usuário ao invés de excluí-lo.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="border-zinc-700 text-zinc-300">Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && deleteMutation.mutate({ id: deleteConfirmId })} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
}
