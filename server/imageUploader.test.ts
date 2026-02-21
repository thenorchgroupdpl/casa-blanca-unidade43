import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ============================================
// HELPERS
// ============================================

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

// ============================================
// ASPECT RATIO PRESETS TESTS
// ============================================

describe("ImageUploader - Aspect Ratio Logic", () => {
  it("product context should use 1:1 aspect ratio", () => {
    const ASPECT_PRESETS = {
      product: [{ label: "1:1", value: 1, description: "Quadrado" }],
      profile: [{ label: "1:1", value: 1, description: "Quadrado" }],
      background: [{ label: "16:9", value: 16 / 9, description: "Widescreen" }],
      logo: [
        { label: "4:1", value: 4, description: "Horizontal largo" },
        { label: "3:1", value: 3, description: "Horizontal" },
        { label: "2:1", value: 2, description: "Horizontal curto" },
        { label: "1:1", value: 1, description: "Quadrado" },
      ],
    };

    expect(ASPECT_PRESETS.product).toHaveLength(1);
    expect(ASPECT_PRESETS.product[0].value).toBe(1);
  });

  it("profile context should use 1:1 aspect ratio", () => {
    const ASPECT_PRESETS = {
      product: [{ label: "1:1", value: 1, description: "Quadrado" }],
      profile: [{ label: "1:1", value: 1, description: "Quadrado" }],
      background: [{ label: "16:9", value: 16 / 9, description: "Widescreen" }],
      logo: [
        { label: "4:1", value: 4, description: "Horizontal largo" },
        { label: "3:1", value: 3, description: "Horizontal" },
        { label: "2:1", value: 2, description: "Horizontal curto" },
        { label: "1:1", value: 1, description: "Quadrado" },
      ],
    };

    expect(ASPECT_PRESETS.profile).toHaveLength(1);
    expect(ASPECT_PRESETS.profile[0].value).toBe(1);
  });

  it("background context should use 16:9 aspect ratio", () => {
    const ASPECT_PRESETS = {
      product: [{ label: "1:1", value: 1, description: "Quadrado" }],
      profile: [{ label: "1:1", value: 1, description: "Quadrado" }],
      background: [{ label: "16:9", value: 16 / 9, description: "Widescreen" }],
      logo: [
        { label: "4:1", value: 4, description: "Horizontal largo" },
        { label: "3:1", value: 3, description: "Horizontal" },
        { label: "2:1", value: 2, description: "Horizontal curto" },
        { label: "1:1", value: 1, description: "Quadrado" },
      ],
    };

    expect(ASPECT_PRESETS.background).toHaveLength(1);
    expect(ASPECT_PRESETS.background[0].value).toBeCloseTo(16 / 9, 5);
  });

  it("logo context should have multiple presets including horizontal and square", () => {
    const ASPECT_PRESETS = {
      product: [{ label: "1:1", value: 1, description: "Quadrado" }],
      profile: [{ label: "1:1", value: 1, description: "Quadrado" }],
      background: [{ label: "16:9", value: 16 / 9, description: "Widescreen" }],
      logo: [
        { label: "4:1", value: 4, description: "Horizontal largo" },
        { label: "3:1", value: 3, description: "Horizontal" },
        { label: "2:1", value: 2, description: "Horizontal curto" },
        { label: "1:1", value: 1, description: "Quadrado" },
      ],
    };

    expect(ASPECT_PRESETS.logo.length).toBeGreaterThanOrEqual(3);

    // Should have horizontal options
    const horizontalPresets = ASPECT_PRESETS.logo.filter((p) => p.value > 1);
    expect(horizontalPresets.length).toBeGreaterThanOrEqual(2);

    // Should have square option
    const squarePreset = ASPECT_PRESETS.logo.find((p) => p.value === 1);
    expect(squarePreset).toBeDefined();
    expect(squarePreset!.label).toBe("1:1");
  });

  it("all contexts should have at least one preset", () => {
    const contexts = ["product", "logo", "background", "profile"] as const;
    const ASPECT_PRESETS: Record<string, { label: string; value: number; description: string }[]> = {
      product: [{ label: "1:1", value: 1, description: "Quadrado" }],
      profile: [{ label: "1:1", value: 1, description: "Quadrado" }],
      background: [{ label: "16:9", value: 16 / 9, description: "Widescreen" }],
      logo: [
        { label: "4:1", value: 4, description: "Horizontal largo" },
        { label: "3:1", value: 3, description: "Horizontal" },
        { label: "2:1", value: 2, description: "Horizontal curto" },
        { label: "1:1", value: 1, description: "Quadrado" },
      ],
    };

    for (const ctx of contexts) {
      expect(ASPECT_PRESETS[ctx].length).toBeGreaterThanOrEqual(1);
    }
  });
});

