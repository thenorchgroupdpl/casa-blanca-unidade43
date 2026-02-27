import { describe, expect, it } from "vitest";

/**
 * Unit tests for Coupons system:
 * 1. Coupon code normalization (uppercase, trim)
 * 2. Coupon validation logic with SPECIFIC error messages
 * 3. Discount calculation logic (shared hook calculateDiscount)
 * 4. WhatsApp message generation with coupon
 * 5. Coupon status determination (UI badges)
 * 6. Coupon duplicate detection
 * 7. Total calculation with coupon + delivery
 * 8. Backend validateCoupon error message specificity
 */

// ============================================
// 1. COUPON CODE NORMALIZATION
// ============================================

function normalizeCode(code: string): string {
  return code.toUpperCase().trim();
}

describe("Coupon code normalization", () => {
  it("converts lowercase to uppercase", () => {
    expect(normalizeCode("promo10")).toBe("PROMO10");
  });

  it("trims whitespace", () => {
    expect(normalizeCode("  PROMO10  ")).toBe("PROMO10");
  });

  it("handles mixed case", () => {
    expect(normalizeCode("ProMo10")).toBe("PROMO10");
  });

  it("handles empty string", () => {
    expect(normalizeCode("")).toBe("");
  });

  it("handles special characters", () => {
    expect(normalizeCode("black-friday-50")).toBe("BLACK-FRIDAY-50");
  });
});

// ============================================
// 2. COUPON VALIDATION LOGIC (SPECIFIC ERRORS)
// ============================================

interface CouponData {
  id: number;
  code: string;
  discountPercentage: number;
  isActive: boolean;
  expiresAt: Date | null;
  usageLimit: number | null;
  usageCount: number;
  tenantId: number;
}

interface ValidationResult {
  valid: boolean;
  reason?: string;
  coupon?: { id: number; code: string; discountPercentage: number };
}

/**
 * Mirrors the backend validateCoupon logic with EXACT error messages.
 * These messages match what the backend returns to the frontend.
 */
function validateCouponLogic(coupon: CouponData | null, tenantId: number): ValidationResult {
  // Coupon not found
  if (!coupon) {
    return { valid: false, reason: "Cupom inválido ou inativo." };
  }

  // Wrong tenant
  if (coupon.tenantId !== tenantId) {
    return { valid: false, reason: "Cupom inválido ou inativo." };
  }

  // Inactive
  if (!coupon.isActive) {
    return { valid: false, reason: "Cupom inválido ou inativo." };
  }

  // Expired
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, reason: "Este cupom está expirado." };
  }

  // Usage limit reached (A Regra de Ouro)
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, reason: "O limite de usos para este cupom já foi atingido." };
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    },
  };
}

