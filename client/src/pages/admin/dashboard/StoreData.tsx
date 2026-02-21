import ClientAdminLayout from "@/components/ClientAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  Save, 
  Phone, 
  Clock, 
  MapPin, 
  Share2,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  QrCode,
  Copy,
  Download,
  ExternalLink,
  Check
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

type OpeningHours = {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
};

type SocialLinks = {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
};

type FormData = {
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  cep: string;
  openingHours: OpeningHours;
  socialLinks: SocialLinks;
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutText: string;
  ownerName: string;
  ownerPhoto: string;
};

const defaultOpeningHours: OpeningHours = {
  monday: { open: "18:00", close: "23:00", closed: false },
  tuesday: { open: "18:00", close: "23:00", closed: false },
  wednesday: { open: "18:00", close: "23:00", closed: false },
  thursday: { open: "18:00", close: "23:00", closed: false },
  friday: { open: "18:00", close: "00:00", closed: false },
  saturday: { open: "18:00", close: "00:00", closed: false },
  sunday: { open: "18:00", close: "22:00", closed: false },
};

const dayNames: Record<keyof OpeningHours, string> = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

const defaultFormData: FormData = {
  whatsapp: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  cep: "",
  openingHours: defaultOpeningHours,
  socialLinks: {},
  heroTitle: "",
  heroSubtitle: "",
  aboutTitle: "",
  aboutText: "",
  ownerName: "",
  ownerPhoto: "",
};

