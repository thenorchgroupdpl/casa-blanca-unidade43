import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  Palette,
  Eye,
  X,
  CreditCard,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

interface PopupState {
  title: string;
  message: string;
}

interface PopupColors {
  bgColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
}

const DEFAULT_POPUPS: Record<string, PopupState> = {
  warning: {
    title: "Sua mensalidade vence em breve",
    message: "Faltam poucos dias para o vencimento da sua mensalidade. Regularize seu pagamento para manter sua loja ativa.",
  },
  overdue: {
    title: "Mensalidade Atrasada",
    message: "Sua mensalidade está vencida. Sua loja pode ser suspensa a qualquer momento. Pague agora para evitar a interrupção do serviço.",
  },
  suspended: {
    title: "Acesso Bloqueado",
    message: "O acesso ao painel foi restrito por falta de pagamento. Entre em contato com o suporte ou realize o pagamento para reativar sua loja.",
  },
};

const DEFAULT_COLORS: PopupColors = {
  bgColor: "#18181b",
  textColor: "#fafafa",
  buttonColor: "#f59e0b",
  buttonTextColor: "#000000",
};

const POPUP_TABS = [
  { value: "warning", label: "Aviso Prévio", icon: AlertTriangle, description: "Faltam 5 dias", color: "text-amber-400" },
  { value: "overdue", label: "Vencido", icon: Clock, description: "Carência", color: "text-red-400" },
  { value: "suspended", label: "Bloqueado", icon: Ban, description: "Suspenso", color: "text-zinc-400" },
];

// ============================================
// COLOR INPUT COMPONENT
// ============================================

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-zinc-700 cursor-pointer bg-transparent p-0.5"
        />
      </div>
      <div className="flex-1 min-w-0">
        <Label className="text-xs text-zinc-400">{label}</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 bg-zinc-800 border-zinc-700 text-white text-xs font-mono mt-0.5"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

// ============================================
// POPUP PREVIEW COMPONENT
// ============================================

