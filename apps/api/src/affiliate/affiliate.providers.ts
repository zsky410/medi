import type { AffiliatePartnerId, PlaceCategory } from "@medi/types";

export interface PartnerConfig {
  id: AffiliatePartnerId;
  name: string;
  emoji: string;
  description: string;
  category: "lodging" | "flights" | "activities";
  envKey: string;
  /** Categories that trigger contextual deals in the itinerary */
  placeCategories: PlaceCategory[];
}

export const PARTNER_CONFIGS: PartnerConfig[] = [
  {
    id: "booking",
    name: "Booking.com",
    emoji: "🏨",
    description: "Khách sạn & homestay",
    category: "lodging",
    envKey: "AFFILIATE_BOOKING_AID",
    placeCategories: ["LODGING"],
  },
  {
    id: "agoda",
    name: "Agoda",
    emoji: "🛏️",
    description: "Giá tốt cho Đông Nam Á",
    category: "lodging",
    envKey: "AFFILIATE_AGODA_CID",
    placeCategories: ["LODGING"],
  },
  {
    id: "viator",
    name: "Viator",
    emoji: "🎫",
    description: "Tour & trải nghiệm",
    category: "activities",
    envKey: "AFFILIATE_VIATOR_PID",
    placeCategories: ["ATTRACTION", "OTHER"],
  },
  {
    id: "klook",
    name: "Klook",
    emoji: "🎟️",
    description: "Vé tham quan & combo",
    category: "activities",
    envKey: "AFFILIATE_KLOOK_AID",
    placeCategories: ["ATTRACTION", "FOOD", "OTHER"],
  },
  {
    id: "traveloka",
    name: "Traveloka",
    emoji: "✈️",
    description: "Vé máy bay & combo",
    category: "flights",
    envKey: "AFFILIATE_TRAVELOKA_AID",
    placeCategories: ["TRANSPORT"],
  },
];

export interface BuildUrlContext {
  destination: string;
  startDate: string;
  endDate: string;
  placeName?: string;
  affiliateId?: string;
}

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

/** Agoda requires numeric cityId — text city name redirects to US homepage. */
const AGODA_CITY_IDS: Record<string, number> = {
  "đà lạt": 15932,
  "da lat": 15932,
  dalat: 15932,
  "tp. hồ chí minh": 13170,
  "ho chi minh": 13170,
  "hồ chí minh": 13170,
  "sài gòn": 13170,
  saigon: 13170,
  "hà nội": 2758,
  "ha noi": 2758,
  hanoi: 2758,
  "đà nẵng": 16440,
  "da nang": 16440,
  "nha trang": 16552,
  "phú quốc": 16557,
  "phu quoc": 16557,
  "hội an": 16528,
  "hoi an": 16528,
  huế: 16524,
  hue: 16524,
  "vũng tàu": 16611,
  "vung tau": 16611,
  bangkok: 9395,
  singapore: 4064,
  bali: 17193,
  tokyo: 5085,
};

function normalizeDestKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function resolveAgodaCityId(destination: string): number | null {
  const raw = destination.split(",")[0].trim().toLowerCase();
  if (AGODA_CITY_IDS[raw]) return AGODA_CITY_IDS[raw];
  const normalized = normalizeDestKey(raw);
  return AGODA_CITY_IDS[normalized] ?? null;
}

export function buildPartnerUrl(partner: AffiliatePartnerId, ctx: BuildUrlContext): string {
  const dest = ctx.destination.split(",")[0].trim();
  const query = ctx.placeName?.trim() || dest;
  const checkin = formatDate(ctx.startDate);
  const checkout = formatDate(ctx.endDate);
  const encoded = encodeURIComponent;

  switch (partner) {
    case "booking": {
      const params = new URLSearchParams({
        ss: query,
        checkin,
        checkout,
      });
      if (ctx.affiliateId) params.set("aid", ctx.affiliateId);
      return `https://www.booking.com/searchresults.html?${params}`;
    }
    case "agoda": {
      const cityId = resolveAgodaCityId(dest);
      const params = new URLSearchParams({
        checkin,
        checkout,
        rooms: "1",
        adults: "2",
        locale: "vi-vn",
      });
      if (cityId) {
        params.set("city", String(cityId));
      } else {
        params.set("textToSearch", query);
      }
      if (ctx.affiliateId) params.set("cid", ctx.affiliateId);
      return `https://www.agoda.com/search?${params}`;
    }
    case "viator": {
      const params = new URLSearchParams({ text: query });
      if (ctx.affiliateId) params.set("pid", ctx.affiliateId);
      return `https://www.viator.com/searchResults/all?${params}`;
    }
    case "klook": {
      const params = new URLSearchParams({ query });
      if (ctx.affiliateId) params.set("aid", ctx.affiliateId);
      return `https://www.klook.com/vi/search/result/?${params}`;
    }
    case "traveloka": {
      const base = `https://www.traveloka.com/vi-vn/flight/fullsearch?ap=${encoded(dest)}`;
      return ctx.affiliateId ? `${base}&utm_source=${encoded(ctx.affiliateId)}` : base;
    }
    default:
      return `https://www.google.com/search?q=${encoded(query)}`;
  }
}

export function partnersForPlaceCategory(category: PlaceCategory): AffiliatePartnerId[] {
  return PARTNER_CONFIGS.filter((p) => p.placeCategories.includes(category)).map((p) => p.id);
}
