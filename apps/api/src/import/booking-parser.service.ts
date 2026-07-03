import { Injectable } from "@nestjs/common";
import type { ParsedBookingItem, PlaceCategory } from "@medi/types";

const FLIGHT_PATTERNS = [
  /(?:flight|chuyến bay|vé máy bay)[:\s]+([A-Z]{2}\s?\d{2,4})/i,
  /(?:mã đặt chỗ|booking ref|confirmation)[:\s#]*([A-Z0-9]{5,8})/i,
  /(?:from|từ|đi)\s+([A-Za-zÀ-ỹ\s]+?)\s+(?:to|đến|tới)\s+([A-Za-zÀ-ỹ\s]+)/i,
];

const HOTEL_PATTERNS = [
  /(?:hotel|khách sạn|resort|homestay)[:\s]+([^\n,]{3,80})/i,
  /(?:check-?in|nhận phòng)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  /(?:confirmation|mã xác nhận)[:\s#]*([A-Z0-9]{5,12})/i,
];

function parseDate(raw: string): string | null {
  const m = raw.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (!m) return null;
  const year = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${year}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

function detectCategory(type: ParsedBookingItem["type"]): PlaceCategory {
  switch (type) {
    case "flight":
    case "transport":
      return "TRANSPORT";
    case "hotel":
      return "LODGING";
    default:
      return "OTHER";
  }
}

@Injectable()
export class BookingParserService {
  parse(text: string): ParsedBookingItem[] {
    const items: ParsedBookingItem[] = [];
    const normalized = text.replace(/\r\n/g, "\n");

    const flightMatch = normalized.match(/(?:vietjet|vietnam airlines|bamboo|jetstar|vna|vj)\s*([A-Z]{2}\s?\d{2,4})?/i);
    const routeMatch = normalized.match(/(?:from|từ)\s+([^\n,]{2,40})\s+(?:to|đến|tới)\s+([^\n,]{2,40})/i);
    if (flightMatch || routeMatch || /chuyến bay|flight confirmation|e-?ticket/i.test(normalized)) {
      const flightNo = flightMatch?.[1]?.replace(/\s/g, "") ?? null;
      const from = routeMatch?.[1]?.trim();
      const to = routeMatch?.[2]?.trim();
      const conf = normalized.match(/(?:confirmation|mã đặt chỗ|booking ref)[:\s#]*([A-Z0-9]{5,10})/i)?.[1] ?? null;
      const dateRaw = normalized.match(/(?:departure|khởi hành|ngày bay)[:\s]+([^\n]{6,20})/i)?.[1];
      items.push({
        type: "flight",
        name: flightNo ? `Chuyến bay ${flightNo}` : from && to ? `${from} → ${to}` : "Chuyến bay",
        note: [from && to ? `${from} → ${to}` : null, flightNo ? `Số hiệu: ${flightNo}` : null].filter(Boolean).join(" · ") || null,
        category: detectCategory("flight"),
        date: dateRaw ? parseDate(dateRaw) : null,
        confirmationCode: conf,
      });
    }

    const hotelRaw =
      normalized.match(/(?:hotel|khách sạn|resort|homestay)[:\s]+([^\n,]{3,80})/i)?.[1]?.trim() ??
      normalized.match(/(?:đã đặt|booked at|reservation at)\s+([^\n,]{3,80})/i)?.[1]?.trim();
    const hotelName = hotelRaw?.split(/\.\s*(?:check-?in|confirmation|mã)/i)[0]?.trim();
    if (hotelName || /check-?in|nhận phòng|booking\.com|agoda/i.test(normalized)) {
      const checkIn = normalized.match(/(?:check-?in|nhận phòng)[:\s]+([^\n]{6,20})/i)?.[1];
      const conf = normalized.match(/(?:confirmation|mã xác nhận|reservation)[:\s#]*([A-Z0-9]{5,12})/i)?.[1] ?? null;
      items.push({
        type: "hotel",
        name: hotelName ?? "Khách sạn",
        note: checkIn ? `Check-in: ${checkIn}` : null,
        category: detectCategory("hotel"),
        date: checkIn ? parseDate(checkIn) : null,
        confirmationCode: conf,
      });
    }

    const trainMatch = normalized.match(/(?:tàu|train|seats?)[:\s]+([^\n,]{3,60})/i);
    if (trainMatch) {
      items.push({
        type: "transport",
        name: trainMatch[1].trim(),
        note: "Vé tàu / xe",
        category: "TRANSPORT",
        date: null,
        confirmationCode: null,
      });
    }

    if (items.length === 0) {
      const lines = normalized.split("\n").map((l) => l.trim()).filter((l) => l.length > 10);
      for (const line of lines.slice(0, 3)) {
        if (/booking|đặt|confirmation|vé|ticket/i.test(line)) {
          items.push({
            type: "other",
            name: line.slice(0, 80),
            note: "Trích từ email xác nhận",
            category: "OTHER",
            date: parseDate(line),
            confirmationCode: line.match(/[A-Z0-9]{6,10}/)?.[0] ?? null,
          });
        }
      }
    }

    return items;
  }
}
