import assert from "node:assert/strict";
import test from "node:test";
import { ForbiddenException } from "@nestjs/common";
import { AdminGuard } from "../src/admin/admin.guard";
import { AdminService } from "../src/admin/admin.service";

const now = new Date("2026-08-03T00:00:00.000Z");

function config(values: Record<string, string | undefined> = {}) {
  return {
    get: <T = string>(key: string): T | undefined => values[key] as T | undefined,
  };
}

function executionContext(user: unknown) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  };
}

test("AdminGuard allows only JWT users with ADMIN system role", () => {
  const guard = new AdminGuard();

  assert.equal(guard.canActivate(executionContext({ id: "admin-1", role: "ADMIN" }) as never), true);
  assert.throws(
    () => guard.canActivate(executionContext({ id: "user-1", role: "USER" }) as never),
    ForbiddenException,
  );
});

test("admin dashboard summarizes SaaS operations", async () => {
  const prisma = {
    user: {
      count: async (args?: unknown) => {
        if (!args) return 42;
        assert.deepEqual(args, { where: { plan: "PRO" } });
        return 7;
      },
    },
    trip: {
      count: async (args?: unknown) => {
        if (!args) return 19;
        assert.deepEqual(args, { where: { visibility: "PUBLIC" } });
        return 5;
      },
    },
    proPaymentIntent: {
      aggregate: async (args: unknown) => {
        assert.deepEqual(args, {
          where: { status: "PAID" },
          _sum: { amount: true },
        });
        return { _sum: { amount: 1_250_000 } };
      },
      count: async (args: unknown) => {
        assert.deepEqual(args, { where: { status: "PENDING" } });
        return 3;
      },
    },
    affiliateClick: { count: async () => 28 },
    guidePurchase: { count: async () => 11 },
  };
  const service = new AdminService(prisma as never, config() as never);

  const dashboard = await service.getDashboard();

  assert.deepEqual(dashboard, {
    totalUsers: 42,
    proUsers: 7,
    totalTrips: 19,
    publicTrips: 5,
    paidRevenue: 1_250_000,
    pendingPayments: 3,
    affiliateClicks: 28,
    guidePurchases: 11,
  });
});

test("admin user plan updates also write an audit log", async () => {
  const calls: unknown[] = [];
  const prisma = {
    user: {
      update: async (args: unknown) => {
        calls.push(args);
        return {
          id: "user-1",
          email: "bao@example.com",
          name: "Bao",
          avatarUrl: null,
          role: "USER",
          plan: "PRO",
          proExpiresAt: now,
          authProvider: "LOCAL",
          defaultCurrency: "VND",
          locale: "vi",
          createdAt: now,
          updatedAt: now,
          aiGenerationsDate: null,
          aiGenerationsCount: 0,
        };
      },
    },
    adminAuditLog: {
      create: async (args: unknown) => {
        calls.push(args);
      },
    },
  };
  const service = new AdminService(prisma as never, config() as never);

  const user = await service.updateUserPlan("admin-1", "user-1", {
    plan: "PRO",
    proExpiresAt: "2026-09-03T00:00:00.000Z",
  });

  assert.equal(user.plan, "PRO");
  assert.deepEqual((calls[0] as { where: unknown }).where, { id: "user-1" });
  assert.deepEqual((calls[0] as { data: unknown }).data, {
    plan: "PRO",
    proExpiresAt: new Date("2026-09-03T00:00:00.000Z"),
  });
  assert.deepEqual(calls[1], {
    data: {
      actorId: "admin-1",
      action: "USER_PLAN_UPDATED",
      targetType: "User",
      targetId: "user-1",
      metadata: { plan: "PRO", proExpiresAt: "2026-09-03T00:00:00.000Z" },
    },
  });
});

test("admin can moderate trips, payments, guides, quota, and system config without exposing secrets", async () => {
  const actions: unknown[] = [];
  const prisma = {
    trip: {
      update: async (args: unknown) => {
        actions.push(args);
        return { id: "trip-1" };
      },
    },
    proPaymentIntent: {
      update: async (args: unknown) => {
        actions.push(args);
        return { id: "intent-1" };
      },
    },
    guide: {
      update: async (args: unknown) => {
        actions.push(args);
        return { id: "guide-1" };
      },
    },
    user: {
      update: async (args: unknown) => {
        actions.push(args);
        return { id: "user-1" };
      },
    },
    adminAuditLog: {
      create: async (args: unknown) => {
        actions.push(args);
      },
    },
  };
  const service = new AdminService(
    prisma as never,
    config({
      GEO_PROVIDER: "goong",
      GOONG_API_KEY: "secret-goong",
      OPENAI_API_KEY: "secret-openai",
      OPENAI_MODEL: "gpt-4o-mini",
      SEPAY_WEBHOOK_SECRET: "secret-sepay",
      AFFILIATE_BOOKING_AID: "booking-aid",
      IMPORT_EMAIL_SECRET: "import-secret",
    }) as never,
  );

  await service.updateTripVisibility("admin-1", "trip-1", { visibility: "PRIVATE" });
  await service.updatePaymentStatus("admin-1", "intent-1", { status: "CANCELED" });
  await service.updateGuideModeration("admin-1", "guide-1", { published: false });
  await service.resetAiQuota("admin-1", "user-1");
  const system = service.getSystemConfig();

  assert.deepEqual(actions[0], { where: { id: "trip-1" }, data: { visibility: "PRIVATE" } });
  assert.deepEqual(actions[2], { where: { id: "intent-1" }, data: { status: "CANCELED" } });
  assert.deepEqual(actions[4], { where: { id: "guide-1" }, data: { published: false } });
  assert.deepEqual(actions[6], {
    where: { id: "user-1" },
    data: { aiGenerationsDate: null, aiGenerationsCount: 0 },
  });
  assert.deepEqual(system, {
    geoProvider: "goong",
    goongConfigured: true,
    openAiConfigured: true,
    openAiModel: "gpt-4o-mini",
    sepayConfigured: true,
    importEmailConfigured: true,
    affiliatePartners: {
      booking: true,
      agoda: false,
      viator: false,
      klook: false,
      traveloka: false,
    },
  });
});