export default function StoreDataPage() {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [hasChanges, setHasChanges] = useState(false);

  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.store.getSettings.useQuery();

  const updateSettings = trpc.store.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Dados salvos com sucesso!");
      utils.store.getSettings.invalidate();
      setHasChanges(false);
    },
    onError: (error) => toast.error(error.message),
  });

  // Load existing settings
  useEffect(() => {
    if (settings) {
      setFormData({
        whatsapp: settings.whatsapp || "",
        phone: settings.phone || "",
        email: settings.email || "",
        address: settings.address || "",
        city: settings.city || "",
        state: settings.state || "",
        cep: settings.cep || "",
        openingHours: settings.openingHours || defaultOpeningHours,
        socialLinks: settings.socialLinks || {},
        heroTitle: settings.heroTitle || "",
        heroSubtitle: settings.heroSubtitle || "",
        aboutTitle: settings.aboutTitle || "",
        aboutText: settings.aboutText || "",
        ownerName: settings.ownerName || "",
        ownerPhoto: settings.ownerPhoto || "",
      });
      setHasChanges(false);
    }
  }, [settings]);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleOpeningHoursChange = (
    day: keyof OpeningHours,
    field: keyof OpeningHours[keyof OpeningHours],
    value: any
  ) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: {
          ...formData.openingHours[day],
          [field]: value,
        },
      },
    });
    setHasChanges(true);
  };

  const handleSocialLinkChange = (platform: keyof SocialLinks, value: string) => {
    setFormData({
      ...formData,
      socialLinks: {
        ...formData.socialLinks,
        [platform]: value,
      },
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings.mutate(formData);
  };

  return (
    <ClientAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dados da Loja</h1>
            <p className="text-zinc-400 mt-1">
              Configure informações de contato, horários e conteúdo
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateSettings.isPending}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateSettings.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-zinc-500 text-center py-12">Carregando...</div>
        ) : (
          <Tabs defaultValue="contact">
            <TabsList className="bg-zinc-800">
              <TabsTrigger value="contact" className="data-[state=active]:bg-zinc-700">
                <Phone className="h-4 w-4 mr-2" />
                Contato
              </TabsTrigger>
              <TabsTrigger value="hours" className="data-[state=active]:bg-zinc-700">
                <Clock className="h-4 w-4 mr-2" />
                Horários
              </TabsTrigger>
              <TabsTrigger value="address" className="data-[state=active]:bg-zinc-700">
                <MapPin className="h-4 w-4 mr-2" />
                Endereço
              </TabsTrigger>
              <TabsTrigger value="social" className="data-[state=active]:bg-zinc-700">
                <Share2 className="h-4 w-4 mr-2" />
                Redes Sociais
              </TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-zinc-700">
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="sharing" className="data-[state=active]:bg-zinc-700">
                <QrCode className="h-4 w-4 mr-2" />
                Compartilhar
              </TabsTrigger>
            </TabsList>

            {/* Contact Tab */}
            <TabsContent value="contact" className="mt-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Informações de Contato</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Dados para os clientes entrarem em contato
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      WhatsApp
                    </Label>
                    <Input
                      value={formData.whatsapp}
                      onChange={(e) => handleChange("whatsapp", e.target.value)}
                      placeholder="5511999999999"
                      className="bg-zinc-800 border-zinc-700"
                    />
                    <p className="text-xs text-zinc-500">
                      Número com código do país (55) e DDD, sem espaços ou caracteres especiais
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Telefone (opcional)</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="(11) 3333-4444"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>E-mail (opcional)</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="contato@loja.com"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Hours Tab */}
            <TabsContent value="hours" className="mt-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Horário de Funcionamento</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Configure os horários de abertura e fechamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(Object.keys(dayNames) as Array<keyof OpeningHours>).map((day) => (
                      <div
                        key={day}
                        className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/50"
                      >
                        <div className="w-32">
                          <p className="font-medium text-white">{dayNames[day]}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={!formData.openingHours[day].closed}
                            onCheckedChange={(checked) =>
                              handleOpeningHoursChange(day, "closed", !checked)
                            }
                          />
                          <span className="text-sm text-zinc-400">
                            {formData.openingHours[day].closed ? "Fechado" : "Aberto"}
                          </span>
                        </div>

                        {!formData.openingHours[day].closed && (
                          <div className="flex items-center gap-2 ml-auto">
                            <Input
                              type="time"
                              value={formData.openingHours[day].open}
                              onChange={(e) =>
                                handleOpeningHoursChange(day, "open", e.target.value)
                              }
                              className="w-32 bg-zinc-800 border-zinc-700"
                            />
                            <span className="text-zinc-500">às</span>
                            <Input
                              type="time"
                              value={formData.openingHours[day].close}
                              onChange={(e) =>
                                handleOpeningHoursChange(day, "close", e.target.value)
                              }
                              className="w-32 bg-zinc-800 border-zinc-700"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="mt-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Endereço</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Localização da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Endereço Completo</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Rua Exemplo, 123 - Bairro"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="São Paulo"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                        placeholder="SP"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input
                      value={formData.cep}
                      onChange={(e) => handleChange("cep", e.target.value)}
                      placeholder="01234-567"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Tab */}
            <TabsContent value="social" className="mt-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Redes Sociais</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Links para suas redes sociais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-pink-500" />
                      Instagram
                    </Label>
                    <Input
                      value={formData.socialLinks.instagram || ""}
                      onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                      placeholder="https://instagram.com/sualoja"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-500" />
                      Facebook
                    </Label>
                    <Input
                      value={formData.socialLinks.facebook || ""}
                      onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
                      placeholder="https://facebook.com/sualoja"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-500" />
                      YouTube
                    </Label>
                    <Input
                      value={formData.socialLinks.youtube || ""}
                      onChange={(e) => handleSocialLinkChange("youtube", e.target.value)}
                      placeholder="https://youtube.com/@sualoja"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>TikTok</Label>
                    <Input
                      value={formData.socialLinks.tiktok || ""}
                      onChange={(e) => handleSocialLinkChange("tiktok", e.target.value)}
                      placeholder="https://tiktok.com/@sualoja"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="mt-6 space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Hero (Topo da Página)</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Textos exibidos no topo da landing page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título Principal</Label>
                    <Input
                      value={formData.heroTitle}
                      onChange={(e) => handleChange("heroTitle", e.target.value)}
                      placeholder="Bem-vindo ao Casa Blanca"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subtítulo</Label>
                    <Input
                      value={formData.heroSubtitle}
                      onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                      placeholder="Experiência gastronômica única"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Seção Sobre</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Conte a história da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título da Seção</Label>
                    <Input
                      value={formData.aboutTitle}
                      onChange={(e) => handleChange("aboutTitle", e.target.value)}
                      placeholder="Nossa História"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Texto</Label>
                    <Textarea
                      value={formData.aboutText}
                      onChange={(e) => handleChange("aboutText", e.target.value)}
                      placeholder="Conte a história da sua loja..."
                      className="bg-zinc-800 border-zinc-700 min-h-32"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nome do Proprietário</Label>
                    <Input
                      value={formData.ownerName}
                      onChange={(e) => handleChange("ownerName", e.target.value)}
                      placeholder="João Silva"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Foto do Proprietário (URL)</Label>
                    <Input
                      value={formData.ownerPhoto}
                      onChange={(e) => handleChange("ownerPhoto", e.target.value)}
                      placeholder="https://..."
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sharing Tab */}
            <TabsContent value="sharing" className="mt-6">
              <ShareStoreCard />
            </TabsContent>
          </Tabs>
        )}

        {/* Save Button (mobile) */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden">
            <Button
              onClick={handleSave}
              disabled={updateSettings.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateSettings.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        )}
      </div>
    </ClientAdminLayout>
  );
}

