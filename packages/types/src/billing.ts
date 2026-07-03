export interface CheckoutSessionDto {
  url: string;
  provider: "stripe" | "mock";
}

export interface SubscriptionDto {
  plan: "FREE" | "PRO";
  provider: "stripe" | "mock" | null;
  renewsAt: string | null;
  cancelAtPeriodEnd: boolean;
}

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
