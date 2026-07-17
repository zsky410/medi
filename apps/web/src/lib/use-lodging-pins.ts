import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AttachmentDto, GeoAutocompleteResult, GeoSearchResult } from "@medi/types";
import { api } from "@/lib/api";
import { getBookingMetadata, getBookingTitle } from "@/lib/booking-display";
import type { LodgingMapPin } from "@/components/trip/trip-map";

async function geocodeLodging(att: AttachmentDto): Promise<LodgingMapPin | null> {
  const meta = getBookingMetadata(att);
  const title = getBookingTitle(att);
  const query = [title, meta?.address].filter(Boolean).join(", ").trim();
  if (query.length < 2) return null;

  try {
    const results = await api<GeoAutocompleteResult[]>(
      `/geo/autocomplete?q=${encodeURIComponent(query)}`,
    );
    const first = results[0];
    if (!first) return null;

    if (first.lat != null && first.lng != null) {
      return { id: att.id, name: title, latitude: first.lat, longitude: first.lng };
    }

    const detail = await api<GeoSearchResult>(
      `/geo/place?providerId=${encodeURIComponent(first.providerId)}`,
    );
    return { id: att.id, name: title, latitude: detail.lat, longitude: detail.lng };
  } catch {
    return null;
  }
}

/** Geocode lodging bookings so they can be pinned on the map with a bed icon. */
export function useLodgingPins(tripId: string): LodgingMapPin[] {
  const { data: attachments } = useQuery({
    queryKey: ["attachments", tripId],
    queryFn: () => api<AttachmentDto[]>(`/trips/${tripId}/attachments`),
  });

  const lodgings = useMemo(
    () => (attachments ?? []).filter((a) => a.type === "lodging"),
    [attachments],
  );

  const signature = lodgings
    .map((l) => `${l.id}:${l.name ?? ""}:${l.metadata?.address ?? ""}`)
    .join("|");

  const { data } = useQuery({
    queryKey: ["lodging-pins", tripId, signature],
    queryFn: async () => {
      const pins = await Promise.all(lodgings.map(geocodeLodging));
      return pins.filter((p): p is LodgingMapPin => p != null);
    },
    enabled: lodgings.length > 0,
    staleTime: 30 * 60_000,
  });

  return data ?? [];
}
