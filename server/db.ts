import { eq, and, asc, desc, like, inArray, sql, isNotNull, isNull, gte, lte, sum, count, ne, between, avg } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  InsertTenant, tenants, Tenant,
  InsertStoreSettings, storeSettings, StoreSettings,
  InsertCategory, categories, Category,
  InsertProduct, products, Product,
  InsertHomeRow, homeRows, HomeRow,
  InsertReview, reviews, Review,
  orders, Order, InsertOrder,
  globalSettings, GlobalSetting, InsertGlobalSetting,
  notifications, Notification, InsertNotification,
  productUpsells, ProductUpsell, InsertProductUpsell,
  upsellMessages, UpsellMessage, InsertUpsellMessage,
  deliveryZones, DeliveryZone, InsertDeliveryZone,
  coupons, Coupon, InsertCoupon,
  galleryImages, GalleryImage, InsertGalleryImage
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// USER FUNCTIONS
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    
    // Handle role assignment
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      // Owner gets super_admin role
      values.role = 'super_admin';
      updateSet.role = 'super_admin';
    }

    // Handle tenant association
    if (user.tenantId !== undefined) {
      values.tenantId = user.tenantId;
      updateSet.tenantId = user.tenantId;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(userId: number, role: 'user' | 'admin' | 'super_admin' | 'client_admin', tenantId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ role, tenantId: tenantId ?? null })
    .where(eq(users.id, userId));
}

export async function updateUserTenant(userId: number, tenantId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ tenantId })
    .where(eq(users.id, userId));
}

export async function updateUserAvatar(userId: number, avatarUrl: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ avatarUrl })
    .where(eq(users.id, userId));
}

export async function updateUserName(userId: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ name })
    .where(eq(users.id, userId));
}

// ============================================
// TENANT FUNCTIONS (Super Admin only)
// ============================================

export async function getAllTenants(): Promise<Tenant[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(tenants).orderBy(desc(tenants.createdAt));
}

// Advanced filtered listing with join to store_settings for location
export async function getTenantsFiltered(filters: {
  search?: string;
  clientStatus?: string[];
  landingStatus?: string[];
  subscriptionPlan?: string[];
  niche?: string[];
  city?: string[];
  state?: string[];
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];

  if (filters.clientStatus && filters.clientStatus.length > 0) {
    conditions.push(inArray(tenants.clientStatus, filters.clientStatus as any));
  }
  if (filters.landingStatus && filters.landingStatus.length > 0) {
    conditions.push(inArray(tenants.landingStatus, filters.landingStatus as any));
  }
  if (filters.subscriptionPlan && filters.subscriptionPlan.length > 0) {
    conditions.push(inArray(tenants.subscriptionPlan, filters.subscriptionPlan as any));
  }
  if (filters.niche && filters.niche.length > 0) {
    conditions.push(inArray(tenants.niche, filters.niche));
  }
  if (filters.city && filters.city.length > 0) {
    conditions.push(inArray(tenants.city, filters.city));
  }
  if (filters.state && filters.state.length > 0) {
    conditions.push(inArray(tenants.state, filters.state));
  }
  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      sql`(${tenants.name} LIKE ${term} OR ${tenants.slug} LIKE ${term} OR ${tenants.cnpj} LIKE ${term})`
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return db.select().from(tenants)
    .where(where)
    .orderBy(desc(tenants.createdAt));
}

// Get distinct filter options for the UI
export async function getTenantFilterOptions() {
  const db = await getDb();
  if (!db) return { niches: [], cities: [], states: [] };

  const [nicheRows, cityRows, stateRows] = await Promise.all([
    db.selectDistinct({ value: tenants.niche }).from(tenants).where(isNotNull(tenants.niche)),
    db.selectDistinct({ value: tenants.city }).from(tenants).where(isNotNull(tenants.city)),
    db.selectDistinct({ value: tenants.state }).from(tenants).where(isNotNull(tenants.state)),
  ]);

  return {
    niches: nicheRows.map(r => r.value).filter(Boolean) as string[],
    cities: cityRows.map(r => r.value).filter(Boolean) as string[],
    states: stateRows.map(r => r.value).filter(Boolean) as string[],
  };
}

// Get dashboard stats
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, implementing: 0, disabled: 0, published: 0, draft: 0, byPlan: { starter: 0, professional: 0, enterprise: 0 } };

  const allTenants = await db.select().from(tenants);
  const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);

  return {
    total: allTenants.length,
    active: allTenants.filter(t => t.clientStatus === 'active').length,
    implementing: allTenants.filter(t => t.clientStatus === 'implementing').length,
    disabled: allTenants.filter(t => t.clientStatus === 'disabled').length,
    published: allTenants.filter(t => t.landingStatus === 'published').length,
    draft: allTenants.filter(t => t.landingStatus === 'draft').length,
    error: allTenants.filter(t => t.landingStatus === 'error').length,
    totalUsers: Number(totalUsers[0]?.count ?? 0),
    byPlan: {
      starter: allTenants.filter(t => t.subscriptionPlan === 'starter').length,
      professional: allTenants.filter(t => t.subscriptionPlan === 'professional').length,
      enterprise: allTenants.filter(t => t.subscriptionPlan === 'enterprise').length,
    },
  };
}

export async function getTenantById(id: number): Promise<Tenant | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTenant(data: InsertTenant): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tenants).values(data);
  return Number(result[0].insertId);
}

export async function updateTenant(id: number, data: Partial<InsertTenant>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(tenants).set(data).where(eq(tenants.id, id));
}

