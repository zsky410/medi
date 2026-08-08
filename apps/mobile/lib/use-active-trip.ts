import { useCallback, useEffect, useMemo, useState } from "react";
import type { TripDetailDto, TripDto } from "@medi/types";
import { fetchTripDetail, fetchTrips } from "./api";

function tripTime(trip: TripDto) {
  return new Date(`${trip.startDate}T00:00:00`).getTime();
}

export function pickActiveTrip(trips: TripDto[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sorted = [...trips].sort((a, b) => tripTime(a) - tripTime(b));
  return sorted.find((trip) => tripTime(trip) >= today) ?? sorted[0] ?? null;
}

export function useActiveTripDetail() {
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [detail, setDetail] = useState<TripDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const activeTrip = useMemo(() => pickActiveTrip(trips), [trips]);

  const load = useCallback(async () => {
    setError("");
    const nextTrips = await fetchTrips();
    setTrips(nextTrips);
    const nextActive = pickActiveTrip(nextTrips);
    if (!nextActive) {
      setDetail(null);
      return;
    }
    setDetail(await fetchTripDetail(nextActive.id));
  }, []);

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) => setError(err instanceof Error ? err.message : "Không tải được chuyến đi"))
      .finally(() => setLoading(false));
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load().catch((err) => setError(err instanceof Error ? err.message : "Không tải được chuyến đi"));
    setRefreshing(false);
  }, [load]);

  return { trips, activeTrip, detail, loading, refreshing, error, refresh };
}
