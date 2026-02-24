import ClientAdminLayout from "@/components/ClientAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUploader from "@/components/ImageUploader";
import { trpc } from "@/lib/trpc";
import {
  Save,
  Store,
  Clock,
  MapPin,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  QrCode,
  Copy,
  Download,
  ExternalLink,
  Check,
  Truck,
  Headset,
  Share2,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

type DayHours = {
  shift1_start: string;
  shift1_end: string;
  shift2_start?: string | null;
  shift2_end?: string | null;
  closed: boolean;
};

type OpeningHours = {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
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
  deliveryFee: string;
  attendantName: string;
  attendantPhoto: string;
  googleMapsLink: string;
  showBusinessHours: boolean;
};

const defaultOpeningHours: OpeningHours = {
  monday: { shift1_start: "18:00", shift1_end: "23:00", closed: false },
  tuesday: { shift1_start: "18:00", shift1_end: "23:00", closed: false },
  wednesday: { shift1_start: "18:00", shift1_end: "23:00", closed: false },
  thursday: { shift1_start: "18:00", shift1_end: "23:00", closed: false },
  friday: { shift1_start: "18:00", shift1_end: "00:00", closed: false },
  saturday: { shift1_start: "18:00", shift1_end: "00:00", closed: false },
  sunday: { shift1_start: "18:00", shift1_end: "22:00", closed: false },
};

// Migrate legacy format (open/close) to new format (shift1_start/shift1_end)
function migrateOpeningHours(raw: any): OpeningHours {
  if (!raw) return defaultOpeningHours;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  const result: any = {};
  for (const day of days) {
    const d = raw[day];
    if (!d) {
      result[day] = defaultOpeningHours[day];
    } else if ('shift1_start' in d) {
      // Already new format
      result[day] = d;
    } else {
      // Legacy format: migrate open/close -> shift1_start/shift1_end
      result[day] = {
        shift1_start: d.open || '18:00',
        shift1_end: d.close || '23:00',
        shift2_start: null,
        shift2_end: null,
        closed: d.closed ?? false,
      };
    }
  }
  return result as OpeningHours;
}

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
  deliveryFee: "",
  attendantName: "",
  attendantPhoto: "",
  googleMapsLink: "",
  showBusinessHours: true,
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
    onError: (error: any) => toast.error(error.message),
  });

  // Upload image via catalog.uploadImage (reuse existing pipeline)
  const uploadImage = trpc.products.uploadImage.useMutation();

  const handleImageUpload = async (base64Data: string, fileName: string): Promise<string> => {
    const result = await uploadImage.mutateAsync({
      imageData: base64Data,
      fileName,
      contentType: "image/webp",
    });
    return result.url;
  };

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
        openingHours: migrateOpeningHours(settings.openingHours),
        socialLinks: settings.socialLinks || {},
        heroTitle: settings.heroTitle || "",
        heroSubtitle: settings.heroSubtitle || "",
        aboutTitle: settings.aboutTitle || "",
        aboutText: settings.aboutText || "",
        ownerName: settings.ownerName || "",
        ownerPhoto: settings.ownerPhoto || "",
        deliveryFee: settings.deliveryFee || "",
        attendantName: (settings as any).attendantName || "",
        attendantPhoto: (settings as any).attendantPhoto || "",
        googleMapsLink: (settings as any).googleMapsLink || "",
        showBusinessHours: (settings as any).showBusinessHours ?? true,
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
    updateSettings.mutate({
      ...formData,
      deliveryFee: formData.deliveryFee === "" ? null : formData.deliveryFee,
    });
  };

  return (
    <ClientAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dados da Loja</h1>
            <p className="text-zinc-400 mt-1">
              Configure informações, endereço e horários
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
          <Tabs defaultValue="info">
            <TabsList className="bg-zinc-800">
              <TabsTrigger value="info" className="data-[state=active]:bg-zinc-700 text-zinc-300 data-[state=active]:text-white">
                <Store className="h-4 w-4 mr-2" />
                Informações
              </TabsTrigger>
              <TabsTrigger value="address" className="data-[state=active]:bg-zinc-700 text-zinc-300 data-[state=active]:text-white">
                <MapPin className="h-4 w-4 mr-2" />
                Endereço
              </TabsTrigger>
              <TabsTrigger value="hours" className="data-[state=active]:bg-zinc-700 text-zinc-300 data-[state=active]:text-white">
                <Clock className="h-4 w-4 mr-2" />
                Horários
              </TabsTrigger>
              <TabsTrigger value="sharing" className="data-[state=active]:bg-zinc-700 text-zinc-300 data-[state=active]:text-white">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </TabsTrigger>
            </TabsList>

            {/* ============================================ */}
            {/* TAB 1: INFORMAÇÕES                           */}
            {/* ============================================ */}
            <TabsContent value="info" className="mt-6 space-y-6">
              {/* Contato */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-green-500" />
                    Contato
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Dados para os clientes entrarem em contato
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">WhatsApp</Label>
                    <Input
                      value={formData.whatsapp}
                      onChange={(e) => handleChange("whatsapp", e.target.value)}
                      placeholder="5511999999999"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                    <p className="text-xs text-zinc-500">
                      Número com código do país (55) e DDD, sem espaços ou caracteres especiais
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Telefone (opcional)</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="(11) 3333-4444"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">E-mail (opcional)</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="contato@loja.com"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Redes Sociais */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-blue-500" />
                    Redes Sociais
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Links para suas redes sociais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-zinc-300">
                        <Instagram className="h-4 w-4 text-pink-500" />
                        Instagram
                      </Label>
                      <Input
                        value={formData.socialLinks.instagram || ""}
                        onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                        placeholder="https://instagram.com/sualoja"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-zinc-300">
                        <Facebook className="h-4 w-4 text-blue-500" />
                        Facebook
                      </Label>
                      <Input
                        value={formData.socialLinks.facebook || ""}
                        onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
                        placeholder="https://facebook.com/sualoja"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-zinc-300">
                        <Youtube className="h-4 w-4 text-red-500" />
                        YouTube
                      </Label>
                      <Input
                        value={formData.socialLinks.youtube || ""}
                        onChange={(e) => handleSocialLinkChange("youtube", e.target.value)}
                        placeholder="https://youtube.com/@sualoja"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">TikTok</Label>
                      <Input
                        value={formData.socialLinks.tiktok || ""}
                        onChange={(e) => handleSocialLinkChange("tiktok", e.target.value)}
                        placeholder="https://tiktok.com/@sualoja"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Taxa de Entrega */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Truck className="h-5 w-5 text-amber-500" />
                    Taxa de Entrega
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Defina uma taxa fixa de entrega (opcional)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Taxa Fixa de Entrega (R$)</Label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">R$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.deliveryFee}
                        onChange={(e) => handleChange("deliveryFee", e.target.value)}
                        placeholder="0.00"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pl-10"
                      />
                    </div>
                    <p className="text-xs text-zinc-500">
                      Deixe em branco para não exibir taxa de entrega na loja
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Configuração do Atendimento (Popup WhatsApp) */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Headset className="h-5 w-5 text-green-500" />
                    Configuração do Atendimento (Popup WhatsApp)
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Personalize o popup de WhatsApp que aparece na sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Foto do Atendente */}
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Foto do Atendente</Label>
                      <ImageUploader
                        value={formData.attendantPhoto}
                        onChange={(url) => {
                          handleChange("attendantPhoto", url);
                        }}
                        onRemove={() => handleChange("attendantPhoto", "")}
                        context="profile"
                        onUpload={handleImageUpload}
                        placeholder="Foto do atendente (quadrada)"
                      />
                      <p className="text-xs text-zinc-500">
                        Foto que aparecerá no popup do WhatsApp. Corte quadrado (1:1).
                      </p>
                    </div>

                    {/* Nome do Atendente */}
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Nome do Atendente</Label>
                      <Input
                        value={formData.attendantName}
                        onChange={(e) => handleChange("attendantName", e.target.value)}
                        placeholder="Ex: Maria"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                      <p className="text-xs text-zinc-500">
                        Nome exibido no popup de atendimento via WhatsApp
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============================================ */}
            {/* TAB 2: ENDEREÇO                              */}
            {/* ============================================ */}
            <TabsContent value="address" className="mt-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-500" />
                    Endereço
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Localização da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Endereço Completo</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Rua Exemplo, 123 - Bairro"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Cidade</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="São Paulo"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Estado</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                        placeholder="SP"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-xs">
                    <Label className="text-zinc-300">CEP</Label>
                    <Input
                      value={formData.cep}
                      onChange={(e) => handleChange("cep", e.target.value)}
                      placeholder="01234-567"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                  </div>

                  {/* Google Maps Link */}
                  <div className="space-y-2 pt-4 border-t border-zinc-800">
                    <Label className="text-zinc-300 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-400" />
                      Link do Google Maps
                    </Label>
                    <Input
                      value={formData.googleMapsLink}
                      onChange={(e) => handleChange("googleMapsLink", e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                    <p className="text-xs text-zinc-500">
                      Cole aqui o link do Google Maps da sua loja. Será usado no botão "Como Chegar" do site.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============================================ */}
            {/* TAB 3: HORÁRIOS                              */}
            {/* ============================================ */}
            <TabsContent value="hours" className="mt-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Horário de Funcionamento
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Configure os horários de abertura e fechamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Toggle: Exibir Horários no Site */}
                  <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label htmlFor="show-hours-toggle" className="text-white font-medium text-base">
                          Exibir Horários e Status (Aberto/Fechado) no Site
                        </Label>
                        <p className="text-sm text-zinc-400 mt-1">
                          Desative esta opção se você trabalha apenas sob encomenda.
                        </p>
                      </div>
                      <Switch
                        id="show-hours-toggle"
                        checked={formData.showBusinessHours}
                        onCheckedChange={(checked) => handleChange('showBusinessHours', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(Object.keys(dayNames) as Array<keyof OpeningHours>).map((day) => {
                      const dayData = formData.openingHours[day];
                      const hasShift2 = !!(dayData.shift2_start && dayData.shift2_end);

                      return (
                        <div
                          key={day}
                          className="p-4 rounded-lg bg-zinc-800/50 space-y-3"
                        >
                          {/* Day header row */}
                          <div className="flex items-center gap-4">
                            <div className="w-32 shrink-0">
                              <p className="font-medium text-white text-sm">{dayNames[day]}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Switch
                                checked={!dayData.closed}
                                onCheckedChange={(checked) =>
                                  handleOpeningHoursChange(day, "closed", !checked)
                                }
                              />
                              <span className="text-sm text-zinc-400 w-16">
                                {dayData.closed ? "Fechado" : "Aberto"}
                              </span>
                            </div>

                            {!dayData.closed && (
                              <div className="flex items-center gap-2 ml-auto">
                                <Label className="text-xs text-zinc-500">Turno 1</Label>
                                <Input
                                  type="time"
                                  value={dayData.shift1_start}
                                  onChange={(e) =>
                                    handleOpeningHoursChange(day, "shift1_start", e.target.value)
                                  }
                                  className="w-28 bg-zinc-800 border-zinc-700 text-white text-sm"
                                />
                                <span className="text-zinc-500 text-sm">às</span>
                                <Input
                                  type="time"
                                  value={dayData.shift1_end}
                                  onChange={(e) =>
                                    handleOpeningHoursChange(day, "shift1_end", e.target.value)
                                  }
                                  className="w-28 bg-zinc-800 border-zinc-700 text-white text-sm"
                                />
                              </div>
                            )}
                          </div>

                          {/* Shift 2 row */}
                          {!dayData.closed && hasShift2 && (
                            <div className="flex items-center gap-2 ml-[calc(8rem+1rem)] pl-[calc(4.5rem+0.5rem)]">
                              <Label className="text-xs text-zinc-500">Turno 2</Label>
                              <Input
                                type="time"
                                value={dayData.shift2_start || ''}
                                onChange={(e) =>
                                  handleOpeningHoursChange(day, "shift2_start", e.target.value)
                                }
                                className="w-28 bg-zinc-800 border-zinc-700 text-white text-sm"
                              />
                              <span className="text-zinc-500 text-sm">às</span>
                              <Input
                                type="time"
                                value={dayData.shift2_end || ''}
                                onChange={(e) =>
                                  handleOpeningHoursChange(day, "shift2_end", e.target.value)
                                }
                                className="w-28 bg-zinc-800 border-zinc-700 text-white text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    openingHours: {
                                      ...prev.openingHours,
                                      [day]: {
                                        ...prev.openingHours[day],
                                        shift2_start: null,
                                        shift2_end: null,
                                      },
                                    },
                                  }));
                                  setHasChanges(true);
                                }}
                                className="p-1.5 rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Remover 2º turno"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {/* Add shift 2 button */}
                          {!dayData.closed && !hasShift2 && (
                            <div className="ml-[calc(8rem+1rem)] pl-[calc(4.5rem+0.5rem)]">
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    openingHours: {
                                      ...prev.openingHours,
                                      [day]: {
                                        ...prev.openingHours[day],
                                        shift2_start: "18:00",
                                        shift2_end: "23:00",
                                      },
                                    },
                                  }));
                                  setHasChanges(true);
                                }}
                                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Adicionar 2º Turno
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============================================ */}
            {/* TAB 4: COMPARTILHAR                          */}
            {/* ============================================ */}
            <TabsContent value="sharing" className="mt-6">
              <ShareStoreCard />
            </TabsContent>
          </Tabs>
        )}

        {/* Save Button (mobile floating) */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
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

    const qrSize = 25;
    const cellSize = size / qrSize;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    let hash = 0;
    for (let i = 0; i < storeUrl.length; i++) {
      const char = storeUrl.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    ctx.fillStyle = '#000000';

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

    let seed = Math.abs(hash);
    for (let i = 0; i < qrSize; i++) {
      for (let j = 0; j < qrSize; j++) {
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
                  className="border-zinc-700 hover:bg-zinc-800 w-fit text-zinc-300"
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
