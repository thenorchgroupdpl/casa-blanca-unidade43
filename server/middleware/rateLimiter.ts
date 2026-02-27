/**
 * Rate Limiting Middleware for Casa Blanca
 *
 * Uses express-rate-limit to protect against bots and abuse.
 * Disabled in NODE_ENV=development for convenience.
 *
 * Limiters:
 *   - authLimiter:       auth.login → 10 req/IP per 15 min
 *   - orderCreateLimiter: orders.create → 20 req/IP per hour
 *   - onboardingLimiter:  onboarding.submit → 5 req/IP per hour
 *   - publicReadLimiter:  public read routes → 100 req/IP per minute
 */

import rateLimit, { type Options, ipKeyGenerator } from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";

// ============================================
// HELPERS
// ============================================

const isDev = process.env.NODE_ENV === "development";

/** Standard 429 response in Portuguese, compatible with tRPC error shape */
function buildErrorResponse(message: string) {
  return {
    error: {
      message,
      code: "TOO_MANY_REQUESTS",
    },
  };
}

/**
 * Creates a rate limiter that is a no-op in development.
 * In production, applies the given options with sensible defaults.
 */
export function createLimiter(opts: Partial<Options>) {
  if (isDev) {
    // Pass-through middleware in development
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }

  return rateLimit({
    standardHeaders: true,   // X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
    legacyHeaders: false,    // Disable X-RateLimit-* (old style)
    keyGenerator: (req: Request) => {
      // Use X-Forwarded-For in production (behind proxy), fallback to req.ip
      const forwarded = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim();
      if (forwarded) return forwarded;
      // Use ipKeyGenerator helper for proper IPv6 handling
      return ipKeyGenerator(req.ip || "unknown");
    },
    handler: (_req: Request, res: Response) => {
      const msg = opts.message as string || "Muitas requisições. Tente novamente mais tarde.";
      res.status(429).json(buildErrorResponse(msg));
    },
    ...opts,
    // Ensure message is not sent as raw string by express-rate-limit
    message: undefined,
  });
}

// ============================================
// LIMITERS
// ============================================

/**
 * Auth login: 10 attempts per IP every 15 minutes
 */
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  message: "Muitas tentativas de login. Aguarde 15 minutos antes de tentar novamente.",
});

/**
 * Order creation: 20 per IP per hour
 */
export const orderCreateLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20,
  message: "Limite de pedidos atingido. Tente novamente mais tarde.",
});

/**
 * Onboarding submission: 5 per IP per hour
 */
export const onboardingLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  message: "Muitas submissões de briefing. Tente novamente mais tarde.",
});

/**
 * Public read routes: 100 per IP per minute
 */
export const publicReadLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 100,
  message: "Muitas requisições. Tente novamente em instantes.",
});
