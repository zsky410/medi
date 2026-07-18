import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DayRouteLegsDto, RouteLegDto } from "@medi/types";
import { api } from "@/lib/api";

/**
 * Real road travel time/distance for a day's legs, keyed by the leg's fromId
 * (the lodging anchor uses ROUTE_LODGING_ID). Refetches when the order changes.
 */
export function useDayRouteLegs(tripId: string, dayId: string, orderedPlaceIds: string[]) {
  const orderKey = orderedPlaceIds.join(",");
  const { data, isError } = useQuery({
    queryKey: ["route-legs", tripId, dayId, orderKey],
    queryFn: () => api<DayRouteLegsDto>(`/trips/${tripId}/places/days/${dayId}/route-legs`),
    enabled: orderedPlaceIds.length > 0,
    staleTime: 10 * 60_000,
  });

  const legsByFrom = useMemo(() => {
    if (!data) return null;
    const map = new Map<string, RouteLegDto>();
    for (const leg of data.legs) map.set(leg.fromId, leg);
    return map;
  }, [data]);

  return { legsByFrom, isError };
}
