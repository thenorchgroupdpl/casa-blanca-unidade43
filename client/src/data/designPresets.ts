/**
 * Design System Presets — Casa Blanca
 *
 * Each preset fills 100% of the LandingDesign + ThemeColors variables.
 * No field is left undefined. Presets are applied atomically.
 */

// Re-declare types locally to avoid circular imports from Design.tsx
// These mirror the types in Design.tsx exactly.

type SectionColors = {
  enabled?: boolean;
  background?: string;
  text?: string;
  textMuted?: string;
  highlight?: string;
  surface?: string;
  border?: string;
  buttonBg?: string;
  buttonFg?: string;
};

type LandingDesign = {
  home?: {
    logoUrl?: string;
    logoType?: "image" | "text";
    companyName?: string;
    logoSize?: number;
    headerBgColor?: string;
    locationBoxBg?: string;
    locationBoxText?: string;
    locationBoxIcon?: string;
    locationLabel?: string;
    locationBoxGlassmorphism?: boolean;
    scheduleBoxBg?: string;
    scheduleBoxText?: string;
    scheduleBoxIcon?: string;
    scheduleLabel?: string;
    scheduleBoxGlassmorphism?: boolean;
    badgeOpenColor?: string;
    badgeClosedColor?: string;
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
    ctaText?: string;
    ctaBgColor?: string;
    ctaTextColor?: string;
    ctaGradient?: boolean;
    ctaGradientEnd?: string;
    ctaAction?: string;
    bgMediaUrl?: string;
    bgMediaType?: "image" | "video";
    bgOverlayOpacity?: number;
    bgOverlayColor?: string;
    bgFallbackColor?: string;
    headerBehavior?: "always_visible" | "reveal_on_scroll";
  };
  products?: {
    headline?: string;
    subheadline?: string;
    maxCategories?: number;
    offersCategoryId?: number | null;
    headlineFont?: string;
    headlineFontSize?: number;
    headlineFontWeight?: string;
    headlineColor?: string;
    subheadlineFont?: string;
    subheadlineFontSize?: number;
    subheadlineFontWeight?: string;
    subheadlineColor?: string;
    cardBgColor?: string;
    cardNameColor?: string;
    cardPriceColor?: string;
    cardDescColor?: string;
    cardUnitColor?: string;
    cardBorderRadius?: number;
    cardBorderColor?: string;
    cardBorderWidth?: number;
    cardButtonText?: string;
    cardButtonBgColor?: string;
    cardButtonTextColor?: string;
    bgColor?: string;
    bgGradient?: boolean;
    bgGradientFrom?: string;
    bgGradientTo?: string;
    bgGradientDirection?: string;
    bgMediaUrl?: string;
    bgMediaType?: "image" | "video";
    bgOverlayOpacity?: number;
    bgOverlayColor?: string;
    viewAllBgColor?: string;
    viewAllTextColor?: string;
    viewAllFont?: string;
    viewAllFontSize?: number;
    viewAllFontWeight?: string;
    viewAllLabel?: string;
    ctaText?: string;
    ctaBgColor?: string;
    ctaTextColor?: string;
    ctaGradient?: boolean;
    ctaGradientEnd?: string;
    ctaFont?: string;
    ctaFontSize?: number;
    ctaFontWeight?: string;
    ctaAction?: string;
  };
  about?: {
    preHeadline?: string;
    preHeadlineFont?: string;
    preHeadlineFontSize?: number;
    preHeadlineFontWeight?: string;
    preHeadlineColor?: string;
    headline?: string;
    headlineFont?: string;
    headlineFontSize?: number;
    headlineFontWeight?: string;
    headlineColor?: string;
    imageUrl?: string;
    imageRadius?: number;
    ownerName?: string;
    ownerNameFont?: string;
    ownerNameFontSize?: number;
    ownerNameFontWeight?: string;
    ownerNameColor?: string;
    ownerTitle?: string;
    ownerTitleColor?: string;
    storytelling?: string;
    storytellingFont?: string;
    storytellingFontSize?: number;
    storytellingFontWeight?: string;
    storytellingColor?: string;
    signatureText?: string;
    signatureColor?: string;
    showSignature?: boolean;
    bgMediaUrl?: string;
    bgMediaType?: "image" | "video";
    bgOverlayOpacity?: number;
    bgOverlayColor?: string;
    bgFallbackColor?: string;
    imagePosition?: "left" | "right";
    showDecorative?: boolean;
    textColor?: string;
  };
  menu?: {
    menuSectionTitle?: string;
    panelBgColor?: string;
    panelOverlayOpacity?: number;
    panelOverlayColor?: string;
    headerTextColor?: string;
    searchBorderColor?: string;
    searchBgColor?: string;
    searchTextColor?: string;
    searchPlaceholderColor?: string;
    searchIconColor?: string;
    categoryNameColor?: string;
    filterActiveBgColor?: string;
    filterActiveTextColor?: string;
    filterInactiveBgColor?: string;
    filterInactiveTextColor?: string;
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
    cardButtonText?: string;
    cardButtonBgColor?: string;
    cardButtonTextColor?: string;
    modalBgColor?: string;
    modalNameColor?: string;
    modalUnitColor?: string;
    modalPriceColor?: string;
    modalDescColor?: string;
    modalCtaBgColor?: string;
    modalCtaTextColor?: string;
    modalCtaFont?: string;
    modalCtaFontSize?: number;
    modalCtaFontWeight?: string;
    qtyLabelColor?: string;
    qtyBtnBgColor?: string;
    qtyBtnTextColor?: string;
    qtyNumberColor?: string;
  };
  toast?: {
    bgColor?: string;
    borderColor?: string;
    titleColor?: string;
    subtitleColor?: string;
    iconCheckColor?: string;
    iconBgColor?: string;
    closeButtonColor?: string;
  };
  cartLanding?: {
    modalBgColor?: string;
    headerTextColor?: string;
    headerCloseColor?: string;
    headerIconColor?: string;
    itemBgColor?: string;
    itemBorderColor?: string;
    itemNameColor?: string;
    itemPriceColor?: string;
    itemTrashColor?: string;
    qtyBtnBgColor?: string;
    qtyBtnTextColor?: string;
    qtyNumberColor?: string;
    obsBgColor?: string;
    obsBorderColor?: string;
    obsTextColor?: string;
    totalLabelColor?: string;
    totalValueColor?: string;
    ctaBgColor?: string;
    ctaTextColor?: string;
    clearLinkColor?: string;
  };
  cartMenu?: {
    modalBgColor?: string;
    headerTextColor?: string;
    headerCloseColor?: string;
    itemBgColor?: string;
    itemBorderColor?: string;
    itemNameColor?: string;
    itemPriceColor?: string;
    itemTrashColor?: string;
    qtyBtnBgColor?: string;
    qtyBtnTextColor?: string;
    qtyNumberColor?: string;
    obsBgColor?: string;
    obsBorderColor?: string;
    obsTextColor?: string;
    totalLabelColor?: string;
    totalValueColor?: string;
    ctaBgColor?: string;
    ctaTextColor?: string;
    clearLinkColor?: string;
    headerIconColor?: string;
  };
  reviews?: {
    headline?: string;
    isVisible?: boolean;
    starColor?: string;
    label?: string;
    labelFont?: string;
    labelFontSize?: number;
    labelFontWeight?: string;
    labelColor?: string;
    headlineFont?: string;
    headlineFontSize?: number;
    headlineFontWeight?: string;
    headlineColor?: string;
    ratingNumberColor?: string;
    ratingTotalColor?: string;
    cardBgColor?: string;
    cardNameColor?: string;
    cardDateColor?: string;
    cardTextColor?: string;
    ctaBgColor?: string;
    ctaTextColor?: string;
    ctaFont?: string;
    ctaFontSize?: number;
    ctaFontWeight?: string;
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
    headline1?: string;
    subheadline1?: string;
    headline2?: string;
    subheadline2?: string;
    ctaText?: string;
    mapImageUrl?: string;
    mapOverlayOpacity?: number;
    mapPinColor?: string;
    mapBtnBgColor?: string;
    mapBtnTextColor?: string;
    mapBtnFont?: string;
    mapBtnFontSize?: number;
    mapBtnFontWeight?: string;
    mapBtnLabel?: string;
    mapUrl?: string;
    addressIconColor?: string;
    addressIconBgColor?: string;
    addressText?: string;
    addressTitleColor?: string;
    addressTextColor?: string;
    addressFont?: string;
    addressFontSize?: number;
    addressFontWeight?: string;
    phoneIconColor?: string;
    phoneIconBgColor?: string;
    phoneText?: string;
    phoneTitleColor?: string;
    phoneTextColor?: string;
    phoneFont?: string;
    phoneFontSize?: number;
    phoneFontWeight?: string;
    hoursIconColor?: string;
    hoursIconBgColor?: string;
    hoursTitleColor?: string;
    hoursContentColor?: string;
    hoursLinkColor?: string;
    hoursLinkFont?: string;
    hoursLinkFontSize?: number;
    hoursLinkFontWeight?: string;
    hoursLinkUrl?: string;
    scheduleModalBg?: string;
    scheduleModalTitleColor?: string;
    scheduleModalTextColor?: string;
    scheduleModalStatusColor?: string;
    scheduleModalHighlightBg?: string;
    socialBtnBgColor?: string;
    socialIconColor?: string;
    socialBtnTextColor?: string;
    socialBtnLabel?: string;
    socialBtnLinkUrl?: string;
    socialBtnBtnBgColor?: string;
    socialBtnBtnTextColor?: string;
    socialBtnShowText?: boolean;
    socialInstagramUrl?: string;
    socialInstagramEnabled?: boolean;
    socialFacebookUrl?: string;
    socialFacebookEnabled?: boolean;
    socialYoutubeUrl?: string;
    socialYoutubeEnabled?: boolean;
    sectionBgColor?: string;
    cardsBgColor?: string;
    bgMediaUrl?: string;
    bgMediaType?: "image" | "video";
    bgOverlayOpacity?: number;
    bgOverlayColor?: string;
    footerBgColor?: string;
    footerTextColor?: string;
    footerCopyrightText?: string;
    footerHeadlineText?: string;
    footerSubheadlineText?: string;
    footerCtaText?: string;
    footerCtaBg?: string;
    footerCtaTextColor?: string;
    footerShowLogo?: boolean;
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
    popupBg?: string;
    popupTextColor?: string;
    buttonBg?: string;
    buttonTextColor?: string;
  };
};

type ThemeColors = {
  primary: string;
  background: string;
  foreground: string;
  accent: string;
  muted: string;
  buttonPrimary: string;
  highlight: string;
  success: string;
};

// ============================================
// CUSTOM PRESET INTERFACE (Future Feature)
// ============================================

// TODO: implementar UI de custom presets
export interface CustomPreset {
  id: string;
  name: string;
  description: string;
  niche: string;
  createdAt: number; // UTC timestamp
  createdByTenantId: number;
  design: LandingDesign;
  colors: ThemeColors;
  fontFamily: string;
  fontDisplay: string;
  borderRadius: string;
}

// ============================================
// PRESET TYPE
// ============================================

export interface DesignPreset {
  id: string;
  name: string;
  description: string;
  niche: string;
  colors: {
    primary: string;   // Circle 1
    background: string; // Circle 2
    accent: string;     // Circle 3
  };
  themeColors: ThemeColors;
  fontFamily: string;
  fontDisplay: string;
  borderRadius: string;
  design: LandingDesign;
}

// ============================================
// PRESET 1 — WARM LUXURY (Dark Gold)
// ============================================

const warmLuxury: DesignPreset = {
  id: "warm-luxury",
  name: "Warm Luxury",
  description: "Dark mode com tons dourados. Sofisticação gastronômica.",
  niche: "Hamburguerias premium, restaurantes, bares",
  colors: { primary: "#D4AF37", background: "#0a0a0a", accent: "#1a1a1a" },
  themeColors: {
    primary: "#D4AF37",
    background: "#0a0a0a",
    foreground: "#ffffff",
    accent: "#1a1a1a",
    muted: "#a1a1aa",
    buttonPrimary: "#D4AF37",
    highlight: "#D4AF37",
    success: "#22c55e",
  },
  fontFamily: "DM Sans",
  fontDisplay: "DM Serif Display",
  borderRadius: "0.75rem",
  design: {
    home: {
      logoType: "text",
      logoSize: 80,
      headerBgColor: "rgba(0,0,0,0.3)",
      headerBehavior: "always_visible",
      locationBoxBg: "rgba(255,255,255,0.1)",
      locationBoxText: "#a1a1aa",
      locationBoxIcon: "#D4AF37",
      locationLabel: "",
      locationBoxGlassmorphism: true,
      scheduleBoxBg: "rgba(34,197,94,0.15)",
      scheduleBoxText: "#22c55e",
      scheduleBoxIcon: "#22c55e",
      scheduleLabel: "",
      scheduleBoxGlassmorphism: true,
      badgeOpenColor: "#22c55e",
      badgeClosedColor: "#ef4444",
      headline: "Gastronomia de Alta Performance",
      headlineFont: "DM Serif Display",
      headlineFontSize: 64,
      headlineFontWeight: "700",
      headlineColor: "#ffffff",
      subheadline: "Experiência única em cada prato",
      subheadlineFont: "DM Sans",
      subheadlineFontSize: 20,
      subheadlineFontWeight: "400",
      subheadlineColor: "#a1a1aa",
      ctaText: "Fazer Pedido",
      ctaBgColor: "#D4AF37",
      ctaTextColor: "#1a1a1a",
      ctaGradient: false,
      ctaGradientEnd: "#B8962E",
      ctaAction: "#cardapio",
      bgMediaType: "image",
      bgOverlayOpacity: 50,
      bgOverlayColor: "#000000",
      bgFallbackColor: "#1a1a1a",
    },
    products: {
      headline: "Nosso Cardápio",
      subheadline: "Escolha seus favoritos",
      maxCategories: 3,
      offersCategoryId: null,
      headlineFont: "DM Serif Display",
      headlineFontSize: 40,
      headlineFontWeight: "700",
      headlineColor: "#ffffff",
      subheadlineFont: "DM Sans",
      subheadlineFontSize: 18,
      subheadlineFontWeight: "400",
      subheadlineColor: "#a1a1aa",
      cardBgColor: "#1a1a1a",
      cardNameColor: "#ffffff",
      cardPriceColor: "#D4AF37",
      cardDescColor: "#a1a1aa",
      cardUnitColor: "#71717a",
      cardBorderRadius: 12,
      cardBorderColor: "#27272a",
      cardBorderWidth: 1,
      cardButtonText: "Adicionar",
      cardButtonBgColor: "#D4AF37",
      cardButtonTextColor: "#1a1a1a",
      bgColor: "#0a0a0a",
      bgGradient: false,
      bgGradientFrom: "#0a0a0a",
      bgGradientTo: "#1a1a1a",
      bgGradientDirection: "to-b",
      bgOverlayOpacity: 0,
      bgOverlayColor: "#000000",
      viewAllBgColor: "transparent",
      viewAllTextColor: "#D4AF37",
      viewAllFont: "DM Sans",
      viewAllFontSize: 14,
      viewAllFontWeight: "600",
      viewAllLabel: "Ver todas",
      ctaText: "Ver Cardápio Completo",
      ctaBgColor: "#D4AF37",
      ctaTextColor: "#1a1a1a",
      ctaGradient: false,
      ctaGradientEnd: "#B8962E",
      ctaFont: "DM Sans",
      ctaFontSize: 16,
      ctaFontWeight: "600",
      ctaAction: "#cardapio",
    },
    about: {
      preHeadline: "CONHEÇA NOSSA HISTÓRIA",
      preHeadlineFont: "DM Sans",
      preHeadlineFontSize: 14,
      preHeadlineFontWeight: "500",
      preHeadlineColor: "#D4AF37",
      headline: "Sobre Nós",
      headlineFont: "DM Serif Display",
      headlineFontSize: 48,
      headlineFontWeight: "700",
      headlineColor: "#ffffff",
      imageRadius: 16,
      ownerNameFont: "DM Serif Display",
      ownerNameFontSize: 20,
      ownerNameFontWeight: "700",
      ownerNameColor: "#ffffff",
      ownerTitleColor: "#a1a1aa",
      storytellingFont: "DM Sans",
      storytellingFontSize: 18,
      storytellingFontWeight: "400",
      storytellingColor: "#d4d4d8",
      signatureColor: "#D4AF37",
      showSignature: true,
      bgOverlayOpacity: 0,
      bgOverlayColor: "#000000",
      bgFallbackColor: "#0a0a0a",
      imagePosition: "left",
      showDecorative: true,
      textColor: "#ffffff",
    },
    menu: {
      menuSectionTitle: "Cardápio",
      panelBgColor: "#0a0a0a",
      panelOverlayOpacity: 80,
      panelOverlayColor: "#000000",
      headerTextColor: "#ffffff",
      searchBorderColor: "#27272a",
      searchBgColor: "#1a1a1a",
      searchTextColor: "#ffffff",
      searchPlaceholderColor: "#71717a",
      searchIconColor: "#71717a",
      categoryNameColor: "#D4AF37",
      filterActiveBgColor: "#D4AF37",
      filterActiveTextColor: "#1a1a1a",
      filterInactiveBgColor: "#27272a",
      filterInactiveTextColor: "#a1a1aa",
      cardBgColor: "#1a1a1a",
      cardBorderColor: "#27272a",
      cardBorderWidth: 1,
      cardBorderRadius: 12,
      cardNameColor: "#ffffff",
      cardPriceColor: "#D4AF37",
      cardDescColor: "#a1a1aa",
      cardFont: "DM Sans",
      cardFontSize: 14,
      cardFontWeight: "400",
      cardButtonText: "Adicionar",
      cardButtonBgColor: "#D4AF37",
      cardButtonTextColor: "#1a1a1a",
      modalBgColor: "#1a1a1a",
      modalNameColor: "#ffffff",
      modalUnitColor: "#71717a",
      modalPriceColor: "#D4AF37",
      modalDescColor: "#a1a1aa",
      modalCtaBgColor: "#D4AF37",
      modalCtaTextColor: "#1a1a1a",
      modalCtaFont: "DM Sans",
      modalCtaFontSize: 16,
      modalCtaFontWeight: "600",
      qtyLabelColor: "#a1a1aa",
      qtyBtnBgColor: "#27272a",
      qtyBtnTextColor: "#ffffff",
      qtyNumberColor: "#ffffff",
    },
    toast: {
      bgColor: "#1a1a1a",
      borderColor: "#D4AF37",
      titleColor: "#ffffff",
      subtitleColor: "#a1a1aa",
      iconCheckColor: "#ffffff",
      iconBgColor: "#D4AF37",
      closeButtonColor: "#71717a",
    },
    cartLanding: {
      modalBgColor: "#0a0a0a",
      headerTextColor: "#ffffff",
      headerCloseColor: "#71717a",
      headerIconColor: "#D4AF37",
      itemBgColor: "#1a1a1a",
      itemBorderColor: "#27272a",
      itemNameColor: "#ffffff",
      itemPriceColor: "#D4AF37",
      itemTrashColor: "#ef4444",
      qtyBtnBgColor: "#27272a",
      qtyBtnTextColor: "#ffffff",
      qtyNumberColor: "#ffffff",
      obsBgColor: "#1a1a1a",
      obsBorderColor: "#27272a",
      obsTextColor: "#a1a1aa",
      totalLabelColor: "#a1a1aa",
      totalValueColor: "#D4AF37",
      ctaBgColor: "#D4AF37",
      ctaTextColor: "#1a1a1a",
      clearLinkColor: "#ef4444",
    },
    cartMenu: {
      modalBgColor: "#0a0a0a",
      headerTextColor: "#ffffff",
      headerCloseColor: "#71717a",
      headerIconColor: "#D4AF37",
      itemBgColor: "#1a1a1a",
      itemBorderColor: "#27272a",
      itemNameColor: "#ffffff",
      itemPriceColor: "#D4AF37",
      itemTrashColor: "#ef4444",
      qtyBtnBgColor: "#27272a",
      qtyBtnTextColor: "#ffffff",
      qtyNumberColor: "#ffffff",
      obsBgColor: "#1a1a1a",
      obsBorderColor: "#27272a",
      obsTextColor: "#a1a1aa",
      totalLabelColor: "#a1a1aa",
      totalValueColor: "#D4AF37",
      ctaBgColor: "#D4AF37",
      ctaTextColor: "#1a1a1a",
      clearLinkColor: "#ef4444",
    },
    reviews: {
      headline: "O que dizem nossos clientes",
      isVisible: true,
      starColor: "#D4AF37",
      label: "AVALIAÇÕES",
      labelFont: "DM Sans",
      labelFontSize: 14,
      labelFontWeight: "500",
      labelColor: "#D4AF37",
      headlineFont: "DM Serif Display",
      headlineFontSize: 40,
      headlineFontWeight: "700",
      headlineColor: "#ffffff",
      ratingNumberColor: "#ffffff",
      ratingTotalColor: "#71717a",
      cardBgColor: "#1a1a1a",
      cardNameColor: "#ffffff",
      cardDateColor: "#71717a",
      cardTextColor: "#d4d4d8",
      ctaBgColor: "#D4AF37",
      ctaTextColor: "#1a1a1a",
      ctaFont: "DM Sans",
      ctaFontSize: 14,
      ctaFontWeight: "600",
      bgColor: "#0a0a0a",
      bgOverlayOpacity: 0,
      bgOverlayColor: "#000000",
    },
    feedbacks: { starColor: "#D4AF37" },
    info: {
      label: "LOCALIZAÇÃO",
      labelFont: "DM Sans",
      labelFontSize: 14,
      labelFontWeight: "500",
      labelColor: "#D4AF37",
      headline: "Venha nos visitar",
      headlineFont: "DM Serif Display",
      headlineFontSize: 40,
      headlineFontWeight: "700",
      headlineColor: "#ffffff",
      subheadline: "Estamos esperando por você",
      subheadlineFont: "DM Sans",
      subheadlineFontSize: 18,
      subheadlineFontWeight: "400",
      subheadlineColor: "#a1a1aa",
      headline1: "Venha nos visitar",
      subheadline1: "Estamos esperando por você",
      ctaText: "Como Chegar",
      mapOverlayOpacity: 40,
      mapPinColor: "#D4AF37",
      mapBtnBgColor: "#D4AF37",
      mapBtnTextColor: "#1a1a1a",
      mapBtnFont: "DM Sans",
      mapBtnFontSize: 14,
      mapBtnFontWeight: "600",
      mapBtnLabel: "Como Chegar",
      addressIconColor: "#D4AF37",
      addressIconBgColor: "#27272a",
      addressTitleColor: "#ffffff",
      addressTextColor: "#a1a1aa",
      addressFont: "DM Sans",
      addressFontSize: 14,
      addressFontWeight: "400",
      phoneIconColor: "#D4AF37",
      phoneIconBgColor: "#27272a",
      phoneTitleColor: "#ffffff",
      phoneTextColor: "#a1a1aa",
      phoneFont: "DM Sans",
      phoneFontSize: 14,
      phoneFontWeight: "400",
      hoursIconColor: "#D4AF37",
      hoursIconBgColor: "#27272a",
      hoursTitleColor: "#ffffff",
      hoursContentColor: "#a1a1aa",
      hoursLinkColor: "#D4AF37",
      hoursLinkFont: "DM Sans",
      hoursLinkFontSize: 14,
      hoursLinkFontWeight: "500",
      scheduleModalBg: "#1a1a1a",
      scheduleModalTitleColor: "#ffffff",
      scheduleModalTextColor: "#a1a1aa",
      scheduleModalStatusColor: "#22c55e",
      scheduleModalHighlightBg: "#27272a",
      socialBtnBgColor: "#27272a",
      socialIconColor: "#D4AF37",
      socialBtnTextColor: "#a1a1aa",
      socialBtnShowText: false,
      socialInstagramEnabled: true,
      socialFacebookEnabled: true,
      socialYoutubeEnabled: false,
      sectionBgColor: "#0a0a0a",
      cardsBgColor: "#1a1a1a",
      bgOverlayOpacity: 0,
      bgOverlayColor: "#000000",
      footerBgColor: "#050505",
      footerTextColor: "#71717a",
      footerCtaBg: "#D4AF37",
      footerCtaTextColor: "#1a1a1a",
      footerShowLogo: true,
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
      popupBg: "#1a1a1a",
      popupTextColor: "#ffffff",
      buttonBg: "#D4AF37",
      buttonTextColor: "#1a1a1a",
    },
  },
};

// ============================================
// PRESET 2 — BISTRÔ MODERNO (Light Clean)
// ============================================

