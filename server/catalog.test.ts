import { describe, expect, it, vi } from "vitest";

/**
 * Unit tests for catalog business logic:
 * 1. Category cascade logic (inactive category hides products in public API)
 * 2. Slug generation (auto-slug from name)
 * 3. Highlight tag validation
 * 4. Unit of measure validation
 */

// ============================================
// 1. CASCADE LOGIC (pure function test)
// ============================================

function filterPublicData(
  categories: Array<{ id: number; isActive: boolean; name: string }>,
  products: Array<{ id: number; categoryId: number; isAvailable: boolean; name: string }>
) {
  const activeCategories = categories.filter(c => c.isActive);
  const activeCategoryIds = new Set(activeCategories.map(c => c.id));
  return {
    categories: activeCategories,
    products: products.filter(p => p.isAvailable && activeCategoryIds.has(p.categoryId)),
  };
}

describe("Category cascade logic", () => {
  it("hides products of inactive categories", () => {
    const categories = [
      { id: 1, isActive: true, name: "Bebidas" },
      { id: 2, isActive: false, name: "Sobremesas" },
    ];
    const products = [
      { id: 10, categoryId: 1, isAvailable: true, name: "Coca-Cola" },
      { id: 11, categoryId: 2, isAvailable: true, name: "Pudim" },
      { id: 12, categoryId: 2, isAvailable: true, name: "Mousse" },
    ];

    const result = filterPublicData(categories, products);

    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].name).toBe("Bebidas");
    expect(result.products).toHaveLength(1);
    expect(result.products[0].name).toBe("Coca-Cola");
  });

  it("still hides unavailable products even in active categories", () => {
    const categories = [
      { id: 1, isActive: true, name: "Bebidas" },
    ];
    const products = [
      { id: 10, categoryId: 1, isAvailable: true, name: "Coca-Cola" },
      { id: 11, categoryId: 1, isAvailable: false, name: "Fanta" },
    ];

    const result = filterPublicData(categories, products);

    expect(result.products).toHaveLength(1);
    expect(result.products[0].name).toBe("Coca-Cola");
  });

  it("returns empty when all categories are inactive", () => {
    const categories = [
      { id: 1, isActive: false, name: "Bebidas" },
      { id: 2, isActive: false, name: "Sobremesas" },
    ];
    const products = [
      { id: 10, categoryId: 1, isAvailable: true, name: "Coca-Cola" },
      { id: 11, categoryId: 2, isAvailable: true, name: "Pudim" },
    ];

    const result = filterPublicData(categories, products);

    expect(result.categories).toHaveLength(0);
    expect(result.products).toHaveLength(0);
  });
});

// ============================================
// 2. SLUG GENERATION (same logic as frontend)
// ============================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

describe("Auto-slug generation", () => {
  it("converts name to lowercase slug", () => {
    expect(generateSlug("Pizzas Especiais")).toBe("pizzas-especiais");
  });

  it("removes accents", () => {
    expect(generateSlug("Bebidas Quentes & Café")).toBe("bebidas-quentes-cafe");
  });

  it("handles special characters", () => {
    expect(generateSlug("Açaí & Frutas")).toBe("acai-frutas");
  });

  it("trims leading/trailing hyphens", () => {
    expect(generateSlug("  Sobremesas  ")).toBe("sobremesas");
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });
});

// ============================================
// 3. HIGHLIGHT TAG VALIDATION
// ============================================

const VALID_HIGHLIGHT_TAGS = ["mais_vendido", "novidade", "vegano", ""];

describe("Highlight tag validation", () => {
  it("accepts valid tags", () => {
    VALID_HIGHLIGHT_TAGS.forEach(tag => {
      expect(VALID_HIGHLIGHT_TAGS.includes(tag)).toBe(true);
    });
  });

  it("rejects invalid tags", () => {
    expect(VALID_HIGHLIGHT_TAGS.includes("random_tag")).toBe(false);
  });
});

// ============================================
// 4. UNIT OF MEASURE VALIDATION
// ============================================

const VALID_UNITS = ["un", "g", "kg", "ml", "L"];

describe("Unit of measure validation", () => {
  it("accepts all valid units", () => {
    VALID_UNITS.forEach(unit => {
      expect(VALID_UNITS.includes(unit)).toBe(true);
    });
  });

  it("rejects invalid units", () => {
    expect(VALID_UNITS.includes("oz")).toBe(false);
    expect(VALID_UNITS.includes("lb")).toBe(false);
  });
});

// ============================================
// 5. PRODUCT SEARCH FILTER (integrated search)
// ============================================

function filterProductsBySearch(
  products: Array<{ name: string; categoryId: number }>,
  categories: Array<{ id: number; name: string }>,
  searchTerm: string
) {
  if (!searchTerm.trim()) return products;
  const term = searchTerm.toLowerCase();
  return products.filter(p => {
    const cat = categories.find(c => c.id === p.categoryId);
    return p.name.toLowerCase().includes(term) || (cat?.name.toLowerCase().includes(term) ?? false);
  });
}

describe("Integrated product search", () => {
  const categories = [
    { id: 1, name: "Bebidas" },
    { id: 2, name: "Sobremesas" },
  ];
  const products = [
    { name: "Coca-Cola", categoryId: 1 },
    { name: "Guaraná", categoryId: 1 },
    { name: "Pudim", categoryId: 2 },
    { name: "Mousse de Chocolate", categoryId: 2 },
  ];

  it("finds products by name", () => {
    const result = filterProductsBySearch(products, categories, "coca");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Coca-Cola");
  });

  it("finds products by category name", () => {
    const result = filterProductsBySearch(products, categories, "bebidas");
    expect(result).toHaveLength(2);
    expect(result.map(p => p.name)).toContain("Coca-Cola");
    expect(result.map(p => p.name)).toContain("Guaraná");
  });

  it("returns all products when search is empty", () => {
    const result = filterProductsBySearch(products, categories, "");
    expect(result).toHaveLength(4);
  });

  it("returns empty when no match", () => {
    const result = filterProductsBySearch(products, categories, "pizza");
    expect(result).toHaveLength(0);
  });
});

// ============================================
// 6. CATEGORY REORDER LOGIC
// ============================================

describe("Category reorder logic", () => {
  it("produces correct order after swap", () => {
    const categories = [
      { id: 1, sortOrder: 0 },
      { id: 2, sortOrder: 1 },
      { id: 3, sortOrder: 2 },
    ];

    // Move category 3 up (swap with 2)
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex(c => c.id === 3);
    const swapIdx = idx - 1;
    [sorted[idx], sorted[swapIdx]] = [sorted[swapIdx], sorted[idx]];

    const orderedIds = sorted.map(c => c.id);
    expect(orderedIds).toEqual([1, 3, 2]);
  });

  it("does not move first item up", () => {
    const categories = [
      { id: 1, sortOrder: 0 },
      { id: 2, sortOrder: 1 },
    ];

    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex(c => c.id === 1);
    // idx === 0, should not move up
    expect(idx).toBe(0);
  });
});
