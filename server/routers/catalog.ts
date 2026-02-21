import { z } from "zod";
import { router, clientAdminProcedure, protectedProcedure } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";
import sharp from "sharp";

// Helper to get tenant ID from user context
function getTenantIdFromUser(user: { tenantId: number | null; role: string }) {
  if (!user.tenantId && user.role !== 'super_admin') {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Usuário não está associado a nenhuma loja",
    });
  }
  return user.tenantId!;
}

// ============================================
// CATEGORIES ROUTER
// ============================================

export const categoriesRouter = router({
  // List categories for current tenant
  list: clientAdminProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantIdFromUser(ctx.user);
    return db.getCategoriesByTenant(tenantId);
  }),

  // List categories for specific tenant (Super Admin)
  listByTenant: clientAdminProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Only super_admin can view other tenants
      if (ctx.user.role !== 'super_admin' && ctx.user.tenantId !== input.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return db.getCategoriesByTenant(input.tenantId);
    }),

  // Get single category
  getById: clientAdminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const category = await db.getCategoryById(input.id);
      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Categoria não encontrada" });
      }
      // Verify ownership
      if (ctx.user.role !== 'super_admin' && ctx.user.tenantId !== category.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return category;
    }),

  // Create category
  create: clientAdminProcedure
    .input(z.object({
      name: z.string().min(1, "Nome é obrigatório"),
      slug: z.string().min(1, "Slug é obrigatório"),
      description: z.string().optional(),
      icon: z.string().optional(),
      imageUrl: z.string().optional(),
      sortOrder: z.number().optional(),
      tenantId: z.number().optional(), // For super_admin creating for specific tenant
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = input.tenantId && ctx.user.role === 'super_admin' 
        ? input.tenantId 
        : getTenantIdFromUser(ctx.user);

      const id = await db.createCategory({
        tenantId,
        name: input.name,
        slug: input.slug,
        description: input.description,
        icon: input.icon,
        imageUrl: input.imageUrl,
        sortOrder: input.sortOrder ?? 0,
      });

      return { id };
    }),

  // Update category
  update: clientAdminProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        imageUrl: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const category = await db.getCategoryById(input.id);
      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Categoria não encontrada" });
      }
      // Verify ownership
      if (ctx.user.role !== 'super_admin' && ctx.user.tenantId !== category.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.updateCategory(input.id, input.data);
      return { success: true };
    }),

  // Reorder categories
  reorder: clientAdminProcedure
    .input(z.object({
      orderedIds: z.array(z.number()),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);
      await db.reorderCategories(tenantId, input.orderedIds);
      return { success: true };
    }),

  // Delete category
  delete: clientAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const category = await db.getCategoryById(input.id);
      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Categoria não encontrada" });
      }
      // Verify ownership
      if (ctx.user.role !== 'super_admin' && ctx.user.tenantId !== category.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.deleteCategory(input.id);
      return { success: true };
    }),
});

// ============================================
// PRODUCTS ROUTER
// ============================================

