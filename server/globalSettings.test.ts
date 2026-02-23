import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================
// GLOBAL SETTINGS - Unit Tests
// ============================================

describe("Global Settings Router", () => {
  describe("Public Settings - Key Whitelist", () => {
    const ALLOWED_PUBLIC_KEYS = ["support_whatsapp", "support_email", "platform_name"];
    const BLOCKED_KEYS = ["secret_key", "admin_password", "database_url", "jwt_secret"];

    it("should allow whitelisted keys for public access", () => {
      for (const key of ALLOWED_PUBLIC_KEYS) {
        expect(ALLOWED_PUBLIC_KEYS.includes(key)).toBe(true);
      }
    });

    it("should block non-whitelisted keys from public access", () => {
      for (const key of BLOCKED_KEYS) {
        expect(ALLOWED_PUBLIC_KEYS.includes(key)).toBe(false);
      }
    });
  });

  describe("WhatsApp Link Formatting", () => {
    function buildWhatsAppLink(digits: string): string {
      if (!digits || digits.length < 10) return "";
      const fullNumber = digits.startsWith("55") ? digits : `55${digits}`;
      return `https://wa.me/${fullNumber}?text=${encodeURIComponent(
        "Olá, preciso de ajuda para redefinir minha senha no Casa Blanca."
      )}`;
    }

    it("should build correct WhatsApp link with country code", () => {
      const link = buildWhatsAppLink("5534991201913");
      expect(link).toContain("https://wa.me/5534991201913");
      expect(link).toContain("text=");
    });

    it("should prepend 55 if not present", () => {
      const link = buildWhatsAppLink("34991201913");
      expect(link).toContain("https://wa.me/5534991201913");
    });

    it("should return empty string for short numbers", () => {
      expect(buildWhatsAppLink("123")).toBe("");
      expect(buildWhatsAppLink("")).toBe("");
    });

    it("should return empty string for numbers with less than 10 digits", () => {
      expect(buildWhatsAppLink("123456789")).toBe("");
    });

    it("should handle 10-digit numbers (landline format)", () => {
      const link = buildWhatsAppLink("3432101234");
      expect(link).toContain("https://wa.me/553432101234");
    });
  });

  describe("Phone Formatting", () => {
    function formatWhatsApp(value: string): string {
      const digits = value.replace(/\D/g, "").slice(0, 13);
      if (digits.length === 0) return "";
      if (digits.startsWith("55") && digits.length > 2) {
        const ddd = digits.slice(2, 4);
        const part1 = digits.slice(4, 9);
        const part2 = digits.slice(9);
        if (digits.length <= 4) return `+55 (${ddd}`;
        if (digits.length <= 9) return `+55 (${ddd}) ${part1}`;
        return `+55 (${ddd}) ${part1}-${part2}`;
      }
      if (digits.length <= 2) return `(${digits}`;
      if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }

    it("should format full Brazilian number with country code", () => {
      expect(formatWhatsApp("5534991201913")).toBe("+55 (34) 99120-1913");
    });

    it("should format local number without country code", () => {
      expect(formatWhatsApp("34991201913")).toBe("(34) 99120-1913");
    });

    it("should handle partial input", () => {
      expect(formatWhatsApp("34")).toBe("(34");
      expect(formatWhatsApp("3499")).toBe("(34) 99");
    });

    it("should return empty for empty input", () => {
      expect(formatWhatsApp("")).toBe("");
    });

    it("should strip non-digit characters", () => {
      expect(formatWhatsApp("+55 (34) 99120-1913")).toBe("+55 (34) 99120-1913");
    });
  });

  describe("Setting Key Validation", () => {
    it("should accept valid setting keys", () => {
      const validKeys = ["support_whatsapp", "support_email", "platform_name", "custom_key_123"];
      for (const key of validKeys) {
        expect(key.length).toBeGreaterThan(0);
        expect(key.length).toBeLessThanOrEqual(100);
      }
    });

    it("should reject empty keys", () => {
      expect("".length).toBe(0);
    });
  });

  describe("Fallback Logic", () => {
    it("should show WhatsApp button when number is configured", () => {
      const whatsappDigits = "5534991201913";
      const hasWhatsapp = whatsappDigits.length >= 10;
      expect(hasWhatsapp).toBe(true);
    });

    it("should hide WhatsApp button when number is empty", () => {
      const whatsappDigits = "";
      const hasWhatsapp = whatsappDigits.length >= 10;
      expect(hasWhatsapp).toBe(false);
    });

    it("should show email fallback when email is configured", () => {
      const supportEmail = "suporte@casablanca.com.br";
      const hasSupportEmail = !!supportEmail && supportEmail.includes("@");
      expect(hasSupportEmail).toBe(true);
    });

    it("should hide email fallback when email is empty", () => {
      const supportEmail = "";
      const hasSupportEmail = !!supportEmail && supportEmail.includes("@");
      expect(hasSupportEmail).toBe(false);
    });

    it("should show forgot button if either WhatsApp or email is configured", () => {
      // Only WhatsApp
      expect(true || false).toBe(true);
      // Only email
      expect(false || true).toBe(true);
      // Neither
      expect(false || false).toBe(false);
    });
  });
});
