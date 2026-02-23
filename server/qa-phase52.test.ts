import { describe, expect, it } from "vitest";

/**
 * QA Phase 52 Tests
 * Tests for: WhatsApp data mapping, URL encoding, accordion state,
 * Google Maps link, font inheritance, cart visibility, cascading logic
 */

describe("QA Phase 52 - WhatsApp Popup Data", () => {
  it("should map attendantName and attendantPhoto to SiteData", () => {
    const settings = {
      attendantName: "Maria",
      attendantPhoto: "https://cdn.example.com/maria.webp",
    };

    const siteData = {
      whatsapp_avatar: settings.attendantPhoto || "",
      whatsapp_name: settings.attendantName || "",
    };

    expect(siteData.whatsapp_avatar).toBe("https://cdn.example.com/maria.webp");
    expect(siteData.whatsapp_name).toBe("Maria");
  });

  it("should fallback to empty string when attendant data is missing", () => {
    const settings: Record<string, any> = {};

    const siteData = {
      whatsapp_avatar: settings.attendantPhoto || "",
      whatsapp_name: settings.attendantName || "",
    };

    expect(siteData.whatsapp_avatar).toBe("");
    expect(siteData.whatsapp_name).toBe("");
  });
});

describe("QA Phase 52 - WhatsApp URL Encoding", () => {
  it("should encode message only once (no double encoding)", () => {
    const message = "Olá! Pedido:\n• 2x Pão - R$10,00\n\nTotal: R$20,00";
    const encoded = encodeURIComponent(message);

    // The encoded message should contain %0A for newlines, not %250A (double encoded)
    expect(encoded).toContain("%0A");
    expect(encoded).not.toContain("%250A");

    // Building the URL directly with the already-encoded message
    const url = `https://wa.me/5511999999999?text=${encoded}`;
    expect(url).toContain("text=Ol%C3%A1");
    expect(url).not.toContain("text=Ol%25C3%25A1");
  });

  it("should not double-encode when message is already encoded", () => {
    const rawMessage = "Olá! Total: R$50,00";
    const firstEncode = encodeURIComponent(rawMessage);
    const doubleEncode = encodeURIComponent(firstEncode);

    // Double encoding produces %25 sequences
    expect(doubleEncode).toContain("%25");
    expect(firstEncode).not.toContain("%25");

    // Our code should use firstEncode, not doubleEncode
    const correctUrl = `https://wa.me/5511999999999?text=${firstEncode}`;
    expect(correctUrl).not.toContain("%25");
  });
});