export async function deleteTenant(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete all related data first
  await db.delete(homeRows).where(eq(homeRows.tenantId, id));
  await db.delete(reviews).where(eq(reviews.tenantId, id));
  await db.delete(products).where(eq(products.tenantId, id));
  await db.delete(categories).where(eq(categories.tenantId, id));
  await db.delete(storeSettings).where(eq(storeSettings.tenantId, id));
  await db.delete(tenants).where(eq(tenants.id, id));
}

// ============================================
// STORE SETTINGS FUNCTIONS
// ============================================

export async function getStoreSettings(tenantId: number): Promise<StoreSettings | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(storeSettings).where(eq(storeSettings.tenantId, tenantId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertStoreSettings(tenantId: number, data: Partial<InsertStoreSettings>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getStoreSettings(tenantId);
  
  if (existing) {
    await db.update(storeSettings).set(data).where(eq(storeSettings.tenantId, tenantId));
  } else {
    await db.insert(storeSettings).values({ ...data, tenantId });
  }
}

// ============================================
// CATEGORY FUNCTIONS
// ============================================

export async function getCategoriesByTenant(tenantId: number): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(categories)
    .where(eq(categories.tenantId, tenantId))
    .orderBy(asc(categories.sortOrder));
}

export async function getCategoryById(id: number): Promise<Category | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(data: InsertCategory): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(categories).values(data);
  return Number(result[0].insertId);
}

export async function updateCategory(id: number, data: Partial<InsertCategory>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete products in this category first
  await db.delete(products).where(eq(products.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));
}

// ============================================
// PRODUCT FUNCTIONS
// ============================================

export async function getProductsByTenant(tenantId: number): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(products)
    .where(eq(products.tenantId, tenantId))
    .orderBy(asc(products.sortOrder));
}

export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(products)
    .where(eq(products.categoryId, categoryId))
    .orderBy(asc(products.sortOrder));
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(data: InsertProduct): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(products).values(data);
  return Number(result[0].insertId);
}

export async function updateProduct(id: number, data: Partial<InsertProduct>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(products).where(eq(products.id, id));
}

// ============================================
// HOME ROWS FUNCTIONS (Vitrine Configuration)
// ============================================

export async function getHomeRowsByTenant(tenantId: number): Promise<HomeRow[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(homeRows)
    .where(eq(homeRows.tenantId, tenantId))
    .orderBy(asc(homeRows.rowNumber));
}

export async function upsertHomeRow(tenantId: number, rowNumber: number, categoryId: number, customTitle?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(homeRows)
    .where(and(eq(homeRows.tenantId, tenantId), eq(homeRows.rowNumber, rowNumber)))
    .limit(1);

  if (existing.length > 0) {
    await db.update(homeRows)
      .set({ categoryId, customTitle })
      .where(and(eq(homeRows.tenantId, tenantId), eq(homeRows.rowNumber, rowNumber)));
  } else {
    await db.insert(homeRows).values({ tenantId, rowNumber, categoryId, customTitle });
  }
}

export async function deleteHomeRow(tenantId: number, rowNumber: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(homeRows)
    .where(and(eq(homeRows.tenantId, tenantId), eq(homeRows.rowNumber, rowNumber)));
}

// ============================================
// REVIEWS FUNCTIONS
// ============================================

export async function getReviewsByTenant(tenantId: number): Promise<Review[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(reviews)
    .where(and(eq(reviews.tenantId, tenantId), eq(reviews.isVisible, true)))
    .orderBy(desc(reviews.createdAt));
}

export async function createReview(data: InsertReview): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reviews).values(data);
  return Number(result[0].insertId);
}

export async function updateReview(id: number, data: Partial<InsertReview>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(reviews).set(data).where(eq(reviews.id, id));
}

export async function deleteReview(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(reviews).where(eq(reviews.id, id));
}

// ============================================
// FULL TENANT DATA (for Landing Page)
// ============================================

export async function getFullTenantData(tenantId: number) {
  const db = await getDb();
  if (!db) return null;

  const tenant = await getTenantById(tenantId);
  if (!tenant) return null;

  const settings = await getStoreSettings(tenantId);
  const categoriesList = await getCategoriesByTenant(tenantId);
  const productsList = await getProductsByTenant(tenantId);
  const homeRowsList = await getHomeRowsByTenant(tenantId);
  const reviewsList = await getReviewsByTenant(tenantId);

  return {
    tenant,
    settings,
    categories: categoriesList,
    products: productsList,
    homeRows: homeRowsList,
    reviews: reviewsList,
  };
}

export async function getFullTenantDataBySlug(slug: string) {
  const tenant = await getTenantBySlug(slug);
  if (!tenant) return null;

  return getFullTenantData(tenant.id);
}

export async function getTenantByDomain(domain: string): Promise<Tenant | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  // Normalize: strip www. prefix for comparison
  const normalized = domain.replace(/^www\./, '');
  const result = await db.select().from(tenants).where(
    sql`REPLACE(${tenants.domainCustom}, 'www.', '') = ${normalized}`
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getFullTenantDataByDomain(domain: string) {
  const tenant = await getTenantByDomain(domain);
  if (!tenant) return null;

  return getFullTenantData(tenant.id);
}


// ============================================
// EMAIL/PASSWORD AUTHENTICATION FUNCTIONS
// ============================================

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    tenantId: users.tenantId,
    loginMethod: users.loginMethod,
    isActive: users.isActive,
    avatarUrl: users.avatarUrl,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
    plainPassword: users.plainPassword,
  }).from(users).orderBy(desc(users.createdAt));
}