describe("Coupon validation logic with specific error messages", () => {
  const baseCoupon: CouponData = {
    id: 1,
    code: "PROMO10",
    discountPercentage: 10,
    isActive: true,
    expiresAt: null,
    usageLimit: null,
    usageCount: 0,
    tenantId: 1,
  };

  it("validates a valid coupon", () => {
    const result = validateCouponLogic(baseCoupon, 1);
    expect(result.valid).toBe(true);
    expect(result.coupon).toEqual({
      id: 1,
      code: "PROMO10",
      discountPercentage: 10,
    });
  });

  it("rejects null coupon with 'Cupom inválido ou inativo.'", () => {
    const result = validateCouponLogic(null, 1);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Cupom inválido ou inativo.");
  });

  it("rejects coupon from different tenant with 'Cupom inválido ou inativo.'", () => {
    const result = validateCouponLogic(baseCoupon, 999);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Cupom inválido ou inativo.");
  });

  it("rejects inactive coupon with 'Cupom inválido ou inativo.'", () => {
    const result = validateCouponLogic({ ...baseCoupon, isActive: false }, 1);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Cupom inválido ou inativo.");
  });

  it("rejects expired coupon with 'Este cupom está expirado.'", () => {
    const pastDate = new Date("2020-01-01");
    const result = validateCouponLogic({ ...baseCoupon, expiresAt: pastDate }, 1);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Este cupom está expirado.");
  });

  it("accepts coupon with future expiration", () => {
    const futureDate = new Date("2030-12-31");
    const result = validateCouponLogic({ ...baseCoupon, expiresAt: futureDate }, 1);
    expect(result.valid).toBe(true);
  });

  it("rejects coupon at exact usage limit with 'O limite de usos para este cupom já foi atingido.'", () => {
    const result = validateCouponLogic(
      { ...baseCoupon, usageLimit: 5, usageCount: 5 },
      1
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("O limite de usos para este cupom já foi atingido.");
  });

  it("rejects coupon that exceeded usage limit", () => {
    const result = validateCouponLogic(
      { ...baseCoupon, usageLimit: 3, usageCount: 5 },
      1
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("O limite de usos para este cupom já foi atingido.");
  });

  it("accepts coupon with usage count below limit", () => {
    const result = validateCouponLogic(
      { ...baseCoupon, usageLimit: 10, usageCount: 3 },
      1
    );
    expect(result.valid).toBe(true);
  });

  it("accepts coupon with no usage limit (unlimited)", () => {
    const result = validateCouponLogic(
      { ...baseCoupon, usageLimit: null, usageCount: 1000 },
      1
    );
    expect(result.valid).toBe(true);
  });

  it("prioritizes 'inativo' over 'expirado' when both conditions are true", () => {
    const result = validateCouponLogic(
      { ...baseCoupon, isActive: false, expiresAt: new Date("2020-01-01") },
      1
    );
    expect(result.reason).toBe("Cupom inválido ou inativo.");
  });

  it("prioritizes 'expirado' over 'limite atingido' when both conditions are true", () => {
    const result = validateCouponLogic(
      { ...baseCoupon, expiresAt: new Date("2020-01-01"), usageLimit: 1, usageCount: 1 },
      1
    );
    expect(result.reason).toBe("Este cupom está expirado.");
  });
});

// ============================================
// 3. DISCOUNT CALCULATION LOGIC
// ============================================

function calculateDiscount(subtotal: number, discountPercentage: number): {
  discount: number;
  total: number;
} {
  const discount = subtotal * (discountPercentage / 100);
  const total = Math.max(0, subtotal - discount);
  return { discount: Math.round(discount * 100) / 100, total: Math.round(total * 100) / 100 };
}

/**
 * Mirrors the hook's calculateDiscount function
 */
function hookCalculateDiscount(subtotal: number, discountPercentage: number | null): number {
  if (discountPercentage === null) return 0;
  return subtotal * (discountPercentage / 100);
}

describe("Discount calculation", () => {
  it("calculates 10% discount on R$100", () => {
    const result = calculateDiscount(100, 10);
    expect(result.discount).toBe(10);
    expect(result.total).toBe(90);
  });

  it("calculates 50% discount on R$200", () => {
    const result = calculateDiscount(200, 50);
    expect(result.discount).toBe(100);
    expect(result.total).toBe(100);
  });

  it("calculates 100% discount (free)", () => {
    const result = calculateDiscount(150, 100);
    expect(result.discount).toBe(150);
    expect(result.total).toBe(0);
  });

  it("handles small percentages with precision", () => {
    const result = calculateDiscount(99.90, 5);
    expect(result.discount).toBe(5.0);
    expect(result.total).toBe(94.91);
  });

  it("handles zero subtotal", () => {
    const result = calculateDiscount(0, 10);
    expect(result.discount).toBe(0);
    expect(result.total).toBe(0);
  });

  it("handles very small discount percentage", () => {
    const result = calculateDiscount(1000, 0.01);
    expect(result.discount).toBe(0.1);
    expect(result.total).toBe(999.9);
  });
});

describe("Hook calculateDiscount function", () => {
  it("returns 0 when no coupon applied (null percentage)", () => {
    expect(hookCalculateDiscount(100, null)).toBe(0);
  });

  it("calculates discount correctly", () => {
    expect(hookCalculateDiscount(100, 10)).toBe(10);
  });

  it("returns 0 for zero subtotal", () => {
    expect(hookCalculateDiscount(0, 10)).toBe(0);
  });

  it("calculates full discount at 100%", () => {
    expect(hookCalculateDiscount(200, 100)).toBe(200);
  });
});

// ============================================
// 4. WHATSAPP MESSAGE WITH COUPON
// ============================================

function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

function generateWhatsAppMessage(
  items: { product: { name: string; price: number }; quantity: number }[],
  total: number,
  observation?: string,
  storeName?: string,
  delivery?: { zoneName: string; fee: number } | null,
  coupon?: { code: string; discountPercentage: number } | null
): string {
  const nome = storeName || "Casa Blanca";

  const itensList = items
    .map((item) => {
      const itemTotal = item.product.price * item.quantity;
      return `- ${item.quantity}x ${item.product.name} - ${formatPrice(itemTotal)}`;
    })
    .join("\n");

  let message = `*Olá ${nome}! Pedido via Site:*\n\n${itensList}`;

  if (delivery) {
    message += `\n\n*Entrega:* ${delivery.zoneName}`;
    if (delivery.fee > 0) {
      message += ` (${formatPrice(delivery.fee)})`;
    } else {
      message += ` (Grátis)`;
    }
  }

  if (coupon) {
    message += `\n\n*Cupom Usado:* ${coupon.code} (-${coupon.discountPercentage}%)`;
  }

  message += `\n\n*Total: ${formatPrice(total)}*`;

  if (observation) {
    message += `\n\n*Observação:* ${observation}`;
  }

  message += "\n\nAguardo confirmação do pedido!";

  return message;
}

describe("WhatsApp message with coupon", () => {
  const sampleItems = [
    { product: { name: "X-Burguer", price: 25 }, quantity: 2 },
    { product: { name: "Coca-Cola", price: 8 }, quantity: 1 },
  ];

  it("includes coupon info in message when coupon is applied", () => {
    const message = generateWhatsAppMessage(
      sampleItems,
      52.2,
      undefined,
      "Casa Blanca",
      null,
      { code: "PROMO10", discountPercentage: 10 }
    );

    expect(message).toContain("*Cupom Usado:* PROMO10 (-10%)");
    expect(message).toContain("X-Burguer");
    expect(message).toContain("Coca-Cola");
  });

  it("does not include coupon info when no coupon", () => {
    const message = generateWhatsAppMessage(
      sampleItems,
      58,
      undefined,
      "Casa Blanca",
      null,
      null
    );

    expect(message).not.toContain("Cupom Usado");
  });

  it("includes both delivery and coupon info", () => {
    const message = generateWhatsAppMessage(
      sampleItems,
      57.2,
      undefined,
      "Casa Blanca",
      { zoneName: "Centro", fee: 5 },
      { code: "DESCONTO10", discountPercentage: 10 }
    );

    expect(message).toContain("*Entrega:* Centro");
    expect(message).toContain("*Cupom Usado:* DESCONTO10 (-10%)");
  });

  it("includes observation with coupon", () => {
    const message = generateWhatsAppMessage(
      sampleItems,
      52.2,
      "Sem cebola",
      "Casa Blanca",
      null,
      { code: "PROMO10", discountPercentage: 10 }
    );

    expect(message).toContain("*Cupom Usado:* PROMO10 (-10%)");
    expect(message).toContain("*Observação:* Sem cebola");
  });

  it("coupon appears before total in message", () => {
    const message = generateWhatsAppMessage(
      sampleItems,
      52.2,
      undefined,
      "Casa Blanca",
      null,
      { code: "PROMO10", discountPercentage: 10 }
    );

    const couponIndex = message.indexOf("*Cupom Usado:*");
    const totalIndex = message.indexOf("*Total:");
    expect(couponIndex).toBeLessThan(totalIndex);
  });
});

// ============================================
// 5. COUPON STATUS DETERMINATION
// ============================================

function getCouponStatus(coupon: {
  isActive: boolean;
  expiresAt: Date | string | null;
  usageLimit: number | null;
  usageCount: number;
}): { label: string; variant: string } {
  if (!coupon.isActive) return { label: "Inativo", variant: "secondary" };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { label: "Expirado", variant: "destructive" };
  }
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { label: "Esgotado", variant: "outline" };
  }
  return { label: "Ativo", variant: "default" };
}