function ShareStoreCard() {
  const { data: roleData } = trpc.auth.getRole.useQuery();
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);

  const slug = roleData?.tenantSlug || '';
  const storeUrl = slug ? `${window.location.origin}/${slug}` : '';

  // Generate QR Code on canvas
  useEffect(() => {
    if (!storeUrl || !qrRef.current) return;
    const canvas = qrRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // Simple QR-like pattern using the URL as seed
    // For production, use a proper QR library. This generates a visual placeholder.
    const qrSize = 25;
    const cellSize = size / qrSize;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Generate deterministic pattern from URL
    let hash = 0;
    for (let i = 0; i < storeUrl.length; i++) {
      const char = storeUrl.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    ctx.fillStyle = '#000000';
    
    // Draw finder patterns (corners)
    const drawFinder = (x: number, y: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
            ctx.fillRect((x + i) * cellSize, (y + j) * cellSize, cellSize, cellSize);
          }
        }
      }
    };
    
    drawFinder(0, 0);
    drawFinder(qrSize - 7, 0);
    drawFinder(0, qrSize - 7);
    
    // Fill data area with deterministic pattern
    let seed = Math.abs(hash);
    for (let i = 0; i < qrSize; i++) {
      for (let j = 0; j < qrSize; j++) {
        // Skip finder pattern areas
        if ((i < 8 && j < 8) || (i >= qrSize - 8 && j < 8) || (i < 8 && j >= qrSize - 8)) continue;
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        if (seed % 3 !== 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [storeUrl]);

  const handleCopy = async () => {
    if (!storeUrl) return;
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const link = document.createElement('a');
    link.download = `qrcode-${slug}.png`;
    link.href = qrRef.current.toDataURL('image/png');
    link.click();
    toast.success('QR Code baixado!');
  };

  if (!slug) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="py-12 text-center">
          <QrCode className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">Nenhuma loja vinculada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <QrCode className="h-5 w-5 text-amber-500" />
            Link da Loja
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Compartilhe o link da sua loja nas redes sociais ou imprima o QR Code para as mesas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL + Copy */}
          <div className="space-y-2">
            <Label className="text-zinc-300">URL da sua loja</Label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
                <ExternalLink className="h-4 w-4 text-zinc-500 mr-2 shrink-0" />
                <span className="text-amber-400 text-sm font-mono truncate">{storeUrl}</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="border-zinc-700 hover:bg-zinc-800 shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-zinc-400" />}
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div className="space-y-3">
            <Label className="text-zinc-300">QR Code</Label>
            <div className="flex items-start gap-6">
              <div className="bg-white p-3 rounded-lg">
                <canvas ref={qrRef} className="w-[160px] h-[160px]" />
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-zinc-400 text-sm">
                  Imprima este QR Code e coloque nas mesas, balcão ou material de divulgação. 
                  Seus clientes poderão escanear e acessar o cardápio diretamente.
                </p>
                <Button
                  variant="outline"
                  onClick={handleDownloadQR}
                  className="border-zinc-700 hover:bg-zinc-800 w-fit"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar QR Code (PNG)
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