export async function toggleUserActive(userId: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ isActive })
    .where(eq(users.id, userId));
}

export async function deleteUser(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(users).where(eq(users.id, id));
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserWithPassword(data: {
  email: string;
  passwordHash: string;
  plainPassword: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin' | 'client_admin';
  tenantId?: number | null;
  isActive?: boolean;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Generate openId for email-based users (required for session management)
  const openId = `email:${data.email}`;

  const result = await db.insert(users).values({
    openId,
    email: data.email,
    passwordHash: data.passwordHash,
    plainPassword: data.plainPassword,
    name: data.name,
    role: data.role,
    tenantId: data.tenantId ?? null,
    isActive: data.isActive ?? true,
    loginMethod: 'email',
  });
  
  return Number(result[0].insertId);
}

export async function updateUserPassword(userId: number, passwordHash: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function updateUserOpenId(userId: number, openId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ openId }).where(eq(users.id, userId));
}

export async function updateUserPlainPassword(userId: number, plainPassword: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ plainPassword }).where(eq(users.id, userId));
}


// ============================================
// ORDERS HELPERS
// ============================================

export async function getOrdersByTenant(tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(orders).where(eq(orders.tenantId, tenantId)).orderBy(desc(orders.createdAt));
}

export async function createOrder(data: {
  tenantId: number;
  customerName: string;
  customerPhone?: string;
  summary: string;
  totalValue: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  return Number(result[0].insertId);
}

export async function getTodayRevenue(tenantId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = await db
    .select({ total: sum(orders.totalValue) })
    .from(orders)
    .where(
      and(
        eq(orders.tenantId, tenantId),
        ne(orders.status, 'cancelado'),
        gte(orders.createdAt, today)
      )
    );
  return parseFloat(result[0]?.total || '0');
}

export async function toggleOrderCompleted(orderId: number, isCompleted: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ isCompleted }).where(eq(orders.id, orderId));
}

// ============================================
// PRODUCT AVAILABILITY QUICK TOGGLE
// ============================================

export async function toggleProductAvailability(productId: number, isAvailable: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ isAvailable }).where(eq(products.id, productId));
}

// ============================================
// STORE MANUAL OVERRIDE
// ============================================

export async function setManualOverride(tenantId: number, override: 'open' | 'closed' | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(storeSettings).set({ manualOverride: override }).where(eq(storeSettings.tenantId, tenantId));
}


// ============================================
// CATEGORY REORDER
// ============================================

export async function reorderCategories(tenantId: number, orderedIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Update sortOrder for each category based on array position
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(categories)
      .set({ sortOrder: i })
      .where(and(eq(categories.id, orderedIds[i]), eq(categories.tenantId, tenantId)));
  }
}

// ============================================
// PRODUCTS GROUPED BY CATEGORY (for Dashboard)
// ============================================

export async function getProductsGroupedByCategory(tenantId: number) {
  const db = await getDb();
  if (!db) return { categories: [], products: [] };

  const cats = await db.select().from(categories)
    .where(eq(categories.tenantId, tenantId))
    .orderBy(asc(categories.sortOrder));

  const prods = await db.select().from(products)
    .where(eq(products.tenantId, tenantId))
    .orderBy(asc(products.sortOrder));

  return { categories: cats, products: prods };
}

// ============================================
// DUPLICATE PRODUCT
// ============================================

export async function duplicateProduct(productId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const original = await getProductById(productId);
  if (!original) throw new Error("Product not found");

  const result = await db.insert(products).values({
    tenantId: original.tenantId,
    categoryId: original.categoryId,
    name: `${original.name} (cópia)`,
    description: original.description,
    price: original.price,
    originalPrice: original.originalPrice,
    imageUrl: original.imageUrl,
    isAvailable: false, // Start as unavailable
    servesQuantity: original.servesQuantity,
    unitValue: original.unitValue,
    unit: original.unit,
    highlightTag: original.highlightTag,
    sortOrder: original.sortOrder + 1,
    isFeatured: false,
  });

  return Number(result[0].insertId);
}

// ============================================
// GLOBAL SETTINGS HELPERS
// ============================================

export async function getGlobalSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(globalSettings).where(eq(globalSettings.key, key)).limit(1);
  return rows[0]?.value ?? null;
}

export async function setGlobalSetting(key: string, value: string, description?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Upsert: insert or update on duplicate key
  const existing = await db.select().from(globalSettings).where(eq(globalSettings.key, key)).limit(1);
  if (existing.length > 0) {
    await db.update(globalSettings).set({ value, description }).where(eq(globalSettings.key, key));
  } else {
    await db.insert(globalSettings).values({ key, value, description });
  }
}

export async function getAllGlobalSettings(): Promise<GlobalSetting[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(globalSettings).orderBy(globalSettings.key);
}

export async function deleteGlobalSetting(key: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(globalSettings).where(eq(globalSettings.key, key));
}


// ============================================
// BILLING & SUBSCRIPTION HELPERS
// ============================================

/** Get all tenants with billing data for admin management */
export async function getAllTenantsWithBilling(): Promise<Tenant[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tenants).orderBy(tenants.name);
}

/** Update billing date for a specific tenant */
export async function updateTenantBillingDate(tenantId: number, nextBillingDate: Date): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tenants).set({ nextBillingDate }).where(eq(tenants.id, tenantId));
}

/** Update billing amount for a specific tenant */
export async function updateTenantBillingAmount(tenantId: number, billingAmount: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tenants).set({ billingAmount }).where(eq(tenants.id, tenantId));
}

