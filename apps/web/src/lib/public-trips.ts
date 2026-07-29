import type { PublicTripsListDto } from "@medi/types";
import { API_URL } from "@/lib/api";

export const PUBLIC_TRIP_FALLBACK_COVER =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop&auto=format";

export const PUBLIC_TRIP_CARD_COLORS = ["#FF6B2C", "#FF3D77", "#8B5CF6", "#0EA5E9", "#84CC16", "#FFC93C"];

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
}): URL {
  const url = new URL("/public/trips", apiUrl);
  url.searchParams.set("sort", "cloneCount");
  url.searchParams.set("limit", String(limit));
  if (destination) url.searchParams.set("destination", destination);
  return url;
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
