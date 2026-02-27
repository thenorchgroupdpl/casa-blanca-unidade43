/**
 * Server-Sent Events (SSE) module for real-time order notifications.
 * Manages connections per tenant and broadcasts events.
 */
import type { Request, Response, Express } from "express";
import { sdk } from "./_core/sdk";
import * as db from "./db";

// ============================================
// TYPES
// ============================================

export interface OrderEvent {
  orderId: number;
  customerName: string;
  total: number;
  itemCount: number;
  createdAt: string;
  zone: string;
}

// ============================================
// CONNECTION MANAGER
// ============================================

// Map<tenantId, Set<Response>>
const connections = new Map<number, Set<Response>>();

// Exported for testing only
export const _connections = connections;

export function getConnectionCount(tenantId: number): number {
  return connections.get(tenantId)?.size ?? 0;
}

export function getTotalConnectionCount(): number {
  let total = 0;
  const entries = Array.from(connections.values());
  for (const set of entries) {
    total += set.size;
  }
  return total;
}

function addConnection(tenantId: number, res: Response): void {
  if (!connections.has(tenantId)) {
    connections.set(tenantId, new Set());
  }
  connections.get(tenantId)!.add(res);
  console.log(`[SSE] Client connected for tenant ${tenantId}. Active: ${getConnectionCount(tenantId)}`);
}

function removeConnection(tenantId: number, res: Response): void {
  const tenantConns = connections.get(tenantId);
  if (tenantConns) {
    tenantConns.delete(res);
    if (tenantConns.size === 0) {
      connections.delete(tenantId);
    }
  }
  console.log(`[SSE] Client disconnected for tenant ${tenantId}. Active: ${getConnectionCount(tenantId)}`);
}

// ============================================
// NOTIFY TENANT
// ============================================

/**
 * Broadcast an order event to all active SSE connections for a tenant.
 * Returns the number of clients notified.
 */
export function notifyTenant(tenantId: number, event: OrderEvent): number {
  const tenantConns = connections.get(tenantId);
  if (!tenantConns || tenantConns.size === 0) {
    return 0;
  }

  const payload = `event: new_order\ndata: ${JSON.stringify(event)}\n\n`;
  let notified = 0;
  const connArray = Array.from(tenantConns);

  for (const res of connArray) {
    try {
      res.write(payload);
      notified++;
    } catch (err) {
      console.error(`[SSE] Error writing to connection for tenant ${tenantId}:`, err);
      // Remove broken connection
      tenantConns.delete(res);
    }
  }

  if (tenantConns.size === 0) {
    connections.delete(tenantId);
  }

  console.log(`[SSE] Notified ${notified} client(s) for tenant ${tenantId}`);
  return notified;
}

// ============================================
// SSE ENDPOINT HANDLER
// ============================================

async function handleSSEConnection(req: Request, res: Response): Promise<void> {
  try {
    // Authenticate the request using the same cookie-based auth
    const user = await sdk.authenticateRequest(req);

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Only client_admin and super_admin with tenantId can connect
    if (user.role !== "client_admin" && user.role !== "super_admin" && user.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (!user.tenantId) {
      res.status(403).json({ error: "No tenant associated" });
      return;
    }

    const tenantId = user.tenantId;

    // Set SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    });

    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ tenantId })}\n\n`);

    // Register connection
    addConnection(tenantId, res);

    // Ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      try {
        res.write(`: ping\n\n`);
      } catch {
        clearInterval(pingInterval);
        removeConnection(tenantId, res);
      }
    }, 30_000);

    // Clean up on close
    req.on("close", () => {
      clearInterval(pingInterval);
      removeConnection(tenantId, res);
    });
  } catch (err) {
    console.error("[SSE] Authentication error:", err);
    if (!res.headersSent) {
      res.status(401).json({ error: "Authentication failed" });
    }
  }
}

// ============================================
// REGISTER SSE ROUTES
// ============================================

export function registerSSERoutes(app: Express): void {
  app.get("/api/events/orders", handleSSEConnection);
}

// ============================================
// EXPORT FOR TESTING
// ============================================


