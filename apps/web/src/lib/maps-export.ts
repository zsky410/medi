type LatLng = { lat: number | null; lng: number | null };

/**
 * Ordered "lat,lng" stops for a day: lodging → all located places → lodging
 * (round-trip) when a lodging is known, otherwise just the places in order.
 */
export function buildDayStops(places: LatLng[], lodging?: LatLng | null): string[] {
  const coords = places
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => `${p.lat},${p.lng}`);
  if (coords.length === 0) return [];
  if (lodging?.lat != null && lodging?.lng != null) {
    const stay = `${lodging.lat},${lodging.lng}`;
    return [stay, ...coords, stay];
  }
  return coords;
}

/**
 * Google Maps directions URL covering every stop in order. Uses the official
 * `api=1` format (origin + destination + waypoints) so all intermediate stops
 * are included, not just the first and last.
 */
export function buildMapsUrl(stops: string[]): string | null {
  if (stops.length === 0) return null;
  if (stops.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0])}`;
  }
  const params = new URLSearchParams({
    api: "1",
    origin: stops[0],
    destination: stops[stops.length - 1],
    travelmode: "driving",
  });
  const waypoints = stops.slice(1, -1);
  if (waypoints.length > 0) params.set("waypoints", waypoints.join("|"));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