/** Update subscription status for a specific tenant */
export async function updateTenantSubscriptionStatus(tenantId: number, status: "active" | "warning" | "overdue" | "suspended"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tenants).set({ subscriptionStatus: status }).where(eq(tenants.id, tenantId));
}

/** Get tenants approaching billing date (within N days) */
export async function getTenantsApproachingBilling(daysAhead: number): Promise<Tenant[]> {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + daysAhead);
  
  return await db.select().from(tenants)
    .where(
      and(
        isNotNull(tenants.nextBillingDate),
        gte(tenants.nextBillingDate, now),
        lte(tenants.nextBillingDate, futureDate),
        eq(tenants.isActive, true)
      )
    );
}

// ============================================
// NOTIFICATIONS HELPERS
// ============================================

/** Create a notification for a tenant */
export async function createNotification(data: InsertNotification): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(notifications).values(data);
}

/** Get notifications for a tenant (ordered by newest first) */
export async function getNotificationsByTenant(tenantId: number, limit = 50): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications)
    .where(eq(notifications.tenantId, tenantId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

/** Count unread notifications for a tenant */
export async function getUnreadNotificationCount(tenantId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(notifications)
    .where(
      and(
        eq(notifications.tenantId, tenantId),
        eq(notifications.isRead, false)
      )
    );
  return result[0]?.count ?? 0;
}

/** Mark a single notification as read */
export async function markNotificationAsRead(notificationId: number, tenantId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.tenantId, tenantId)
      )
    );
}

/** Mark all notifications as read for a tenant */
export async function markAllNotificationsAsRead(tenantId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true })
    .where(eq(notifications.tenantId, tenantId));
}

/** Check if a billing notification was already sent today for a tenant */
export async function hasBillingNotificationToday(tenantId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const result = await db.select({ count: count() }).from(notifications)
    .where(
      and(
        eq(notifications.tenantId, tenantId),
        eq(notifications.type, "billing"),
        gte(notifications.createdAt, todayStart)
      )
    );
  return (result[0]?.count ?? 0) > 0;
}

// ============================================
// PRODUCT UPSELLS (Order Bump)
// ============================================

export async function getProductUpsells(productId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const rows = await db.select({
    id: products.id,
    name: products.name,
    price: products.price,
    imageUrl: products.imageUrl,
    tenantId: products.tenantId,
    discountPrice: productUpsells.discountPrice,
    messageId: productUpsells.messageId,
  })
    .from(productUpsells)
    .innerJoin(products, eq(productUpsells.upsellProductId, products.id))
    .where(eq(productUpsells.productId, productId));
  
  return rows;
}

export async function getProductUpsellIds(productId: number): Promise<{ upsellProductId: number; discountPrice: string | null; messageId: number | null }[]> {
  const db = await getDb();
  if (!db) return [];
  
  const rows = await db.select({
    upsellProductId: productUpsells.upsellProductId,
    discountPrice: productUpsells.discountPrice,
    messageId: productUpsells.messageId,
  })
    .from(productUpsells)
    .where(eq(productUpsells.productId, productId));
  
  return rows;
}

export async function setProductUpsells(
  productId: number,
  upsellItems: Array<{ upsellProductId: number; discountPrice?: string | null; messageId?: number | null }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete existing upsells
  await db.delete(productUpsells).where(eq(productUpsells.productId, productId));
  
  // Insert new upsells (filter out self-reference)
  const validItems = upsellItems.filter(item => item.upsellProductId !== productId);
  if (validItems.length > 0) {
    await db.insert(productUpsells).values(
      validItems.map(item => ({
        productId,
        upsellProductId: item.upsellProductId,
        discountPrice: item.discountPrice || null,
        messageId: item.messageId || null,
      }))
    );
  }
}

// ============================================
// UPSELL MESSAGES (Custom Order Bump Messages)
// ============================================

export async function getUpsellMessages(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(upsellMessages).where(eq(upsellMessages.tenantId, tenantId)).orderBy(upsellMessages.createdAt);
}

export async function createUpsellMessage(data: { tenantId: number; title: string; subtitle: string; isDefault?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(upsellMessages).values({
    tenantId: data.tenantId,
    title: data.title,
    subtitle: data.subtitle,
    isDefault: data.isDefault ?? false,
  });
  return { id: result.insertId };
}

export async function updateUpsellMessage(id: number, data: { title?: string; subtitle?: string; isDefault?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(upsellMessages).set(data).where(eq(upsellMessages.id, id));
}

export async function deleteUpsellMessage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Clear messageId references first
  await db.update(productUpsells).set({ messageId: null }).where(eq(productUpsells.messageId, id));
  await db.delete(upsellMessages).where(eq(upsellMessages.id, id));
}

export async function getUpsellMessageById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(upsellMessages).where(eq(upsellMessages.id, id)).limit(1);
  return row ?? null;
}

// ============================================
// ORDERS - Kanban Status Management
// ============================================

export async function getOrdersByStatus(tenantId: number, status?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Filter only today's orders for the Kanban (daily reset)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  
  const conditions = [
    eq(orders.tenantId, tenantId),
    gte(orders.createdAt, todayStart),
    lte(orders.createdAt, todayEnd),
  ];
  if (status) {
    conditions.push(eq(orders.status, status as any));
  }
  
  return db.select().from(orders)
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(orders).set({ 
    status: status as any,
    isCompleted: status === 'concluido',
  }).where(eq(orders.id, orderId));
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(orders).where(eq(orders.id, orderId));
  return result[0] || null;
}

