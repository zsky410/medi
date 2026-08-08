import type { PublicTripListItemDto, PublicTripsListDto } from "@medi/types";
import { API_URL } from "@/lib/api";

export const PUBLIC_TRIP_FALLBACK_COVER =
  "https://image.vietnam.travel/sites/default/files/2017-06/visitvietnam-3.jpg";

export const PUBLIC_TRIP_DESTINATION_COVERS = {
  daLat: "https://image.vietnam.travel/sites/default/files/2021-05/Da%20Lat%20Travel%20Guide%20Vietnam%20Tourism.jpg",
  daNang: "https://image.vietnam.travel/sites/default/files/2018-10/danang%20travel%20guide.jpg",
  hoiAn: "https://image.vietnam.travel/sites/default/files/2017-07/vietnam-tourism.jpg",
  nhaTrang: "https://image.vietnam.travel/sites/default/files/2021-05/Nha%20Trang%20Travel%20Guide%20Vietnam%20Tourism.jpg",
  ninhBinh: "https://image.vietnam.travel/sites/default/files/2017-06/travel-vietnam-3.jpg",
  haNoi: "https://image.vietnam.travel/sites/default/files/2017-06/vietnam-travel-5.jpg",
  hcm: "https://image.vietnam.travel/sites/default/files/2017-07/vietnam-tourism-4.jpg",
  hue: "https://image.vietnam.travel/sites/default/files/2021-05/Hue%20Travel%20Guide%20Vietnam%20Tourism_0.jpg",
  phuQuoc: "https://image.vietnam.travel/sites/default/files/2021-05/Phu%20Quoc%20Travel%20Guide%20Vietnam%20Tourism_0.jpg",
  haLong: "https://image.vietnam.travel/sites/default/files/2017-06/visitvietnam-3.jpg",
  sapa: "https://image.vietnam.travel/sites/default/files/2021-05/Sapa%20Travel%20Guide%20Vietnam%20Tourism.jpg",
  quyNhon: "https://image.sggp.org.vn/w1000/Uploaded/2026/zfuswurkxr/2023_02_13/eogio-voxk-3579.jpg",
  muiNe: "https://duaelbluiumc3.cloudfront.net/Media/Images/InboundImages/place_to_visit_Vietnam/Mui-Ne-Beach-2.jpg",
  canTho: "https://image.vietnam.travel/sites/default/files/2021-05/Can%20Tho%20Travel%20Guide%20Vietnam%20Tourism_2.jpg",
} as const;

export const PUBLIC_TRIP_CARD_COLORS = ["#FF6B2C", "#FF3D77", "#8B5CF6", "#0EA5E9", "#84CC16", "#FFC93C"];

function normalizeDestination(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d");
}

export function publicTripDestinationCover(destination: string): string {
  const normalized = normalizeDestination(destination);

  if (normalized.includes("da lat")) return PUBLIC_TRIP_DESTINATION_COVERS.daLat;
  if (normalized.includes("da nang")) return PUBLIC_TRIP_DESTINATION_COVERS.daNang;
  if (normalized.includes("hoi an")) return PUBLIC_TRIP_DESTINATION_COVERS.hoiAn;
  if (normalized.includes("nha trang")) return PUBLIC_TRIP_DESTINATION_COVERS.nhaTrang;
  if (normalized.includes("ninh binh") || normalized.includes("tam coc") || normalized.includes("trang an")) {
    return PUBLIC_TRIP_DESTINATION_COVERS.ninhBinh;
  }
  if (normalized.includes("ha noi")) return PUBLIC_TRIP_DESTINATION_COVERS.haNoi;
  if (normalized.includes("tp.hcm") || normalized.includes("ho chi minh") || normalized.includes("sai gon")) {
    return PUBLIC_TRIP_DESTINATION_COVERS.hcm;
  }
  if (normalized.includes("hue")) return PUBLIC_TRIP_DESTINATION_COVERS.hue;
  if (normalized.includes("phu quoc")) return PUBLIC_TRIP_DESTINATION_COVERS.phuQuoc;
  if (normalized.includes("ha long")) return PUBLIC_TRIP_DESTINATION_COVERS.haLong;
  if (normalized.includes("sa pa") || normalized.includes("sapa")) return PUBLIC_TRIP_DESTINATION_COVERS.sapa;
  if (normalized.includes("quy nhon")) return PUBLIC_TRIP_DESTINATION_COVERS.quyNhon;
  if (normalized.includes("mui ne")) return PUBLIC_TRIP_DESTINATION_COVERS.muiNe;
  if (normalized.includes("can tho")) return PUBLIC_TRIP_DESTINATION_COVERS.canTho;

  return PUBLIC_TRIP_FALLBACK_COVER;
}

export function publicTripPreviewCover(trip: Pick<PublicTripListItemDto, "coverImage" | "destination">): string {
  if (trip.coverImage && !/images\.unsplash\.com/i.test(trip.coverImage)) return trip.coverImage;
  return publicTripDestinationCover(trip.destination);
}

export function publicTripDurationLabel(startDate: string, endDate: string): string {
  const days = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000) + 1;
  const nights = Math.max(days - 1, 0);
  return `${nights}N${days}Đ`;
}

export function buildPublicTripsUrl({
  apiUrl = API_URL,
  destination,
  limit,
}: {
  apiUrl?: string;
  destination?: string;
  limit: number;
}): URL | string {
  const params = new URLSearchParams();
  params.set("sort", "cloneCount");
  params.set("limit", String(limit));
  if (destination) params.set("destination", destination);

  if (/^https?:\/\//i.test(apiUrl)) {
    const url = new URL("/public/trips", apiUrl);
    url.search = params.toString();
    return url;
  }

  return `${apiUrl.replace(/\/$/, "")}/public/trips?${params.toString()}`;
}

export async function fetchPublicTrips({
  destination,
  limit,
}: {
  destination?: string;
  limit: number;
}): Promise<PublicTripsListDto> {
  const res = await fetch(buildPublicTripsUrl({ destination, limit }));
  if (!res.ok) throw new Error("Không tải được danh sách kèo");
  return res.json();
}