export const productsRouter = router({
  // List products for current tenant
  list: clientAdminProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantIdFromUser(ctx.user);
    return db.getProductsByTenant(tenantId);
  }),

  // List products for specific tenant (Super Admin)
  listByTenant: clientAdminProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'super_admin' && ctx.user.tenantId !== input.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return db.getProductsByTenant(input.tenantId);
    }),

  // List products by category
  listByCategory: clientAdminProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(async ({ ctx, input }) => {
      const category = await db.getCategoryById(input.categoryId);
      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Categoria não encontrada" });
      }
      if (ctx.user.role !== 'super_admin' && ctx.user.tenantId !== category.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return db.getProductsByCategory(input.categoryId);
    }),

  // Get single product
  getById: clientAdminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const product = await db.getProductById(input.id);
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Produto não encontrado" });
      }
      if (ctx.user.role !== 'super_admin' && ctx.user.tenantId !== product.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return product;
    }),

  // Create product
  create: clientAdminProcedure
    .input(z.object({
      categoryId: z.number(),
      name: z.string().min(1, "Nome é obrigatório"),
      description: z.string().optional(),
      price: z.string(), // Decimal as string
      originalPrice: z.string().optional(),
      imageUrl: z.string().optional(),
      isAvailable: z.boolean().optional(),
      servesQuantity: z.string().optional(),
      sortOrder: z.number().optional(),
      isFeatured: z.boolean().optional(),
      unitValue: z.string().optional(),
      unit: z.string().optional(),
      highlightTag: z.string().optional(),
      tenantId: z.number().optional(), // For super_admin
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify category ownership
      const category = await db.getCategoryById(input.categoryId);
      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Categoria não encontrada" });
      }

      const tenantId = input.tenantId && ctx.user.role === 'super_admin'
        ? input.tenantId
        : getTenantIdFromUser(ctx.user);

      if (category.tenantId !== tenantId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Categoria não pertence a esta loja" });
      }

      const id = await db.createProduct({
        tenantId,
        categoryId: input.categoryId,
        name: input.name,
        description: input.description || null,
        price: input.price,
        originalPrice: input.originalPrice && input.originalPrice.trim() !== '' ? input.originalPrice : null,
        imageUrl: input.imageUrl || null,
        isAvailable: input.isAvailable ?? true,
        servesQuantity: input.servesQuantity || null,
        sortOrder: input.sortOrder ?? 0,
        isFeatured: input.isFeatured ?? false,
        unitValue: input.unitValue && input.unitValue.trim() !== '' ? input.unitValue : null,
        unit: input.unit && input.unit.trim() !== '' ? input.unit : null,
        highlightTag: input.highlightTag && input.highlightTag.trim() !== '' ? input.highlightTag : null,
      });

      return { id };
    }),

  // Update product
  update: clientAdminProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        categoryId: z.number().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        originalPrice: z.string().nullable().optional(),
        imageUrl: z.string().optional(),
        isAvailable: z.boolean().optional(),
        servesQuantity: z.string().optional(),
        sortOrder: z.number().optional(),
        isFeatured: z.boolean().optional(),
        unitValue: z.string().nullable().optional(),
        unit: z.string().nullable().optional(),
        highlightTag: z.string().nullable().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const product = await db.getProductById(input.id);
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Produto não encontrado" });
      }
      if (ctx.user.role !== 'super_admin' && ctx.user.tenantId !== product.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // If changing category, verify new category ownership
      if (input.data.categoryId) {
        const newCategory = await db.getCategoryById(input.data.categoryId);
        if (!newCategory || newCategory.tenantId !== product.tenantId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Categoria inválida" });
        }
      }

      // Sanitize decimal fields: convert empty strings to null
      const sanitized = { ...input.data };
      if (sanitized.originalPrice !== undefined) {
        sanitized.originalPrice = sanitized.originalPrice && String(sanitized.originalPrice).trim() !== '' ? sanitized.originalPrice : null;
      }
      if (sanitized.unitValue !== undefined) {
        sanitized.unitValue = sanitized.unitValue && String(sanitized.unitValue).trim() !== '' ? sanitized.unitValue : null;
      }
      if (sanitized.unit !== undefined) {
        sanitized.unit = sanitized.unit && String(sanitized.unit).trim() !== '' ? sanitized.unit : null;
      }
      if (sanitized.highlightTag !== undefined) {
        sanitized.highlightTag = sanitized.highlightTag && String(sanitized.highlightTag).trim() !== '' ? sanitized.highlightTag : null;
      }

      await db.updateProduct(input.id, sanitized);
      return { success: true };
    }),

  // Duplicate product
  duplicate: clientAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const product = await db.getProductById(input.id);
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Produto não encontrado" });
      }
      if (ctx.user.role !== 'super_admin' && ctx.user.tenantId !== product.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const newId = await db.duplicateProduct(input.id);
      return { id: newId };
    }),

  // Upload product image (base64 -> webp -> S3)
  uploadImage: clientAdminProcedure
    .input(z.object({
      imageData: z.string(), // base64
      fileName: z.string(),
      contentType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantIdFromUser(ctx.user);

      // Decode base64
      const buffer = Buffer.from(input.imageData, 'base64');

      // Process with sharp: resize to 800x800 square crop, convert to webp
      let processedBuffer: Buffer;
      try {
        processedBuffer = await sharp(buffer)
          .resize(800, 800, {
            fit: 'cover',
            position: 'centre',
          })
          .webp({ quality: 85 })
          .toBuffer();
      } catch (err) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Erro ao processar imagem. Verifique o formato." });
      }

      // Upload to S3
      const fileKey = `products/${tenantId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
      const { url } = await storagePut(fileKey, processedBuffer, 'image/webp');

      return { url };
    }),

  // Get products grouped by category (for Dashboard widget)
  grouped: clientAdminProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantIdFromUser(ctx.user);
    return db.getProductsGroupedByCategory(tenantId);
  }),

  // Delete product
  delete: clientAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const product = await db.getProductById(input.id);
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Produto não encontrado" });
      }
      if (ctx.user.role !== 'super_admin' && ctx.user.tenantId !== product.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.deleteProduct(input.id);
      return { success: true };
    }),
});