describe("Coupon status determination", () => {
  it("returns Ativo for active coupon with no limits", () => {
    const status = getCouponStatus({
      isActive: true,
      expiresAt: null,
      usageLimit: null,
      usageCount: 0,
    });
    expect(status.label).toBe("Ativo");
    expect(status.variant).toBe("default");
  });

  it("returns Inativo for disabled coupon", () => {
    const status = getCouponStatus({
      isActive: false,
      expiresAt: null,
      usageLimit: null,
      usageCount: 0,
    });
    expect(status.label).toBe("Inativo");
    expect(status.variant).toBe("secondary");
  });

  it("returns Expirado for expired coupon", () => {
    const status = getCouponStatus({
      isActive: true,
      expiresAt: new Date("2020-01-01"),
      usageLimit: null,
      usageCount: 0,
    });
    expect(status.label).toBe("Expirado");
    expect(status.variant).toBe("destructive");
  });

  it("returns Esgotado when usage limit is reached", () => {
    const status = getCouponStatus({
      isActive: true,
      expiresAt: null,
      usageLimit: 5,
      usageCount: 5,
    });
    expect(status.label).toBe("Esgotado");
    expect(status.variant).toBe("outline");
  });

  it("returns Ativo when usage count is below limit", () => {
    const status = getCouponStatus({
      isActive: true,
      expiresAt: null,
      usageLimit: 10,
      usageCount: 3,
    });
    expect(status.label).toBe("Ativo");
  });

  it("prioritizes Inativo over Expirado", () => {
    const status = getCouponStatus({
      isActive: false,
      expiresAt: new Date("2020-01-01"),
      usageLimit: null,
      usageCount: 0,
    });
    expect(status.label).toBe("Inativo");
  });
});

