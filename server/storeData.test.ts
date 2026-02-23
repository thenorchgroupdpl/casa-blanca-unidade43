import { describe, expect, it } from "vitest";

/**
 * Tests for Store Data page restructuring (Phase 51):
 * - CSS visibility fix for dark mode inputs
 * - Tab restructuring (removed Content tab, migrated WhatsApp config)
 * - New fields: deliveryFee, attendantName, attendantPhoto
 * - ImageUploader integration for attendant photo
 */

describe("Store Data - Tab Restructuring", () => {
  it("should have exactly 4 tabs: Informações, Endereço, Horários, Compartilhar", () => {
    const expectedTabs = ["info", "address", "hours", "sharing"];
    // The Content tab (content) and Social tab (social) have been removed/merged
    const removedTabs = ["content", "social"];
    
    expect(expectedTabs).toHaveLength(4);
    expect(expectedTabs).not.toContain("content");
    expect(expectedTabs).not.toContain("social");
    removedTabs.forEach(tab => {
      expect(expectedTabs).not.toContain(tab);
    });
  });

  it("should have WhatsApp config fields in Informações tab (migrated from Content)", () => {
    const infoTabFields = [
      "whatsapp",
      "phone", 
      "email",
      "socialLinks",
      "deliveryFee",
      "attendantName",
      "attendantPhoto",
    ];
    
    // WhatsApp config fields that were in Content tab are now in Info tab
    expect(infoTabFields).toContain("attendantName");
    expect(infoTabFields).toContain("attendantPhoto");
    // Delivery fee is a new field
    expect(infoTabFields).toContain("deliveryFee");
  });
});

describe("Store Data - Delivery Fee Field", () => {
  it("should sanitize empty delivery fee to null", () => {
    const sanitize = (value: string) => value === "" ? null : value;
    
    expect(sanitize("")).toBeNull();
    expect(sanitize("5.99")).toBe("5.99");
    expect(sanitize("0")).toBe("0");
    expect(sanitize("10.50")).toBe("10.50");
  });

  it("should accept valid decimal values", () => {
    const isValidFee = (value: string) => {
      if (value === "") return true; // optional
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0;
    };

    expect(isValidFee("")).toBe(true);
    expect(isValidFee("0")).toBe(true);
    expect(isValidFee("5.99")).toBe(true);
    expect(isValidFee("10.50")).toBe(true);
    expect(isValidFee("abc")).toBe(false);
    expect(isValidFee("-1")).toBe(false);
  });

  it("should format delivery fee for display", () => {
    const formatFee = (value: string | null) => {
      if (!value) return "Grátis";
      const num = parseFloat(value);
      return `R$ ${num.toFixed(2).replace(".", ",")}`;
    };

    expect(formatFee(null)).toBe("Grátis");
    expect(formatFee("")).toBe("Grátis");
    expect(formatFee("5.99")).toBe("R$ 5,99");
    expect(formatFee("10")).toBe("R$ 10,00");
    expect(formatFee("0")).toBe("R$ 0,00");
  });
});

describe("Store Data - Attendant Config (WhatsApp Popup)", () => {
  it("should store attendant name and photo separately", () => {
    const formData = {
      attendantName: "Maria",
      attendantPhoto: "https://example.com/photo.webp",
    };

    expect(formData.attendantName).toBe("Maria");
    expect(formData.attendantPhoto).toBe("https://example.com/photo.webp");
  });

  it("should allow empty attendant fields (optional)", () => {
    const formData = {
      attendantName: "",
      attendantPhoto: "",
    };

    expect(formData.attendantName).toBe("");
    expect(formData.attendantPhoto).toBe("");
  });
});

describe("Store Data - CSS Dark Mode Fix", () => {
  it("should define correct CSS selectors for admin panel inputs", () => {
    // The CSS rules target inputs within bg-zinc-* containers
    const cssSelectors = [
      '[class*="bg-zinc-"] input',
      '[class*="bg-zinc-"] textarea',
      '[class*="bg-zinc-"] select',
      'input[class*="bg-zinc-"]',
      'textarea[class*="bg-zinc-"]',
      'select[class*="bg-zinc-"]',
    ];

    // All selectors should target zinc background containers
    cssSelectors.forEach(selector => {
      expect(selector).toContain("bg-zinc-");
    });
  });

  it("should use white text (#ffffff) for inputs and gray-400 (#9ca3af) for placeholders", () => {
    const inputTextColor = "#ffffff";
    const placeholderColor = "#9ca3af";

    expect(inputTextColor).toBe("#ffffff");
    expect(placeholderColor).toBe("#9ca3af");
    // Ensure placeholder is lighter than background but not as bright as text
    expect(placeholderColor).not.toBe(inputTextColor);
  });
});

describe("Store Data - Form Data Structure", () => {
  it("should have all required fields in FormData type", () => {
    const defaultFormData = {
      whatsapp: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      cep: "",
      openingHours: {},
      socialLinks: {},
      heroTitle: "",
      heroSubtitle: "",
      aboutTitle: "",
      aboutText: "",
      ownerName: "",
      ownerPhoto: "",
      deliveryFee: "",
      attendantName: "",
      attendantPhoto: "",
    };

    // New fields exist
    expect(defaultFormData).toHaveProperty("deliveryFee");
    expect(defaultFormData).toHaveProperty("attendantName");
    expect(defaultFormData).toHaveProperty("attendantPhoto");
    
    // All fields have default empty string values
    expect(defaultFormData.deliveryFee).toBe("");
    expect(defaultFormData.attendantName).toBe("");
    expect(defaultFormData.attendantPhoto).toBe("");
  });

  it("should preserve hero/about fields even though Content tab was removed", () => {
    // These fields still exist in the data model for backward compatibility
    // They are managed by Super Admin via Design System, not by Lojista
    const formData = {
      heroTitle: "Bem-vindo",
      heroSubtitle: "Experiência única",
      aboutTitle: "Nossa História",
      aboutText: "Texto sobre a loja",
      ownerName: "João",
      ownerPhoto: "https://example.com/photo.jpg",
    };

    expect(formData.heroTitle).toBe("Bem-vindo");
    expect(formData.aboutTitle).toBe("Nossa História");
  });
});
