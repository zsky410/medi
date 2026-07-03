# Mê Đi (medi) — Travel Planning SaaS

Web app lập kế hoạch du lịch theo nhóm: lịch trình kéo-thả gắn bản đồ, cộng tác thời gian thực, ngân sách & chia tiền, checklist. Freemium theo mô hình Wanderlog.

## Tech stack

| Layer | Công nghệ |
| --- | --- |
| Frontend | Next.js (App Router) · TypeScript · Tailwind CSS · TanStack Query · MapLibre GL · dnd-kit · PWA |
| Backend | NestJS · Prisma · Socket.IO (realtime) · JWT + Google OAuth |
| Data | PostgreSQL · Redis (socket.io pub/sub) |
| Monorepo | pnpm workspaces + Turborepo |

## Cấu trúc

```
apps/web        # Next.js frontend (PWA)
apps/api        # NestJS backend (REST + WebSocket)
apps/mobile     # Expo React Native (MVP scaffold)
packages/types  # Zod schemas + DTO dùng chung FE/BE
packages/config # tsconfig dùng chung
```

## Chạy dev

Yêu cầu: Node 20+, pnpm 9+, Docker.

```bash
# 1. Cài dependencies
pnpm install

# 2. Chạy Postgres + Redis
docker compose up -d

# 3. Cấu hình env
cp .env.example .env
cp .env.example apps/api/.env
echo 'NEXT_PUBLIC_API_URL=http://localhost:4000' > apps/web/.env.local

# 4. Migrate + seed database
pnpm --filter @medi/api db:generate
pnpm --filter @medi/api db:migrate
pnpm --filter @medi/api db:seed

# 5. Chạy cả frontend + backend
pnpm dev
```

- Web: http://localhost:3002
- API: http://localhost:4000

(Postgres chạy ở cổng 5433, Redis ở 6380 để tránh đụng dịch vụ có sẵn trên máy.)

Tài khoản demo (sau khi seed): `demo@medi.app` / `medi1234` và `ban@medi.app` / `medi1234`.

## Tính năng MVP

- Đăng ký / đăng nhập (email + Google OAuth), JWT access/refresh
- CRUD chuyến đi, dashboard
- Lịch trình theo ngày: thêm địa điểm (tìm qua OpenStreetMap/Nominatim hoặc Goong), kéo-thả sắp xếp, ghi chú, chi phí
- Bản đồ MapLibre đồng bộ 2 chiều, marker tô màu theo ngày
- Ngân sách & chia tiền nhóm (ai nợ ai)
- Checklist việc cần làm + đồ cần mang
- Cộng tác: mời qua email hoặc link, phân quyền (chủ / chỉnh sửa / chỉ xem), đồng bộ realtime qua WebSocket
- PWA: cài như app, cache cơ bản

## Pha 2: Chia sẻ công khai + Freemium

- **Chia sẻ lịch trình công khai (viral loop)**: đặt chuyến đi ở chế độ Riêng tư / Ai có link / Công khai. Trang công khai `/t/<tripId>` render SSR kèm OG meta cho mạng xã hội, người xem bấm "Sao chép lịch trình này" để remix về tài khoản của họ (bản sao gồm ngày, địa điểm, checklist).
- **Gói FREE / PRO**: trang `/pricing`, lõi miễn phí mãi mãi. PRO mở khoá:
  - Xuất lộ trình từng ngày sang Google Maps
  - Xem chuyến đi offline (tự lưu snapshot, hiện banner khi mất mạng)
- **Thanh toán**: `BillingModule` hỗ trợ 2 provider:
  - `mock` (mặc định khi chưa có key) — luồng nâng cấp đầy đủ để dev/test
  - `stripe` — điền `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` vào `.env` là dùng Stripe Checkout thật; webhook `POST /billing/webhook/stripe` xử lý nâng cấp/huỷ gói
  - Momo/VNPay: sẽ bổ sung provider tương tự khi có tài khoản merchant

