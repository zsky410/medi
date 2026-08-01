# SePay PRO Billing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace real PRO checkout with SePay bank-transfer payment and webhook confirmation.

**Architecture:** Billing keeps `User.plan` as the feature gate and adds `ProPaymentIntent` for pending SePay transfers. `/billing/checkout` returns a web checkout URL; `/billing/webhook/sepay` validates incoming transactions, matches the checkout code, marks the intent paid, and upgrades the user. The web app adds a SePay waiting page that displays transfer details and polls status.

**Tech Stack:** NestJS, Prisma/PostgreSQL, Next.js App Router, React Query, shared `@medi/types`, Node test runner with `tsx`.

---

## File Structure

- Modify `apps/api/prisma/schema.prisma`: add `ProPaymentIntent` and `ProPaymentIntentStatus`.
- Create `apps/api/prisma/migrations/20260731090000_sepay_pro_billing/migration.sql`: database migration for the intent table and enum.
- Modify `packages/types/src/billing.ts`: add SePay provider and payment intent DTOs.
- Modify `apps/api/src/billing/billing.service.ts`: create SePay checkout, expose intent detail/status, and handle webhook.
- Modify `apps/api/src/billing/billing.controller.ts`: add SePay detail/status/webhook routes.
- Modify `apps/api/src/main.ts`: update raw-body comment to cover payment webhooks generally.
- Modify `.env.example`: add SePay bank and webhook env keys.
- Create `apps/api/test/sepay-pro-billing.test.ts`: focused service tests for checkout and webhook behavior.
- Create `apps/web/src/app/pricing/sepay/[intentId]/page.tsx`: payment instruction and polling page.
- Modify `apps/web/src/app/pricing/page.tsx` and `apps/web/src/components/trip/pro-tools.tsx`: keep checkout redirect compatible with provider `sepay`.
- Modify `apps/web/src/app/settings/page.tsx` only if provider display/portal behavior needs a small SePay label.

## Tasks

### Task 1: API Contract And Schema

- [ ] Add `ProPaymentIntentStatus` and `ProPaymentIntent` to Prisma schema.
- [ ] Add SQL migration with status enum, table, indexes, and unique `checkoutCode`/`sepayTransactionId`.
- [ ] Extend billing DTOs with `provider: "sepay" | "mock"` and intent detail/status shapes.
- [ ] Run `pnpm --filter @medi/api db:generate`.

### Task 2: Red Tests For SePay Billing

- [ ] Create focused tests in `apps/api/test/sepay-pro-billing.test.ts`.
- [ ] Test checkout creates a pending SePay intent for a FREE user.
- [ ] Test checkout reuses the user's existing pending intent.
- [ ] Test valid incoming webhook upgrades user to `PRO` and marks the intent `PAID`.
- [ ] Test duplicate SePay transaction id is idempotent.
- [ ] Test wrong code, outgoing transfer, and underpayment do not upgrade.
- [ ] Run `npx --yes tsx --test test/sepay-pro-billing.test.ts` from `apps/api` and confirm the tests fail for missing implementation.

### Task 3: Billing Service And Controller

- [ ] Add SePay config helpers for bank name, account number, account name, webhook secret, and QR URL generation.
- [ ] Implement `createCheckout` SePay path, keeping mock fallback when SePay env is missing.
- [ ] Implement authenticated intent detail and status methods.
- [ ] Implement `handleSepayWebhook(payload, secret)` with incoming-transfer validation, amount check, checkout-code matching by `code` then `content`, account validation, and idempotent transaction handling.
- [ ] Add `GET /billing/checkout/:id`, `GET /billing/checkout/:id/status`, and `POST /billing/webhook/sepay`.
- [ ] Run the focused SePay API test until it passes.

### Task 4: Frontend SePay Checkout Page

- [ ] Add `/pricing/sepay/[intentId]` client page.
- [ ] Fetch intent detail with auth.
- [ ] Display bank name, account number, account holder, amount, transfer content, and QR image when available.
- [ ] Poll status every few seconds and redirect to `/pricing?success=1` after paid.
- [ ] Update visible payment method labels from Stripe/card wording to SePay/bank transfer.

### Task 5: Verification

- [ ] Run `npx --yes tsx --test test/sepay-pro-billing.test.ts` from `apps/api`.
- [ ] Run `pnpm --filter @medi/api build`.
- [ ] Run `pnpm --filter @medi/web build`.
- [ ] Inspect `git diff` and ensure changes are scoped to SePay billing plus the existing prior shop fix.
