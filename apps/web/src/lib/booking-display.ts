import type { AttachmentDto, BookingMetadata } from "@medi/types";
import { formatDate, formatDayLabel, formatMoney } from "@/lib/format";

/** Parse legacy bookings saved as "Name · Mã: ABC · note". */
export function parseLegacyBookingMetadata(name: string | null): BookingMetadata | null {
  if (!name) return null;
  const meta: Partial<BookingMetadata> = {};
  const parts = name.split(" · ").map((p) => p.trim());
  for (const part of parts.slice(1)) {
    if (part.toLowerCase().startsWith("mã:")) {
      meta.confirmationCode = part.slice(3).trim();
    } else if (!meta.note) {
      meta.note = part;
    }
  }
  return Object.keys(meta).length > 0 ? ({ currency: "VND", ...meta } as BookingMetadata) : null;
}

export function getBookingMetadata(att: AttachmentDto): BookingMetadata | null {
  return att.metadata ?? parseLegacyBookingMetadata(att.name);
}

export function getBookingTitle(att: AttachmentDto): string {
  if (att.name) {
    const first = att.name.split(" · ")[0]?.trim();
    if (first) return first;
  }
  return "Đặt chỗ";
}

export function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function formatBookingSchedule(meta: BookingMetadata | null): string | null {
  if (!meta) return null;
  const dateParts: string[] = [];
  if (meta.startDate) dateParts.push(formatDayLabel(meta.startDate));
  if (meta.endDate && meta.endDate !== meta.startDate) dateParts.push(formatDayLabel(meta.endDate));
  const timeParts = [meta.startTime, meta.endTime].filter(Boolean);
  const chunks: string[] = [];
  if (dateParts.length) chunks.push(dateParts.join(" — "));
  if (timeParts.length) chunks.push(timeParts.join(" — "));
  return chunks.length ? chunks.join(" · ") : null;
}

export function formatBookingAmount(meta: BookingMetadata | null): string | null {
  if (!meta?.amount) return null;
  return formatMoney(meta.amount, meta.currency ?? "VND");
}

export function sumBookingAmounts(attachments: AttachmentDto[]): number {
  return attachments.reduce((sum, att) => {
    const amount = getBookingMetadata(att)?.amount;
    return sum + (amount ?? 0);
  }, 0);
}

const LODGING_TYPES = new Set(["lodging"]);
const TRANSPORT_TYPES = new Set(["flight", "train", "car"]);

export function groupBookings(attachments: AttachmentDto[]) {
  const lodging: AttachmentDto[] = [];
  const transport: AttachmentDto[] = [];
  const other: AttachmentDto[] = [];

  for (const att of attachments) {
    if (LODGING_TYPES.has(att.type)) lodging.push(att);
    else if (TRANSPORT_TYPES.has(att.type)) transport.push(att);
    else other.push(att);
  }

  return { lodging, transport, other };
}

export function shortDateRange(meta: BookingMetadata | null): string | null {
  if (!meta?.startDate) return null;
  if (meta.endDate && meta.endDate !== meta.startDate) {
    return `${formatDate(meta.startDate)} – ${formatDate(meta.endDate)}`;
  }
  return formatDate(meta.startDate);
}