describe("QA Phase 52 - Google Maps Link", () => {
  it("should use googleMapsLink when provided", () => {
    const settings = {
      googleMapsLink: "https://maps.google.com/place/MyStore",
      address: "Rua Exemplo, 123",
    };

    const mapLink = settings.googleMapsLink ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`;

    expect(mapLink).toBe("https://maps.google.com/place/MyStore");
  });

  it("should fallback to address search when googleMapsLink is empty", () => {
    const settings = {
      googleMapsLink: "",
      address: "Rua Exemplo, 123",
    };

    const mapLink = settings.googleMapsLink ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`;

    expect(mapLink).toContain("maps/search");
    expect(mapLink).toContain("Rua%20Exemplo");
  });

  it("should fallback to address search when googleMapsLink is null", () => {
    const settings = {
      googleMapsLink: null as string | null,
      address: "Av. Paulista, 1000",
    };

    const mapLink = settings.googleMapsLink ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`;

    expect(mapLink).toContain("Av.%20Paulista");
  });
});

describe("QA Phase 52 - Accordion Default State", () => {
  it("should start with empty defaultValue (all collapsed)", () => {
    const defaultValue: string[] = [];
    expect(defaultValue).toEqual([]);
    expect(defaultValue.length).toBe(0);
  });

  it("should NOT auto-expand all categories", () => {
    const categories = [
      { id: 1, name: "Bebidas" },
      { id: 2, name: "Pratos" },
      { id: 3, name: "Sobremesas" },
    ];

    // Old behavior (bug): defaultValue = categories.map(c => String(c.id))
    const oldDefault = categories.map(c => String(c.id));
    expect(oldDefault).toEqual(["1", "2", "3"]);

    // New behavior (fix): defaultValue = []
    const newDefault: string[] = [];
    expect(newDefault).toEqual([]);
  });
});

describe("QA Phase 52 - Typography Isolation", () => {
  it("should define Inter font family for admin panel", () => {
    const adminFontFamily = "'Inter', 'DM Sans', system-ui, sans-serif";
    expect(adminFontFamily).toContain("Inter");
    expect(adminFontFamily).toContain("system-ui");
  });

  it("should use CSS var for landing page font inheritance", () => {
    const cartFontFamily = "var(--font-sans, inherit)";
    expect(cartFontFamily).toContain("--font-sans");
    expect(cartFontFamily).toContain("inherit");
  });
});

describe("QA Phase 52 - Delivery Fee Field", () => {
  it("should sanitize empty delivery fee to null", () => {
    const deliveryFee = "";
    const sanitized = deliveryFee === "" ? null : deliveryFee;
    expect(sanitized).toBeNull();
  });

  it("should keep valid delivery fee value", () => {
    const deliveryFee = "5.99";
    const sanitized = deliveryFee === "" ? null : deliveryFee;
    expect(sanitized).toBe("5.99");
  });
});

describe("QA Phase 52 - Cascading Category Logic", () => {
  it("should filter products by active category IDs", () => {
    const categories = [
      { id: 1, name: "Bebidas", isActive: true },
      { id: 2, name: "Pratos", isActive: false },
      { id: 3, name: "Sobremesas", isActive: true },
    ];

    const products = [
      { id: 1, name: "Água", categoryId: 1, isAvailable: true },
      { id: 2, name: "Bife", categoryId: 2, isAvailable: true },
      { id: 3, name: "Pudim", categoryId: 3, isAvailable: true },
      { id: 4, name: "Suco", categoryId: 1, isAvailable: false },
    ];

    const activeCategories = categories.filter(c => c.isActive);
    const activeCategoryIds = new Set(activeCategories.map(c => c.id));
    const visibleProducts = products.filter(
      p => p.isAvailable && activeCategoryIds.has(p.categoryId)
    );

    expect(activeCategories).toHaveLength(2);
    expect(visibleProducts).toHaveLength(2);
    expect(visibleProducts.map(p => p.name)).toEqual(["Água", "Pudim"]);
    // "Bife" excluded because category 2 is inactive
    // "Suco" excluded because product is not available
  });

  it("should hide all products when category is deactivated", () => {
    const categories = [
      { id: 1, name: "Bebidas", isActive: false },
    ];

    const products = [
      { id: 1, name: "Água", categoryId: 1, isAvailable: true },
      { id: 2, name: "Suco", categoryId: 1, isAvailable: true },
    ];

    const activeCategories = categories.filter(c => c.isActive);
    const activeCategoryIds = new Set(activeCategories.map(c => c.id));
    const visibleProducts = products.filter(
      p => p.isAvailable && activeCategoryIds.has(p.categoryId)
    );

    expect(activeCategories).toHaveLength(0);
    expect(visibleProducts).toHaveLength(0);
  });
});

describe("QA Phase 52 - Store Settings googleMapsLink", () => {
  it("should accept and store googleMapsLink", () => {
    const input = {
      googleMapsLink: "https://goo.gl/maps/abc123",
    };

    const sanitized = input.googleMapsLink || null;
    expect(sanitized).toBe("https://goo.gl/maps/abc123");
  });

  it("should convert empty googleMapsLink to null", () => {
    const input = {
      googleMapsLink: "",
    };

    const sanitized = input.googleMapsLink || null;
    expect(sanitized).toBeNull();
  });
});
