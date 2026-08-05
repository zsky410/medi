export interface CheckoutSessionDto {
  url: string;
  provider: "sepay" | "mock";
}

export type ProBillingPeriod = "WEEK" | "MONTH" | "YEAR";

export interface CreateCheckoutInput {
  period?: ProBillingPeriod;
}

export interface SubscriptionDto {
  plan: "FREE" | "PRO";
  provider: "sepay" | "mock" | null;
  renewsAt: string | null;
  cancelAtPeriodEnd: boolean;
  period: ProBillingPeriod | null;
}

export type ProPaymentIntentStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELED";

export interface SepayCheckoutDto {
  id: string;
  status: ProPaymentIntentStatus;
  period: ProBillingPeriod;
  amount: number;
  currency: string;
  checkoutCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrUrl: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface SepayCheckoutStatusDto {
  id: string;
  status: ProPaymentIntentStatus;
  plan: "FREE" | "PRO";
  renewsAt: string | null;
}

export interface SepayWebhookDto {
  id?: string | number;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  code?: string | null;
  content?: string | null;
  transferType?: "in" | "out" | string;
  transferAmount?: number | string;
  accumulated?: number | string;
  subAccount?: string | null;
  referenceCode?: string | null;
  description?: string | null;
}

export const PRO_PLANS = [
  { period: "WEEK", label: "Tuần", durationLabel: "7 ngày", price: 69_000 },
  { period: "MONTH", label: "Tháng", durationLabel: "30 ngày", price: 129_000 },
  { period: "YEAR", label: "Năm", durationLabel: "365 ngày", price: 399_000 },
] as const satisfies ReadonlyArray<{
  period: ProBillingPeriod;
  label: string;
  durationLabel: string;
  price: number;
}>;

export const PRO_PRICE_VND = 399_000;

export const PRO_FEATURES = [
  "Xuất lịch trình sang Google Maps",
  "Xem chuyến đi offline",
  "Tối ưu lộ trình",
  "Đính kèm không giới hạn",
  "AI lên kèo không giới hạn",
  "Hỗ trợ ưu tiên",
] as const;

export const FREE_FEATURES = [
  "Không giới hạn chuyến đi",
  "Không giới hạn thành viên",
  "Lịch trình + bản đồ tô màu theo ngày",
  "Cộng tác thời gian thực",
  "Ngân sách & chia tiền nhóm",
  "Checklist & đồ cần mang",
  "Chia sẻ lịch trình công khai",
] as const;