export async function createOrderFull(data: {
  tenantId: number;
  customerName: string;
  customerPhone?: string;
  summary: string;
  items?: Array<{ productId: number; name: string; quantity: number; price: number }>;
  totalValue: string;
  deliveryZoneId?: number;
  deliveryZoneName?: string;
  deliveryFee?: string;
  status?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(orders).values({
    tenantId: data.tenantId,
    customerName: data.customerName,
    customerPhone: data.customerPhone || null,
    summary: data.summary,
    items: data.items || null,
    totalValue: data.totalValue,
    deliveryZoneId: data.deliveryZoneId || null,
    deliveryZoneName: data.deliveryZoneName || null,
    deliveryFee: data.deliveryFee || null,
    status: (data.status as any) || 'novo',
  });
  
  return Number(result[0].insertId);
}

// ============================================
// DELIVERY ZONES - Logística
// ============================================

export async function getDeliveryZonesByTenant(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(deliveryZones)
    .where(eq(deliveryZones.tenantId, tenantId))
    .orderBy(asc(deliveryZones.zoneName));
}

export async function getDeliveryZoneById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(deliveryZones).where(eq(deliveryZones.id, id));
  return result[0] || null;
}

export async function createDeliveryZone(data: {
  tenantId: number;
  zoneName: string;
  feeAmount: string;
  isPickup: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(deliveryZones).values(data);
  return Number(result[0].insertId);
}

export async function updateDeliveryZone(id: number, data: {
  zoneName?: string;
  feeAmount?: string;
  isPickup?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(deliveryZones).set(data).where(eq(deliveryZones.id, id));
}

export async function deleteDeliveryZone(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(deliveryZones).where(eq(deliveryZones.id, id));
}

export async function countPickupZones(tenantId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: count() }).from(deliveryZones)
    .where(and(eq(deliveryZones.tenantId, tenantId), eq(deliveryZones.isPickup, true)));
  return result[0]?.count ?? 0;
}


// ============================================
// ONBOARDING BRIEFING
// ============================================

export async function getTenantByOnboardingToken(token: string): Promise<Tenant | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(tenants).where(eq(tenants.onboardingToken, token)).limit(1);
  return result[0] || null;
}

export async function submitOnboardingBriefing(token: string, data: any): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tenants)
    .set({
      onboardingData: data,
      onboardingStatus: 'submitted',
      onboardingSubmittedAt: new Date(),
    })
    .where(eq(tenants.onboardingToken, token));
}

export async function markOnboardingReviewed(tenantId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tenants)
    .set({ onboardingStatus: 'reviewed' })
    .where(eq(tenants.id, tenantId));
}

export async function generateOnboardingTokenForExistingTenant(tenantId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const token = crypto.randomUUID().replace(/-/g, '');
  await db.update(tenants)
    .set({ onboardingToken: token, onboardingStatus: 'pending' })
    .where(eq(tenants.id, tenantId));
  return token;
}


// ============================================
// ANALYTICS FUNCTIONS
// ============================================

/**
 * Get dashboard summary metrics for a tenant.
 * Uses SQL aggregations for efficiency — no large result sets.
 */
export async function getDashboardSummary(tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  
  // Start of today (UTC)
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // Start of yesterday
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  // Start of this month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Start of last month
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // Revenue today (all except cancelado)
  const [revTodayRow] = await db
    .select({ total: sum(orders.totalValue), cnt: count() })
    .from(orders)
    .where(and(
      eq(orders.tenantId, tenantId),
      ne(orders.status, 'cancelado'),
      gte(orders.createdAt, todayStart)
    ));

  // Revenue yesterday (all except cancelado)
  const [revYesterdayRow] = await db
    .select({ total: sum(orders.totalValue) })
    .from(orders)
    .where(and(
      eq(orders.tenantId, tenantId),
      ne(orders.status, 'cancelado'),
      gte(orders.createdAt, yesterdayStart),
      lte(orders.createdAt, todayStart)
    ));

  // Orders today (all except cancelado)
  const [ordersTodayRow] = await db
    .select({ cnt: count() })
    .from(orders)
    .where(and(
      eq(orders.tenantId, tenantId),
      ne(orders.status, 'cancelado'),
      gte(orders.createdAt, todayStart)
    ));

  // Orders in progress (novo, em_preparacao, saiu_entrega)
  const [ordersInProgressRow] = await db
    .select({ cnt: count() })
    .from(orders)
    .where(and(
      eq(orders.tenantId, tenantId),
      inArray(orders.status, ['novo', 'em_preparacao', 'saiu_entrega'])
    ));

  // Revenue this month (all except cancelado)
  const [revMonthRow] = await db
    .select({ total: sum(orders.totalValue), cnt: count() })
    .from(orders)
    .where(and(
      eq(orders.tenantId, tenantId),
      ne(orders.status, 'cancelado'),
      gte(orders.createdAt, monthStart)
    ));

  // Revenue last month (all except cancelado)
  const [revLastMonthRow] = await db
    .select({ total: sum(orders.totalValue), cnt: count() })
    .from(orders)
    .where(and(
      eq(orders.tenantId, tenantId),
      ne(orders.status, 'cancelado'),
      gte(orders.createdAt, lastMonthStart),
      lte(orders.createdAt, lastMonthEnd)
    ));

  // Orders this month (all except cancelado)
  const [ordersMonthRow] = await db
    .select({ cnt: count() })
    .from(orders)
    .where(and(
      eq(orders.tenantId, tenantId),
      ne(orders.status, 'cancelado'),
      gte(orders.createdAt, monthStart)
    ));

  // Orders last month (all except cancelado)
  const [ordersLastMonthRow] = await db
    .select({ cnt: count() })
    .from(orders)
    .where(and(
      eq(orders.tenantId, tenantId),
      ne(orders.status, 'cancelado'),
      gte(orders.createdAt, lastMonthStart),
      lte(orders.createdAt, lastMonthEnd)
    ));

  const revenueToday = parseFloat(revTodayRow?.total || '0');
  const revenueYesterday = parseFloat(revYesterdayRow?.total || '0');
  const revenueMonth = parseFloat(revMonthRow?.total || '0');
  const revenueLastMonth = parseFloat(revLastMonthRow?.total || '0');
  const ordersToday = Number(ordersTodayRow?.cnt || 0);
  const ordersInProgress = Number(ordersInProgressRow?.cnt || 0);
  const ordersMonth = Number(ordersMonthRow?.cnt || 0);
  const ordersLastMonth = Number(ordersLastMonthRow?.cnt || 0);
  const completedMonth = Number(revMonthRow?.cnt || 0);
  const completedLastMonth = Number(revLastMonthRow?.cnt || 0);

  const ticketMediaMonth = completedMonth > 0 ? revenueMonth / completedMonth : 0;
  const ticketMediaLastMonth = completedLastMonth > 0 ? revenueLastMonth / completedLastMonth : 0;

  // Daily average for this month
  const dayOfMonth = now.getDate();
  const dailyAverage = dayOfMonth > 0 ? ordersMonth / dayOfMonth : 0;

  return {
    revenueToday,
    revenueYesterday,
    ordersToday,
    ordersInProgress,
    ticketMediaMonth,
    ticketMediaLastMonth,
    revenueMonth,
    revenueLastMonth,
    ordersMonth,
    ordersLastMonth,
    dailyAverage,
  };
}

