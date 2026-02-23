import SuperAdminLayout from "@/components/SuperAdminLayout";
import ImageUploader, { type ImageContext } from "@/components/ImageUploader";
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
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
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
  MapPin,
  Phone,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  ExternalLink,
  ChevronDown,
  Layers,
  Menu,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ============================================
// REUSABLE SUB-PANEL (Accordion)
// ============================================
function SubPanel({
  id,
  title,
  icon,
  defaultOpen = false,
  badge,
  children,
}: {
  id: string;
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-xl transition-all duration-200 ${
      isOpen
        ? 'bg-zinc-800/40 ring-1 ring-zinc-700/60'
        : 'bg-zinc-800/20 hover:bg-zinc-800/30'
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3.5 py-2.5 text-left"
      >
        {icon && <span className={`shrink-0 ${isOpen ? 'text-amber-500' : 'text-zinc-500'}`}>{icon}</span>}
        <span className={`text-xs font-semibold tracking-wide uppercase flex-1 ${
          isOpen ? 'text-zinc-200' : 'text-zinc-400'
        }`}>
          {title}
        </span>
        {badge && (
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            {badge}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${
          isOpen ? 'rotate-180 text-amber-500' : 'text-zinc-600'
        }`} />
      </button>
      {isOpen && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-2.5">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================
// COLOR PICKER WITH LOCAL STATE
// ============================================
// This component maintains its own local state so that parent re-renders
// (caused by design state updates) don't unmount the native color picker dialog.
function ColorPickerInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [localValue, setLocalValue] = useState(value);
  const isPickingRef = useRef(false);

  // Sync from parent when not actively picking
  useEffect(() => {
    if (!isPickingRef.current) {
      setLocalValue(value);
    }
  }, [value]);

  return (
    <input
      type="color"
      value={localValue}
      onFocus={() => { isPickingRef.current = true; }}
      onBlur={() => {
        isPickingRef.current = false;
        // Ensure final value is sent
        onChange(localValue);
      }}
      onInput={(e) => {
        const newVal = (e.target as HTMLInputElement).value;
        setLocalValue(newVal);
        onChange(newVal);
      }}
      className={className}
    />
  );
}

// ============================================
// TYPES
// ============================================

type SectionColors = {
  enabled?: boolean;      // Whether custom colors are active for this section
  background?: string;    // Section background color
  text?: string;          // Primary text color
  textMuted?: string;     // Secondary/muted text color
  highlight?: string;     // Accent/highlight color (links, icons, overlines)
  surface?: string;       // Card/surface background
  border?: string;        // Border color
  buttonBg?: string;      // Button background (CTA)
  buttonFg?: string;      // Button text color
};

type LandingDesign = {
  home?: {
    // Logo
    logoUrl?: string;
    logoType?: "image" | "text";
    companyName?: string;
    logoSize?: number; // width in px (40-200)
    // Header
    headerBgColor?: string; // with alpha support (rgba)
    // Location Box
    locationBoxBg?: string;
    locationBoxText?: string;
    locationBoxIcon?: string;
    locationLabel?: string; // editable city label
    // Schedule Box
    scheduleBoxBg?: string;
    scheduleBoxText?: string;
    scheduleBoxIcon?: string;
    scheduleLabel?: string; // editable schedule text
    badgeOpenColor?: string;
    badgeClosedColor?: string;
    // Headline
    headline?: string;
    headlineFont?: string;
    headlineFontSize?: number; // in px
    headlineFontWeight?: string; // 300,400,700,900
    headlineColor?: string;
    // Subheadline
    subheadline?: string;
    subheadlineFont?: string;
    subheadlineFontSize?: number;
    subheadlineFontWeight?: string;
    subheadlineColor?: string;
    // CTA Button
    ctaText?: string;
    ctaBgColor?: string;
    ctaTextColor?: string;
    ctaGradient?: boolean;
    ctaGradientEnd?: string; // second gradient color
    ctaAction?: string; // URL or anchor like #cardapio
    // Background
    bgMediaUrl?: string;
    bgMediaType?: "image" | "video";
    bgOverlayOpacity?: number;
    bgOverlayColor?: string; // overlay color with alpha
    bgFallbackColor?: string; // solid color fallback
  };
  products?: {
    headline?: string;
    subheadline?: string;
    maxCategories?: number;
    offersCategoryId?: number | null;
    // 2.1 Headline granular
    headlineFont?: string;
    headlineFontSize?: number;
    headlineFontWeight?: string;
    headlineColor?: string;
    // 2.2 Subheadline granular
    subheadlineFont?: string;
    subheadlineFontSize?: number;
    subheadlineFontWeight?: string;
    subheadlineColor?: string;
    // 2.3 Template de Cards
    cardBgColor?: string;
    cardNameColor?: string;
    cardPriceColor?: string;
    cardDescColor?: string;
    cardBorderRadius?: number; // px
    cardBorderColor?: string;
    cardBorderWidth?: number; // px
    // 2.4 Fundo da Seção
    bgColor?: string;
    bgGradient?: boolean;
    bgGradientFrom?: string;
    bgGradientTo?: string;
    bgGradientDirection?: string; // to-b, to-r, to-br, etc.
    bgMediaUrl?: string;
    bgMediaType?: "image" | "video";
    bgOverlayOpacity?: number;
    bgOverlayColor?: string;
    // 2.5 Botão Ver Todas
    viewAllBgColor?: string;
    viewAllTextColor?: string;
    viewAllFont?: string;
    viewAllFontSize?: number;
    viewAllFontWeight?: string;
    viewAllLabel?: string;
    // 2.6 Botão CTA (Rodapé)
    ctaText?: string;
    ctaBgColor?: string;
    ctaTextColor?: string;
    ctaGradient?: boolean;
    ctaGradientEnd?: string;
    ctaFont?: string;
    ctaFontSize?: number;
    ctaFontWeight?: string;
    ctaAction?: string; // URL or anchor
  };
  about?: {
    // 2.1 Pre-headline (overline)
    preHeadline?: string;
    preHeadlineFont?: string;
    preHeadlineFontSize?: number;
    preHeadlineFontWeight?: string;
    preHeadlineColor?: string;
    // 2.2 Headline
    headline?: string;
    headlineFont?: string;
    headlineFontSize?: number;
    headlineFontWeight?: string;
    headlineColor?: string;
    // 2.3 Foto do Proprietário
    imageUrl?: string;
    imageRadius?: number; // border-radius percentage (0-50)
    ownerName?: string;
    ownerNameFont?: string;
    ownerNameFontSize?: number;
    ownerNameFontWeight?: string;
    ownerNameColor?: string;
    ownerTitle?: string;
    ownerTitleColor?: string;
    // 2.4 Storytelling (body text)
    storytelling?: string;
    storytellingFont?: string;
    storytellingFontSize?: number;
    storytellingFontWeight?: string;
    storytellingColor?: string;
    // 2.5 Assinatura
    signatureText?: string;
    signatureColor?: string;
    showSignature?: boolean;
    // 2.6 Fundo da Seção
    bgMediaUrl?: string;
    bgMediaType?: "image" | "video";
    bgOverlayOpacity?: number;
    bgOverlayColor?: string;
    bgFallbackColor?: string;
    // Layout
    imagePosition?: "left" | "right";
    showDecorative?: boolean;
    // Legacy
    textColor?: string;
  };
  menu?: {
    // 3.1 Painel do Cardápio (Drawer/Overlay)
    panelBgColor?: string;
    panelOverlayOpacity?: number; // 0-100
    panelOverlayColor?: string;
    headerTextColor?: string;
    searchBorderColor?: string;
    searchBgColor?: string;
    searchIconColor?: string;
    // 3.2 Filtros de Categoria (Pills)
    filterActiveBgColor?: string;
    filterActiveTextColor?: string;
    filterInactiveBgColor?: string;
    filterInactiveTextColor?: string;
    // 3.3 Cards de Produto no Cardápio
    cardBgColor?: string;
    cardBorderColor?: string;
    cardBorderWidth?: number;
    cardBorderRadius?: number;
    cardNameColor?: string;
    cardPriceColor?: string;
    cardDescColor?: string;
    cardFont?: string;
    cardFontSize?: number;
    cardFontWeight?: string;
    // 3.4 Modal de Detalhes do Produto
    modalBgColor?: string;
    modalCtaBgColor?: string;
    modalCtaTextColor?: string;
    modalCtaFont?: string;
    modalCtaFontSize?: number;
    modalCtaFontWeight?: string;
    qtyBtnBgColor?: string;
    qtyBtnTextColor?: string;
    qtyNumberColor?: string;
  };
  reviews?: {
    headline?: string;
    isVisible?: boolean;
    starColor?: string;
    // 5.1 Label (Overline)
    label?: string;
    labelFont?: string;
    labelFontSize?: number;
    labelFontWeight?: string;
    labelColor?: string;
    // 5.1 Headline
    headlineFont?: string;
    headlineFontSize?: number;
    headlineFontWeight?: string;
    headlineColor?: string;
    // 5.2 Nota Média e Estrelas
    ratingNumberColor?: string;
    ratingTotalColor?: string;
    // 5.3 Cards de Avaliação
    cardBgColor?: string;
    cardNameColor?: string;
    cardDateColor?: string;
    cardTextColor?: string;
    // 5.4 Botão CTA Google
    ctaBgColor?: string;
    ctaTextColor?: string;
    ctaFont?: string;
    ctaFontSize?: number;
    ctaFontWeight?: string;
    // 5.5 Fundo da Seção
    bgColor?: string;
    bgMediaUrl?: string;
    bgMediaType?: "image" | "video";
    bgOverlayOpacity?: number;
    bgOverlayColor?: string;
  };
  feedbacks?: {
    starColor?: string;
  };
  info?: {
    // 6.1 Label, Headline e Subtítulo
    label?: string;
    labelFont?: string;
    labelFontSize?: number;
    labelFontWeight?: string;
    labelColor?: string;
    headline?: string;
    headlineFont?: string;
    headlineFontSize?: number;
    headlineFontWeight?: string;
    headlineColor?: string;
    subheadline?: string;
    subheadlineFont?: string;
    subheadlineFontSize?: number;
    subheadlineFontWeight?: string;
    subheadlineColor?: string;
    // Legacy aliases
    headline1?: string;
    subheadline1?: string;
    headline2?: string;
    subheadline2?: string;
    ctaText?: string;
    // 6.2 Bloco de Localização
    mapImageUrl?: string;
    mapOverlayOpacity?: number;
    mapPinColor?: string;
    mapBtnBgColor?: string;
    mapBtnTextColor?: string;
    mapBtnFont?: string;
    mapBtnFontSize?: number;
    mapBtnFontWeight?: string;
    mapBtnLabel?: string;
    mapUrl?: string; // Google Maps share link
    // 6.3 Card de Endereço
    addressIconColor?: string;
    addressIconBgColor?: string;
    addressText?: string;
    addressTextColor?: string;
    addressFont?: string;
    addressFontSize?: number;
    addressFontWeight?: string;
    // 6.4 Card de Telefone
    phoneIconColor?: string;
    phoneIconBgColor?: string;
    phoneText?: string;
    phoneTextColor?: string;
    phoneFont?: string;
    phoneFontSize?: number;
    phoneFontWeight?: string;
    // 6.5 Card de Horário
    hoursIconColor?: string;
    hoursIconBgColor?: string;
    hoursLinkColor?: string;
    hoursLinkFont?: string;
    hoursLinkFontSize?: number;
    hoursLinkFontWeight?: string;
    hoursLinkUrl?: string;
    // 6.6 Redes Sociais
    socialBtnBgColor?: string;
    socialIconColor?: string;
    socialInstagramUrl?: string;
    socialInstagramEnabled?: boolean;
    socialFacebookUrl?: string;
    socialFacebookEnabled?: boolean;
    socialYoutubeUrl?: string;
    socialYoutubeEnabled?: boolean;
    // 6.7 Fundo da Seção e Cards
    sectionBgColor?: string;
    cardsBgColor?: string;
    // Background media
    bgMediaUrl?: string;
    bgMediaType?: "image" | "video";
    bgOverlayOpacity?: number;
    bgOverlayColor?: string;
    // Visibility toggles
    showMap?: boolean;
    showAddress?: boolean;
    showPhone?: boolean;
    showHours?: boolean;
    showSocial?: boolean;
  };
  global?: {
    alignment?: "left" | "center" | "right";
  };
  sectionColors?: {
    hero?: SectionColors;
    intro?: SectionColors;
    vitrine?: SectionColors;
    about?: SectionColors;
    feedbacks?: SectionColors;
    location?: SectionColors;
  };
  whatsapp?: {
    popupTitle?: string;
    buttonText?: string;
  };
};

type ThemeColors = {
  primary: string;        // LEGACY: kept for backward compat
  background: string;     // Fundo do Site
  foreground: string;     // Texto Principal
  accent: string;         // Superfícies (cards, modais)
  muted: string;          // Texto Secundário
  buttonPrimary: string;  // Botões Principais (CTA)
  highlight: string;      // Destaques (preços, links, ícones, estrelas)
  success: string;        // Notificações/Sucesso (toasts, badges)
};

type SectionTab = "home" | "products" | "menu" | "about" | "reviews" | "info" | "whatsapp";

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

const FONT_WEIGHT_OPTIONS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "600", label: "Semi-Bold" },
  { value: "700", label: "Bold" },
  { value: "900", label: "Black" },
];

const ALL_FONTS = [...FONT_OPTIONS, ...DISPLAY_FONT_OPTIONS];

const SECTION_TABS: { id: SectionTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "HOME", icon: Home },
  { id: "products", label: "PRODUTOS", icon: ShoppingBag },
  { id: "menu", label: "CARDÁPIO", icon: AlignLeft },
  { id: "about", label: "SOBRE NÓS", icon: Users2 },
  { id: "reviews", label: "AVALIAÇÕES", icon: Star },
  { id: "info", label: "INFORMAÇÕES", icon: Info },
  { id: "whatsapp", label: "WHATSAPP", icon: MessageCircle },
];

const defaultDesign: LandingDesign = {
  home: {
    logoType: "text",
    logoSize: 80,
    headerBgColor: "rgba(0,0,0,0.3)",
    locationBoxBg: "rgba(255,255,255,0.1)",
    locationBoxText: "#a1a1aa",
    locationBoxIcon: "#d4a853",
    scheduleBoxBg: "rgba(34,197,94,0.15)",
    scheduleBoxText: "#22c55e",
    scheduleBoxIcon: "#22c55e",
    headlineFont: "",
    headlineFontSize: 64,
    headlineFontWeight: "700",
    headlineColor: "#ffffff",
    subheadlineFont: "",
    subheadlineFontSize: 20,
    subheadlineFontWeight: "400",
    subheadlineColor: "#a1a1aa",
    ctaBgColor: "#d4a853",
    ctaTextColor: "#1a1a1a",
    ctaGradient: false,
    ctaAction: "#cardapio",
    bgMediaType: "image",
    bgOverlayOpacity: 50,
    bgOverlayColor: "#000000",
    bgFallbackColor: "#1a1a1a",
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
    preHeadline: "CONHEÇA NOSSA HISTÓRIA",
    preHeadlineFontSize: 14,
    preHeadlineFontWeight: "500",
    preHeadlineColor: "",
    headline: "Sobre Nós",
    headlineFontSize: 48,
    headlineFontWeight: "700",
    headlineColor: "",
    imageRadius: 16,
    ownerNameFontSize: 20,
    ownerNameFontWeight: "700",
    ownerNameColor: "#ffffff",
    ownerTitleColor: "#a1a1aa",
    storytelling: "",
    storytellingFontSize: 18,
    storytellingFontWeight: "400",
    storytellingColor: "",
    signatureText: "",
    signatureColor: "",
    showSignature: true,
    bgOverlayOpacity: 0,
    bgOverlayColor: "#000000",
    bgFallbackColor: "",
    imagePosition: "left",
    showDecorative: true,
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
  sectionColors: {},
  whatsapp: {
    popupTitle: "Olá! Como podemos ajudar?",
    buttonText: "Iniciar Conversa",
  },
};

const defaultColors: ThemeColors = {
  primary: "#D4AF37",
  background: "#FFFFFF",
  foreground: "#1a1a1a",
  accent: "#F5F5F5",
  muted: "#71717a",
  buttonPrimary: "#D4AF37",
  highlight: "#D4AF37",
  success: "#22c55e",
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



  // Fetch landing design when tenant is selected
  const { data: landingData, isLoading: designLoading } = trpc.tenants.getLandingDesign.useQuery(
    { tenantId: selectedTenantId! },
    { enabled: !!selectedTenantId }
  );

  // Save mutation
  const saveMutation = trpc.tenants.updateLandingDesign.useMutation({
    onSuccess: () => {
      setIsDirty(false);
      // Update the cache directly with current state instead of re-fetching
      // This prevents the useEffect from overwriting the local state with stale data
      utils.tenants.getLandingDesign.setData(
        { tenantId: selectedTenantId! },
        (old: any) => old ? {
          ...old,
          landingDesign: design,
          tenant: {
            ...old.tenant,
            themeColors: colors,
            fontFamily,
            fontDisplay,
            borderRadius,
          },
        } : old
      );
      toast.success('Design salvo com sucesso!');
    },
    onError: (err) => {
      toast.error(`Erro ao salvar: ${err.message}`);
    },
  });

  // Upload mutation
  const uploadMutation = trpc.tenants.uploadDesignImage.useMutation();

  // Load data when tenant changes
  useEffect(() => {
    if (landingData) {
      const ld = landingData.landingDesign as LandingDesign | null;
      setDesign({
        home: { ...defaultDesign.home, ...ld?.home },
        products: { ...defaultDesign.products, ...ld?.products },
        about: { ...defaultDesign.about, ...ld?.about },
        reviews: { ...defaultDesign.reviews, ...ld?.reviews },
        info: { ...defaultDesign.info, ...ld?.info },
        global: { ...defaultDesign.global, ...ld?.global },
        sectionColors: { ...ld?.sectionColors },
        whatsapp: { ...defaultDesign.whatsapp, ...ld?.whatsapp },
      });
      const savedColors = (landingData.tenant.themeColors as Partial<ThemeColors>) || {};
      setColors({
        ...defaultColors,
        ...savedColors,
        // Ensure new fields have fallback to primary for backward compat
        buttonPrimary: savedColors.buttonPrimary || savedColors.primary || defaultColors.buttonPrimary,
        highlight: savedColors.highlight || savedColors.primary || defaultColors.highlight,
        success: savedColors.success || defaultColors.success,
      });
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
            fontFamily,
            fontDisplay,
            sectionColors: design.sectionColors,
          },
          '*'
        );
      } catch {
        // Cross-origin, ignore
      }
    }, 50);
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [design, colors, fontFamily, fontDisplay]);

  // Scroll preview to section
  const scrollPreviewToSection = (section: SectionTab) => {
    if (!iframeRef.current?.contentWindow) return;
    const sectionIdMap: Record<SectionTab, string> = {
      home: "hero",
      products: "vitrine",
      menu: "cardapio",
      about: "sobre",
      reviews: "feedbacks",
      info: "contato",
      whatsapp: "whatsapp-popup",
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

  // Upload handler for ImageUploader component (used in ImageUploadField)
  const handleImageUploaderUpload = useCallback(async (base64Data: string, fileName: string): Promise<string> => {
    if (!selectedTenantId) throw new Error("Nenhuma loja selecionada");
    const result = await uploadMutation.mutateAsync({
      tenantId: selectedTenantId,
      imageData: base64Data,
      fileName,
      contentType: "image/png",
    });
    setIsDirty(true);
    return result.url;
  }, [selectedTenantId, uploadMutation]);

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
      <div className="flex flex-col h-full -m-4">
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
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Left Panel - Editor */}
            <div className="w-[400px] shrink-0 flex flex-col overflow-hidden min-h-0 bg-zinc-900/80" style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.4), 1px 0 0 rgba(63,63,70,0.3)' }}>
              {/* Section Tabs */}
              <div
                className="flex gap-1 border-b border-zinc-800/80 shrink-0 overflow-x-auto whitespace-nowrap bg-zinc-900/60 backdrop-blur-sm hide-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {SECTION_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold whitespace-nowrap transition-all border-b-2 shrink-0 ${
                      activeTab === tab.id
                        ? "border-amber-500 text-amber-400 bg-amber-500/5"
                        : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
                    }`}
                  >
                    <tab.icon className={`h-3.5 w-3.5 ${activeTab === tab.id ? 'text-amber-500' : ''}`} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Editor Content */}
              <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
                <div className="p-4 space-y-4">
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
                    <>
                      <HomeSection
                        data={design.home || {}}
                        onChange={(field, value) => updateDesign("home", field, value)}
                        onImageUploaderUpload={handleImageUploaderUpload}
                        onDirectUpload={handleDirectUpload}
                        uploading={uploadMutation.isPending}
                      />
                      <Separator className="bg-zinc-800" />
                      <SectionColorsPanel
                        sectionKey="hero"
                        label="Cores do Hero"
                        colors={design.sectionColors?.hero || {}}
                        globalColors={colors}
                        onChange={(sc) => {
                          setDesign(prev => ({ ...prev, sectionColors: { ...prev.sectionColors, hero: sc } }));
                          setIsDirty(true);
                        }}
                      />
                    </>
                  )}
                  {activeTab === "products" && (
                    <>
                      <ProductsSection
                        data={design.products || {}}
                        categories={landingData?.categories || []}
                        onChange={(field, value) => updateDesign("products", field, value)}
                        onImageUploaderUpload={handleImageUploaderUpload}
                        onDirectUpload={handleDirectUpload}
                        uploading={uploadMutation.isPending}
                      />
                      <Separator className="bg-zinc-800" />
                      <SectionColorsPanel
                        sectionKey="intro"
                        label="Cores da Introdução"
                        colors={design.sectionColors?.intro || {}}
                        globalColors={colors}
                        onChange={(sc) => {
                          setDesign(prev => ({ ...prev, sectionColors: { ...prev.sectionColors, intro: sc } }));
                          setIsDirty(true);
                        }}
                      />
                      <SectionColorsPanel
                        sectionKey="vitrine"
                        label="Cores da Vitrine"
                        colors={design.sectionColors?.vitrine || {}}
                        globalColors={colors}
                        onChange={(sc) => {
                          setDesign(prev => ({ ...prev, sectionColors: { ...prev.sectionColors, vitrine: sc } }));
                          setIsDirty(true);
                        }}
                      />
                    </>
                  )}
                  {activeTab === "menu" && (
                    <>
                      <MenuSection
                        data={design.menu || {}}
                        onChange={(field, value) => updateDesign("menu", field, value)}
                      />
                    </>
                  )}
                  {activeTab === "about" && (
                    <>
                      <AboutSection
                        data={design.about || {}}
                        onChange={(field, value) => updateDesign("about", field, value)}
                        onImageUploaderUpload={handleImageUploaderUpload}
                        onDirectUpload={handleDirectUpload}
                        uploading={uploadMutation.isPending}
                      />
                      <Separator className="bg-zinc-800" />
                      <SectionColorsPanel
                        sectionKey="about"
                        label="Cores do Sobre"
                        colors={design.sectionColors?.about || {}}
                        globalColors={colors}
                        onChange={(sc) => {
                          setDesign(prev => ({ ...prev, sectionColors: { ...prev.sectionColors, about: sc } }));
                          setIsDirty(true);
                        }}
                      />
                    </>
                  )}
                  {activeTab === "reviews" && (
                    <>
                      <ReviewsSection
                        data={design.reviews || {}}
                        tenant={selectedTenant!}
                        onChange={(field, value) => updateDesign("reviews", field, value)}
                        onImageUploaderUpload={handleImageUploaderUpload}
                        onDirectUpload={handleDirectUpload}
                        uploading={uploadMutation.isPending}
                      />
                      <Separator className="bg-zinc-800" />
                      <SectionColorsPanel
                        sectionKey="feedbacks"
                        label="Cores das Avaliações"
                        colors={design.sectionColors?.feedbacks || {}}
                        globalColors={colors}
                        onChange={(sc) => {
                          setDesign(prev => ({ ...prev, sectionColors: { ...prev.sectionColors, feedbacks: sc } }));
                          setIsDirty(true);
                        }}
                      />
                    </>
                  )}
                  {activeTab === "info" && (
                    <>
                      <InfoSection
                        data={design.info || {}}
                        onChange={(field, value) => updateDesign("info", field, value)}
                        onImageUploaderUpload={handleImageUploaderUpload}
                        onDirectUpload={handleDirectUpload}
                        uploading={uploadMutation.isPending}
                      />
                      <Separator className="bg-zinc-800" />
                      <SectionColorsPanel
                        sectionKey="location"
                        label="Cores das Informações"
                        colors={design.sectionColors?.location || {}}
                        globalColors={colors}
                        onChange={(sc) => {
                          setDesign(prev => ({ ...prev, sectionColors: { ...prev.sectionColors, location: sc } }));
                          setIsDirty(true);
                        }}
                      />
                    </>
                  )}

                  {activeTab === "whatsapp" && (
                    <WhatsAppPopupSection
                      data={design.whatsapp || {}}
                      onChange={(field, value) => updateDesign("whatsapp", field, value)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 bg-zinc-950 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50 shrink-0 bg-zinc-950/80">
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
              <div className="flex-1 flex items-start justify-center p-4 overflow-auto">
                <div
                  className={`h-full rounded-xl overflow-hidden bg-black transition-all duration-300 ${
                    previewMode === "mobile"
                      ? "w-[375px] shadow-2xl shadow-black/60 ring-1 ring-zinc-800/50"
                      : "w-full ring-1 ring-zinc-800/30"
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

    </SuperAdminLayout>
  );
}

// ============================================
// GLOBAL STYLES PANEL
// ============================================

// Helper: calculate luminance from hex color for contrast detection
function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  const [rs, gs, bs] = [r, g, b].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Color groups organized by category
const ACTION_COLOR_GROUPS: { key: keyof ThemeColors; label: string; description: string; icon: string }[] = [
  {
    key: "buttonPrimary",
    label: "Botões Principais",
    description: "\"Fazer Pedido\", \"Mandar Mensagem\", \"Finalizar Compra\"",
    icon: "🔘",
  },
  {
    key: "highlight",
    label: "Destaques",
    description: "Preços, links, filtros ativos, ícones, estrelas",
    icon: "✨",
  },
  {
    key: "success",
    label: "Notificações / Sucesso",
    description: "Toast \"Produto adicionado\", badges, ícone check",
    icon: "✅",
  },
];

const STRUCTURE_COLOR_GROUPS: { key: keyof ThemeColors; label: string; description: string; icon: string }[] = [
  {
    key: "background",
    label: "Fundo do Site",
    description: "Background principal, gradientes, overlays",
    icon: "🖼️",
  },
  {
    key: "accent",
    label: "Superfícies",
    description: "Cards, modais, drawers, popups, inputs",
    icon: "📦",
  },
  {
    key: "foreground",
    label: "Texto Principal",
    description: "Títulos, headlines, nomes, labels",
    icon: "✏️",
  },
  {
    key: "muted",
    label: "Texto Secundário",
    description: "Subtítulos, descrições, placeholders",
    icon: "💬",
  },
];

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
    <div className="rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 text-sm font-semibold w-full px-3.5 py-3 rounded-xl transition-all ${
          isOpen
            ? 'bg-gradient-to-r from-amber-500/10 to-transparent text-amber-400 ring-1 ring-amber-500/20'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
        }`}
      >
        <Palette className={`h-4 w-4 ${isOpen ? 'text-amber-500' : 'text-zinc-500'}`} />
        Estilos Globais
        <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-500' : 'text-zinc-600'}`} />
      </button>

      {isOpen && (
        <div className="mt-2 space-y-4 px-1">
          {/* Action Colors */}
          <div className="space-y-2">
            <Label className="text-[11px] text-zinc-400 uppercase tracking-wider">Cores de Ação</Label>
            {ACTION_COLOR_GROUPS.map(({ key, label, description, icon }) => (
              <div key={key} className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-2.5">
                <div className="flex items-center gap-2">
                  <ColorPickerInput
                    value={colors[key]}
                    onChange={(v) => onColorChange(key, v)}
                    className="w-7 h-7 rounded cursor-pointer border border-zinc-600 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px]">{icon}</span>
                      <span className="text-xs font-medium text-zinc-200">{label}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight mt-0.5 truncate">{description}</p>
                  </div>
                  <Input
                    value={colors[key]}
                    onChange={(e) => onColorChange(key, e.target.value)}
                    className="w-[72px] h-6 text-[10px] bg-zinc-900 border-zinc-700 font-mono px-1.5"
                  />
                </div>
                {/* Preview swatch for buttons */}
                {key === "buttonPrimary" && (
                  <div className="flex gap-1 mt-1.5">
                    <div
                      className="h-5 flex-1 rounded text-[9px] font-bold flex items-center justify-center"
                      style={{
                        background: colors.buttonPrimary,
                        color: getLuminance(colors.buttonPrimary) > 0.4 ? '#1a1a1a' : '#ffffff',
                      }}
                    >
                      Botão
                    </div>
                  </div>
                )}
                {/* Preview swatch for success */}
                {key === "success" && (
                  <div className="flex gap-1 mt-1.5">
                    <div
                      className="h-5 flex-1 rounded text-[9px] font-bold flex items-center justify-center gap-1"
                      style={{
                        background: colors.success,
                        color: getLuminance(colors.success) > 0.4 ? '#1a1a1a' : '#ffffff',
                      }}
                    >
                      ✓ Produto adicionado!
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Structure Colors */}
          <div className="space-y-2">
            <Label className="text-[11px] text-zinc-400 uppercase tracking-wider">Cores de Estrutura</Label>
            {STRUCTURE_COLOR_GROUPS.map(({ key, label, description, icon }) => (
              <div key={key} className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-2.5">
                <div className="flex items-center gap-2">
                  <ColorPickerInput
                    value={colors[key]}
                    onChange={(v) => onColorChange(key, v)}
                    className="w-7 h-7 rounded cursor-pointer border border-zinc-600 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px]">{icon}</span>
                      <span className="text-xs font-medium text-zinc-200">{label}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight mt-0.5 truncate">{description}</p>
                  </div>
                  <Input
                    value={colors[key]}
                    onChange={(e) => onColorChange(key, e.target.value)}
                    className="w-[72px] h-6 text-[10px] bg-zinc-900 border-zinc-700 font-mono px-1.5"
                  />
                </div>
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
                  <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
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
                  <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
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
  onImageUploaderUpload,
  uploading,
  accept = "image/*",
  imageContext = "background",
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  onUpload?: (file: File, onSuccess: (url: string) => void) => void;
  onImageUploaderUpload?: (base64Data: string, fileName: string) => Promise<string>;
  uploading: boolean;
  accept?: string;
  imageContext?: ImageContext;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // For video uploads, use the old direct upload pattern
  const isVideoMode = accept.includes("video");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onUpload) onUpload(file, onChange);
  };

  // If we have the new ImageUploader handler and it's not video mode, use ImageUploader
  if (onImageUploaderUpload && !isVideoMode) {
    return (
      <div className="space-y-1.5">
        <Label className="text-[11px] text-zinc-400">{label}</Label>
        <ImageUploader
          context={imageContext}
          value={value || null}
          onChange={onChange}
          onRemove={() => onChange("")}
          onUpload={onImageUploaderUpload}
          uploading={uploading}
        />
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ou cole a URL da imagem"
          className="h-7 text-[11px] bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 px-2"
        />
      </div>
    );
  }

  // Fallback: old pattern for video or when no ImageUploader handler
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-zinc-400">{label}</Label>
      {value ? (
        <div className="relative rounded-xl overflow-hidden ring-1 ring-zinc-700/50 bg-zinc-900/40 group">
          {isVideoMode && value.match(/\.(mp4|webm|mov)$/i) ? (
            <video src={value} className="w-full h-24 object-cover" muted />
          ) : (
            <img src={value} alt="" className="w-full h-24 object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <button
            onClick={() => onChange("")}
            className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-sm text-white rounded-lg w-6 h-6 flex items-center justify-center hover:bg-red-500/80 text-[10px] transition-colors ring-1 ring-white/10"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-1.5 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            isDragging
              ? 'border-amber-500/50 bg-amber-500/5'
              : 'border-zinc-700/40 bg-zinc-900/30 hover:border-zinc-600/60 hover:bg-zinc-800/30'
          }`}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
          ) : (
            <Upload className="h-5 w-5 text-zinc-500" />
          )}
          <span className="text-[11px] text-zinc-500">
            {uploading ? 'Enviando...' : 'Arraste ou clique para enviar'}
          </span>
        </div>
      )}
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ou cole a URL da imagem"
        className="h-7 text-[11px] bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 px-2"
      />
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onUpload) onUpload(file, onChange);
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
  onImageUploaderUpload,
  onDirectUpload,
  uploading,
}: {
  data: NonNullable<LandingDesign["home"]>;
  onChange: (field: string, value: unknown) => void;
  onImageUploaderUpload: (base64Data: string, fileName: string) => Promise<string>;
  onDirectUpload: (file: File, onSuccess: (url: string) => void) => void;
  uploading: boolean;
}) {
  // Reusable color picker row
  const ColorRow = ({ label, value, defaultVal, field }: { label: string; value?: string; defaultVal: string; field: string }) => (
    <div>
      <Label className="text-[10px] text-zinc-400">{label}</Label>
      <div className="flex items-center gap-2">
        <ColorPickerInput
          value={value || defaultVal}
          onChange={(v) => onChange(field, v)}
          className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer shrink-0"
        />
        <Input
          value={value || defaultVal}
          onChange={(e) => onChange(field, e.target.value)}
          className="h-6 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-[10px] font-mono flex-1"
        />
      </div>
    </div>
  );

  // Reusable font selector
  const FontSelect = ({ label, value, field }: { label: string; value?: string; field: string }) => (
    <div>
      <Label className="text-[10px] text-zinc-400">{label}</Label>
      <Select value={value || ""} onValueChange={(v) => onChange(field, v)}>
        <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
          <SelectValue placeholder="Herdar Global" />
        </SelectTrigger>
        <SelectContent className="max-h-60 bg-zinc-900 border-zinc-800 text-white">
          <SelectItem value="inherit">Herdar Global</SelectItem>
          {ALL_FONTS.map((f) => (
            <SelectItem key={f} value={f}>
              <span style={{ fontFamily: f }}>{f}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-2 mb-1 border-b border-zinc-800/60">
        <div className="p-1.5 rounded-lg bg-amber-500/10">
          <Home className="h-4 w-4 text-amber-500" />
        </div>
        <h3 className="text-sm font-bold text-zinc-100 tracking-tight">Seção Home</h3>
      </div>

      {/* ===== 1.1 HEADER ===== */}
      <SubPanel id="1-1-header-barra-da-logo" title="1.1 Header (Barra da Logo)">

        <ColorRow label="Cor de Fundo" value={data.headerBgColor} defaultVal="rgba(0,0,0,0.3)" field="headerBgColor" />

        {/* Logo Type */}
        <div className="space-y-1.5">
          <Label className="text-[10px] text-zinc-400">Tipo de Logotipo</Label>
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
          <>
            <ImageUploadField
              label="Logotipo (Imagem)"
              value={data.logoUrl}
              onChange={(url) => onChange("logoUrl", url)}
              onImageUploaderUpload={onImageUploaderUpload}
              uploading={uploading}
              imageContext="logo"
            />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-zinc-400">Tamanho do Logo</Label>
                <span className="text-[10px] text-zinc-400 font-mono">{data.logoSize ?? 80}px</span>
              </div>
              <Slider
                value={[data.logoSize ?? 80]}
                onValueChange={([v]) => onChange("logoSize", v)}
                min={30}
                max={200}
                step={5}
                className="w-full"
              />
            </div>
          </>
        )}

        {data.logoType === "text" && (
          <div className="space-y-1.5">
            <Label className="text-[10px] text-zinc-400">Nome da Empresa</Label>
            <Input
              value={data.companyName || ""}
              onChange={(e) => onChange("companyName", e.target.value)}
              placeholder="Casa Blanca"
              className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
            />
          </div>
        )}
      </SubPanel>

      {/* ===== 1.2 BOX LOCALIZAÇÃO ===== */}
      <SubPanel id="1-2-box-de-localiza-o" title="1.2 Box de Localização">
        <div className="grid grid-cols-3 gap-2">
          <ColorRow label="Fundo" value={data.locationBoxBg} defaultVal="rgba(255,255,255,0.1)" field="locationBoxBg" />
          <ColorRow label="Texto" value={data.locationBoxText} defaultVal="#a1a1aa" field="locationBoxText" />
          <ColorRow label="Ícone" value={data.locationBoxIcon} defaultVal="#d4a853" field="locationBoxIcon" />
        </div>
        <div>
          <Label className="text-[10px] text-zinc-400">Label da Cidade</Label>
          <Input
            value={data.locationLabel || ""}
            onChange={(e) => onChange("locationLabel", e.target.value)}
            placeholder="Ex: Patos de Minas"
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        </div>
      </SubPanel>

      {/* ===== 1.3 BOX HORÁRIOS ===== */}
      <SubPanel id="1-3-box-de-atendimento" title="1.3 Box de Atendimento">
        <div className="grid grid-cols-3 gap-2">
          <ColorRow label="Fundo" value={data.scheduleBoxBg} defaultVal="rgba(34,197,94,0.15)" field="scheduleBoxBg" />
          <ColorRow label="Texto" value={data.scheduleBoxText} defaultVal="#22c55e" field="scheduleBoxText" />
          <ColorRow label="Ícone" value={data.scheduleBoxIcon} defaultVal="#22c55e" field="scheduleBoxIcon" />
        </div>
        <div>
          <Label className="text-[10px] text-zinc-400">Texto do Horário</Label>
          <Input
            value={data.scheduleLabel || ""}
            onChange={(e) => onChange("scheduleLabel", e.target.value)}
            placeholder="Ex: Abre às 18h"
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ColorRow label="Cor Aberto" value={data.badgeOpenColor} defaultVal="#22c55e" field="badgeOpenColor" />
          <ColorRow label="Cor Fechado" value={data.badgeClosedColor} defaultVal="#ef4444" field="badgeClosedColor" />
        </div>
      </SubPanel>

      {/* ===== 1.4 HEADLINE ===== */}
      <SubPanel id="1-4-headline-t-tulo-principal" title="1.4 Headline (Título Principal)">
        <div>
          <Label className="text-[10px] text-zinc-400">Texto</Label>
          <Textarea
            value={data.headline || ""}
            onChange={(e) => onChange("headline", e.target.value)}
            placeholder="Gastronomia de Alta Performance"
            className="bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs min-h-[60px] resize-y"
          />
        </div>
        <FontSelect label="Fonte" value={data.headlineFont} field="headlineFont" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-zinc-400">Tamanho</Label>
              <span className="text-[10px] text-zinc-400 font-mono">{data.headlineFontSize ?? 64}px</span>
            </div>
            <Slider
              value={[data.headlineFontSize ?? 64]}
              onValueChange={([v]) => onChange("headlineFontSize", v)}
              min={24}
              max={120}
              step={2}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-[10px] text-zinc-400">Peso</Label>
            <Select value={data.headlineFontWeight || "700"} onValueChange={(v) => onChange("headlineFontWeight", v)}>
              <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {FONT_WEIGHT_OPTIONS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ColorRow label="Cor do Título" value={data.headlineColor} defaultVal="#ffffff" field="headlineColor" />
      </SubPanel>

      {/* ===== 1.5 SUBHEADLINE ===== */}
      <SubPanel id="1-5-subheadline-subt-tulo" title="1.5 Subheadline (Subtítulo)">
        <div>
          <Label className="text-[10px] text-zinc-400">Texto</Label>
          <Textarea
            value={data.subheadline || ""}
            onChange={(e) => onChange("subheadline", e.target.value)}
            placeholder="Experiência única em sua cidade"
            className="bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs min-h-[50px] resize-y"
          />
        </div>
        <FontSelect label="Fonte" value={data.subheadlineFont} field="subheadlineFont" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-zinc-400">Tamanho</Label>
              <span className="text-[10px] text-zinc-400 font-mono">{data.subheadlineFontSize ?? 20}px</span>
            </div>
            <Slider
              value={[data.subheadlineFontSize ?? 20]}
              onValueChange={([v]) => onChange("subheadlineFontSize", v)}
              min={12}
              max={48}
              step={1}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-[10px] text-zinc-400">Peso</Label>
            <Select value={data.subheadlineFontWeight || "400"} onValueChange={(v) => onChange("subheadlineFontWeight", v)}>
              <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {FONT_WEIGHT_OPTIONS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ColorRow label="Cor do Subtítulo" value={data.subheadlineColor} defaultVal="#a1a1aa" field="subheadlineColor" />
      </SubPanel>

      {/* ===== 1.6 BOTÃO CTA ===== */}
      <SubPanel id="1-6-bot-o-cta" title="1.6 Botão CTA">
        <div>
          <Label className="text-[10px] text-zinc-400">Texto do Botão</Label>
          <Input
            value={data.ctaText || ""}
            onChange={(e) => onChange("ctaText", e.target.value)}
            placeholder="Fazer Pedido"
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ColorRow label="Cor de Fundo" value={data.ctaBgColor} defaultVal="#d4a853" field="ctaBgColor" />
          <ColorRow label="Cor do Texto" value={data.ctaTextColor} defaultVal="#1a1a1a" field="ctaTextColor" />
        </div>
        {/* Gradient toggle */}
        <div className="flex items-center gap-2">
          <Switch
            checked={data.ctaGradient || false}
            onCheckedChange={(v) => onChange("ctaGradient", v)}
          />
          <Label className="text-[10px] text-zinc-400">Gradiente</Label>
        </div>
        {data.ctaGradient && (
          <ColorRow label="Cor Final do Gradiente" value={data.ctaGradientEnd} defaultVal="#f0c674" field="ctaGradientEnd" />
        )}
        <div>
          <Label className="text-[10px] text-zinc-400">Ação do Botão</Label>
          <Select value={data.ctaAction || "#cardapio"} onValueChange={(v) => onChange("ctaAction", v)}>
            <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
              <SelectItem value="#cardapio">Abrir Cardápio</SelectItem>
              <SelectItem value="#contato">Ir para Contato</SelectItem>
              <SelectItem value="#sobre">Ir para Sobre</SelectItem>
              <SelectItem value="whatsapp">Abrir WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Preview do botão */}
        <div className="flex justify-center pt-1">
          <div
            className="px-6 py-2 rounded-full text-sm font-semibold"
            style={{
              background: data.ctaGradient
                ? `linear-gradient(135deg, ${data.ctaBgColor || '#d4a853'}, ${data.ctaGradientEnd || '#f0c674'})`
                : data.ctaBgColor || '#d4a853',
              color: data.ctaTextColor || '#1a1a1a',
            }}
          >
            {data.ctaText || 'Fazer Pedido'}
          </div>
        </div>
      </SubPanel>

      {/* ===== 1.7 FUNDO DA SEÇÃO ===== */}
      <SubPanel id="1-7-fundo-da-se-o" title="1.7 Fundo da Seção">

        {/* Media Type */}
        <div className="space-y-1.5">
          <Label className="text-[10px] text-zinc-400">Tipo de Mídia</Label>
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
          onUpload={data.bgMediaType === "video" ? onDirectUpload : undefined}
          onImageUploaderUpload={data.bgMediaType === "video" ? undefined : onImageUploaderUpload}
          uploading={uploading}
          accept={data.bgMediaType === "video" ? "video/*" : "image/*"}
          imageContext="background"
        />

        {/* Overlay */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-zinc-400">Opacidade do Overlay</Label>
            <span className="text-[10px] text-zinc-400 font-mono">{data.bgOverlayOpacity ?? 50}%</span>
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

        <ColorRow label="Cor do Overlay" value={data.bgOverlayColor} defaultVal="#000000" field="bgOverlayColor" />
        <ColorRow label="Cor de Fallback (sem imagem)" value={data.bgFallbackColor} defaultVal="#1a1a1a" field="bgFallbackColor" />
      </SubPanel>
    </div>
  );
}

// ============================================
// PRODUCTS SECTION
// ============================================

const GRADIENT_DIRECTIONS = [
  { value: "to-b", label: "↓ Cima → Baixo" },
  { value: "to-t", label: "↑ Baixo → Cima" },
  { value: "to-r", label: "→ Esq → Dir" },
  { value: "to-l", label: "← Dir → Esq" },
  { value: "to-br", label: "↘ Diagonal" },
  { value: "to-bl", label: "↙ Diagonal" },
  { value: "to-tr", label: "↗ Diagonal" },
  { value: "to-tl", label: "↖ Diagonal" },
];

function ProductsSection({
  data,
  categories,
  onChange,
  onImageUploaderUpload,
  onDirectUpload,
  uploading,
}: {
  data: NonNullable<LandingDesign["products"]>;
  categories: { id: number; name: string }[];
  onChange: (field: string, value: unknown) => void;
  onImageUploaderUpload: (base64Data: string, fileName: string) => Promise<string>;
  onDirectUpload: (file: File, onSuccess: (url: string) => void) => void;
  uploading: boolean;
}) {
  // Reusable color picker row
  const ColorRow = ({ label, value, defaultVal, field }: { label: string; value?: string; defaultVal: string; field: string }) => (
    <div>
      <Label className="text-[10px] text-zinc-400">{label}</Label>
      <div className="flex items-center gap-2">
        <ColorPickerInput
          value={value || defaultVal}
          onChange={(v) => onChange(field, v)}
          className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer shrink-0"
        />
        <Input
          value={value || defaultVal}
          onChange={(e) => onChange(field, e.target.value)}
          className="h-6 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-[10px] font-mono flex-1"
        />
      </div>
    </div>
  );

  // Reusable font selector
  const FontSelect = ({ label, value, field }: { label: string; value?: string; field: string }) => (
    <div>
      <Label className="text-[10px] text-zinc-400">{label}</Label>
      <Select value={value || ""} onValueChange={(v) => onChange(field, v)}>
        <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
          <SelectValue placeholder="Herdar Global" />
        </SelectTrigger>
        <SelectContent className="max-h-60 bg-zinc-900 border-zinc-800 text-white">
          <SelectItem value="inherit">Herdar Global</SelectItem>
          {ALL_FONTS.map((f) => (
            <SelectItem key={f} value={f}>
              <span style={{ fontFamily: f }}>{f}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-2 mb-1 border-b border-zinc-800/60">
        <div className="p-1.5 rounded-lg bg-amber-500/10">
          <ShoppingBag className="h-4 w-4 text-amber-500" />
        </div>
        <h3 className="text-sm font-bold text-zinc-100 tracking-tight">Seção Produtos</h3>
      </div>

      {/* ===== CATEGORIAS (Regra de Negócio) ===== */}
      <SubPanel id="categorias-dados-do-cat-logo" title="Categorias (Dados do Catálogo)">
        <p className="text-[10px] text-zinc-400 italic">Os produtos vêm do módulo de Catálogo e não são editáveis aqui.</p>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-zinc-500">Máximo na LP</span>
            <span className="text-[11px] text-zinc-400 font-mono">{data.maxCategories ?? 3}</span>
          </div>
          <Slider
            value={[data.maxCategories ?? 3]}
            onValueChange={([v]) => onChange("maxCategories", v)}
            min={1}
            max={6}
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
            <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs w-full">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
              <SelectItem value="none" className="text-zinc-300 text-xs">Nenhuma</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()} className="text-zinc-300 text-xs">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SubPanel>

      {/* ===== 2.1 HEADLINE ===== */}
      <SubPanel id="2-1-headline-t-tulo-da-se-o" title="2.1 Headline (Título da Seção)">
        <div>
          <Label className="text-[10px] text-zinc-400">Texto</Label>
          <Input
            value={data.headline || ""}
            onChange={(e) => onChange("headline", e.target.value)}
            placeholder="Nosso Cardápio"
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        </div>
        <FontSelect label="Fonte" value={data.headlineFont} field="headlineFont" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-zinc-400">Tamanho</Label>
              <span className="text-[10px] text-zinc-400 font-mono">{data.headlineFontSize ?? 48}px</span>
            </div>
            <Slider
              value={[data.headlineFontSize ?? 48]}
              onValueChange={([v]) => onChange("headlineFontSize", v)}
              min={24}
              max={96}
              step={2}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-[10px] text-zinc-400">Peso</Label>
            <Select value={data.headlineFontWeight || "700"} onValueChange={(v) => onChange("headlineFontWeight", v)}>
              <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {FONT_WEIGHT_OPTIONS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ColorRow label="Cor do Título" value={data.headlineColor} defaultVal="" field="headlineColor" />
      </SubPanel>

      {/* ===== 2.2 SUBHEADLINE ===== */}
      <SubPanel id="2-2-subheadline-subt-tulo" title="2.2 Subheadline (Subtítulo)">
        <div>
          <Label className="text-[10px] text-zinc-400">Texto</Label>
          <Input
            value={data.subheadline || ""}
            onChange={(e) => onChange("subheadline", e.target.value)}
            placeholder="Escolha seus favoritos"
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        </div>
        <FontSelect label="Fonte" value={data.subheadlineFont} field="subheadlineFont" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-zinc-400">Tamanho</Label>
              <span className="text-[10px] text-zinc-400 font-mono">{data.subheadlineFontSize ?? 18}px</span>
            </div>
            <Slider
              value={[data.subheadlineFontSize ?? 18]}
              onValueChange={([v]) => onChange("subheadlineFontSize", v)}
              min={12}
              max={36}
              step={1}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-[10px] text-zinc-400">Peso</Label>
            <Select value={data.subheadlineFontWeight || "400"} onValueChange={(v) => onChange("subheadlineFontWeight", v)}>
              <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {FONT_WEIGHT_OPTIONS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ColorRow label="Cor do Subtítulo" value={data.subheadlineColor} defaultVal="" field="subheadlineColor" />
      </SubPanel>

      {/* ===== 2.3 TEMPLATE DE CARDS ===== */}
      <SubPanel id="2-3-template-de-cards" title="2.3 Template de Cards">
        <p className="text-[10px] text-zinc-400 italic">Personalização visual dos cards. Dados dos produtos (nome, preço, foto) vêm do Catálogo.</p>

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 font-medium">Cores</Label>
        <ColorRow label="Fundo do Card" value={data.cardBgColor} defaultVal="#ffffff" field="cardBgColor" />
        <ColorRow label="Nome do Produto" value={data.cardNameColor} defaultVal="#111827" field="cardNameColor" />
        <ColorRow label="Preço" value={data.cardPriceColor} defaultVal="" field="cardPriceColor" />
        <ColorRow label="Descrição Curta" value={data.cardDescColor} defaultVal="#6b7280" field="cardDescColor" />

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 font-medium">Borda</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-zinc-400">Raio (px)</Label>
              <span className="text-[10px] text-zinc-400 font-mono">{data.cardBorderRadius ?? 16}px</span>
            </div>
            <Slider
              value={[data.cardBorderRadius ?? 16]}
              onValueChange={([v]) => onChange("cardBorderRadius", v)}
              min={0}
              max={32}
              step={1}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-zinc-400">Espessura (px)</Label>
              <span className="text-[10px] text-zinc-400 font-mono">{data.cardBorderWidth ?? 1}px</span>
            </div>
            <Slider
              value={[data.cardBorderWidth ?? 1]}
              onValueChange={([v]) => onChange("cardBorderWidth", v)}
              min={0}
              max={4}
              step={1}
              className="w-full"
            />
          </div>
        </div>
        <ColorRow label="Cor da Borda" value={data.cardBorderColor} defaultVal="" field="cardBorderColor" />
      </SubPanel>

      {/* ===== 2.4 FUNDO DA SEÇÃO ===== */}
      <SubPanel id="2-4-fundo-da-se-o" title="2.4 Fundo da Seção">

        <ColorRow label="Cor Sólida" value={data.bgColor} defaultVal="" field="bgColor" />

        <Separator className="bg-zinc-800" />
        <div className="flex items-center gap-2">
          <Switch
            checked={data.bgGradient ?? false}
            onCheckedChange={(v) => onChange("bgGradient", v)}
          />
          <Label className="text-[10px] text-zinc-400">Gradiente</Label>
        </div>
        {data.bgGradient && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <ColorRow label="De" value={data.bgGradientFrom} defaultVal="#ffffff" field="bgGradientFrom" />
              <ColorRow label="Para" value={data.bgGradientTo} defaultVal="#f3f4f6" field="bgGradientTo" />
            </div>
            <div>
              <Label className="text-[10px] text-zinc-400">Direção</Label>
              <Select value={data.bgGradientDirection || "to-b"} onValueChange={(v) => onChange("bgGradientDirection", v)}>
                <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {GRADIENT_DIRECTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 font-medium">Imagem de Fundo</Label>

        <ImageUploadField
          label="Imagem (WebP recomendado)"
          value={data.bgMediaUrl}
          onChange={(url) => onChange("bgMediaUrl", url)}
          onImageUploaderUpload={onImageUploaderUpload}
          uploading={uploading}
          imageContext="background"
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-zinc-400">Opacidade do Overlay</Label>
            <span className="text-[10px] text-zinc-400 font-mono">{data.bgOverlayOpacity ?? 0}%</span>
          </div>
          <Slider
            value={[data.bgOverlayOpacity ?? 0]}
            onValueChange={([v]) => onChange("bgOverlayOpacity", v)}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
        <ColorRow label="Cor do Overlay" value={data.bgOverlayColor} defaultVal="#000000" field="bgOverlayColor" />
      </SubPanel>

      {/* ===== 2.5 BOTÃO VER TODAS ===== */}
      <SubPanel id="2-5-botao-ver-todas" title='2.5 Botão "Ver Todas"'>
        <div>
          <Label className="text-[10px] text-zinc-400">Label</Label>
          <Input
            value={data.viewAllLabel || ""}
            onChange={(e) => onChange("viewAllLabel", e.target.value)}
            placeholder="Ver Todas"
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        </div>
        <ColorRow label="Cor de Fundo" value={data.viewAllBgColor} defaultVal="" field="viewAllBgColor" />
        <ColorRow label="Cor do Texto" value={data.viewAllTextColor} defaultVal="" field="viewAllTextColor" />
        <FontSelect label="Fonte" value={data.viewAllFont} field="viewAllFont" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-zinc-400">Tamanho</Label>
              <span className="text-[10px] text-zinc-400 font-mono">{data.viewAllFontSize ?? 14}px</span>
            </div>
            <Slider
              value={[data.viewAllFontSize ?? 14]}
              onValueChange={([v]) => onChange("viewAllFontSize", v)}
              min={10}
              max={24}
              step={1}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-[10px] text-zinc-400">Peso</Label>
            <Select value={data.viewAllFontWeight || "500"} onValueChange={(v) => onChange("viewAllFontWeight", v)}>
              <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {FONT_WEIGHT_OPTIONS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SubPanel>

      {/* ===== 2.6 BOTÃO CTA ===== */}
      <SubPanel id="2-6-bot-o-cta-ver-card-pio-com" title="2.6 Botão CTA (Ver Cardápio Completo)">
        <div>
          <Label className="text-[10px] text-zinc-400">Label</Label>
          <Input
            value={data.ctaText || ""}
            onChange={(e) => onChange("ctaText", e.target.value)}
            placeholder="Ver Cardápio Completo"
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        </div>
        <ColorRow label="Cor de Fundo" value={data.ctaBgColor} defaultVal="" field="ctaBgColor" />
        <ColorRow label="Cor do Texto" value={data.ctaTextColor} defaultVal="" field="ctaTextColor" />

        <div className="flex items-center gap-2">
          <Switch
            checked={data.ctaGradient ?? false}
            onCheckedChange={(v) => onChange("ctaGradient", v)}
          />
          <Label className="text-[10px] text-zinc-400">Gradiente</Label>
        </div>
        {data.ctaGradient && (
          <ColorRow label="Cor Final do Gradiente" value={data.ctaGradientEnd} defaultVal="" field="ctaGradientEnd" />
        )}

        <FontSelect label="Fonte" value={data.ctaFont} field="ctaFont" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-zinc-400">Tamanho</Label>
              <span className="text-[10px] text-zinc-400 font-mono">{data.ctaFontSize ?? 16}px</span>
            </div>
            <Slider
              value={[data.ctaFontSize ?? 16]}
              onValueChange={([v]) => onChange("ctaFontSize", v)}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-[10px] text-zinc-400">Peso</Label>
            <Select value={data.ctaFontWeight || "500"} onValueChange={(v) => onChange("ctaFontWeight", v)}>
              <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {FONT_WEIGHT_OPTIONS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-[10px] text-zinc-400">Ação (URL ou âncora)</Label>
          <Input
            value={data.ctaAction || ""}
            onChange={(e) => onChange("ctaAction", e.target.value)}
            placeholder="#cardapio ou https://..."
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        </div>
      </SubPanel>
    </div>
  );
}

// ============================================
// MENU SECTION (Cardápio / Modais)
// ============================================

function MenuSection({
  data,
  onChange,
}: {
  data: NonNullable<LandingDesign["menu"]>;
  onChange: (field: string, value: unknown) => void;
}) {
  const ColorRow = ({ label, value, defaultVal, field }: { label: string; value?: string; defaultVal: string; field: string }) => (
    <div>
      <Label className="text-[10px] text-zinc-400">{label}</Label>
      <div className="flex items-center gap-2">
        <ColorPickerInput
          value={value || defaultVal}
          onChange={(v) => onChange(field, v)}
          className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer shrink-0"
        />
        <Input
          value={value || defaultVal}
          onChange={(e) => onChange(field, e.target.value)}
          className="h-6 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-[10px] font-mono flex-1"
        />
      </div>
    </div>
  );

  const FontSelect = ({ label, value, field }: { label: string; value?: string; field: string }) => (
    <div>
      <Label className="text-[10px] text-zinc-400">{label}</Label>
      <Select value={value || ""} onValueChange={(v) => onChange(field, v)}>
        <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
          <SelectValue placeholder="Herdar Global" />
        </SelectTrigger>
        <SelectContent className="max-h-60 bg-zinc-900 border-zinc-800 text-white">
          <SelectItem value="inherit">Herdar Global</SelectItem>
          {ALL_FONTS.map((f) => (
            <SelectItem key={f} value={f}>
              <span style={{ fontFamily: f }}>{f}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-[10px] text-zinc-400 bg-zinc-800/50 rounded p-2">
        Estilize os modais dinâmicos do Cardápio (Drawer, Filtros, Cards e Modal de Detalhes). Os dados dos produtos vêm do Catálogo e não são editáveis aqui.
      </p>

      {/* 3.1 PAINEL DO CARDÁPIO */}
      <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-3 space-y-3">
        <h4 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">3.1 PAINEL DO CARDÁPIO (DRAWER)</h4>

        <ColorRow label="Cor de Fundo do Painel" value={data.panelBgColor} defaultVal="#0a0a0a" field="panelBgColor" />

        <div>
          <Label className="text-[10px] text-zinc-400">Opacidade do Overlay (fundo escuro)</Label>
          <div className="flex items-center gap-3">
            <Slider
              value={[data.panelOverlayOpacity ?? 50]}
              onValueChange={([v]) => onChange("panelOverlayOpacity", v)}
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-[10px] text-zinc-400 w-8 text-right">{data.panelOverlayOpacity ?? 50}%</span>
          </div>
        </div>

        <ColorRow label="Cor do Overlay" value={data.panelOverlayColor} defaultVal="#000000" field="panelOverlayColor" />
        <ColorRow label="Cor do Texto do Header" value={data.headerTextColor} defaultVal="#ffffff" field="headerTextColor" />

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 uppercase tracking-wider">Campo de Busca</Label>
        <ColorRow label="Cor da Borda" value={data.searchBorderColor} defaultVal="#333333" field="searchBorderColor" />
        <ColorRow label="Cor de Fundo" value={data.searchBgColor} defaultVal="#1a1a1a" field="searchBgColor" />
        <ColorRow label="Cor do Ícone (Lupa)" value={data.searchIconColor} defaultVal="#888888" field="searchIconColor" />
      </div>

      {/* 3.2 FILTROS DE CATEGORIA */}
      <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-3 space-y-3">
        <h4 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">3.2 FILTROS DE CATEGORIA (PILLS)</h4>

        <div className="grid grid-cols-2 gap-3">
          <ColorRow label="Fundo (Ativo)" value={data.filterActiveBgColor} defaultVal="#d4a574" field="filterActiveBgColor" />
          <ColorRow label="Texto (Ativo)" value={data.filterActiveTextColor} defaultVal="#000000" field="filterActiveTextColor" />
          <ColorRow label="Fundo (Inativo)" value={data.filterInactiveBgColor} defaultVal="#1a1a1a" field="filterInactiveBgColor" />
          <ColorRow label="Texto (Inativo)" value={data.filterInactiveTextColor} defaultVal="#888888" field="filterInactiveTextColor" />
        </div>
      </div>

      {/* 3.3 CARDS DE PRODUTO NO CARDÁPIO */}
      <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-3 space-y-3">
        <h4 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">3.3 CARDS DE PRODUTO NO CARDÁPIO</h4>
        <p className="text-[9px] text-zinc-600">Dados dos produtos (nome, preço, foto) vem do Catálogo — somente o design visual é editável.</p>

        <ColorRow label="Cor de Fundo do Card" value={data.cardBgColor} defaultVal="#111111" field="cardBgColor" />

        <div className="grid grid-cols-3 gap-2">
          <ColorRow label="Nome" value={data.cardNameColor} defaultVal="#ffffff" field="cardNameColor" />
          <ColorRow label="Preço" value={data.cardPriceColor} defaultVal="#d4a574" field="cardPriceColor" />
          <ColorRow label="Descrição" value={data.cardDescColor} defaultVal="#888888" field="cardDescColor" />
        </div>

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 uppercase tracking-wider">Borda do Card</Label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-[10px] text-zinc-400">Raio (px)</Label>
            <Input
              type="number"
              value={data.cardBorderRadius ?? 12}
              onChange={(e) => onChange("cardBorderRadius", Number(e.target.value))}
              className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
            />
          </div>
          <ColorRow label="Cor" value={data.cardBorderColor} defaultVal="#222222" field="cardBorderColor" />
          <div>
            <Label className="text-[10px] text-zinc-400">Espessura (px)</Label>
            <Input
              type="number"
              value={data.cardBorderWidth ?? 1}
              onChange={(e) => onChange("cardBorderWidth", Number(e.target.value))}
              className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
            />
          </div>
        </div>

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 uppercase tracking-wider">Tipografia dos Cards</Label>
        <div className="grid grid-cols-3 gap-2">
          <FontSelect label="Fonte" value={data.cardFont} field="cardFont" />
          <div>
            <Label className="text-[10px] text-zinc-400">Tamanho (px)</Label>
            <Input
              type="number"
              value={data.cardFontSize ?? 14}
              onChange={(e) => onChange("cardFontSize", Number(e.target.value))}
              className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-zinc-400">Peso</Label>
            <Select value={data.cardFontWeight || "400"} onValueChange={(v) => onChange("cardFontWeight", v)}>
              <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {FONT_WEIGHT_OPTIONS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 3.4 MODAL DE DETALHES DO PRODUTO */}
      <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-3 space-y-3">
        <h4 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">3.4 MODAL DE DETALHES DO PRODUTO</h4>

        <ColorRow label="Cor de Fundo do Modal" value={data.modalBgColor} defaultVal="#111111" field="modalBgColor" />

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 uppercase tracking-wider">Botão ‘Adicionar ao Carrinho’ (CTA)</Label>
        <div className="grid grid-cols-2 gap-2">
          <ColorRow label="Cor de Fundo" value={data.modalCtaBgColor} defaultVal="#d4a574" field="modalCtaBgColor" />
          <ColorRow label="Cor do Texto" value={data.modalCtaTextColor} defaultVal="#000000" field="modalCtaTextColor" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <FontSelect label="Fonte" value={data.modalCtaFont} field="modalCtaFont" />
          <div>
            <Label className="text-[10px] text-zinc-400">Tamanho (px)</Label>
            <Input
              type="number"
              value={data.modalCtaFontSize ?? 18}
              onChange={(e) => onChange("modalCtaFontSize", Number(e.target.value))}
              className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-zinc-400">Peso</Label>
            <Select value={data.modalCtaFontWeight || "600"} onValueChange={(v) => onChange("modalCtaFontWeight", v)}>
              <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {FONT_WEIGHT_OPTIONS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 uppercase tracking-wider">Controles de Quantidade (+/-)</Label>
        <div className="grid grid-cols-3 gap-2">
          <ColorRow label="Fundo Botões" value={data.qtyBtnBgColor} defaultVal="#d4a574" field="qtyBtnBgColor" />
          <ColorRow label="Texto Botões" value={data.qtyBtnTextColor} defaultVal="#000000" field="qtyBtnTextColor" />
          <ColorRow label="Cor do Número" value={data.qtyNumberColor} defaultVal="#ffffff" field="qtyNumberColor" />
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
  onImageUploaderUpload,
  onDirectUpload,
  uploading,
}: {
  data: NonNullable<LandingDesign["about"]>;
  onChange: (field: string, value: unknown) => void;
  onImageUploaderUpload: (base64Data: string, fileName: string) => Promise<string>;
  onDirectUpload: (file: File, onSuccess: (url: string) => void) => void;
  uploading: boolean;
}) {
  // Reusable color picker row
  const ColorRow = ({ label, value, defaultVal, field }: { label: string; value?: string; defaultVal: string; field: string }) => (
    <div>
      <Label className="text-[10px] text-zinc-400">{label}</Label>
      <div className="flex items-center gap-2">
        <ColorPickerInput
          value={value || defaultVal}
          onChange={(v) => onChange(field, v)}
          className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer shrink-0"
        />
        <Input
          value={value || defaultVal}
          onChange={(e) => onChange(field, e.target.value)}
          className="h-6 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-[10px] font-mono flex-1"
        />
      </div>
    </div>
  );

  // Reusable font selector
  const FontSelect = ({ label, value, field }: { label: string; value?: string; field: string }) => (
    <div>
      <Label className="text-[10px] text-zinc-400">{label}</Label>
      <Select value={value || ""} onValueChange={(v) => onChange(field, v)}>
        <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
          <SelectValue placeholder="Herdar Global" />
        </SelectTrigger>
        <SelectContent className="max-h-60 bg-zinc-900 border-zinc-800 text-white">
          <SelectItem value="inherit">Herdar Global</SelectItem>
          {ALL_FONTS.map((f) => (
            <SelectItem key={f} value={f}>
              <span style={{ fontFamily: f }}>{f}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-2 mb-1 border-b border-zinc-800/60">
        <div className="p-1.5 rounded-lg bg-amber-500/10">
          <Users2 className="h-4 w-4 text-amber-500" />
        </div>
        <h3 className="text-sm font-bold text-zinc-100 tracking-tight">Seção Sobre Nós</h3>
      </div>

      {/* ===== 2.1 PRE-HEADLINE ===== */}
      <SubPanel id="2-1-pre-headline-overline" title="2.1 Pre-headline (Overline)">
        <div>
          <Label className="text-[10px] text-zinc-400">Texto</Label>
          <Input
            value={data.preHeadline || ""}
            onChange={(e) => onChange("preHeadline", e.target.value)}
            placeholder="CONHEÇA NOSSA HISTÓRIA"
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        </div>
        <FontSelect label="Fonte" value={data.preHeadlineFont} field="preHeadlineFont" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-zinc-400">Tamanho</Label>
              <span className="text-[10px] text-zinc-400 font-mono">{data.preHeadlineFontSize ?? 14}px</span>
            </div>
            <Slider
              value={[data.preHeadlineFontSize ?? 14]}
              onValueChange={([v]) => onChange("preHeadlineFontSize", v)}
              min={10}
              max={24}
              step={1}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-[10px] text-zinc-400">Peso</Label>
            <Select value={data.preHeadlineFontWeight || "500"} onValueChange={(v) => onChange("preHeadlineFontWeight", v)}>
              <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {FONT_WEIGHT_OPTIONS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ColorRow label="Cor" value={data.preHeadlineColor} defaultVal="" field="preHeadlineColor" />
      </SubPanel>

      {/* ===== 2.2 HEADLINE ===== */}
      <SubPanel id="2-2-headline-t-tulo-principal" title="2.2 Headline (Título Principal)">
        <div>
          <Label className="text-[10px] text-zinc-400">Texto</Label>
          <Input
            value={data.headline || ""}
            onChange={(e) => onChange("headline", e.target.value)}
            placeholder="Sobre Nós"
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        </div>
        <FontSelect label="Fonte" value={data.headlineFont} field="headlineFont" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-zinc-400">Tamanho</Label>
              <span className="text-[10px] text-zinc-400 font-mono">{data.headlineFontSize ?? 48}px</span>
            </div>
            <Slider
              value={[data.headlineFontSize ?? 48]}
              onValueChange={([v]) => onChange("headlineFontSize", v)}
              min={24}
              max={96}
              step={2}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-[10px] text-zinc-400">Peso</Label>
            <Select value={data.headlineFontWeight || "700"} onValueChange={(v) => onChange("headlineFontWeight", v)}>
              <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {FONT_WEIGHT_OPTIONS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ColorRow label="Cor do Título" value={data.headlineColor} defaultVal="" field="headlineColor" />
      </SubPanel>

      {/* ===== 2.3 FOTO DO PROPRIETÁRIO ===== */}
      <SubPanel id="2-3-foto-do-propriet-rio" title="2.3 Foto do Proprietário">

        <ImageUploadField
          label="Imagem"
          value={data.imageUrl}
          onChange={(url) => onChange("imageUrl", url)}
          onImageUploaderUpload={onImageUploaderUpload}
          uploading={uploading}
          imageContext="background"
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-zinc-400">Arredondamento</Label>
            <span className="text-[10px] text-zinc-400 font-mono">{data.imageRadius ?? 16}px</span>
          </div>
          <Slider
            value={[data.imageRadius ?? 16]}
            onValueChange={([v]) => onChange("imageRadius", v)}
            min={0}
            max={50}
            step={1}
            className="w-full"
          />
        </div>

        <Separator className="bg-zinc-800" />

        <div>
          <Label className="text-[10px] text-zinc-400">Nome do Proprietário</Label>
          <Input
            value={data.ownerName || ""}
            onChange={(e) => onChange("ownerName", e.target.value)}
            placeholder="Nome do proprietário"
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        </div>
        <FontSelect label="Fonte do Nome" value={data.ownerNameFont} field="ownerNameFont" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-zinc-400">Tamanho</Label>
              <span className="text-[10px] text-zinc-400 font-mono">{data.ownerNameFontSize ?? 20}px</span>
            </div>
            <Slider
              value={[data.ownerNameFontSize ?? 20]}
              onValueChange={([v]) => onChange("ownerNameFontSize", v)}
              min={14}
              max={36}
              step={1}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-[10px] text-zinc-400">Peso</Label>
            <Select value={data.ownerNameFontWeight || "700"} onValueChange={(v) => onChange("ownerNameFontWeight", v)}>
              <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {FONT_WEIGHT_OPTIONS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ColorRow label="Cor do Nome" value={data.ownerNameColor} defaultVal="#ffffff" field="ownerNameColor" />

        <Separator className="bg-zinc-800" />

        <div>
          <Label className="text-[10px] text-zinc-400">Título / Cargo</Label>
          <Input
            value={data.ownerTitle || ""}
            onChange={(e) => onChange("ownerTitle", e.target.value)}
            placeholder="Fundador & Chef"
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        </div>
        <ColorRow label="Cor do Título" value={data.ownerTitleColor} defaultVal="#a1a1aa" field="ownerTitleColor" />
      </SubPanel>

      {/* ===== 2.4 STORYTELLING ===== */}
      <SubPanel id="2-4-storytelling-texto" title="2.4 Storytelling (Texto)">
        <div>
          <Label className="text-[10px] text-zinc-400">Texto</Label>
          <Textarea
            value={data.storytelling || ""}
            onChange={(e) => onChange("storytelling", e.target.value)}
            placeholder="Conte a história do negócio..."
            className="bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs min-h-[100px] resize-y"
          />
        </div>
        <FontSelect label="Fonte" value={data.storytellingFont} field="storytellingFont" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-zinc-400">Tamanho</Label>
              <span className="text-[10px] text-zinc-400 font-mono">{data.storytellingFontSize ?? 18}px</span>
            </div>
            <Slider
              value={[data.storytellingFontSize ?? 18]}
              onValueChange={([v]) => onChange("storytellingFontSize", v)}
              min={12}
              max={28}
              step={1}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-[10px] text-zinc-400">Peso</Label>
            <Select value={data.storytellingFontWeight || "400"} onValueChange={(v) => onChange("storytellingFontWeight", v)}>
              <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {FONT_WEIGHT_OPTIONS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ColorRow label="Cor do Texto" value={data.storytellingColor} defaultVal="" field="storytellingColor" />
      </SubPanel>

      {/* ===== 2.5 ASSINATURA ===== */}
      <SubPanel id="2-5-assinatura" title="2.5 Assinatura">
        <div className="flex items-center gap-2">
          <Switch
            checked={data.showSignature ?? true}
            onCheckedChange={(v) => onChange("showSignature", v)}
          />
          <Label className="text-[10px] text-zinc-400">Exibir assinatura</Label>
        </div>
        {(data.showSignature ?? true) && (
          <>
            <div>
              <Label className="text-[10px] text-zinc-400">Texto (vazio = nome da empresa)</Label>
              <Input
                value={data.signatureText || ""}
                onChange={(e) => onChange("signatureText", e.target.value)}
                placeholder="Nome da empresa"
                className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
              />
            </div>
            <ColorRow label="Cor" value={data.signatureColor} defaultVal="" field="signatureColor" />
          </>
        )}
      </SubPanel>

      {/* ===== 2.6 LAYOUT ===== */}
      <SubPanel id="2-6-layout" title="2.6 Layout">

        <div className="space-y-1.5">
          <Label className="text-[10px] text-zinc-400">Posição da Imagem</Label>
          <div className="flex gap-1.5">
            <button
              onClick={() => onChange("imagePosition", "left")}
              className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                (data.imagePosition || "left") === "left"
                  ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
              }`}
            >
              <AlignLeft className="h-3 w-3 inline mr-1" />
              Esquerda
            </button>
            <button
              onClick={() => onChange("imagePosition", "right")}
              className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                data.imagePosition === "right"
                  ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
              }`}
            >
              <AlignRight className="h-3 w-3 inline mr-1" />
              Direita
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={data.showDecorative ?? true}
            onCheckedChange={(v) => onChange("showDecorative", v)}
          />
          <Label className="text-[10px] text-zinc-400">Elemento decorativo</Label>
        </div>
      </SubPanel>

      {/* ===== 2.7 FUNDO DA SEÇÃO ===== */}
      <SubPanel id="2-7-fundo-da-se-o" title="2.7 Fundo da Seção">

        <div className="space-y-1.5">
          <Label className="text-[10px] text-zinc-400">Tipo de Mídia</Label>
          <div className="flex gap-1.5">
            <button
              onClick={() => onChange("bgMediaType", "image")}
              className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                (data.bgMediaType || "image") === "image"
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
          onChange={(url) => onChange("bgMediaUrl", url)}          onUpload={data.bgMediaType === "video" ? onDirectUpload : undefined}
          onImageUploaderUpload={data.bgMediaType === "video" ? undefined : onImageUploaderUpload}
          uploading={uploading}
          accept={data.bgMediaType === "video" ? "video/*" : "image/*"}
          imageContext="background"
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-zinc-400">Opacidade do Overlay (Sobre)</Label>
            <span className="text-[10px] text-zinc-400 font-mono">{data.bgOverlayOpacity ?? 0}%</span>
          </div>
          <Slider
            value={[data.bgOverlayOpacity ?? 0]}
            onValueChange={([v]) => onChange("bgOverlayOpacity", v)}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        <ColorRow label="Cor do Overlay" value={data.bgOverlayColor} defaultVal="#000000" field="bgOverlayColor" />
        <ColorRow label="Cor de Fallback (sem imagem)" value={data.bgFallbackColor} defaultVal="" field="bgFallbackColor" />
      </SubPanel>
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
  onImageUploaderUpload,
  onDirectUpload,
  uploading,
}: {
  data: NonNullable<LandingDesign["reviews"]>;
  tenant: { id: number; googleApiKey?: string | null; googlePlaceId?: string | null };
  onChange: (field: string, value: unknown) => void;
  onImageUploaderUpload: (base64Data: string, fileName: string) => Promise<string>;
  onDirectUpload: (file: File, onSuccess: (url: string) => void) => void;
  uploading: boolean;
}) {
  // Reusable color picker row
  const ColorRow = ({ label, value, defaultVal, field }: { label: string; value?: string; defaultVal: string; field: string }) => (
    <div>
      <Label className="text-[10px] text-zinc-400">{label}</Label>
      <div className="flex items-center gap-2">
        <ColorPickerInput
          value={value || defaultVal}
          onChange={(v) => onChange(field, v)}
          className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer shrink-0"
        />
        <Input
          value={value || defaultVal}
          onChange={(e) => onChange(field, e.target.value)}
          className="h-6 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-[10px] font-mono flex-1"
        />
      </div>
    </div>
  );

  // Reusable font selector
  const FontSelect = ({ label, value, field }: { label: string; value?: string; field: string }) => (
    <div>
      <Label className="text-[10px] text-zinc-400">{label}</Label>
      <Select value={value || ""} onValueChange={(v) => onChange(field, v)}>
        <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
          <SelectValue placeholder="Herdar Global" />
        </SelectTrigger>
        <SelectContent className="max-h-60 bg-zinc-900 border-zinc-800 text-white">
          <SelectItem value="inherit">Herdar Global</SelectItem>
          {ALL_FONTS.map((f) => (
            <SelectItem key={f} value={f}>
              <span style={{ fontFamily: f }}>{f}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-2 mb-1 border-b border-zinc-800/60">
        <div className="p-1.5 rounded-lg bg-amber-500/10">
          <Star className="h-4 w-4 text-amber-500" />
        </div>
        <h3 className="text-sm font-bold text-zinc-100 tracking-tight">Seção Avaliações</h3>
      </div>

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
        <div className="space-y-3">

          {/* ===== 5.1 HEADLINE E LABEL ===== */}
          <SubPanel id="5-1-headline-e-label" title="5.1 Headline e Label">

            {/* Label (Overline) */}
            <div className="space-y-1.5">
              <Label className="text-[10px] text-zinc-400 uppercase tracking-wider">Label (Sobretítulo)</Label>
              <Input
                value={data.label || ""}
                onChange={(e) => onChange("label", e.target.value)}
                placeholder="AVALIAÇÕES"
                className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
              />
              <FontSelect label="Fonte" value={data.labelFont} field="labelFont" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-zinc-400">Tamanho</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[data.labelFontSize || 14]}
                      onValueChange={([v]) => onChange("labelFontSize", v)}
                      min={10} max={24} step={1}
                      className="flex-1"
                    />
                    <span className="text-[10px] text-zinc-400 font-mono w-8 text-right">{data.labelFontSize || 14}px</span>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] text-zinc-400">Peso</Label>
                  <Select value={data.labelFontWeight || "500"} onValueChange={(v) => onChange("labelFontWeight", v)}>
                    <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      {FONT_WEIGHT_OPTIONS.map((w) => (
                        <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <ColorRow label="Cor do Label" value={data.labelColor} defaultVal="" field="labelColor" />
            </div>

            <Separator className="bg-zinc-800" />

            {/* Headline */}
            <div className="space-y-1.5">
              <Label className="text-[10px] text-zinc-400 uppercase tracking-wider">Headline (Título Principal)</Label>
              <Input
                value={data.headline || ""}
                onChange={(e) => onChange("headline", e.target.value)}
                placeholder="O que dizem nossos clientes"
                className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
              />
              <FontSelect label="Fonte" value={data.headlineFont} field="headlineFont" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-zinc-400">Tamanho</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[data.headlineFontSize || 36]}
                      onValueChange={([v]) => onChange("headlineFontSize", v)}
                      min={20} max={72} step={1}
                      className="flex-1"
                    />
                    <span className="text-[10px] text-zinc-400 font-mono w-8 text-right">{data.headlineFontSize || 36}px</span>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] text-zinc-400">Peso</Label>
                  <Select value={data.headlineFontWeight || "700"} onValueChange={(v) => onChange("headlineFontWeight", v)}>
                    <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      {FONT_WEIGHT_OPTIONS.map((w) => (
                        <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <ColorRow label="Cor do Headline" value={data.headlineColor} defaultVal="" field="headlineColor" />
            </div>
          </SubPanel>

          {/* ===== 5.2 NOTA MÉDIA E ESTRELAS ===== */}
          <SubPanel id="5-2-nota-m-dia-e-estrelas" title="5.2 Nota Média e Estrelas">

            <ColorRow label="Cor das Estrelas (--cor-estrelas)" value={data.starColor} defaultVal="#facc15" field="starColor" />
            <p className="text-[10px] text-zinc-600">Totalmente independente da cor primária dos botões</p>

            <ColorRow label="Cor do Número da Nota (ex: 4.9)" value={data.ratingNumberColor} defaultVal="" field="ratingNumberColor" />
            <ColorRow label="Cor do Total de Avaliações" value={data.ratingTotalColor} defaultVal="" field="ratingTotalColor" />
          </SubPanel>

          {/* ===== 5.3 CARDS DE AVALIAÇÃO ===== */}
          <SubPanel id="5-3-cards-de-avalia-o" title="5.3 Cards de Avaliação">
            <p className="text-[10px] text-zinc-600">Dados dos depoimentos são read-only (Google ou cadastro manual)</p>

            <ColorRow label="Fundo do Card" value={data.cardBgColor} defaultVal="" field="cardBgColor" />
            <ColorRow label="Cor do Nome do Avaliador" value={data.cardNameColor} defaultVal="" field="cardNameColor" />
            <ColorRow label="Cor da Data" value={data.cardDateColor} defaultVal="" field="cardDateColor" />
            <ColorRow label="Cor do Texto da Avaliação" value={data.cardTextColor} defaultVal="" field="cardTextColor" />
          </SubPanel>

          {/* ===== 5.4 BOTÃO CTA GOOGLE ===== */}
          <SubPanel id="5-4-bot-o-cta-google" title="5.4 Botão CTA Google">
            <p className="text-[10px] text-zinc-600">Link redireciona para o Google Places configurado nas Integrações</p>

            <ColorRow label="Cor de Fundo" value={data.ctaBgColor} defaultVal="" field="ctaBgColor" />
            <ColorRow label="Cor do Texto" value={data.ctaTextColor} defaultVal="" field="ctaTextColor" />
            <FontSelect label="Fonte" value={data.ctaFont} field="ctaFont" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-zinc-400">Tamanho</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[data.ctaFontSize || 14]}
                    onValueChange={([v]) => onChange("ctaFontSize", v)}
                    min={10} max={24} step={1}
                    className="flex-1"
                  />
                  <span className="text-[10px] text-zinc-400 font-mono w-8 text-right">{data.ctaFontSize || 14}px</span>
                </div>
              </div>
              <div>
                <Label className="text-[10px] text-zinc-400">Peso</Label>
                <Select value={data.ctaFontWeight || "400"} onValueChange={(v) => onChange("ctaFontWeight", v)}>
                  <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    {FONT_WEIGHT_OPTIONS.map((w) => (
                      <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* API Google Status */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-zinc-400 uppercase tracking-wider">Status da Integração</Label>
              <div className="px-2 py-1.5 rounded bg-zinc-800/50 border border-zinc-700/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">API Key</span>
                  <span className={`text-[11px] ${tenant.googleApiKey ? "text-green-400" : "text-zinc-600"}`}>
                    {tenant.googleApiKey ? "✓ Configurada" : "✗ Não configurada"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">Place ID</span>
                  <span className={`text-[11px] ${tenant.googlePlaceId ? "text-green-400" : "text-zinc-600"}`}>
                    {tenant.googlePlaceId ? "✓ Configurado" : "✗ Não configurado"}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-zinc-600">Configure nas Integrações do cliente</p>
            </div>
          </SubPanel>

          {/* ===== 5.5 FUNDO DA SEÇÃO ===== */}
          <SubPanel id="5-5-fundo-da-se-o" title="5.5 Fundo da Seção">

            <ColorRow label="Cor Sólida de Fundo" value={data.bgColor} defaultVal="" field="bgColor" />

            {/* Media type toggle */}
            <div className="space-y-1">
              <Label className="text-[10px] text-zinc-400">Tipo de Mídia</Label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => onChange("bgMediaType", "image")}
                  className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    (data.bgMediaType || "image") === "image"
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
              onUpload={data.bgMediaType === "video" ? onDirectUpload : undefined}
              onImageUploaderUpload={data.bgMediaType === "video" ? undefined : onImageUploaderUpload}
              uploading={uploading}
              accept={data.bgMediaType === "video" ? "video/*" : "image/*"}
              imageContext="background"
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-zinc-400">Opacidade do Overlay</Label>
                <span className="text-[10px] text-zinc-400 font-mono">{data.bgOverlayOpacity ?? 0}%</span>
              </div>
              <Slider
                value={[data.bgOverlayOpacity ?? 0]}
                onValueChange={([v]) => onChange("bgOverlayOpacity", v)}
                min={0} max={100} step={5}
              />
            </div>

            <ColorRow label="Cor do Overlay" value={data.bgOverlayColor} defaultVal="#000000" field="bgOverlayColor" />
            <p className="text-[10px] text-zinc-600">CSS Responsivo: background-size: cover, background-position: center</p>
          </SubPanel>

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
  onImageUploaderUpload,
  onDirectUpload,
  uploading,
}: {
  data: NonNullable<LandingDesign["info"]>;
  onChange: (field: string, value: unknown) => void;
  onImageUploaderUpload: (base64Data: string, fileName: string) => Promise<string>;
  onDirectUpload: (file: File, onSuccess: (url: string) => void) => void;
  uploading: boolean;
}) {
  // Reusable color picker row
  const ColorRow = ({ label, value, defaultVal, field }: { label: string; value?: string; defaultVal: string; field: string }) => (
    <div>
      <Label className="text-[10px] text-zinc-400">{label}</Label>
      <div className="flex items-center gap-2">
        <ColorPickerInput
          value={value || defaultVal}
          onChange={(v) => onChange(field, v)}
          className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer shrink-0"
        />
        <Input
          value={value || defaultVal}
          onChange={(e) => onChange(field, e.target.value)}
          className="h-6 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-[10px] font-mono flex-1"
        />
      </div>
    </div>
  );

  // Reusable font selector
  const FontSelect = ({ label, value, field }: { label: string; value?: string; field: string }) => (
    <div>
      <Label className="text-[10px] text-zinc-400">{label}</Label>
      <Select value={value || ""} onValueChange={(v) => onChange(field, v)}>
        <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
          <SelectValue placeholder="Herdar Global" />
        </SelectTrigger>
        <SelectContent className="max-h-60 bg-zinc-900 border-zinc-800 text-white">
          <SelectItem value="inherit">Herdar Global</SelectItem>
          {ALL_FONTS.map((f) => (
            <SelectItem key={f} value={f}>
              <span style={{ fontFamily: f }}>{f}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  // Reusable typography block (font, size, weight)
  const TypoBlock = ({ fontField, sizeField, weightField, defaultSize, defaultWeight, minSize = 10, maxSize = 96 }: {
    fontField: string; sizeField: string; weightField: string;
    defaultSize: number; defaultWeight: string;
    minSize?: number; maxSize?: number;
  }) => (
    <>
      <FontSelect label="Fonte" value={(data as Record<string, string>)[fontField]} field={fontField} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-zinc-400">Tamanho</Label>
            <span className="text-[10px] text-zinc-400 font-mono">{(data as Record<string, number>)[sizeField] ?? defaultSize}px</span>
          </div>
          <Slider
            value={[(data as Record<string, number>)[sizeField] ?? defaultSize]}
            onValueChange={([v]) => onChange(sizeField, v)}
            min={minSize}
            max={maxSize}
            step={1}
            className="w-full"
          />
        </div>
        <div>
          <Label className="text-[10px] text-zinc-400">Peso</Label>
          <Select value={(data as Record<string, string>)[weightField] || defaultWeight} onValueChange={(v) => onChange(weightField, v)}>
            <SelectTrigger className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
              {FONT_WEIGHT_OPTIONS.map((w) => (
                <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-2 mb-1 border-b border-zinc-800/60">
        <div className="p-1.5 rounded-lg bg-amber-500/10">
          <Info className="h-4 w-4 text-amber-500" />
        </div>
        <h3 className="text-sm font-bold text-zinc-100 tracking-tight">Seção Informações / Rodapé</h3>
      </div>

      {/* ===== 6.1 LABEL, HEADLINE E SUBTÍTULO ===== */}
      <SubPanel id="6-1-label-headline-e-subt-tulo" title="6.1 Label, Headline e Subtítulo">

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 font-medium">Label (Sobretítulo)</Label>
        <Input
          value={data.label || data.headline1 || ""}
          onChange={(e) => { onChange("label", e.target.value); onChange("headline1", e.target.value); }}
          placeholder="VENHA NOS VISITAR"
          className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
        />
        <TypoBlock fontField="labelFont" sizeField="labelFontSize" weightField="labelFontWeight" defaultSize={12} defaultWeight="600" minSize={8} maxSize={24} />
        <ColorRow label="Cor do Label" value={data.labelColor} defaultVal="" field="labelColor" />

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 font-medium">Headline (Título Principal)</Label>
        <Input
          value={data.headline || data.subheadline1 || ""}
          onChange={(e) => { onChange("headline", e.target.value); onChange("subheadline1", e.target.value); }}
          placeholder="Nossa Localização"
          className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
        />
        <TypoBlock fontField="headlineFont" sizeField="headlineFontSize" weightField="headlineFontWeight" defaultSize={48} defaultWeight="700" minSize={24} maxSize={96} />
        <ColorRow label="Cor do Headline" value={data.headlineColor} defaultVal="" field="headlineColor" />

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 font-medium">Subtítulo</Label>
        <Input
          value={data.subheadline || data.subheadline2 || ""}
          onChange={(e) => { onChange("subheadline", e.target.value); onChange("subheadline2", e.target.value); }}
          placeholder="Estamos esperando por você"
          className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
        />
        <TypoBlock fontField="subheadlineFont" sizeField="subheadlineFontSize" weightField="subheadlineFontWeight" defaultSize={18} defaultWeight="400" minSize={12} maxSize={36} />
        <ColorRow label="Cor do Subtítulo" value={data.subheadlineColor} defaultVal="" field="subheadlineColor" />
      </SubPanel>

      {/* ===== 6.2 BLOCO DE LOCALIZAÇÃO ===== */}
      <SubPanel id="6-2-bloco-de-localiza-o" title="6.2 Bloco de Localização">

        <ImageUploadField
          label="Imagem de Capa (fachada/local)"
          value={data.mapImageUrl}
          onChange={(url) => onChange("mapImageUrl", url)}
          onImageUploaderUpload={onImageUploaderUpload}
          uploading={uploading}
          imageContext="background"
        />

        {data.mapImageUrl && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-zinc-400">Opacidade do Overlay</Label>
              <span className="text-[11px] text-zinc-500 font-mono">{data.mapOverlayOpacity ?? 40}%</span>
            </div>
            <Slider
              value={[data.mapOverlayOpacity ?? 40]}
              onValueChange={([v]) => onChange("mapOverlayOpacity", v)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        )}

        <Separator className="bg-zinc-800" />
        <ColorRow label="Cor do Pin (Mapa)" value={data.mapPinColor} defaultVal="" field="mapPinColor" />

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 font-medium">Botão &lsquo;Abrir no Mapa&rsquo;</Label>
        <Input
          value={data.mapBtnLabel || ""}
          onChange={(e) => onChange("mapBtnLabel", e.target.value)}
          placeholder="Abrir no Mapa"
          className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
        />
        <ColorRow label="Cor de Fundo" value={data.mapBtnBgColor} defaultVal="" field="mapBtnBgColor" />
        <ColorRow label="Cor do Texto" value={data.mapBtnTextColor} defaultVal="" field="mapBtnTextColor" />
        <TypoBlock fontField="mapBtnFont" sizeField="mapBtnFontSize" weightField="mapBtnFontWeight" defaultSize={14} defaultWeight="600" minSize={10} maxSize={24} />

        <Separator className="bg-zinc-800" />
        <div>
          <Label className="text-[10px] text-zinc-400">URL do Google Maps</Label>
          <Input
            value={data.mapUrl || ""}
            onChange={(e) => onChange("mapUrl", e.target.value)}
            placeholder="https://maps.google.com/..."
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        </div>
      </SubPanel>

      {/* ===== 6.3 CARD DE ENDEREÇO ===== */}
      <SubPanel id="6-3-card-de-endere-o" title="6.3 Card de Endereço">

        <Label className="text-[10px] text-zinc-400 font-medium">Ícone</Label>
        <div className="grid grid-cols-2 gap-2">
          <ColorRow label="Cor do Ícone" value={data.addressIconColor} defaultVal="" field="addressIconColor" />
          <ColorRow label="Fundo do Ícone" value={data.addressIconBgColor} defaultVal="" field="addressIconBgColor" />
        </div>

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 font-medium">Texto do Endereço</Label>
        <Textarea
          value={data.addressText || ""}
          onChange={(e) => onChange("addressText", e.target.value)}
          placeholder="Rua Exemplo, 123 - Bairro, Cidade/UF"
          className="bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs min-h-[60px]"
        />
        <TypoBlock fontField="addressFont" sizeField="addressFontSize" weightField="addressFontWeight" defaultSize={14} defaultWeight="400" minSize={10} maxSize={24} />
        <ColorRow label="Cor do Texto" value={data.addressTextColor} defaultVal="" field="addressTextColor" />
      </SubPanel>

      {/* ===== 6.4 CARD DE TELEFONE ===== */}
      <SubPanel id="6-4-card-de-telefone" title="6.4 Card de Telefone">

        <Label className="text-[10px] text-zinc-400 font-medium">Ícone</Label>
        <div className="grid grid-cols-2 gap-2">
          <ColorRow label="Cor do Ícone" value={data.phoneIconColor} defaultVal="" field="phoneIconColor" />
          <ColorRow label="Fundo do Ícone" value={data.phoneIconBgColor} defaultVal="" field="phoneIconBgColor" />
        </div>

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 font-medium">Número de Telefone</Label>
        <p className="text-[9px] text-zinc-600 italic">Formato: (XX) XXXXX-XXXX — será injetado em &lt;a href=&quot;tel:...&quot;&gt;</p>
        <Input
          value={data.phoneText || ""}
          onChange={(e) => onChange("phoneText", e.target.value)}
          placeholder="(11) 99999-9999"
          className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
        />
        <TypoBlock fontField="phoneFont" sizeField="phoneFontSize" weightField="phoneFontWeight" defaultSize={14} defaultWeight="400" minSize={10} maxSize={24} />
        <ColorRow label="Cor do Texto" value={data.phoneTextColor} defaultVal="" field="phoneTextColor" />
      </SubPanel>

      {/* ===== 6.5 CARD DE HORÁRIO ===== */}
      <SubPanel id="6-5-card-de-hor-rio-de-funcion" title="6.5 Card de Horário de Funcionamento">

        <Label className="text-[10px] text-zinc-400 font-medium">Ícone</Label>
        <div className="grid grid-cols-2 gap-2">
          <ColorRow label="Cor do Ícone" value={data.hoursIconColor} defaultVal="" field="hoursIconColor" />
          <ColorRow label="Fundo do Ícone" value={data.hoursIconBgColor} defaultVal="" field="hoursIconBgColor" />
        </div>

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 font-medium">Link &lsquo;Ver horário completo&rsquo;</Label>
        <Input
          value={data.hoursLinkUrl || ""}
          onChange={(e) => onChange("hoursLinkUrl", e.target.value)}
          placeholder="URL ou âncora (ex: #horarios)"
          className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
        />
        <TypoBlock fontField="hoursLinkFont" sizeField="hoursLinkFontSize" weightField="hoursLinkFontWeight" defaultSize={14} defaultWeight="600" minSize={10} maxSize={24} />
        <ColorRow label="Cor do Link" value={data.hoursLinkColor} defaultVal="" field="hoursLinkColor" />
      </SubPanel>

      {/* ===== 6.6 BOTÕES DE REDES SOCIAIS ===== */}
      <SubPanel id="6-6-redes-sociais" title="6.6 Redes Sociais">

        <Label className="text-[10px] text-zinc-400 font-medium">Estilos Globais</Label>
        <ColorRow label="Fundo dos Botões" value={data.socialBtnBgColor} defaultVal="" field="socialBtnBgColor" />
        <ColorRow label="Cor dos Ícones" value={data.socialIconColor} defaultVal="" field="socialIconColor" />

        <Separator className="bg-zinc-800" />

        {/* Instagram */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Instagram className="h-4 w-4 text-pink-500" />
            <span className="text-xs text-zinc-300">Instagram</span>
          </div>
          <Switch
            checked={data.socialInstagramEnabled ?? true}
            onCheckedChange={(v) => onChange("socialInstagramEnabled", v)}
          />
        </div>
        {(data.socialInstagramEnabled ?? true) && (
          <Input
            value={data.socialInstagramUrl || ""}
            onChange={(e) => onChange("socialInstagramUrl", e.target.value)}
            placeholder="https://instagram.com/seurestaurante"
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        )}

        <Separator className="bg-zinc-800" />

        {/* Facebook */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Facebook className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-zinc-300">Facebook</span>
          </div>
          <Switch
            checked={data.socialFacebookEnabled ?? true}
            onCheckedChange={(v) => onChange("socialFacebookEnabled", v)}
          />
        </div>
        {(data.socialFacebookEnabled ?? true) && (
          <Input
            value={data.socialFacebookUrl || ""}
            onChange={(e) => onChange("socialFacebookUrl", e.target.value)}
            placeholder="https://facebook.com/seurestaurante"
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        )}

        <Separator className="bg-zinc-800" />

        {/* YouTube */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Youtube className="h-4 w-4 text-red-500" />
            <span className="text-xs text-zinc-300">YouTube</span>
          </div>
          <Switch
            checked={data.socialYoutubeEnabled ?? true}
            onCheckedChange={(v) => onChange("socialYoutubeEnabled", v)}
          />
        </div>
        {(data.socialYoutubeEnabled ?? true) && (
          <Input
            value={data.socialYoutubeUrl || ""}
            onChange={(e) => onChange("socialYoutubeUrl", e.target.value)}
            placeholder="https://youtube.com/@seurestaurante"
            className="h-7 bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 text-xs"
          />
        )}
      </SubPanel>

      {/* ===== 6.7 FUNDO DA SEÇÃO E CARDS ===== */}
      <SubPanel id="6-7-fundo-da-se-o-e-cards" title="6.7 Fundo da Seção e Cards">

        <ColorRow label="Fundo do Rodapé (Seção)" value={data.sectionBgColor} defaultVal="" field="sectionBgColor" />
        <ColorRow label="Fundo dos Cards Flutuantes" value={data.cardsBgColor} defaultVal="" field="cardsBgColor" />

        <Separator className="bg-zinc-800" />
        <Label className="text-[10px] text-zinc-400 font-medium">Mídia de Fundo</Label>
        <div className="flex gap-1.5">
          <button
            onClick={() => onChange("bgMediaType", "image")}
            className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              data.bgMediaType === "image" || !data.bgMediaType
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

        <ImageUploadField
          label={data.bgMediaType === "video" ? "Vídeo de Fundo" : "Imagem de Fundo"}
          value={data.bgMediaUrl}
          onChange={(url) => onChange("bgMediaUrl", url)}
          onUpload={data.bgMediaType === "video" ? onDirectUpload : undefined}
          onImageUploaderUpload={data.bgMediaType === "video" ? undefined : onImageUploaderUpload}
          uploading={uploading}
          accept={data.bgMediaType === "video" ? "video/*" : "image/*"}
          imageContext="background"
        />

        {data.bgMediaUrl && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-zinc-400">Opacidade do Overlay</Label>
              <span className="text-[11px] text-zinc-500 font-mono">{data.bgOverlayOpacity ?? 60}%</span>
            </div>
            <Slider
              value={[data.bgOverlayOpacity ?? 60]}
              onValueChange={([v]) => onChange("bgOverlayOpacity", v)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        )}
        <ColorRow label="Cor do Overlay" value={data.bgOverlayColor} defaultVal="rgba(0,0,0,0.5)" field="bgOverlayColor" />
      </SubPanel>

      {/* ===== EXIBIÇÃO (TOGGLES) ===== */}
      <SubPanel id="visibilidade" title="Visibilidade">
        {[
          { key: "showMap", label: "Mapa / Localização" },
          { key: "showAddress", label: "Card de Endereço" },
          { key: "showPhone", label: "Card de Telefone" },
          { key: "showHours", label: "Card de Horários" },
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
      </SubPanel>
    </div>
  );
}

// ============================================
// SECTION COLORS PANEL
// ============================================

function SectionColorsPanel({
  sectionKey,
  label,
  colors,
  globalColors,
  onChange,
}: {
  sectionKey: string;
  label: string;
  colors: SectionColors;
  globalColors: ThemeColors;
  onChange: (sc: SectionColors) => void;
}) {
  const isEnabled = colors.enabled ?? false;

  const updateField = (field: keyof SectionColors, value: unknown) => {
    onChange({ ...colors, [field]: value });
  };

  // Derive default values from global colors
  const defaults = {
    background: globalColors.background,
    text: globalColors.foreground,
    textMuted: globalColors.muted,
    highlight: globalColors.highlight || globalColors.primary,
    surface: globalColors.accent,
    border: globalColors.background + "1a",
    buttonBg: globalColors.buttonPrimary || globalColors.primary,
    buttonFg: "#1a1a1a",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-purple-500/10">
            <Palette className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <h3 className="text-xs font-bold text-zinc-200 tracking-tight">{label}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400">
            {isEnabled ? "Personalizado" : "Global"}
          </span>
          <Switch
            checked={isEnabled}
            onCheckedChange={(v) => updateField("enabled", v)}
          />
        </div>
      </div>

      {isEnabled && (
        <div className="space-y-2 pl-1">
          {/* Background */}
          <div className="flex items-center gap-2">
            <ColorPickerInput
              value={colors.background || defaults.background}
              onChange={(v) => updateField("background", v)}
              className="w-6 h-6 rounded border border-zinc-700 cursor-pointer bg-transparent p-0"
            />
            <span className="text-[11px] text-zinc-400 flex-1">Fundo</span>
            <Input
              value={colors.background || defaults.background}
              onChange={(e) => updateField("background", e.target.value)}
              className="w-20 h-6 text-[10px] bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 px-1.5"
            />
          </div>

          {/* Text */}
          <div className="flex items-center gap-2">
            <ColorPickerInput
              value={colors.text || defaults.text}
              onChange={(v) => updateField("text", v)}
              className="w-6 h-6 rounded border border-zinc-700 cursor-pointer bg-transparent p-0"
            />
            <span className="text-[11px] text-zinc-400 flex-1">Texto</span>
            <Input
              value={colors.text || defaults.text}
              onChange={(e) => updateField("text", e.target.value)}
              className="w-20 h-6 text-[10px] bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 px-1.5"
            />
          </div>

          {/* Text Muted */}
          <div className="flex items-center gap-2">
            <ColorPickerInput
              value={colors.textMuted || defaults.textMuted}
              onChange={(v) => updateField("textMuted", v)}
              className="w-6 h-6 rounded border border-zinc-700 cursor-pointer bg-transparent p-0"
            />
            <span className="text-[11px] text-zinc-400 flex-1">Texto Secundário</span>
            <Input
              value={colors.textMuted || defaults.textMuted}
              onChange={(e) => updateField("textMuted", e.target.value)}
              className="w-20 h-6 text-[10px] bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 px-1.5"
            />
          </div>

          {/* Highlight */}
          <div className="flex items-center gap-2">
            <ColorPickerInput
              value={colors.highlight || defaults.highlight}
              onChange={(v) => updateField("highlight", v)}
              className="w-6 h-6 rounded border border-zinc-700 cursor-pointer bg-transparent p-0"
            />
            <span className="text-[11px] text-zinc-400 flex-1">Destaque</span>
            <Input
              value={colors.highlight || defaults.highlight}
              onChange={(e) => updateField("highlight", e.target.value)}
              className="w-20 h-6 text-[10px] bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 px-1.5"
            />
          </div>

          {/* Surface */}
          <div className="flex items-center gap-2">
            <ColorPickerInput
              value={colors.surface || defaults.surface}
              onChange={(v) => updateField("surface", v)}
              className="w-6 h-6 rounded border border-zinc-700 cursor-pointer bg-transparent p-0"
            />
            <span className="text-[11px] text-zinc-400 flex-1">Superfície</span>
            <Input
              value={colors.surface || defaults.surface}
              onChange={(e) => updateField("surface", e.target.value)}
              className="w-20 h-6 text-[10px] bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 px-1.5"
            />
          </div>

          {/* Button BG */}
          <div className="flex items-center gap-2">
            <ColorPickerInput
              value={colors.buttonBg || defaults.buttonBg}
              onChange={(v) => updateField("buttonBg", v)}
              className="w-6 h-6 rounded border border-zinc-700 cursor-pointer bg-transparent p-0"
            />
            <span className="text-[11px] text-zinc-400 flex-1">Botão (Fundo)</span>
            <Input
              value={colors.buttonBg || defaults.buttonBg}
              onChange={(e) => updateField("buttonBg", e.target.value)}
              className="w-20 h-6 text-[10px] bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 px-1.5"
            />
          </div>

          {/* Button FG */}
          <div className="flex items-center gap-2">
            <ColorPickerInput
              value={colors.buttonFg || defaults.buttonFg}
              onChange={(v) => updateField("buttonFg", v)}
              className="w-6 h-6 rounded border border-zinc-700 cursor-pointer bg-transparent p-0"
            />
            <span className="text-[11px] text-zinc-400 flex-1">Botão (Texto)</span>
            <Input
              value={colors.buttonFg || defaults.buttonFg}
              onChange={(e) => updateField("buttonFg", e.target.value)}
              className="w-20 h-6 text-[10px] bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600 px-1.5"
            />
          </div>

          {/* Reset to global */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ enabled: true })}
            className="w-full text-[10px] h-6 text-zinc-500 hover:text-zinc-300"
          >
            Resetar para cores globais
          </Button>
        </div>
      )}
    </div>
  );
}


// ============================================
// WHATSAPP POPUP SECTION
// ============================================

function WhatsAppPopupSection({
  data,
  onChange,
}: {
  data: NonNullable<LandingDesign["whatsapp"]>;
  onChange: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <SubPanel id="whatsapp-texts" title="Textos do Popup" icon={<MessageCircle className="w-4 h-4" />} defaultOpen>
        <div className="space-y-3">
          <div>
            <Label className="text-[11px] text-zinc-400 mb-1 block">
              Título / Boas-vindas
            </Label>
            <Input
              value={data.popupTitle || ""}
              onChange={(e) => onChange("popupTitle", e.target.value)}
              placeholder="Olá! Como podemos ajudar?"
              className="h-8 text-xs bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600"
            />
            <p className="text-[10px] text-zinc-600 mt-1">
              Texto de boas-vindas exibido no popup do WhatsApp
            </p>
          </div>

          <div>
            <Label className="text-[11px] text-zinc-400 mb-1 block">
              Texto do Botão
            </Label>
            <Input
              value={data.buttonText || ""}
              onChange={(e) => onChange("buttonText", e.target.value)}
              placeholder="Iniciar Conversa"
              className="h-8 text-xs bg-zinc-900/60 border-zinc-700/50 focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 placeholder:text-zinc-600"
            />
            <p className="text-[10px] text-zinc-600 mt-1">
              Texto exibido no botão de ação do popup
            </p>
          </div>
        </div>
      </SubPanel>

      <SubPanel id="whatsapp-preview" title="Preview" icon={<MessageCircle className="w-4 h-4" />}>
        <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/50">
          <div className="bg-zinc-800/80 rounded-2xl p-6 text-center max-w-[280px] mx-auto">
            <div className="w-14 h-14 rounded-full bg-zinc-700 mx-auto mb-3 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[#25D366]" />
            </div>
            <p className="text-white text-sm font-medium mb-1">
              {data.popupTitle || "Olá! Como podemos ajudar?"}
            </p>
            <p className="text-zinc-500 text-[10px] mb-4">
              Você será redirecionado para o WhatsApp
            </p>
            <div className="bg-[#25D366] text-white rounded-xl py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {data.buttonText || "Iniciar Conversa"}
            </div>
          </div>
        </div>
      </SubPanel>
    </div>
  );
}
