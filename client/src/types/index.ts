// Casa Blanca - Type Definitions

export interface Theme {
  mode: 'dark' | 'light';
  primary_color: string;
  secondary_color: string;
}

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  zip: string;
  city: string;
  state: string;
  map_link: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Contact {
  whatsapp: string;
  phone: string;
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  address: Address;
}

export interface DaySchedule {
  day: string;
  dayNumber: number;
  open: string;  // shift1_start (backward compat alias)
  close: string; // shift1_end (backward compat alias)
  shift2_start?: string | null; // 2nd shift opening (e.g., dinner)
  shift2_end?: string | null;   // 2nd shift closing
  closed: boolean;
}

export interface BusinessHours {
  timezone: string;
  schedule: DaySchedule[];
}

export interface HeroContent {
  headline: string;
  subheadline: string;
  media_url: string;
  media_type: 'image' | 'video';
  cta_text: string;
  // Granular style overrides from Design System
  header_bg_color?: string;
  header_behavior?: 'always_visible' | 'reveal_on_scroll';
  logo_size?: number;
  location_box_bg?: string;
  location_box_text?: string;
  location_box_icon?: string;
  location_label?: string;
  location_box_glassmorphism?: boolean;
  schedule_box_bg?: string;
  schedule_box_text?: string;
  schedule_box_icon?: string;
  schedule_label?: string;
  schedule_box_glassmorphism?: boolean;
  headline_font?: string;
  headline_font_size?: number;
  headline_font_weight?: string;
  headline_color?: string;
  subheadline_font?: string;
  subheadline_font_size?: number;
  subheadline_font_weight?: string;
  subheadline_color?: string;
  cta_bg_color?: string;
  cta_text_color?: string;
  cta_gradient?: boolean;
  cta_gradient_end?: string;
  cta_action?: string;
  bg_overlay_opacity?: number;
  bg_overlay_color?: string;
  bg_fallback_color?: string;
}

export interface IntroContent {
  headline: string;
  subheadline: string;
  // Granular style overrides from Design System (Products section)
  headline_font?: string;
  headline_font_size?: number;
  headline_font_weight?: string;
  headline_color?: string;
  subheadline_font?: string;
  subheadline_font_size?: number;
  subheadline_font_weight?: string;
  subheadline_color?: string;
  // Card template
  card_bg_color?: string;
  card_name_color?: string;
  card_price_color?: string;
  card_desc_color?: string;
  card_unit_color?: string;
  card_border_radius?: number;
  card_border_color?: string;
  card_border_width?: number;
  // Card button (CTA)
  card_button_text?: string;
  card_button_bg_color?: string;
  card_button_text_color?: string;
  // Section background
  bg_color?: string;
  bg_gradient?: boolean;
  bg_gradient_from?: string;
  bg_gradient_to?: string;
  bg_gradient_direction?: string;
  bg_media_url?: string;
  bg_media_type?: 'image' | 'video';
  bg_overlay_opacity?: number;
  bg_overlay_color?: string;
  // View All button
  view_all_bg_color?: string;
  view_all_text_color?: string;
  view_all_font?: string;
  view_all_font_size?: number;
  view_all_font_weight?: string;
  view_all_label?: string;
  // CTA button
  cta_text?: string;
  cta_bg_color?: string;
  cta_text_color?: string;
  cta_gradient?: boolean;
  cta_gradient_end?: string;
  cta_font?: string;
  cta_font_size?: number;
  cta_font_weight?: string;
  cta_action?: string;
}

export interface AboutContent {
  pre_headline: string;
  headline: string;
  text: string;
  owner_photo: string;
  owner_name: string;
  owner_title: string;
  // Granular style overrides from Design System
  pre_headline_font?: string;
  pre_headline_font_size?: number;
  pre_headline_font_weight?: string;
  pre_headline_color?: string;
  headline_font?: string;
  headline_font_size?: number;
  headline_font_weight?: string;
  headline_color?: string;
  image_radius?: number;
  owner_name_font?: string;
  owner_name_font_size?: number;
  owner_name_font_weight?: string;
  owner_name_color?: string;
  owner_title_color?: string;
  storytelling_font?: string;
  storytelling_font_size?: number;
  storytelling_font_weight?: string;
  storytelling_color?: string;
  signature_text?: string;
  signature_color?: string;
  show_signature?: boolean;
  bg_media_url?: string;
  bg_media_type?: 'image' | 'video';
  bg_overlay_opacity?: number;
  bg_overlay_color?: string;
  bg_fallback_color?: string;
  image_position?: 'left' | 'right';
  show_decorative?: boolean;
}

export interface LocationContent {
  pre_headline: string;
  headline: string;
  subheadline: string;
  map_preview: string;
  bg_media_url?: string;
  bg_media_type?: 'image' | 'video';
  bg_overlay_opacity?: number;
  map_image_url?: string;
  map_overlay_opacity?: number;
}

export interface FooterContent {
  cta_headline: string;
  cta_subheadline: string;
  copyright: string;
  developer: string;
}

