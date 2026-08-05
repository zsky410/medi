import assert from "node:assert/strict";
import test from "node:test";
import { PRO_PRICE_VND } from "@medi/types";
import { SepayWebhookController } from "../src/billing/billing.controller";
import { BillingService } from "../src/billing/billing.service";

const date = new Date("2026-07-31T00:00:00.000Z");

function config(overrides: Record<string, string | undefined> = {}) {
  const values: Record<string, string | undefined> = {
    WEB_URL: "http://localhost:3002",
    API_URL: "http://localhost:4000",
    API_PORT: "4000",
    JWT_ACCESS_SECRET: "test-secret",
    SEPAY_BANK_NAME: "MBBank",
    SEPAY_BANK_ACCOUNT: "123456789",
    SEPAY_ACCOUNT_HOLDER: "CONG TY MEDI",
    SEPAY_WEBHOOK_SECRET: "sepay-secret",
    SEPAY_QR_TEMPLATE: "compact",
    ...overrides,
  };
  return {
    get: <T = string>(key: string): T | undefined => values[key] as T | undefined,
    getOrThrow: <T = string>(key: string): T => {
      const value = values[key];
      if (!value) throw new Error(`Missing ${key}`);
      return value as T;
    },
  };
}

test("SePay checkout creates a pending PRO payment intent for a free user", async () => {
  let createdData: Record<string, unknown> | undefined;
  const prisma = {
    user: {
      findUniqueOrThrow: async () => ({ id: "user-1", email: "bao@example.com", plan: "FREE" }),
    },
    proPaymentIntent: {
      findFirst: async () => null,
      create: async (args: { data: Record<string, unknown> }) => {
        createdData = args.data;
        return {
          id: "intent-1",
          ...args.data,
          createdAt: date,
          paidAt: null,
        };
      },
    },
  };
  const service = new BillingService(prisma as never, config() as never, {} as never);

  const checkout = await service.createCheckout("user-1");

  assert.equal(checkout.provider, "sepay");
  assert.equal(checkout.url, "http://localhost:3002/pricing/sepay/intent-1");
  assert.equal(createdData?.userId, "user-1");
  assert.equal(createdData?.amount, PRO_PRICE_VND);
  assert.equal(createdData?.currency, "VND");
  assert.match(String(createdData?.checkoutCode), /^MEDIPRO[A-Z0-9]{8}$/);
  assert.equal(createdData?.billingPeriod, "YEAR");
  assert.equal(createdData?.durationDays, 365);
});

test("SePay checkout creates weekly and monthly payment intents with their own prices", async () => {
  const created: unknown[] = [];
  const prisma = {
    user: {
      findUniqueOrThrow: async () => ({ id: "user-1", email: "bao@example.com", plan: "FREE" }),
    },
    proPaymentIntent: {
      findFirst: async () => null,
      create: async (args: { data: Record<string, unknown> }) => {
        created.push(args.data);
        return {
          id: `intent-${created.length}`,
          ...args.data,
          createdAt: date,
          paidAt: null,
        };
      },
    },
  };
  const service = new BillingService(prisma as never, config() as never, {} as never);

  await service.createCheckout("user-1", { period: "WEEK" });
  await service.createCheckout("user-1", { period: "MONTH" });

  assert.deepEqual(created.map((item) => ({
    amount: (item as { amount: number }).amount,
    billingPeriod: (item as { billingPeriod: string }).billingPeriod,
    durationDays: (item as { durationDays: number }).durationDays,
  })), [
    { amount: 69_000, billingPeriod: "WEEK", durationDays: 7 },
    { amount: 129_000, billingPeriod: "MONTH", durationDays: 30 },
  ]);
});

test("SePay checkout reuses an existing pending intent for the user", async () => {
  let createCalled = false;
  const prisma = {
    user: {
      findUniqueOrThrow: async () => ({ id: "user-1", email: "bao@example.com", plan: "FREE" }),
    },
    proPaymentIntent: {
      findFirst: async () => ({
        id: "intent-pending",
        userId: "user-1",
        amount: PRO_PRICE_VND,
        currency: "VND",
        billingPeriod: "YEAR",
        durationDays: 365,
        status: "PENDING",
        checkoutCode: "MEDIPROABCDEFGH",
        createdAt: date,
        paidAt: null,
      }),
      create: async () => {
        createCalled = true;
      },
    },
  };
  const service = new BillingService(prisma as never, config() as never, {} as never);

  const checkout = await service.createCheckout("user-1");

  assert.equal(checkout.provider, "sepay");
  assert.equal(checkout.url, "http://localhost:3002/pricing/sepay/intent-pending");
  assert.equal(createCalled, false);
});

