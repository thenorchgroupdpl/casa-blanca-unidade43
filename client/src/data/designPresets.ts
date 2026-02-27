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
// EXPORT ALL PRESETS
// ============================================

export const DESIGN_PRESETS: DesignPreset[] = [
  warmLuxury,
  bistroModerno,
  pizzariaRustica,
  doceriaRose,
  acaiHealthy,
  japonesMinimalista,
];

export default DESIGN_PRESETS;