const bistroModerno: DesignPreset = {
  id: "bistro-moderno",
  name: "Bistrô Moderno",
  description: "Light mode limpo e moderno. Frescor e modernidade.",
  niche: "Cafeterias, brunch, culinária saudável",
  colors: { primary: "#4A7C59", background: "#FFFFFF", accent: "#F5F5F0" },
  themeColors: {
    primary: "#4A7C59",
    background: "#FFFFFF",
    foreground: "#1a1a1a",
    accent: "#F5F5F0",
    muted: "#6b7280",
    buttonPrimary: "#4A7C59",
    highlight: "#4A7C59",
    success: "#22c55e",
  },
  fontFamily: "Inter",
  fontDisplay: "Playfair Display",
  borderRadius: "0.5rem",
  design: {
    home: {
      logoType: "text",
      logoSize: 80,
      headerBgColor: "rgba(255,255,255,0.9)",
      headerBehavior: "reveal_on_scroll",
      locationBoxBg: "rgba(0,0,0,0.05)",
      locationBoxText: "#6b7280",
      locationBoxIcon: "#4A7C59",
      locationLabel: "",
      locationBoxGlassmorphism: false,
      scheduleBoxBg: "rgba(74,124,89,0.1)",
      scheduleBoxText: "#4A7C59",
      scheduleBoxIcon: "#4A7C59",
      scheduleLabel: "",
      scheduleBoxGlassmorphism: false,
      badgeOpenColor: "#4A7C59",
      badgeClosedColor: "#ef4444",
      headline: "Sabores que Inspiram",
      headlineFont: "Playfair Display",
      headlineFontSize: 60,
      headlineFontWeight: "700",
      headlineColor: "#1a1a1a",
      subheadline: "Ingredientes frescos, receitas com alma",
      subheadlineFont: "Inter",
      subheadlineFontSize: 20,
      subheadlineFontWeight: "400",
      subheadlineColor: "#6b7280",
      ctaText: "Ver Cardápio",
      ctaBgColor: "#4A7C59",
      ctaTextColor: "#ffffff",
      ctaGradient: false,
      ctaGradientEnd: "#3D6B4C",
      ctaAction: "#cardapio",
      bgMediaType: "image",
      bgOverlayOpacity: 20,
      bgOverlayColor: "#ffffff",
      bgFallbackColor: "#F5F5F0",
    },
    products: {
      headline: "Nosso Menu",
      subheadline: "Feito com carinho, servido com amor",
      maxCategories: 3,
      offersCategoryId: null,
      headlineFont: "Playfair Display",
      headlineFontSize: 40,
      headlineFontWeight: "700",
      headlineColor: "#1a1a1a",
      subheadlineFont: "Inter",
      subheadlineFontSize: 18,
      subheadlineFontWeight: "400",
      subheadlineColor: "#6b7280",
      cardBgColor: "#ffffff",
      cardNameColor: "#1a1a1a",
      cardPriceColor: "#4A7C59",
      cardDescColor: "#6b7280",
      cardUnitColor: "#9ca3af",
      cardBorderRadius: 8,
      cardBorderColor: "#e5e7eb",
      cardBorderWidth: 1,
      cardButtonText: "Adicionar",
      cardButtonBgColor: "#4A7C59",
      cardButtonTextColor: "#ffffff",
      bgColor: "#F5F5F0",
      bgGradient: false,
      bgGradientFrom: "#F5F5F0",
      bgGradientTo: "#ffffff",
      bgGradientDirection: "to-b",
      bgOverlayOpacity: 0,
      bgOverlayColor: "#ffffff",
      viewAllBgColor: "transparent",
      viewAllTextColor: "#4A7C59",
      viewAllFont: "Inter",
      viewAllFontSize: 14,
      viewAllFontWeight: "600",
      viewAllLabel: "Ver todas",
      ctaText: "Ver Cardápio Completo",
      ctaBgColor: "#4A7C59",
      ctaTextColor: "#ffffff",
      ctaGradient: false,
      ctaGradientEnd: "#3D6B4C",
      ctaFont: "Inter",
      ctaFontSize: 16,
      ctaFontWeight: "600",
      ctaAction: "#cardapio",
    },
    about: {
      preHeadline: "NOSSA HISTÓRIA",
      preHeadlineFont: "Inter",
      preHeadlineFontSize: 14,
      preHeadlineFontWeight: "500",
      preHeadlineColor: "#4A7C59",
      headline: "Sobre Nós",
      headlineFont: "Playfair Display",
      headlineFontSize: 48,
      headlineFontWeight: "700",
      headlineColor: "#1a1a1a",
      imageRadius: 12,
      ownerNameFont: "Playfair Display",
      ownerNameFontSize: 20,
      ownerNameFontWeight: "700",
      ownerNameColor: "#1a1a1a",
      ownerTitleColor: "#6b7280",
      storytellingFont: "Inter",
      storytellingFontSize: 18,
      storytellingFontWeight: "400",
      storytellingColor: "#4b5563",
      signatureColor: "#4A7C59",
      showSignature: true,
      bgOverlayOpacity: 0,
      bgOverlayColor: "#ffffff",
      bgFallbackColor: "#ffffff",
      imagePosition: "right",
      showDecorative: false,
      textColor: "#1a1a1a",
    },
    menu: {
      menuSectionTitle: "Cardápio",
      panelBgColor: "#ffffff",
      panelOverlayOpacity: 60,
      panelOverlayColor: "#000000",
      headerTextColor: "#1a1a1a",
      searchBorderColor: "#e5e7eb",
      searchBgColor: "#F5F5F0",
      searchTextColor: "#1a1a1a",
      searchPlaceholderColor: "#9ca3af",
      searchIconColor: "#9ca3af",
      categoryNameColor: "#4A7C59",
      filterActiveBgColor: "#4A7C59",
      filterActiveTextColor: "#ffffff",
      filterInactiveBgColor: "#F5F5F0",
      filterInactiveTextColor: "#6b7280",
      cardBgColor: "#ffffff",
      cardBorderColor: "#e5e7eb",
      cardBorderWidth: 1,
      cardBorderRadius: 8,
      cardNameColor: "#1a1a1a",
      cardPriceColor: "#4A7C59",
      cardDescColor: "#6b7280",
      cardFont: "Inter",
      cardFontSize: 14,
      cardFontWeight: "400",
      cardButtonText: "Adicionar",
      cardButtonBgColor: "#4A7C59",
      cardButtonTextColor: "#ffffff",
      modalBgColor: "#ffffff",
      modalNameColor: "#1a1a1a",
      modalUnitColor: "#9ca3af",
      modalPriceColor: "#4A7C59",
      modalDescColor: "#6b7280",
      modalCtaBgColor: "#4A7C59",
      modalCtaTextColor: "#ffffff",
      modalCtaFont: "Inter",
      modalCtaFontSize: 16,
      modalCtaFontWeight: "600",
      qtyLabelColor: "#6b7280",
      qtyBtnBgColor: "#F5F5F0",
      qtyBtnTextColor: "#1a1a1a",
      qtyNumberColor: "#1a1a1a",
    },
    toast: {
      bgColor: "#ffffff",
      borderColor: "#4A7C59",
      titleColor: "#1a1a1a",
      subtitleColor: "#6b7280",
      iconCheckColor: "#ffffff",
      iconBgColor: "#4A7C59",
      closeButtonColor: "#9ca3af",
    },
    cartLanding: {
      modalBgColor: "#ffffff",
      headerTextColor: "#1a1a1a",
      headerCloseColor: "#9ca3af",
      headerIconColor: "#4A7C59",
      itemBgColor: "#F5F5F0",
      itemBorderColor: "#e5e7eb",
      itemNameColor: "#1a1a1a",
      itemPriceColor: "#4A7C59",
      itemTrashColor: "#ef4444",
      qtyBtnBgColor: "#e5e7eb",
      qtyBtnTextColor: "#1a1a1a",
      qtyNumberColor: "#1a1a1a",
      obsBgColor: "#F5F5F0",
      obsBorderColor: "#e5e7eb",
      obsTextColor: "#6b7280",
      totalLabelColor: "#6b7280",
      totalValueColor: "#4A7C59",
      ctaBgColor: "#4A7C59",
      ctaTextColor: "#ffffff",
      clearLinkColor: "#ef4444",
    },
    cartMenu: {
      modalBgColor: "#ffffff",
      headerTextColor: "#1a1a1a",
      headerCloseColor: "#9ca3af",
      headerIconColor: "#4A7C59",
      itemBgColor: "#F5F5F0",
      itemBorderColor: "#e5e7eb",
      itemNameColor: "#1a1a1a",
      itemPriceColor: "#4A7C59",
      itemTrashColor: "#ef4444",
      qtyBtnBgColor: "#e5e7eb",
      qtyBtnTextColor: "#1a1a1a",
      qtyNumberColor: "#1a1a1a",
      obsBgColor: "#F5F5F0",
      obsBorderColor: "#e5e7eb",
      obsTextColor: "#6b7280",
      totalLabelColor: "#6b7280",
      totalValueColor: "#4A7C59",
      ctaBgColor: "#4A7C59",
      ctaTextColor: "#ffffff",
      clearLinkColor: "#ef4444",
    },
    reviews: {
      headline: "O que dizem nossos clientes",
      isVisible: true,
      starColor: "#4A7C59",
      label: "AVALIAÇÕES",
      labelFont: "Inter",
      labelFontSize: 14,
      labelFontWeight: "500",
      labelColor: "#4A7C59",
      headlineFont: "Playfair Display",
      headlineFontSize: 40,
      headlineFontWeight: "700",
      headlineColor: "#1a1a1a",
      ratingNumberColor: "#1a1a1a",
      ratingTotalColor: "#9ca3af",
      cardBgColor: "#F5F5F0",
      cardNameColor: "#1a1a1a",
      cardDateColor: "#9ca3af",
      cardTextColor: "#4b5563",
      ctaBgColor: "#4A7C59",
      ctaTextColor: "#ffffff",
      ctaFont: "Inter",
      ctaFontSize: 14,
      ctaFontWeight: "600",
      bgColor: "#ffffff",
      bgOverlayOpacity: 0,
      bgOverlayColor: "#ffffff",
    },
    feedbacks: { starColor: "#4A7C59" },
    info: {
      label: "LOCALIZAÇÃO",
      labelFont: "Inter",
      labelFontSize: 14,
      labelFontWeight: "500",
      labelColor: "#4A7C59",
      headline: "Venha nos visitar",
      headlineFont: "Playfair Display",
      headlineFontSize: 40,
      headlineFontWeight: "700",
      headlineColor: "#1a1a1a",
      subheadline: "Estamos esperando por você",
      subheadlineFont: "Inter",
      subheadlineFontSize: 18,
      subheadlineFontWeight: "400",
      subheadlineColor: "#6b7280",
      headline1: "Venha nos visitar",
      subheadline1: "Estamos esperando por você",
      ctaText: "Como Chegar",
      mapOverlayOpacity: 20,
      mapPinColor: "#4A7C59",
      mapBtnBgColor: "#4A7C59",
      mapBtnTextColor: "#ffffff",
      mapBtnFont: "Inter",
      mapBtnFontSize: 14,
      mapBtnFontWeight: "600",
      mapBtnLabel: "Como Chegar",
      addressIconColor: "#4A7C59",
      addressIconBgColor: "#F5F5F0",
      addressTitleColor: "#1a1a1a",
      addressTextColor: "#6b7280",
      addressFont: "Inter",
      addressFontSize: 14,
      addressFontWeight: "400",
      phoneIconColor: "#4A7C59",
      phoneIconBgColor: "#F5F5F0",
      phoneTitleColor: "#1a1a1a",
      phoneTextColor: "#6b7280",
      phoneFont: "Inter",
      phoneFontSize: 14,
      phoneFontWeight: "400",
      hoursIconColor: "#4A7C59",
      hoursIconBgColor: "#F5F5F0",
      hoursTitleColor: "#1a1a1a",
      hoursContentColor: "#6b7280",
      hoursLinkColor: "#4A7C59",
      hoursLinkFont: "Inter",
      hoursLinkFontSize: 14,
      hoursLinkFontWeight: "500",
      scheduleModalBg: "#ffffff",
      scheduleModalTitleColor: "#1a1a1a",
      scheduleModalTextColor: "#6b7280",
      scheduleModalStatusColor: "#4A7C59",
      scheduleModalHighlightBg: "#F5F5F0",
      socialBtnBgColor: "#F5F5F0",
      socialIconColor: "#4A7C59",
      socialBtnTextColor: "#6b7280",
      socialBtnShowText: false,
      socialInstagramEnabled: true,
      socialFacebookEnabled: true,
      socialYoutubeEnabled: false,
      sectionBgColor: "#ffffff",
      cardsBgColor: "#F5F5F0",
      bgOverlayOpacity: 0,
      bgOverlayColor: "#ffffff",
      footerBgColor: "#F5F5F0",
      footerTextColor: "#9ca3af",
      footerCtaBg: "#4A7C59",
      footerCtaTextColor: "#ffffff",
      footerShowLogo: true,
      showMap: true,
      showAddress: true,
      showPhone: true,
      showHours: true,
      showSocial: true,
    },
    global: { alignment: "center" },
    sectionColors: {},
    whatsapp: {
      popupTitle: "Olá! Como podemos ajudar?",
      buttonText: "Iniciar Conversa",
      popupBg: "#ffffff",
      popupTextColor: "#1a1a1a",
      buttonBg: "#4A7C59",
      buttonTextColor: "#ffffff",
    },
  },
};

// ============================================
// PRESET 3 — PIZZARIA RÚSTICA (Warm Red)
// ============================================

