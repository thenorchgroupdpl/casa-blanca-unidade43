import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";

/**
 * Casa Blanca SaaS - Multi-Tenant Database Schema
 * 
 * Architecture:
 * - SUPER ADMIN: Platform owner (Casa Blanca team) - manages all tenants
 * - CLIENT ADMIN: Store owner (Lojista) - manages their own store
 * 
 * Hierarchy: Users -> Tenants -> Categories -> Products
 */

// ============================================
// USERS TABLE - Authentication & Authorization
// ============================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  // Role hierarchy: super_admin > client_admin > user
  role: mysqlEnum("role", ["user", "admin", "super_admin", "client_admin"]).default("user").notNull(),
  // Tenant association (null for super_admin, required for client_admin)
  tenantId: int("tenantId"),
  // Profile
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// TENANTS TABLE - Multi-Tenant Core
// ============================================
export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  // Basic Info
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // URL-friendly identifier
  cnpj: varchar("cnpj", { length: 20 }), // CNPJ da empresa
  razaoSocial: varchar("razaoSocial", { length: 255 }), // Razão Social
  emailDono: varchar("emailDono", { length: 320 }), // E-mail do dono
  telefoneDono: varchar("telefoneDono", { length: 20 }), // Telefone de contato
  
  // Domain Configuration
  domainCustom: varchar("domainCustom", { length: 255 }), // Domínio próprio (ex: www.restaurante.com.br)
  
  // Business Classification
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["starter", "professional", "enterprise"]).default("starter").notNull(),
  clientStatus: mysqlEnum("clientStatus", ["active", "disabled", "implementing"]).default("implementing").notNull(),
  landingStatus: mysqlEnum("landingStatus", ["published", "draft", "error"]).default("draft").notNull(),
  niche: varchar("niche", { length: 100 }), // e.g., Restaurante, Pizzaria, Hamburgueria, Cafeteria, Doceria
  
  // Location
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }), // UF (e.g., MG, SP, RJ)
  
  // API Integrations (managed by Super Admin only)
  googleApiKey: varchar("googleApiKey", { length: 255 }), // Google Maps/Places API Key
  googlePlaceId: varchar("googlePlaceId", { length: 255 }), // Google Place ID for reviews
  
  // Design System (managed by Super Admin only)
  themeColors: json("themeColors").$type<{
    primary: string;      // Main brand color (e.g., #D4AF37)
    background: string;   // Background color (e.g., #121212)
    foreground: string;   // Text color (e.g., #FFFFFF)
    accent: string;       // Accent color
    muted: string;        // Muted text color
  }>(),
  fontFamily: varchar("fontFamily", { length: 255 }).default("DM Sans"),
  fontDisplay: varchar("fontDisplay", { length: 255 }).default("DM Serif Display"),
  borderRadius: varchar("borderRadius", { length: 20 }).default("0.75rem"), // rounded-xl
  
  // Status (legacy - kept for backward compatibility, use clientStatus instead)
  isActive: boolean("isActive").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

// ============================================
// STORE SETTINGS TABLE - Lojista Configuration
// ============================================
export const storeSettings = mysqlTable("store_settings", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull().unique(),
  
  // Contact Info (editable by Client Admin)
  whatsapp: varchar("whatsapp", { length: 20 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  
  // Address (editable by Client Admin)
  address: varchar("address", { length: 500 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  cep: varchar("cep", { length: 10 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  
  // Opening Hours (JSON structure for flexibility)
  openingHours: json("openingHours").$type<{
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  }>(),
  
  // Social Links (editable by Client Admin)
  socialLinks: json("socialLinks").$type<{
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  }>(),
  
  // Hero/About Content (editable by Client Admin)
  heroTitle: varchar("heroTitle", { length: 255 }),
  heroSubtitle: varchar("heroSubtitle", { length: 500 }),
  aboutTitle: varchar("aboutTitle", { length: 255 }),
  aboutText: text("aboutText"),
  ownerName: varchar("ownerName", { length: 255 }),
  ownerPhoto: varchar("ownerPhoto", { length: 500 }),
  
  // Landing Page Design Configuration (managed by Super Admin via Design Builder)
  landingDesign: json("landingDesign").$type<{
    home?: {
      logoUrl?: string;
      logoType?: 'image' | 'text';
      bgMediaUrl?: string;
      bgMediaType?: 'image' | 'video';
      bgOverlayOpacity?: number; // 0-100
      headline?: string;
      subheadline?: string;
      ctaText?: string;
    };
    products?: {
      headline?: string;
      subheadline?: string;
      maxCategories?: number; // 1-3
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
      alignment?: 'left' | 'center' | 'right';
    };
  }>(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StoreSettings = typeof storeSettings.$inferSelect;
export type InsertStoreSettings = typeof storeSettings.$inferInsert;

// ============================================
// CATEGORIES TABLE - Product Categories
// ============================================
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }), // Lucide icon name
  imageUrl: varchar("imageUrl", { length: 500 }),
  
  // Ordering
  sortOrder: int("sortOrder").default(0).notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ============================================
// PRODUCTS TABLE - Store Products
// ============================================
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  categoryId: int("categoryId").notNull(),
  
  // Basic Info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }), // For discounts
  
  // Media
  imageUrl: varchar("imageUrl", { length: 500 }),
  
  // Inventory
  isAvailable: boolean("isAvailable").default(true).notNull(),
  servesQuantity: varchar("servesQuantity", { length: 50 }), // e.g., "Serve 2 pessoas"
  
  // Ordering
  sortOrder: int("sortOrder").default(0).notNull(),
  
  // Featured/Highlight
  isFeatured: boolean("isFeatured").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ============================================
// HOME ROWS TABLE - Vitrine Configuration
// ============================================
export const homeRows = mysqlTable("home_rows", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Row configuration (1, 2, or 3)
  rowNumber: int("rowNumber").notNull(),
  
  // Category to display in this row
  categoryId: int("categoryId").notNull(),
  
  // Custom title override (optional)
  customTitle: varchar("customTitle", { length: 255 }),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HomeRow = typeof homeRows.$inferSelect;
export type InsertHomeRow = typeof homeRows.$inferInsert;

// ============================================
// REVIEWS TABLE - Cached Google Reviews
// ============================================
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Review Data (from Google Places API or manual)
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorPhoto: varchar("authorPhoto", { length: 500 }),
  rating: int("rating").notNull(), // 1-5
  text: text("text"),
  relativeTime: varchar("relativeTime", { length: 100 }), // e.g., "1 mês atrás"
  
  // Source
  isFromGoogle: boolean("isFromGoogle").default(false).notNull(),
  googleReviewId: varchar("googleReviewId", { length: 255 }),
  
  // Media (photos attached to review)
  photos: json("photos").$type<string[]>(),
  
  // Status
  isVisible: boolean("isVisible").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
