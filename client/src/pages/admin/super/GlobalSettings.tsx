import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import {
  Save,
  Headset,
  MessageCircle,
  Mail,
  Globe,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Phone mask helper: +55 (99) 99999-9999
function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length === 0) return "";
  // If starts with 55, format as +55 (XX) XXXXX-XXXX
  if (digits.startsWith("55") && digits.length > 2) {
    const ddd = digits.slice(2, 4);
    const part1 = digits.slice(4, 9);
    const part2 = digits.slice(9);
    if (digits.length <= 4) return `+55 (${ddd}`;
    if (digits.length <= 9) return `+55 (${ddd}) ${part1}`;
    return `+55 (${ddd}) ${part1}-${part2}`;
  }
  // If doesn't start with 55, assume local format
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function extractDigits(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

export default function GlobalSettingsPage() {
  const [supportWhatsapp, setSupportWhatsapp] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [platformName, setPlatformName] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const utils = trpc.useUtils();

  // Fetch existing settings
  const { data: allSettings, isLoading } = trpc.globalSettings.getAll.useQuery();

  const bulkSetMutation = trpc.globalSettings.bulkSet.useMutation({
    onSuccess: () => {
      toast.success("Configurações globais salvas com sucesso!");
      setIsDirty(false);
      utils.globalSettings.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar configurações");
    },
  });

  // Load existing settings into form
  useEffect(() => {
    if (allSettings && !isInitialized) {
      const settingsMap = new Map(allSettings.map(s => [s.key, s.value]));
      
      const whatsapp = settingsMap.get("support_whatsapp") || "";
      setSupportWhatsapp(whatsapp ? formatWhatsApp(whatsapp) : "");
      setSupportEmail(settingsMap.get("support_email") || "");
      setPlatformName(settingsMap.get("platform_name") || "Casa Blanca");
      setIsInitialized(true);
      setIsDirty(false);
    }
  }, [allSettings, isInitialized]);

  const handleSave = async () => {
    const whatsappDigits = extractDigits(supportWhatsapp);
    
    // Validate WhatsApp if provided
    if (whatsappDigits && whatsappDigits.length < 10) {
      toast.error("Número de WhatsApp inválido. Mínimo 10 dígitos (com DDD).");
      return;
    }

    // Validate email if provided
    if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
      toast.error("Formato de e-mail inválido.");
      return;
    }

    const settings = [
      {
        key: "support_whatsapp",
        value: whatsappDigits,
        description: "WhatsApp de suporte da plataforma (usado na tela de login)",
      },
      {
        key: "support_email",
        value: supportEmail.trim(),
        description: "E-mail de suporte da plataforma (fallback)",
      },
      {
        key: "platform_name",
        value: platformName.trim() || "Casa Blanca",
        description: "Nome da plataforma exibido em comunicações",
      },
    ];

    bulkSetMutation.mutate(settings);
  };

  const handleFieldChange = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setIsDirty(true);
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Configurações Globais
            </h1>
            <p className="text-zinc-400 mt-1">
              Variáveis da plataforma que afetam todo o sistema
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
                Salvar Alterações
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
          <div className="grid gap-6">
            {/* Atendimento e Suporte */}
            <Card className="bg-zinc-900/60 border-zinc-800/60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Headset className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Atendimento e Suporte
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      Canais de contato para recuperação de senha e suporte geral
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* WhatsApp de Suporte */}
                <div className="space-y-2">
                  <Label className="text-zinc-300 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-[#25D366]" />
                    WhatsApp de Suporte da Plataforma
                  </Label>
                  <Input
                    placeholder="+55 (34) 99120-1913"
                    value={supportWhatsapp}
                    onChange={(e) => {
                      handleFieldChange(setSupportWhatsapp)(
                        formatWhatsApp(e.target.value)
                      );
                    }}
                    className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 h-11 max-w-md"
                  />
                  <p className="text-xs text-zinc-500 flex items-start gap-1.5">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Este número será exibido na tela de Login quando o usuário clicar em
                    "Esqueci a Senha". Formato: +55 (DDD) XXXXX-XXXX
                  </p>
                </div>

                {/* E-mail de Suporte */}
                <div className="space-y-2">
                  <Label className="text-zinc-300 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-400" />
                    E-mail de Suporte (Fallback)
                  </Label>
                  <Input
                    type="email"
                    placeholder="suporte@casablanca.com.br"
                    value={supportEmail}
                    onChange={(e) =>
                      handleFieldChange(setSupportEmail)(e.target.value)
                    }
                    className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 h-11 max-w-md"
                  />
                  <p className="text-xs text-zinc-500 flex items-start gap-1.5">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Será usado como fallback caso o WhatsApp não esteja configurado.
                    Exibido como mailto: na tela de Login.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Identidade da Plataforma */}
            <Card className="bg-zinc-900/60 border-zinc-800/60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Identidade da Plataforma
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      Dados gerais que identificam a plataforma
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nome da Plataforma */}
                <div className="space-y-2">
                  <Label className="text-zinc-300 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-amber-400" />
                    Nome da Plataforma
                  </Label>
                  <Input
                    placeholder="Casa Blanca"
                    value={platformName}
                    onChange={(e) =>
                      handleFieldChange(setPlatformName)(e.target.value)
                    }
                    className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 h-11 max-w-md"
                  />
                  <p className="text-xs text-zinc-500 flex items-start gap-1.5">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Nome exibido em comunicações e mensagens automáticas do sistema.
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
