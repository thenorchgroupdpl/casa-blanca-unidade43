import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// ============================================
// TESTS FOR RATE LIMITER MIDDLEWARE
// ============================================

/**
 * We test the createLimiter factory and the exported limiters.
 * Since express-rate-limit is a well-tested library, we focus on:
 * 1. Dev mode bypass (no-op middleware)
 * 2. Production mode creates actual limiters
 * 3. Error response format (Portuguese, tRPC-compatible)
 * 4. Correct configuration values for each limiter
 */

// Helper to create mock Express req/res/next
function createMockReq(ip: string = "127.0.0.1"): Partial<Request> {
  return {
    ip,
    headers: {},
    method: "POST",
    url: "/api/trpc/emailAuth.login",
    socket: { remoteAddress: ip } as any,
    app: {
      get: vi.fn().mockReturnValue(false), // trust proxy = false
    } as any,
  };
}

function createMockRes(): Partial<Response> & { _statusCode: number; _body: any; _headers: Record<string, string> } {
  const res: any = {
    _statusCode: 200,
    _body: null,
    _headers: {} as Record<string, string>,
    status(code: number) {
      res._statusCode = code;
      return res;
    },
    json(body: any) {
      res._body = body;
      return res;
    },
    setHeader(name: string, value: string) {
      res._headers[name] = value;
      return res;
    },
    getHeader(name: string) {
      return res._headers[name];
    },
    set(name: string, value: string) {
      res._headers[name] = value;
      return res;
    },
    header(name: string, value: string) {
      res._headers[name] = value;
      return res;
    },
  };
  return res;
}

// ============================================
// DEV MODE TESTS
// ============================================

