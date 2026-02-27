import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Save,
  Building2,
  ChevronsUpDown,
  Check,
  Store,
  Phone,
  FileText,
  Link2,
  ExternalLink,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// Phone mask helper: (99) 99999-9999
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// CNPJ mask helper: 99.999.999/9999-99
function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

// Slug sanitizer
function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type ClientStatus = "active" | "disabled" | "implementing";

const STATUS_OPTIONS: { value: ClientStatus; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    value: "active",
    label: "Ativa",
    description: "Landing Page acessível e recebendo pedidos",
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: "emerald",
  },
  {
    value: "implementing",
    label: "Em Manutenção",
    description: "Landing Page exibe tela de 'Voltamos em breve'",
    icon: <AlertTriangle className="h-5 w-5" />,
    color: "amber",
  },
  {
    value: "disabled",
    label: "Inativa / Bloqueada",
    description: "Acesso totalmente bloqueado (inadimplência)",
    icon: <XCircle className="h-5 w-5" />,
    color: "red",
  },
];

export default function SettingsPage() {
  const { data: tenants, isLoading } = trpc.tenants.list.useQuery();
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [tenantSearchOpen, setTenantSearchOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [slug, setSlug] = useState("");
  const [clientStatus, setClientStatus] = useState<ClientStatus>("implementing");
  const [landingStatus, setLandingStatus] = useState<string>("draft");

  // Dirty tracking
  const [isDirty, setIsDirty] = useState(false);

  const utils = trpc.useUtils();

  // Fetch store settings for WhatsApp
  const { data: storeSettingsData } = trpc.store.getSettingsByTenant.useQuery(
    { tenantId: selectedTenantId! },
    { enabled: !!selectedTenantId }
  );

  // Mutations
  const updateTenantMutation = trpc.tenants.updateContractual.useMutation({
    onSuccess: () => {
      utils.tenants.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateStoreMutation = trpc.store.updateSettings.useMutation({
    onError: (error) => toast.error(error.message),
  });

  const updateNameMutation = trpc.tenants.update.useMutation({
    onSuccess: () => utils.tenants.list.invalidate(),
    onError: (error) => toast.error(error.message),
  });

  // Load tenant data when selected
  useEffect(() => {
    if (selectedTenantId && tenants) {
      const tenant = tenants.find(t => t.id === selectedTenantId);
      if (tenant) {
        setName(tenant.name || "");
        setCnpj(formatCnpj(tenant.cnpj || ""));
        setSlug(tenant.slug || "");
        setClientStatus((tenant.clientStatus as ClientStatus) || "implementing");
        setLandingStatus(tenant.landingStatus || "draft");
        setIsDirty(false);
      }
    }
  }, [selectedTenantId, tenants]);

  // Load WhatsApp from store settings
  useEffect(() => {
    if (storeSettingsData) {
      setWhatsapp(formatPhone(storeSettingsData.whatsapp || ""));
      setIsDirty(false);
    }
  }, [storeSettingsData]);

  // Auto-select first tenant
  useEffect(() => {
    if (tenants && tenants.length > 0 && !selectedTenantId) {
      setSelectedTenantId(tenants[0].id);
    }
  }, [tenants, selectedTenantId]);

  const handleFieldChange = useCallback((setter: (v: string) => void) => {
    return (value: string) => {
      setter(value);
      setIsDirty(true);
    };
  }, []);

  const handleSave = async () => {
    if (!selectedTenantId) return;

    const cleanSlug = sanitizeSlug(slug);
    if (!cleanSlug) {
      toast.error("Slug é obrigatório");
      return;
    }
    if (!name.trim()) {
      toast.error("Nome da loja é obrigatório");
      return;
    }

    const whatsappDigits = whatsapp.replace(/\D/g, "");

    try {
      // Determine landing status based on client status
      let newLandingStatus = landingStatus;
      if (clientStatus === "active") {
        newLandingStatus = "published";
      } else if (clientStatus === "disabled") {
        newLandingStatus = "draft";
      }

      // Update tenant data (name, slug, cnpj, status)
      await updateTenantMutation.mutateAsync({
        id: selectedTenantId,
        slug: cleanSlug,
        cnpj: cnpj.replace(/\D/g, "") || undefined,
        clientStatus,
        landingStatus: newLandingStatus as "published" | "draft" | "error",
      });

      // Update tenant name via the general update procedure
      await updateNameMutation.mutateAsync({
        id: selectedTenantId,
        data: { name: name.trim() },
      });

      // Update WhatsApp in store settings only if a valid number is provided
      if (whatsappDigits && whatsappDigits.length >= 10) {
        await updateStoreMutation.mutateAsync({
          whatsapp: whatsappDigits,
          tenantId: selectedTenantId,
        });
      }

      toast.success("Configurações salvas com sucesso!");
      setIsDirty(false);
      utils.tenants.list.invalidate();
    } catch (error: any) {
      if (error?.message?.includes("Slug")) {
        toast.error("Este slug já está em uso por outra loja. Escolha outro.");
      }
    }
  };

  const selectedTenant = tenants?.find(t => t.id === selectedTenantId);
  const previewUrl = `https://app.casablanca.com.br/${sanitizeSlug(slug)}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(previewUrl);
    toast.success("URL copiada!");
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Configurações</h1>
            <p className="text-zinc-400 mt-1">Dados vitais de roteamento e operação do cliente</p>
          </div>
          {selectedTenantId && (
            <Button
              onClick={handleSave}
              disabled={updateTenantMutation.isPending || updateStoreMutation.isPending || !isDirty}
              className={`h-10 px-6 font-semibold transition-all ${
                isDirty
                  ? "bg-amber-500 hover:bg-amber-600 text-black"
                  : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateTenantMutation.isPending || updateStoreMutation.isPending
                ? "Salvando..."
                : isDirty
                ? "Salvar Configurações"
                : "Salvo"}
            </Button>
          )}
        </div>

        {/* Tenant Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-zinc-400 shrink-0">
            <Building2 className="h-4 w-4" />
            <span>Loja:</span>
          </div>
          <Popover open={tenantSearchOpen} onOpenChange={setTenantSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={tenantSearchOpen}
                className="w-full max-w-md bg-zinc-900/80 border-zinc-800/60 h-10 justify-between text-sm font-normal text-white hover:bg-zinc-800/80 hover:text-white"
              >
                <span className="truncate">
                  {isLoading ? "Carregando..." : selectedTenant ? selectedTenant.name : "Selecione uma loja..."}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-900 border-zinc-800" align="start">
              <Command className="bg-zinc-900">
                <CommandInput placeholder="Buscar loja pelo nome..." className="text-white" />
                <CommandList>
                  <CommandEmpty className="text-zinc-400">Nenhuma loja encontrada.</CommandEmpty>
                  <CommandGroup>
                    {tenants?.map((tenant) => (
                      <CommandItem
                        key={tenant.id}
                        value={tenant.name}
                        onSelect={() => {
                          setSelectedTenantId(tenant.id);
                          setTenantSearchOpen(false);
                        }}
                        className="text-white cursor-pointer"
                      >
                        <Check className={`mr-2 h-4 w-4 ${selectedTenantId === tenant.id ? "opacity-100 text-amber-500" : "opacity-0"}`} />
                        <span className="flex-1">{tenant.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          tenant.clientStatus === "active" ? "bg-emerald-500/10 text-emerald-400" :
                          tenant.clientStatus === "implementing" ? "bg-amber-500/10 text-amber-400" :
                          "bg-red-500/10 text-red-400"
                        }`}>
                          {tenant.clientStatus === "active" ? "Ativa" :
                           tenant.clientStatus === "implementing" ? "Manut." : "Inativa"}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {selectedTenantId && (
          <div className="space-y-6">
            {/* Block 1: Informações Principais */}
            <Card className="bg-zinc-900/80 border-zinc-800/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Store className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-base">Informações Principais</CardTitle>
                    <CardDescription className="text-zinc-500 text-xs mt-0.5">
                      Dados de identificação e contato da loja
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Nome da Loja */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-zinc-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Store className="h-3 w-3" />
                      Nome da Loja
                      <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => handleFieldChange(setName)(e.target.value)}
                      placeholder="Ex: Burger da Praça"
                      className="bg-zinc-950/50 border-zinc-800/80 text-sm focus:border-amber-500/50 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      WhatsApp de Pedidos
                      <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={whatsapp}
                      onChange={(e) => handleFieldChange(setWhatsapp)(formatPhone(e.target.value))}
                      placeholder="(99) 99999-9999"
                      className="bg-zinc-950/50 border-zinc-800/80 text-sm font-mono focus:border-amber-500/50 focus:ring-amber-500/20"
                    />
                    <p className="text-[11px] text-zinc-600">
                      Número para onde o carrinho enviará o resumo do pedido via WhatsApp.
                    </p>
                  </div>

                  {/* CNPJ */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3 w-3" />
                      CNPJ / Documento
                    </Label>
                    <Input
                      value={cnpj}
                      onChange={(e) => handleFieldChange(setCnpj)(formatCnpj(e.target.value))}
                      placeholder="99.999.999/9999-99"
                      className="bg-zinc-950/50 border-zinc-800/80 text-sm font-mono focus:border-amber-500/50 focus:ring-amber-500/20"
                    />
                    <p className="text-[11px] text-zinc-600">
                      Opcional. Para controle interno e documentação.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Block 2: Roteamento e URL */}
            <Card className="bg-zinc-900/80 border-zinc-800/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Link2 className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-base">Roteamento e URL</CardTitle>
                    <CardDescription className="text-zinc-500 text-xs mt-0.5">
                      Identificador único da loja para geração do link de acesso
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Slug Input */}
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Link2 className="h-3 w-3" />
                    Slug da Loja (Identificador)
                    <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={slug}
                    onChange={(e) => {
                      const sanitized = sanitizeSlug(e.target.value);
                      handleFieldChange(setSlug)(sanitized);
                    }}
                    placeholder="ex: burger-da-praca"
                    className="bg-zinc-950/50 border-zinc-800/80 text-sm font-mono focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                  <p className="text-[11px] text-zinc-600">
                    Apenas letras minúsculas, números e hífens. Sem espaços ou caracteres especiais.
                  </p>
                </div>

                {/* URL Preview */}
                {slug && (
                  <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800/60">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <ExternalLink className="h-4 w-4 text-blue-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Preview da URL</p>
                          <p className="text-sm font-mono text-white truncate">
                            <span className="text-zinc-500">https://app.casablanca.com.br/</span>
                            <span className="text-blue-400 font-semibold">{sanitizeSlug(slug)}</span>
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyUrl}
                        className="shrink-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                  <p className="text-[11px] text-blue-400/80">
                    O slug deve ser único. Se já estiver em uso por outra loja, o sistema exibirá um erro ao salvar.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Block 3: Status de Operação */}
            <Card className="bg-zinc-900/80 border-zinc-800/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-base">Status de Operação</CardTitle>
                    <CardDescription className="text-zinc-500 text-xs mt-0.5">
                      Controle de visibilidade e acesso da Landing Page
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = clientStatus === option.value;
                    const colorClasses = {
                      emerald: {
                        border: isSelected ? "border-emerald-500/50" : "border-zinc-800/60",
                        bg: isSelected ? "bg-emerald-500/5" : "bg-zinc-950/30",
                        icon: isSelected ? "text-emerald-400" : "text-zinc-600",
                        ring: isSelected ? "ring-2 ring-emerald-500/20" : "",
                      },
                      amber: {
                        border: isSelected ? "border-amber-500/50" : "border-zinc-800/60",
                        bg: isSelected ? "bg-amber-500/5" : "bg-zinc-950/30",
                        icon: isSelected ? "text-amber-400" : "text-zinc-600",
                        ring: isSelected ? "ring-2 ring-amber-500/20" : "",
                      },
                      red: {
                        border: isSelected ? "border-red-500/50" : "border-zinc-800/60",
                        bg: isSelected ? "bg-red-500/5" : "bg-zinc-950/30",
                        icon: isSelected ? "text-red-400" : "text-zinc-600",
                        ring: isSelected ? "ring-2 ring-red-500/20" : "",
                      },
                    }[option.color]!;

                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setClientStatus(option.value);
                          setIsDirty(true);
                        }}
                        className={`w-full p-4 rounded-lg border transition-all text-left flex items-center gap-4 ${colorClasses.border} ${colorClasses.bg} ${colorClasses.ring} hover:bg-zinc-800/30`}
                      >
                        <div className={`shrink-0 ${colorClasses.icon}`}>
                          {option.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isSelected ? "text-white" : "text-zinc-400"}`}>
                            {option.label}
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            {option.description}
                          </p>
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? `border-${option.color}-500 bg-${option.color}-500`
                            : "border-zinc-700"
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
