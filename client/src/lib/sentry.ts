/**
 * Sentry Frontend Integration for Casa Blanca
 *
 * Initializes Sentry for client-side error monitoring.
 * Only active when VITE_SENTRY_DSN environment variable is defined.
 */

import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

/** Whether Sentry is enabled on the frontend */
export const isSentryEnabled = Boolean(SENTRY_DSN);

/**
 * Initialize Sentry on the frontend.
 * No-op if VITE_SENTRY_DSN is not defined.
 */
export function initSentryClient(): void {
  if (!isSentryEnabled) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE || "development",
    // Capture 100% of errors, 10% of transactions
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Replay configuration for session replay
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: import.meta.env.PROD ? 1.0 : 0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
  });
}

/**
 * Set user context in Sentry for the frontend.
 * Call this after authentication state changes.
 */
export function setSentryClientUser(user: {
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

/**
 * Capture an error manually in Sentry.
 */
export function captureClientError(
  error: unknown,
  extra?: Record<string, unknown>
): void {
  if (!isSentryEnabled) return;

  Sentry.withScope((scope) => {
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        scope.setExtra(key, value as string);
      });
    }
    Sentry.captureException(error);
  });
}

// Re-export for ErrorBoundary usage
export { Sentry };
