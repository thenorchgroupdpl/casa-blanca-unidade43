import { eq, and, asc, desc, like, inArray, sql, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  InsertTenant, tenants, Tenant,
  InsertStoreSettings, storeSettings, StoreSettings,
  InsertCategory, categories, Category,
  InsertProduct, products, Product,
  InsertHomeRow, homeRows, HomeRow,
  InsertReview, reviews, Review,
  orders, Order, InsertOrder
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
