import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Palette, Save, CheckCircle2, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type DesignFormData = {
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
};

const defaultDesign: DesignFormData = {
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
};

export default function DesignPage() {
  const { data: tenants, isLoading } = trpc.tenants.list.useQuery();
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [formData, setFormData] = useState<DesignFormData>(defaultDesign);

  const utils = trpc.useUtils();

  const updateDesignMutation = trpc.tenants.updateDesign.useMutation({
    onSuccess: () => {
      toast.success("Design atualizado com sucesso!");
      utils.tenants.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (selectedTenantId && tenants) {
      const tenant = tenants.find(t => t.id === selectedTenantId);
      if (tenant) {
        setFormData({
          themeColors: tenant.themeColors || defaultDesign.themeColors,
          fontFamily: tenant.fontFamily || "DM Sans",
          fontDisplay: tenant.fontDisplay || "DM Serif Display",
          borderRadius: tenant.borderRadius || "0.75rem",
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
    updateDesignMutation.mutate({
      id: selectedTenantId,
      themeColors: formData.themeColors,
      fontFamily: formData.fontFamily,
      fontDisplay: formData.fontDisplay,
      borderRadius: formData.borderRadius,
    });
  };

  const updateColor = (key: keyof DesignFormData['themeColors'], value: string) => {
    setFormData({
      ...formData,
      themeColors: { ...formData.themeColors, [key]: value },
    });
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Design System</h1>
            <p className="text-zinc-400 mt-1">Personalize cores, fontes e estilos de cada loja</p>
          </div>
          {selectedTenantId && (
            <Button
              onClick={handleSave}
              disabled={updateDesignMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateDesignMutation.isPending ? "Salvando..." : "Salvar"}
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTenantId === tenant.id
                        ? "bg-amber-500 text-black"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {tenant.name}
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
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Colors */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="h-5 w-5 text-amber-500" />
                  Cores
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Paleta de cores da loja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "primary" as const, label: "Cor Primária", desc: "Botões, links e destaques" },
                  { key: "background" as const, label: "Cor de Fundo", desc: "Fundo principal da página" },
                  { key: "foreground" as const, label: "Cor do Texto", desc: "Texto principal" },
                  { key: "accent" as const, label: "Cor de Destaque", desc: "Cards e seções" },
                  { key: "muted" as const, label: "Cor Muted", desc: "Texto secundário" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-white text-sm">{label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.themeColors[key]}
                        onChange={(e) => updateColor(key, e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-zinc-700"
                      />
                      <Input
                        value={formData.themeColors[key]}
                        onChange={(e) => updateColor(key, e.target.value)}
                        className="bg-zinc-800 border-zinc-700 font-mono flex-1"
                      />
                    </div>
                    <p className="text-xs text-zinc-500">{desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Typography & Style */}
            <div className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Tipografia</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Fontes utilizadas na loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Fonte Principal</Label>
                    <Input
                      value={formData.fontFamily}
                      onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                      placeholder="DM Sans"
                      className="bg-zinc-800 border-zinc-700"
                    />
                    <p className="text-xs text-zinc-500">Fonte para textos e parágrafos (Google Fonts)</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Fonte Display (Títulos)</Label>
                    <Input
                      value={formData.fontDisplay}
                      onChange={(e) => setFormData({ ...formData, fontDisplay: e.target.value })}
                      placeholder="DM Serif Display"
                      className="bg-zinc-800 border-zinc-700"
                    />
                    <p className="text-xs text-zinc-500">Fonte para títulos e headings</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Estilo</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Configurações de estilo visual
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Border Radius</Label>
                    <Input
                      value={formData.borderRadius}
                      onChange={(e) => setFormData({ ...formData, borderRadius: e.target.value })}
                      placeholder="0.75rem"
                      className="bg-zinc-800 border-zinc-700 font-mono"
                    />
                    <p className="text-xs text-zinc-500">Arredondamento dos cantos (ex: 0.5rem, 1rem)</p>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="p-6 rounded-lg"
                    style={{
                      backgroundColor: formData.themeColors.background,
                      borderRadius: formData.borderRadius,
                    }}
                  >
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{
                        color: formData.themeColors.foreground,
                        fontFamily: formData.fontDisplay,
                      }}
                    >
                      Título de Exemplo
                    </h3>
                    <p
                      className="text-sm mb-4"
                      style={{
                        color: formData.themeColors.muted,
                        fontFamily: formData.fontFamily,
                      }}
                    >
                      Este é um texto de exemplo para visualizar as cores e fontes.
                    </p>
                    <button
                      className="px-4 py-2 text-sm font-semibold"
                      style={{
                        backgroundColor: formData.themeColors.primary,
                        color: formData.themeColors.background,
                        borderRadius: formData.borderRadius,
                      }}
                    >
                      Botão de Exemplo
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
