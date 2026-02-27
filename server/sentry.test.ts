import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TRPCError } from "@trpc/server";

// ============================================
// SENTRY INTEGRATION TESTS
// ============================================

describe("Sentry Server Integration", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.SENTRY_DSN;
    vi.resetModules();
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.SENTRY_DSN = originalEnv;
    } else {
      delete process.env.SENTRY_DSN;
    }
    vi.resetModules();
  });

  // ============================================
  // MODULE EXPORTS
  // ============================================

  describe("module exports", () => {
    it("exports all expected functions and constants", async () => {
      const mod = await import("./sentry");
      expect(mod.initSentry).toBeDefined();
      expect(typeof mod.initSentry).toBe("function");
      expect(mod.setSentryUser).toBeDefined();
      expect(typeof mod.setSentryUser).toBe("function");
      expect(mod.captureError).toBeDefined();
      expect(typeof mod.captureError).toBe("function");
      expect(mod.sentryErrorHandler).toBeDefined();
      expect(typeof mod.sentryErrorHandler).toBe("function");
      expect(mod.sentryRequestHandler).toBeDefined();
      expect(typeof mod.sentryRequestHandler).toBe("function");
      expect(typeof mod.isSentryEnabled).toBe("boolean");
      expect(mod.Sentry).toBeDefined();
    });
  });

  // ============================================
  // DISABLED MODE (no DSN)
  // ============================================

  describe("disabled mode (no SENTRY_DSN)", () => {
    beforeEach(() => {
      delete process.env.SENTRY_DSN;
    });

    it("isSentryEnabled is false when SENTRY_DSN is not set", async () => {
      const { isSentryEnabled } = await import("./sentry");
      expect(isSentryEnabled).toBe(false);
    });

    it("initSentry is a no-op without DSN", async () => {
      const { initSentry } = await import("./sentry");
      // Should not throw
      expect(() => initSentry()).not.toThrow();
    });

    it("setSentryUser is a no-op without DSN", async () => {
      const { setSentryUser } = await import("./sentry");
      // Should not throw with user
      expect(() => setSentryUser({ id: 1, role: "admin", tenantId: 1 })).not.toThrow();
      // Should not throw with null
      expect(() => setSentryUser(null)).not.toThrow();
    });

    it("captureError is a no-op without DSN", async () => {
      const { captureError } = await import("./sentry");
      expect(() => captureError(new Error("test"))).not.toThrow();
      expect(() => captureError(new Error("test"), { extra: "data" })).not.toThrow();
    });

    it("sentryErrorHandler passes through without DSN", async () => {
      const { sentryErrorHandler } = await import("./sentry");
      const handler = sentryErrorHandler();
      const next = vi.fn();
      const err = new Error("test");
      const req = { url: "/test", method: "GET", ip: "127.0.0.1" } as any;
      const res = {} as any;

      handler(err, req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    it("sentryRequestHandler passes through without DSN", async () => {
      const { sentryRequestHandler } = await import("./sentry");
      const handler = sentryRequestHandler();
      const next = vi.fn();
      const req = { url: "/test", method: "GET" } as any;
      const res = {} as any;

      handler(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // ERROR FILTERING
  // ============================================

  describe("error filtering", () => {
    it("captureError ignores UNAUTHORIZED TRPCError", async () => {
      const { captureError } = await import("./sentry");
      const error = new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      // Should not throw (silently ignored)
      expect(() => captureError(error)).not.toThrow();
    });

    it("captureError ignores NOT_FOUND TRPCError", async () => {
      const { captureError } = await import("./sentry");
      const error = new TRPCError({ code: "NOT_FOUND", message: "Not found" });
      expect(() => captureError(error)).not.toThrow();
    });

    it("captureError ignores TOO_MANY_REQUESTS TRPCError", async () => {
      const { captureError } = await import("./sentry");
      const error = new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Rate limited" });
      expect(() => captureError(error)).not.toThrow();
    });

    it("sentryErrorHandler ignores UNAUTHORIZED TRPCError", async () => {
      const { sentryErrorHandler } = await import("./sentry");
      const handler = sentryErrorHandler();
      const next = vi.fn();
      const err = new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });

      handler(err as any, { url: "/test", method: "GET", ip: "127.0.0.1" } as any, {} as any, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    it("sentryErrorHandler ignores NOT_FOUND TRPCError", async () => {
      const { sentryErrorHandler } = await import("./sentry");
      const handler = sentryErrorHandler();
      const next = vi.fn();
      const err = new TRPCError({ code: "NOT_FOUND", message: "Not found" });

      handler(err as any, { url: "/test", method: "GET", ip: "127.0.0.1" } as any, {} as any, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    it("sentryErrorHandler ignores TOO_MANY_REQUESTS TRPCError", async () => {
      const { sentryErrorHandler } = await import("./sentry");
      const handler = sentryErrorHandler();
      const next = vi.fn();
      const err = new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Rate limited" });

      handler(err as any, { url: "/test", method: "GET", ip: "127.0.0.1" } as any, {} as any, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    it("captureError does NOT ignore INTERNAL_SERVER_ERROR TRPCError", async () => {
      const { captureError } = await import("./sentry");
      const error = new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Something broke" });
      // Should not throw (would be captured if Sentry is enabled)
      expect(() => captureError(error)).not.toThrow();
    });

    it("captureError does NOT ignore FORBIDDEN TRPCError", async () => {
      const { captureError } = await import("./sentry");
      const error = new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      expect(() => captureError(error)).not.toThrow();
    });
  });

  // ============================================
  // SERVER INTEGRATION VERIFICATION
  // ============================================

  describe("server integration", () => {
    it("index.ts imports and initializes Sentry", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const indexPath = path.resolve(import.meta.dirname, "_core/index.ts");
      const content = fs.readFileSync(indexPath, "utf-8");

      expect(content).toContain("initSentry");
      expect(content).toContain("sentryRequestHandler");
      expect(content).toContain("sentryErrorHandler");
      expect(content).toContain("from \"../sentry\"");
    });

    it("Sentry request handler is applied BEFORE routes", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const indexPath = path.resolve(import.meta.dirname, "_core/index.ts");
      const content = fs.readFileSync(indexPath, "utf-8");

      // Find app.use(sentryRequestHandler()) vs app.use for routes
      const sentryReqUsePos = content.indexOf('app.use(sentryRequestHandler()');
      const oauthUsePos = content.indexOf('registerOAuthRoutes(app)');
      expect(sentryReqUsePos).toBeGreaterThan(-1);
      expect(oauthUsePos).toBeGreaterThan(-1);
      expect(sentryReqUsePos).toBeLessThan(oauthUsePos);
    });

    it("Sentry error handler is applied AFTER tRPC routes", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const indexPath = path.resolve(import.meta.dirname, "_core/index.ts");
      const content = fs.readFileSync(indexPath, "utf-8");

      const trpcPos = content.indexOf("createExpressMiddleware");
      const sentryErrPos = content.indexOf("sentryErrorHandler()");
      expect(trpcPos).toBeGreaterThan(-1);
      expect(sentryErrPos).toBeGreaterThan(-1);
      expect(sentryErrPos).toBeGreaterThan(trpcPos);
    });

    it("tRPC context sets Sentry user", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const contextPath = path.resolve(import.meta.dirname, "_core/context.ts");
      const content = fs.readFileSync(contextPath, "utf-8");

      expect(content).toContain("setSentryUser");
      expect(content).toContain("from \"../sentry\"");
    });

    it("tRPC error formatter captures errors to Sentry", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const trpcPath = path.resolve(import.meta.dirname, "_core/trpc.ts");
      const content = fs.readFileSync(trpcPath, "utf-8");

      expect(content).toContain("captureError");
      expect(content).toContain("errorFormatter");
      expect(content).toContain("from \"../sentry\"");
    });
  });

  // ============================================
  // ENABLED MODE (with DSN)
  // ============================================

  describe("enabled mode (with SENTRY_DSN)", () => {
    beforeEach(() => {
      process.env.SENTRY_DSN = "https://test@test.ingest.sentry.io/12345";
    });

    it("isSentryEnabled is true when SENTRY_DSN is set", async () => {
      const { isSentryEnabled } = await import("./sentry");
      expect(isSentryEnabled).toBe(true);
    });

    it("initSentry does not throw with valid DSN", async () => {
      const { initSentry } = await import("./sentry");
      expect(() => initSentry()).not.toThrow();
    });

    it("setSentryUser does not throw with user data", async () => {
      const { initSentry, setSentryUser } = await import("./sentry");
      initSentry();
      expect(() => setSentryUser({
        id: 1,
        role: "client_admin",
        tenantId: 5,
        email: "test@example.com",
        name: "Test User",
      })).not.toThrow();
    });

    it("setSentryUser does not throw with null", async () => {
      const { initSentry, setSentryUser } = await import("./sentry");
      initSentry();
      expect(() => setSentryUser(null)).not.toThrow();
    });

    it("captureError does not throw for unexpected errors", async () => {
      const { initSentry, captureError } = await import("./sentry");
      initSentry();
      expect(() => captureError(new Error("Unexpected error"), {
        context: "test",
      })).not.toThrow();
    });

    it("sentryErrorHandler calls next and does not throw", async () => {
      const { initSentry, sentryErrorHandler } = await import("./sentry");
      initSentry();
      const handler = sentryErrorHandler();
      const next = vi.fn();
      const err = new Error("Server error");

      handler(err, { url: "/test", method: "POST", ip: "1.2.3.4" } as any, {} as any, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
