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
