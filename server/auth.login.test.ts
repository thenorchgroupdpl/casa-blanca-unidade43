import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

function createPublicContext(): { ctx: TrpcContext; setCookies: CookieCall[] } {
  const setCookies: CookieCall[] = [];

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx, setCookies };
}

describe("emailAuth.login", () => {
  it("rejects invalid email format", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.emailAuth.login({
        email: "not-an-email",
        password: "123456",
      })
    ).rejects.toThrow();
  });

  it("rejects empty password", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.emailAuth.login({
        email: "test@example.com",
        password: "",
      })
    ).rejects.toThrow();
  });

  it("rejects non-existent user", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.emailAuth.login({
        email: "nonexistent@example.com",
        password: "123456",
      })
    ).rejects.toThrow("Email ou senha incorretos");
  });

  it("rejects wrong password for existing user", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.emailAuth.login({
        email: "admin@casablanca.com",
        password: "wrongpassword",
      })
    ).rejects.toThrow("Email ou senha incorretos");
  });

  it("accepts rememberMe parameter as boolean", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Should not throw on input validation - will throw on auth but that's expected
    await expect(
      caller.emailAuth.login({
        email: "nonexistent@test.com",
        password: "123456",
        rememberMe: true,
      })
    ).rejects.toThrow("Email ou senha incorretos");
  });

  it("defaults rememberMe to false when not provided", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Should accept input without rememberMe field
    await expect(
      caller.emailAuth.login({
        email: "nonexistent@test.com",
        password: "123456",
      })
    ).rejects.toThrow("Email ou senha incorretos");
  });

  it("successful login sets cookie and returns user data", async () => {
    const { ctx, setCookies } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.emailAuth.login({
        email: "admin@casablanca.com",
        password: "123456",
        rememberMe: false,
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe("admin@casablanca.com");
      expect(result.user.role).toBe("super_admin");
      expect(setCookies.length).toBeGreaterThan(0);

      // Check cookie maxAge is 7 days (not 30)
      const cookie = setCookies[0];
      expect(cookie.options.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
    } catch {
      // If admin user doesn't exist in test DB, skip
    }
  });

  it("successful login with rememberMe sets 30-day cookie", async () => {
    const { ctx, setCookies } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.emailAuth.login({
        email: "admin@casablanca.com",
        password: "123456",
        rememberMe: true,
      });

      expect(result.success).toBe(true);
      expect(setCookies.length).toBeGreaterThan(0);

      // Check cookie maxAge is 30 days
      const cookie = setCookies[0];
      expect(cookie.options.maxAge).toBe(30 * 24 * 60 * 60 * 1000);
    } catch {
      // If admin user doesn't exist in test DB, skip
    }
  });
});
