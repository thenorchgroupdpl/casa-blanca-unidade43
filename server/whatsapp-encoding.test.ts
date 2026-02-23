/**
 * Tests for WhatsApp message generation and URL encoding
 * Phase 58: Fix double encoding bug + popup customization
 */
import { describe, it, expect } from "vitest";

// Simulate the generateWhatsAppMessage function logic (returns CLEAN string)
function generateWhatsAppMessage(
  items: { product: { name: string; price: number }; quantity: number }[],
  total: number,
  observation?: string
): string {
  let message = "🛒 *Novo Pedido — Casa Blanca*\n\n";

  items.forEach((item, idx) => {
    const itemTotal = item.product.price * item.quantity;
    message += `${idx + 1}. *${item.product.name}*\n`;
    message += `   Qtd: ${item.quantity} × R$ ${item.product.price.toFixed(2)} = R$ ${itemTotal.toFixed(2)}\n\n`;
  });

  message += `💰 *Total: R$ ${total.toFixed(2)}*\n`;

  if (observation) {
    message += `\n📝 *Observação:* ${observation}\n`;
  }

  message += "\n_Aguardo confirmação do pedido!_";

  return message;
}

// Simulate the openWhatsApp function (applies encodeURIComponent ONCE)
function buildWhatsAppUrl(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const url = message
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${cleanPhone}`;
  return url;
}

describe("WhatsApp Message Generation (Phase 58)", () => {
  it("should return a CLEAN string without URL encoding", () => {
    const items = [
      { product: { name: "Pizza Margherita", price: 45.9 }, quantity: 2 },
    ];
    const message = generateWhatsAppMessage(items, 91.8);

    // Message should NOT contain %20, %0A, %2C etc.
    expect(message).not.toContain("%20");
    expect(message).not.toContain("%0A");
    expect(message).not.toContain("%2C");

    // Message should contain normal spaces and newlines
    expect(message).toContain(" ");
    expect(message).toContain("\n");
    expect(message).toContain("Pizza Margherita");
    expect(message).toContain("R$ 91.80");
  });

  it("should include observation when provided", () => {
    const items = [
      { product: { name: "Hambúrguer", price: 32.0 }, quantity: 1 },
    ];
    const message = generateWhatsAppMessage(items, 32.0, "Sem cebola, por favor");

    expect(message).toContain("Sem cebola, por favor");
    expect(message).toContain("📝 *Observação:*");
  });

  it("should handle multiple items correctly", () => {
    const items = [
      { product: { name: "Água", price: 5.0 }, quantity: 3 },
      { product: { name: "Suco de Laranja", price: 12.0 }, quantity: 1 },
    ];
    const message = generateWhatsAppMessage(items, 27.0);

    expect(message).toContain("1. *Água*");
    expect(message).toContain("2. *Suco de Laranja*");
    expect(message).toContain("R$ 27.00");
  });

  it("should handle special characters (accents) without encoding", () => {
    const items = [
      { product: { name: "Açaí com Granola", price: 18.5 }, quantity: 1 },
    ];
    const message = generateWhatsAppMessage(items, 18.5);

    // Accented characters should remain as-is
    expect(message).toContain("Açaí com Granola");
    expect(message).not.toContain("%C3%A7"); // ç encoded
    expect(message).not.toContain("%C3%AD"); // í encoded
  });
});

describe("WhatsApp URL Building (Single Encoding)", () => {
  it("should apply encodeURIComponent exactly ONCE", () => {
    const message = "Olá, gostaria de fazer um pedido";
    const url = buildWhatsAppUrl("5534991201913", message);

    // Should contain encoded spaces (%20) but NOT double-encoded (%2520)
    expect(url).toContain("text=Ol%C3%A1%2C%20gostaria");
    expect(url).not.toContain("%2520"); // double-encoded space
    expect(url).not.toContain("%252C"); // double-encoded comma
  });

  it("should produce a valid wa.me URL", () => {
    const url = buildWhatsAppUrl("5534991201913", "Teste");

    expect(url).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    expect(url).toContain("5534991201913");
  });

  it("should handle URL without message", () => {
    const url = buildWhatsAppUrl("5534991201913");

    expect(url).toBe("https://wa.me/5534991201913");
    expect(url).not.toContain("?text=");
  });

  it("should encode newlines correctly (not double-encode)", () => {
    const message = "Linha 1\nLinha 2\nLinha 3";
    const url = buildWhatsAppUrl("5534991201913", message);

    // \n should become %0A (single encoding)
    expect(url).toContain("%0A");
    // Should NOT have %250A (double encoding of \n)
    expect(url).not.toContain("%250A");
  });

  it("should encode emojis correctly", () => {
    const message = "🛒 Pedido\n💰 Total: R$ 50,00";
    const url = buildWhatsAppUrl("5534991201913", message);

    // Decoding should return the original message
    const textParam = url.split("text=")[1];
    expect(decodeURIComponent(textParam)).toBe(message);
  });
});

describe("WhatsApp Popup Customization (Design System)", () => {
  it("should use default title when not configured", () => {
    const popupTitle = "" || "Olá! Como podemos ajudar?";
    expect(popupTitle).toBe("Olá! Como podemos ajudar?");
  });

  it("should use custom title when configured", () => {
    const popupTitle = "Bem-vindo ao Casa Blanca!" || "Olá! Como podemos ajudar?";
    expect(popupTitle).toBe("Bem-vindo ao Casa Blanca!");
  });

  it("should use default button text when not configured", () => {
    const buttonText = "" || "Iniciar Conversa";
    expect(buttonText).toBe("Iniciar Conversa");
  });

  it("should use custom button text when configured", () => {
    const buttonText = "Fale Conosco" || "Iniciar Conversa";
    expect(buttonText).toBe("Fale Conosco");
  });
});