test("SePay checkout detail accepts existing env names and generates compact VietQR", async () => {
  const prisma = {
    proPaymentIntent: {
      findFirst: async () => ({
        id: "intent-1",
        userId: "user-1",
        amount: PRO_PRICE_VND,
        currency: "VND",
        billingPeriod: "YEAR",
        durationDays: 365,
        status: "PENDING",
        checkoutCode: "MEDIPROABCDEFGH",
        createdAt: date,
        paidAt: null,
      }),
    },
  };
  const service = new BillingService(prisma as never, config() as never, {} as never);

  const detail = await service.getSepayCheckout("user-1", "intent-1");

  assert.equal(detail.bankName, "MBBank");
  assert.equal(detail.accountNumber, "123456789");
  assert.equal(detail.accountName, "CONG TY MEDI");
  assert.equal(detail.period, "YEAR");
  assert.equal(
    detail.qrUrl,
    "https://img.vietqr.io/image/MBBank-123456789-compact.png?amount=399000&addInfo=MEDIPROABCDEFGH&accountName=CONG%20TY%20MEDI",
  );
});

test("valid SePay incoming webhook upgrades the user and marks the intent paid", async () => {
  const updates: unknown[] = [];
  const prisma = {
    proPaymentIntent: {
      findUnique: async (args: { where: { sepayTransactionId?: string; checkoutCode?: string } }) => {
        if (args.where.sepayTransactionId) return null;
        if (args.where.checkoutCode === "MEDIPROABCDEFGH") {
          return {
            id: "intent-1",
            userId: "user-1",
            amount: PRO_PRICE_VND,
            currency: "VND",
            billingPeriod: "YEAR",
            durationDays: 365,
            status: "PENDING",
            checkoutCode: "MEDIPROABCDEFGH",
            createdAt: date,
            paidAt: null,
          };
        }
        return null;
      },
      update: async (args: unknown) => {
        updates.push(args);
      },
    },
    user: {
      update: async (args: unknown) => {
        updates.push(args);
      },
    },
  };
  const service = new BillingService(prisma as never, config() as never, {} as never);

  await service.handleSepayWebhook(
    {
      id: 9988,
      accountNumber: "123456789",
      code: "MEDIPROABCDEFGH",
      content: "MEDIPROABCDEFGH",
      transferType: "in",
      transferAmount: PRO_PRICE_VND,
    },
    "sepay-secret",
  );

  assert.equal(updates.length, 2);
  assert.deepEqual(updates[0], {
    where: { id: "intent-1" },
    data: {
      status: "PAID",
      sepayTransactionId: "9988",
      paidAt: (updates[0] as { data: { paidAt: Date } }).data.paidAt,
    },
  });
  assert.ok((updates[0] as { data: { paidAt: unknown } }).data.paidAt instanceof Date);
  assert.deepEqual(updates[1], {
    where: { id: "user-1" },
    data: { plan: "PRO", proExpiresAt: (updates[1] as { data: { proExpiresAt: Date } }).data.proExpiresAt },
  });
  assert.ok((updates[1] as { data: { proExpiresAt: unknown } }).data.proExpiresAt instanceof Date);
});

test("valid SePay incoming webhook extends PRO by the paid package duration", async () => {
  const updates: unknown[] = [];
  const prisma = {
    proPaymentIntent: {
      findUnique: async (args: { where: { sepayTransactionId?: string; checkoutCode?: string } }) => {
        if (args.where.sepayTransactionId) return null;
        if (args.where.checkoutCode === "MEDIPROWEEK1234") {
          return {
            id: "intent-week",
            userId: "user-1",
            amount: 69_000,
            currency: "VND",
            billingPeriod: "WEEK",
            durationDays: 7,
            status: "PENDING",
            checkoutCode: "MEDIPROWEEK1234",
            createdAt: date,
            paidAt: null,
            user: { proExpiresAt: new Date("2026-08-10T00:00:00.000Z") },
          };
        }
        return null;
      },
      update: async (args: unknown) => {
        updates.push(args);
      },
    },
    user: {
      update: async (args: unknown) => {
        updates.push(args);
      },
    },
  };
  const service = new BillingService(prisma as never, config() as never, {} as never);

  await service.handleSepayWebhook(
    {
      id: 777,
      accountNumber: "123456789",
      content: "MEDIPROWEEK1234",
      transferType: "in",
      transferAmount: 69_000,
    },
    "sepay-secret",
  );

  assert.deepEqual(updates[1], {
    where: { id: "user-1" },
    data: { plan: "PRO", proExpiresAt: new Date("2026-08-17T00:00:00.000Z") },
  });
});