## Geocoding

Mặc định dùng Nominatim (miễn phí, đủ cho dev). Với dữ liệu Việt Nam tốt hơn, đăng ký [Goong.io](https://goong.io) rồi đặt trong `.env`:

```
GEO_PROVIDER=goong
GOONG_API_KEY=your-key
```

## Pha 3: Affiliate booking

- **Đối tác**: Booking.com, Agoda, Viator (+ Klook, Traveloka cho thị trường VN/SEA)
- **Tab Đặt chỗ**: link theo điểm đến & ngày đi của chuyến, gợi ý theo từng địa điểm trong lịch trình
- **Deal trong itinerary**: địa điểm lưu trú / tham quan / di chuyển hiển thị nút "Đặt qua …" ngay trên thẻ
- **Tracking**: mọi link đi qua `GET /affiliate/go` (JWT signed), ghi `AffiliateClick` trước khi redirect sang đối tác
- **Cấu hình**: điền mã affiliate vào `.env` — để trống vẫn dùng được (link thường, không hoa hồng)

```
AFFILIATE_BOOKING_AID=""
AFFILIATE_AGODA_CID=""
AFFILIATE_VIATOR_PID=""
AFFILIATE_KLOOK_AID=""
AFFILIATE_TRAVELOKA_AID=""
```

## Roadmap

Pha 4–6 đã triển khai (xem chi tiết bên dưới). Các hạng mục tiếp theo: thanh toán guide thật, OCR PDF booking, mobile full parity.

## Pha 4: AI Assistant

- **Sinh lịch trình từ prompt**: `/ai` — ví dụ "3 ngày Đà Lạt, 5tr". Tạo trip + ngày + địa điểm + checklist.
- **Gợi ý địa điểm**: panel AI trong tab Lịch trình của chuyến đi (`POST /ai/trips/:id/suggest-places`).
- **Tối ưu lộ trình**: nearest-neighbor trên từng ngày (`POST /ai/trips/:id/optimize-route` hoặc nút trên cột ngày cho PRO).
- **Provider**:
  - `mock` (mặc định) — template địa điểm VN, đủ dev/test
  - `openai` — điền `OPENAI_API_KEY` (+ tuỳ chọn `OPENAI_MODEL`) để dùng GPT thật; fallback về mock khi lỗi
- **Giới hạn FREE**: 3 lượt AI/ngày; PRO không giới hạn

```
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
```

## Pha 5: Social / Creator Shop

- **Khám phá & remix** (Pha 2): `/explore`, `/t/<tripId>` — đã có; Phase 5 mở rộng monetization.
- **Creator Shop**: `/shop` — duyệt guide; `/shop/:id` — chi tiết & mua; `/creator` — đăng guide từ chuyến PUBLIC.
- **Mua guide**: mock/free — buyer nhận bản remix (clone trip) về tài khoản; chưa tích hợp thanh toán thật cho guide có phí.
- **API**: `GET /shop/guides`, `POST /shop/guides`, `POST /shop/guides/:id/purchase`

## Pha 6: Import booking + Mobile

- **Import booking**: panel trong tab Lịch trình — dán nội dung email xác nhận (`POST /trips/:id/import/parse-text`). Parser nhận diện vé máy bay, khách sạn cơ bản; tạo Place + Attachment.
- **Email webhook**: `POST /import/inbound-email` với header `x-import-secret` = `IMPORT_EMAIL_SECRET`, body `{ tripId, text, subject?, from? }`.
- **Mobile app**: `apps/mobile` — Expo scaffold, đăng nhập + danh sách chuyến đi (read-only MVP).

```bash
# Mobile dev (sau pnpm install)
cd apps/mobile && pnpm dev
# Đặt expo.extra.apiUrl trong app.json trỏ tới API (dùng LAN IP trên thiết bị thật)
```

```
IMPORT_EMAIL_SECRET="change-me-import-secret"
```
