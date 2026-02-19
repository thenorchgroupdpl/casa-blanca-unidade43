import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Key, Save, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function IntegrationsPage() {
  const { data: tenants, isLoading } = trpc.tenants.list.useQuery();
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    googleApiKey: "",
    googlePlaceId: "",
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
    });
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Integrações</h1>
            <p className="text-zinc-400 mt-1">Gerencie as chaves de API e integrações de cada loja</p>
          </div>
          {selectedTenantId && (
            <Button
              onClick={handleSave}
              disabled={updateIntegrationsMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateIntegrationsMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          )}
        </div>

        {/* Tenant Selector */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Selecione a Loja</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-zinc-500">Carregando...</div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {tenants?.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() => setSelectedTenantId(tenant.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      selectedTenantId === tenant.id
                        ? "bg-amber-500 text-black"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {tenant.name}
                    {tenant.googleApiKey ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-zinc-500" />
                    )}
                  </button>
                ))}
                {(!tenants || tenants.length === 0) && (
                  <p className="text-zinc-500">Nenhuma loja cadastrada.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedTenantId && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-400">
                Estas configurações são sensíveis e só podem ser editadas pelo Super Admin. As chaves de API não são expostas publicamente.
              </p>
            </div>

            {/* Google Integration */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Key className="h-5 w-5 text-blue-500" />
                      Google Places API
                    </CardTitle>
                    <CardDescription className="text-zinc-400 mt-1">
                      Integração com Google Maps e avaliações
                    </CardDescription>
                  </div>
                  {formData.googleApiKey ? (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Configurado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-zinc-700 text-zinc-400">
                      <XCircle className="h-3 w-3" />
                      Não configurado
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">API Key</Label>
                  <Input
                    type="password"
                    value={formData.googleApiKey}
                    onChange={(e) => setFormData({ ...formData, googleApiKey: e.target.value })}
                    placeholder="AIza..."
                    className="bg-zinc-800 border-zinc-700 font-mono"
                  />
                  <p className="text-xs text-zinc-500">
                    Chave da API do Google para mapas e avaliações.
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline ml-1 inline-flex items-center gap-1"
                    >
                      Obter chave <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Place ID</Label>
                  <Input
                    value={formData.googlePlaceId}
                    onChange={(e) => setFormData({ ...formData, googlePlaceId: e.target.value })}
                    placeholder="ChIJ..."
                    className="bg-zinc-800 border-zinc-700 font-mono"
                  />
                  <p className="text-xs text-zinc-500">
                    ID do estabelecimento no Google Maps para buscar avaliações.
                    <a
                      href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline ml-1 inline-flex items-center gap-1"
                    >
                      Como encontrar <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Future Integrations */}
            <Card className="bg-zinc-900 border-zinc-800 opacity-60">
              <CardHeader>
                <CardTitle className="text-white">Mais Integrações</CardTitle>
                <CardDescription className="text-zinc-400">
                  Em breve: Stripe, WhatsApp Business API, iFood e mais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {["Stripe Payments", "WhatsApp Business", "iFood"].map((name) => (
                    <div key={name} className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                      <p className="text-sm font-medium text-zinc-400">{name}</p>
                      <p className="text-xs text-zinc-600 mt-1">Em breve</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