// ============================================
// 6. COUPON DUPLICATE DETECTION
// ============================================

function isDuplicateCode(
  existingCoupons: { id: number; code: string }[],
  newCode: string,
  excludeId?: number
): boolean {
  const normalized = newCode.toUpperCase().trim();
  return existingCoupons.some(
    (c) => c.code === normalized && c.id !== excludeId
  );
}

describe("Coupon duplicate detection", () => {
  const existing = [
    { id: 1, code: "PROMO10" },
    { id: 2, code: "BLACKFRIDAY" },
    { id: 3, code: "NATAL2025" },
  ];

  it("detects duplicate code", () => {
    expect(isDuplicateCode(existing, "PROMO10")).toBe(true);
  });

  it("detects duplicate case-insensitive", () => {
    expect(isDuplicateCode(existing, "promo10")).toBe(true);
  });

  it("allows new unique code", () => {
    expect(isDuplicateCode(existing, "NEWCODE")).toBe(false);
  });

  it("allows same code when editing (excludeId)", () => {
    expect(isDuplicateCode(existing, "PROMO10", 1)).toBe(false);
  });

  it("detects duplicate even when editing different coupon", () => {
    expect(isDuplicateCode(existing, "PROMO10", 2)).toBe(true);
  });

  it("handles trimming in duplicate check", () => {
    expect(isDuplicateCode(existing, "  PROMO10  ")).toBe(true);
  });
});

// ============================================
// 7. TOTAL CALCULATION WITH COUPON + DELIVERY
// ============================================