test("SePay webhook matches bank content when the checkout code loses its dash", async () => {
  const updates: unknown[] = [];
  const prisma = {
    proPaymentIntent: {
      findUnique: async (args: { where: { sepayTransactionId?: string; checkoutCode?: string } }) => {
        if (args.where.sepayTransactionId) return null;
        if (args.where.checkoutCode === "MEDIPROETW505J1") {
          return {
            id: "intent-real",
            userId: "user-1",
            amount: PRO_PRICE_VND,
            currency: "VND",
            billingPeriod: "YEAR",
            durationDays: 365,
            status: "PENDING",
            checkoutCode: "MEDIPROETW505J1",
            createdAt: date,
            paidAt: null,
          };
        }
        return null;
      },
      update: async (args: unknown) => {
        updates.push(args);
      },
    },
    user: {
      update: async (args: unknown) => {
        updates.push(args);
      },
    },
  };
  const service = new BillingService(prisma as never, config() as never, {} as never);

  await service.handleSepayWebhook(
    {
      gateway: "MBBank",
      transactionDate: "2026-08-01 16:33:00",
      accountNumber: "123456789",
      code: null,
      content: "MEDIPROETW505J1 fJ992VP4/942918",
      transferType: "in",
      description: "BankAPINotify MEDIPROETW505J1 fJ992VP4/942918",
      transferAmount: PRO_PRICE_VND,
      referenceCode: "FT26213438881402",
      id: 71061545,
    },
    "sepay-secret",
  );

  assert.equal(updates.length, 2);
  assert.deepEqual(updates[0], {
    where: { id: "intent-real" },
    data: {
      status: "PAID",
      sepayTransactionId: "71061545",
      paidAt: (updates[0] as { data: { paidAt: Date } }).data.paidAt,
    },
  });
  assert.deepEqual(updates[1], {
    where: { id: "user-1" },
    data: { plan: "PRO", proExpiresAt: (updates[1] as { data: { proExpiresAt: Date } }).data.proExpiresAt },
  });
});

test("duplicate SePay transaction id is acknowledged without repeated updates", async () => {
  let updateCalled = false;
  const prisma = {
    proPaymentIntent: {
      findUnique: async (args: { where: { sepayTransactionId?: string } }) =>
        args.where.sepayTransactionId === "9988"
          ? { id: "intent-1", status: "PAID", sepayTransactionId: "9988" }
          : null,
      update: async () => {
        updateCalled = true;
      },
    },
    user: {
      update: async () => {
        updateCalled = true;
      },
    },
  };
  const service = new BillingService(prisma as never, config() as never, {} as never);

  await service.handleSepayWebhook(
    {
      id: 9988,
      accountNumber: "123456789",
      code: "MEDIPROABCDEFGH",
      transferType: "in",
      transferAmount: PRO_PRICE_VND,
    },
    "sepay-secret",
  );

  assert.equal(updateCalled, false);
});

test("SePay webhook ignores wrong code, outgoing transfer, and underpayment", async () => {
  let updateCalled = false;
  const prisma = {
    proPaymentIntent: {
      findUnique: async () => null,
      update: async () => {
        updateCalled = true;
      },
    },
    user: {
      update: async () => {
        updateCalled = true;
      },
    },
  };
  const service = new BillingService(prisma as never, config() as never, {} as never);

  await service.handleSepayWebhook(
    {
      id: 1,
      accountNumber: "123456789",
      code: "UNKNOWN",
      transferType: "in",
      transferAmount: PRO_PRICE_VND,
    },
    "sepay-secret",
  );
  await service.handleSepayWebhook(
    {
      id: 2,
      accountNumber: "123456789",
      code: "MEDIPROABCDEFGH",
      transferType: "out",
      transferAmount: PRO_PRICE_VND,
    },
    "sepay-secret",
  );
  await service.handleSepayWebhook(
    {
      id: 3,
      accountNumber: "123456789",
      code: "MEDIPROABCDEFGH",
      transferType: "in",
      transferAmount: 1000,
    },
    "sepay-secret",
  );

  assert.equal(updateCalled, false);
});

test("/webhooks/sepay alias accepts SePay Authorization Apikey header", async () => {
  const calls: unknown[] = [];
  const controller = new SepayWebhookController({
    handleSepayWebhook: async (payload: unknown, secret: string | undefined) => {
      calls.push({ payload, secret });
    },
  } as never);

  const result = await controller.sepayWebhook(
    { id: 9988, transferType: "in", transferAmount: PRO_PRICE_VND },
    undefined,
    "Apikey sepay-secret",
    undefined,
  );

  assert.deepEqual(result, { success: true });
  assert.deepEqual(calls, [
    {
      payload: { id: 9988, transferType: "in", transferAmount: PRO_PRICE_VND },
      secret: "sepay-secret",
    },
  ]);
});
