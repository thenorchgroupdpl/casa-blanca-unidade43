import { useState, useCallback, useMemo, useRef } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Store, MapPin, Clock, Palette, UtensilsCrossed,
  ChevronLeft, ChevronRight, Check, Upload, Plus, Trash2,
  Loader2, AlertCircle, CheckCircle2, Phone, Mail, Instagram,
  Facebook, ExternalLink, Image as ImageIcon
} from "lucide-react";

// ============================================
// TYPES
// ============================================
interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
}

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
}

interface DaySchedule {
  open: boolean;
  shift1Start?: string;
  shift1End?: string;
  hasSecondShift?: boolean;
  shift2Start?: string;
  shift2End?: string;
}

interface ProductEntry {
  name: string;
  categoryName: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  highlightTag?: string;
}

interface CategoryEntry {
  name: string;
}

interface BriefingData {
  // Step 1
  storeName: string;
  niche: string;
  description?: string;
  ownerStory?: string;
  ownerName: string;
  ownerPhotoUrl?: string;
  // Step 2
  whatsapp: string;
  phone?: string;
  email?: string;
  address: Address;
  googleMapsLink?: string;
  socialLinks?: SocialLinks;
  // Step 3
  workByOrder: boolean;
  businessHours?: Record<string, DaySchedule>;
  // Step 4
  logoUrl?: string;
  heroImageUrl?: string;
  primaryColor?: string;
  visualStyle?: "dark_sophisticated" | "light_modern" | "rustic_cozy" | "colorful_vibrant";
  // Step 5
  categories: CategoryEntry[];
  products: ProductEntry[];
}

const STEPS = [
  { id: 1, title: "Sobre a Loja", icon: Store },
  { id: 2, title: "Contato & Localização", icon: MapPin },
  { id: 3, title: "Horários", icon: Clock },
  { id: 4, title: "Identidade Visual", icon: Palette },
  { id: 5, title: "Cardápio", icon: UtensilsCrossed },
];

const DAYS = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

const NICHES = [
  "Restaurante", "Pizzaria", "Hamburgueria", "Doceria", "Padaria",
  "Açaí", "Sushi / Japonês", "Marmitaria", "Food Truck", "Cafeteria",
  "Bar / Petiscaria", "Sorveteria", "Outro",
];

const VISUAL_STYLES = [
  { value: "dark_sophisticated" as const, label: "Escuro & Sofisticado", desc: "Fundo escuro, dourado, elegante", gradient: "from-zinc-900 to-amber-900" },
  { value: "light_modern" as const, label: "Claro & Moderno", desc: "Fundo branco, cores suaves", gradient: "from-white to-emerald-50" },
  { value: "rustic_cozy" as const, label: "Rústico & Acolhedor", desc: "Tons terrosos, madeira", gradient: "from-amber-100 to-orange-200" },
  { value: "colorful_vibrant" as const, label: "Colorido & Vibrante", desc: "Cores vivas, energia", gradient: "from-pink-400 to-purple-500" },
];

