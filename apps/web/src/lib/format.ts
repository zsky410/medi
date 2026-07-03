const WEEKDAYS = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

/** "2026-08-14" -> "14/08/2026" */
export function formatDate(isoDate: string): string {
  const d = parseLocalDate(isoDate);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/** ISO datetime -> "14/08/2026" */
export function formatDateTime(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  if (Number.isNaN(d.getTime())) return isoDateTime;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/** "2026-08-14" -> "Thứ 6, 14/08/2026" */
export function formatDayLabel(isoDate: string): string {
  const d = parseLocalDate(isoDate);
  return `${WEEKDAYS[d.getDay()]}, ${formatDate(isoDate)}`;
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

/** "2026-07-07" -> "Thg 07 7" */
export function formatShortStayDate(isoDate: string): string {
  const d = parseLocalDate(isoDate);
  return `Thg ${String(d.getMonth() + 1).padStart(2, "0")} ${d.getDate()}`;
}

export function formatMoney(amount: number, currency = "VND"): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(amount);
}

/** Parse API date string (YYYY-MM-DD) as local midnight — avoids UTC off-by-one. */
export function parseLocalDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00`);
}

/** Whole days from today (local) until isoDate; negative if in the past. */
export function daysUntil(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = parseLocalDate(isoDate);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Stable color per day index, used by both itinerary list and map markers. */
export const DAY_COLORS = [
  "#e11d48", "#ea580c", "#ca8a04", "#16a34a", "#0d9488",
  "#0284c7", "#7c3aed", "#c026d3", "#db2777", "#65a30d",
];

export function dayColor(index: number): string {
  return DAY_COLORS[index % DAY_COLORS.length];
}

export const CATEGORY_LABELS: Record<string, string> = {
  ATTRACTION: "Tham quan",
  FOOD: "Ăn uống",
  LODGING: "Lưu trú",
  TRANSPORT: "Di chuyển",
  SHOPPING: "Mua sắm",
  ACTIVITY: "Hoạt động",
  OTHER: "Khác",
};

export const CATEGORY_ICONS: Record<string, string> = {
  ATTRACTION: "◉",
  FOOD: "🍜",
  LODGING: "🛏",
  TRANSPORT: "🚌",
  SHOPPING: "🛍",
  OTHER: "📍",
};

export const CATEGORY_EMOJIS: Record<string, string> = {
  ATTRACTION: "📸",
  FOOD: "🍜",
  LODGING: "🏨",
  TRANSPORT: "🚌",
  SHOPPING: "🛍",
  OTHER: "📍",
};

export const EXPENSE_EMOJIS: Record<string, string> = {
  LODGING: "🏨",
  FOOD: "🍜",
  TRANSPORT: "🚌",
  ACTIVITY: "🎫",
  SHOPPING: "🛍",
  OTHER: "🏷️",
};
