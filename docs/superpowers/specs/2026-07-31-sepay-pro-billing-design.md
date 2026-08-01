# SePay PRO Billing Design

## Goal

Replace the current real PRO checkout path with SePay bank-transfer payment. A user can start a PRO payment, transfer the configured amount with a unique code, and the SePay webhook upgrades the account to `PRO` after a matching incoming transaction is received.

## Scope

- PRO billing only. Creator Shop guide purchases remain unchanged.
- Runtime production checkout uses SePay instead of Stripe.
- A mock checkout fallback may remain for local development when SePay environment variables are missing.
- Existing `User.plan` remains the source of truth for feature access.

## Data Model

Add `ProPaymentIntent`:

- `id`
- `userId`
- `amount`
- `currency`
- `status`: `PENDING`, `PAID`, `EXPIRED`, `CANCELED`
- `checkoutCode`: unique transfer content code, for example `MEDIPRO-ABC123`
- `sepayTransactionId`: unique optional SePay transaction id after payment
- `paidAt`
- `createdAt`
- `updatedAt`

The intent lets the API show payment instructions, poll payment status, and process SePay webhooks idempotently.

## API Flow

`POST /billing/checkout`

- If user is already `PRO`, reject as today.
- If SePay env is configured, create or reuse a pending intent for the user and return a checkout URL under the web app.
- If SePay env is missing in development, keep the mock checkout fallback.

`GET /billing/checkout/:id`

- Authenticated endpoint returning the current user's payment intent details: amount, currency, bank name, account number, account name, checkout code, QR URL if configured, and status.

`GET /billing/checkout/:id/status`

- Authenticated endpoint for polling. Returns `PENDING` or `PAID`; the web app redirects to `/pricing?success=1` after `PAID` or after `user.plan` becomes `PRO`.

`POST /billing/webhook/sepay`

- Public webhook endpoint protected by `SEPAY_WEBHOOK_SECRET`.
- Accepts SePay bank transaction payloads.
- Processes only incoming transfers with enough amount and a matching checkout code.
- Updates the matched intent to `PAID`, stores `sepayTransactionId`, sets `paidAt`, and upgrades the user to `PRO`.
- Duplicate SePay transaction ids return success without repeating side effects.

## Frontend Flow

`/pricing` continues calling `/billing/checkout` and redirecting to the returned URL.

Add `/pricing/sepay/[intentId]`:

- Shows bank name, account number, account holder, amount, transfer content, and QR image when available.
- Polls checkout status every few seconds.
- Shows a paid state and redirects to `/pricing?success=1` when payment is confirmed.

## Configuration

Add to `.env.example`:

- `SEPAY_BANK_NAME`
- `SEPAY_ACCOUNT_NUMBER`
- `SEPAY_ACCOUNT_NAME`
- `SEPAY_WEBHOOK_SECRET`
- `SEPAY_QR_TEMPLATE_URL` optional, using placeholders for amount/content/account if needed.

## Error Handling

- Wrong or missing webhook secret returns `401`.
- Unknown checkout code, outgoing transfers, or underpaid transactions are ignored and return `{ "success": true }` to avoid unnecessary SePay retries.
- User-facing checkout creation errors stay Vietnamese and actionable.

## Testing

- Checkout creates/reuses a SePay intent for a free user.
- SePay webhook with a valid incoming transfer upgrades the user to `PRO`.
- Duplicate webhook transaction id is idempotent.
- Wrong code, outgoing transfer, or underpayment does not upgrade the user.
- API build must pass after schema/type changes.
