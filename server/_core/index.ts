import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { startBillingCron } from "../billingCron";
import { registerSSERoutes } from "../sse";
import {
  authLimiter,
  orderCreateLimiter,
  onboardingLimiter,
  publicReadLimiter,
} from "../middleware/rateLimiter";
import { initSentry, sentryRequestHandler, sentryErrorHandler } from "../sentry";

// Initialize Sentry as early as possible
initSentry();

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Sentry request handler (must be first middleware)
  app.use(sentryRequestHandler());

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // SSE endpoint for real-time order notifications
  registerSSERoutes(app);

  // ============================================
  // RATE LIMITING
  // ============================================

  // Auth login: 10 attempts per IP every 15 minutes
  app.use("/api/trpc/emailAuth.login", authLimiter);

  // Order creation (public checkout): 20 per IP per hour
  app.use("/api/trpc/orders.create", orderCreateLimiter);
  app.use("/api/trpc/publicStore.createOrder", orderCreateLimiter);

  // Onboarding submission: 5 per IP per hour
  app.use("/api/trpc/onboarding.submitBriefing", onboardingLimiter);

  // Public read routes: 100 per IP per minute
  app.use("/api/trpc/public.getTenantBySlug", publicReadLimiter);
  app.use("/api/trpc/publicStore.getBySlug", publicReadLimiter);
  app.use("/api/trpc/publicStore.getFullData", publicReadLimiter);
  app.use("/api/trpc/publicSettings", publicReadLimiter);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Sentry error handler (must be after routes, before other error handlers)
  app.use(sentryErrorHandler());

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Start billing CRON job after server is ready
    startBillingCron();
  });
}

startServer().catch(console.error);