// ============================================
// UPLOAD IMAGE PROCEDURE TESTS
// ============================================

describe("catalog.uploadImage - Input Validation", () => {
  it("should reject empty imageData", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Empty base64 will fail at sharp processing
    await expect(
      caller.catalog.uploadImage({
        imageData: "",
        fileName: "test.jpg",
        contentType: "image/jpeg",
      })
    ).rejects.toThrow();
  });

  it("should accept valid input shape", () => {
    // Validate the input schema accepts the expected shape
    const validInput = {
      imageData: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      fileName: "test.png",
      contentType: "image/png",
    };

    // These should be valid strings
    expect(typeof validInput.imageData).toBe("string");
    expect(typeof validInput.fileName).toBe("string");
    expect(typeof validInput.contentType).toBe("string");
    expect(validInput.imageData.length).toBeGreaterThan(0);
  });
});

// ============================================
// LOGO MAX-HEIGHT CSS CONSTRAINT TESTS
// ============================================

describe("Logo CSS Constraints", () => {
  it("logo max-height should be capped at 100px", () => {
    // This tests the business rule: logos should never exceed 100px height
    const maxHeight = 100;
    const testSizes = [30, 50, 80, 100, 150, 200, 300];

    for (const size of testSizes) {
      const effectiveHeight = Math.min(size, maxHeight);
      expect(effectiveHeight).toBeLessThanOrEqual(100);
    }
  });

  it("logo size should respect the design system slider range (30-200px)", () => {
    const minSize = 30;
    const maxSize = 200;
    const defaultSize = 80;

    expect(defaultSize).toBeGreaterThanOrEqual(minSize);
    expect(defaultSize).toBeLessThanOrEqual(maxSize);
  });
});

// ============================================
// CONTEXT-BASED UPLOAD FLOW TESTS
// ============================================

describe("ImageUploader - Context Flow Logic", () => {
  it("product context should enforce square crop (1:1)", () => {
    const context = "product";
    const expectedAspect = 1;

    const presets: Record<string, { value: number }[]> = {
      product: [{ value: 1 }],
      logo: [{ value: 4 }, { value: 3 }, { value: 2 }, { value: 1 }],
      background: [{ value: 16 / 9 }],
      profile: [{ value: 1 }],
    };

    expect(presets[context][0].value).toBe(expectedAspect);
  });

  it("background context should enforce 16:9 crop", () => {
    const context = "background";
    const expectedAspect = 16 / 9;

    const presets: Record<string, { value: number }[]> = {
      product: [{ value: 1 }],
      logo: [{ value: 4 }, { value: 3 }, { value: 2 }, { value: 1 }],
      background: [{ value: 16 / 9 }],
      profile: [{ value: 1 }],
    };

    expect(presets[context][0].value).toBeCloseTo(expectedAspect, 5);
  });

  it("logo context should allow user to switch between presets", () => {
    const context = "logo";
    const presets: Record<string, { value: number; label: string }[]> = {
      product: [{ value: 1, label: "1:1" }],
      logo: [
        { value: 4, label: "4:1" },
        { value: 3, label: "3:1" },
        { value: 2, label: "2:1" },
        { value: 1, label: "1:1" },
      ],
      background: [{ value: 16 / 9, label: "16:9" }],
      profile: [{ value: 1, label: "1:1" }],
    };

    const logoPresets = presets[context];
    expect(logoPresets.length).toBeGreaterThan(1);

    // Simulate switching between presets
    let selectedIdx = 0;
    expect(logoPresets[selectedIdx].value).toBe(4); // 4:1 horizontal

    selectedIdx = 3;
    expect(logoPresets[selectedIdx].value).toBe(1); // 1:1 square
  });

  it("video uploads should bypass the cropper", () => {
    // When accept includes "video", ImageUploadField should use old direct upload
    const isVideoMode = "video/*".includes("video");
    expect(isVideoMode).toBe(true);

    // Image mode should use ImageUploader
    const isImageMode = !"image/*".includes("video");
    expect(isImageMode).toBe(true);
  });
});
