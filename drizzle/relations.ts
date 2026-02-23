import { relations } from "drizzle-orm";
import { users, tenants, storeSettings, categories, products, homeRows, reviews, orders } from "./schema";

// ============================================
// TENANT RELATIONS (1:N)
// ============================================
export const tenantsRelations = relations(tenants, ({ many, one }) => ({
  // A tenant can have MANY users (1:N - franquias, funcionários, etc.)
  users: many(users),
  // A tenant has ONE store settings record (1:1)
  storeSettings: one(storeSettings, {
    fields: [tenants.id],
    references: [storeSettings.tenantId],
  }),
  // A tenant can have MANY categories
  categories: many(categories),
  // A tenant can have MANY products
  products: many(products),
  // A tenant can have MANY home rows
  homeRows: many(homeRows),
  // A tenant can have MANY reviews
  reviews: many(reviews),
  // A tenant can have MANY orders
  orders: many(orders),
}));

// ============================================
// USER RELATIONS
// ============================================
export const usersRelations = relations(users, ({ one }) => ({
  // A user belongs to ONE tenant (N:1) - nullable for super_admin
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
}));

// ============================================
// STORE SETTINGS RELATIONS
// ============================================
export const storeSettingsRelations = relations(storeSettings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [storeSettings.tenantId],
    references: [tenants.id],
  }),
}));

// ============================================
// CATEGORY RELATIONS
// ============================================
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [categories.tenantId],
    references: [tenants.id],
  }),
  products: many(products),
}));

// ============================================
// PRODUCT RELATIONS
// ============================================
export const productsRelations = relations(products, ({ one }) => ({
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

// ============================================
// HOME ROW RELATIONS
// ============================================
export const homeRowsRelations = relations(homeRows, ({ one }) => ({
  tenant: one(tenants, {
    fields: [homeRows.tenantId],
    references: [tenants.id],
  }),
  category: one(categories, {
    fields: [homeRows.categoryId],
    references: [categories.id],
  }),
}));

// ============================================
// REVIEW RELATIONS
// ============================================
export const reviewsRelations = relations(reviews, ({ one }) => ({
  tenant: one(tenants, {
    fields: [reviews.tenantId],
    references: [tenants.id],
  }),
}));

// ============================================
// ORDER RELATIONS
// ============================================
export const ordersRelations = relations(orders, ({ one }) => ({
  tenant: one(tenants, {
    fields: [orders.tenantId],
    references: [tenants.id],
  }),
}));
