import SuperAdminLayout from "@/components/SuperAdminLayout";
import ImageCropEditor from "@/components/ImageCropEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import {
  Save,
  Store,
  Home,
  ShoppingBag,
  Users2,
  Star,
  Info,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Image as ImageIcon,
  Video,
  Loader2,
  Check,
  ChevronsUpDown,
  RefreshCw,
  Smartphone,
  Monitor,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ============================================
// TYPES
// ============================================

type LandingDesign = {
  home?: {
    logoUrl?: string;
    logoType?: "image" | "text";
    bgMediaUrl?: string;
    bgMediaType?: "image" | "video";
    bgOverlayOpacity?: number;
    headline?: string;
    subheadline?: string;
    ctaText?: string;
  };
  products?: {
    headline?: string;
    subheadline?: string;
    maxCategories?: number;
    offersCategoryId?: number | null;
  };
  about?: {
    headline?: string;
    storytelling?: string;
    imageUrl?: string;
    ownerName?: string;
    textColor?: string;
  };
  reviews?: {
    headline?: string;
    isVisible?: boolean;
  };
  info?: {
    headline1?: string;
    subheadline1?: string;
    headline2?: string;
    subheadline2?: string;
    ctaText?: string;
    showMap?: boolean;
    showAddress?: boolean;
    showPhone?: boolean;
    showHours?: boolean;
    showSocial?: boolean;
  };
  global?: {
    alignment?: "left" | "center" | "right";
  };
};

type ThemeColors = {
  primary: string;
  background: string;
  foreground: string;
  accent: string;
  muted: string;
};

type SectionTab = "home" | "products" | "about" | "reviews" | "info";

const FONT_OPTIONS = [
  "DM Sans", "Inter", "Poppins", "Roboto", "Open Sans", "Lato",
  "Montserrat", "Raleway", "Nunito", "Source Sans 3", "Work Sans",
  "Outfit", "Plus Jakarta Sans", "Manrope", "Space Grotesk",
];

const DISPLAY_FONT_OPTIONS = [
  "DM Serif Display", "Playfair Display", "Merriweather", "Lora",
  "Cormorant Garamond", "Libre Baskerville", "Crimson Text",
  "EB Garamond", "Bitter", "Noto Serif", "Spectral",
  "Source Serif 4", "Fraunces", "Bodoni Moda", "Instrument Serif",
];

const SECTION_TABS: { id: SectionTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "HOME", icon: Home },
  { id: "products", label: "PRODUTOS", icon: ShoppingBag },
  { id: "about", label: "SOBRE NÓS", icon: Users2 },
  { id: "reviews", label: "AVALIAÇÕES", icon: Star },
  { id: "info", label: "INFORMAÇÕES", icon: Info },
];

const defaultDesign: LandingDesign = {
  home: {
    logoType: "text",
    bgMediaType: "image",
    bgOverlayOpacity: 50,
    headline: "Gastronomia de Alta Performance",
    subheadline: "Experiência única",
    ctaText: "Fazer Pedido",
  },
  products: {
    headline: "Nosso Cardápio",
    subheadline: "Escolha seus favoritos",
    maxCategories: 3,
  },
  about: {
    headline: "Sobre Nós",
    storytelling: "",
    textColor: "#FFFFFF",
  },
  reviews: {
    headline: "O que dizem nossos clientes",
    isVisible: true,
  },
  info: {
    headline1: "Venha nos visitar",
    subheadline1: "Estamos esperando por você",
    ctaText: "Como Chegar",
    showMap: true,
    showAddress: true,
    showPhone: true,
    showHours: true,
    showSocial: true,
  },
  global: { alignment: "left" },
};