/**
 * Get revenue by day for the last N days.
 * Returns array of { date, revenue, orders } sorted by date ascending.
 */
export async function getRevenueByDay(tenantId: number, days: number, fromDate?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const startDate = fromDate ? new Date(fromDate) : new Date();
  if (!fromDate) {
    startDate.setDate(startDate.getDate() - days);
  }
  startDate.setHours(0, 0, 0, 0);

  const dateExpr = sql`DATE(\`createdAt\`)`;
  const rows = await db
    .select({
      date: sql<string>`DATE(\`createdAt\`)`.as('date'),
      revenue: sql<string>`COALESCE(SUM(CASE WHEN \`status\` != 'cancelado' THEN \`totalValue\` ELSE 0 END), 0)`.as('revenue'),
      orderCount: sql<number>`COUNT(CASE WHEN \`status\` != 'cancelado' THEN 1 END)`.as('order_count'),
    })
    .from(orders)
    .where(and(
      eq(orders.tenantId, tenantId),
      gte(orders.createdAt, startDate)
    ))
    .groupBy(sql`DATE(\`createdAt\`)`)
    .orderBy(sql`DATE(\`createdAt\`)`);

  // Fill in missing dates with zeros
  const result: Array<{ date: string; revenue: number; orders: number }> = [];
  const dataMap = new Map(rows.map(r => [r.date, { revenue: parseFloat(r.revenue || '0'), orders: Number(r.orderCount || 0) }]));

  // For large ranges (>90 days), only return dates that have data to avoid huge arrays
  if (days > 90) {
    for (const row of rows) {
      result.push({
        date: row.date,
        revenue: parseFloat(row.revenue || '0'),
        orders: Number(row.orderCount || 0),
      });
    }
  } else {
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = dataMap.get(dateStr);
      result.push({
        date: dateStr,
        revenue: entry?.revenue || 0,
        orders: entry?.orders || 0,
      });
    }
  }

  return result;
}

/**
 * Get average orders by weekday for the last 30 days.
 * Returns array of { weekday, average } (0=Sunday ... 6=Saturday).
 */
export async function getOrdersByWeekday(tenantId: number, days: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const effectiveDays = Math.max(7, days); // minimum 7 days for meaningful weekday averages
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - effectiveDays);
  startDate.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      weekday: sql<number>`DAYOFWEEK(\`createdAt\`)`.as('weekday'),
      total: sql<number>`COUNT(*)`.as('total'),
    })
    .from(orders)
    .where(and(
      eq(orders.tenantId, tenantId),
      ne(orders.status, 'cancelado'),
      gte(orders.createdAt, startDate)
    ))
    .groupBy(sql`DAYOFWEEK(\`createdAt\`)`);


  // MySQL DAYOFWEEK: 1=Sunday, 2=Monday, ..., 7=Saturday
  // Count how many of each weekday exist in the last 30 days
  const weekdayCounts: number[] = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  for (let i = 0; i < effectiveDays; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weekdayCounts[d.getDay()]++;
  }

  const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dataMap = new Map(rows.map(r => [Number(r.weekday), Number(r.total)]));

  return weekdayNames.map((name, index) => {
    // MySQL DAYOFWEEK is 1-indexed (1=Sunday)
    const mysqlDow = index + 1;
    const totalOrders = dataMap.get(mysqlDow) || 0;
    const occurrences = weekdayCounts[index] || 1;
    return {
      weekday: name,
      weekdayIndex: index,
      average: Math.round((totalOrders / occurrences) * 10) / 10,
      total: totalOrders,
    };
  });
}

/**
 * Get top N products by order count for a given period.
 * Parses the JSON items field to count product occurrences.
 */