const HIGHLIGHT_TAGS = [
  { value: "", label: "Nenhum" },
  { value: "mais_vendido", label: "Mais Vendido" },
  { value: "novidade", label: "Novidade" },
  { value: "vegano", label: "Vegano" },
  { value: "sem_gluten", label: "Sem Glúten" },
  { value: "picante", label: "Picante" },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function OnboardingPage() {
  const [, params] = useRoute("/onboarding/:token");
  const token = params?.token || "";
  // Validate token
  const { data: tokenData, isLoading: validating, error: tokenError } = trpc.onboarding.validateToken.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  // If already submitted, show confirmation
  if (validating) {
    return <LoadingScreen />;
  }

  if (tokenError || !tokenData) {
    return <ErrorScreen message="Link de briefing inválido ou expirado." />;
  }

  if (tokenData.onboardingStatus === "submitted" || tokenData.onboardingStatus === "reviewed") {
    return <AlreadySubmittedScreen tenantName={tokenData.tenantName} supportWhatsapp={tokenData.supportWhatsapp} />;
  }

  return (
    <BriefingForm
      token={token}
      tenantName={tokenData.tenantName}
      supportWhatsapp={tokenData.supportWhatsapp}
    />
  );
}

// ============================================
// BRIEFING FORM
// ============================================
function BriefingForm({ token, tenantName, supportWhatsapp }: {
  token: string;
  tenantName: string;
  supportWhatsapp: string;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form state
  const [data, setData] = useState<BriefingData>({
    storeName: tenantName,
    niche: "",
    ownerName: "",
    whatsapp: "",
    address: { street: "", number: "", neighborhood: "", city: "", state: "", cep: "" },
    workByOrder: false,
    businessHours: DAYS.reduce((acc, day) => ({
      ...acc,
      [day.key]: { open: day.key !== "sunday", shift1Start: "08:00", shift1End: "18:00", hasSecondShift: false },
    }), {}),
    categories: [{ name: "" }],
    products: [{ name: "", categoryName: "", price: 0 }],
  });

  const updateField = useCallback(<K extends keyof BriefingData>(key: K, value: BriefingData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  // Upload mutation
  const uploadMutation = trpc.onboarding.uploadImage.useMutation();

  // Submit mutation
  const submitMutation = trpc.onboarding.submitBriefing.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (err) => {
      toast.error("Erro ao enviar", { description: err.message });
    },
  });

  const handleImageUpload = useCallback(async (
    file: File,
    category: "logo" | "hero" | "owner_photo" | "product"
  ): Promise<string | null> => {
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await uploadMutation.mutateAsync({
        token,
        imageData: base64,
        fileName: file.name,
        contentType: file.type,
        category,
      });

      return result.url;
    } catch (err: any) {
      toast.error("Erro no upload", { description: err.message || "Tente novamente" });
      return null;
    }
  }, [token, uploadMutation, toast]);

  const handleSubmit = useCallback(() => {
    // Validate required fields
    if (!data.storeName || !data.niche || !data.ownerName) {
      toast.error("Campos obrigatórios", { description: "Preencha o nome da loja, nicho e nome do proprietário." });
      setCurrentStep(1);
      return;
    }
    if (!data.whatsapp || !data.address.street || !data.address.city) {
      toast.error("Campos obrigatórios", { description: "Preencha o WhatsApp e endereço." });
      setCurrentStep(2);
      return;
    }
    const validCategories = data.categories.filter(c => c.name.trim());
    const validProducts = data.products.filter(p => p.name.trim() && p.price > 0);
    if (validCategories.length === 0 || validProducts.length === 0) {
      toast.error("Cardápio obrigatório", { description: "Adicione pelo menos 1 categoria e 1 produto." });
      setCurrentStep(5);
      return;
    }

    submitMutation.mutate({
      token,
      data: {
        ...data,
        categories: validCategories,
        products: validProducts,
      },
    });
  }, [data, token, submitMutation, toast]);

  if (isSubmitted) {
    return <SuccessScreen tenantName={tenantName} supportWhatsapp={supportWhatsapp} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-amber-400">Casa Blanca</h1>
            <p className="text-xs text-zinc-500">Briefing de Onboarding — {tenantName}</p>
          </div>
          <div className="text-xs text-zinc-500">
            Etapa {currentStep} de {STEPS.length}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isDone = step.id < currentStep;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : isDone
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 pb-32">
        {currentStep === 1 && (
          <Step1_About data={data} updateField={updateField} onUpload={handleImageUpload} />
        )}
        {currentStep === 2 && (
          <Step2_Contact data={data} updateField={updateField} />
        )}
        {currentStep === 3 && (
          <Step3_Hours data={data} updateField={updateField} />
        )}
        {currentStep === 4 && (
          <Step4_Visual data={data} updateField={updateField} onUpload={handleImageUpload} />
        )}
        {currentStep === 5 && (
          <Step5_Menu data={data} updateField={updateField} onUpload={handleImageUpload} />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={() => setCurrentStep(s => Math.min(5, s + 1))}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              Próximo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-8"
            >
              {submitMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" /> Enviar Briefing</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 1 — SOBRE A LOJA
// ============================================
function Step1_About({ data, updateField, onUpload }: {
  data: BriefingData;
  updateField: <K extends keyof BriefingData>(key: K, value: BriefingData[K]) => void;
  onUpload: (file: File, category: "logo" | "hero" | "owner_photo" | "product") => Promise<string | null>;
}) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Sobre a Loja"
        description="Conte-nos sobre o seu negócio. Essas informações serão usadas para criar a identidade da sua loja."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Nome da Loja *" hint="Como seus clientes conhecem você">
          <Input
            value={data.storeName}
            onChange={e => updateField("storeName", e.target.value)}
            placeholder="Ex: Pizzaria do Mário"
            className="bg-zinc-900 border-zinc-700 text-zinc-100"
          />
        </FormField>

        <FormField label="Nicho / Tipo *" hint="Qual o segmento do seu negócio">
          <select
            value={data.niche}
            onChange={e => updateField("niche", e.target.value)}
            className="w-full rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 px-3 py-2 text-sm"
          >
            <option value="">Selecione...</option>
            {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </FormField>
      </div>

      <FormField label="Descrição Curta" hint="Até 300 caracteres. Uma frase que define sua loja.">
        <Textarea
          value={data.description || ""}
          onChange={e => updateField("description", e.target.value)}
          placeholder="Ex: A melhor pizza artesanal da cidade, feita com ingredientes selecionados."
          maxLength={300}
          rows={3}
          className="bg-zinc-900 border-zinc-700 text-zinc-100"
        />
        <p className="text-xs text-zinc-500 mt-1">{(data.description || "").length}/300</p>
      </FormField>

      <div className="border-t border-zinc-800 pt-6">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Proprietário</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Nome do Proprietário *">
            <Input
              value={data.ownerName}
              onChange={e => updateField("ownerName", e.target.value)}
              placeholder="Seu nome completo"
              className="bg-zinc-900 border-zinc-700 text-zinc-100"
            />
          </FormField>

          <FormField label="Foto do Proprietário" hint="Opcional. Aparece na seção 'Sobre'.">
            <div className="flex items-center gap-3">
              {data.ownerPhotoUrl ? (
                <div className="relative">
                  <img src={data.ownerPhotoUrl} alt="Foto" className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/30" />
                  <button
                    onClick={() => updateField("ownerPhotoUrl", undefined)}
                    className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <ImageUploadButton
                  loading={uploadingPhoto}
                  onSelect={async (file) => {
                    setUploadingPhoto(true);
                    const url = await onUpload(file, "owner_photo");
                    if (url) updateField("ownerPhotoUrl", url);
                    setUploadingPhoto(false);
                  }}
                  label="Enviar foto"
                />
              )}
            </div>
          </FormField>
        </div>
      </div>

      <FormField label="Sua História" hint="Até 500 caracteres. Conte a história do seu negócio.">
        <Textarea
          value={data.ownerStory || ""}
          onChange={e => updateField("ownerStory", e.target.value)}
          placeholder="Ex: Comecei vendendo pizza na garagem de casa em 2015..."
          maxLength={500}
          rows={4}
          className="bg-zinc-900 border-zinc-700 text-zinc-100"
        />
        <p className="text-xs text-zinc-500 mt-1">{(data.ownerStory || "").length}/500</p>
      </FormField>
    </div>
  );
}

// ============================================
// STEP 2 — CONTATO & LOCALIZAÇÃO
// ============================================
function Step2_Contact({ data, updateField }: {
  data: BriefingData;
  updateField: <K extends keyof BriefingData>(key: K, value: BriefingData[K]) => void;
}) {
  const updateAddress = useCallback((key: keyof Address, value: string) => {
    updateField("address", { ...data.address, [key]: value });
  }, [data.address, updateField]);

  const updateSocial = useCallback((key: keyof SocialLinks, value: string) => {
    updateField("socialLinks", { ...data.socialLinks, [key]: value });
  }, [data.socialLinks, updateField]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Contato & Localização"
        description="Informações de contato e endereço do seu estabelecimento."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="WhatsApp Principal *" hint="Número com DDD para receber pedidos">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={data.whatsapp}
              onChange={e => updateField("whatsapp", e.target.value)}
              placeholder="(11) 99999-9999"
              className="bg-zinc-900 border-zinc-700 text-zinc-100 pl-10"
            />
          </div>
        </FormField>

        <FormField label="Telefone Fixo" hint="Opcional">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={data.phone || ""}
              onChange={e => updateField("phone", e.target.value)}
              placeholder="(11) 3333-3333"
              className="bg-zinc-900 border-zinc-700 text-zinc-100 pl-10"
            />
          </div>
        </FormField>

        <FormField label="E-mail" hint="Opcional">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={data.email || ""}
              onChange={e => updateField("email", e.target.value)}
              placeholder="contato@sualoja.com"
              type="email"
              className="bg-zinc-900 border-zinc-700 text-zinc-100 pl-10"
            />
          </div>
        </FormField>
      </div>

      <div className="border-t border-zinc-800 pt-6">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Endereço *</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormField label="Rua / Avenida *">
              <Input value={data.address.street} onChange={e => updateAddress("street", e.target.value)} placeholder="Rua das Flores" className="bg-zinc-900 border-zinc-700 text-zinc-100" />
            </FormField>
          </div>
          <FormField label="Número *">
            <Input value={data.address.number} onChange={e => updateAddress("number", e.target.value)} placeholder="123" className="bg-zinc-900 border-zinc-700 text-zinc-100" />
          </FormField>
          <FormField label="Bairro *">
            <Input value={data.address.neighborhood} onChange={e => updateAddress("neighborhood", e.target.value)} placeholder="Centro" className="bg-zinc-900 border-zinc-700 text-zinc-100" />
          </FormField>
          <FormField label="Cidade *">
            <Input value={data.address.city} onChange={e => updateAddress("city", e.target.value)} placeholder="São Paulo" className="bg-zinc-900 border-zinc-700 text-zinc-100" />
          </FormField>
          <FormField label="Estado *">
            <Input value={data.address.state} onChange={e => updateAddress("state", e.target.value)} placeholder="SP" maxLength={2} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
          </FormField>
          <FormField label="CEP *">
            <Input value={data.address.cep} onChange={e => updateAddress("cep", e.target.value)} placeholder="01234-567" className="bg-zinc-900 border-zinc-700 text-zinc-100" />
          </FormField>
        </div>
      </div>

      <FormField label="Link do Google Maps" hint="Opcional. Cole o link do seu estabelecimento no Google Maps.">
        <div className="relative">
          <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={data.googleMapsLink || ""}
            onChange={e => updateField("googleMapsLink", e.target.value)}
            placeholder="https://maps.google.com/..."
            className="bg-zinc-900 border-zinc-700 text-zinc-100 pl-10"
          />
        </div>
      </FormField>

      <div className="border-t border-zinc-800 pt-6">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Redes Sociais (Opcional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Instagram">
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input value={data.socialLinks?.instagram || ""} onChange={e => updateSocial("instagram", e.target.value)} placeholder="@sualoja" className="bg-zinc-900 border-zinc-700 text-zinc-100 pl-10" />
            </div>
          </FormField>
          <FormField label="Facebook">
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input value={data.socialLinks?.facebook || ""} onChange={e => updateSocial("facebook", e.target.value)} placeholder="facebook.com/sualoja" className="bg-zinc-900 border-zinc-700 text-zinc-100 pl-10" />
            </div>
          </FormField>
          <FormField label="TikTok">
            <Input value={data.socialLinks?.tiktok || ""} onChange={e => updateSocial("tiktok", e.target.value)} placeholder="@sualoja" className="bg-zinc-900 border-zinc-700 text-zinc-100" />
          </FormField>
          <FormField label="YouTube">
            <Input value={data.socialLinks?.youtube || ""} onChange={e => updateSocial("youtube", e.target.value)} placeholder="youtube.com/@sualoja" className="bg-zinc-900 border-zinc-700 text-zinc-100" />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 3 — HORÁRIOS
// ============================================
function Step3_Hours({ data, updateField }: {
  data: BriefingData;
  updateField: <K extends keyof BriefingData>(key: K, value: BriefingData[K]) => void;
}) {
  const hours = data.businessHours || {};

  const updateDay = useCallback((dayKey: string, field: keyof DaySchedule, value: any) => {
    const current = hours[dayKey] || { open: false };
    updateField("businessHours", {
      ...hours,
      [dayKey]: { ...current, [field]: value },
    });
  }, [hours, updateField]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Horários de Funcionamento"
        description="Defina os horários de atendimento da sua loja."
      />

      <div className="flex items-center gap-3 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
        <input
          type="checkbox"
          checked={data.workByOrder}
          onChange={e => updateField("workByOrder", e.target.checked)}
          className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500"
        />
        <div>
          <p className="text-sm font-medium text-zinc-200">Trabalho sob encomenda</p>
          <p className="text-xs text-zinc-500">Marque se você não tem horário fixo e trabalha apenas por pedidos agendados.</p>
        </div>
      </div>

      {!data.workByOrder && (
        <div className="space-y-3">
          {DAYS.map(day => {
            const dayData = hours[day.key] || { open: false };
            return (
              <div key={day.key} className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-zinc-200">{day.label}</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-zinc-500">{dayData.open ? "Aberto" : "Fechado"}</span>
                    <input
                      type="checkbox"
                      checked={dayData.open}
                      onChange={e => updateDay(day.key, "open", e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500"
                    />
                  </label>
                </div>
                {dayData.open && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input type="time" value={dayData.shift1Start || "08:00"} onChange={e => updateDay(day.key, "shift1Start", e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 w-32" />
                      <span className="text-zinc-500 text-xs">até</span>
                      <Input type="time" value={dayData.shift1End || "18:00"} onChange={e => updateDay(day.key, "shift1End", e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 w-32" />
                      <button
                        onClick={() => updateDay(day.key, "hasSecondShift", !dayData.hasSecondShift)}
                        className="text-xs text-amber-400 hover:text-amber-300 ml-2"
                      >
                        {dayData.hasSecondShift ? "- Remover 2º turno" : "+ 2º turno"}
                      </button>
                    </div>
                    {dayData.hasSecondShift && (
                      <div className="flex items-center gap-2">
                        <Input type="time" value={dayData.shift2Start || "18:00"} onChange={e => updateDay(day.key, "shift2Start", e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 w-32" />
                        <span className="text-zinc-500 text-xs">até</span>
                        <Input type="time" value={dayData.shift2End || "22:00"} onChange={e => updateDay(day.key, "shift2End", e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 w-32" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// STEP 4 — IDENTIDADE VISUAL
// ============================================
function Step4_Visual({ data, updateField, onUpload }: {
  data: BriefingData;
  updateField: <K extends keyof BriefingData>(key: K, value: BriefingData[K]) => void;
  onUpload: (file: File, category: "logo" | "hero" | "owner_photo" | "product") => Promise<string | null>;
}) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Identidade Visual"
        description="Envie sua logo, imagem de capa e escolha o estilo visual da sua loja. Tudo pode ser ajustado depois."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-sm text-zinc-300">Logo da Loja</Label>
          {data.logoUrl ? (
            <div className="relative inline-block">
              <img src={data.logoUrl} alt="Logo" className="w-32 h-32 rounded-xl object-cover border-2 border-amber-500/30" />
              <button onClick={() => updateField("logoUrl", undefined)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <ImageUploadButton
              loading={uploadingLogo}
              onSelect={async (file) => {
                setUploadingLogo(true);
                const url = await onUpload(file, "logo");
                if (url) updateField("logoUrl", url);
                setUploadingLogo(false);
              }}
              label="Enviar logo"
              large
            />
          )}
          <p className="text-xs text-zinc-500">Formato quadrado recomendado. PNG ou JPG, até 5MB.</p>
        </div>

        <div className="space-y-3">
          <Label className="text-sm text-zinc-300">Imagem de Capa (Hero)</Label>
          {data.heroImageUrl ? (
            <div className="relative inline-block">
              <img src={data.heroImageUrl} alt="Hero" className="w-full h-32 rounded-xl object-cover border-2 border-amber-500/30" />
              <button onClick={() => updateField("heroImageUrl", undefined)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <ImageUploadButton
              loading={uploadingHero}
              onSelect={async (file) => {
                setUploadingHero(true);
                const url = await onUpload(file, "hero");
                if (url) updateField("heroImageUrl", url);
                setUploadingHero(false);
              }}
              label="Enviar imagem de capa"
              large
            />
          )}
          <p className="text-xs text-zinc-500">Formato paisagem (16:9). Aparece no topo da loja.</p>
        </div>
      </div>

      <FormField label="Cor Principal" hint="Escolha a cor que representa sua marca. Pode ser ajustada depois.">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={data.primaryColor || "#d4a574"}
            onChange={e => updateField("primaryColor", e.target.value)}
            className="w-12 h-10 rounded border border-zinc-700 bg-zinc-900 cursor-pointer"
          />
          <Input
            value={data.primaryColor || "#d4a574"}
            onChange={e => updateField("primaryColor", e.target.value)}
            placeholder="#d4a574"
            className="bg-zinc-900 border-zinc-700 text-zinc-100 w-32"
          />
        </div>
      </FormField>

      <div>
        <Label className="text-sm text-zinc-300 mb-3 block">Estilo Visual Preferido</Label>
        <div className="grid grid-cols-2 gap-3">
          {VISUAL_STYLES.map(style => (
            <button
              key={style.value}
              onClick={() => updateField("visualStyle", style.value)}
              className={`p-4 rounded-xl border text-left transition-all ${
                data.visualStyle === style.value
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
              }`}
            >
              <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${style.gradient} mb-3`} />
              <p className="text-sm font-medium text-zinc-200">{style.label}</p>
              <p className="text-xs text-zinc-500">{style.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 5 — CARDÁPIO
// ============================================
function Step5_Menu({ data, updateField, onUpload }: {
  data: BriefingData;
  updateField: <K extends keyof BriefingData>(key: K, value: BriefingData[K]) => void;
  onUpload: (file: File, category: "logo" | "hero" | "owner_photo" | "product") => Promise<string | null>;
}) {
  const addCategory = useCallback(() => {
    updateField("categories", [...data.categories, { name: "" }]);
  }, [data.categories, updateField]);

  const updateCategory = useCallback((index: number, name: string) => {
    const updated = [...data.categories];
    updated[index] = { name };
    updateField("categories", updated);
  }, [data.categories, updateField]);

  const removeCategory = useCallback((index: number) => {
    if (data.categories.length <= 1) return;
    updateField("categories", data.categories.filter((_, i) => i !== index));
  }, [data.categories, updateField]);

  const addProduct = useCallback(() => {
    updateField("products", [...data.products, { name: "", categoryName: "", price: 0 }]);
  }, [data.products, updateField]);

  const updateProduct = useCallback((index: number, field: keyof ProductEntry, value: any) => {
    const updated = [...data.products];
    updated[index] = { ...updated[index], [field]: value };
    updateField("products", updated);
  }, [data.products, updateField]);

  const removeProduct = useCallback((index: number) => {
    if (data.products.length <= 1) return;
    updateField("products", data.products.filter((_, i) => i !== index));
  }, [data.products, updateField]);

  const validCategoryNames = useMemo(() =>
    data.categories.map(c => c.name).filter(Boolean),
    [data.categories]
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Cardápio"
        description="Adicione suas categorias e produtos. Você pode adicionar mais depois no painel."
      />

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-300">Categorias *</h3>
          <Button variant="outline" size="sm" onClick={addCategory} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <Plus className="w-3.5 h-3.5 mr-1" /> Categoria
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data.categories.map((cat, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={cat.name}
                onChange={e => updateCategory(i, e.target.value)}
                placeholder={`Categoria ${i + 1}`}
                className="bg-zinc-900 border-zinc-700 text-zinc-100"
              />
              {data.categories.length > 1 && (
                <button onClick={() => removeCategory(i)} className="text-zinc-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="border-t border-zinc-800 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-300">Produtos * ({data.products.length})</h3>
          <Button variant="outline" size="sm" onClick={addProduct} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <Plus className="w-3.5 h-3.5 mr-1" /> Produto
          </Button>
        </div>
        <div className="space-y-4">
          {data.products.map((product, i) => (
            <ProductRow
              key={i}
              index={i}
              product={product}
              categoryNames={validCategoryNames}
              onUpdate={updateProduct}
              onRemove={removeProduct}
              onUpload={onUpload}
              canRemove={data.products.length > 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// PRODUCT ROW COMPONENT
// ============================================
function ProductRow({ index, product, categoryNames, onUpdate, onRemove, onUpload, canRemove }: {
  index: number;
  product: ProductEntry;
  categoryNames: string[];
  onUpdate: (index: number, field: keyof ProductEntry, value: any) => void;
  onRemove: (index: number) => void;
  onUpload: (file: File, category: "logo" | "hero" | "owner_photo" | "product") => Promise<string | null>;
  canRemove: boolean;
}) {
  const [uploading, setUploading] = useState(false);

  return (
    <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">Produto #{index + 1}</span>
        {canRemove && (
          <button onClick={() => onRemove(index)} className="text-zinc-500 hover:text-red-400">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Input
          value={product.name}
          onChange={e => onUpdate(index, "name", e.target.value)}
          placeholder="Nome do produto *"
          className="bg-zinc-800 border-zinc-700 text-zinc-100"
        />
        <select
          value={product.categoryName}
          onChange={e => onUpdate(index, "categoryName", e.target.value)}
          className="rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2 text-sm"
        >
          <option value="">Categoria *</option>
          {categoryNames.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Input
          type="number"
          value={product.price || ""}
          onChange={e => onUpdate(index, "price", parseFloat(e.target.value) || 0)}
          placeholder="Preço (R$) *"
          step="0.01"
          min="0"
          className="bg-zinc-800 border-zinc-700 text-zinc-100"
        />
        <select
          value={product.highlightTag || ""}
          onChange={e => onUpdate(index, "highlightTag", e.target.value)}
          className="rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2 text-sm"
        >
          {HIGHLIGHT_TAGS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          value={product.description || ""}
          onChange={e => onUpdate(index, "description", e.target.value)}
          placeholder="Descrição (opcional)"
          className="bg-zinc-800 border-zinc-700 text-zinc-100"
        />
        <div className="flex items-center gap-2">
          {product.imageUrl ? (
            <div className="flex items-center gap-2">
              <img src={product.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
              <button onClick={() => onUpdate(index, "imageUrl", undefined)} className="text-red-400 text-xs">Remover</button>
            </div>
          ) : (
            <ImageUploadButton
              loading={uploading}
              onSelect={async (file) => {
                setUploading(true);
                const url = await onUpload(file, "product");
                if (url) onUpdate(index, "imageUrl", url);
                setUploading(false);
              }}
              label="Foto"
              small
            />
          )}
          <Input
            type="number"
            value={product.originalPrice || ""}
            onChange={e => onUpdate(index, "originalPrice", parseFloat(e.target.value) || undefined)}
            placeholder="Preço original (promoção)"
            step="0.01"
            min="0"
            className="bg-zinc-800 border-zinc-700 text-zinc-100"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// SHARED COMPONENTS
// ============================================
function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-zinc-100 mb-1">{title}</h2>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-zinc-300">{label}</Label>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
      {children}
    </div>
  );
}

function ImageUploadButton({ loading, onSelect, label, large, small }: {
  loading: boolean;
  onSelect: (file: File) => void;
  label: string;
  large?: boolean;
  small?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={`flex items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 text-zinc-400 hover:border-amber-500/50 hover:text-amber-400 transition-all ${
          large ? "w-32 h-32" : small ? "px-3 py-2 text-xs" : "px-4 py-3"
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Upload className={small ? "w-3 h-3" : "w-4 h-4"} />
            <span className={small ? "text-xs" : "text-sm"}>{label}</span>
          </>
        )}
      </button>
    </>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">Carregando formulário...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-zinc-100 mb-2">Link Inválido</h1>
        <p className="text-zinc-400 text-sm">{message}</p>
      </div>
    </div>
  );
}

function AlreadySubmittedScreen({ tenantName, supportWhatsapp }: { tenantName: string; supportWhatsapp: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Briefing Já Enviado</h1>
        <p className="text-zinc-400 mb-6">
          O briefing de <span className="text-amber-400 font-semibold">{tenantName}</span> já foi recebido.
          Nossa equipe está trabalhando na configuração da sua loja.
        </p>
        {supportWhatsapp && (
          <a
            href={`https://wa.me/55${supportWhatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
          >
            <Phone className="w-4 h-4" /> Falar com suporte
          </a>
        )}
      </div>
    </div>
  );
}

function SuccessScreen({ tenantName, supportWhatsapp }: { tenantName: string; supportWhatsapp: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-100 mb-3">Briefing Enviado!</h1>
        <p className="text-zinc-400 mb-2">
          Obrigado, <span className="text-amber-400 font-semibold">{tenantName}</span>!
        </p>
        <p className="text-zinc-500 text-sm mb-8">
          Recebemos todas as informações. Nossa equipe vai configurar sua loja e entrar em contato em breve.
          Você receberá um link para acessar o painel administrativo assim que tudo estiver pronto.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {supportWhatsapp && (
            <a
              href={`https://wa.me/55${supportWhatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all"
            >
              <Phone className="w-4 h-4" /> Falar com suporte
            </a>
          )}
          <button
            onClick={() => window.location.href = "/"}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
