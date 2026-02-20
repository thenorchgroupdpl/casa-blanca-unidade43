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
  address: Address;
}

export interface DaySchedule {
  day: string;
  dayNumber: number;
  open: string;
  close: string;
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
  logo_size?: number;
  location_box_bg?: string;
  location_box_text?: string;
  location_box_icon?: string;
  location_label?: string;
  schedule_box_bg?: string;
  schedule_box_text?: string;
  schedule_box_icon?: string;
  schedule_label?: string;
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
}

export interface AboutContent {
  pre_headline: string;
  headline: string;
  text: string;
  owner_photo: string;
  owner_name: string;
  owner_title: string;
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
  section_colors?: {
    hero?: SectionColors;
    intro?: SectionColors;
    vitrine?: SectionColors;
    about?: SectionColors;
    feedbacks?: SectionColors;
    location?: SectionColors;
  };
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