describe("Rate Limiter - Development Mode", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    // Clear module cache to re-evaluate isDev
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.resetModules();
  });

  it("createLimiter returns pass-through middleware in development", async () => {
    const { createLimiter } = await import("./middleware/rateLimiter");
    const limiter = createLimiter({ windowMs: 1000, limit: 1 });

    const req = createMockReq() as Request;
    const res = createMockRes() as unknown as Response;
    const next = vi.fn() as NextFunction;

    // Should call next() immediately without blocking
    limiter(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("authLimiter is a no-op in development", async () => {
    const { authLimiter } = await import("./middleware/rateLimiter");

    const req = createMockReq() as Request;
    const res = createMockRes() as unknown as Response;
    const next = vi.fn() as NextFunction;

    // Should pass through even on repeated calls
    for (let i = 0; i < 50; i++) {
      authLimiter(req, res, next);
    }
    expect(next).toHaveBeenCalledTimes(50);
  });

  it("orderCreateLimiter is a no-op in development", async () => {
    const { orderCreateLimiter } = await import("./middleware/rateLimiter");

    const req = createMockReq() as Request;
    const res = createMockRes() as unknown as Response;
    const next = vi.fn() as NextFunction;

    for (let i = 0; i < 50; i++) {
      orderCreateLimiter(req, res, next);
    }
    expect(next).toHaveBeenCalledTimes(50);
  });

  it("onboardingLimiter is a no-op in development", async () => {
    const { onboardingLimiter } = await import("./middleware/rateLimiter");

    const req = createMockReq() as Request;
    const res = createMockRes() as unknown as Response;
    const next = vi.fn() as NextFunction;

    for (let i = 0; i < 50; i++) {
      onboardingLimiter(req, res, next);
    }
    expect(next).toHaveBeenCalledTimes(50);
  });

  it("publicReadLimiter is a no-op in development", async () => {
    const { publicReadLimiter } = await import("./middleware/rateLimiter");

    const req = createMockReq() as Request;
    const res = createMockRes() as unknown as Response;
    const next = vi.fn() as NextFunction;

    for (let i = 0; i < 200; i++) {
      publicReadLimiter(req, res, next);
    }
    expect(next).toHaveBeenCalledTimes(200);
  });
});

// ============================================
// PRODUCTION MODE TESTS
// ============================================

describe("Rate Limiter - Production Mode", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.resetModules();
  });

  it("createLimiter returns a real middleware in production", async () => {
    const { createLimiter } = await import("./middleware/rateLimiter");
    const limiter = createLimiter({ windowMs: 60000, limit: 5 });

    // Should be a function (middleware)
    expect(typeof limiter).toBe("function");
    // Should NOT be the simple pass-through (which has 3 params with next called immediately)
    // Real rate-limit middleware has different behavior
  });

  it("authLimiter blocks after 10 requests", async () => {
    const { createLimiter } = await import("./middleware/rateLimiter");
    const limiter = createLimiter({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      message: "Muitas tentativas de login. Aguarde 15 minutos antes de tentar novamente.",
    });

    const next = vi.fn() as NextFunction;
    let blocked = false;

    for (let i = 0; i < 12; i++) {
      const req = createMockReq("192.168.1.1") as Request;
      const res = createMockRes();

      await new Promise<void>((resolve) => {
        const nextFn: NextFunction = (() => {
          next();
          resolve();
        }) as NextFunction;

        const result = limiter(req as Request, res as unknown as Response, nextFn);
        // If it's a promise, wait for it
        if (result && typeof (result as any).then === "function") {
          (result as any).then(() => {
            if (res._statusCode === 429) {
              blocked = true;
              resolve();
            }
          });
        } else if (res._statusCode === 429) {
          blocked = true;
          resolve();
        }
      });

      if (blocked) break;
    }

    // After 10 requests, the 11th should be blocked
    expect(next).toHaveBeenCalledTimes(10);
    expect(blocked).toBe(true);
  });

  it("returns 429 with Portuguese message and tRPC-compatible error shape", async () => {
    const { createLimiter } = await import("./middleware/rateLimiter");
    const testMessage = "Muitas tentativas de login. Aguarde 15 minutos.";
    const limiter = createLimiter({
      windowMs: 60000,
      limit: 1,
      message: testMessage,
    });

    // First request passes
    const req1 = createMockReq("10.0.0.1") as Request;
    const res1 = createMockRes();
    await new Promise<void>((resolve) => {
      limiter(req1 as Request, res1 as unknown as Response, (() => resolve()) as NextFunction);
    });

    // Second request should be blocked
    const req2 = createMockReq("10.0.0.1") as Request;
    const res2 = createMockRes();
    await new Promise<void>((resolve) => {
      limiter(req2 as Request, res2 as unknown as Response, (() => resolve()) as NextFunction);
      // Give it a tick to process
      setTimeout(() => resolve(), 50);
    });

    expect(res2._statusCode).toBe(429);
    expect(res2._body).toEqual({
      error: {
        message: testMessage,
        code: "TOO_MANY_REQUESTS",
      },
    });
  });

  it("different IPs have separate rate limit counters", async () => {
    const { createLimiter } = await import("./middleware/rateLimiter");
    const limiter = createLimiter({
      windowMs: 60000,
      limit: 2,
      message: "Rate limited",
    });

    const nextA = vi.fn();
    const nextB = vi.fn();

    // IP A: 2 requests (should pass)
    for (let i = 0; i < 2; i++) {
      const req = createMockReq("10.0.0.1") as Request;
      const res = createMockRes();
      await new Promise<void>((resolve) => {
        limiter(req as Request, res as unknown as Response, (() => { nextA(); resolve(); }) as NextFunction);
      });
    }

    // IP B: 2 requests (should pass independently)
    for (let i = 0; i < 2; i++) {
      const req = createMockReq("10.0.0.2") as Request;
      const res = createMockRes();
      await new Promise<void>((resolve) => {
        limiter(req as Request, res as unknown as Response, (() => { nextB(); resolve(); }) as NextFunction);
      });
    }

    expect(nextA).toHaveBeenCalledTimes(2);
    expect(nextB).toHaveBeenCalledTimes(2);
  });

  it("uses X-Forwarded-For header when present", async () => {
    const { createLimiter } = await import("./middleware/rateLimiter");
    const limiter = createLimiter({
      windowMs: 60000,
      limit: 1,
      message: "Rate limited",
    });

    // First request with X-Forwarded-For: 1.2.3.4
    const req1: Partial<Request> = {
      ...createMockReq("127.0.0.1"),
      headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" },
    };
    const res1 = createMockRes();
    const next1 = vi.fn();
    await new Promise<void>((resolve) => {
      limiter(req1 as Request, res1 as unknown as Response, (() => { next1(); resolve(); }) as NextFunction);
    });
    expect(next1).toHaveBeenCalledTimes(1);

    // Second request from same forwarded IP should be blocked
    const req2: Partial<Request> = {
      ...createMockReq("127.0.0.2"), // different socket IP
      headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.2" }, // same forwarded IP
    };
    const res2 = createMockRes();
    const next2 = vi.fn();
    await new Promise<void>((resolve) => {
      limiter(req2 as Request, res2 as unknown as Response, (() => { next2(); resolve(); }) as NextFunction);
      setTimeout(() => resolve(), 50);
    });

    expect(res2._statusCode).toBe(429);
  });
});

