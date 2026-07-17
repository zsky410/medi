export type PlaceMeta = {
  visited?: boolean;
  startTime?: string;
  endTime?: string;
  costDescription?: string;
};

function storageKey(tripId: string) {
  return `medi:place-meta:${tripId}`;
}

export function loadPlaceMeta(tripId: string): Record<string, PlaceMeta> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(tripId));
    return raw ? (JSON.parse(raw) as Record<string, PlaceMeta>) : {};
  } catch {
    return {};
  }
}

export function savePlaceMeta(tripId: string, meta: Record<string, PlaceMeta>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(tripId), JSON.stringify(meta));
}

export function patchPlaceMeta(tripId: string, placeId: string, patch: Partial<PlaceMeta>) {
  const all = loadPlaceMeta(tripId);
  all[placeId] = { ...all[placeId], ...patch };
  savePlaceMeta(tripId, all);
  return all[placeId];
}