export async function getTopProducts(tenantId: number, period: 'today' | '7d' | '30d' | 'month' | 'year' | 'all', limit: number = 5) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { ANALYTICS_EPOCH_DATE } = await import('@shared/const');
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case '7d':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case '30d':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
      startDate = new Date(ANALYTICS_EPOCH_DATE);
      break;
  }

  // Clamp to epoch
  if (startDate < ANALYTICS_EPOCH_DATE) {
    startDate = new Date(ANALYTICS_EPOCH_DATE);
  }

  // Get all completed orders in the period with their items
  const orderRows = await db
    .select({ items: orders.items })
    .from(orders)
    .where(and(
      eq(orders.tenantId, tenantId),
      ne(orders.status, 'cancelado'),
      gte(orders.createdAt, startDate)
    ));

  // Count product occurrences from JSON items
  const productCounts = new Map<number, { count: number; name: string }>();
  for (const row of orderRows) {
    const items = row.items as Array<{ productId: number; name: string; quantity: number; price: number }> | null;
    if (!items) continue;
    for (const item of items) {
      const existing = productCounts.get(item.productId);
      if (existing) {
        existing.count += item.quantity;
      } else {
        productCounts.set(item.productId, { count: item.quantity, name: item.name });
      }
    }
  }

  // Sort by count descending and take top N
  const sorted = Array.from(productCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit);

  if (sorted.length === 0) return [];

  // Fetch product details (image, category)
  const productIds = sorted.map(([id]) => id);
  const productDetails = await db
    .select({
      id: products.id,
      name: products.name,
      imageUrl: products.imageUrl,
      categoryId: products.categoryId,
    })
    .from(products)
    .where(inArray(products.id, productIds));

  // Fetch category names
  const categoryIds = Array.from(new Set(productDetails.map(p => p.categoryId)));
  const categoryDetails = categoryIds.length > 0
    ? await db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .where(inArray(categories.id, categoryIds))
    : [];

  const productMap = new Map(productDetails.map(p => [p.id, p]));
  const categoryMap = new Map(categoryDetails.map(c => [c.id, c.name]));

  return sorted.map(([productId, { count, name }]) => {
    const product = productMap.get(productId);
    return {
      productId,
      name: product?.name || name,
      imageUrl: product?.imageUrl || null,
      category: product ? (categoryMap.get(product.categoryId) || 'Sem categoria') : 'Sem categoria',
      count,
    };
  });
}

/**
 * Get top N products for a custom date range.
 */
export async function getTopProductsCustomRange(tenantId: number, fromDate: Date, toDate: Date, limit: number = 5) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { ANALYTICS_EPOCH_DATE } = await import('@shared/const');

  // Clamp start to epoch
  if (fromDate < ANALYTICS_EPOCH_DATE) {
    fromDate = new Date(ANALYTICS_EPOCH_DATE);
  }

  // Set end date to end of day
  const endOfDay = new Date(toDate);
  endOfDay.setHours(23, 59, 59, 999);

  const orderRows = await db
    .select({ items: orders.items })
    .from(orders)
    .where(and(
      eq(orders.tenantId, tenantId),
      ne(orders.status, 'cancelado'),
      gte(orders.createdAt, fromDate),
      lte(orders.createdAt, endOfDay)
    ));

  const productCounts = new Map<number, { count: number; name: string }>();
  for (const row of orderRows) {
    const items = row.items as Array<{ productId: number; name: string; quantity: number; price: number }> | null;
    if (!items) continue;
    for (const item of items) {
      const existing = productCounts.get(item.productId);
      if (existing) {
        existing.count += item.quantity;
      } else {
        productCounts.set(item.productId, { count: item.quantity, name: item.name });
      }
    }
  }

  const sorted = Array.from(productCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit);

  if (sorted.length === 0) return [];

  const productIds = sorted.map(([id]) => id);
  const productDetails = await db
    .select({
      id: products.id,
      name: products.name,
      imageUrl: products.imageUrl,
      categoryId: products.categoryId,
    })
    .from(products)
    .where(inArray(products.id, productIds));

  const categoryIds = Array.from(new Set(productDetails.map(p => p.categoryId)));
  const categoryDetails = categoryIds.length > 0
    ? await db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .where(inArray(categories.id, categoryIds))
    : [];

  const productMap = new Map(productDetails.map(p => [p.id, p]));
  const categoryMap = new Map(categoryDetails.map(c => [c.id, c.name]));

  return sorted.map(([productId, { count, name }]) => {
    const product = productMap.get(productId);
    return {
      productId,
      name: product?.name || name,
      imageUrl: product?.imageUrl || null,
      category: product ? (categoryMap.get(product.categoryId) || 'Sem categoria') : 'Sem categoria',
      count,
    };
  });
}

// ============================================
// ORDER NOTIFICATION BADGE - Viewed tracking
// ============================================

export async function getUnviewedOrdersCount(tenantId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`COUNT(*)`.as('count') })
    .from(orders)
    .where(and(
      eq(orders.tenantId, tenantId),
      eq(orders.status, 'novo'),
      isNull(orders.viewedAt)
    ));

  return Number(result[0]?.count ?? 0);
}

export async function markOrdersAsViewed(tenantId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(orders)
    .set({ viewedAt: new Date() })
    .where(and(
      eq(orders.tenantId, tenantId),
      eq(orders.status, 'novo'),
      isNull(orders.viewedAt)
    ));
}

// ============================================
// ORDERS - History & Deletion
// ============================================