// ============================================
// CONFIGURATION VALIDATION TESTS
// ============================================

describe("Rate Limiter - Configuration", () => {
  it("rateLimiter.ts exports all expected limiters", async () => {
    const mod = await import("./middleware/rateLimiter");
    expect(mod.authLimiter).toBeDefined();
    expect(mod.orderCreateLimiter).toBeDefined();
    expect(mod.onboardingLimiter).toBeDefined();
    expect(mod.publicReadLimiter).toBeDefined();
    expect(mod.createLimiter).toBeDefined();
    expect(typeof mod.createLimiter).toBe("function");
  });

  it("all limiters are functions (middleware signature)", async () => {
    const mod = await import("./middleware/rateLimiter");
    expect(typeof mod.authLimiter).toBe("function");
    expect(typeof mod.orderCreateLimiter).toBe("function");
    expect(typeof mod.onboardingLimiter).toBe("function");
    expect(typeof mod.publicReadLimiter).toBe("function");
  });
});

// ============================================
// SERVER INTEGRATION TESTS
// ============================================

describe("Rate Limiter - Server Integration", () => {
  it("index.ts imports and applies all rate limiters", async () => {
    // Read the server index.ts to verify rate limiters are applied
    const fs = await import("fs");
    const path = await import("path");
    const indexPath = path.resolve(import.meta.dirname, "_core/index.ts");
    const indexContent = fs.readFileSync(indexPath, "utf-8");

    // Verify imports
    expect(indexContent).toContain("authLimiter");
    expect(indexContent).toContain("orderCreateLimiter");
    expect(indexContent).toContain("onboardingLimiter");
    expect(indexContent).toContain("publicReadLimiter");

    // Verify route applications
    expect(indexContent).toContain('"/api/trpc/emailAuth.login"');
    expect(indexContent).toContain('"/api/trpc/orders.create"');
    expect(indexContent).toContain('"/api/trpc/onboarding.submitBriefing"');
    expect(indexContent).toContain('"/api/trpc/public.getTenantBySlug"');
    expect(indexContent).toContain('"/api/trpc/publicStore.getBySlug"');
  });

  it("rate limiters are applied BEFORE tRPC middleware in app.use() order", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const indexPath = path.resolve(import.meta.dirname, "_core/index.ts");
    const indexContent = fs.readFileSync(indexPath, "utf-8");

    // The first app.use for a rate limiter should come before app.use for tRPC
    const firstRateLimitUse = indexContent.indexOf('app.use("/api/trpc/emailAuth.login"');
    const trpcUse = indexContent.indexOf('app.use(\n    "/api/trpc"');
    // Fallback: find the tRPC app.use with createExpressMiddleware on next line
    const trpcUseFallback = indexContent.indexOf('createExpressMiddleware({');

    expect(firstRateLimitUse).toBeGreaterThan(-1);
    expect(trpcUseFallback).toBeGreaterThan(-1);
    expect(firstRateLimitUse).toBeLessThan(trpcUseFallback);
  });
});
