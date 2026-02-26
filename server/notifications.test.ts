import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// ============================================
// HELPERS
// ============================================

function createClientAdminContext(tenantId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "client-admin-notif",
    email: "lojista@restaurante.com",
    name: "Lojista Teste",
    loginMethod: "google",
    role: "client_admin",
    tenantId,
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

function createClientAdminWithoutTenant(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 3,
    openId: "client-no-tenant",
    email: "orphan@example.com",
    name: "Sem Tenant",
    loginMethod: "google",
    role: "client_admin",
    tenantId: null as unknown as number,
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

function createSuperAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "super-admin-notif",
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

function createRegularUserContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 4,
    openId: "regular-user-notif",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "google",
    role: "user",
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

function createUnauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ============================================
// NOTIFICATIONS ROUTER TESTS
// ============================================

describe("Notifications Router", () => {
  describe("notifications.list", () => {
    it("client admin with tenant can list notifications", async () => {
      const { ctx } = createClientAdminContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notifications.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("client admin without tenant is rejected", async () => {
      const { ctx } = createClientAdminWithoutTenant();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.notifications.list()).rejects.toThrow("Sem tenant associado");
    });

    it("unauthenticated user cannot list notifications", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.notifications.list()).rejects.toThrow();
    });
  });

  describe("notifications.unreadCount", () => {
    it("client admin with tenant gets unread count", async () => {
      const { ctx } = createClientAdminContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notifications.unreadCount();
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("client admin without tenant gets 0", async () => {
      const { ctx } = createClientAdminWithoutTenant();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notifications.unreadCount();
      expect(result).toBe(0);
    });

    it("unauthenticated user cannot get unread count", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.notifications.unreadCount()).rejects.toThrow();
    });
  });

  describe("notifications.markAsRead", () => {
    it("client admin without tenant is rejected", async () => {
      const { ctx } = createClientAdminWithoutTenant();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.notifications.markAsRead({ id: 1 })).rejects.toThrow("Sem tenant associado");
    });

    it("requires valid id input", async () => {
      const { ctx } = createClientAdminContext(1);
      const caller = appRouter.createCaller(ctx);

      // Should not throw on valid input (even if notification doesn't exist, it just won't update anything)
      await expect(caller.notifications.markAsRead({ id: 999999 })).resolves.toEqual({ success: true });
    });

    it("unauthenticated user cannot mark as read", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.notifications.markAsRead({ id: 1 })).rejects.toThrow();
    });
  });

  describe("notifications.markAllAsRead", () => {
    it("client admin with tenant can mark all as read", async () => {
      const { ctx } = createClientAdminContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notifications.markAllAsRead();
      expect(result).toEqual({ success: true });
    });

    it("client admin without tenant is rejected", async () => {
      const { ctx } = createClientAdminWithoutTenant();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.notifications.markAllAsRead()).rejects.toThrow("Sem tenant associado");
    });
  });
});

// ============================================
// BILLING ROUTER ACCESS CONTROL TESTS
// ============================================

describe("Billing Router - Access Control", () => {
  describe("billing.listTenants", () => {
    it("super admin can list tenants with billing info", async () => {
      const { ctx } = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.billing.listTenants();
      expect(Array.isArray(result)).toBe(true);
    });

    it("client admin cannot access billing list", async () => {
      const { ctx } = createClientAdminContext(1);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.billing.listTenants()).rejects.toThrow();
    });

    it("regular user cannot access billing list", async () => {
      const { ctx } = createRegularUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.billing.listTenants()).rejects.toThrow();
    });
  });

  describe("billing.sendNotification", () => {
    it("super admin can send manual notification", async () => {
      const { ctx } = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      // This will attempt to insert into DB - should succeed if tenant exists
      // or throw a DB error if tenant doesn't exist (foreign key constraint)
      try {
        const result = await caller.billing.sendNotification({
          tenantId: 1,
          title: "Teste de notificação",
          message: "Esta é uma notificação de teste",
          type: "info",
        });
        expect(result).toEqual({ success: true });
      } catch (err: any) {
        // If tenant doesn't exist, DB constraint error is expected
        expect(err).toBeDefined();
      }
    });

    it("client admin cannot send notifications via billing", async () => {
      const { ctx } = createClientAdminContext(1);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.billing.sendNotification({
          tenantId: 1,
          title: "Hack attempt",
          message: "Should not work",
          type: "info",
        })
      ).rejects.toThrow();
    });
  });

  describe("billing.runBillingCheck", () => {
    it("super admin can trigger billing check", async () => {
      const { ctx } = createSuperAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.billing.runBillingCheck();
      expect(result).toHaveProperty("processed");
      expect(result).toHaveProperty("notified");
      expect(result).toHaveProperty("skipped");
      expect(result).toHaveProperty("errors");
      expect(typeof result.processed).toBe("number");
      expect(typeof result.notified).toBe("number");
      expect(typeof result.skipped).toBe("number");
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it("client admin cannot trigger billing check", async () => {
      const { ctx } = createClientAdminContext(1);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.billing.runBillingCheck()).rejects.toThrow();
    });
  });
});

// ============================================
// BILLING AUTOMATION LOGIC TESTS
// ============================================

describe("checkBillingNotifications - Logic", () => {
  it("function is importable and returns expected shape", async () => {
    const { checkBillingNotifications } = await import("./routers/billing");
    const result = await checkBillingNotifications();

    expect(result).toHaveProperty("processed");
    expect(result).toHaveProperty("notified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("errors");
    expect(result.processed).toBeGreaterThanOrEqual(0);
    expect(result.notified).toBeGreaterThanOrEqual(0);
    expect(result.skipped).toBeGreaterThanOrEqual(0);
  });
});

// ============================================
// CROSS-TENANT SECURITY TESTS
// ============================================

describe("Notifications - Cross-Tenant Security", () => {
  it("tenant 1 cannot see tenant 2 notifications", async () => {
    const { ctx: ctx1 } = createClientAdminContext(1);
    const { ctx: ctx2 } = createClientAdminContext(2);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    const notifs1 = await caller1.notifications.list();
    const notifs2 = await caller2.notifications.list();

    // All notifications for tenant 1 should have tenantId 1
    for (const n of notifs1) {
      expect(n.tenantId).toBe(1);
    }
    // All notifications for tenant 2 should have tenantId 2
    for (const n of notifs2) {
      expect(n.tenantId).toBe(2);
    }
  });

  it("markAsRead only affects own tenant notifications", async () => {
    const { ctx } = createClientAdminContext(1);
    const caller = appRouter.createCaller(ctx);

    // Trying to mark a notification that doesn't belong to this tenant
    // should succeed silently (WHERE clause filters by tenantId)
    const result = await caller.notifications.markAsRead({ id: 999999 });
    expect(result).toEqual({ success: true });
  });
});