export interface SectionsContent {
  hero: HeroContent;
  intro: IntroContent;
  about: AboutContent;
  location: LocationContent;
  footer: FooterContent;
}

export interface Feedback {
  id: string;
  author_name: string;
  author_photo: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
  photos: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  available: boolean;
  unitValue?: string | null;
  unit?: string | null;
  highlightTag?: string | null;
  originalPrice?: number | null;
}

export interface Category {
  id: string;
  category_name: string;
  category_icon: string;
  highlight_on_home: boolean;
  products: Product[];
}

export interface SectionColors {
  enabled?: boolean;
  background?: string;
  text?: string;
  textMuted?: string;
  highlight?: string;
  surface?: string;
  border?: string;
  buttonBg?: string;
  buttonFg?: string;
}

export interface MenuStyleOverrides {
  // 3.1 Painel do Cardápio
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
  // 3.2 Filtros de Categoria
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
  // Botão Adicionar (CTA do Card) — ISOLADO da seção 2.3
  cardButtonText?: string;
  cardButtonBgColor?: string;
  cardButtonTextColor?: string;
  // Título editável do Cardápio
  menuSectionTitle?: string;
  // 3.4 Modal de Detalhes
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
}

export interface FeedbacksStyleOverrides {
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
  starColor?: string;
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
  bgMediaType?: 'image' | 'video';
  bgOverlayOpacity?: number;
  bgOverlayColor?: string;
}

export interface InfoStyleOverrides {
  // 6.1 Label, Headline, Subtitle
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
  // 6.2 Map
  showMapPin?: boolean;
  showMapLabel?: boolean;
  mapCoverUrl?: string;
  mapPinColor?: string;
  mapBtnBgColor?: string;
  mapBtnTextColor?: string;
  mapBtnFont?: string;
  mapBtnFontSize?: number;
  mapBtnFontWeight?: string;
  mapBtnLabel?: string;
  mapUrl?: string;
  // 6.3 Address
  addressIconColor?: string;
  addressIconBgColor?: string;
  addressText?: string;
  addressTextColor?: string;
  addressFont?: string;
  addressFontSize?: number;
  addressFontWeight?: string;
  // 6.4 Phone
  phoneIconColor?: string;
  phoneIconBgColor?: string;
  phoneText?: string;
  phoneTextColor?: string;
  phoneFont?: string;
  phoneFontSize?: number;
  phoneFontWeight?: string;
  // 6.5 Hours
  hoursIconColor?: string;
  hoursIconBgColor?: string;
  hoursLinkColor?: string;
  hoursLinkFont?: string;
  hoursLinkFontSize?: number;
  hoursLinkFontWeight?: string;
  hoursLinkUrl?: string;
  // 6.6 Social
  socialBtnBgColor?: string;
  socialIconColor?: string;
  socialInstagramUrl?: string;
  socialInstagramEnabled?: boolean;
  socialFacebookUrl?: string;
  socialFacebookEnabled?: boolean;
  socialYoutubeUrl?: string;
  socialYoutubeEnabled?: boolean;
  socialTiktokUrl?: string;
  socialTiktokEnabled?: boolean;
  // 6.7 Background
  sectionBgColor?: string;
  cardsBgColor?: string;
  bgMediaUrl?: string;
  bgMediaType?: 'image' | 'video';
  bgOverlayOpacity?: number;
  bgOverlayColor?: string;
}

export interface SiteData {
  project_name: string;
  logo_url?: string;
  logo_type?: 'image' | 'text';
  theme: Theme;
  contact: Contact;
  business_hours: BusinessHours;
  sections_content: SectionsContent;
  feedbacks: Feedback[];
  catalog: Category[];
  menu_style?: MenuStyleOverrides;
  feedbacks_style?: FeedbacksStyleOverrides;
  info_style?: InfoStyleOverrides;
  section_colors?: {
    hero?: SectionColors;
    intro?: SectionColors;
    vitrine?: SectionColors;
    about?: SectionColors;
    feedbacks?: SectionColors;
    location?: SectionColors;
  };
  // Toast style
  toast_style?: {
    bgColor?: string;
    borderColor?: string;
    titleColor?: string;
    subtitleColor?: string;
    iconCheckColor?: string;
    iconBgColor?: string;
    closeButtonColor?: string;
  };
  // Cart style — Landing Page
  cart_landing_style?: {
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
  // Cart style — Cardápio
  cart_menu_style?: {
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
  };
  // WhatsApp Popup attendant info
  whatsapp_avatar?: string;
  whatsapp_name?: string;
  whatsapp_popup_title?: string;
  whatsapp_button_text?: string;
  // Delivery fee
  delivery_fee?: number;
  // Google Maps link
  google_maps_link?: string;
  // Show business hours toggle (for "Sob Encomenda" stores)
  show_business_hours?: boolean;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

// UI State types
export interface AppState {
  isOrderOverlayOpen: boolean;
  selectedCategory: string | null;
  searchQuery: string;
  selectedProduct: Product | null;
  isBottomSheetOpen: boolean;
  isWhatsAppModalOpen: boolean;
  isScheduleModalOpen: boolean;
}
