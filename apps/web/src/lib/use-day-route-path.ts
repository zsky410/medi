import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DayRoutePathDto } from "@medi/types";
import { api } from "@/lib/api";
import { decodePolyline } from "@/lib/polyline";

/**
 * Real road-route geometry ([lng, lat] coords) for a day, decoded from Goong
 * Directions. Keyed by the ordered place ids so it refetches on reorder/optimize.
 */
export function useDayRoutePath(tripId: string, dayId: string | null, orderedPlaceIds: string[]) {
  const orderKey = orderedPlaceIds.join(",");
  const { data } = useQuery({
    queryKey: ["route-path", tripId, dayId, orderKey],
    queryFn: () => api<DayRoutePathDto>(`/trips/${tripId}/places/days/${dayId}/route-path`),
    enabled: dayId != null && orderedPlaceIds.length >= 2,
    staleTime: 10 * 60_000,
  });

  return useMemo<[number, number][] | null>(() => {
    if (!data?.encodedPolyline) return null;
    const coords = decodePolyline(data.encodedPolyline);
    return coords.length > 0 ? coords : null;
  }, [data]);
}
