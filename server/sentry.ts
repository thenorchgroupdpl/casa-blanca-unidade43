/**
 * Sentry Server Integration for Casa Blanca
 *
 * Initializes Sentry for backend error monitoring.
 * Only active when SENTRY_DSN environment variable is defined.
 * Captures unhandled errors in Express and tRPC procedures,
 * enriching them with user context (tenantId, userId, role).
 */

import * as Sentry from "@sentry/node";
import { TRPCError } from "@trpc/server";
import type { Express, Request, Response, NextFunction } from "express";

// ============================================
// CONFIGURATION
// ============================================

const SENTRY_DSN = process.env.SENTRY_DSN;

/** Whether Sentry is enabled (DSN is defined and non-empty) */
export const isSentryEnabled = Boolean(SENTRY_DSN);

/** TRPCError codes that should NOT be reported to Sentry (expected errors) */
const IGNORED_TRPC_CODES = new Set([
  "UNAUTHORIZED",
  "NOT_FOUND",
  "TOO_MANY_REQUESTS",
]);

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize Sentry SDK. Call this as early as possible in the server startup.
 * No-op if SENTRY_DSN is not defined.
 */
export function initSentry(): void {
  if (!isSentryEnabled) {
    console.log("[Sentry] DSN not configured — error monitoring disabled");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    // Sample 100% of errors, 10% of transactions in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Filter out expected errors before sending
    beforeSend(event, hint) {
      const error = hint?.originalException;

      // Ignore expected TRPCErrors
      if (error instanceof TRPCError && IGNORED_TRPC_CODES.has(error.code)) {
        return null;
      }

      return event;
    },
  });

  console.log("[Sentry] Initialized for error monitoring");
}

// ============================================
// USER CONTEXT
// ============================================

/**
 * Set Sentry user context from authenticated request.
 * Call this in tRPC context creation or Express middleware.
 */
export function setSentryUser(user: {
  id: number;
  role: string;
  tenantId: number | null;
  email?: string | null;
  name?: string | null;
} | null): void {
  if (!isSentryEnabled) return;

  if (user) {
    Sentry.setUser({
      id: String(user.id),
      email: user.email || undefined,
      username: user.name || undefined,
    });
    Sentry.setTag("user.role", user.role);
    if (user.tenantId) {
      Sentry.setTag("user.tenantId", String(user.tenantId));
    }
  } else {
    Sentry.setUser(null);
  }
}

// ============================================
// ERROR CAPTURE
// ============================================

/**
 * Capture an error in Sentry with optional extra context.
 * No-op if Sentry is not enabled.
 */
export function captureError(
  error: unknown,
  extra?: Record<string, unknown>
): void {
  if (!isSentryEnabled) return;

  // Skip expected TRPCErrors
  if (error instanceof TRPCError && IGNORED_TRPC_CODES.has(error.code)) {
    return;
  }

  Sentry.withScope((scope) => {
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

// ============================================
// EXPRESS MIDDLEWARE
// ============================================

/**
 * Express error handler that reports to Sentry.
 * Place this AFTER all routes but BEFORE other error handlers.
 */
export function sentryErrorHandler() {
  return (err: Error, req: Request, res: Response, next: NextFunction): void => {
    if (!isSentryEnabled) {
      next(err);
      return;
    }

    // Skip expected TRPCErrors
    if (err instanceof TRPCError && IGNORED_TRPC_CODES.has(err.code)) {
      next(err);
      return;
    }

    Sentry.withScope((scope) => {
      scope.setExtra("url", req.url);
      scope.setExtra("method", req.method);
      scope.setExtra("ip", req.ip);
      Sentry.captureException(err);
    });

    next(err);
  };
}

/**
 * Express request handler that adds Sentry request context.
 * Place this BEFORE routes.
 */
export function sentryRequestHandler() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!isSentryEnabled) {
      next();
      return;
    }

    Sentry.withScope((scope) => {
      scope.setExtra("url", req.url);
      scope.setExtra("method", req.method);
      next();
    });
  };
}

// Re-export Sentry for direct usage if needed
export { Sentry };
