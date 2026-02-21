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
  Key,
  Save,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Building2,
  ChevronsUpDown,
  Check,
  BarChart3,
  Globe,
  Tag,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function IntegrationsPage() {
  const { data: tenants, isLoading } = trpc.tenants.list.useQuery();
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [tenantSearchOpen, setTenantSearchOpen] = useState(false);
  const [formData, setFormData] = useState({
    googleApiKey: "",
    googlePlaceId: "",
    metaPixelId: "",
    ga4MeasurementId: "",
    gtmContainerId: "",
  });

  const utils = trpc.useUtils();

  const updateIntegrationsMutation = trpc.tenants.updateIntegrations.useMutation({
    onSuccess: () => {
      toast.success("Integrações atualizadas com sucesso!");
      utils.tenants.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (selectedTenantId && tenants) {
      const tenant = tenants.find(t => t.id === selectedTenantId);
      if (tenant) {
        setFormData({
          googleApiKey: tenant.googleApiKey || "",
          googlePlaceId: tenant.googlePlaceId || "",
          metaPixelId: tenant.metaPixelId || "",
          ga4MeasurementId: tenant.ga4MeasurementId || "",
          gtmContainerId: tenant.gtmContainerId || "",
        });
      }
    }
  }, [selectedTenantId, tenants]);

  useEffect(() => {
    if (tenants && tenants.length > 0 && !selectedTenantId) {
      setSelectedTenantId(tenants[0].id);
    }
  }, [tenants, selectedTenantId]);

  const handleSave = () => {
    if (!selectedTenantId) return;
    updateIntegrationsMutation.mutate({
      id: selectedTenantId,
      googleApiKey: formData.googleApiKey || undefined,
      googlePlaceId: formData.googlePlaceId || undefined,
      metaPixelId: formData.metaPixelId || undefined,
      ga4MeasurementId: formData.ga4MeasurementId || undefined,
      gtmContainerId: formData.gtmContainerId || undefined,
    });
  };

  const selectedTenant = tenants?.find(t => t.id === selectedTenantId);

  const hasGoogleConfig = !!(formData.googleApiKey || formData.googlePlaceId);
  const hasTrackingConfig = !!(formData.metaPixelId || formData.ga4MeasurementId || formData.gtmContainerId);
  const trackingCount = [formData.metaPixelId, formData.ga4MeasurementId, formData.gtmContainerId].filter(Boolean).length;

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Integrações</h1>
            <p className="text-zinc-400 mt-1">Gerencie as chaves de API, pixels e analytics de cada loja</p>
          </div>
          {selectedTenantId && (
            <Button
              onClick={handleSave}
              disabled={updateIntegrationsMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-10 px-6"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateIntegrationsMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          )}
        </div>

        {/* Tenant Selector - Combobox with Search */}
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
                        {tenant.googleApiKey ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-2" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-zinc-600 ml-2" />
                        )}
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
            {/* Security Notice */}
            <div className="p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <p className="text-sm text-amber-400/80">
                Estas configurações são sensíveis e só podem ser editadas pelo Super Admin. As chaves de API não são expostas publicamente.
              </p>
            </div>

            {/* Google Places API Integration */}
            <Card className="bg-zinc-900/80 border-zinc-800/60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-base">Google Places API</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs mt-0.5">
                        Integração com Google Maps e avaliações
                      </CardDescription>
                    </div>
                  </div>
                  {hasGoogleConfig ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Configurado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-500 border border-zinc-700/50">
                      <XCircle className="h-3 w-3" />
                      Não configurado
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-xs uppercase tracking-wider">API Key</Label>
                    <Input
                      type="password"
                      value={formData.googleApiKey}
                      onChange={(e) => setFormData({ ...formData, googleApiKey: e.target.value })}
                      placeholder="AIza..."
                      className="bg-zinc-950/50 border-zinc-800/80 font-mono text-sm focus:border-blue-500/50 focus:ring-blue-500/20"
                    />
                    <p className="text-[11px] text-zinc-600">
                      Chave da API do Google para mapas e avaliações.
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400/80 hover:text-blue-400 hover:underline ml-1 inline-flex items-center gap-0.5"
                      >
                        Obter chave <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-xs uppercase tracking-wider">Place ID</Label>
                    <Input
                      value={formData.googlePlaceId}
                      onChange={(e) => setFormData({ ...formData, googlePlaceId: e.target.value })}
                      placeholder="ChIJ..."
                      className="bg-zinc-950/50 border-zinc-800/80 font-mono text-sm focus:border-blue-500/50 focus:ring-blue-500/20"
                    />
                    <p className="text-[11px] text-zinc-600">
                      ID do estabelecimento no Google Maps.
                      <a
                        href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400/80 hover:text-blue-400 hover:underline ml-1 inline-flex items-center gap-0.5"
                      >
                        Como encontrar <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Marketing Tracking Integration */}
            <Card className="bg-zinc-900/80 border-zinc-800/60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-base">Rastreamento de Marketing</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs mt-0.5">
                        Pixels e Analytics para campanhas de marketing
                      </CardDescription>
                    </div>
                  </div>
                  {hasTrackingConfig ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Activity className="h-3 w-3" />
                      {trackingCount} ativo{trackingCount > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-500 border border-zinc-700/50">
                      <XCircle className="h-3 w-3" />
                      Não configurado
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Os scripts serão injetados automaticamente na Landing Page do cliente quando os IDs forem preenchidos. Se o campo estiver vazio, o script correspondente não será carregado.
                </p>

                {/* Meta Pixel */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-blue-600/10 flex items-center justify-center">
                      <Tag className="h-3 w-3 text-blue-500" />
                    </div>
                    <Label className="text-zinc-300 text-xs uppercase tracking-wider">Meta Pixel (Facebook)</Label>
                  </div>
                  <Input
                    value={formData.metaPixelId}
                    onChange={(e) => setFormData({ ...formData, metaPixelId: e.target.value })}
                    placeholder="Ex: 1234567890"
                    className="bg-zinc-950/50 border-zinc-800/80 font-mono text-sm focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                  <p className="text-[11px] text-zinc-600">
                    ID do Pixel para rastrear conversões e eventos do Facebook/Instagram Ads.
                    <a
                      href="https://business.facebook.com/events_manager"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400/80 hover:text-purple-400 hover:underline ml-1 inline-flex items-center gap-0.5"
                    >
                      Gerenciador de Eventos <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </p>
                </div>

                {/* Google Analytics 4 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-amber-500/10 flex items-center justify-center">
                      <BarChart3 className="h-3 w-3 text-amber-500" />
                    </div>
                    <Label className="text-zinc-300 text-xs uppercase tracking-wider">Google Analytics 4</Label>
                  </div>
                  <Input
                    value={formData.ga4MeasurementId}
                    onChange={(e) => setFormData({ ...formData, ga4MeasurementId: e.target.value })}
                    placeholder="Ex: G-XXXXXXXXXX"
                    className="bg-zinc-950/50 border-zinc-800/80 font-mono text-sm focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                  <p className="text-[11px] text-zinc-600">
                    Measurement ID do GA4 para análise de tráfego e comportamento de visitantes.
                    <a
                      href="https://analytics.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400/80 hover:text-purple-400 hover:underline ml-1 inline-flex items-center gap-0.5"
                    >
                      Google Analytics <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </p>
                </div>

                {/* Google Tag Manager */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-cyan-500/10 flex items-center justify-center">
                      <Key className="h-3 w-3 text-cyan-500" />
                    </div>
                    <Label className="text-zinc-300 text-xs uppercase tracking-wider">Google Tag Manager</Label>
                  </div>
                  <Input
                    value={formData.gtmContainerId}
                    onChange={(e) => setFormData({ ...formData, gtmContainerId: e.target.value })}
                    placeholder="Ex: GTM-XXXXXXX"
                    className="bg-zinc-950/50 border-zinc-800/80 font-mono text-sm focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                  <p className="text-[11px] text-zinc-600">
                    Container ID do GTM para gerenciar tags, pixels e scripts de terceiros.
                    <a
                      href="https://tagmanager.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400/80 hover:text-purple-400 hover:underline ml-1 inline-flex items-center gap-0.5"
                    >
                      Tag Manager <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