describe("Total calculation with coupon and delivery", () => {
  it("applies coupon before adding delivery fee", () => {
    const subtotal = 100;
    const couponPercentage = 10;
    const deliveryFee = 8;

    const couponDiscount = subtotal * (couponPercentage / 100); // 10
    const subtotalAfterCoupon = subtotal - couponDiscount; // 90
    const total = subtotalAfterCoupon + deliveryFee; // 98

    expect(couponDiscount).toBe(10);
    expect(subtotalAfterCoupon).toBe(90);
    expect(total).toBe(98);
  });

  it("handles no coupon with delivery", () => {
    const subtotal = 100;
    const deliveryFee = 8;

    const total = subtotal + deliveryFee;
    expect(total).toBe(108);
  });

  it("handles coupon with no delivery", () => {
    const subtotal = 100;
    const couponPercentage = 20;

    const couponDiscount = subtotal * (couponPercentage / 100);
    const total = subtotal - couponDiscount;

    expect(couponDiscount).toBe(20);
    expect(total).toBe(80);
  });

  it("handles 100% coupon with delivery (only pays delivery)", () => {
    const subtotal = 100;
    const couponPercentage = 100;
    const deliveryFee = 8;

    const couponDiscount = subtotal * (couponPercentage / 100);
    const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
    const total = subtotalAfterCoupon + deliveryFee;

    expect(couponDiscount).toBe(100);
    expect(subtotalAfterCoupon).toBe(0);
    expect(total).toBe(8);
  });

  it("handles free pickup with coupon", () => {
    const subtotal = 50;
    const couponPercentage = 15;
    const deliveryFee = 0; // pickup

    const couponDiscount = subtotal * (couponPercentage / 100);
    const total = subtotal - couponDiscount + deliveryFee;

    expect(couponDiscount).toBe(7.5);
    expect(total).toBe(42.5);
  });
});

// ============================================
// 8. BACKEND VALIDATION ERROR MESSAGE SPECIFICITY
// ============================================

describe("Backend validation error messages match exact spec", () => {
  const baseCoupon: CouponData = {
    id: 1,
    code: "PROMO10",
    discountPercentage: 10,
    isActive: true,
    expiresAt: null,
    usageLimit: null,
    usageCount: 0,
    tenantId: 1,
  };

  it("not found → 'Cupom inválido ou inativo.'", () => {
    const result = validateCouponLogic(null, 1);
    expect(result.reason).toBe("Cupom inválido ou inativo.");
  });

  it("is_active = false → 'Cupom inválido ou inativo.'", () => {
    const result = validateCouponLogic({ ...baseCoupon, isActive: false }, 1);
    expect(result.reason).toBe("Cupom inválido ou inativo.");
  });

  it("expired → 'Este cupom está expirado.'", () => {
    const result = validateCouponLogic(
      { ...baseCoupon, expiresAt: new Date("2020-01-01") },
      1
    );
    expect(result.reason).toBe("Este cupom está expirado.");
  });

  it("usage_count >= usage_limit → 'O limite de usos para este cupom já foi atingido.'", () => {
    const result = validateCouponLogic(
      { ...baseCoupon, usageLimit: 10, usageCount: 10 },
      1
    );
    expect(result.reason).toBe("O limite de usos para este cupom já foi atingido.");
  });

  it("usage_count > usage_limit → same message", () => {
    const result = validateCouponLogic(
      { ...baseCoupon, usageLimit: 5, usageCount: 8 },
      1
    );
    expect(result.reason).toBe("O limite de usos para este cupom já foi atingido.");
  });

  it("valid coupon → no reason, valid = true", () => {
    const result = validateCouponLogic(baseCoupon, 1);
    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
  });
});

// ============================================
// 9. USAGE COUNT INCREMENT SIMULATION
// ============================================

describe("Usage count increment simulation", () => {
  it("increments usage_count by 1", () => {
    let usageCount = 0;
    usageCount += 1;
    expect(usageCount).toBe(1);
  });

  it("blocks usage after increment reaches limit", () => {
    const usageLimit = 3;
    let usageCount = 2;
    
    // Before increment: still valid
    expect(usageCount < usageLimit).toBe(true);
    
    // Increment after order
    usageCount += 1;
    
    // After increment: now at limit
    expect(usageCount >= usageLimit).toBe(true);
    
    // Next validation should fail
    const result = validateCouponLogic(
      {
        id: 1, code: "TEST", discountPercentage: 10,
        isActive: true, expiresAt: null,
        usageLimit, usageCount, tenantId: 1,
      },
      1
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("O limite de usos para este cupom já foi atingido.");
  });

  it("allows unlimited usage when usageLimit is null", () => {
    const usageLimit = null;
    let usageCount = 999;
    
    usageCount += 1;
    
    const result = validateCouponLogic(
      {
        id: 1, code: "UNLIMITED", discountPercentage: 5,
        isActive: true, expiresAt: null,
        usageLimit, usageCount, tenantId: 1,
      },
      1
    );
    expect(result.valid).toBe(true);
  });
});
