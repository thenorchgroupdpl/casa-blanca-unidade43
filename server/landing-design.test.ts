import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user types
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createSuperAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "super-admin-123",
    email: "admin@casablanca.com",
    name: "Super Admin",
    loginMethod: "google",
    role: "super_admin",
    tenantId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("Landing Design - getLandingDesign", () => {
  it("returns landingDesign data for a valid tenant", async () => {
    const { ctx } = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Get list of tenants first
    const tenants = await caller.tenants.list();
    if (tenants.length === 0) {
      // Skip if no tenants exist
      return;
    }

    const tenantId = tenants[0].id;
    const result = await caller.tenants.getLandingDesign({ tenantId });

    expect(result).toBeDefined();
    expect(result.tenant).toBeDefined();
    expect(result.tenant.id).toBe(tenantId);
    expect(result.settings).toBeDefined();
    expect(result.categories).toBeDefined();
    // landingDesign can be null if never saved
    expect(result).toHaveProperty("landingDesign");
  });

  it("throws for non-existent tenant", async () => {
    const { ctx } = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.tenants.getLandingDesign({ tenantId: 999999 })
    ).rejects.toThrow("Loja não encontrada");
  });
});

describe("Landing Design - updateLandingDesign", () => {
  it("saves design data and returns success", async () => {
    const { ctx } = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.list();
    if (tenants.length === 0) return;

    const tenantId = tenants[0].id;
    const testDesign = {
      home: {
        logoUrl: "https://example.com/logo.png",
        logoType: "image" as const,
        headline: "Test Headline",
        subheadline: "Test Subheadline",
        ctaText: "Order Now",
        bgOverlayOpacity: 60,
      },
      about: {
        headline: "About Us Test",
        storytelling: "Our story...",
        imageUrl: "https://example.com/about.jpg",
        ownerName: "John Doe",
      },
      products: {
        headline: "Our Menu",
        subheadline: "Choose your favorites",
      },
      reviews: {
        headline: "Reviews",
        isVisible: true,
      },
      info: {
        headline1: "Visit Us",
        subheadline1: "We are waiting",
      },
    };

    const testColors = {
      primary: "#D4AF37",
      background: "#121212",
      foreground: "#FFFFFF",
      accent: "#1a1a1a",
      muted: "#a1a1aa",
      buttonPrimary: "#FF5500",
      highlight: "#00AAFF",
      success: "#22c55e",
    };

    const result = await caller.tenants.updateLandingDesign({
      tenantId,
      landingDesign: testDesign,
      themeColors: testColors,
      fontFamily: "Poppins",
      fontDisplay: "Playfair Display",
      borderRadius: "1rem",
    });

    expect(result.success).toBe(true);

    // Verify data was persisted
    const loaded = await caller.tenants.getLandingDesign({ tenantId });
    expect(loaded.landingDesign).toBeDefined();

    const ld = loaded.landingDesign as typeof testDesign;
    expect(ld.home?.headline).toBe("Test Headline");
    expect(ld.home?.logoUrl).toBe("https://example.com/logo.png");
    expect(ld.home?.logoType).toBe("image");
    expect(ld.about?.imageUrl).toBe("https://example.com/about.jpg");
    expect(ld.about?.ownerName).toBe("John Doe");
    expect(ld.about?.storytelling).toBe("Our story...");
    expect(ld.products?.headline).toBe("Our Menu");

    // Verify fonts were persisted
    expect(loaded.tenant.fontFamily).toBe("Poppins");
    expect(loaded.tenant.fontDisplay).toBe("Playfair Display");
    expect(loaded.tenant.borderRadius).toBe("1rem");

    // Verify colors were persisted
    const savedColors = loaded.tenant.themeColors as typeof testColors;
    expect(savedColors.buttonPrimary).toBe("#FF5500");
    expect(savedColors.highlight).toBe("#00AAFF");
  });

  it("client admin cannot update landing design", async () => {
    const user: AuthenticatedUser = {
      id: 2,
      openId: "client-admin-456",
      email: "lojista@restaurante.com",
      name: "Lojista",
      loginMethod: "google",
      role: "client_admin",
      tenantId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx: TrpcContext = {
      user,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.tenants.updateLandingDesign({
        tenantId: 1,
        landingDesign: {},
        themeColors: {
          primary: "#000",
          background: "#000",
          foreground: "#fff",
          accent: "#111",
          muted: "#888",
          buttonPrimary: "#000",
          highlight: "#000",
          success: "#000",
        },
      })
    ).rejects.toThrow();
  });
});

describe("Public Route - Landing Data includes landingDesign fields", () => {
  it("public getTenantBySlug returns settings with landingDesign", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    // Get a valid slug from the super admin
    const { ctx: adminCtx } = createSuperAdminContext();
    const adminCaller = appRouter.createCaller(adminCtx);
    const tenants = await adminCaller.tenants.list();
    if (tenants.length === 0) return;

    const slug = tenants[0].slug;

    try {
      const result = await caller.public.getTenantBySlug({ slug });

      expect(result).toBeDefined();
      expect(result.tenant).toBeDefined();
      expect(result.settings).toBeDefined();
      // settings should contain landingDesign
      if (result.settings) {
        expect(result.settings).toHaveProperty("landingDesign");
      }
      // tenant should contain fontFamily and fontDisplay
      expect(result.tenant).toHaveProperty("fontFamily");
      expect(result.tenant).toHaveProperty("fontDisplay");
    } catch (err: any) {
      // If tenant is not active, it throws NOT_FOUND - that's OK
      if (err.code !== "NOT_FOUND") throw err;
    }
  });
});
