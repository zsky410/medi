"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePlaceInput, GeoAutocompleteResult, GeoSearchResult, PlaceDto } from "@medi/types";
import { api } from "@/lib/api";
import { guessCategory } from "@/lib/place-category";
import { Input, Modal, Spinner } from "@/components/ui";

export function PlaceSearchModal({
  tripId,
  dayId,
  dayLabel,
  open,
  onClose,
}: {
  tripId: string;
  dayId: string | null;
  dayLabel: string;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoAutocompleteResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const searchCacheRef = useRef(new Map<string, GeoAutocompleteResult[]>());
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setMessage("");
    }
  }, [open]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    const requestId = ++requestIdRef.current;
    if (query.trim().length < 2) {
      setResults([]);
      setMessage("");
      setSearching(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const normalizedQuery = query.trim();
      setSearching(true);
      setMessage("");
      try {
        const cacheKey = normalizedQuery.toLocaleLowerCase("vi-VN");
        const cached = searchCacheRef.current.get(cacheKey);
        const data = cached ?? await api<GeoAutocompleteResult[]>(`/geo/autocomplete?q=${encodeURIComponent(normalizedQuery)}`);
        if (!cached && data.length > 0) searchCacheRef.current.set(cacheKey, data);
        if (requestId !== requestIdRef.current) return;
        setResults(data);
        if (data.length === 0) setMessage("Không tìm thấy địa điểm nào");
      } catch {
        if (requestId !== requestIdRef.current) return;
        setMessage("Tìm kiếm thất bại, thử lại sau");
      } finally {
        if (requestId === requestIdRef.current) setSearching(false);
      }
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const addMutation = useMutation({
    mutationFn: async (result: GeoAutocompleteResult) => {
      const place = result.lat != null && result.lng != null
        ? result as GeoSearchResult
        : await api<GeoSearchResult>(`/geo/place?providerId=${encodeURIComponent(result.providerId)}`);
      return api<PlaceDto>(`/trips/${tripId}/places`, {
        method: "POST",
        body: JSON.stringify({
          dayId,
          name: place.name,
          lat: place.lat,
          lng: place.lng,
          address: place.address,
          category: guessCategory(place.category),
          providerId: place.providerId,
        } satisfies CreatePlaceInput),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      onClose();
    },
  });

  const addManually = useMutation({
    mutationFn: () =>
      api<PlaceDto>(`/trips/${tripId}/places`, {
        method: "POST",
        body: JSON.stringify({ dayId, name: query.trim(), category: "OTHER" } satisfies CreatePlaceInput),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      onClose();
    },
  });

  return (
    <Modal open={open} onClose={onClose} title={`Thêm địa điểm — ${dayLabel}`}>
      <Input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm quán ăn, khách sạn, điểm tham quan..."
      />
      <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
        {searching && (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        )}
        {message && !searching && <p className="py-2 text-center text-sm text-stone-500">{message}</p>}
        {results.map((r) => (
          <button
            key={r.providerId}
            onClick={() => addMutation.mutate(r)}
            disabled={addMutation.isPending}
            className="w-full rounded-lg px-3 py-2 text-left hover:bg-brand-50 disabled:opacity-50"
          >
            <p className="text-sm font-semibold text-stone-800">{r.name}</p>
            <p className="truncate text-xs text-stone-500">{r.address}</p>
          </button>
        ))}
        {query.trim().length >= 2 && !searching && (
          <button
            onClick={() => addManually.mutate()}
            disabled={addManually.isPending}
            className="w-full rounded-lg border border-dashed border-stone-300 px-3 py-2 text-left text-sm text-stone-600 hover:bg-stone-50"
          >
            + Thêm thủ công &quot;{query.trim()}&quot;
          </button>
        )}
      </div>
    </Modal>
  );
}