export async function getOrdersHistory(tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(orders)
    .where(eq(orders.tenantId, tenantId))
    .orderBy(desc(orders.createdAt));
}

export async function deleteOrder(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(orders).where(eq(orders.id, orderId));
}

export async function deleteOrdersByDate(tenantId: number, dateStart: Date, dateEnd: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(orders).where(
    and(
      eq(orders.tenantId, tenantId),
      gte(orders.createdAt, dateStart),
      lte(orders.createdAt, dateEnd),
    )
  );
}

// ============================================
// COUPONS HELPERS
// ============================================

export async function createCoupon(data: {
  tenantId: number;
  code: string;
  discountPercentage: string;
  isActive?: boolean;
  expiresAt?: Date | null;
  usageLimit?: number | null;
}) {
  const db = (await getDb())!;
  const result = await db.insert(coupons).values({
    tenantId: data.tenantId,
    code: data.code.toUpperCase().trim(),
    discountPercentage: data.discountPercentage,
    isActive: data.isActive ?? true,
    expiresAt: data.expiresAt ?? null,
    usageLimit: data.usageLimit ?? null,
    usageCount: 0,
  });
  return { id: result[0].insertId };
}

export async function listCoupons(tenantId: number) {
  const db = (await getDb())!;
  return db
    .select()
    .from(coupons)
    .where(eq(coupons.tenantId, tenantId))
    .orderBy(desc(coupons.createdAt));
}

export async function getCouponById(id: number, tenantId: number) {
  const db = (await getDb())!;
  const rows = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.id, id), eq(coupons.tenantId, tenantId)));
  return rows[0] ?? null;
}

export async function updateCoupon(id: number, tenantId: number, data: {
  code?: string;
  discountPercentage?: string;
  isActive?: boolean;
  expiresAt?: Date | null;
  usageLimit?: number | null;
}) {
  const db = (await getDb())!;
  const updateData: Record<string, unknown> = {};
  if (data.code !== undefined) updateData.code = data.code.toUpperCase().trim();
  if (data.discountPercentage !== undefined) updateData.discountPercentage = data.discountPercentage;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;
  if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit;
  
  await db
    .update(coupons)
    .set(updateData)
    .where(and(eq(coupons.id, id), eq(coupons.tenantId, tenantId)));
}

export async function deleteCoupon(id: number, tenantId: number) {
  const db = (await getDb())!;
  await db
    .delete(coupons)
    .where(and(eq(coupons.id, id), eq(coupons.tenantId, tenantId)));
}

export async function validateCoupon(tenantId: number, code: string) {
  const db = (await getDb())!;
  // Search without isActive filter to provide specific error messages
  const allRows = await db
    .select()
    .from(coupons)
    .where(
      and(
        eq(coupons.tenantId, tenantId),
        eq(coupons.code, code.toUpperCase().trim())
      )
    );
  
  const coupon = allRows[0];
  if (!coupon) return { valid: false, reason: "Cupom inválido ou inativo." as const };
  
  // Check active status
  if (!coupon.isActive) {
    return { valid: false, reason: "Cupom inválido ou inativo." as const };
  }
  
  // Check expiration
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, reason: "Este cupom está expirado." as const };
  }
  
  // Check usage limit (A Regra de Ouro)
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, reason: "O limite de usos para este cupom já foi atingido." as const };
  }
  
  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountPercentage: Number(coupon.discountPercentage),
    },
  };
}

export async function incrementCouponUsage(id: number) {
  const db = (await getDb())!;
  await db
    .update(coupons)
    .set({ usageCount: sql`${coupons.usageCount} + 1` })
    .where(eq(coupons.id, id));
}

// ============================================
// GALLERY IMAGES
// ============================================

export async function getGalleryImages(tenantId: number) {
  const db = (await getDb())!;
  return db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.tenantId, tenantId))
    .orderBy(asc(galleryImages.order), asc(galleryImages.createdAt));
}

export async function addGalleryImage(tenantId: number, data: { imageUrl: string; caption?: string }) {
  const db = (await getDb())!;
  // Get current count
  const existing = await db.select({ cnt: count() }).from(galleryImages).where(eq(galleryImages.tenantId, tenantId));
  const currentCount = existing[0]?.cnt ?? 0;
  if (currentCount >= 30) {
    throw new Error("GALLERY_LIMIT_REACHED");
  }
  const result = await db.insert(galleryImages).values({
    tenantId,
    imageUrl: data.imageUrl,
    caption: data.caption || null,
    order: currentCount,
  });
  return { id: result[0].insertId };
}

export async function deleteGalleryImage(tenantId: number, imageId: number) {
  const db = (await getDb())!;
  await db
    .delete(galleryImages)
    .where(and(eq(galleryImages.id, imageId), eq(galleryImages.tenantId, tenantId)));
}

export async function reorderGalleryImages(tenantId: number, orderedIds: number[]) {
  const db = (await getDb())!;
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(galleryImages)
      .set({ order: i })
      .where(and(eq(galleryImages.id, orderedIds[i]), eq(galleryImages.tenantId, tenantId)));
  }
}

export async function updateGalleryImageCaption(tenantId: number, imageId: number, caption: string) {
  const db = (await getDb())!;
  await db
    .update(galleryImages)
    .set({ caption })
    .where(and(eq(galleryImages.id, imageId), eq(galleryImages.tenantId, tenantId)));
}

export async function getPublicGalleryImages(slug: string) {
  const db = (await getDb())!;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) return [];
  return db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.tenantId, tenant.id))
    .orderBy(asc(galleryImages.order), asc(galleryImages.createdAt));
}