const defaultColors: ThemeColors = {
  primary: "#D4AF37",
  background: "#121212",
  foreground: "#FFFFFF",
  accent: "#1a1a1a",
  muted: "#a1a1aa",
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function DesignPage() {
  const { data: tenants, isLoading: tenantsLoading } = trpc.tenants.list.useQuery();
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [storeSearchOpen, setStoreSearchOpen] = useState(false);
  const [storeSearchQuery, setStoreSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SectionTab>("home");
  const [design, setDesign] = useState<LandingDesign>(defaultDesign);
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [fontFamily, setFontFamily] = useState("DM Sans");
  const [fontDisplay, setFontDisplay] = useState("DM Serif Display");
  const [borderRadius, setBorderRadius] = useState("0.75rem");
  const [isDirty, setIsDirty] = useState(false);
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const utils = trpc.useUtils();

  // Crop editor state
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropCallback, setCropCallback] = useState<((url: string) => void) | null>(null);

  // Fetch landing design when tenant is selected
  const { data: landingData, isLoading: designLoading } = trpc.tenants.getLandingDesign.useQuery(
    { tenantId: selectedTenantId! },
    { enabled: !!selectedTenantId }
  );

  // Save mutation
  const saveMutation = trpc.tenants.updateLandingDesign.useMutation({
    onSuccess: () => {
      setIsDirty(false);
      utils.tenants.getLandingDesign.invalidate({ tenantId: selectedTenantId! });
      refreshPreview();
    },
  });

  // Upload mutation
  const uploadMutation = trpc.tenants.uploadDesignImage.useMutation();

  // Load data when tenant changes
  useEffect(() => {
    if (landingData) {
      const ld = landingData.landingDesign;
      setDesign({
        home: { ...defaultDesign.home, ...ld?.home },
        products: { ...defaultDesign.products, ...ld?.products },
        about: { ...defaultDesign.about, ...ld?.about },
        reviews: { ...defaultDesign.reviews, ...ld?.reviews },
        info: { ...defaultDesign.info, ...ld?.info },
        global: { ...defaultDesign.global, ...ld?.global },
      });
      setColors((landingData.tenant.themeColors as ThemeColors) || defaultColors);
      setFontFamily(landingData.tenant.fontFamily || "DM Sans");
      setFontDisplay(landingData.tenant.fontDisplay || "DM Serif Display");
      setBorderRadius(landingData.tenant.borderRadius || "0.75rem");
      setIsDirty(false);
    }
  }, [landingData]);

  // Auto-select first tenant
  useEffect(() => {
    if (tenants && tenants.length > 0 && !selectedTenantId) {
      setSelectedTenantId(tenants[0].id);
    }
  }, [tenants, selectedTenantId]);

  // Filtered tenants for search
  const filteredTenants = useMemo(() => {
    if (!tenants) return [];
    if (!storeSearchQuery) return tenants;
    const q = storeSearchQuery.toLowerCase();
    return tenants.filter(
      (t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
    );
  }, [tenants, storeSearchQuery]);

  const selectedTenant = tenants?.find((t) => t.id === selectedTenantId);

  // Update design helper
  const updateDesign = useCallback(
    <K extends keyof LandingDesign>(section: K, field: string, value: unknown) => {
      setDesign((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] as Record<string, unknown>),
          [field]: value,
        },
      }));
      setIsDirty(true);
    },
    []
  );

  const updateColor = useCallback(
    (key: keyof ThemeColors, value: string) => {
      setColors((prev) => ({ ...prev, [key]: value }));
      setIsDirty(true);
    },
    []
  );

  // Save handler
  const handleSave = () => {
    if (!selectedTenantId) return;
    saveMutation.mutate({
      tenantId: selectedTenantId,
      landingDesign: design,
      themeColors: colors,
      fontFamily,
      fontDisplay,
      borderRadius,
    });
  };

  // Refresh preview iframe (full reload)
  const refreshPreview = useCallback(() => {
    if (iframeRef.current && selectedTenant) {
      const src = `/${selectedTenant.slug}?_preview=1&_t=${Date.now()}`;
      iframeRef.current.src = src;
    }
  }, [selectedTenant]);

  // Send design to preview via postMessage whenever design or colors change (debounced)
  useEffect(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      if (!iframeRef.current?.contentWindow) return;
      try {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'designPreviewUpdate',
            design,
            colors,
          },
          '*'
        );
      } catch {
        // Cross-origin, ignore
      }
    }, 300);
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [design, colors]);

  // Scroll preview to section
  const scrollPreviewToSection = (section: SectionTab) => {
    if (!iframeRef.current?.contentWindow) return;
    const sectionIdMap: Record<SectionTab, string> = {
      home: "hero",
      products: "cardapio",
      about: "sobre",
      reviews: "avaliacoes",
      info: "contato",
    };
    try {
      iframeRef.current.contentWindow.postMessage(
        { type: "scrollToSection", sectionId: sectionIdMap[section] },
        "*"
      );
    } catch {
      // Cross-origin, ignore
    }
  };

  // Handle tab change
  const handleTabChange = (tab: SectionTab) => {
    setActiveTab(tab);
    scrollPreviewToSection(tab);
  };

  // Image upload handler with crop editor
  const handleImageUpload = async (file: File, onSuccess: (url: string) => void) => {
    if (!selectedTenantId) return;
    // Open crop editor
    setCropFile(file);
    setCropCallback(() => onSuccess);
    setCropOpen(true);
  };

  // Handle crop completion - upload the cropped image
  const handleCropComplete = async (croppedBase64: string, _blob: Blob) => {
    if (!selectedTenantId || !cropCallback) return;
    setCropOpen(false);

    const base64Data = croppedBase64.split(",")[1];
    try {
      const result = await uploadMutation.mutateAsync({
        tenantId: selectedTenantId,
        imageData: base64Data,
        fileName: cropFile?.name || "cropped-image.jpg",
        contentType: "image/jpeg",
      });
      cropCallback(result.url);
      setIsDirty(true);
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setCropFile(null);
    setCropCallback(null);
  };

  // Direct upload (for video or URL paste - no crop)
  const handleDirectUpload = async (file: File, onSuccess: (url: string) => void) => {
    if (!selectedTenantId) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const result = await uploadMutation.mutateAsync({
          tenantId: selectedTenantId,
          imageData: base64,
          fileName: file.name,
          contentType: file.type,
        });
        onSuccess(result.url);
        setIsDirty(true);
      } catch (err) {
        console.error("Upload failed:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <SuperAdminLayout>
      <div className="flex flex-col h-[calc(100vh-2rem)]">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-2 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white whitespace-nowrap">Construtor de LP</h1>

            {/* Store Search */}
            <Popover open={storeSearchOpen} onOpenChange={setStoreSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={storeSearchOpen}
                  className="w-[220px] justify-between border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white h-8 text-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Store className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                    <span className="truncate text-xs">
                      {selectedTenant?.name || "Buscar Loja..."}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0 bg-zinc-900 border-zinc-700" align="start">
                <Command className="bg-zinc-900">
                  <CommandInput
                    placeholder="Buscar loja..."
                    value={storeSearchQuery}
                    onValueChange={setStoreSearchQuery}
                    className="text-white"
                  />
                  <CommandList>
                    <CommandEmpty className="py-3 text-center text-sm text-zinc-500">
                      Nenhuma loja encontrada.
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredTenants.map((tenant) => (
                        <CommandItem
                          key={tenant.id}
                          value={tenant.name}
                          onSelect={() => {
                            setSelectedTenantId(tenant.id);
                            setStoreSearchOpen(false);
                            setStoreSearchQuery("");
                          }}
                          className="text-zinc-300 hover:text-white cursor-pointer"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedTenantId === tenant.id ? "opacity-100 text-amber-500" : "opacity-0"
                            }`}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm">{tenant.name}</span>
                            <span className="text-xs text-zinc-500">/{tenant.slug}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            {/* Preview Mode Toggle */}
            <div className="flex items-center bg-zinc-800 rounded-md border border-zinc-700 p-0.5">
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`p-1.5 rounded transition-colors ${
                  previewMode === "mobile"
                    ? "bg-amber-500/20 text-amber-500"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Preview Mobile"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`p-1.5 rounded transition-colors ${
                  previewMode === "desktop"
                    ? "bg-amber-500/20 text-amber-500"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Preview Desktop"
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={refreshPreview}
              className="border-zinc-700 text-zinc-300 hover:text-white h-8 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Atualizar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || !isDirty || !selectedTenantId}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-8 text-xs"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1" />
              )}
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {!selectedTenantId ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            <div className="text-center">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Selecione uma loja para começar a editar</p>
            </div>
          </div>
        ) : designLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel - Editor */}
            <div className="w-[380px] shrink-0 border-r border-zinc-800 flex flex-col overflow-hidden">
              {/* Section Tabs */}
              <div className="flex border-b border-zinc-800 shrink-0 overflow-x-auto">
                {SECTION_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-1 px-2.5 py-2 text-[11px] font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "border-amber-500 text-amber-500 bg-amber-500/5"
                        : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                    }`}
                  >
                    <tab.icon className="h-3 w-3" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Editor Content */}
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-5">
                  {/* Global Styles */}
                  <GlobalStylesPanel
                    colors={colors}
                    fontFamily={fontFamily}
                    fontDisplay={fontDisplay}
                    alignment={design.global?.alignment || "left"}
                    onColorChange={updateColor}
                    onFontFamilyChange={(v) => { setFontFamily(v); setIsDirty(true); }}
                    onFontDisplayChange={(v) => { setFontDisplay(v); setIsDirty(true); }}
                    onAlignmentChange={(v) => { updateDesign("global", "alignment", v); }}
                  />

                  <Separator className="bg-zinc-800" />

                  {/* Section-specific fields */}
                  {activeTab === "home" && (
                    <HomeSection
                      data={design.home || {}}
                      onChange={(field, value) => updateDesign("home", field, value)}
                      onImageUpload={handleImageUpload}
                      onDirectUpload={handleDirectUpload}
                      uploading={uploadMutation.isPending}
                    />
                  )}
                  {activeTab === "products" && (
                    <ProductsSection
                      data={design.products || {}}
                      categories={landingData?.categories || []}
                      onChange={(field, value) => updateDesign("products", field, value)}
                    />
                  )}
                  {activeTab === "about" && (
                    <AboutSection
                      data={design.about || {}}
                      onChange={(field, value) => updateDesign("about", field, value)}
                      onImageUpload={handleImageUpload}
                      uploading={uploadMutation.isPending}
                    />
                  )}
                  {activeTab === "reviews" && (
                    <ReviewsSection
                      data={design.reviews || {}}
                      tenant={selectedTenant!}
                      onChange={(field, value) => updateDesign("reviews", field, value)}
                    />
                  )}
                  {activeTab === "info" && (
                    <InfoSection
                      data={design.info || {}}
                      onChange={(field, value) => updateDesign("info", field, value)}
                    />
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 bg-zinc-950 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 shrink-0">
                <span className="text-[11px] text-zinc-500 font-medium">
                  PREVIEW — /{selectedTenant?.slug}
                  {previewMode === "mobile" ? " (Mobile 375px)" : " (Desktop)"}
                </span>
                {isDirty && (
                  <span className="text-[11px] text-amber-500 font-medium animate-pulse">
                    Alterações não salvas
                  </span>
                )}
              </div>
              <div className="flex-1 flex items-start justify-center p-3 overflow-auto">
                <div
                  className={`h-full rounded-lg overflow-hidden border border-zinc-800 bg-black transition-all duration-300 ${
                    previewMode === "mobile"
                      ? "w-[375px] shadow-2xl shadow-black/50"
                      : "w-full"
                  }`}
                >
                  {selectedTenant && (
                    <iframe
                      ref={iframeRef}
                      src={`/${selectedTenant.slug}?_preview=1`}
                      className="w-full h-full"
                      title="Preview da Landing Page"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Crop Editor Modal */}
      <ImageCropEditor
        open={cropOpen}
        onClose={() => {
          setCropOpen(false);
          setCropFile(null);
          setCropCallback(null);
        }}
        onComplete={handleCropComplete}
        file={cropFile}
        aspectRatio={1}
      />
    </SuperAdminLayout>
  );
}

// ============================================
// GLOBAL STYLES PANEL
// ============================================

function GlobalStylesPanel({
  colors,
  fontFamily,
  fontDisplay,
  alignment,
  onColorChange,
  onFontFamilyChange,
  onFontDisplayChange,
  onAlignmentChange,
}: {
  colors: ThemeColors;
  fontFamily: string;
  fontDisplay: string;
  alignment: string;
  onColorChange: (key: keyof ThemeColors, value: string) => void;
  onFontFamilyChange: (v: string) => void;
  onFontDisplayChange: (v: string) => void;
  onAlignmentChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white w-full"
      >
        <Palette className="h-4 w-4 text-amber-500" />
        Estilos Globais
        <span className="ml-auto text-xs text-zinc-500">{isOpen ? "▼" : "▶"}</span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-4">
          {/* Colors */}
          <div className="space-y-2">
            <Label className="text-[11px] text-zinc-400 uppercase tracking-wider">Cores</Label>
            {[
              { key: "primary" as const, label: "Primária" },
              { key: "background" as const, label: "Fundo" },
              { key: "foreground" as const, label: "Texto" },
              { key: "accent" as const, label: "Destaque" },
              { key: "muted" as const, label: "Secundário" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors[key]}
                  onChange={(e) => onColorChange(key, e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border border-zinc-700 shrink-0"
                />
                <span className="text-xs text-zinc-300 flex-1">{label}</span>
                <Input
                  value={colors[key]}
                  onChange={(e) => onColorChange(key, e.target.value)}
                  className="w-20 h-6 text-[11px] bg-zinc-800 border-zinc-700 font-mono px-1.5"
                />
              </div>
            ))}
          </div>

          {/* Typography */}
          <div className="space-y-2">
            <Label className="text-[11px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="h-3 w-3" />
              Tipografia
            </Label>
            <div className="space-y-1.5">
              <div>
                <span className="text-[11px] text-zinc-500">Fonte Principal</span>
                <Select value={fontFamily} onValueChange={onFontFamilyChange}>
                  <SelectTrigger className="h-7 bg-zinc-800 border-zinc-700 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f} value={f} className="text-zinc-300 text-xs">
                        <span style={{ fontFamily: f }}>{f}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500">Fonte Títulos</span>
                <Select value={fontDisplay} onValueChange={onFontDisplayChange}>
                  <SelectTrigger className="h-7 bg-zinc-800 border-zinc-700 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {DISPLAY_FONT_OPTIONS.map((f) => (
                      <SelectItem key={f} value={f} className="text-zinc-300 text-xs">
                        <span style={{ fontFamily: f }}>{f}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Alignment */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-zinc-400 uppercase tracking-wider">Alinhamento</Label>
            <div className="flex gap-1">
              {[
                { value: "left", icon: AlignLeft, label: "Esq" },
                { value: "center", icon: AlignCenter, label: "Centro" },
                { value: "right", icon: AlignRight, label: "Dir" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => onAlignmentChange(value)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    alignment === value
                      ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// IMAGE UPLOAD FIELD
// ============================================

function ImageUploadField({
  label,
  value,
  onChange,
  onUpload,
  uploading,
  accept = "image/*",
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  onUpload: (file: File, onSuccess: (url: string) => void) => void;
  uploading: boolean;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-zinc-400">{label}</Label>
      {value && (
        <div className="relative rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800">
          {accept.includes("video") && value.match(/\.(mp4|webm|mov)$/i) ? (
            <video src={value} className="w-full h-20 object-cover" muted />
          ) : (
            <img src={value} alt="" className="w-full h-20 object-cover" />
          )}
          <button
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-black/80 text-[10px]"
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex-1 border-zinc-700 text-zinc-300 hover:text-white text-[11px] h-7"
        >
          {uploading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Upload className="h-3 w-3 mr-1" />
          )}
          {uploading ? "Enviando..." : "Upload"}
        </Button>
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ou cole a URL"
          className="flex-1 h-7 text-[11px] bg-zinc-800 border-zinc-700 px-2"
        />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file, onChange);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ============================================
// HOME SECTION
// ============================================

function HomeSection({
  data,
  onChange,
  onImageUpload,
  onDirectUpload,
  uploading,
}: {
  data: NonNullable<LandingDesign["home"]>;
  onChange: (field: string, value: unknown) => void;
  onImageUpload: (file: File, onSuccess: (url: string) => void) => void;
  onDirectUpload: (file: File, onSuccess: (url: string) => void) => void;
  uploading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Home className="h-4 w-4 text-amber-500" />
        Seção Home
      </h3>

      {/* Logo */}
      <div className="space-y-1.5">
        <Label className="text-[11px] text-zinc-400">Tipo de Logotipo</Label>
        <div className="flex gap-1.5">
          <button
            onClick={() => onChange("logoType", "text")}
            className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              data.logoType === "text"
                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
            }`}
          >
            <Type className="h-3 w-3 inline mr-1" />
            Texto
          </button>
          <button
            onClick={() => onChange("logoType", "image")}
            className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              data.logoType === "image"
                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
            }`}
          >
            <ImageIcon className="h-3 w-3 inline mr-1" />
            Imagem
          </button>
        </div>
      </div>

      {data.logoType === "image" && (
        <ImageUploadField
          label="Logotipo (Imagem)"
          value={data.logoUrl}
          onChange={(url) => onChange("logoUrl", url)}
          onUpload={onImageUpload}
          uploading={uploading}
        />
      )}

      {/* Background Media */}
      <div className="space-y-1.5">
        <Label className="text-[11px] text-zinc-400">Tipo de Fundo</Label>
        <div className="flex gap-1.5">
          <button
            onClick={() => onChange("bgMediaType", "image")}
            className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              data.bgMediaType === "image"
                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
            }`}
          >
            <ImageIcon className="h-3 w-3 inline mr-1" />
            Imagem
          </button>
          <button
            onClick={() => onChange("bgMediaType", "video")}
            className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              data.bgMediaType === "video"
                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
            }`}
          >
            <Video className="h-3 w-3 inline mr-1" />
            Vídeo
          </button>
        </div>
      </div>

      <ImageUploadField
        label={data.bgMediaType === "video" ? "Vídeo de Fundo" : "Imagem de Fundo"}
        value={data.bgMediaUrl}
        onChange={(url) => onChange("bgMediaUrl", url)}
        onUpload={data.bgMediaType === "video" ? onDirectUpload : onImageUpload}
        uploading={uploading}
        accept={data.bgMediaType === "video" ? "video/*" : "image/*"}
      />

      {/* Overlay Opacity */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] text-zinc-400">Opacidade do Escurecimento</Label>
          <span className="text-[11px] text-zinc-500 font-mono">{data.bgOverlayOpacity ?? 50}%</span>
        </div>
        <Slider
          value={[data.bgOverlayOpacity ?? 50]}
          onValueChange={([v]) => onChange("bgOverlayOpacity", v)}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
      </div>

      <Separator className="bg-zinc-800" />

      {/* Text Fields */}
      <div className="space-y-2">
        <div>
          <Label className="text-[11px] text-zinc-400">Headline (H1)</Label>
          <Input
            value={data.headline || ""}
            onChange={(e) => onChange("headline", e.target.value)}
            placeholder="Gastronomia de Alta Performance"
            className="h-7 bg-zinc-800 border-zinc-700 text-xs"
          />
        </div>
        <div>
          <Label className="text-[11px] text-zinc-400">Subheadline (H2)</Label>
          <Input
            value={data.subheadline || ""}
            onChange={(e) => onChange("subheadline", e.target.value)}
            placeholder="Experiência única em sua cidade"
            className="h-7 bg-zinc-800 border-zinc-700 text-xs"
          />
        </div>
        <div>
          <Label className="text-[11px] text-zinc-400">Texto do Botão</Label>
          <Input
            value={data.ctaText || ""}
            onChange={(e) => onChange("ctaText", e.target.value)}
            placeholder="Fazer Pedido"
            className="h-7 bg-zinc-800 border-zinc-700 text-xs"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// PRODUCTS SECTION
// ============================================

function ProductsSection({
  data,
  categories,
  onChange,
}: {
  data: NonNullable<LandingDesign["products"]>;
  categories: { id: number; name: string }[];
  onChange: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <ShoppingBag className="h-4 w-4 text-amber-500" />
        Seção Produtos
      </h3>

      <div className="space-y-2">
        <div>
          <Label className="text-[11px] text-zinc-400">Headline</Label>
          <Input
            value={data.headline || ""}
            onChange={(e) => onChange("headline", e.target.value)}
            placeholder="Nosso Cardápio"
            className="h-7 bg-zinc-800 border-zinc-700 text-xs"
          />
        </div>
        <div>
          <Label className="text-[11px] text-zinc-400">Subheadline</Label>
          <Input
            value={data.subheadline || ""}
            onChange={(e) => onChange("subheadline", e.target.value)}
            placeholder="Escolha seus favoritos"
            className="h-7 bg-zinc-800 border-zinc-700 text-xs"
          />
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      <div className="space-y-2">
        <Label className="text-[11px] text-zinc-400 uppercase tracking-wider">Categorias</Label>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-zinc-500">Máximo na LP</span>
            <span className="text-[11px] text-zinc-400 font-mono">{data.maxCategories ?? 3}</span>
          </div>
          <Slider
            value={[data.maxCategories ?? 3]}
            onValueChange={([v]) => onChange("maxCategories", v)}
            min={1}
            max={3}
            step={1}
            className="w-full"
          />
        </div>

        {categories.length > 0 && (
          <div className="space-y-1">
            <span className="text-[11px] text-zinc-500">Cadastradas:</span>
            {categories.map((cat) => (
              <div key={cat.id} className="px-2 py-1 rounded bg-zinc-800/50 border border-zinc-700/50">
                <span className="text-[11px] text-zinc-300">{cat.name}</span>
              </div>
            ))}
          </div>
        )}

        <div>
          <Label className="text-[11px] text-zinc-400">Categoria de Ofertas</Label>
          <Select
            value={data.offersCategoryId?.toString() || "none"}
            onValueChange={(v) => onChange("offersCategoryId", v === "none" ? null : parseInt(v))}
          >
            <SelectTrigger className="h-7 bg-zinc-800 border-zinc-700 text-xs w-full">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              <SelectItem value="none" className="text-zinc-300 text-xs">Nenhuma</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()} className="text-zinc-300 text-xs">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ABOUT SECTION
// ============================================

function AboutSection({
  data,
  onChange,
  onImageUpload,
  uploading,
}: {
  data: NonNullable<LandingDesign["about"]>;
  onChange: (field: string, value: unknown) => void;
  onImageUpload: (file: File, onSuccess: (url: string) => void) => void;
  uploading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Users2 className="h-4 w-4 text-amber-500" />
        Seção Sobre Nós
      </h3>

      <div className="space-y-2">
        <div>
          <Label className="text-[11px] text-zinc-400">Headline</Label>
          <Input
            value={data.headline || ""}
            onChange={(e) => onChange("headline", e.target.value)}
            placeholder="Sobre Nós"
            className="h-7 bg-zinc-800 border-zinc-700 text-xs"
          />
        </div>
        <div>
          <Label className="text-[11px] text-zinc-400">Storytelling</Label>
          <Textarea
            value={data.storytelling || ""}
            onChange={(e) => onChange("storytelling", e.target.value)}
            placeholder="Conte a história do negócio..."
            className="bg-zinc-800 border-zinc-700 text-xs min-h-[80px]"
          />
        </div>
      </div>

      <ImageUploadField
        label="Imagem do Sobre"
        value={data.imageUrl}
        onChange={(url) => onChange("imageUrl", url)}
        onUpload={onImageUpload}
        uploading={uploading}
      />

      <div>
        <Label className="text-[11px] text-zinc-400">Nome (abaixo da foto)</Label>
        <Input
          value={data.ownerName || ""}
          onChange={(e) => onChange("ownerName", e.target.value)}
          placeholder="Nome do proprietário"
          className="h-7 bg-zinc-800 border-zinc-700 text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] text-zinc-400">Cor do Texto</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={data.textColor || "#FFFFFF"}
            onChange={(e) => onChange("textColor", e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border border-zinc-700 shrink-0"
          />
          <Input
            value={data.textColor || "#FFFFFF"}
            onChange={(e) => onChange("textColor", e.target.value)}
            className="w-20 h-6 text-[11px] bg-zinc-800 border-zinc-700 font-mono px-1.5"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// REVIEWS SECTION
// ============================================

function ReviewsSection({
  data,
  tenant,
  onChange,
}: {
  data: NonNullable<LandingDesign["reviews"]>;
  tenant: { id: number; googleApiKey?: string | null; googlePlaceId?: string | null };
  onChange: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Star className="h-4 w-4 text-amber-500" />
        Seção Avaliações
      </h3>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs text-zinc-300">Exibir seção</Label>
          <p className="text-[10px] text-zinc-600">Ocultar da landing page</p>
        </div>
        <Switch
          checked={data.isVisible ?? true}
          onCheckedChange={(v) => onChange("isVisible", v)}
        />
      </div>

      {data.isVisible !== false && (
        <div className="space-y-2">
          <div>
            <Label className="text-[11px] text-zinc-400">Headline</Label>
            <Input
              value={data.headline || ""}
              onChange={(e) => onChange("headline", e.target.value)}
              placeholder="O que dizem nossos clientes"
              className="h-7 bg-zinc-800 border-zinc-700 text-xs"
            />
          </div>

          <Separator className="bg-zinc-800" />

          <div className="space-y-1.5">
            <Label className="text-[11px] text-zinc-400 uppercase tracking-wider">API Google</Label>
            <p className="text-[10px] text-zinc-600">
              Configure nas Integrações do cliente.
            </p>
            <div className="px-2 py-1.5 rounded bg-zinc-800/50 border border-zinc-700/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">API Key</span>
                <span className={`text-[11px] ${tenant.googleApiKey ? "text-green-400" : "text-zinc-600"}`}>
                  {tenant.googleApiKey ? "✓" : "✗"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">Place ID</span>
                <span className={`text-[11px] ${tenant.googlePlaceId ? "text-green-400" : "text-zinc-600"}`}>
                  {tenant.googlePlaceId ? "✓" : "✗"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// INFO SECTION
// ============================================

function InfoSection({
  data,
  onChange,
}: {
  data: NonNullable<LandingDesign["info"]>;
  onChange: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Info className="h-4 w-4 text-amber-500" />
        Seção Informações
      </h3>

      <div className="space-y-2">
        <div>
          <Label className="text-[11px] text-zinc-400">Headline (H1)</Label>
          <Input
            value={data.headline1 || ""}
            onChange={(e) => onChange("headline1", e.target.value)}
            placeholder="Venha nos visitar"
            className="h-7 bg-zinc-800 border-zinc-700 text-xs"
          />
        </div>
        <div>
          <Label className="text-[11px] text-zinc-400">Subheadline</Label>
          <Input
            value={data.subheadline1 || ""}
            onChange={(e) => onChange("subheadline1", e.target.value)}
            placeholder="Estamos esperando por você"
            className="h-7 bg-zinc-800 border-zinc-700 text-xs"
          />
        </div>
        <div>
          <Label className="text-[11px] text-zinc-400">Headline secundária</Label>
          <Input
            value={data.headline2 || ""}
            onChange={(e) => onChange("headline2", e.target.value)}
            placeholder="Horário de Funcionamento"
            className="h-7 bg-zinc-800 border-zinc-700 text-xs"
          />
        </div>
        <div>
          <Label className="text-[11px] text-zinc-400">Subheadline final</Label>
          <Input
            value={data.subheadline2 || ""}
            onChange={(e) => onChange("subheadline2", e.target.value)}
            placeholder="Confira nossos horários"
            className="h-7 bg-zinc-800 border-zinc-700 text-xs"
          />
        </div>
        <div>
          <Label className="text-[11px] text-zinc-400">Texto do Botão</Label>
          <Input
            value={data.ctaText || ""}
            onChange={(e) => onChange("ctaText", e.target.value)}
            placeholder="Como Chegar"
            className="h-7 bg-zinc-800 border-zinc-700 text-xs"
          />
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      <div className="space-y-2">
        <Label className="text-[11px] text-zinc-400 uppercase tracking-wider">Exibição</Label>
        {[
          { key: "showMap", label: "Mapa" },
          { key: "showAddress", label: "Endereço" },
          { key: "showPhone", label: "Telefone" },
          { key: "showHours", label: "Horários" },
          { key: "showSocial", label: "Redes Sociais" },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-0.5">
            <span className="text-xs text-zinc-300">{label}</span>
            <Switch
              checked={(data as Record<string, unknown>)[key] as boolean ?? true}
              onCheckedChange={(v) => onChange(key, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
