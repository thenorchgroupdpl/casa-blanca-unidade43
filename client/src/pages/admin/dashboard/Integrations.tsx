/**
 * Integrações - Dashboard do Lojista
 * Replica o layout do Super Admin para que o lojista gerencie
 * Google Places API e Rastreamento de Marketing (Meta Pixel, GA4, GTM).
 * Dark mode forçado, sidebar presente via ClientAdminLayout.
 */

import ClientAdminLayout from "@/components/ClientAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import {
  Key,
  Save,
  CheckCircle2,
  XCircle,
  ExternalLink,
  BarChart3,
  Globe,
  Tag,
  Activity,
  Loader2,
  Plug,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function IntegrationsPage() {
  const { data: integrations, isLoading } = trpc.store.getGoogleIntegrations.useQuery();
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    googleApiKey: "",
    googlePlaceId: "",
    metaPixelId: "",
    ga4MeasurementId: "",
    gtmContainerId: "",
  });

  const updateMutation = trpc.store.updateGoogleIntegrations.useMutation({
    onSuccess: () => {
      toast.success("Integrações atualizadas com sucesso!");
      utils.store.getGoogleIntegrations.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  // Populate form when data loads
  useEffect(() => {
    if (integrations) {
      setFormData({
        googleApiKey: integrations.googleApiKey || "",
        googlePlaceId: integrations.googlePlaceId || "",
        metaPixelId: integrations.metaPixelId || "",
        ga4MeasurementId: integrations.ga4MeasurementId || "",
        gtmContainerId: integrations.gtmContainerId || "",
      });
    }
  }, [integrations]);

  const handleSave = () => {
    updateMutation.mutate({
      googlePlaceId: formData.googlePlaceId || undefined,
      metaPixelId: formData.metaPixelId || undefined,
      ga4MeasurementId: formData.ga4MeasurementId || undefined,
      gtmContainerId: formData.gtmContainerId || undefined,
    });
  };

  const hasGoogleConfig = !!(formData.googleApiKey || formData.googlePlaceId);
  const hasTrackingConfig = !!(formData.metaPixelId || formData.ga4MeasurementId || formData.gtmContainerId);
  const trackingCount = [formData.metaPixelId, formData.ga4MeasurementId, formData.gtmContainerId].filter(Boolean).length;

  const googleStatus = integrations?.googleReviewsStatus;
  const googleError = integrations?.googleReviewsError;

  return (
    <ClientAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Plug className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Integrações</h1>
                <p className="text-zinc-400 text-sm mt-0.5">Gerencie as chaves de API, pixels e analytics da sua loja</p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || isLoading}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-10 px-6"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Info Notice */}
            <div className="p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <p className="text-sm text-amber-400/80">
                Os scripts de rastreamento serão injetados automaticamente na sua Landing Page quando os IDs forem preenchidos. A chave da API do Google é gerenciada pelo administrador do sistema.
              </p>
            </div>

            {/* ============================================ */}
            {/* Google Places API Integration */}
            {/* ============================================ */}
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
                  {/* API Key - Read Only (managed by Super Admin) */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-xs uppercase tracking-wider">API Key</Label>
                    <Input
                      type="password"
                      value={formData.googleApiKey}
                      readOnly
                      disabled
                      placeholder="Gerenciada pelo administrador"
                      className="bg-zinc-950 border-zinc-800 font-mono text-sm text-zinc-400 opacity-60 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-zinc-600">
                      Chave da API do Google para mapas e avaliações. Gerenciada pelo Super Admin.
                    </p>

                  </div>

                  {/* Place ID - Editable */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-xs uppercase tracking-wider">Place ID</Label>
                    <Input
                      value={formData.googlePlaceId}
                      onChange={(e) => setFormData({ ...formData, googlePlaceId: e.target.value })}
                      placeholder="ChIJ..."
                      className="bg-zinc-950 border-zinc-800 font-mono text-sm text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                    />
                    <p className="text-[11px] text-zinc-500">
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

                {/* Status das avaliações do Google */}
                {hasGoogleConfig && !isLoading && (
                  <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                    googleStatus === 'ok'
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                      : googleStatus === 'error'
                      ? 'bg-red-500/5 border-red-500/20 text-red-400'
                      : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400'
                  }`}>
                    {googleStatus === 'ok' && <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />}
                    {googleStatus === 'error' && <XCircle className="h-4 w-4 mt-0.5 shrink-0" />}
                    {googleStatus === 'unconfigured' && <XCircle className="h-4 w-4 mt-0.5 shrink-0" />}
                    <div>
                      {googleStatus === 'ok' && (
                        <span>Avaliações do Google conectadas com sucesso.</span>
                      )}
                      {googleStatus === 'error' && (
                        <>
                          <span className="font-medium">Erro ao buscar avaliações do Google:</span>
                          <span className="block text-red-300/80 text-xs mt-0.5">{googleError}</span>
                          <span className="block text-zinc-500 text-xs mt-1">
                            Verifique se a API Key tem a "Places API" habilitada no Google Cloud Console e se o Place ID está correto.
                          </span>
                        </>
                      )}
                      {googleStatus === 'unconfigured' && (
                        <span>Configure a API Key e o Place ID para exibir avaliações reais do Google.</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ============================================ */}
            {/* Marketing Tracking Integration */}
            {/* ============================================ */}
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
                  Os scripts serão injetados automaticamente na Landing Page quando os IDs forem preenchidos. Se o campo estiver vazio, o script correspondente não será carregado.
                </p>

                {/* Meta Pixel (Facebook) */}
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
                    className="bg-zinc-950 border-zinc-800 font-mono text-sm text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                  <p className="text-[11px] text-zinc-500">
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
                    className="bg-zinc-950 border-zinc-800 font-mono text-sm text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                  <p className="text-[11px] text-zinc-500">
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
                    className="bg-zinc-950 border-zinc-800 font-mono text-sm text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                  <p className="text-[11px] text-zinc-500">
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
    </ClientAdminLayout>
  );
}