const pizzariaRustica: DesignPreset = {
  id: "pizzaria-rustica",
  name: "Pizzaria Rústica",
  description: "Tom quente e rústico. Tradição italiana e aconchego.",
  niche: "Pizzarias, restaurantes italianos, cantinas",
  colors: { primary: "#C0392B", background: "#FAF3E0", accent: "#3E2723" },
  themeColors: {
    primary: "#C0392B",
    background: "#FAF3E0",
    foreground: "#3E2723",
    accent: "#F5ECD7",
    muted: "#8D6E63",
    buttonPrimary: "#C0392B",
    highlight: "#C0392B",
    success: "#2E7D32",
  },
  fontFamily: "Lato",
  fontDisplay: "Merriweather",
  borderRadius: "0.5rem",
  design: {
    home: {
      logoType: "text",
      logoSize: 80,
      headerBgColor: "rgba(62,39,35,0.85)",
      headerBehavior: "always_visible",
      locationBoxBg: "rgba(62,39,35,0.3)",
      locationBoxText: "#F5ECD7",
      locationBoxIcon: "#C0392B",
      locationLabel: "",
      locationBoxGlassmorphism: false,
      scheduleBoxBg: "rgba(46,125,50,0.15)",
      scheduleBoxText: "#2E7D32",
      scheduleBoxIcon: "#2E7D32",
      scheduleLabel: "",
      scheduleBoxGlassmorphism: false,
      badgeOpenColor: "#2E7D32",
      badgeClosedColor: "#C0392B",
      headline: "A Verdadeira Pizza Artesanal",
      headlineFont: "Merriweather",
      headlineFontSize: 58,
      headlineFontWeight: "700",
      headlineColor: "#FAF3E0",
      subheadline: "Massa fresca, forno a lenha, sabor italiano",
      subheadlineFont: "Lato",
      subheadlineFontSize: 20,
      subheadlineFontWeight: "400",
      subheadlineColor: "#D7CCC8",
      ctaText: "Pedir Agora",
      ctaBgColor: "#C0392B",
      ctaTextColor: "#FAF3E0",
      ctaGradient: false,
      ctaGradientEnd: "#A93226",
      ctaAction: "#cardapio",
      bgMediaType: "image",
      bgOverlayOpacity: 55,
      bgOverlayColor: "#3E2723",
      bgFallbackColor: "#3E2723",
    },
    products: {
      headline: "Nosso Cardápio",
      subheadline: "Pizzas, massas e muito mais",
      maxCategories: 3,
      offersCategoryId: null,
      headlineFont: "Merriweather",
      headlineFontSize: 40,
      headlineFontWeight: "700",
      headlineColor: "#3E2723",
      subheadlineFont: "Lato",
      subheadlineFontSize: 18,
      subheadlineFontWeight: "400",
      subheadlineColor: "#8D6E63",
      cardBgColor: "#ffffff",
      cardNameColor: "#3E2723",
      cardPriceColor: "#C0392B",
      cardDescColor: "#8D6E63",
      cardUnitColor: "#A1887F",
      cardBorderRadius: 8,
      cardBorderColor: "#D7CCC8",
      cardBorderWidth: 1,
      cardButtonText: "Adicionar",
      cardButtonBgColor: "#C0392B",
      cardButtonTextColor: "#FAF3E0",
      bgColor: "#FAF3E0",
      bgGradient: false,
      bgGradientFrom: "#FAF3E0",
      bgGradientTo: "#F5ECD7",
      bgGradientDirection: "to-b",
      bgOverlayOpacity: 0,
      bgOverlayColor: "#FAF3E0",
      viewAllBgColor: "transparent",
      viewAllTextColor: "#C0392B",
      viewAllFont: "Lato",
      viewAllFontSize: 14,
      viewAllFontWeight: "600",
      viewAllLabel: "Ver todas",
      ctaText: "Ver Cardápio Completo",
      ctaBgColor: "#C0392B",
      ctaTextColor: "#FAF3E0",
      ctaGradient: false,
      ctaGradientEnd: "#A93226",
      ctaFont: "Lato",
      ctaFontSize: 16,
      ctaFontWeight: "600",
      ctaAction: "#cardapio",
    },
    about: {
      preHeadline: "TRADIÇÃO DESDE SEMPRE",
      preHeadlineFont: "Lato",
      preHeadlineFontSize: 14,
      preHeadlineFontWeight: "500",
      preHeadlineColor: "#C0392B",
      headline: "Nossa História",
      headlineFont: "Merriweather",
      headlineFontSize: 48,
      headlineFontWeight: "700",
      headlineColor: "#3E2723",
      imageRadius: 8,
      ownerNameFont: "Merriweather",
      ownerNameFontSize: 20,
      ownerNameFontWeight: "700",
      ownerNameColor: "#3E2723",
      ownerTitleColor: "#8D6E63",
      storytellingFont: "Lato",
      storytellingFontSize: 18,
      storytellingFontWeight: "400",
      storytellingColor: "#5D4037",
      signatureColor: "#C0392B",
      showSignature: true,
      bgOverlayOpacity: 0,
      bgOverlayColor: "#FAF3E0",
      bgFallbackColor: "#F5ECD7",
      imagePosition: "left",
      showDecorative: true,
      textColor: "#3E2723",
    },
    menu: {
      menuSectionTitle: "Cardápio",
      panelBgColor: "#FAF3E0",
      panelOverlayOpacity: 70,
      panelOverlayColor: "#3E2723",
      headerTextColor: "#3E2723",
      searchBorderColor: "#D7CCC8",
      searchBgColor: "#ffffff",
      searchTextColor: "#3E2723",
      searchPlaceholderColor: "#A1887F",
      searchIconColor: "#A1887F",
      categoryNameColor: "#C0392B",
      filterActiveBgColor: "#C0392B",
      filterActiveTextColor: "#FAF3E0",
      filterInactiveBgColor: "#F5ECD7",
      filterInactiveTextColor: "#8D6E63",
      cardBgColor: "#ffffff",
      cardBorderColor: "#D7CCC8",
      cardBorderWidth: 1,
      cardBorderRadius: 8,
      cardNameColor: "#3E2723",
      cardPriceColor: "#C0392B",
      cardDescColor: "#8D6E63",
      cardFont: "Lato",
      cardFontSize: 14,
      cardFontWeight: "400",
      cardButtonText: "Adicionar",
      cardButtonBgColor: "#C0392B",
      cardButtonTextColor: "#FAF3E0",
      modalBgColor: "#FAF3E0",
      modalNameColor: "#3E2723",
      modalUnitColor: "#A1887F",
      modalPriceColor: "#C0392B",
      modalDescColor: "#8D6E63",
      modalCtaBgColor: "#C0392B",
      modalCtaTextColor: "#FAF3E0",
      modalCtaFont: "Lato",
      modalCtaFontSize: 16,
      modalCtaFontWeight: "600",
      qtyLabelColor: "#8D6E63",
      qtyBtnBgColor: "#F5ECD7",
      qtyBtnTextColor: "#3E2723",
      qtyNumberColor: "#3E2723",
    },
    toast: { bgColor: "#FAF3E0", borderColor: "#C0392B", titleColor: "#3E2723", subtitleColor: "#8D6E63", iconCheckColor: "#FAF3E0", iconBgColor: "#C0392B", closeButtonColor: "#A1887F" },
    cartLanding: { modalBgColor: "#FAF3E0", headerTextColor: "#3E2723", headerCloseColor: "#A1887F", headerIconColor: "#C0392B", itemBgColor: "#ffffff", itemBorderColor: "#D7CCC8", itemNameColor: "#3E2723", itemPriceColor: "#C0392B", itemTrashColor: "#ef4444", qtyBtnBgColor: "#F5ECD7", qtyBtnTextColor: "#3E2723", qtyNumberColor: "#3E2723", obsBgColor: "#ffffff", obsBorderColor: "#D7CCC8", obsTextColor: "#8D6E63", totalLabelColor: "#8D6E63", totalValueColor: "#C0392B", ctaBgColor: "#C0392B", ctaTextColor: "#FAF3E0", clearLinkColor: "#ef4444" },
    cartMenu: { modalBgColor: "#FAF3E0", headerTextColor: "#3E2723", headerCloseColor: "#A1887F", headerIconColor: "#C0392B", itemBgColor: "#ffffff", itemBorderColor: "#D7CCC8", itemNameColor: "#3E2723", itemPriceColor: "#C0392B", itemTrashColor: "#ef4444", qtyBtnBgColor: "#F5ECD7", qtyBtnTextColor: "#3E2723", qtyNumberColor: "#3E2723", obsBgColor: "#ffffff", obsBorderColor: "#D7CCC8", obsTextColor: "#8D6E63", totalLabelColor: "#8D6E63", totalValueColor: "#C0392B", ctaBgColor: "#C0392B", ctaTextColor: "#FAF3E0", clearLinkColor: "#ef4444" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#C0392B", label: "AVALIAÇÕES", labelFont: "Lato", labelFontSize: 14, labelFontWeight: "500", labelColor: "#C0392B", headlineFont: "Merriweather", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#3E2723", ratingNumberColor: "#3E2723", ratingTotalColor: "#A1887F", cardBgColor: "#ffffff", cardNameColor: "#3E2723", cardDateColor: "#A1887F", cardTextColor: "#5D4037", ctaBgColor: "#C0392B", ctaTextColor: "#FAF3E0", ctaFont: "Lato", ctaFontSize: 14, ctaFontWeight: "600", bgColor: "#FAF3E0", bgOverlayOpacity: 0, bgOverlayColor: "#FAF3E0" },
    feedbacks: { starColor: "#C0392B" },
    info: { label: "LOCALIZAÇÃO", labelFont: "Lato", labelFontSize: 14, labelFontWeight: "500", labelColor: "#C0392B", headline: "Venha nos visitar", headlineFont: "Merriweather", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#3E2723", subheadline: "Estamos esperando por você", subheadlineFont: "Lato", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#8D6E63", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 30, mapPinColor: "#C0392B", mapBtnBgColor: "#C0392B", mapBtnTextColor: "#FAF3E0", mapBtnFont: "Lato", mapBtnFontSize: 14, mapBtnFontWeight: "600", mapBtnLabel: "Como Chegar", addressIconColor: "#C0392B", addressIconBgColor: "#F5ECD7", addressTitleColor: "#3E2723", addressTextColor: "#8D6E63", addressFont: "Lato", addressFontSize: 14, addressFontWeight: "400", phoneIconColor: "#C0392B", phoneIconBgColor: "#F5ECD7", phoneTitleColor: "#3E2723", phoneTextColor: "#8D6E63", phoneFont: "Lato", phoneFontSize: 14, phoneFontWeight: "400", hoursIconColor: "#C0392B", hoursIconBgColor: "#F5ECD7", hoursTitleColor: "#3E2723", hoursContentColor: "#8D6E63", hoursLinkColor: "#C0392B", hoursLinkFont: "Lato", hoursLinkFontSize: 14, hoursLinkFontWeight: "500", scheduleModalBg: "#FAF3E0", scheduleModalTitleColor: "#3E2723", scheduleModalTextColor: "#8D6E63", scheduleModalStatusColor: "#2E7D32", scheduleModalHighlightBg: "#F5ECD7", socialBtnBgColor: "#F5ECD7", socialIconColor: "#C0392B", socialBtnTextColor: "#8D6E63", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#FAF3E0", cardsBgColor: "#ffffff", bgOverlayOpacity: 0, bgOverlayColor: "#FAF3E0", footerBgColor: "#3E2723", footerTextColor: "#D7CCC8", footerCtaBg: "#C0392B", footerCtaTextColor: "#FAF3E0", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "center" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Quer fazer um pedido?", buttonText: "Pedir pelo WhatsApp", popupBg: "#FAF3E0", popupTextColor: "#3E2723", buttonBg: "#C0392B", buttonTextColor: "#FAF3E0" },
  },
};

// ============================================
// PRESET 4 — DOCERIA ROSÉ (Pink Soft)
// ============================================

const doceriaRose: DesignPreset = {
  id: "doceria-rose",
  name: "Doceria Rosé",
  description: "Feminino e delicado. Doçura e elegância.",
  niche: "Docerias, confeitarias, cafés femininos",
  colors: { primary: "#D4838A", background: "#FFF8F8", accent: "#C9A96E" },
  themeColors: {
    primary: "#D4838A",
    background: "#FFF8F8",
    foreground: "#4A3333",
    accent: "#FFF0F0",
    muted: "#9E7777",
    buttonPrimary: "#D4838A",
    highlight: "#C9A96E",
    success: "#66BB6A",
  },
  fontFamily: "Nunito",
  fontDisplay: "Cormorant Garamond",
  borderRadius: "1rem",
  design: {
    home: {
      logoType: "text",
      logoSize: 80,
      headerBgColor: "rgba(255,248,248,0.9)",
      headerBehavior: "reveal_on_scroll",
      locationBoxBg: "rgba(212,131,138,0.1)",
      locationBoxText: "#9E7777",
      locationBoxIcon: "#D4838A",
      locationLabel: "",
      locationBoxGlassmorphism: false,
      scheduleBoxBg: "rgba(102,187,106,0.1)",
      scheduleBoxText: "#66BB6A",
      scheduleBoxIcon: "#66BB6A",
      scheduleLabel: "",
      scheduleBoxGlassmorphism: false,
      badgeOpenColor: "#66BB6A",
      badgeClosedColor: "#D4838A",
      headline: "Doces que Encantam",
      headlineFont: "Cormorant Garamond",
      headlineFontSize: 60,
      headlineFontWeight: "700",
      headlineColor: "#4A3333",
      subheadline: "Feitos com amor, servidos com carinho",
      subheadlineFont: "Nunito",
      subheadlineFontSize: 20,
      subheadlineFontWeight: "400",
      subheadlineColor: "#9E7777",
      ctaText: "Ver Cardápio",
      ctaBgColor: "#D4838A",
      ctaTextColor: "#ffffff",
      ctaGradient: false,
      ctaGradientEnd: "#C9A96E",
      ctaAction: "#cardapio",
      bgMediaType: "image",
      bgOverlayOpacity: 15,
      bgOverlayColor: "#FFF8F8",
      bgFallbackColor: "#FFF8F8",
    },
    products: {
      headline: "Nossos Doces",
      subheadline: "Cada mordida é uma experiência",
      maxCategories: 3,
      offersCategoryId: null,
      headlineFont: "Cormorant Garamond",
      headlineFontSize: 40,
      headlineFontWeight: "700",
      headlineColor: "#4A3333",
      subheadlineFont: "Nunito",
      subheadlineFontSize: 18,
      subheadlineFontWeight: "400",
      subheadlineColor: "#9E7777",
      cardBgColor: "#ffffff",
      cardNameColor: "#4A3333",
      cardPriceColor: "#D4838A",
      cardDescColor: "#9E7777",
      cardUnitColor: "#BEA0A0",
      cardBorderRadius: 16,
      cardBorderColor: "#F5E0E0",
      cardBorderWidth: 1,
      cardButtonText: "Quero!",
      cardButtonBgColor: "#D4838A",
      cardButtonTextColor: "#ffffff",
      bgColor: "#FFF8F8",
      bgGradient: false,
      bgGradientFrom: "#FFF8F8",
      bgGradientTo: "#FFF0F0",
      bgGradientDirection: "to-b",
      bgOverlayOpacity: 0,
      bgOverlayColor: "#FFF8F8",
      viewAllBgColor: "transparent",
      viewAllTextColor: "#D4838A",
      viewAllFont: "Nunito",
      viewAllFontSize: 14,
      viewAllFontWeight: "600",
      viewAllLabel: "Ver todas",
      ctaText: "Ver Cardápio Completo",
      ctaBgColor: "#D4838A",
      ctaTextColor: "#ffffff",
      ctaGradient: false,
      ctaGradientEnd: "#C9A96E",
      ctaFont: "Nunito",
      ctaFontSize: 16,
      ctaFontWeight: "600",
      ctaAction: "#cardapio",
    },
    about: { preHeadline: "NOSSA HISTÓRIA", preHeadlineFont: "Nunito", preHeadlineFontSize: 14, preHeadlineFontWeight: "500", preHeadlineColor: "#C9A96E", headline: "Sobre Nós", headlineFont: "Cormorant Garamond", headlineFontSize: 48, headlineFontWeight: "700", headlineColor: "#4A3333", imageRadius: 50, ownerNameFont: "Cormorant Garamond", ownerNameFontSize: 20, ownerNameFontWeight: "700", ownerNameColor: "#4A3333", ownerTitleColor: "#9E7777", storytellingFont: "Nunito", storytellingFontSize: 18, storytellingFontWeight: "400", storytellingColor: "#6B4F4F", signatureColor: "#C9A96E", showSignature: true, bgOverlayOpacity: 0, bgOverlayColor: "#FFF8F8", bgFallbackColor: "#FFF0F0", imagePosition: "right", showDecorative: true, textColor: "#4A3333" },
    menu: { menuSectionTitle: "Cardápio", panelBgColor: "#FFF8F8", panelOverlayOpacity: 50, panelOverlayColor: "#4A3333", headerTextColor: "#4A3333", searchBorderColor: "#F5E0E0", searchBgColor: "#ffffff", searchTextColor: "#4A3333", searchPlaceholderColor: "#BEA0A0", searchIconColor: "#BEA0A0", categoryNameColor: "#D4838A", filterActiveBgColor: "#D4838A", filterActiveTextColor: "#ffffff", filterInactiveBgColor: "#FFF0F0", filterInactiveTextColor: "#9E7777", cardBgColor: "#ffffff", cardBorderColor: "#F5E0E0", cardBorderWidth: 1, cardBorderRadius: 16, cardNameColor: "#4A3333", cardPriceColor: "#D4838A", cardDescColor: "#9E7777", cardFont: "Nunito", cardFontSize: 14, cardFontWeight: "400", cardButtonText: "Quero!", cardButtonBgColor: "#D4838A", cardButtonTextColor: "#ffffff", modalBgColor: "#FFF8F8", modalNameColor: "#4A3333", modalUnitColor: "#BEA0A0", modalPriceColor: "#D4838A", modalDescColor: "#9E7777", modalCtaBgColor: "#D4838A", modalCtaTextColor: "#ffffff", modalCtaFont: "Nunito", modalCtaFontSize: 16, modalCtaFontWeight: "600", qtyLabelColor: "#9E7777", qtyBtnBgColor: "#FFF0F0", qtyBtnTextColor: "#4A3333", qtyNumberColor: "#4A3333" },
    toast: { bgColor: "#FFF8F8", borderColor: "#D4838A", titleColor: "#4A3333", subtitleColor: "#9E7777", iconCheckColor: "#ffffff", iconBgColor: "#D4838A", closeButtonColor: "#BEA0A0" },
    cartLanding: { modalBgColor: "#FFF8F8", headerTextColor: "#4A3333", headerCloseColor: "#BEA0A0", headerIconColor: "#D4838A", itemBgColor: "#ffffff", itemBorderColor: "#F5E0E0", itemNameColor: "#4A3333", itemPriceColor: "#D4838A", itemTrashColor: "#ef4444", qtyBtnBgColor: "#FFF0F0", qtyBtnTextColor: "#4A3333", qtyNumberColor: "#4A3333", obsBgColor: "#ffffff", obsBorderColor: "#F5E0E0", obsTextColor: "#9E7777", totalLabelColor: "#9E7777", totalValueColor: "#D4838A", ctaBgColor: "#D4838A", ctaTextColor: "#ffffff", clearLinkColor: "#ef4444" },
    cartMenu: { modalBgColor: "#FFF8F8", headerTextColor: "#4A3333", headerCloseColor: "#BEA0A0", headerIconColor: "#D4838A", itemBgColor: "#ffffff", itemBorderColor: "#F5E0E0", itemNameColor: "#4A3333", itemPriceColor: "#D4838A", itemTrashColor: "#ef4444", qtyBtnBgColor: "#FFF0F0", qtyBtnTextColor: "#4A3333", qtyNumberColor: "#4A3333", obsBgColor: "#ffffff", obsBorderColor: "#F5E0E0", obsTextColor: "#9E7777", totalLabelColor: "#9E7777", totalValueColor: "#D4838A", ctaBgColor: "#D4838A", ctaTextColor: "#ffffff", clearLinkColor: "#ef4444" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#C9A96E", label: "AVALIAÇÕES", labelFont: "Nunito", labelFontSize: 14, labelFontWeight: "500", labelColor: "#C9A96E", headlineFont: "Cormorant Garamond", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#4A3333", ratingNumberColor: "#4A3333", ratingTotalColor: "#BEA0A0", cardBgColor: "#ffffff", cardNameColor: "#4A3333", cardDateColor: "#BEA0A0", cardTextColor: "#6B4F4F", ctaBgColor: "#D4838A", ctaTextColor: "#ffffff", ctaFont: "Nunito", ctaFontSize: 14, ctaFontWeight: "600", bgColor: "#FFF8F8", bgOverlayOpacity: 0, bgOverlayColor: "#FFF8F8" },
    feedbacks: { starColor: "#C9A96E" },
    info: { label: "LOCALIZAÇÃO", labelFont: "Nunito", labelFontSize: 14, labelFontWeight: "500", labelColor: "#C9A96E", headline: "Venha nos visitar", headlineFont: "Cormorant Garamond", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#4A3333", subheadline: "Estamos esperando por você", subheadlineFont: "Nunito", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#9E7777", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 15, mapPinColor: "#D4838A", mapBtnBgColor: "#D4838A", mapBtnTextColor: "#ffffff", mapBtnFont: "Nunito", mapBtnFontSize: 14, mapBtnFontWeight: "600", mapBtnLabel: "Como Chegar", addressIconColor: "#D4838A", addressIconBgColor: "#FFF0F0", addressTitleColor: "#4A3333", addressTextColor: "#9E7777", addressFont: "Nunito", addressFontSize: 14, addressFontWeight: "400", phoneIconColor: "#D4838A", phoneIconBgColor: "#FFF0F0", phoneTitleColor: "#4A3333", phoneTextColor: "#9E7777", phoneFont: "Nunito", phoneFontSize: 14, phoneFontWeight: "400", hoursIconColor: "#D4838A", hoursIconBgColor: "#FFF0F0", hoursTitleColor: "#4A3333", hoursContentColor: "#9E7777", hoursLinkColor: "#D4838A", hoursLinkFont: "Nunito", hoursLinkFontSize: 14, hoursLinkFontWeight: "500", scheduleModalBg: "#FFF8F8", scheduleModalTitleColor: "#4A3333", scheduleModalTextColor: "#9E7777", scheduleModalStatusColor: "#66BB6A", scheduleModalHighlightBg: "#FFF0F0", socialBtnBgColor: "#FFF0F0", socialIconColor: "#D4838A", socialBtnTextColor: "#9E7777", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#FFF8F8", cardsBgColor: "#ffffff", bgOverlayOpacity: 0, bgOverlayColor: "#FFF8F8", footerBgColor: "#FFF0F0", footerTextColor: "#BEA0A0", footerCtaBg: "#D4838A", footerCtaTextColor: "#ffffff", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "center" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Quer encomendar?", buttonText: "Fazer Encomenda", popupBg: "#FFF8F8", popupTextColor: "#4A3333", buttonBg: "#D4838A", buttonTextColor: "#ffffff" },
  },
};

// ============================================
// PRESET 5 — AÇAÍ & HEALTHY (Green Fresh)
// ============================================

const acaiHealthy: DesignPreset = {
  id: "acai-healthy",
  name: "Açaí & Healthy",
  description: "Vibrante e energético. Saúde, energia e jovialidade.",
  niche: "Açaí, sucos, comida saudável, smoothie bowl",
  colors: { primary: "#39D353", background: "#0D1F0D", accent: "#1A3A1A" },
  themeColors: {
    primary: "#39D353",
    background: "#0D1F0D",
    foreground: "#ffffff",
    accent: "#1A3A1A",
    muted: "#8FBC8F",
    buttonPrimary: "#39D353",
    highlight: "#39D353",
    success: "#39D353",
  },
  fontFamily: "DM Sans",
  fontDisplay: "Space Grotesk",
  borderRadius: "1rem",
  design: {
    home: {
      logoType: "text",
      logoSize: 80,
      headerBgColor: "rgba(13,31,13,0.8)",
      headerBehavior: "always_visible",
      locationBoxBg: "rgba(57,211,83,0.1)",
      locationBoxText: "#8FBC8F",
      locationBoxIcon: "#39D353",
      locationLabel: "",
      locationBoxGlassmorphism: true,
      scheduleBoxBg: "rgba(57,211,83,0.15)",
      scheduleBoxText: "#39D353",
      scheduleBoxIcon: "#39D353",
      scheduleLabel: "",
      scheduleBoxGlassmorphism: true,
      badgeOpenColor: "#39D353",
      badgeClosedColor: "#ef4444",
      headline: "Energia Pura, Sabor Natural",
      headlineFont: "Space Grotesk",
      headlineFontSize: 60,
      headlineFontWeight: "700",
      headlineColor: "#ffffff",
      subheadline: "Açaí, bowls e sucos frescos todos os dias",
      subheadlineFont: "DM Sans",
      subheadlineFontSize: 20,
      subheadlineFontWeight: "400",
      subheadlineColor: "#8FBC8F",
      ctaText: "Montar Meu Bowl",
      ctaBgColor: "#39D353",
      ctaTextColor: "#0D1F0D",
      ctaGradient: false,
      ctaGradientEnd: "#2DB844",
      ctaAction: "#cardapio",
      bgMediaType: "image",
      bgOverlayOpacity: 60,
      bgOverlayColor: "#0D1F0D",
      bgFallbackColor: "#0D1F0D",
    },
    products: {
      headline: "Monte Seu Bowl",
      subheadline: "Escolha, combine e aproveite",
      maxCategories: 3,
      offersCategoryId: null,
      headlineFont: "Space Grotesk",
      headlineFontSize: 40,
      headlineFontWeight: "700",
      headlineColor: "#ffffff",
      subheadlineFont: "DM Sans",
      subheadlineFontSize: 18,
      subheadlineFontWeight: "400",
      subheadlineColor: "#8FBC8F",
      cardBgColor: "#1A3A1A",
      cardNameColor: "#ffffff",
      cardPriceColor: "#39D353",
      cardDescColor: "#8FBC8F",
      cardUnitColor: "#6B8F6B",
      cardBorderRadius: 16,
      cardBorderColor: "#2D5A2D",
      cardBorderWidth: 1,
      cardButtonText: "Adicionar",
      cardButtonBgColor: "#39D353",
      cardButtonTextColor: "#0D1F0D",
      bgColor: "#0D1F0D",
      bgGradient: false,
      bgGradientFrom: "#0D1F0D",
      bgGradientTo: "#1A3A1A",
      bgGradientDirection: "to-b",
      bgOverlayOpacity: 0,
      bgOverlayColor: "#0D1F0D",
      viewAllBgColor: "transparent",
      viewAllTextColor: "#39D353",
      viewAllFont: "DM Sans",
      viewAllFontSize: 14,
      viewAllFontWeight: "600",
      viewAllLabel: "Ver todas",
      ctaText: "Ver Cardápio Completo",
      ctaBgColor: "#39D353",
      ctaTextColor: "#0D1F0D",
      ctaGradient: false,
      ctaGradientEnd: "#2DB844",
      ctaFont: "DM Sans",
      ctaFontSize: 16,
      ctaFontWeight: "600",
      ctaAction: "#cardapio",
    },
    about: { preHeadline: "NOSSA MISSÃO", preHeadlineFont: "DM Sans", preHeadlineFontSize: 14, preHeadlineFontWeight: "500", preHeadlineColor: "#39D353", headline: "Sobre Nós", headlineFont: "Space Grotesk", headlineFontSize: 48, headlineFontWeight: "700", headlineColor: "#ffffff", imageRadius: 16, ownerNameFont: "Space Grotesk", ownerNameFontSize: 20, ownerNameFontWeight: "700", ownerNameColor: "#ffffff", ownerTitleColor: "#8FBC8F", storytellingFont: "DM Sans", storytellingFontSize: 18, storytellingFontWeight: "400", storytellingColor: "#B0D4B0", signatureColor: "#39D353", showSignature: true, bgOverlayOpacity: 0, bgOverlayColor: "#0D1F0D", bgFallbackColor: "#0D1F0D", imagePosition: "left", showDecorative: true, textColor: "#ffffff" },
    menu: { menuSectionTitle: "Cardápio", panelBgColor: "#0D1F0D", panelOverlayOpacity: 80, panelOverlayColor: "#000000", headerTextColor: "#ffffff", searchBorderColor: "#2D5A2D", searchBgColor: "#1A3A1A", searchTextColor: "#ffffff", searchPlaceholderColor: "#6B8F6B", searchIconColor: "#6B8F6B", categoryNameColor: "#39D353", filterActiveBgColor: "#39D353", filterActiveTextColor: "#0D1F0D", filterInactiveBgColor: "#1A3A1A", filterInactiveTextColor: "#8FBC8F", cardBgColor: "#1A3A1A", cardBorderColor: "#2D5A2D", cardBorderWidth: 1, cardBorderRadius: 16, cardNameColor: "#ffffff", cardPriceColor: "#39D353", cardDescColor: "#8FBC8F", cardFont: "DM Sans", cardFontSize: 14, cardFontWeight: "400", cardButtonText: "Adicionar", cardButtonBgColor: "#39D353", cardButtonTextColor: "#0D1F0D", modalBgColor: "#1A3A1A", modalNameColor: "#ffffff", modalUnitColor: "#6B8F6B", modalPriceColor: "#39D353", modalDescColor: "#8FBC8F", modalCtaBgColor: "#39D353", modalCtaTextColor: "#0D1F0D", modalCtaFont: "DM Sans", modalCtaFontSize: 16, modalCtaFontWeight: "600", qtyLabelColor: "#8FBC8F", qtyBtnBgColor: "#2D5A2D", qtyBtnTextColor: "#ffffff", qtyNumberColor: "#ffffff" },
    toast: { bgColor: "#1A3A1A", borderColor: "#39D353", titleColor: "#ffffff", subtitleColor: "#8FBC8F", iconCheckColor: "#0D1F0D", iconBgColor: "#39D353", closeButtonColor: "#6B8F6B" },
    cartLanding: { modalBgColor: "#0D1F0D", headerTextColor: "#ffffff", headerCloseColor: "#6B8F6B", headerIconColor: "#39D353", itemBgColor: "#1A3A1A", itemBorderColor: "#2D5A2D", itemNameColor: "#ffffff", itemPriceColor: "#39D353", itemTrashColor: "#ef4444", qtyBtnBgColor: "#2D5A2D", qtyBtnTextColor: "#ffffff", qtyNumberColor: "#ffffff", obsBgColor: "#1A3A1A", obsBorderColor: "#2D5A2D", obsTextColor: "#8FBC8F", totalLabelColor: "#8FBC8F", totalValueColor: "#39D353", ctaBgColor: "#39D353", ctaTextColor: "#0D1F0D", clearLinkColor: "#ef4444" },
    cartMenu: { modalBgColor: "#0D1F0D", headerTextColor: "#ffffff", headerCloseColor: "#6B8F6B", headerIconColor: "#39D353", itemBgColor: "#1A3A1A", itemBorderColor: "#2D5A2D", itemNameColor: "#ffffff", itemPriceColor: "#39D353", itemTrashColor: "#ef4444", qtyBtnBgColor: "#2D5A2D", qtyBtnTextColor: "#ffffff", qtyNumberColor: "#ffffff", obsBgColor: "#1A3A1A", obsBorderColor: "#2D5A2D", obsTextColor: "#8FBC8F", totalLabelColor: "#8FBC8F", totalValueColor: "#39D353", ctaBgColor: "#39D353", ctaTextColor: "#0D1F0D", clearLinkColor: "#ef4444" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#39D353", label: "AVALIAÇÕES", labelFont: "DM Sans", labelFontSize: 14, labelFontWeight: "500", labelColor: "#39D353", headlineFont: "Space Grotesk", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#ffffff", ratingNumberColor: "#ffffff", ratingTotalColor: "#6B8F6B", cardBgColor: "#1A3A1A", cardNameColor: "#ffffff", cardDateColor: "#6B8F6B", cardTextColor: "#B0D4B0", ctaBgColor: "#39D353", ctaTextColor: "#0D1F0D", ctaFont: "DM Sans", ctaFontSize: 14, ctaFontWeight: "600", bgColor: "#0D1F0D", bgOverlayOpacity: 0, bgOverlayColor: "#0D1F0D" },
    feedbacks: { starColor: "#39D353" },
    info: { label: "LOCALIZAÇÃO", labelFont: "DM Sans", labelFontSize: 14, labelFontWeight: "500", labelColor: "#39D353", headline: "Venha nos visitar", headlineFont: "Space Grotesk", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#ffffff", subheadline: "Estamos esperando por você", subheadlineFont: "DM Sans", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#8FBC8F", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 50, mapPinColor: "#39D353", mapBtnBgColor: "#39D353", mapBtnTextColor: "#0D1F0D", mapBtnFont: "DM Sans", mapBtnFontSize: 14, mapBtnFontWeight: "600", mapBtnLabel: "Como Chegar", addressIconColor: "#39D353", addressIconBgColor: "#1A3A1A", addressTitleColor: "#ffffff", addressTextColor: "#8FBC8F", addressFont: "DM Sans", addressFontSize: 14, addressFontWeight: "400", phoneIconColor: "#39D353", phoneIconBgColor: "#1A3A1A", phoneTitleColor: "#ffffff", phoneTextColor: "#8FBC8F", phoneFont: "DM Sans", phoneFontSize: 14, phoneFontWeight: "400", hoursIconColor: "#39D353", hoursIconBgColor: "#1A3A1A", hoursTitleColor: "#ffffff", hoursContentColor: "#8FBC8F", hoursLinkColor: "#39D353", hoursLinkFont: "DM Sans", hoursLinkFontSize: 14, hoursLinkFontWeight: "500", scheduleModalBg: "#1A3A1A", scheduleModalTitleColor: "#ffffff", scheduleModalTextColor: "#8FBC8F", scheduleModalStatusColor: "#39D353", scheduleModalHighlightBg: "#2D5A2D", socialBtnBgColor: "#1A3A1A", socialIconColor: "#39D353", socialBtnTextColor: "#8FBC8F", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#0D1F0D", cardsBgColor: "#1A3A1A", bgOverlayOpacity: 0, bgOverlayColor: "#0D1F0D", footerBgColor: "#071007", footerTextColor: "#6B8F6B", footerCtaBg: "#39D353", footerCtaTextColor: "#0D1F0D", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "left" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Quer montar seu bowl?", buttonText: "Pedir pelo WhatsApp", popupBg: "#1A3A1A", popupTextColor: "#ffffff", buttonBg: "#39D353", buttonTextColor: "#0D1F0D" },
  },
};

// ============================================
// PRESET 6 — JAPONÊS MINIMALISTA (Black & White)
// ============================================

const japonesMinimalista: DesignPreset = {
  id: "japones-minimalista",
  name: "Japonês Minimalista",
  description: "Ultra minimalista e sofisticado. Precisão e limpeza.",
  niche: "Culinária japonesa, sushi, temakeria",
  colors: { primary: "#ffffff", background: "#000000", accent: "#111111" },
  themeColors: {
    primary: "#ffffff",
    background: "#000000",
    foreground: "#ffffff",
    accent: "#111111",
    muted: "#666666",
    buttonPrimary: "#ffffff",
    highlight: "#ffffff",
    success: "#4ade80",
  },
  fontFamily: "Noto Sans",
  fontDisplay: "Noto Serif",
  borderRadius: "0.25rem",
  design: {
    home: {
      logoType: "text",
      logoSize: 80,
      headerBgColor: "rgba(0,0,0,0.6)",
      headerBehavior: "always_visible",
      locationBoxBg: "rgba(255,255,255,0.08)",
      locationBoxText: "#888888",
      locationBoxIcon: "#ffffff",
      locationLabel: "",
      locationBoxGlassmorphism: true,
      scheduleBoxBg: "rgba(74,222,128,0.1)",
      scheduleBoxText: "#4ade80",
      scheduleBoxIcon: "#4ade80",
      scheduleLabel: "",
      scheduleBoxGlassmorphism: true,
      badgeOpenColor: "#4ade80",
      badgeClosedColor: "#ef4444",
      headline: "A Arte da Culinária Japonesa",
      headlineFont: "Noto Serif",
      headlineFontSize: 56,
      headlineFontWeight: "400",
      headlineColor: "#ffffff",
      subheadline: "Tradição, precisão e frescor em cada peça",
      subheadlineFont: "Noto Sans",
      subheadlineFontSize: 18,
      subheadlineFontWeight: "300",
      subheadlineColor: "#888888",
      ctaText: "Ver Cardápio",
      ctaBgColor: "#ffffff",
      ctaTextColor: "#000000",
      ctaGradient: false,
      ctaGradientEnd: "#cccccc",
      ctaAction: "#cardapio",
      bgMediaType: "image",
      bgOverlayOpacity: 65,
      bgOverlayColor: "#000000",
      bgFallbackColor: "#000000",
    },
    products: {
      headline: "Nosso Cardápio",
      subheadline: "Seleção premium do chef",
      maxCategories: 3,
      offersCategoryId: null,
      headlineFont: "Noto Serif",
      headlineFontSize: 40,
      headlineFontWeight: "400",
      headlineColor: "#ffffff",
      subheadlineFont: "Noto Sans",
      subheadlineFontSize: 18,
      subheadlineFontWeight: "300",
      subheadlineColor: "#888888",
      cardBgColor: "#111111",
      cardNameColor: "#ffffff",
      cardPriceColor: "#ffffff",
      cardDescColor: "#888888",
      cardUnitColor: "#555555",
      cardBorderRadius: 4,
      cardBorderColor: "#222222",
      cardBorderWidth: 1,
      cardButtonText: "Adicionar",
      cardButtonBgColor: "#ffffff",
      cardButtonTextColor: "#000000",
      bgColor: "#000000",
      bgGradient: false,
      bgGradientFrom: "#000000",
      bgGradientTo: "#111111",
      bgGradientDirection: "to-b",
      bgOverlayOpacity: 0,
      bgOverlayColor: "#000000",
      viewAllBgColor: "transparent",
      viewAllTextColor: "#ffffff",
      viewAllFont: "Noto Sans",
      viewAllFontSize: 14,
      viewAllFontWeight: "400",
      viewAllLabel: "Ver todas",
      ctaText: "Ver Cardápio Completo",
      ctaBgColor: "#ffffff",
      ctaTextColor: "#000000",
      ctaGradient: false,
      ctaGradientEnd: "#cccccc",
      ctaFont: "Noto Sans",
      ctaFontSize: 16,
      ctaFontWeight: "400",
      ctaAction: "#cardapio",
    },
    about: { preHeadline: "NOSSA FILOSOFIA", preHeadlineFont: "Noto Sans", preHeadlineFontSize: 13, preHeadlineFontWeight: "300", preHeadlineColor: "#888888", headline: "Sobre Nós", headlineFont: "Noto Serif", headlineFontSize: 48, headlineFontWeight: "400", headlineColor: "#ffffff", imageRadius: 4, ownerNameFont: "Noto Serif", ownerNameFontSize: 20, ownerNameFontWeight: "400", ownerNameColor: "#ffffff", ownerTitleColor: "#888888", storytellingFont: "Noto Sans", storytellingFontSize: 18, storytellingFontWeight: "300", storytellingColor: "#aaaaaa", signatureColor: "#ffffff", showSignature: true, bgOverlayOpacity: 0, bgOverlayColor: "#000000", bgFallbackColor: "#000000", imagePosition: "right", showDecorative: false, textColor: "#ffffff" },
    menu: { menuSectionTitle: "Cardápio", panelBgColor: "#000000", panelOverlayOpacity: 85, panelOverlayColor: "#000000", headerTextColor: "#ffffff", searchBorderColor: "#222222", searchBgColor: "#111111", searchTextColor: "#ffffff", searchPlaceholderColor: "#555555", searchIconColor: "#555555", categoryNameColor: "#ffffff", filterActiveBgColor: "#ffffff", filterActiveTextColor: "#000000", filterInactiveBgColor: "#111111", filterInactiveTextColor: "#888888", cardBgColor: "#111111", cardBorderColor: "#222222", cardBorderWidth: 1, cardBorderRadius: 4, cardNameColor: "#ffffff", cardPriceColor: "#ffffff", cardDescColor: "#888888", cardFont: "Noto Sans", cardFontSize: 14, cardFontWeight: "300", cardButtonText: "Adicionar", cardButtonBgColor: "#ffffff", cardButtonTextColor: "#000000", modalBgColor: "#111111", modalNameColor: "#ffffff", modalUnitColor: "#555555", modalPriceColor: "#ffffff", modalDescColor: "#888888", modalCtaBgColor: "#ffffff", modalCtaTextColor: "#000000", modalCtaFont: "Noto Sans", modalCtaFontSize: 16, modalCtaFontWeight: "400", qtyLabelColor: "#888888", qtyBtnBgColor: "#222222", qtyBtnTextColor: "#ffffff", qtyNumberColor: "#ffffff" },
    toast: { bgColor: "#111111", borderColor: "#333333", titleColor: "#ffffff", subtitleColor: "#888888", iconCheckColor: "#000000", iconBgColor: "#ffffff", closeButtonColor: "#555555" },
    cartLanding: { modalBgColor: "#000000", headerTextColor: "#ffffff", headerCloseColor: "#555555", headerIconColor: "#ffffff", itemBgColor: "#111111", itemBorderColor: "#222222", itemNameColor: "#ffffff", itemPriceColor: "#ffffff", itemTrashColor: "#ef4444", qtyBtnBgColor: "#222222", qtyBtnTextColor: "#ffffff", qtyNumberColor: "#ffffff", obsBgColor: "#111111", obsBorderColor: "#222222", obsTextColor: "#888888", totalLabelColor: "#888888", totalValueColor: "#ffffff", ctaBgColor: "#ffffff", ctaTextColor: "#000000", clearLinkColor: "#ef4444" },
    cartMenu: { modalBgColor: "#000000", headerTextColor: "#ffffff", headerCloseColor: "#555555", headerIconColor: "#ffffff", itemBgColor: "#111111", itemBorderColor: "#222222", itemNameColor: "#ffffff", itemPriceColor: "#ffffff", itemTrashColor: "#ef4444", qtyBtnBgColor: "#222222", qtyBtnTextColor: "#ffffff", qtyNumberColor: "#ffffff", obsBgColor: "#111111", obsBorderColor: "#222222", obsTextColor: "#888888", totalLabelColor: "#888888", totalValueColor: "#ffffff", ctaBgColor: "#ffffff", ctaTextColor: "#000000", clearLinkColor: "#ef4444" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#ffffff", label: "AVALIAÇÕES", labelFont: "Noto Sans", labelFontSize: 13, labelFontWeight: "300", labelColor: "#888888", headlineFont: "Noto Serif", headlineFontSize: 40, headlineFontWeight: "400", headlineColor: "#ffffff", ratingNumberColor: "#ffffff", ratingTotalColor: "#555555", cardBgColor: "#111111", cardNameColor: "#ffffff", cardDateColor: "#555555", cardTextColor: "#aaaaaa", ctaBgColor: "#ffffff", ctaTextColor: "#000000", ctaFont: "Noto Sans", ctaFontSize: 14, ctaFontWeight: "400", bgColor: "#000000", bgOverlayOpacity: 0, bgOverlayColor: "#000000" },
    feedbacks: { starColor: "#ffffff" },
    info: { label: "LOCALIZAÇÃO", labelFont: "Noto Sans", labelFontSize: 13, labelFontWeight: "300", labelColor: "#888888", headline: "Venha nos visitar", headlineFont: "Noto Serif", headlineFontSize: 40, headlineFontWeight: "400", headlineColor: "#ffffff", subheadline: "Estamos esperando por você", subheadlineFont: "Noto Sans", subheadlineFontSize: 18, subheadlineFontWeight: "300", subheadlineColor: "#888888", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 60, mapPinColor: "#ffffff", mapBtnBgColor: "#ffffff", mapBtnTextColor: "#000000", mapBtnFont: "Noto Sans", mapBtnFontSize: 14, mapBtnFontWeight: "400", mapBtnLabel: "Como Chegar", addressIconColor: "#ffffff", addressIconBgColor: "#111111", addressTitleColor: "#ffffff", addressTextColor: "#888888", addressFont: "Noto Sans", addressFontSize: 14, addressFontWeight: "300", phoneIconColor: "#ffffff", phoneIconBgColor: "#111111", phoneTitleColor: "#ffffff", phoneTextColor: "#888888", phoneFont: "Noto Sans", phoneFontSize: 14, phoneFontWeight: "300", hoursIconColor: "#ffffff", hoursIconBgColor: "#111111", hoursTitleColor: "#ffffff", hoursContentColor: "#888888", hoursLinkColor: "#ffffff", hoursLinkFont: "Noto Sans", hoursLinkFontSize: 14, hoursLinkFontWeight: "400", scheduleModalBg: "#111111", scheduleModalTitleColor: "#ffffff", scheduleModalTextColor: "#888888", scheduleModalStatusColor: "#4ade80", scheduleModalHighlightBg: "#222222", socialBtnBgColor: "#111111", socialIconColor: "#ffffff", socialBtnTextColor: "#888888", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#000000", cardsBgColor: "#111111", bgOverlayOpacity: 0, bgOverlayColor: "#000000", footerBgColor: "#000000", footerTextColor: "#555555", footerCtaBg: "#ffffff", footerCtaTextColor: "#000000", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "center" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Como podemos ajudar?", buttonText: "Iniciar Conversa", popupBg: "#111111", popupTextColor: "#ffffff", buttonBg: "#ffffff", buttonTextColor: "#000000" },
  },
};

// ============================================
// PRESET 7 — CHURRASCARIA | Dark Brown & Ember
// ============================================

const churrascaria: DesignPreset = {
  id: "churrascaria",
  name: "Churrascaria",
  description: "Dark mode com tons de marrom e brasa. Rústico e robusto.",
  niche: "Churrascarias, espetinhos, assados, carnes",
  colors: { primary: "#C45A2D", background: "#1a1008", accent: "#2a1a0e" },
  themeColors: { primary: "#C45A2D", background: "#1a1008", foreground: "#f5e6d3", accent: "#2a1a0e", muted: "#8a7560", buttonPrimary: "#C45A2D", highlight: "#E8732A", success: "#22c55e" },
  fontFamily: "Roboto Slab",
  fontDisplay: "Playfair Display",
  borderRadius: "0.5rem",
  design: {
    home: { logoType: "text", logoSize: 80, headerBgColor: "rgba(26,16,8,0.85)", headerBehavior: "always_visible", locationBoxBg: "rgba(196,90,45,0.15)", locationBoxText: "#8a7560", locationBoxIcon: "#C45A2D", locationLabel: "", locationBoxGlassmorphism: true, scheduleBoxBg: "rgba(34,197,94,0.15)", scheduleBoxText: "#22c55e", scheduleBoxIcon: "#22c55e", scheduleLabel: "", scheduleBoxGlassmorphism: true, badgeOpenColor: "#22c55e", badgeClosedColor: "#ef4444", headline: "Carne de Verdade na Brasa", headlineFont: "Playfair Display", headlineFontSize: 60, headlineFontWeight: "700", headlineColor: "#f5e6d3", subheadline: "Tradição, fogo e sabor em cada corte", subheadlineFont: "Roboto Slab", subheadlineFontSize: 20, subheadlineFontWeight: "400", subheadlineColor: "#8a7560", ctaText: "Ver Cardápio", ctaBgColor: "#C45A2D", ctaTextColor: "#ffffff", ctaGradient: false, ctaGradientEnd: "#A04824", ctaAction: "#cardapio", bgMediaType: "image", bgOverlayOpacity: 55, bgOverlayColor: "#1a1008", bgFallbackColor: "#1a1008" },
    products: { headline: "Nossos Cortes", subheadline: "Selecionados e preparados na brasa", maxCategories: 3, offersCategoryId: null, headlineFont: "Playfair Display", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#f5e6d3", subheadlineFont: "Roboto Slab", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#8a7560", cardBgColor: "#2a1a0e", cardNameColor: "#f5e6d3", cardPriceColor: "#E8732A", cardDescColor: "#8a7560", cardUnitColor: "#6b5a48", cardBorderRadius: 8, cardBorderColor: "#3d2a1a", cardBorderWidth: 1, cardButtonText: "Adicionar", cardButtonBgColor: "#C45A2D", cardButtonTextColor: "#ffffff", bgColor: "#1a1008", bgGradient: false, bgGradientFrom: "#1a1008", bgGradientTo: "#2a1a0e", bgGradientDirection: "to-b", bgOverlayOpacity: 0, bgOverlayColor: "#000000", viewAllBgColor: "transparent", viewAllTextColor: "#C45A2D", viewAllFont: "Roboto Slab", viewAllFontSize: 14, viewAllFontWeight: "600", viewAllLabel: "Ver todas", ctaText: "Ver Cardápio Completo", ctaBgColor: "#C45A2D", ctaTextColor: "#ffffff", ctaGradient: false, ctaGradientEnd: "#A04824", ctaFont: "Roboto Slab", ctaFontSize: 16, ctaFontWeight: "600", ctaAction: "#cardapio" },
    about: { preHeadline: "NOSSA TRADIÇÃO", preHeadlineFont: "Roboto Slab", preHeadlineFontSize: 14, preHeadlineFontWeight: "500", preHeadlineColor: "#C45A2D", headline: "Sobre Nós", headlineFont: "Playfair Display", headlineFontSize: 48, headlineFontWeight: "700", headlineColor: "#f5e6d3", imageRadius: 12, ownerNameFont: "Playfair Display", ownerNameFontSize: 20, ownerNameFontWeight: "700", ownerNameColor: "#f5e6d3", ownerTitleColor: "#8a7560", storytellingFont: "Roboto Slab", storytellingFontSize: 18, storytellingFontWeight: "400", storytellingColor: "#b8a898", signatureColor: "#C45A2D", showSignature: true, bgOverlayOpacity: 0, bgOverlayColor: "#000000", bgFallbackColor: "#1a1008", imagePosition: "left", showDecorative: true, textColor: "#f5e6d3" },
    menu: { menuSectionTitle: "Cardápio", panelBgColor: "#1a1008", panelOverlayOpacity: 80, panelOverlayColor: "#0d0804", headerTextColor: "#f5e6d3", searchBorderColor: "#3d2a1a", searchBgColor: "#2a1a0e", searchTextColor: "#f5e6d3", searchPlaceholderColor: "#6b5a48", searchIconColor: "#6b5a48", categoryNameColor: "#C45A2D", filterActiveBgColor: "#C45A2D", filterActiveTextColor: "#ffffff", filterInactiveBgColor: "#3d2a1a", filterInactiveTextColor: "#8a7560", cardBgColor: "#2a1a0e", cardBorderColor: "#3d2a1a", cardBorderWidth: 1, cardBorderRadius: 8, cardNameColor: "#f5e6d3", cardPriceColor: "#E8732A", cardDescColor: "#8a7560", cardFont: "Roboto Slab", cardFontSize: 14, cardFontWeight: "400", cardButtonText: "Adicionar", cardButtonBgColor: "#C45A2D", cardButtonTextColor: "#ffffff", modalBgColor: "#2a1a0e", modalNameColor: "#f5e6d3", modalUnitColor: "#6b5a48", modalPriceColor: "#E8732A", modalDescColor: "#8a7560", modalCtaBgColor: "#C45A2D", modalCtaTextColor: "#ffffff", modalCtaFont: "Roboto Slab", modalCtaFontSize: 16, modalCtaFontWeight: "600", qtyLabelColor: "#8a7560", qtyBtnBgColor: "#3d2a1a", qtyBtnTextColor: "#f5e6d3", qtyNumberColor: "#f5e6d3" },
    toast: { bgColor: "#2a1a0e", borderColor: "#C45A2D", titleColor: "#f5e6d3", subtitleColor: "#8a7560", iconCheckColor: "#ffffff", iconBgColor: "#C45A2D", closeButtonColor: "#6b5a48" },
    cartLanding: { modalBgColor: "#1a1008", headerTextColor: "#f5e6d3", headerCloseColor: "#6b5a48", headerIconColor: "#C45A2D", itemBgColor: "#2a1a0e", itemBorderColor: "#3d2a1a", itemNameColor: "#f5e6d3", itemPriceColor: "#E8732A", itemTrashColor: "#ef4444", qtyBtnBgColor: "#3d2a1a", qtyBtnTextColor: "#f5e6d3", qtyNumberColor: "#f5e6d3", obsBgColor: "#2a1a0e", obsBorderColor: "#3d2a1a", obsTextColor: "#8a7560", totalLabelColor: "#8a7560", totalValueColor: "#E8732A", ctaBgColor: "#C45A2D", ctaTextColor: "#ffffff", clearLinkColor: "#ef4444" },
    cartMenu: { modalBgColor: "#1a1008", headerTextColor: "#f5e6d3", headerCloseColor: "#6b5a48", headerIconColor: "#C45A2D", itemBgColor: "#2a1a0e", itemBorderColor: "#3d2a1a", itemNameColor: "#f5e6d3", itemPriceColor: "#E8732A", itemTrashColor: "#ef4444", qtyBtnBgColor: "#3d2a1a", qtyBtnTextColor: "#f5e6d3", qtyNumberColor: "#f5e6d3", obsBgColor: "#2a1a0e", obsBorderColor: "#3d2a1a", obsTextColor: "#8a7560", totalLabelColor: "#8a7560", totalValueColor: "#E8732A", ctaBgColor: "#C45A2D", ctaTextColor: "#ffffff", clearLinkColor: "#ef4444" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#E8732A", label: "AVALIAÇÕES", labelFont: "Roboto Slab", labelFontSize: 14, labelFontWeight: "500", labelColor: "#C45A2D", headlineFont: "Playfair Display", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#f5e6d3", ratingNumberColor: "#f5e6d3", ratingTotalColor: "#6b5a48", cardBgColor: "#2a1a0e", cardNameColor: "#f5e6d3", cardDateColor: "#6b5a48", cardTextColor: "#b8a898", ctaBgColor: "#C45A2D", ctaTextColor: "#ffffff", ctaFont: "Roboto Slab", ctaFontSize: 14, ctaFontWeight: "600", bgColor: "#1a1008", bgOverlayOpacity: 0, bgOverlayColor: "#000000" },
    feedbacks: { starColor: "#E8732A" },
    info: { label: "LOCALIZAÇÃO", labelFont: "Roboto Slab", labelFontSize: 14, labelFontWeight: "500", labelColor: "#C45A2D", headline: "Venha nos visitar", headlineFont: "Playfair Display", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#f5e6d3", subheadline: "Estamos esperando por você", subheadlineFont: "Roboto Slab", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#8a7560", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 50, mapPinColor: "#C45A2D", mapBtnBgColor: "#C45A2D", mapBtnTextColor: "#ffffff", mapBtnFont: "Roboto Slab", mapBtnFontSize: 14, mapBtnFontWeight: "600", mapBtnLabel: "Como Chegar", addressIconColor: "#C45A2D", addressIconBgColor: "#3d2a1a", addressTitleColor: "#f5e6d3", addressTextColor: "#8a7560", addressFont: "Roboto Slab", addressFontSize: 14, addressFontWeight: "400", phoneIconColor: "#C45A2D", phoneIconBgColor: "#3d2a1a", phoneTitleColor: "#f5e6d3", phoneTextColor: "#8a7560", phoneFont: "Roboto Slab", phoneFontSize: 14, phoneFontWeight: "400", hoursIconColor: "#C45A2D", hoursIconBgColor: "#3d2a1a", hoursTitleColor: "#f5e6d3", hoursContentColor: "#8a7560", hoursLinkColor: "#C45A2D", hoursLinkFont: "Roboto Slab", hoursLinkFontSize: 14, hoursLinkFontWeight: "500", scheduleModalBg: "#2a1a0e", scheduleModalTitleColor: "#f5e6d3", scheduleModalTextColor: "#8a7560", scheduleModalStatusColor: "#22c55e", scheduleModalHighlightBg: "#3d2a1a", socialBtnBgColor: "#3d2a1a", socialIconColor: "#C45A2D", socialBtnTextColor: "#8a7560", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#1a1008", cardsBgColor: "#2a1a0e", bgOverlayOpacity: 0, bgOverlayColor: "#000000", footerBgColor: "#0d0804", footerTextColor: "#6b5a48", footerCtaBg: "#C45A2D", footerCtaTextColor: "#ffffff", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "left" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Como podemos ajudar?", buttonText: "Iniciar Conversa", popupBg: "#2a1a0e", popupTextColor: "#f5e6d3", buttonBg: "#C45A2D", buttonTextColor: "#ffffff" },
  },
};

// ============================================
// PRESET 8 — PADARIA & CAFÉ | Warm Beige
// ============================================

const padariaCafe: DesignPreset = {
  id: "padaria-cafe",
  name: "Padaria & Café",
  description: "Light mode acolhedor com tons de bege e caramelo.",
  niche: "Padarias, cafés coloniais, bistrôs matinais",
  colors: { primary: "#8B5E3C", background: "#FDF8F0", accent: "#F5EDE0" },
  themeColors: { primary: "#8B5E3C", background: "#FDF8F0", foreground: "#3D2B1F", accent: "#F5EDE0", muted: "#9C8B7A", buttonPrimary: "#8B5E3C", highlight: "#C4956A", success: "#22c55e" },
  fontFamily: "Lora",
  fontDisplay: "Playfair Display",
  borderRadius: "0.75rem",
  design: {
    home: { logoType: "text", logoSize: 80, headerBgColor: "rgba(253,248,240,0.92)", headerBehavior: "reveal_on_scroll", locationBoxBg: "rgba(139,94,60,0.08)", locationBoxText: "#9C8B7A", locationBoxIcon: "#8B5E3C", locationLabel: "", locationBoxGlassmorphism: false, scheduleBoxBg: "rgba(34,197,94,0.1)", scheduleBoxText: "#16a34a", scheduleBoxIcon: "#16a34a", scheduleLabel: "", scheduleBoxGlassmorphism: false, badgeOpenColor: "#16a34a", badgeClosedColor: "#dc2626", headline: "Pão Fresquinho Todo Dia", headlineFont: "Playfair Display", headlineFontSize: 58, headlineFontWeight: "700", headlineColor: "#3D2B1F", subheadline: "O aroma que faz você se sentir em casa", subheadlineFont: "Lora", subheadlineFontSize: 20, subheadlineFontWeight: "400", subheadlineColor: "#9C8B7A", ctaText: "Ver Produtos", ctaBgColor: "#8B5E3C", ctaTextColor: "#ffffff", ctaGradient: false, ctaGradientEnd: "#6E4A2F", ctaAction: "#cardapio", bgMediaType: "image", bgOverlayOpacity: 15, bgOverlayColor: "#FDF8F0", bgFallbackColor: "#FDF8F0" },
    products: { headline: "Nossos Produtos", subheadline: "Feitos com amor e ingredientes selecionados", maxCategories: 3, offersCategoryId: null, headlineFont: "Playfair Display", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#3D2B1F", subheadlineFont: "Lora", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#9C8B7A", cardBgColor: "#ffffff", cardNameColor: "#3D2B1F", cardPriceColor: "#8B5E3C", cardDescColor: "#9C8B7A", cardUnitColor: "#b8a898", cardBorderRadius: 12, cardBorderColor: "#E8DDD0", cardBorderWidth: 1, cardButtonText: "Adicionar", cardButtonBgColor: "#8B5E3C", cardButtonTextColor: "#ffffff", bgColor: "#FDF8F0", bgGradient: false, bgGradientFrom: "#FDF8F0", bgGradientTo: "#F5EDE0", bgGradientDirection: "to-b", bgOverlayOpacity: 0, bgOverlayColor: "#ffffff", viewAllBgColor: "transparent", viewAllTextColor: "#8B5E3C", viewAllFont: "Lora", viewAllFontSize: 14, viewAllFontWeight: "600", viewAllLabel: "Ver todos", ctaText: "Ver Cardápio Completo", ctaBgColor: "#8B5E3C", ctaTextColor: "#ffffff", ctaGradient: false, ctaGradientEnd: "#6E4A2F", ctaFont: "Lora", ctaFontSize: 16, ctaFontWeight: "600", ctaAction: "#cardapio" },
    about: { preHeadline: "NOSSA HISTÓRIA", preHeadlineFont: "Lora", preHeadlineFontSize: 14, preHeadlineFontWeight: "500", preHeadlineColor: "#8B5E3C", headline: "Sobre Nós", headlineFont: "Playfair Display", headlineFontSize: 48, headlineFontWeight: "700", headlineColor: "#3D2B1F", imageRadius: 16, ownerNameFont: "Playfair Display", ownerNameFontSize: 20, ownerNameFontWeight: "700", ownerNameColor: "#3D2B1F", ownerTitleColor: "#9C8B7A", storytellingFont: "Lora", storytellingFontSize: 18, storytellingFontWeight: "400", storytellingColor: "#5C4A3A", signatureColor: "#8B5E3C", showSignature: true, bgOverlayOpacity: 0, bgOverlayColor: "#ffffff", bgFallbackColor: "#F5EDE0", imagePosition: "right", showDecorative: true, textColor: "#3D2B1F" },
    menu: { menuSectionTitle: "Cardápio", panelBgColor: "#FDF8F0", panelOverlayOpacity: 70, panelOverlayColor: "#F5EDE0", headerTextColor: "#3D2B1F", searchBorderColor: "#E8DDD0", searchBgColor: "#ffffff", searchTextColor: "#3D2B1F", searchPlaceholderColor: "#b8a898", searchIconColor: "#9C8B7A", categoryNameColor: "#8B5E3C", filterActiveBgColor: "#8B5E3C", filterActiveTextColor: "#ffffff", filterInactiveBgColor: "#F5EDE0", filterInactiveTextColor: "#9C8B7A", cardBgColor: "#ffffff", cardBorderColor: "#E8DDD0", cardBorderWidth: 1, cardBorderRadius: 12, cardNameColor: "#3D2B1F", cardPriceColor: "#8B5E3C", cardDescColor: "#9C8B7A", cardFont: "Lora", cardFontSize: 14, cardFontWeight: "400", cardButtonText: "Adicionar", cardButtonBgColor: "#8B5E3C", cardButtonTextColor: "#ffffff", modalBgColor: "#ffffff", modalNameColor: "#3D2B1F", modalUnitColor: "#b8a898", modalPriceColor: "#8B5E3C", modalDescColor: "#9C8B7A", modalCtaBgColor: "#8B5E3C", modalCtaTextColor: "#ffffff", modalCtaFont: "Lora", modalCtaFontSize: 16, modalCtaFontWeight: "600", qtyLabelColor: "#9C8B7A", qtyBtnBgColor: "#F5EDE0", qtyBtnTextColor: "#3D2B1F", qtyNumberColor: "#3D2B1F" },
    toast: { bgColor: "#ffffff", borderColor: "#8B5E3C", titleColor: "#3D2B1F", subtitleColor: "#9C8B7A", iconCheckColor: "#ffffff", iconBgColor: "#8B5E3C", closeButtonColor: "#b8a898" },
    cartLanding: { modalBgColor: "#FDF8F0", headerTextColor: "#3D2B1F", headerCloseColor: "#9C8B7A", headerIconColor: "#8B5E3C", itemBgColor: "#ffffff", itemBorderColor: "#E8DDD0", itemNameColor: "#3D2B1F", itemPriceColor: "#8B5E3C", itemTrashColor: "#dc2626", qtyBtnBgColor: "#F5EDE0", qtyBtnTextColor: "#3D2B1F", qtyNumberColor: "#3D2B1F", obsBgColor: "#ffffff", obsBorderColor: "#E8DDD0", obsTextColor: "#9C8B7A", totalLabelColor: "#9C8B7A", totalValueColor: "#8B5E3C", ctaBgColor: "#8B5E3C", ctaTextColor: "#ffffff", clearLinkColor: "#dc2626" },
    cartMenu: { modalBgColor: "#FDF8F0", headerTextColor: "#3D2B1F", headerCloseColor: "#9C8B7A", headerIconColor: "#8B5E3C", itemBgColor: "#ffffff", itemBorderColor: "#E8DDD0", itemNameColor: "#3D2B1F", itemPriceColor: "#8B5E3C", itemTrashColor: "#dc2626", qtyBtnBgColor: "#F5EDE0", qtyBtnTextColor: "#3D2B1F", qtyNumberColor: "#3D2B1F", obsBgColor: "#ffffff", obsBorderColor: "#E8DDD0", obsTextColor: "#9C8B7A", totalLabelColor: "#9C8B7A", totalValueColor: "#8B5E3C", ctaBgColor: "#8B5E3C", ctaTextColor: "#ffffff", clearLinkColor: "#dc2626" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#C4956A", label: "AVALIAÇÕES", labelFont: "Lora", labelFontSize: 14, labelFontWeight: "500", labelColor: "#8B5E3C", headlineFont: "Playfair Display", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#3D2B1F", ratingNumberColor: "#3D2B1F", ratingTotalColor: "#b8a898", cardBgColor: "#ffffff", cardNameColor: "#3D2B1F", cardDateColor: "#b8a898", cardTextColor: "#5C4A3A", ctaBgColor: "#8B5E3C", ctaTextColor: "#ffffff", ctaFont: "Lora", ctaFontSize: 14, ctaFontWeight: "600", bgColor: "#F5EDE0", bgOverlayOpacity: 0, bgOverlayColor: "#ffffff" },
    feedbacks: { starColor: "#C4956A" },
    info: { label: "LOCALIZAÇÃO", labelFont: "Lora", labelFontSize: 14, labelFontWeight: "500", labelColor: "#8B5E3C", headline: "Venha nos visitar", headlineFont: "Playfair Display", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#3D2B1F", subheadline: "Estamos esperando por você", subheadlineFont: "Lora", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#9C8B7A", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 20, mapPinColor: "#8B5E3C", mapBtnBgColor: "#8B5E3C", mapBtnTextColor: "#ffffff", mapBtnFont: "Lora", mapBtnFontSize: 14, mapBtnFontWeight: "600", mapBtnLabel: "Como Chegar", addressIconColor: "#8B5E3C", addressIconBgColor: "#F5EDE0", addressTitleColor: "#3D2B1F", addressTextColor: "#9C8B7A", addressFont: "Lora", addressFontSize: 14, addressFontWeight: "400", phoneIconColor: "#8B5E3C", phoneIconBgColor: "#F5EDE0", phoneTitleColor: "#3D2B1F", phoneTextColor: "#9C8B7A", phoneFont: "Lora", phoneFontSize: 14, phoneFontWeight: "400", hoursIconColor: "#8B5E3C", hoursIconBgColor: "#F5EDE0", hoursTitleColor: "#3D2B1F", hoursContentColor: "#9C8B7A", hoursLinkColor: "#8B5E3C", hoursLinkFont: "Lora", hoursLinkFontSize: 14, hoursLinkFontWeight: "500", scheduleModalBg: "#ffffff", scheduleModalTitleColor: "#3D2B1F", scheduleModalTextColor: "#9C8B7A", scheduleModalStatusColor: "#16a34a", scheduleModalHighlightBg: "#F5EDE0", socialBtnBgColor: "#F5EDE0", socialIconColor: "#8B5E3C", socialBtnTextColor: "#9C8B7A", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#FDF8F0", cardsBgColor: "#ffffff", bgOverlayOpacity: 0, bgOverlayColor: "#ffffff", footerBgColor: "#F5EDE0", footerTextColor: "#9C8B7A", footerCtaBg: "#8B5E3C", footerCtaTextColor: "#ffffff", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "center" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Como podemos ajudar?", buttonText: "Iniciar Conversa", popupBg: "#ffffff", popupTextColor: "#3D2B1F", buttonBg: "#8B5E3C", buttonTextColor: "#ffffff" },
  },
};

// ============================================
// PRESET 9 — MARMITARIA | Orange Comfort
// ============================================

const marmitaria: DesignPreset = {
  id: "marmitaria",
  name: "Marmitaria",
  description: "Light mode acessível com tons de laranja e mostarda.",
  niche: "Marmitas, comida caseira, quentinhas, self-service",
  colors: { primary: "#D97706", background: "#FFFBF0", accent: "#FEF3C7" },
  themeColors: { primary: "#D97706", background: "#FFFBF0", foreground: "#451A03", accent: "#FEF3C7", muted: "#92400E", buttonPrimary: "#D97706", highlight: "#F59E0B", success: "#22c55e" },
  fontFamily: "Nunito",
  fontDisplay: "Nunito",
  borderRadius: "1rem",
  design: {
    home: { logoType: "text", logoSize: 80, headerBgColor: "rgba(255,251,240,0.92)", headerBehavior: "always_visible", locationBoxBg: "rgba(217,119,6,0.1)", locationBoxText: "#92400E", locationBoxIcon: "#D97706", locationLabel: "", locationBoxGlassmorphism: false, scheduleBoxBg: "rgba(34,197,94,0.1)", scheduleBoxText: "#16a34a", scheduleBoxIcon: "#16a34a", scheduleLabel: "", scheduleBoxGlassmorphism: false, badgeOpenColor: "#16a34a", badgeClosedColor: "#dc2626", headline: "Comida de Verdade, Feita com Amor", headlineFont: "Nunito", headlineFontSize: 56, headlineFontWeight: "800", headlineColor: "#451A03", subheadline: "Tempero caseiro que alimenta a alma", subheadlineFont: "Nunito", subheadlineFontSize: 20, subheadlineFontWeight: "400", subheadlineColor: "#92400E", ctaText: "Fazer Pedido", ctaBgColor: "#D97706", ctaTextColor: "#ffffff", ctaGradient: false, ctaGradientEnd: "#B45309", ctaAction: "#cardapio", bgMediaType: "image", bgOverlayOpacity: 15, bgOverlayColor: "#FFFBF0", bgFallbackColor: "#FFFBF0" },
    products: { headline: "Nosso Cardápio", subheadline: "Escolha sua marmita do dia", maxCategories: 3, offersCategoryId: null, headlineFont: "Nunito", headlineFontSize: 40, headlineFontWeight: "800", headlineColor: "#451A03", subheadlineFont: "Nunito", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#92400E", cardBgColor: "#ffffff", cardNameColor: "#451A03", cardPriceColor: "#D97706", cardDescColor: "#92400E", cardUnitColor: "#b8860b", cardBorderRadius: 16, cardBorderColor: "#FDE68A", cardBorderWidth: 1, cardButtonText: "Pedir", cardButtonBgColor: "#D97706", cardButtonTextColor: "#ffffff", bgColor: "#FFFBF0", bgGradient: false, bgGradientFrom: "#FFFBF0", bgGradientTo: "#FEF3C7", bgGradientDirection: "to-b", bgOverlayOpacity: 0, bgOverlayColor: "#ffffff", viewAllBgColor: "transparent", viewAllTextColor: "#D97706", viewAllFont: "Nunito", viewAllFontSize: 14, viewAllFontWeight: "700", viewAllLabel: "Ver todas", ctaText: "Ver Cardápio Completo", ctaBgColor: "#D97706", ctaTextColor: "#ffffff", ctaGradient: false, ctaGradientEnd: "#B45309", ctaFont: "Nunito", ctaFontSize: 16, ctaFontWeight: "700", ctaAction: "#cardapio" },
    about: { preHeadline: "NOSSA COZINHA", preHeadlineFont: "Nunito", preHeadlineFontSize: 14, preHeadlineFontWeight: "700", preHeadlineColor: "#D97706", headline: "Sobre Nós", headlineFont: "Nunito", headlineFontSize: 48, headlineFontWeight: "800", headlineColor: "#451A03", imageRadius: 20, ownerNameFont: "Nunito", ownerNameFontSize: 20, ownerNameFontWeight: "700", ownerNameColor: "#451A03", ownerTitleColor: "#92400E", storytellingFont: "Nunito", storytellingFontSize: 18, storytellingFontWeight: "400", storytellingColor: "#78350F", signatureColor: "#D97706", showSignature: true, bgOverlayOpacity: 0, bgOverlayColor: "#ffffff", bgFallbackColor: "#FEF3C7", imagePosition: "left", showDecorative: false, textColor: "#451A03" },
    menu: { menuSectionTitle: "Cardápio", panelBgColor: "#FFFBF0", panelOverlayOpacity: 70, panelOverlayColor: "#FEF3C7", headerTextColor: "#451A03", searchBorderColor: "#FDE68A", searchBgColor: "#ffffff", searchTextColor: "#451A03", searchPlaceholderColor: "#b8860b", searchIconColor: "#92400E", categoryNameColor: "#D97706", filterActiveBgColor: "#D97706", filterActiveTextColor: "#ffffff", filterInactiveBgColor: "#FEF3C7", filterInactiveTextColor: "#92400E", cardBgColor: "#ffffff", cardBorderColor: "#FDE68A", cardBorderWidth: 1, cardBorderRadius: 16, cardNameColor: "#451A03", cardPriceColor: "#D97706", cardDescColor: "#92400E", cardFont: "Nunito", cardFontSize: 14, cardFontWeight: "400", cardButtonText: "Pedir", cardButtonBgColor: "#D97706", cardButtonTextColor: "#ffffff", modalBgColor: "#ffffff", modalNameColor: "#451A03", modalUnitColor: "#b8860b", modalPriceColor: "#D97706", modalDescColor: "#92400E", modalCtaBgColor: "#D97706", modalCtaTextColor: "#ffffff", modalCtaFont: "Nunito", modalCtaFontSize: 16, modalCtaFontWeight: "700", qtyLabelColor: "#92400E", qtyBtnBgColor: "#FEF3C7", qtyBtnTextColor: "#451A03", qtyNumberColor: "#451A03" },
    toast: { bgColor: "#ffffff", borderColor: "#D97706", titleColor: "#451A03", subtitleColor: "#92400E", iconCheckColor: "#ffffff", iconBgColor: "#D97706", closeButtonColor: "#b8860b" },
    cartLanding: { modalBgColor: "#FFFBF0", headerTextColor: "#451A03", headerCloseColor: "#92400E", headerIconColor: "#D97706", itemBgColor: "#ffffff", itemBorderColor: "#FDE68A", itemNameColor: "#451A03", itemPriceColor: "#D97706", itemTrashColor: "#dc2626", qtyBtnBgColor: "#FEF3C7", qtyBtnTextColor: "#451A03", qtyNumberColor: "#451A03", obsBgColor: "#ffffff", obsBorderColor: "#FDE68A", obsTextColor: "#92400E", totalLabelColor: "#92400E", totalValueColor: "#D97706", ctaBgColor: "#D97706", ctaTextColor: "#ffffff", clearLinkColor: "#dc2626" },
    cartMenu: { modalBgColor: "#FFFBF0", headerTextColor: "#451A03", headerCloseColor: "#92400E", headerIconColor: "#D97706", itemBgColor: "#ffffff", itemBorderColor: "#FDE68A", itemNameColor: "#451A03", itemPriceColor: "#D97706", itemTrashColor: "#dc2626", qtyBtnBgColor: "#FEF3C7", qtyBtnTextColor: "#451A03", qtyNumberColor: "#451A03", obsBgColor: "#ffffff", obsBorderColor: "#FDE68A", obsTextColor: "#92400E", totalLabelColor: "#92400E", totalValueColor: "#D97706", ctaBgColor: "#D97706", ctaTextColor: "#ffffff", clearLinkColor: "#dc2626" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#F59E0B", label: "AVALIAÇÕES", labelFont: "Nunito", labelFontSize: 14, labelFontWeight: "700", labelColor: "#D97706", headlineFont: "Nunito", headlineFontSize: 40, headlineFontWeight: "800", headlineColor: "#451A03", ratingNumberColor: "#451A03", ratingTotalColor: "#b8860b", cardBgColor: "#ffffff", cardNameColor: "#451A03", cardDateColor: "#b8860b", cardTextColor: "#78350F", ctaBgColor: "#D97706", ctaTextColor: "#ffffff", ctaFont: "Nunito", ctaFontSize: 14, ctaFontWeight: "700", bgColor: "#FEF3C7", bgOverlayOpacity: 0, bgOverlayColor: "#ffffff" },
    feedbacks: { starColor: "#F59E0B" },
    info: { label: "LOCALIZAÇÃO", labelFont: "Nunito", labelFontSize: 14, labelFontWeight: "700", labelColor: "#D97706", headline: "Venha nos visitar", headlineFont: "Nunito", headlineFontSize: 40, headlineFontWeight: "800", headlineColor: "#451A03", subheadline: "Estamos esperando por você", subheadlineFont: "Nunito", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#92400E", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 15, mapPinColor: "#D97706", mapBtnBgColor: "#D97706", mapBtnTextColor: "#ffffff", mapBtnFont: "Nunito", mapBtnFontSize: 14, mapBtnFontWeight: "700", mapBtnLabel: "Como Chegar", addressIconColor: "#D97706", addressIconBgColor: "#FEF3C7", addressTitleColor: "#451A03", addressTextColor: "#92400E", addressFont: "Nunito", addressFontSize: 14, addressFontWeight: "400", phoneIconColor: "#D97706", phoneIconBgColor: "#FEF3C7", phoneTitleColor: "#451A03", phoneTextColor: "#92400E", phoneFont: "Nunito", phoneFontSize: 14, phoneFontWeight: "400", hoursIconColor: "#D97706", hoursIconBgColor: "#FEF3C7", hoursTitleColor: "#451A03", hoursContentColor: "#92400E", hoursLinkColor: "#D97706", hoursLinkFont: "Nunito", hoursLinkFontSize: 14, hoursLinkFontWeight: "600", scheduleModalBg: "#ffffff", scheduleModalTitleColor: "#451A03", scheduleModalTextColor: "#92400E", scheduleModalStatusColor: "#16a34a", scheduleModalHighlightBg: "#FEF3C7", socialBtnBgColor: "#FEF3C7", socialIconColor: "#D97706", socialBtnTextColor: "#92400E", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#FFFBF0", cardsBgColor: "#ffffff", bgOverlayOpacity: 0, bgOverlayColor: "#ffffff", footerBgColor: "#FEF3C7", footerTextColor: "#92400E", footerCtaBg: "#D97706", footerCtaTextColor: "#ffffff", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "center" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Como podemos ajudar?", buttonText: "Iniciar Conversa", popupBg: "#ffffff", popupTextColor: "#451A03", buttonBg: "#D97706", buttonTextColor: "#ffffff" },
  },
};

// ============================================
// PRESET 10 — BOTECO & PETISCOS | Dark Amber
// ============================================

const botecoPetiscos: DesignPreset = {
  id: "boteco-petiscos",
  name: "Boteco & Petiscos",
  description: "Dark mode descontraído com tons de âmbar e cerveja.",
  niche: "Bares, botecos, porções, petiscos, happy hour",
  colors: { primary: "#D4A017", background: "#0F0D08", accent: "#1C1A10" },
  themeColors: { primary: "#D4A017", background: "#0F0D08", foreground: "#F5E6B8", accent: "#1C1A10", muted: "#8B7D5E", buttonPrimary: "#D4A017", highlight: "#E8B830", success: "#22c55e" },
  fontFamily: "Barlow",
  fontDisplay: "Barlow Condensed",
  borderRadius: "0.5rem",
  design: {
    home: { logoType: "text", logoSize: 80, headerBgColor: "rgba(15,13,8,0.85)", headerBehavior: "always_visible", locationBoxBg: "rgba(212,160,23,0.12)", locationBoxText: "#8B7D5E", locationBoxIcon: "#D4A017", locationLabel: "", locationBoxGlassmorphism: true, scheduleBoxBg: "rgba(34,197,94,0.15)", scheduleBoxText: "#22c55e", scheduleBoxIcon: "#22c55e", scheduleLabel: "", scheduleBoxGlassmorphism: true, badgeOpenColor: "#22c55e", badgeClosedColor: "#ef4444", headline: "O Melhor Boteco da Cidade", headlineFont: "Barlow Condensed", headlineFontSize: 64, headlineFontWeight: "700", headlineColor: "#F5E6B8", subheadline: "Cerveja gelada, petiscos e boa companhia", subheadlineFont: "Barlow", subheadlineFontSize: 20, subheadlineFontWeight: "400", subheadlineColor: "#8B7D5E", ctaText: "Ver Petiscos", ctaBgColor: "#D4A017", ctaTextColor: "#0F0D08", ctaGradient: false, ctaGradientEnd: "#B08A14", ctaAction: "#cardapio", bgMediaType: "image", bgOverlayOpacity: 60, bgOverlayColor: "#0F0D08", bgFallbackColor: "#0F0D08" },
    products: { headline: "Nossos Petiscos", subheadline: "Porções que combinam com tudo", maxCategories: 3, offersCategoryId: null, headlineFont: "Barlow Condensed", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#F5E6B8", subheadlineFont: "Barlow", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#8B7D5E", cardBgColor: "#1C1A10", cardNameColor: "#F5E6B8", cardPriceColor: "#E8B830", cardDescColor: "#8B7D5E", cardUnitColor: "#6B5F45", cardBorderRadius: 8, cardBorderColor: "#2D2A1C", cardBorderWidth: 1, cardButtonText: "Pedir", cardButtonBgColor: "#D4A017", cardButtonTextColor: "#0F0D08", bgColor: "#0F0D08", bgGradient: false, bgGradientFrom: "#0F0D08", bgGradientTo: "#1C1A10", bgGradientDirection: "to-b", bgOverlayOpacity: 0, bgOverlayColor: "#000000", viewAllBgColor: "transparent", viewAllTextColor: "#D4A017", viewAllFont: "Barlow", viewAllFontSize: 14, viewAllFontWeight: "600", viewAllLabel: "Ver todas", ctaText: "Ver Cardápio Completo", ctaBgColor: "#D4A017", ctaTextColor: "#0F0D08", ctaGradient: false, ctaGradientEnd: "#B08A14", ctaFont: "Barlow", ctaFontSize: 16, ctaFontWeight: "600", ctaAction: "#cardapio" },
    about: { preHeadline: "NOSSA HISTÓRIA", preHeadlineFont: "Barlow", preHeadlineFontSize: 14, preHeadlineFontWeight: "600", preHeadlineColor: "#D4A017", headline: "Sobre Nós", headlineFont: "Barlow Condensed", headlineFontSize: 48, headlineFontWeight: "700", headlineColor: "#F5E6B8", imageRadius: 12, ownerNameFont: "Barlow Condensed", ownerNameFontSize: 22, ownerNameFontWeight: "700", ownerNameColor: "#F5E6B8", ownerTitleColor: "#8B7D5E", storytellingFont: "Barlow", storytellingFontSize: 18, storytellingFontWeight: "400", storytellingColor: "#B8A888", signatureColor: "#D4A017", showSignature: true, bgOverlayOpacity: 0, bgOverlayColor: "#000000", bgFallbackColor: "#0F0D08", imagePosition: "right", showDecorative: true, textColor: "#F5E6B8" },
    menu: { menuSectionTitle: "Cardápio", panelBgColor: "#0F0D08", panelOverlayOpacity: 80, panelOverlayColor: "#080604", headerTextColor: "#F5E6B8", searchBorderColor: "#2D2A1C", searchBgColor: "#1C1A10", searchTextColor: "#F5E6B8", searchPlaceholderColor: "#6B5F45", searchIconColor: "#6B5F45", categoryNameColor: "#D4A017", filterActiveBgColor: "#D4A017", filterActiveTextColor: "#0F0D08", filterInactiveBgColor: "#2D2A1C", filterInactiveTextColor: "#8B7D5E", cardBgColor: "#1C1A10", cardBorderColor: "#2D2A1C", cardBorderWidth: 1, cardBorderRadius: 8, cardNameColor: "#F5E6B8", cardPriceColor: "#E8B830", cardDescColor: "#8B7D5E", cardFont: "Barlow", cardFontSize: 14, cardFontWeight: "400", cardButtonText: "Pedir", cardButtonBgColor: "#D4A017", cardButtonTextColor: "#0F0D08", modalBgColor: "#1C1A10", modalNameColor: "#F5E6B8", modalUnitColor: "#6B5F45", modalPriceColor: "#E8B830", modalDescColor: "#8B7D5E", modalCtaBgColor: "#D4A017", modalCtaTextColor: "#0F0D08", modalCtaFont: "Barlow", modalCtaFontSize: 16, modalCtaFontWeight: "600", qtyLabelColor: "#8B7D5E", qtyBtnBgColor: "#2D2A1C", qtyBtnTextColor: "#F5E6B8", qtyNumberColor: "#F5E6B8" },
    toast: { bgColor: "#1C1A10", borderColor: "#D4A017", titleColor: "#F5E6B8", subtitleColor: "#8B7D5E", iconCheckColor: "#0F0D08", iconBgColor: "#D4A017", closeButtonColor: "#6B5F45" },
    cartLanding: { modalBgColor: "#0F0D08", headerTextColor: "#F5E6B8", headerCloseColor: "#6B5F45", headerIconColor: "#D4A017", itemBgColor: "#1C1A10", itemBorderColor: "#2D2A1C", itemNameColor: "#F5E6B8", itemPriceColor: "#E8B830", itemTrashColor: "#ef4444", qtyBtnBgColor: "#2D2A1C", qtyBtnTextColor: "#F5E6B8", qtyNumberColor: "#F5E6B8", obsBgColor: "#1C1A10", obsBorderColor: "#2D2A1C", obsTextColor: "#8B7D5E", totalLabelColor: "#8B7D5E", totalValueColor: "#E8B830", ctaBgColor: "#D4A017", ctaTextColor: "#0F0D08", clearLinkColor: "#ef4444" },
    cartMenu: { modalBgColor: "#0F0D08", headerTextColor: "#F5E6B8", headerCloseColor: "#6B5F45", headerIconColor: "#D4A017", itemBgColor: "#1C1A10", itemBorderColor: "#2D2A1C", itemNameColor: "#F5E6B8", itemPriceColor: "#E8B830", itemTrashColor: "#ef4444", qtyBtnBgColor: "#2D2A1C", qtyBtnTextColor: "#F5E6B8", qtyNumberColor: "#F5E6B8", obsBgColor: "#1C1A10", obsBorderColor: "#2D2A1C", obsTextColor: "#8B7D5E", totalLabelColor: "#8B7D5E", totalValueColor: "#E8B830", ctaBgColor: "#D4A017", ctaTextColor: "#0F0D08", clearLinkColor: "#ef4444" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#E8B830", label: "AVALIAÇÕES", labelFont: "Barlow", labelFontSize: 14, labelFontWeight: "600", labelColor: "#D4A017", headlineFont: "Barlow Condensed", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#F5E6B8", ratingNumberColor: "#F5E6B8", ratingTotalColor: "#6B5F45", cardBgColor: "#1C1A10", cardNameColor: "#F5E6B8", cardDateColor: "#6B5F45", cardTextColor: "#B8A888", ctaBgColor: "#D4A017", ctaTextColor: "#0F0D08", ctaFont: "Barlow", ctaFontSize: 14, ctaFontWeight: "600", bgColor: "#0F0D08", bgOverlayOpacity: 0, bgOverlayColor: "#000000" },
    feedbacks: { starColor: "#E8B830" },
    info: { label: "LOCALIZAÇÃO", labelFont: "Barlow", labelFontSize: 14, labelFontWeight: "600", labelColor: "#D4A017", headline: "Venha nos visitar", headlineFont: "Barlow Condensed", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#F5E6B8", subheadline: "Estamos esperando por você", subheadlineFont: "Barlow", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#8B7D5E", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 50, mapPinColor: "#D4A017", mapBtnBgColor: "#D4A017", mapBtnTextColor: "#0F0D08", mapBtnFont: "Barlow", mapBtnFontSize: 14, mapBtnFontWeight: "600", mapBtnLabel: "Como Chegar", addressIconColor: "#D4A017", addressIconBgColor: "#2D2A1C", addressTitleColor: "#F5E6B8", addressTextColor: "#8B7D5E", addressFont: "Barlow", addressFontSize: 14, addressFontWeight: "400", phoneIconColor: "#D4A017", phoneIconBgColor: "#2D2A1C", phoneTitleColor: "#F5E6B8", phoneTextColor: "#8B7D5E", phoneFont: "Barlow", phoneFontSize: 14, phoneFontWeight: "400", hoursIconColor: "#D4A017", hoursIconBgColor: "#2D2A1C", hoursTitleColor: "#F5E6B8", hoursContentColor: "#8B7D5E", hoursLinkColor: "#D4A017", hoursLinkFont: "Barlow", hoursLinkFontSize: 14, hoursLinkFontWeight: "500", scheduleModalBg: "#1C1A10", scheduleModalTitleColor: "#F5E6B8", scheduleModalTextColor: "#8B7D5E", scheduleModalStatusColor: "#22c55e", scheduleModalHighlightBg: "#2D2A1C", socialBtnBgColor: "#2D2A1C", socialIconColor: "#D4A017", socialBtnTextColor: "#8B7D5E", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#0F0D08", cardsBgColor: "#1C1A10", bgOverlayOpacity: 0, bgOverlayColor: "#000000", footerBgColor: "#080604", footerTextColor: "#6B5F45", footerCtaBg: "#D4A017", footerCtaTextColor: "#0F0D08", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "left" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Como podemos ajudar?", buttonText: "Iniciar Conversa", popupBg: "#1C1A10", popupTextColor: "#F5E6B8", buttonBg: "#D4A017", buttonTextColor: "#0F0D08" },
  },
};

// ============================================
// PRESET 11 — SORVETE & GELATO | Pastel Blue
// ============================================

const sorveteGelato: DesignPreset = {
  id: "sorvete-gelato",
  name: "Sorvete & Gelato",
  description: "Light mode fresco com tons de azul pastel e lilás.",
  niche: "Sorveterias, gelaterias, açaí gourmet, frozen yogurt",
  colors: { primary: "#6B8DD6", background: "#F5F8FF", accent: "#E8EEFF" },
  themeColors: { primary: "#6B8DD6", background: "#F5F8FF", foreground: "#2D3A5C", accent: "#E8EEFF", muted: "#8896B8", buttonPrimary: "#6B8DD6", highlight: "#A78BFA", success: "#22c55e" },
  fontFamily: "Quicksand",
  fontDisplay: "Quicksand",
  borderRadius: "1.25rem",
  design: {
    home: { logoType: "text", logoSize: 80, headerBgColor: "rgba(245,248,255,0.92)", headerBehavior: "reveal_on_scroll", locationBoxBg: "rgba(107,141,214,0.1)", locationBoxText: "#8896B8", locationBoxIcon: "#6B8DD6", locationLabel: "", locationBoxGlassmorphism: false, scheduleBoxBg: "rgba(34,197,94,0.1)", scheduleBoxText: "#16a34a", scheduleBoxIcon: "#16a34a", scheduleLabel: "", scheduleBoxGlassmorphism: false, badgeOpenColor: "#16a34a", badgeClosedColor: "#ef4444", headline: "Sabores que Refrescam", headlineFont: "Quicksand", headlineFontSize: 58, headlineFontWeight: "700", headlineColor: "#2D3A5C", subheadline: "Gelato artesanal feito com paixão", subheadlineFont: "Quicksand", subheadlineFontSize: 20, subheadlineFontWeight: "500", subheadlineColor: "#8896B8", ctaText: "Ver Sabores", ctaBgColor: "#6B8DD6", ctaTextColor: "#ffffff", ctaGradient: true, ctaGradientEnd: "#A78BFA", ctaAction: "#cardapio", bgMediaType: "image", bgOverlayOpacity: 10, bgOverlayColor: "#F5F8FF", bgFallbackColor: "#F5F8FF" },
    products: { headline: "Nossos Sabores", subheadline: "Cremosidade em cada colherada", maxCategories: 3, offersCategoryId: null, headlineFont: "Quicksand", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#2D3A5C", subheadlineFont: "Quicksand", subheadlineFontSize: 18, subheadlineFontWeight: "500", subheadlineColor: "#8896B8", cardBgColor: "#ffffff", cardNameColor: "#2D3A5C", cardPriceColor: "#6B8DD6", cardDescColor: "#8896B8", cardUnitColor: "#A8B4D0", cardBorderRadius: 20, cardBorderColor: "#D6E0F5", cardBorderWidth: 1, cardButtonText: "Quero!", cardButtonBgColor: "#6B8DD6", cardButtonTextColor: "#ffffff", bgColor: "#F5F8FF", bgGradient: false, bgGradientFrom: "#F5F8FF", bgGradientTo: "#E8EEFF", bgGradientDirection: "to-b", bgOverlayOpacity: 0, bgOverlayColor: "#ffffff", viewAllBgColor: "transparent", viewAllTextColor: "#6B8DD6", viewAllFont: "Quicksand", viewAllFontSize: 14, viewAllFontWeight: "700", viewAllLabel: "Ver todos", ctaText: "Ver Todos os Sabores", ctaBgColor: "#6B8DD6", ctaTextColor: "#ffffff", ctaGradient: true, ctaGradientEnd: "#A78BFA", ctaFont: "Quicksand", ctaFontSize: 16, ctaFontWeight: "700", ctaAction: "#cardapio" },
    about: { preHeadline: "NOSSA PAIXÃO", preHeadlineFont: "Quicksand", preHeadlineFontSize: 14, preHeadlineFontWeight: "700", preHeadlineColor: "#6B8DD6", headline: "Sobre Nós", headlineFont: "Quicksand", headlineFontSize: 48, headlineFontWeight: "700", headlineColor: "#2D3A5C", imageRadius: 24, ownerNameFont: "Quicksand", ownerNameFontSize: 20, ownerNameFontWeight: "700", ownerNameColor: "#2D3A5C", ownerTitleColor: "#8896B8", storytellingFont: "Quicksand", storytellingFontSize: 18, storytellingFontWeight: "500", storytellingColor: "#4A5A7C", signatureColor: "#A78BFA", showSignature: true, bgOverlayOpacity: 0, bgOverlayColor: "#ffffff", bgFallbackColor: "#E8EEFF", imagePosition: "right", showDecorative: true, textColor: "#2D3A5C" },
    menu: { menuSectionTitle: "Cardápio", panelBgColor: "#F5F8FF", panelOverlayOpacity: 70, panelOverlayColor: "#E8EEFF", headerTextColor: "#2D3A5C", searchBorderColor: "#D6E0F5", searchBgColor: "#ffffff", searchTextColor: "#2D3A5C", searchPlaceholderColor: "#A8B4D0", searchIconColor: "#8896B8", categoryNameColor: "#6B8DD6", filterActiveBgColor: "#6B8DD6", filterActiveTextColor: "#ffffff", filterInactiveBgColor: "#E8EEFF", filterInactiveTextColor: "#8896B8", cardBgColor: "#ffffff", cardBorderColor: "#D6E0F5", cardBorderWidth: 1, cardBorderRadius: 20, cardNameColor: "#2D3A5C", cardPriceColor: "#6B8DD6", cardDescColor: "#8896B8", cardFont: "Quicksand", cardFontSize: 14, cardFontWeight: "500", cardButtonText: "Quero!", cardButtonBgColor: "#6B8DD6", cardButtonTextColor: "#ffffff", modalBgColor: "#ffffff", modalNameColor: "#2D3A5C", modalUnitColor: "#A8B4D0", modalPriceColor: "#6B8DD6", modalDescColor: "#8896B8", modalCtaBgColor: "#6B8DD6", modalCtaTextColor: "#ffffff", modalCtaFont: "Quicksand", modalCtaFontSize: 16, modalCtaFontWeight: "700", qtyLabelColor: "#8896B8", qtyBtnBgColor: "#E8EEFF", qtyBtnTextColor: "#2D3A5C", qtyNumberColor: "#2D3A5C" },
    toast: { bgColor: "#ffffff", borderColor: "#6B8DD6", titleColor: "#2D3A5C", subtitleColor: "#8896B8", iconCheckColor: "#ffffff", iconBgColor: "#6B8DD6", closeButtonColor: "#A8B4D0" },
    cartLanding: { modalBgColor: "#F5F8FF", headerTextColor: "#2D3A5C", headerCloseColor: "#8896B8", headerIconColor: "#6B8DD6", itemBgColor: "#ffffff", itemBorderColor: "#D6E0F5", itemNameColor: "#2D3A5C", itemPriceColor: "#6B8DD6", itemTrashColor: "#ef4444", qtyBtnBgColor: "#E8EEFF", qtyBtnTextColor: "#2D3A5C", qtyNumberColor: "#2D3A5C", obsBgColor: "#ffffff", obsBorderColor: "#D6E0F5", obsTextColor: "#8896B8", totalLabelColor: "#8896B8", totalValueColor: "#6B8DD6", ctaBgColor: "#6B8DD6", ctaTextColor: "#ffffff", clearLinkColor: "#ef4444" },
    cartMenu: { modalBgColor: "#F5F8FF", headerTextColor: "#2D3A5C", headerCloseColor: "#8896B8", headerIconColor: "#6B8DD6", itemBgColor: "#ffffff", itemBorderColor: "#D6E0F5", itemNameColor: "#2D3A5C", itemPriceColor: "#6B8DD6", itemTrashColor: "#ef4444", qtyBtnBgColor: "#E8EEFF", qtyBtnTextColor: "#2D3A5C", qtyNumberColor: "#2D3A5C", obsBgColor: "#ffffff", obsBorderColor: "#D6E0F5", obsTextColor: "#8896B8", totalLabelColor: "#8896B8", totalValueColor: "#6B8DD6", ctaBgColor: "#6B8DD6", ctaTextColor: "#ffffff", clearLinkColor: "#ef4444" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#A78BFA", label: "AVALIAÇÕES", labelFont: "Quicksand", labelFontSize: 14, labelFontWeight: "700", labelColor: "#6B8DD6", headlineFont: "Quicksand", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#2D3A5C", ratingNumberColor: "#2D3A5C", ratingTotalColor: "#A8B4D0", cardBgColor: "#ffffff", cardNameColor: "#2D3A5C", cardDateColor: "#A8B4D0", cardTextColor: "#4A5A7C", ctaBgColor: "#6B8DD6", ctaTextColor: "#ffffff", ctaFont: "Quicksand", ctaFontSize: 14, ctaFontWeight: "700", bgColor: "#E8EEFF", bgOverlayOpacity: 0, bgOverlayColor: "#ffffff" },
    feedbacks: { starColor: "#A78BFA" },
    info: { label: "LOCALIZAÇÃO", labelFont: "Quicksand", labelFontSize: 14, labelFontWeight: "700", labelColor: "#6B8DD6", headline: "Venha nos visitar", headlineFont: "Quicksand", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#2D3A5C", subheadline: "Estamos esperando por você", subheadlineFont: "Quicksand", subheadlineFontSize: 18, subheadlineFontWeight: "500", subheadlineColor: "#8896B8", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 15, mapPinColor: "#6B8DD6", mapBtnBgColor: "#6B8DD6", mapBtnTextColor: "#ffffff", mapBtnFont: "Quicksand", mapBtnFontSize: 14, mapBtnFontWeight: "700", mapBtnLabel: "Como Chegar", addressIconColor: "#6B8DD6", addressIconBgColor: "#E8EEFF", addressTitleColor: "#2D3A5C", addressTextColor: "#8896B8", addressFont: "Quicksand", addressFontSize: 14, addressFontWeight: "500", phoneIconColor: "#6B8DD6", phoneIconBgColor: "#E8EEFF", phoneTitleColor: "#2D3A5C", phoneTextColor: "#8896B8", phoneFont: "Quicksand", phoneFontSize: 14, phoneFontWeight: "500", hoursIconColor: "#6B8DD6", hoursIconBgColor: "#E8EEFF", hoursTitleColor: "#2D3A5C", hoursContentColor: "#8896B8", hoursLinkColor: "#6B8DD6", hoursLinkFont: "Quicksand", hoursLinkFontSize: 14, hoursLinkFontWeight: "600", scheduleModalBg: "#ffffff", scheduleModalTitleColor: "#2D3A5C", scheduleModalTextColor: "#8896B8", scheduleModalStatusColor: "#16a34a", scheduleModalHighlightBg: "#E8EEFF", socialBtnBgColor: "#E8EEFF", socialIconColor: "#6B8DD6", socialBtnTextColor: "#8896B8", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#F5F8FF", cardsBgColor: "#ffffff", bgOverlayOpacity: 0, bgOverlayColor: "#ffffff", footerBgColor: "#E8EEFF", footerTextColor: "#8896B8", footerCtaBg: "#6B8DD6", footerCtaTextColor: "#ffffff", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "center" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Como podemos ajudar?", buttonText: "Iniciar Conversa", popupBg: "#ffffff", popupTextColor: "#2D3A5C", buttonBg: "#6B8DD6", buttonTextColor: "#ffffff" },
  },
};

// ============================================
// PRESET 12 — FRANGO & FAST FOOD | Golden Yellow
// ============================================

const frangoFastFood: DesignPreset = {
  id: "frango-fast-food",
  name: "Frango & Fast Food",
  description: "Dark mode energético com amarelo dourado e vermelho.",
  niche: "Frangos assados, fast food, lanches rápidos, rotisserie",
  colors: { primary: "#F59E0B", background: "#1A1000", accent: "#2A1C06" },
  themeColors: { primary: "#F59E0B", background: "#1A1000", foreground: "#FFF8E1", accent: "#2A1C06", muted: "#A08030", buttonPrimary: "#F59E0B", highlight: "#EF4444", success: "#22c55e" },
  fontFamily: "Poppins",
  fontDisplay: "Poppins",
  borderRadius: "0.75rem",
  design: {
    home: { logoType: "text", logoSize: 80, headerBgColor: "rgba(26,16,0,0.88)", headerBehavior: "always_visible", locationBoxBg: "rgba(245,158,11,0.12)", locationBoxText: "#A08030", locationBoxIcon: "#F59E0B", locationLabel: "", locationBoxGlassmorphism: true, scheduleBoxBg: "rgba(34,197,94,0.15)", scheduleBoxText: "#22c55e", scheduleBoxIcon: "#22c55e", scheduleLabel: "", scheduleBoxGlassmorphism: true, badgeOpenColor: "#22c55e", badgeClosedColor: "#ef4444", headline: "Frango Dourado na Hora", headlineFont: "Poppins", headlineFontSize: 60, headlineFontWeight: "800", headlineColor: "#FFF8E1", subheadline: "Crocante por fora, suculento por dentro", subheadlineFont: "Poppins", subheadlineFontSize: 20, subheadlineFontWeight: "400", subheadlineColor: "#A08030", ctaText: "Fazer Pedido", ctaBgColor: "#F59E0B", ctaTextColor: "#1A1000", ctaGradient: false, ctaGradientEnd: "#D97706", ctaAction: "#cardapio", bgMediaType: "image", bgOverlayOpacity: 55, bgOverlayColor: "#1A1000", bgFallbackColor: "#1A1000" },
    products: { headline: "Nosso Cardápio", subheadline: "Sabor que não espera", maxCategories: 3, offersCategoryId: null, headlineFont: "Poppins", headlineFontSize: 40, headlineFontWeight: "800", headlineColor: "#FFF8E1", subheadlineFont: "Poppins", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#A08030", cardBgColor: "#2A1C06", cardNameColor: "#FFF8E1", cardPriceColor: "#F59E0B", cardDescColor: "#A08030", cardUnitColor: "#7A6020", cardBorderRadius: 12, cardBorderColor: "#3D2E10", cardBorderWidth: 1, cardButtonText: "Pedir", cardButtonBgColor: "#F59E0B", cardButtonTextColor: "#1A1000", bgColor: "#1A1000", bgGradient: false, bgGradientFrom: "#1A1000", bgGradientTo: "#2A1C06", bgGradientDirection: "to-b", bgOverlayOpacity: 0, bgOverlayColor: "#000000", viewAllBgColor: "transparent", viewAllTextColor: "#F59E0B", viewAllFont: "Poppins", viewAllFontSize: 14, viewAllFontWeight: "600", viewAllLabel: "Ver todos", ctaText: "Ver Cardápio Completo", ctaBgColor: "#F59E0B", ctaTextColor: "#1A1000", ctaGradient: false, ctaGradientEnd: "#D97706", ctaFont: "Poppins", ctaFontSize: 16, ctaFontWeight: "700", ctaAction: "#cardapio" },
    about: { preHeadline: "NOSSA HISTÓRIA", preHeadlineFont: "Poppins", preHeadlineFontSize: 14, preHeadlineFontWeight: "600", preHeadlineColor: "#F59E0B", headline: "Sobre Nós", headlineFont: "Poppins", headlineFontSize: 48, headlineFontWeight: "800", headlineColor: "#FFF8E1", imageRadius: 12, ownerNameFont: "Poppins", ownerNameFontSize: 20, ownerNameFontWeight: "700", ownerNameColor: "#FFF8E1", ownerTitleColor: "#A08030", storytellingFont: "Poppins", storytellingFontSize: 18, storytellingFontWeight: "400", storytellingColor: "#C8A850", signatureColor: "#F59E0B", showSignature: true, bgOverlayOpacity: 0, bgOverlayColor: "#000000", bgFallbackColor: "#1A1000", imagePosition: "left", showDecorative: false, textColor: "#FFF8E1" },
    menu: { menuSectionTitle: "Cardápio", panelBgColor: "#1A1000", panelOverlayOpacity: 80, panelOverlayColor: "#0D0800", headerTextColor: "#FFF8E1", searchBorderColor: "#3D2E10", searchBgColor: "#2A1C06", searchTextColor: "#FFF8E1", searchPlaceholderColor: "#7A6020", searchIconColor: "#7A6020", categoryNameColor: "#F59E0B", filterActiveBgColor: "#F59E0B", filterActiveTextColor: "#1A1000", filterInactiveBgColor: "#3D2E10", filterInactiveTextColor: "#A08030", cardBgColor: "#2A1C06", cardBorderColor: "#3D2E10", cardBorderWidth: 1, cardBorderRadius: 12, cardNameColor: "#FFF8E1", cardPriceColor: "#F59E0B", cardDescColor: "#A08030", cardFont: "Poppins", cardFontSize: 14, cardFontWeight: "400", cardButtonText: "Pedir", cardButtonBgColor: "#F59E0B", cardButtonTextColor: "#1A1000", modalBgColor: "#2A1C06", modalNameColor: "#FFF8E1", modalUnitColor: "#7A6020", modalPriceColor: "#F59E0B", modalDescColor: "#A08030", modalCtaBgColor: "#F59E0B", modalCtaTextColor: "#1A1000", modalCtaFont: "Poppins", modalCtaFontSize: 16, modalCtaFontWeight: "700", qtyLabelColor: "#A08030", qtyBtnBgColor: "#3D2E10", qtyBtnTextColor: "#FFF8E1", qtyNumberColor: "#FFF8E1" },
    toast: { bgColor: "#2A1C06", borderColor: "#F59E0B", titleColor: "#FFF8E1", subtitleColor: "#A08030", iconCheckColor: "#1A1000", iconBgColor: "#F59E0B", closeButtonColor: "#7A6020" },
    cartLanding: { modalBgColor: "#1A1000", headerTextColor: "#FFF8E1", headerCloseColor: "#7A6020", headerIconColor: "#F59E0B", itemBgColor: "#2A1C06", itemBorderColor: "#3D2E10", itemNameColor: "#FFF8E1", itemPriceColor: "#F59E0B", itemTrashColor: "#ef4444", qtyBtnBgColor: "#3D2E10", qtyBtnTextColor: "#FFF8E1", qtyNumberColor: "#FFF8E1", obsBgColor: "#2A1C06", obsBorderColor: "#3D2E10", obsTextColor: "#A08030", totalLabelColor: "#A08030", totalValueColor: "#F59E0B", ctaBgColor: "#F59E0B", ctaTextColor: "#1A1000", clearLinkColor: "#ef4444" },
    cartMenu: { modalBgColor: "#1A1000", headerTextColor: "#FFF8E1", headerCloseColor: "#7A6020", headerIconColor: "#F59E0B", itemBgColor: "#2A1C06", itemBorderColor: "#3D2E10", itemNameColor: "#FFF8E1", itemPriceColor: "#F59E0B", itemTrashColor: "#ef4444", qtyBtnBgColor: "#3D2E10", qtyBtnTextColor: "#FFF8E1", qtyNumberColor: "#FFF8E1", obsBgColor: "#2A1C06", obsBorderColor: "#3D2E10", obsTextColor: "#A08030", totalLabelColor: "#A08030", totalValueColor: "#F59E0B", ctaBgColor: "#F59E0B", ctaTextColor: "#1A1000", clearLinkColor: "#ef4444" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#F59E0B", label: "AVALIAÇÕES", labelFont: "Poppins", labelFontSize: 14, labelFontWeight: "600", labelColor: "#F59E0B", headlineFont: "Poppins", headlineFontSize: 40, headlineFontWeight: "800", headlineColor: "#FFF8E1", ratingNumberColor: "#FFF8E1", ratingTotalColor: "#7A6020", cardBgColor: "#2A1C06", cardNameColor: "#FFF8E1", cardDateColor: "#7A6020", cardTextColor: "#C8A850", ctaBgColor: "#F59E0B", ctaTextColor: "#1A1000", ctaFont: "Poppins", ctaFontSize: 14, ctaFontWeight: "700", bgColor: "#1A1000", bgOverlayOpacity: 0, bgOverlayColor: "#000000" },
    feedbacks: { starColor: "#F59E0B" },
    info: { label: "LOCALIZAÇÃO", labelFont: "Poppins", labelFontSize: 14, labelFontWeight: "600", labelColor: "#F59E0B", headline: "Venha nos visitar", headlineFont: "Poppins", headlineFontSize: 40, headlineFontWeight: "800", headlineColor: "#FFF8E1", subheadline: "Estamos esperando por você", subheadlineFont: "Poppins", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#A08030", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 50, mapPinColor: "#F59E0B", mapBtnBgColor: "#F59E0B", mapBtnTextColor: "#1A1000", mapBtnFont: "Poppins", mapBtnFontSize: 14, mapBtnFontWeight: "700", mapBtnLabel: "Como Chegar", addressIconColor: "#F59E0B", addressIconBgColor: "#3D2E10", addressTitleColor: "#FFF8E1", addressTextColor: "#A08030", addressFont: "Poppins", addressFontSize: 14, addressFontWeight: "400", phoneIconColor: "#F59E0B", phoneIconBgColor: "#3D2E10", phoneTitleColor: "#FFF8E1", phoneTextColor: "#A08030", phoneFont: "Poppins", phoneFontSize: 14, phoneFontWeight: "400", hoursIconColor: "#F59E0B", hoursIconBgColor: "#3D2E10", hoursTitleColor: "#FFF8E1", hoursContentColor: "#A08030", hoursLinkColor: "#F59E0B", hoursLinkFont: "Poppins", hoursLinkFontSize: 14, hoursLinkFontWeight: "600", scheduleModalBg: "#2A1C06", scheduleModalTitleColor: "#FFF8E1", scheduleModalTextColor: "#A08030", scheduleModalStatusColor: "#22c55e", scheduleModalHighlightBg: "#3D2E10", socialBtnBgColor: "#3D2E10", socialIconColor: "#F59E0B", socialBtnTextColor: "#A08030", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#1A1000", cardsBgColor: "#2A1C06", bgOverlayOpacity: 0, bgOverlayColor: "#000000", footerBgColor: "#0D0800", footerTextColor: "#7A6020", footerCtaBg: "#F59E0B", footerCtaTextColor: "#1A1000", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "center" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Como podemos ajudar?", buttonText: "Iniciar Conversa", popupBg: "#2A1C06", popupTextColor: "#FFF8E1", buttonBg: "#F59E0B", buttonTextColor: "#1A1000" },
  },
};

// ============================================
// PRESET 13 — VEGANO & NATURAL | Earthy Green
// ============================================

const veganoNatural: DesignPreset = {
  id: "vegano-natural",
  name: "Vegano & Natural",
  description: "Light mode limpo com tons de verde terra e bege natural.",
  niche: "Vegano, vegetariano, comida natural, orgânico",
  colors: { primary: "#5B7A3A", background: "#F8F6F0", accent: "#EDE8DA" },
  themeColors: { primary: "#5B7A3A", background: "#F8F6F0", foreground: "#2C3A1E", accent: "#EDE8DA", muted: "#7A8A68", buttonPrimary: "#5B7A3A", highlight: "#8BAF5C", success: "#22c55e" },
  fontFamily: "Source Sans 3",
  fontDisplay: "Merriweather",
  borderRadius: "0.5rem",
  design: {
    home: { logoType: "text", logoSize: 80, headerBgColor: "rgba(248,246,240,0.92)", headerBehavior: "reveal_on_scroll", locationBoxBg: "rgba(91,122,58,0.08)", locationBoxText: "#7A8A68", locationBoxIcon: "#5B7A3A", locationLabel: "", locationBoxGlassmorphism: false, scheduleBoxBg: "rgba(91,122,58,0.1)", scheduleBoxText: "#5B7A3A", scheduleBoxIcon: "#5B7A3A", scheduleLabel: "", scheduleBoxGlassmorphism: false, badgeOpenColor: "#5B7A3A", badgeClosedColor: "#dc2626", headline: "Alimentação Consciente", headlineFont: "Merriweather", headlineFontSize: 56, headlineFontWeight: "700", headlineColor: "#2C3A1E", subheadline: "Da terra para o seu prato, com respeito", subheadlineFont: "Source Sans 3", subheadlineFontSize: 20, subheadlineFontWeight: "400", subheadlineColor: "#7A8A68", ctaText: "Ver Cardápio", ctaBgColor: "#5B7A3A", ctaTextColor: "#ffffff", ctaGradient: false, ctaGradientEnd: "#4A6530", ctaAction: "#cardapio", bgMediaType: "image", bgOverlayOpacity: 15, bgOverlayColor: "#F8F6F0", bgFallbackColor: "#F8F6F0" },
    products: { headline: "Nosso Cardápio", subheadline: "100% plant-based, 100% sabor", maxCategories: 3, offersCategoryId: null, headlineFont: "Merriweather", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#2C3A1E", subheadlineFont: "Source Sans 3", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#7A8A68", cardBgColor: "#ffffff", cardNameColor: "#2C3A1E", cardPriceColor: "#5B7A3A", cardDescColor: "#7A8A68", cardUnitColor: "#9CA88E", cardBorderRadius: 8, cardBorderColor: "#D8D2C4", cardBorderWidth: 1, cardButtonText: "Adicionar", cardButtonBgColor: "#5B7A3A", cardButtonTextColor: "#ffffff", bgColor: "#F8F6F0", bgGradient: false, bgGradientFrom: "#F8F6F0", bgGradientTo: "#EDE8DA", bgGradientDirection: "to-b", bgOverlayOpacity: 0, bgOverlayColor: "#ffffff", viewAllBgColor: "transparent", viewAllTextColor: "#5B7A3A", viewAllFont: "Source Sans 3", viewAllFontSize: 14, viewAllFontWeight: "600", viewAllLabel: "Ver todos", ctaText: "Ver Cardápio Completo", ctaBgColor: "#5B7A3A", ctaTextColor: "#ffffff", ctaGradient: false, ctaGradientEnd: "#4A6530", ctaFont: "Source Sans 3", ctaFontSize: 16, ctaFontWeight: "600", ctaAction: "#cardapio" },
    about: { preHeadline: "NOSSA FILOSOFIA", preHeadlineFont: "Source Sans 3", preHeadlineFontSize: 14, preHeadlineFontWeight: "600", preHeadlineColor: "#5B7A3A", headline: "Sobre Nós", headlineFont: "Merriweather", headlineFontSize: 48, headlineFontWeight: "700", headlineColor: "#2C3A1E", imageRadius: 12, ownerNameFont: "Merriweather", ownerNameFontSize: 20, ownerNameFontWeight: "700", ownerNameColor: "#2C3A1E", ownerTitleColor: "#7A8A68", storytellingFont: "Source Sans 3", storytellingFontSize: 18, storytellingFontWeight: "400", storytellingColor: "#4A5A3A", signatureColor: "#5B7A3A", showSignature: true, bgOverlayOpacity: 0, bgOverlayColor: "#ffffff", bgFallbackColor: "#EDE8DA", imagePosition: "left", showDecorative: true, textColor: "#2C3A1E" },
    menu: { menuSectionTitle: "Cardápio", panelBgColor: "#F8F6F0", panelOverlayOpacity: 70, panelOverlayColor: "#EDE8DA", headerTextColor: "#2C3A1E", searchBorderColor: "#D8D2C4", searchBgColor: "#ffffff", searchTextColor: "#2C3A1E", searchPlaceholderColor: "#9CA88E", searchIconColor: "#7A8A68", categoryNameColor: "#5B7A3A", filterActiveBgColor: "#5B7A3A", filterActiveTextColor: "#ffffff", filterInactiveBgColor: "#EDE8DA", filterInactiveTextColor: "#7A8A68", cardBgColor: "#ffffff", cardBorderColor: "#D8D2C4", cardBorderWidth: 1, cardBorderRadius: 8, cardNameColor: "#2C3A1E", cardPriceColor: "#5B7A3A", cardDescColor: "#7A8A68", cardFont: "Source Sans 3", cardFontSize: 14, cardFontWeight: "400", cardButtonText: "Adicionar", cardButtonBgColor: "#5B7A3A", cardButtonTextColor: "#ffffff", modalBgColor: "#ffffff", modalNameColor: "#2C3A1E", modalUnitColor: "#9CA88E", modalPriceColor: "#5B7A3A", modalDescColor: "#7A8A68", modalCtaBgColor: "#5B7A3A", modalCtaTextColor: "#ffffff", modalCtaFont: "Source Sans 3", modalCtaFontSize: 16, modalCtaFontWeight: "600", qtyLabelColor: "#7A8A68", qtyBtnBgColor: "#EDE8DA", qtyBtnTextColor: "#2C3A1E", qtyNumberColor: "#2C3A1E" },
    toast: { bgColor: "#ffffff", borderColor: "#5B7A3A", titleColor: "#2C3A1E", subtitleColor: "#7A8A68", iconCheckColor: "#ffffff", iconBgColor: "#5B7A3A", closeButtonColor: "#9CA88E" },
    cartLanding: { modalBgColor: "#F8F6F0", headerTextColor: "#2C3A1E", headerCloseColor: "#7A8A68", headerIconColor: "#5B7A3A", itemBgColor: "#ffffff", itemBorderColor: "#D8D2C4", itemNameColor: "#2C3A1E", itemPriceColor: "#5B7A3A", itemTrashColor: "#dc2626", qtyBtnBgColor: "#EDE8DA", qtyBtnTextColor: "#2C3A1E", qtyNumberColor: "#2C3A1E", obsBgColor: "#ffffff", obsBorderColor: "#D8D2C4", obsTextColor: "#7A8A68", totalLabelColor: "#7A8A68", totalValueColor: "#5B7A3A", ctaBgColor: "#5B7A3A", ctaTextColor: "#ffffff", clearLinkColor: "#dc2626" },
    cartMenu: { modalBgColor: "#F8F6F0", headerTextColor: "#2C3A1E", headerCloseColor: "#7A8A68", headerIconColor: "#5B7A3A", itemBgColor: "#ffffff", itemBorderColor: "#D8D2C4", itemNameColor: "#2C3A1E", itemPriceColor: "#5B7A3A", itemTrashColor: "#dc2626", qtyBtnBgColor: "#EDE8DA", qtyBtnTextColor: "#2C3A1E", qtyNumberColor: "#2C3A1E", obsBgColor: "#ffffff", obsBorderColor: "#D8D2C4", obsTextColor: "#7A8A68", totalLabelColor: "#7A8A68", totalValueColor: "#5B7A3A", ctaBgColor: "#5B7A3A", ctaTextColor: "#ffffff", clearLinkColor: "#dc2626" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#8BAF5C", label: "AVALIAÇÕES", labelFont: "Source Sans 3", labelFontSize: 14, labelFontWeight: "600", labelColor: "#5B7A3A", headlineFont: "Merriweather", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#2C3A1E", ratingNumberColor: "#2C3A1E", ratingTotalColor: "#9CA88E", cardBgColor: "#ffffff", cardNameColor: "#2C3A1E", cardDateColor: "#9CA88E", cardTextColor: "#4A5A3A", ctaBgColor: "#5B7A3A", ctaTextColor: "#ffffff", ctaFont: "Source Sans 3", ctaFontSize: 14, ctaFontWeight: "600", bgColor: "#EDE8DA", bgOverlayOpacity: 0, bgOverlayColor: "#ffffff" },
    feedbacks: { starColor: "#8BAF5C" },
    info: { label: "LOCALIZAÇÃO", labelFont: "Source Sans 3", labelFontSize: 14, labelFontWeight: "600", labelColor: "#5B7A3A", headline: "Venha nos visitar", headlineFont: "Merriweather", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#2C3A1E", subheadline: "Estamos esperando por você", subheadlineFont: "Source Sans 3", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#7A8A68", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 15, mapPinColor: "#5B7A3A", mapBtnBgColor: "#5B7A3A", mapBtnTextColor: "#ffffff", mapBtnFont: "Source Sans 3", mapBtnFontSize: 14, mapBtnFontWeight: "600", mapBtnLabel: "Como Chegar", addressIconColor: "#5B7A3A", addressIconBgColor: "#EDE8DA", addressTitleColor: "#2C3A1E", addressTextColor: "#7A8A68", addressFont: "Source Sans 3", addressFontSize: 14, addressFontWeight: "400", phoneIconColor: "#5B7A3A", phoneIconBgColor: "#EDE8DA", phoneTitleColor: "#2C3A1E", phoneTextColor: "#7A8A68", phoneFont: "Source Sans 3", phoneFontSize: 14, phoneFontWeight: "400", hoursIconColor: "#5B7A3A", hoursIconBgColor: "#EDE8DA", hoursTitleColor: "#2C3A1E", hoursContentColor: "#7A8A68", hoursLinkColor: "#5B7A3A", hoursLinkFont: "Source Sans 3", hoursLinkFontSize: 14, hoursLinkFontWeight: "500", scheduleModalBg: "#ffffff", scheduleModalTitleColor: "#2C3A1E", scheduleModalTextColor: "#7A8A68", scheduleModalStatusColor: "#5B7A3A", scheduleModalHighlightBg: "#EDE8DA", socialBtnBgColor: "#EDE8DA", socialIconColor: "#5B7A3A", socialBtnTextColor: "#7A8A68", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#F8F6F0", cardsBgColor: "#ffffff", bgOverlayOpacity: 0, bgOverlayColor: "#ffffff", footerBgColor: "#EDE8DA", footerTextColor: "#7A8A68", footerCtaBg: "#5B7A3A", footerCtaTextColor: "#ffffff", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "center" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Como podemos ajudar?", buttonText: "Iniciar Conversa", popupBg: "#ffffff", popupTextColor: "#2C3A1E", buttonBg: "#5B7A3A", buttonTextColor: "#ffffff" },
  },
};

// ============================================
// PRESET 14 — FRUTOS DO MAR | Deep Ocean
// ============================================

const frutosDoMar: DesignPreset = {
  id: "frutos-do-mar",
  name: "Frutos do Mar",
  description: "Dark mode sofisticado com tons de azul marinho e turquesa.",
  niche: "Pescados, frutos do mar, marisqueiras",
  colors: { primary: "#2DD4BF", background: "#0A1628", accent: "#122240" },
  themeColors: { primary: "#2DD4BF", background: "#0A1628", foreground: "#E0F2FE", accent: "#122240", muted: "#6B8DAA", buttonPrimary: "#2DD4BF", highlight: "#38BDF8", success: "#22c55e" },
  fontFamily: "Raleway",
  fontDisplay: "Cormorant Garamond",
  borderRadius: "0.5rem",
  design: {
    home: { logoType: "text", logoSize: 80, headerBgColor: "rgba(10,22,40,0.85)", headerBehavior: "always_visible", locationBoxBg: "rgba(45,212,191,0.1)", locationBoxText: "#6B8DAA", locationBoxIcon: "#2DD4BF", locationLabel: "", locationBoxGlassmorphism: true, scheduleBoxBg: "rgba(34,197,94,0.15)", scheduleBoxText: "#22c55e", scheduleBoxIcon: "#22c55e", scheduleLabel: "", scheduleBoxGlassmorphism: true, badgeOpenColor: "#22c55e", badgeClosedColor: "#ef4444", headline: "Sabores do Oceano", headlineFont: "Cormorant Garamond", headlineFontSize: 64, headlineFontWeight: "700", headlineColor: "#E0F2FE", subheadline: "Frescor e sofisticação em cada prato", subheadlineFont: "Raleway", subheadlineFontSize: 20, subheadlineFontWeight: "400", subheadlineColor: "#6B8DAA", ctaText: "Ver Cardápio", ctaBgColor: "#2DD4BF", ctaTextColor: "#0A1628", ctaGradient: false, ctaGradientEnd: "#14B8A6", ctaAction: "#cardapio", bgMediaType: "image", bgOverlayOpacity: 55, bgOverlayColor: "#0A1628", bgFallbackColor: "#0A1628" },
    products: { headline: "Nosso Cardápio", subheadline: "Direto do mar para a sua mesa", maxCategories: 3, offersCategoryId: null, headlineFont: "Cormorant Garamond", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#E0F2FE", subheadlineFont: "Raleway", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#6B8DAA", cardBgColor: "#122240", cardNameColor: "#E0F2FE", cardPriceColor: "#2DD4BF", cardDescColor: "#6B8DAA", cardUnitColor: "#4A6A88", cardBorderRadius: 8, cardBorderColor: "#1E3A5F", cardBorderWidth: 1, cardButtonText: "Adicionar", cardButtonBgColor: "#2DD4BF", cardButtonTextColor: "#0A1628", bgColor: "#0A1628", bgGradient: false, bgGradientFrom: "#0A1628", bgGradientTo: "#122240", bgGradientDirection: "to-b", bgOverlayOpacity: 0, bgOverlayColor: "#000000", viewAllBgColor: "transparent", viewAllTextColor: "#2DD4BF", viewAllFont: "Raleway", viewAllFontSize: 14, viewAllFontWeight: "600", viewAllLabel: "Ver todos", ctaText: "Ver Cardápio Completo", ctaBgColor: "#2DD4BF", ctaTextColor: "#0A1628", ctaGradient: false, ctaGradientEnd: "#14B8A6", ctaFont: "Raleway", ctaFontSize: 16, ctaFontWeight: "600", ctaAction: "#cardapio" },
    about: { preHeadline: "NOSSA HISTÓRIA", preHeadlineFont: "Raleway", preHeadlineFontSize: 14, preHeadlineFontWeight: "600", preHeadlineColor: "#2DD4BF", headline: "Sobre Nós", headlineFont: "Cormorant Garamond", headlineFontSize: 48, headlineFontWeight: "700", headlineColor: "#E0F2FE", imageRadius: 12, ownerNameFont: "Cormorant Garamond", ownerNameFontSize: 22, ownerNameFontWeight: "700", ownerNameColor: "#E0F2FE", ownerTitleColor: "#6B8DAA", storytellingFont: "Raleway", storytellingFontSize: 18, storytellingFontWeight: "400", storytellingColor: "#8AACC8", signatureColor: "#2DD4BF", showSignature: true, bgOverlayOpacity: 0, bgOverlayColor: "#000000", bgFallbackColor: "#0A1628", imagePosition: "right", showDecorative: true, textColor: "#E0F2FE" },
    menu: { menuSectionTitle: "Cardápio", panelBgColor: "#0A1628", panelOverlayOpacity: 80, panelOverlayColor: "#050B14", headerTextColor: "#E0F2FE", searchBorderColor: "#1E3A5F", searchBgColor: "#122240", searchTextColor: "#E0F2FE", searchPlaceholderColor: "#4A6A88", searchIconColor: "#4A6A88", categoryNameColor: "#2DD4BF", filterActiveBgColor: "#2DD4BF", filterActiveTextColor: "#0A1628", filterInactiveBgColor: "#1E3A5F", filterInactiveTextColor: "#6B8DAA", cardBgColor: "#122240", cardBorderColor: "#1E3A5F", cardBorderWidth: 1, cardBorderRadius: 8, cardNameColor: "#E0F2FE", cardPriceColor: "#2DD4BF", cardDescColor: "#6B8DAA", cardFont: "Raleway", cardFontSize: 14, cardFontWeight: "400", cardButtonText: "Adicionar", cardButtonBgColor: "#2DD4BF", cardButtonTextColor: "#0A1628", modalBgColor: "#122240", modalNameColor: "#E0F2FE", modalUnitColor: "#4A6A88", modalPriceColor: "#2DD4BF", modalDescColor: "#6B8DAA", modalCtaBgColor: "#2DD4BF", modalCtaTextColor: "#0A1628", modalCtaFont: "Raleway", modalCtaFontSize: 16, modalCtaFontWeight: "600", qtyLabelColor: "#6B8DAA", qtyBtnBgColor: "#1E3A5F", qtyBtnTextColor: "#E0F2FE", qtyNumberColor: "#E0F2FE" },
    toast: { bgColor: "#122240", borderColor: "#2DD4BF", titleColor: "#E0F2FE", subtitleColor: "#6B8DAA", iconCheckColor: "#0A1628", iconBgColor: "#2DD4BF", closeButtonColor: "#4A6A88" },
    cartLanding: { modalBgColor: "#0A1628", headerTextColor: "#E0F2FE", headerCloseColor: "#4A6A88", headerIconColor: "#2DD4BF", itemBgColor: "#122240", itemBorderColor: "#1E3A5F", itemNameColor: "#E0F2FE", itemPriceColor: "#2DD4BF", itemTrashColor: "#ef4444", qtyBtnBgColor: "#1E3A5F", qtyBtnTextColor: "#E0F2FE", qtyNumberColor: "#E0F2FE", obsBgColor: "#122240", obsBorderColor: "#1E3A5F", obsTextColor: "#6B8DAA", totalLabelColor: "#6B8DAA", totalValueColor: "#2DD4BF", ctaBgColor: "#2DD4BF", ctaTextColor: "#0A1628", clearLinkColor: "#ef4444" },
    cartMenu: { modalBgColor: "#0A1628", headerTextColor: "#E0F2FE", headerCloseColor: "#4A6A88", headerIconColor: "#2DD4BF", itemBgColor: "#122240", itemBorderColor: "#1E3A5F", itemNameColor: "#E0F2FE", itemPriceColor: "#2DD4BF", itemTrashColor: "#ef4444", qtyBtnBgColor: "#1E3A5F", qtyBtnTextColor: "#E0F2FE", qtyNumberColor: "#E0F2FE", obsBgColor: "#122240", obsBorderColor: "#1E3A5F", obsTextColor: "#6B8DAA", totalLabelColor: "#6B8DAA", totalValueColor: "#2DD4BF", ctaBgColor: "#2DD4BF", ctaTextColor: "#0A1628", clearLinkColor: "#ef4444" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#38BDF8", label: "AVALIAÇÕES", labelFont: "Raleway", labelFontSize: 14, labelFontWeight: "600", labelColor: "#2DD4BF", headlineFont: "Cormorant Garamond", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#E0F2FE", ratingNumberColor: "#E0F2FE", ratingTotalColor: "#4A6A88", cardBgColor: "#122240", cardNameColor: "#E0F2FE", cardDateColor: "#4A6A88", cardTextColor: "#8AACC8", ctaBgColor: "#2DD4BF", ctaTextColor: "#0A1628", ctaFont: "Raleway", ctaFontSize: 14, ctaFontWeight: "600", bgColor: "#0A1628", bgOverlayOpacity: 0, bgOverlayColor: "#000000" },
    feedbacks: { starColor: "#38BDF8" },
    info: { label: "LOCALIZAÇÃO", labelFont: "Raleway", labelFontSize: 14, labelFontWeight: "600", labelColor: "#2DD4BF", headline: "Venha nos visitar", headlineFont: "Cormorant Garamond", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#E0F2FE", subheadline: "Estamos esperando por você", subheadlineFont: "Raleway", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#6B8DAA", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 50, mapPinColor: "#2DD4BF", mapBtnBgColor: "#2DD4BF", mapBtnTextColor: "#0A1628", mapBtnFont: "Raleway", mapBtnFontSize: 14, mapBtnFontWeight: "600", mapBtnLabel: "Como Chegar", addressIconColor: "#2DD4BF", addressIconBgColor: "#1E3A5F", addressTitleColor: "#E0F2FE", addressTextColor: "#6B8DAA", addressFont: "Raleway", addressFontSize: 14, addressFontWeight: "400", phoneIconColor: "#2DD4BF", phoneIconBgColor: "#1E3A5F", phoneTitleColor: "#E0F2FE", phoneTextColor: "#6B8DAA", phoneFont: "Raleway", phoneFontSize: 14, phoneFontWeight: "400", hoursIconColor: "#2DD4BF", hoursIconBgColor: "#1E3A5F", hoursTitleColor: "#E0F2FE", hoursContentColor: "#6B8DAA", hoursLinkColor: "#2DD4BF", hoursLinkFont: "Raleway", hoursLinkFontSize: 14, hoursLinkFontWeight: "500", scheduleModalBg: "#122240", scheduleModalTitleColor: "#E0F2FE", scheduleModalTextColor: "#6B8DAA", scheduleModalStatusColor: "#22c55e", scheduleModalHighlightBg: "#1E3A5F", socialBtnBgColor: "#1E3A5F", socialIconColor: "#2DD4BF", socialBtnTextColor: "#6B8DAA", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#0A1628", cardsBgColor: "#122240", bgOverlayOpacity: 0, bgOverlayColor: "#000000", footerBgColor: "#050B14", footerTextColor: "#4A6A88", footerCtaBg: "#2DD4BF", footerCtaTextColor: "#0A1628", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "left" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Como podemos ajudar?", buttonText: "Iniciar Conversa", popupBg: "#122240", popupTextColor: "#E0F2FE", buttonBg: "#2DD4BF", buttonTextColor: "#0A1628" },
  },
};

// ============================================
// PRESET 15 — MEXICANO | Vibrant Fiesta
// ============================================

const mexicano: DesignPreset = {
  id: "mexicano",
  name: "Mexicano",
  description: "Dark mode vibrante com tons de terracota e verde jalapeño.",
  niche: "Comida mexicana, tacos, burritos, tex-mex",
  colors: { primary: "#E85D3A", background: "#1A0E0A", accent: "#2A1810" },
  themeColors: { primary: "#E85D3A", background: "#1A0E0A", foreground: "#F5E0D0", accent: "#2A1810", muted: "#8A6A58", buttonPrimary: "#E85D3A", highlight: "#2D8B4E", success: "#22c55e" },
  fontFamily: "Josefin Sans",
  fontDisplay: "Josefin Sans",
  borderRadius: "0.75rem",
  design: {
    home: { logoType: "text", logoSize: 80, headerBgColor: "rgba(26,14,10,0.88)", headerBehavior: "always_visible", locationBoxBg: "rgba(232,93,58,0.12)", locationBoxText: "#8A6A58", locationBoxIcon: "#E85D3A", locationLabel: "", locationBoxGlassmorphism: true, scheduleBoxBg: "rgba(45,139,78,0.15)", scheduleBoxText: "#2D8B4E", scheduleBoxIcon: "#2D8B4E", scheduleLabel: "", scheduleBoxGlassmorphism: true, badgeOpenColor: "#2D8B4E", badgeClosedColor: "#ef4444", headline: "Sabor Autêntico Mexicano", headlineFont: "Josefin Sans", headlineFontSize: 60, headlineFontWeight: "700", headlineColor: "#F5E0D0", subheadline: "Tacos, burritos e muita pimenta", subheadlineFont: "Josefin Sans", subheadlineFontSize: 20, subheadlineFontWeight: "400", subheadlineColor: "#8A6A58", ctaText: "Ver Cardápio", ctaBgColor: "#E85D3A", ctaTextColor: "#ffffff", ctaGradient: false, ctaGradientEnd: "#C44A2A", ctaAction: "#cardapio", bgMediaType: "image", bgOverlayOpacity: 55, bgOverlayColor: "#1A0E0A", bgFallbackColor: "#1A0E0A" },
    products: { headline: "Nosso Cardápio", subheadline: "Direto do México para sua mesa", maxCategories: 3, offersCategoryId: null, headlineFont: "Josefin Sans", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#F5E0D0", subheadlineFont: "Josefin Sans", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#8A6A58", cardBgColor: "#2A1810", cardNameColor: "#F5E0D0", cardPriceColor: "#E85D3A", cardDescColor: "#8A6A58", cardUnitColor: "#6B5040", cardBorderRadius: 12, cardBorderColor: "#3D2820", cardBorderWidth: 1, cardButtonText: "Pedir", cardButtonBgColor: "#E85D3A", cardButtonTextColor: "#ffffff", bgColor: "#1A0E0A", bgGradient: false, bgGradientFrom: "#1A0E0A", bgGradientTo: "#2A1810", bgGradientDirection: "to-b", bgOverlayOpacity: 0, bgOverlayColor: "#000000", viewAllBgColor: "transparent", viewAllTextColor: "#E85D3A", viewAllFont: "Josefin Sans", viewAllFontSize: 14, viewAllFontWeight: "600", viewAllLabel: "Ver todos", ctaText: "Ver Cardápio Completo", ctaBgColor: "#E85D3A", ctaTextColor: "#ffffff", ctaGradient: false, ctaGradientEnd: "#C44A2A", ctaFont: "Josefin Sans", ctaFontSize: 16, ctaFontWeight: "600", ctaAction: "#cardapio" },
    about: { preHeadline: "NOSSA HISTÓRIA", preHeadlineFont: "Josefin Sans", preHeadlineFontSize: 14, preHeadlineFontWeight: "600", preHeadlineColor: "#E85D3A", headline: "Sobre Nós", headlineFont: "Josefin Sans", headlineFontSize: 48, headlineFontWeight: "700", headlineColor: "#F5E0D0", imageRadius: 12, ownerNameFont: "Josefin Sans", ownerNameFontSize: 20, ownerNameFontWeight: "700", ownerNameColor: "#F5E0D0", ownerTitleColor: "#8A6A58", storytellingFont: "Josefin Sans", storytellingFontSize: 18, storytellingFontWeight: "400", storytellingColor: "#B8A090", signatureColor: "#E85D3A", showSignature: true, bgOverlayOpacity: 0, bgOverlayColor: "#000000", bgFallbackColor: "#1A0E0A", imagePosition: "right", showDecorative: true, textColor: "#F5E0D0" },
    menu: { menuSectionTitle: "Cardápio", panelBgColor: "#1A0E0A", panelOverlayOpacity: 80, panelOverlayColor: "#0D0705", headerTextColor: "#F5E0D0", searchBorderColor: "#3D2820", searchBgColor: "#2A1810", searchTextColor: "#F5E0D0", searchPlaceholderColor: "#6B5040", searchIconColor: "#6B5040", categoryNameColor: "#E85D3A", filterActiveBgColor: "#E85D3A", filterActiveTextColor: "#ffffff", filterInactiveBgColor: "#3D2820", filterInactiveTextColor: "#8A6A58", cardBgColor: "#2A1810", cardBorderColor: "#3D2820", cardBorderWidth: 1, cardBorderRadius: 12, cardNameColor: "#F5E0D0", cardPriceColor: "#E85D3A", cardDescColor: "#8A6A58", cardFont: "Josefin Sans", cardFontSize: 14, cardFontWeight: "400", cardButtonText: "Pedir", cardButtonBgColor: "#E85D3A", cardButtonTextColor: "#ffffff", modalBgColor: "#2A1810", modalNameColor: "#F5E0D0", modalUnitColor: "#6B5040", modalPriceColor: "#E85D3A", modalDescColor: "#8A6A58", modalCtaBgColor: "#E85D3A", modalCtaTextColor: "#ffffff", modalCtaFont: "Josefin Sans", modalCtaFontSize: 16, modalCtaFontWeight: "600", qtyLabelColor: "#8A6A58", qtyBtnBgColor: "#3D2820", qtyBtnTextColor: "#F5E0D0", qtyNumberColor: "#F5E0D0" },
    toast: { bgColor: "#2A1810", borderColor: "#E85D3A", titleColor: "#F5E0D0", subtitleColor: "#8A6A58", iconCheckColor: "#ffffff", iconBgColor: "#E85D3A", closeButtonColor: "#6B5040" },
    cartLanding: { modalBgColor: "#1A0E0A", headerTextColor: "#F5E0D0", headerCloseColor: "#6B5040", headerIconColor: "#E85D3A", itemBgColor: "#2A1810", itemBorderColor: "#3D2820", itemNameColor: "#F5E0D0", itemPriceColor: "#E85D3A", itemTrashColor: "#ef4444", qtyBtnBgColor: "#3D2820", qtyBtnTextColor: "#F5E0D0", qtyNumberColor: "#F5E0D0", obsBgColor: "#2A1810", obsBorderColor: "#3D2820", obsTextColor: "#8A6A58", totalLabelColor: "#8A6A58", totalValueColor: "#E85D3A", ctaBgColor: "#E85D3A", ctaTextColor: "#ffffff", clearLinkColor: "#ef4444" },
    cartMenu: { modalBgColor: "#1A0E0A", headerTextColor: "#F5E0D0", headerCloseColor: "#6B5040", headerIconColor: "#E85D3A", itemBgColor: "#2A1810", itemBorderColor: "#3D2820", itemNameColor: "#F5E0D0", itemPriceColor: "#E85D3A", itemTrashColor: "#ef4444", qtyBtnBgColor: "#3D2820", qtyBtnTextColor: "#F5E0D0", qtyNumberColor: "#F5E0D0", obsBgColor: "#2A1810", obsBorderColor: "#3D2820", obsTextColor: "#8A6A58", totalLabelColor: "#8A6A58", totalValueColor: "#E85D3A", ctaBgColor: "#E85D3A", ctaTextColor: "#ffffff", clearLinkColor: "#ef4444" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#E85D3A", label: "AVALIAÇÕES", labelFont: "Josefin Sans", labelFontSize: 14, labelFontWeight: "600", labelColor: "#E85D3A", headlineFont: "Josefin Sans", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#F5E0D0", ratingNumberColor: "#F5E0D0", ratingTotalColor: "#6B5040", cardBgColor: "#2A1810", cardNameColor: "#F5E0D0", cardDateColor: "#6B5040", cardTextColor: "#B8A090", ctaBgColor: "#E85D3A", ctaTextColor: "#ffffff", ctaFont: "Josefin Sans", ctaFontSize: 14, ctaFontWeight: "600", bgColor: "#1A0E0A", bgOverlayOpacity: 0, bgOverlayColor: "#000000" },
    feedbacks: { starColor: "#E85D3A" },
    info: { label: "LOCALIZAÇÃO", labelFont: "Josefin Sans", labelFontSize: 14, labelFontWeight: "600", labelColor: "#E85D3A", headline: "Venha nos visitar", headlineFont: "Josefin Sans", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#F5E0D0", subheadline: "Estamos esperando por você", subheadlineFont: "Josefin Sans", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#8A6A58", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 50, mapPinColor: "#E85D3A", mapBtnBgColor: "#E85D3A", mapBtnTextColor: "#ffffff", mapBtnFont: "Josefin Sans", mapBtnFontSize: 14, mapBtnFontWeight: "600", mapBtnLabel: "Como Chegar", addressIconColor: "#E85D3A", addressIconBgColor: "#3D2820", addressTitleColor: "#F5E0D0", addressTextColor: "#8A6A58", addressFont: "Josefin Sans", addressFontSize: 14, addressFontWeight: "400", phoneIconColor: "#E85D3A", phoneIconBgColor: "#3D2820", phoneTitleColor: "#F5E0D0", phoneTextColor: "#8A6A58", phoneFont: "Josefin Sans", phoneFontSize: 14, phoneFontWeight: "400", hoursIconColor: "#E85D3A", hoursIconBgColor: "#3D2820", hoursTitleColor: "#F5E0D0", hoursContentColor: "#8A6A58", hoursLinkColor: "#E85D3A", hoursLinkFont: "Josefin Sans", hoursLinkFontSize: 14, hoursLinkFontWeight: "500", scheduleModalBg: "#2A1810", scheduleModalTitleColor: "#F5E0D0", scheduleModalTextColor: "#8A6A58", scheduleModalStatusColor: "#2D8B4E", scheduleModalHighlightBg: "#3D2820", socialBtnBgColor: "#3D2820", socialIconColor: "#E85D3A", socialBtnTextColor: "#8A6A58", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#1A0E0A", cardsBgColor: "#2A1810", bgOverlayOpacity: 0, bgOverlayColor: "#000000", footerBgColor: "#0D0705", footerTextColor: "#6B5040", footerCtaBg: "#E85D3A", footerCtaTextColor: "#ffffff", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "center" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Como podemos ajudar?", buttonText: "Iniciar Conversa", popupBg: "#2A1810", popupTextColor: "#F5E0D0", buttonBg: "#E85D3A", buttonTextColor: "#ffffff" },
  },
};

// ============================================
// PRESET 16 — ÁRABE & ESFIHA | Warm Spice
// ============================================

const arabeEsfiha: DesignPreset = {
  id: "arabe-esfiha",
  name: "Árabe & Esfiha",
  description: "Dark mode sofisticado com tons de especiarias e dourado.",
  niche: "Comida árabe, esfihas, kebabs, shawarma",
  colors: { primary: "#C8963E", background: "#140E08", accent: "#221A10" },
  themeColors: { primary: "#C8963E", background: "#140E08", foreground: "#F0E0C8", accent: "#221A10", muted: "#8A7050", buttonPrimary: "#C8963E", highlight: "#D4A850", success: "#22c55e" },
  fontFamily: "Cormorant Garamond",
  fontDisplay: "Cormorant Garamond",
  borderRadius: "0.5rem",
  design: {
    home: { logoType: "text", logoSize: 80, headerBgColor: "rgba(20,14,8,0.88)", headerBehavior: "always_visible", locationBoxBg: "rgba(200,150,62,0.1)", locationBoxText: "#8A7050", locationBoxIcon: "#C8963E", locationLabel: "", locationBoxGlassmorphism: true, scheduleBoxBg: "rgba(34,197,94,0.15)", scheduleBoxText: "#22c55e", scheduleBoxIcon: "#22c55e", scheduleLabel: "", scheduleBoxGlassmorphism: true, badgeOpenColor: "#22c55e", badgeClosedColor: "#ef4444", headline: "Sabores do Oriente", headlineFont: "Cormorant Garamond", headlineFontSize: 64, headlineFontWeight: "700", headlineColor: "#F0E0C8", subheadline: "Tradição milenar em cada receita", subheadlineFont: "Cormorant Garamond", subheadlineFontSize: 22, subheadlineFontWeight: "400", subheadlineColor: "#8A7050", ctaText: "Ver Cardápio", ctaBgColor: "#C8963E", ctaTextColor: "#140E08", ctaGradient: false, ctaGradientEnd: "#A07830", ctaAction: "#cardapio", bgMediaType: "image", bgOverlayOpacity: 55, bgOverlayColor: "#140E08", bgFallbackColor: "#140E08" },
    products: { headline: "Nosso Cardápio", subheadline: "Receitas tradicionais com ingredientes frescos", maxCategories: 3, offersCategoryId: null, headlineFont: "Cormorant Garamond", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#F0E0C8", subheadlineFont: "Cormorant Garamond", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#8A7050", cardBgColor: "#221A10", cardNameColor: "#F0E0C8", cardPriceColor: "#D4A850", cardDescColor: "#8A7050", cardUnitColor: "#6A5538", cardBorderRadius: 8, cardBorderColor: "#332818", cardBorderWidth: 1, cardButtonText: "Pedir", cardButtonBgColor: "#C8963E", cardButtonTextColor: "#140E08", bgColor: "#140E08", bgGradient: false, bgGradientFrom: "#140E08", bgGradientTo: "#221A10", bgGradientDirection: "to-b", bgOverlayOpacity: 0, bgOverlayColor: "#000000", viewAllBgColor: "transparent", viewAllTextColor: "#C8963E", viewAllFont: "Cormorant Garamond", viewAllFontSize: 14, viewAllFontWeight: "600", viewAllLabel: "Ver todos", ctaText: "Ver Cardápio Completo", ctaBgColor: "#C8963E", ctaTextColor: "#140E08", ctaGradient: false, ctaGradientEnd: "#A07830", ctaFont: "Cormorant Garamond", ctaFontSize: 16, ctaFontWeight: "600", ctaAction: "#cardapio" },
    about: { preHeadline: "NOSSA TRADIÇÃO", preHeadlineFont: "Cormorant Garamond", preHeadlineFontSize: 14, preHeadlineFontWeight: "600", preHeadlineColor: "#C8963E", headline: "Sobre Nós", headlineFont: "Cormorant Garamond", headlineFontSize: 48, headlineFontWeight: "700", headlineColor: "#F0E0C8", imageRadius: 12, ownerNameFont: "Cormorant Garamond", ownerNameFontSize: 22, ownerNameFontWeight: "700", ownerNameColor: "#F0E0C8", ownerTitleColor: "#8A7050", storytellingFont: "Cormorant Garamond", storytellingFontSize: 18, storytellingFontWeight: "400", storytellingColor: "#B8A080", signatureColor: "#C8963E", showSignature: true, bgOverlayOpacity: 0, bgOverlayColor: "#000000", bgFallbackColor: "#140E08", imagePosition: "left", showDecorative: true, textColor: "#F0E0C8" },
    menu: { menuSectionTitle: "Cardápio", panelBgColor: "#140E08", panelOverlayOpacity: 80, panelOverlayColor: "#0A0704", headerTextColor: "#F0E0C8", searchBorderColor: "#332818", searchBgColor: "#221A10", searchTextColor: "#F0E0C8", searchPlaceholderColor: "#6A5538", searchIconColor: "#6A5538", categoryNameColor: "#C8963E", filterActiveBgColor: "#C8963E", filterActiveTextColor: "#140E08", filterInactiveBgColor: "#332818", filterInactiveTextColor: "#8A7050", cardBgColor: "#221A10", cardBorderColor: "#332818", cardBorderWidth: 1, cardBorderRadius: 8, cardNameColor: "#F0E0C8", cardPriceColor: "#D4A850", cardDescColor: "#8A7050", cardFont: "Cormorant Garamond", cardFontSize: 15, cardFontWeight: "400", cardButtonText: "Pedir", cardButtonBgColor: "#C8963E", cardButtonTextColor: "#140E08", modalBgColor: "#221A10", modalNameColor: "#F0E0C8", modalUnitColor: "#6A5538", modalPriceColor: "#D4A850", modalDescColor: "#8A7050", modalCtaBgColor: "#C8963E", modalCtaTextColor: "#140E08", modalCtaFont: "Cormorant Garamond", modalCtaFontSize: 16, modalCtaFontWeight: "600", qtyLabelColor: "#8A7050", qtyBtnBgColor: "#332818", qtyBtnTextColor: "#F0E0C8", qtyNumberColor: "#F0E0C8" },
    toast: { bgColor: "#221A10", borderColor: "#C8963E", titleColor: "#F0E0C8", subtitleColor: "#8A7050", iconCheckColor: "#140E08", iconBgColor: "#C8963E", closeButtonColor: "#6A5538" },
    cartLanding: { modalBgColor: "#140E08", headerTextColor: "#F0E0C8", headerCloseColor: "#6A5538", headerIconColor: "#C8963E", itemBgColor: "#221A10", itemBorderColor: "#332818", itemNameColor: "#F0E0C8", itemPriceColor: "#D4A850", itemTrashColor: "#ef4444", qtyBtnBgColor: "#332818", qtyBtnTextColor: "#F0E0C8", qtyNumberColor: "#F0E0C8", obsBgColor: "#221A10", obsBorderColor: "#332818", obsTextColor: "#8A7050", totalLabelColor: "#8A7050", totalValueColor: "#D4A850", ctaBgColor: "#C8963E", ctaTextColor: "#140E08", clearLinkColor: "#ef4444" },
    cartMenu: { modalBgColor: "#140E08", headerTextColor: "#F0E0C8", headerCloseColor: "#6A5538", headerIconColor: "#C8963E", itemBgColor: "#221A10", itemBorderColor: "#332818", itemNameColor: "#F0E0C8", itemPriceColor: "#D4A850", itemTrashColor: "#ef4444", qtyBtnBgColor: "#332818", qtyBtnTextColor: "#F0E0C8", qtyNumberColor: "#F0E0C8", obsBgColor: "#221A10", obsBorderColor: "#332818", obsTextColor: "#8A7050", totalLabelColor: "#8A7050", totalValueColor: "#D4A850", ctaBgColor: "#C8963E", ctaTextColor: "#140E08", clearLinkColor: "#ef4444" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#D4A850", label: "AVALIAÇÕES", labelFont: "Cormorant Garamond", labelFontSize: 14, labelFontWeight: "600", labelColor: "#C8963E", headlineFont: "Cormorant Garamond", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#F0E0C8", ratingNumberColor: "#F0E0C8", ratingTotalColor: "#6A5538", cardBgColor: "#221A10", cardNameColor: "#F0E0C8", cardDateColor: "#6A5538", cardTextColor: "#B8A080", ctaBgColor: "#C8963E", ctaTextColor: "#140E08", ctaFont: "Cormorant Garamond", ctaFontSize: 14, ctaFontWeight: "600", bgColor: "#140E08", bgOverlayOpacity: 0, bgOverlayColor: "#000000" },
    feedbacks: { starColor: "#D4A850" },
    info: { label: "LOCALIZAÇÃO", labelFont: "Cormorant Garamond", labelFontSize: 14, labelFontWeight: "600", labelColor: "#C8963E", headline: "Venha nos visitar", headlineFont: "Cormorant Garamond", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#F0E0C8", subheadline: "Estamos esperando por você", subheadlineFont: "Cormorant Garamond", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#8A7050", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 50, mapPinColor: "#C8963E", mapBtnBgColor: "#C8963E", mapBtnTextColor: "#140E08", mapBtnFont: "Cormorant Garamond", mapBtnFontSize: 14, mapBtnFontWeight: "600", mapBtnLabel: "Como Chegar", addressIconColor: "#C8963E", addressIconBgColor: "#332818", addressTitleColor: "#F0E0C8", addressTextColor: "#8A7050", addressFont: "Cormorant Garamond", addressFontSize: 14, addressFontWeight: "400", phoneIconColor: "#C8963E", phoneIconBgColor: "#332818", phoneTitleColor: "#F0E0C8", phoneTextColor: "#8A7050", phoneFont: "Cormorant Garamond", phoneFontSize: 14, phoneFontWeight: "400", hoursIconColor: "#C8963E", hoursIconBgColor: "#332818", hoursTitleColor: "#F0E0C8", hoursContentColor: "#8A7050", hoursLinkColor: "#C8963E", hoursLinkFont: "Cormorant Garamond", hoursLinkFontSize: 14, hoursLinkFontWeight: "500", scheduleModalBg: "#221A10", scheduleModalTitleColor: "#F0E0C8", scheduleModalTextColor: "#8A7050", scheduleModalStatusColor: "#22c55e", scheduleModalHighlightBg: "#332818", socialBtnBgColor: "#332818", socialIconColor: "#C8963E", socialBtnTextColor: "#8A7050", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#140E08", cardsBgColor: "#221A10", bgOverlayOpacity: 0, bgOverlayColor: "#000000", footerBgColor: "#0A0704", footerTextColor: "#6A5538", footerCtaBg: "#C8963E", footerCtaTextColor: "#140E08", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "center" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Como podemos ajudar?", buttonText: "Iniciar Conversa", popupBg: "#221A10", popupTextColor: "#F0E0C8", buttonBg: "#C8963E", buttonTextColor: "#140E08" },
  },
};

// ============================================
// PRESET 17 — ITALIANO | Classic Olive
// ============================================

const italiano: DesignPreset = {
  id: "italiano",
  name: "Italiano",
  description: "Light mode clássico com tons de oliva e terracota italiana.",
  niche: "Comida italiana, massas, cantinas, trattorias",
  colors: { primary: "#8B4513", background: "#FBF8F3", accent: "#F0EBE0" },
  themeColors: { primary: "#8B4513", background: "#FBF8F3", foreground: "#2C1810", accent: "#F0EBE0", muted: "#8A7A68", buttonPrimary: "#8B4513", highlight: "#5B7A3A", success: "#22c55e" },
  fontFamily: "Crimson Text",
  fontDisplay: "Playfair Display",
  borderRadius: "0.5rem",
  design: {
    home: { logoType: "text", logoSize: 80, headerBgColor: "rgba(251,248,243,0.92)", headerBehavior: "reveal_on_scroll", locationBoxBg: "rgba(139,69,19,0.08)", locationBoxText: "#8A7A68", locationBoxIcon: "#8B4513", locationLabel: "", locationBoxGlassmorphism: false, scheduleBoxBg: "rgba(91,122,58,0.1)", scheduleBoxText: "#5B7A3A", scheduleBoxIcon: "#5B7A3A", scheduleLabel: "", scheduleBoxGlassmorphism: false, badgeOpenColor: "#5B7A3A", badgeClosedColor: "#dc2626", headline: "Autentica Cucina Italiana", headlineFont: "Playfair Display", headlineFontSize: 60, headlineFontWeight: "700", headlineColor: "#2C1810", subheadline: "Receitas da nonna com ingredientes frescos", subheadlineFont: "Crimson Text", subheadlineFontSize: 20, subheadlineFontWeight: "400", subheadlineColor: "#8A7A68", ctaText: "Ver Cardápio", ctaBgColor: "#8B4513", ctaTextColor: "#ffffff", ctaGradient: false, ctaGradientEnd: "#6E3610", ctaAction: "#cardapio", bgMediaType: "image", bgOverlayOpacity: 15, bgOverlayColor: "#FBF8F3", bgFallbackColor: "#FBF8F3" },
    products: { headline: "Nosso Cardápio", subheadline: "Massas frescas e sabores tradicionais", maxCategories: 3, offersCategoryId: null, headlineFont: "Playfair Display", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#2C1810", subheadlineFont: "Crimson Text", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#8A7A68", cardBgColor: "#ffffff", cardNameColor: "#2C1810", cardPriceColor: "#8B4513", cardDescColor: "#8A7A68", cardUnitColor: "#A8988A", cardBorderRadius: 8, cardBorderColor: "#E0D8CC", cardBorderWidth: 1, cardButtonText: "Adicionar", cardButtonBgColor: "#8B4513", cardButtonTextColor: "#ffffff", bgColor: "#FBF8F3", bgGradient: false, bgGradientFrom: "#FBF8F3", bgGradientTo: "#F0EBE0", bgGradientDirection: "to-b", bgOverlayOpacity: 0, bgOverlayColor: "#ffffff", viewAllBgColor: "transparent", viewAllTextColor: "#8B4513", viewAllFont: "Crimson Text", viewAllFontSize: 14, viewAllFontWeight: "600", viewAllLabel: "Ver todos", ctaText: "Ver Cardápio Completo", ctaBgColor: "#8B4513", ctaTextColor: "#ffffff", ctaGradient: false, ctaGradientEnd: "#6E3610", ctaFont: "Crimson Text", ctaFontSize: 16, ctaFontWeight: "600", ctaAction: "#cardapio" },
    about: { preHeadline: "NOSSA HISTÓRIA", preHeadlineFont: "Crimson Text", preHeadlineFontSize: 14, preHeadlineFontWeight: "600", preHeadlineColor: "#8B4513", headline: "Sobre Nós", headlineFont: "Playfair Display", headlineFontSize: 48, headlineFontWeight: "700", headlineColor: "#2C1810", imageRadius: 12, ownerNameFont: "Playfair Display", ownerNameFontSize: 20, ownerNameFontWeight: "700", ownerNameColor: "#2C1810", ownerTitleColor: "#8A7A68", storytellingFont: "Crimson Text", storytellingFontSize: 18, storytellingFontWeight: "400", storytellingColor: "#5A4A3A", signatureColor: "#8B4513", showSignature: true, bgOverlayOpacity: 0, bgOverlayColor: "#ffffff", bgFallbackColor: "#F0EBE0", imagePosition: "right", showDecorative: true, textColor: "#2C1810" },
    menu: { menuSectionTitle: "Cardápio", panelBgColor: "#FBF8F3", panelOverlayOpacity: 70, panelOverlayColor: "#F0EBE0", headerTextColor: "#2C1810", searchBorderColor: "#E0D8CC", searchBgColor: "#ffffff", searchTextColor: "#2C1810", searchPlaceholderColor: "#A8988A", searchIconColor: "#8A7A68", categoryNameColor: "#8B4513", filterActiveBgColor: "#8B4513", filterActiveTextColor: "#ffffff", filterInactiveBgColor: "#F0EBE0", filterInactiveTextColor: "#8A7A68", cardBgColor: "#ffffff", cardBorderColor: "#E0D8CC", cardBorderWidth: 1, cardBorderRadius: 8, cardNameColor: "#2C1810", cardPriceColor: "#8B4513", cardDescColor: "#8A7A68", cardFont: "Crimson Text", cardFontSize: 15, cardFontWeight: "400", cardButtonText: "Adicionar", cardButtonBgColor: "#8B4513", cardButtonTextColor: "#ffffff", modalBgColor: "#ffffff", modalNameColor: "#2C1810", modalUnitColor: "#A8988A", modalPriceColor: "#8B4513", modalDescColor: "#8A7A68", modalCtaBgColor: "#8B4513", modalCtaTextColor: "#ffffff", modalCtaFont: "Crimson Text", modalCtaFontSize: 16, modalCtaFontWeight: "600", qtyLabelColor: "#8A7A68", qtyBtnBgColor: "#F0EBE0", qtyBtnTextColor: "#2C1810", qtyNumberColor: "#2C1810" },
    toast: { bgColor: "#ffffff", borderColor: "#8B4513", titleColor: "#2C1810", subtitleColor: "#8A7A68", iconCheckColor: "#ffffff", iconBgColor: "#8B4513", closeButtonColor: "#A8988A" },
    cartLanding: { modalBgColor: "#FBF8F3", headerTextColor: "#2C1810", headerCloseColor: "#8A7A68", headerIconColor: "#8B4513", itemBgColor: "#ffffff", itemBorderColor: "#E0D8CC", itemNameColor: "#2C1810", itemPriceColor: "#8B4513", itemTrashColor: "#dc2626", qtyBtnBgColor: "#F0EBE0", qtyBtnTextColor: "#2C1810", qtyNumberColor: "#2C1810", obsBgColor: "#ffffff", obsBorderColor: "#E0D8CC", obsTextColor: "#8A7A68", totalLabelColor: "#8A7A68", totalValueColor: "#8B4513", ctaBgColor: "#8B4513", ctaTextColor: "#ffffff", clearLinkColor: "#dc2626" },
    cartMenu: { modalBgColor: "#FBF8F3", headerTextColor: "#2C1810", headerCloseColor: "#8A7A68", headerIconColor: "#8B4513", itemBgColor: "#ffffff", itemBorderColor: "#E0D8CC", itemNameColor: "#2C1810", itemPriceColor: "#8B4513", itemTrashColor: "#dc2626", qtyBtnBgColor: "#F0EBE0", qtyBtnTextColor: "#2C1810", qtyNumberColor: "#2C1810", obsBgColor: "#ffffff", obsBorderColor: "#E0D8CC", obsTextColor: "#8A7A68", totalLabelColor: "#8A7A68", totalValueColor: "#8B4513", ctaBgColor: "#8B4513", ctaTextColor: "#ffffff", clearLinkColor: "#dc2626" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#C8963E", label: "AVALIAÇÕES", labelFont: "Crimson Text", labelFontSize: 14, labelFontWeight: "600", labelColor: "#8B4513", headlineFont: "Playfair Display", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#2C1810", ratingNumberColor: "#2C1810", ratingTotalColor: "#A8988A", cardBgColor: "#ffffff", cardNameColor: "#2C1810", cardDateColor: "#A8988A", cardTextColor: "#5A4A3A", ctaBgColor: "#8B4513", ctaTextColor: "#ffffff", ctaFont: "Crimson Text", ctaFontSize: 14, ctaFontWeight: "600", bgColor: "#F0EBE0", bgOverlayOpacity: 0, bgOverlayColor: "#ffffff" },
    feedbacks: { starColor: "#C8963E" },
    info: { label: "LOCALIZAÇÃO", labelFont: "Crimson Text", labelFontSize: 14, labelFontWeight: "600", labelColor: "#8B4513", headline: "Venha nos visitar", headlineFont: "Playfair Display", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#2C1810", subheadline: "Estamos esperando por você", subheadlineFont: "Crimson Text", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#8A7A68", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 15, mapPinColor: "#8B4513", mapBtnBgColor: "#8B4513", mapBtnTextColor: "#ffffff", mapBtnFont: "Crimson Text", mapBtnFontSize: 14, mapBtnFontWeight: "600", mapBtnLabel: "Como Chegar", addressIconColor: "#8B4513", addressIconBgColor: "#F0EBE0", addressTitleColor: "#2C1810", addressTextColor: "#8A7A68", addressFont: "Crimson Text", addressFontSize: 14, addressFontWeight: "400", phoneIconColor: "#8B4513", phoneIconBgColor: "#F0EBE0", phoneTitleColor: "#2C1810", phoneTextColor: "#8A7A68", phoneFont: "Crimson Text", phoneFontSize: 14, phoneFontWeight: "400", hoursIconColor: "#8B4513", hoursIconBgColor: "#F0EBE0", hoursTitleColor: "#2C1810", hoursContentColor: "#8A7A68", hoursLinkColor: "#8B4513", hoursLinkFont: "Crimson Text", hoursLinkFontSize: 14, hoursLinkFontWeight: "500", scheduleModalBg: "#ffffff", scheduleModalTitleColor: "#2C1810", scheduleModalTextColor: "#8A7A68", scheduleModalStatusColor: "#5B7A3A", scheduleModalHighlightBg: "#F0EBE0", socialBtnBgColor: "#F0EBE0", socialIconColor: "#8B4513", socialBtnTextColor: "#8A7A68", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#FBF8F3", cardsBgColor: "#ffffff", bgOverlayOpacity: 0, bgOverlayColor: "#ffffff", footerBgColor: "#F0EBE0", footerTextColor: "#8A7A68", footerCtaBg: "#8B4513", footerCtaTextColor: "#ffffff", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "center" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Como podemos ajudar?", buttonText: "Iniciar Conversa", popupBg: "#ffffff", popupTextColor: "#2C1810", buttonBg: "#8B4513", buttonTextColor: "#ffffff" },
  },
};

// ============================================
// PRESET 18 — FOOD TRUCK | Neon Street
// ============================================

const foodTruck: DesignPreset = {
  id: "food-truck",
  name: "Food Truck",
  description: "Dark mode urbano com neon verde-limão e grafite.",
  niche: "Food trucks, street food, comida de rua, festivais",
  colors: { primary: "#A3E635", background: "#0F0F0F", accent: "#1A1A1A" },
  themeColors: { primary: "#A3E635", background: "#0F0F0F", foreground: "#F0F0F0", accent: "#1A1A1A", muted: "#737373", buttonPrimary: "#A3E635", highlight: "#FACC15", success: "#22c55e" },
  fontFamily: "Space Grotesk",
  fontDisplay: "Space Grotesk",
  borderRadius: "0.75rem",
  design: {
    home: { logoType: "text", logoSize: 80, headerBgColor: "rgba(15,15,15,0.88)", headerBehavior: "always_visible", locationBoxBg: "rgba(163,230,53,0.1)", locationBoxText: "#737373", locationBoxIcon: "#A3E635", locationLabel: "", locationBoxGlassmorphism: true, scheduleBoxBg: "rgba(163,230,53,0.1)", scheduleBoxText: "#A3E635", scheduleBoxIcon: "#A3E635", scheduleLabel: "", scheduleBoxGlassmorphism: true, badgeOpenColor: "#A3E635", badgeClosedColor: "#ef4444", headline: "Street Food de Verdade", headlineFont: "Space Grotesk", headlineFontSize: 64, headlineFontWeight: "700", headlineColor: "#F0F0F0", subheadline: "Sabor na rua, qualidade de restaurante", subheadlineFont: "Space Grotesk", subheadlineFontSize: 20, subheadlineFontWeight: "400", subheadlineColor: "#737373", ctaText: "Fazer Pedido", ctaBgColor: "#A3E635", ctaTextColor: "#0F0F0F", ctaGradient: false, ctaGradientEnd: "#84CC16", ctaAction: "#cardapio", bgMediaType: "image", bgOverlayOpacity: 60, bgOverlayColor: "#0F0F0F", bgFallbackColor: "#0F0F0F" },
    products: { headline: "Nosso Cardápio", subheadline: "Feito na hora, do nosso truck pra você", maxCategories: 3, offersCategoryId: null, headlineFont: "Space Grotesk", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#F0F0F0", subheadlineFont: "Space Grotesk", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#737373", cardBgColor: "#1A1A1A", cardNameColor: "#F0F0F0", cardPriceColor: "#A3E635", cardDescColor: "#737373", cardUnitColor: "#525252", cardBorderRadius: 12, cardBorderColor: "#2A2A2A", cardBorderWidth: 1, cardButtonText: "Pedir", cardButtonBgColor: "#A3E635", cardButtonTextColor: "#0F0F0F", bgColor: "#0F0F0F", bgGradient: false, bgGradientFrom: "#0F0F0F", bgGradientTo: "#1A1A1A", bgGradientDirection: "to-b", bgOverlayOpacity: 0, bgOverlayColor: "#000000", viewAllBgColor: "transparent", viewAllTextColor: "#A3E635", viewAllFont: "Space Grotesk", viewAllFontSize: 14, viewAllFontWeight: "600", viewAllLabel: "Ver todos", ctaText: "Ver Cardápio Completo", ctaBgColor: "#A3E635", ctaTextColor: "#0F0F0F", ctaGradient: false, ctaGradientEnd: "#84CC16", ctaFont: "Space Grotesk", ctaFontSize: 16, ctaFontWeight: "700", ctaAction: "#cardapio" },
    about: { preHeadline: "NOSSA HISTÓRIA", preHeadlineFont: "Space Grotesk", preHeadlineFontSize: 14, preHeadlineFontWeight: "600", preHeadlineColor: "#A3E635", headline: "Sobre Nós", headlineFont: "Space Grotesk", headlineFontSize: 48, headlineFontWeight: "700", headlineColor: "#F0F0F0", imageRadius: 12, ownerNameFont: "Space Grotesk", ownerNameFontSize: 20, ownerNameFontWeight: "700", ownerNameColor: "#F0F0F0", ownerTitleColor: "#737373", storytellingFont: "Space Grotesk", storytellingFontSize: 18, storytellingFontWeight: "400", storytellingColor: "#A3A3A3", signatureColor: "#A3E635", showSignature: true, bgOverlayOpacity: 0, bgOverlayColor: "#000000", bgFallbackColor: "#0F0F0F", imagePosition: "left", showDecorative: false, textColor: "#F0F0F0" },
    menu: { menuSectionTitle: "Cardápio", panelBgColor: "#0F0F0F", panelOverlayOpacity: 80, panelOverlayColor: "#080808", headerTextColor: "#F0F0F0", searchBorderColor: "#2A2A2A", searchBgColor: "#1A1A1A", searchTextColor: "#F0F0F0", searchPlaceholderColor: "#525252", searchIconColor: "#525252", categoryNameColor: "#A3E635", filterActiveBgColor: "#A3E635", filterActiveTextColor: "#0F0F0F", filterInactiveBgColor: "#2A2A2A", filterInactiveTextColor: "#737373", cardBgColor: "#1A1A1A", cardBorderColor: "#2A2A2A", cardBorderWidth: 1, cardBorderRadius: 12, cardNameColor: "#F0F0F0", cardPriceColor: "#A3E635", cardDescColor: "#737373", cardFont: "Space Grotesk", cardFontSize: 14, cardFontWeight: "400", cardButtonText: "Pedir", cardButtonBgColor: "#A3E635", cardButtonTextColor: "#0F0F0F", modalBgColor: "#1A1A1A", modalNameColor: "#F0F0F0", modalUnitColor: "#525252", modalPriceColor: "#A3E635", modalDescColor: "#737373", modalCtaBgColor: "#A3E635", modalCtaTextColor: "#0F0F0F", modalCtaFont: "Space Grotesk", modalCtaFontSize: 16, modalCtaFontWeight: "700", qtyLabelColor: "#737373", qtyBtnBgColor: "#2A2A2A", qtyBtnTextColor: "#F0F0F0", qtyNumberColor: "#F0F0F0" },
    toast: { bgColor: "#1A1A1A", borderColor: "#A3E635", titleColor: "#F0F0F0", subtitleColor: "#737373", iconCheckColor: "#0F0F0F", iconBgColor: "#A3E635", closeButtonColor: "#525252" },
    cartLanding: { modalBgColor: "#0F0F0F", headerTextColor: "#F0F0F0", headerCloseColor: "#525252", headerIconColor: "#A3E635", itemBgColor: "#1A1A1A", itemBorderColor: "#2A2A2A", itemNameColor: "#F0F0F0", itemPriceColor: "#A3E635", itemTrashColor: "#ef4444", qtyBtnBgColor: "#2A2A2A", qtyBtnTextColor: "#F0F0F0", qtyNumberColor: "#F0F0F0", obsBgColor: "#1A1A1A", obsBorderColor: "#2A2A2A", obsTextColor: "#737373", totalLabelColor: "#737373", totalValueColor: "#A3E635", ctaBgColor: "#A3E635", ctaTextColor: "#0F0F0F", clearLinkColor: "#ef4444" },
    cartMenu: { modalBgColor: "#0F0F0F", headerTextColor: "#F0F0F0", headerCloseColor: "#525252", headerIconColor: "#A3E635", itemBgColor: "#1A1A1A", itemBorderColor: "#2A2A2A", itemNameColor: "#F0F0F0", itemPriceColor: "#A3E635", itemTrashColor: "#ef4444", qtyBtnBgColor: "#2A2A2A", qtyBtnTextColor: "#F0F0F0", qtyNumberColor: "#F0F0F0", obsBgColor: "#1A1A1A", obsBorderColor: "#2A2A2A", obsTextColor: "#737373", totalLabelColor: "#737373", totalValueColor: "#A3E635", ctaBgColor: "#A3E635", ctaTextColor: "#0F0F0F", clearLinkColor: "#ef4444" },
    reviews: { headline: "O que dizem nossos clientes", isVisible: true, starColor: "#FACC15", label: "AVALIAÇÕES", labelFont: "Space Grotesk", labelFontSize: 14, labelFontWeight: "600", labelColor: "#A3E635", headlineFont: "Space Grotesk", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#F0F0F0", ratingNumberColor: "#F0F0F0", ratingTotalColor: "#525252", cardBgColor: "#1A1A1A", cardNameColor: "#F0F0F0", cardDateColor: "#525252", cardTextColor: "#A3A3A3", ctaBgColor: "#A3E635", ctaTextColor: "#0F0F0F", ctaFont: "Space Grotesk", ctaFontSize: 14, ctaFontWeight: "700", bgColor: "#0F0F0F", bgOverlayOpacity: 0, bgOverlayColor: "#000000" },
    feedbacks: { starColor: "#FACC15" },
    info: { label: "LOCALIZAÇÃO", labelFont: "Space Grotesk", labelFontSize: 14, labelFontWeight: "600", labelColor: "#A3E635", headline: "Venha nos visitar", headlineFont: "Space Grotesk", headlineFontSize: 40, headlineFontWeight: "700", headlineColor: "#F0F0F0", subheadline: "Estamos esperando por você", subheadlineFont: "Space Grotesk", subheadlineFontSize: 18, subheadlineFontWeight: "400", subheadlineColor: "#737373", headline1: "Venha nos visitar", subheadline1: "Estamos esperando por você", ctaText: "Como Chegar", mapOverlayOpacity: 50, mapPinColor: "#A3E635", mapBtnBgColor: "#A3E635", mapBtnTextColor: "#0F0F0F", mapBtnFont: "Space Grotesk", mapBtnFontSize: 14, mapBtnFontWeight: "700", mapBtnLabel: "Como Chegar", addressIconColor: "#A3E635", addressIconBgColor: "#2A2A2A", addressTitleColor: "#F0F0F0", addressTextColor: "#737373", addressFont: "Space Grotesk", addressFontSize: 14, addressFontWeight: "400", phoneIconColor: "#A3E635", phoneIconBgColor: "#2A2A2A", phoneTitleColor: "#F0F0F0", phoneTextColor: "#737373", phoneFont: "Space Grotesk", phoneFontSize: 14, phoneFontWeight: "400", hoursIconColor: "#A3E635", hoursIconBgColor: "#2A2A2A", hoursTitleColor: "#F0F0F0", hoursContentColor: "#737373", hoursLinkColor: "#A3E635", hoursLinkFont: "Space Grotesk", hoursLinkFontSize: 14, hoursLinkFontWeight: "600", scheduleModalBg: "#1A1A1A", scheduleModalTitleColor: "#F0F0F0", scheduleModalTextColor: "#737373", scheduleModalStatusColor: "#A3E635", scheduleModalHighlightBg: "#2A2A2A", socialBtnBgColor: "#2A2A2A", socialIconColor: "#A3E635", socialBtnTextColor: "#737373", socialBtnShowText: false, socialInstagramEnabled: true, socialFacebookEnabled: true, socialYoutubeEnabled: false, sectionBgColor: "#0F0F0F", cardsBgColor: "#1A1A1A", bgOverlayOpacity: 0, bgOverlayColor: "#000000", footerBgColor: "#080808", footerTextColor: "#525252", footerCtaBg: "#A3E635", footerCtaTextColor: "#0F0F0F", footerShowLogo: true, showMap: true, showAddress: true, showPhone: true, showHours: true, showSocial: true },
    global: { alignment: "center" },
    sectionColors: {},
    whatsapp: { popupTitle: "Olá! Como podemos ajudar?", buttonText: "Iniciar Conversa", popupBg: "#1A1A1A", popupTextColor: "#F0F0F0", buttonBg: "#A3E635", buttonTextColor: "#0F0F0F" },
  },
};

// ============================================
// EXPORT ALL PRESETS
// ============================================

export const DESIGN_PRESETS: DesignPreset[] = [
  warmLuxury,
  bistroModerno,
  pizzariaRustica,
  doceriaRose,
  acaiHealthy,
  japonesMinimalista,
  churrascaria,
  padariaCafe,
  marmitaria,
  botecoPetiscos,
  sorveteGelato,
  frangoFastFood,
  veganoNatural,
  frutosDoMar,
  mexicano,
  arabeEsfiha,
  italiano,
  foodTruck,
];

export default DESIGN_PRESETS;
