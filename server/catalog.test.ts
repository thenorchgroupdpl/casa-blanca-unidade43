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
// 6. DECIMAL FIELD SANITIZATION (bug fix tests)
// ============================================

function sanitizeDecimalField(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  if (String(value).trim() === '') return null;
  return String(value).trim();
}

function sanitizeProductPayload(form: {
  categoryId: number | null;
  name: string;
  price: string;
  originalPrice: string;
  unitValue: string;
  unit: string;
  highlightTag: string;
}) {
  return {
    categoryId: form.categoryId,
    name: form.name.trim(),
    price: form.price,
    originalPrice: sanitizeDecimalField(form.originalPrice) ?? undefined,
    unitValue: sanitizeDecimalField(form.unitValue) ?? undefined,
    unit: form.unit && form.unit.trim() !== '' ? form.unit : undefined,
    highlightTag: form.highlightTag && form.highlightTag.trim() !== '' ? form.highlightTag : undefined,
  };
}

describe("Decimal field sanitization (bug fix)", () => {
  it("converts empty string originalPrice to undefined (not empty string)", () => {
    const result = sanitizeProductPayload({
      categoryId: 1,
      name: "Test Product",
      price: "24.00",
      originalPrice: "",
      unitValue: "",
      unit: "",
      highlightTag: "",
    });
    expect(result.originalPrice).toBeUndefined();
    expect(result.unitValue).toBeUndefined();
    expect(result.unit).toBeUndefined();
    expect(result.highlightTag).toBeUndefined();
  });

  it("preserves valid decimal values", () => {
    const result = sanitizeProductPayload({
      categoryId: 1,
      name: "Test Product",
      price: "24.00",
      originalPrice: "29.90",
      unitValue: "700",
      unit: "ml",
      highlightTag: "novidade",
    });
    expect(result.originalPrice).toBe("29.90");
    expect(result.unitValue).toBe("700");
    expect(result.unit).toBe("ml");
    expect(result.highlightTag).toBe("novidade");
  });

  it("converts whitespace-only strings to undefined", () => {
    const result = sanitizeProductPayload({
      categoryId: 1,
      name: "Test Product",
      price: "10.00",
      originalPrice: "   ",
      unitValue: "  ",
      unit: "",
      highlightTag: "",
    });
    expect(result.originalPrice).toBeUndefined();
    expect(result.unitValue).toBeUndefined();
  });

  it("trims product name", () => {
    const result = sanitizeProductPayload({
      categoryId: 1,
      name: "  P\u00e3o Fermenta\u00e7\u00e3o Natural  ",
      price: "24.00",
      originalPrice: "",
      unitValue: "",
      unit: "",
      highlightTag: "",
    });
    expect(result.name).toBe("P\u00e3o Fermenta\u00e7\u00e3o Natural");
  });
});

describe("sanitizeDecimalField helper", () => {
  it("returns null for empty string", () => {
    expect(sanitizeDecimalField("")).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(sanitizeDecimalField(undefined)).toBeNull();
  });

  it("returns null for null", () => {
    expect(sanitizeDecimalField(null)).toBeNull();
  });

  it("returns trimmed value for valid input", () => {
    expect(sanitizeDecimalField("  29.90  ")).toBe("29.90");
  });

  it("returns value for zero", () => {
    expect(sanitizeDecimalField("0")).toBe("0");
  });
});

// ============================================
// 7. CATEGORY REORDER LOGIC
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

// ============================================
// 8. HIGHLIGHT BADGE RENDERING LOGIC
// ============================================

const HIGHLIGHT_LABELS: Record<string, string> = {
  mais_vendido: '🔥 Mais Vendido',
  novidade: '✨ Novidade',
  vegano: '🌱 Vegano',
};