function PopupPreview({
  state,
  colors,
  type,
}: {
  state: PopupState;
  colors: PopupColors;
  type: string;
}) {
  const tabInfo = POPUP_TABS.find(t => t.value === type);
  const TabIcon = tabInfo?.icon || AlertTriangle;

  return (
    <div className="flex items-center justify-center p-6 min-h-[400px] bg-zinc-950/50 rounded-xl border border-zinc-800/50">
      {/* Simulated overlay */}
      <div className="relative w-full max-w-sm">
        {/* Backdrop */}
        <div className="absolute inset-0 -m-6 bg-black/60 rounded-xl" />

        {/* Modal */}
        <div
          className="relative rounded-2xl p-6 shadow-2xl border border-white/10"
          style={{ backgroundColor: colors.bgColor }}
        >
          {/* Close button */}
          <button className="absolute top-3 right-3 p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity">
            <X className="h-4 w-4" style={{ color: colors.textColor }} />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: type === "warning" ? "rgba(245,158,11,0.15)" :
                  type === "overdue" ? "rgba(239,68,68,0.15)" : "rgba(161,161,170,0.15)",
              }}
            >
              <TabIcon
                className="h-7 w-7"
                style={{
                  color: type === "warning" ? "#f59e0b" :
                    type === "overdue" ? "#ef4444" : "#a1a1aa",
                }}
              />
            </div>
          </div>

          {/* Title */}
          <h3
            className="text-lg font-bold text-center mb-2"
            style={{ color: colors.textColor }}
          >
            {state.title || "Título do Popup"}
          </h3>

          {/* Message */}
          <p
            className="text-sm text-center leading-relaxed mb-6 opacity-80"
            style={{ color: colors.textColor }}
          >
            {state.message || "Mensagem do popup aparecerá aqui..."}
          </p>

          {/* Button */}
          <button
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: colors.buttonColor,
              color: colors.buttonTextColor,
            }}
          >
            <CreditCard className="h-4 w-4" />
            {type === "suspended" ? "Entrar em Contato" : "Pagar / Copiar PIX"}
          </button>

          {type !== "suspended" && (
            <button
              className="w-full mt-2 py-2 text-xs opacity-50 hover:opacity-70 transition-opacity"
              style={{ color: colors.textColor }}
            >
              Lembrar depois
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function BillingPopupsPage() {
  const utils = trpc.useUtils();
  const { data: allSettings, isLoading } = trpc.globalSettings.getAll.useQuery();

  // State for 3 popup states
  const [popups, setPopups] = useState<Record<string, PopupState>>({ ...DEFAULT_POPUPS });
  const [colors, setColors] = useState<PopupColors>({ ...DEFAULT_COLORS });
  const [activeTab, setActiveTab] = useState("warning");
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const bulkSetMutation = trpc.globalSettings.bulkSet.useMutation({
    onSuccess: () => {
      toast.success("Popups de mensalidade salvos com sucesso!");
      setIsDirty(false);
      utils.globalSettings.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar popups");
    },
  });

  // Load existing settings
  useEffect(() => {
    if (allSettings && !isInitialized) {
      const settingsMap = new Map(allSettings.map(s => [s.key, s.value]));

      // Load popup states
      const loadedPopups = { ...DEFAULT_POPUPS };
      for (const type of ["warning", "overdue", "suspended"]) {
        const saved = settingsMap.get(`billing_popup_${type}`);
        if (saved) {
          try {
            loadedPopups[type] = JSON.parse(saved);
          } catch { /* use default */ }
        }
      }
      setPopups(loadedPopups);

      // Load colors
      const savedColors = settingsMap.get("billing_popup_colors");
      if (savedColors) {
        try {
          setColors({ ...DEFAULT_COLORS, ...JSON.parse(savedColors) });
        } catch { /* use default */ }
      }

      setIsInitialized(true);
      setIsDirty(false);
    }
  }, [allSettings, isInitialized]);

  const handleSave = () => {
    const settings = [
      // Save each popup state
      ...["warning", "overdue", "suspended"].map(type => ({
        key: `billing_popup_${type}`,
        value: JSON.stringify(popups[type]),
        description: `Popup de cobrança: ${type}`,
      })),
      // Save colors
      {
        key: "billing_popup_colors",
        value: JSON.stringify(colors),
        description: "Cores dos popups de cobrança",
      },
    ];

    bulkSetMutation.mutate(settings);
  };

  const updatePopup = (type: string, field: keyof PopupState, value: string) => {
    setPopups(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
    setIsDirty(true);
  };

  const updateColor = (field: keyof PopupColors, value: string) => {
    setColors(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const activePopup = popups[activeTab] || DEFAULT_POPUPS.warning;

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Popups de Mensalidade
            </h1>
            <p className="text-zinc-400 mt-1">
              Personalize os modais de aviso de pagamento exibidos no Dashboard do Lojista
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={bulkSetMutation.isPending || !isDirty}
            className={`h-10 px-6 font-semibold transition-all ${
              isDirty
                ? "bg-amber-500 hover:bg-amber-600 text-black"
                : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
            }`}
          >
            {bulkSetMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : isDirty ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Popups
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Salvo
              </>
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* ============================================ */}
            {/* LEFT: Controls */}
            {/* ============================================ */}
            <div className="space-y-6">
              {/* Popup State Tabs */}
              <Card className="bg-zinc-900/60 border-zinc-800/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">
                        Estados do Popup
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        Configure título e mensagem para cada estado de cobrança
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full bg-zinc-800/50 border border-zinc-700/50 h-auto p-1">
                      {POPUP_TABS.map(tab => {
                        const TabIcon = tab.icon;
                        return (
                          <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400 py-2"
                          >
                            <TabIcon className={`h-3.5 w-3.5 mr-1.5 ${tab.color}`} />
                            <span className="text-xs">{tab.label}</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>

                    {POPUP_TABS.map(tab => (
                      <TabsContent key={tab.value} value={tab.value} className="mt-4 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <tab.icon className={`h-4 w-4 ${tab.color}`} />
                          <span className="text-sm font-medium text-zinc-300">{tab.label}</span>
                          <span className="text-xs text-zinc-500">— {tab.description}</span>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400">Título</Label>
                            <Input
                              value={popups[tab.value]?.title || ""}
                              onChange={(e) => updatePopup(tab.value, "title", e.target.value)}
                              placeholder={DEFAULT_POPUPS[tab.value].title}
                              className="bg-zinc-800 border-zinc-700 text-white h-10"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400">Mensagem</Label>
                            <Textarea
                              value={popups[tab.value]?.message || ""}
                              onChange={(e) => updatePopup(tab.value, "message", e.target.value)}
                              placeholder={DEFAULT_POPUPS[tab.value].message}
                              className="bg-zinc-800 border-zinc-700 text-white min-h-[100px] resize-none"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Color Controls */}
              <Card className="bg-zinc-900/60 border-zinc-800/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Palette className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">
                        Cores do Popup
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        Personalize as cores globais dos modais de cobrança
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <ColorInput
                      label="Fundo do Modal"
                      value={colors.bgColor}
                      onChange={(v) => updateColor("bgColor", v)}
                    />
                    <ColorInput
                      label="Texto"
                      value={colors.textColor}
                      onChange={(v) => updateColor("textColor", v)}
                    />
                    <ColorInput
                      label="Botão"
                      value={colors.buttonColor}
                      onChange={(v) => updateColor("buttonColor", v)}
                    />
                    <ColorInput
                      label="Texto do Botão"
                      value={colors.buttonTextColor}
                      onChange={(v) => updateColor("buttonTextColor", v)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ============================================ */}
            {/* RIGHT: Live Preview */}
            {/* ============================================ */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-400">Preview ao vivo</span>
                <span className="text-xs text-zinc-600 ml-auto">
                  Exatamente como o lojista verá
                </span>
              </div>
              <div className="sticky top-4">
                <PopupPreview
                  state={activePopup}
                  colors={colors}
                  type={activeTab}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
