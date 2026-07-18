export interface TravelEstimate {
  minutes: number;
  km: number;
  /** True when the number is an estimate (mock or Haversine fallback). */
  estimated?: boolean;
}

interface TravelPoint {
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Deterministic mock travel estimate between two points, keyed by their ids.
 * Only used as a last-resort fallback when the route-legs API fails.
 */
export function mockTravel(fromKey: string, toKey: string): TravelEstimate {
  const seed = hashString(`${fromKey}->${toKey}`);
  const km = Math.round(((seed % 195) / 10 + 0.6) * 10) / 10;
  const minutes = Math.max(3, Math.round(km * 1.6) + (seed % 6));
  return { minutes, km, estimated: true };
}

/** Vietnamese number format uses a comma as the decimal separator. */
export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} giờ` : `${hours} giờ ${rest} phút`;
}

/**
 * Build a query for a Google Maps directions endpoint. Prefers a readable
 * "name, address" label (so Google shows the place name like in its own UI),
 * and falls back to exact coordinates, then just the name.
 */
function pointQuery(point: TravelPoint): string {
  const name = point.name?.trim();
  const address = point.address?.trim();
  if (name && address) {
    return address.toLowerCase().startsWith(name.toLowerCase()) ? address : `${name}, ${address}`;
  }
  if (address) return address;
  if (name) return name;
  if (point.lat != null && point.lng != null) return `${point.lat},${point.lng}`;
  return "";
}

export function directionsUrl(from: TravelPoint, to: TravelPoint): string {
  const params = new URLSearchParams({
    api: "1",
    origin: pointQuery(from),
    destination: pointQuery(to),
    travelmode: "driving",
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