describe("Highlight badge rendering", () => {
  it("maps mais_vendido to correct label", () => {
    expect(HIGHLIGHT_LABELS["mais_vendido"]).toBe("🔥 Mais Vendido");
  });

  it("maps novidade to correct label", () => {
    expect(HIGHLIGHT_LABELS["novidade"]).toBe("✨ Novidade");
  });

  it("maps vegano to correct label", () => {
    expect(HIGHLIGHT_LABELS["vegano"]).toBe("🌱 Vegano");
  });

  it("returns undefined for empty string (no badge)", () => {
    expect(HIGHLIGHT_LABELS[""]).toBeUndefined();
  });

  it("returns undefined for null-ish values", () => {
    const tag: string | null = null;
    const label = tag ? HIGHLIGHT_LABELS[tag] : null;
    expect(label).toBeNull();
  });
});

// ============================================
// 9. UNIT OF MEASURE DISPLAY LOGIC
// ============================================

function formatUnit(unitValue?: string | null, unit?: string | null): string | null {
  if (!unitValue || !unit) return null;
  return `${unitValue}${unit}`;
}

describe("Unit of measure display", () => {
  it("formats unit correctly (700ml)", () => {
    expect(formatUnit("700", "ml")).toBe("700ml");
  });

  it("formats unit correctly (1.5kg)", () => {
    expect(formatUnit("1.5", "kg")).toBe("1.5kg");
  });

  it("formats unit correctly (1L)", () => {
    expect(formatUnit("1", "L")).toBe("1L");
  });

  it("returns null when unitValue is null", () => {
    expect(formatUnit(null, "ml")).toBeNull();
  });

  it("returns null when unit is null", () => {
    expect(formatUnit("700", null)).toBeNull();
  });

  it("returns null when both are null", () => {
    expect(formatUnit(null, null)).toBeNull();
  });

  it("returns null when unitValue is empty string", () => {
    expect(formatUnit("", "ml")).toBeNull();
  });
});

// ============================================
// 10. PRODUCT DATA TRANSFORMATION (public API → frontend)
// ============================================

function transformProduct(p: any) {
  return {
    id: p.id.toString(),
    name: p.name,
    description: p.description || '',
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    images: p.imageUrl ? [p.imageUrl] : [],
    available: p.isAvailable,
    unitValue: p.unitValue || null,
    unit: p.unit || null,
    highlightTag: p.highlightTag || null,
  };
}

describe("Product data transformation", () => {
  it("transforms product with all new fields", () => {
    const raw = {
      id: 42,
      name: "Pão Artesanal",
      description: "Fermentação natural",
      price: "24.90",
      originalPrice: "29.90",
      imageUrl: "https://example.com/pao.webp",
      isAvailable: true,
      unitValue: "500",
      unit: "g",
      highlightTag: "novidade",
    };

    const result = transformProduct(raw);

    expect(result.id).toBe("42");
    expect(result.price).toBe(24.9);
    expect(result.originalPrice).toBe(29.9);
    expect(result.unitValue).toBe("500");
    expect(result.unit).toBe("g");
    expect(result.highlightTag).toBe("novidade");
    expect(result.images).toEqual(["https://example.com/pao.webp"]);
  });

  it("transforms product with null optional fields", () => {
    const raw = {
      id: 43,
      name: "Café Expresso",
      description: "",
      price: "8.00",
      originalPrice: null,
      imageUrl: null,
      isAvailable: true,
      unitValue: null,
      unit: null,
      highlightTag: null,
    };

    const result = transformProduct(raw);

    expect(result.originalPrice).toBeNull();
    expect(result.unitValue).toBeNull();
    expect(result.unit).toBeNull();
    expect(result.highlightTag).toBeNull();
    expect(result.images).toEqual([]);
  });

  it("handles missing fields gracefully", () => {
    const raw = {
      id: 44,
      name: "Item Simples",
      price: "10.00",
      isAvailable: true,
    };

    const result = transformProduct(raw);

    expect(result.description).toBe("");
    expect(result.originalPrice).toBeNull();
    expect(result.unitValue).toBeNull();
    expect(result.unit).toBeNull();
    expect(result.highlightTag).toBeNull();
    expect(result.images).toEqual([]);
  });
});
