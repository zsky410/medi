"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, MapPin, StickyNote } from "lucide-react";
import type { CreatePlaceInput, GeoSearchResult, PlaceDto } from "@medi/types";
import { api } from "@/lib/api";
import { guessCategory } from "@/lib/place-category";
import { Spinner } from "@/components/ui";
import type { MapPreviewPin } from "@/components/trip/trip-map";

export function DiscoverPlacesBar({
  tripId,
  dayId,
  dayLabel,
  canEdit,
  onPreview,
  onPlaceAdded,
}: {
  tripId: string;
  dayId: string | null;
  dayLabel: string;
  canEdit: boolean;
  onPreview: (pin: MapPreviewPin | null) => void;
  onPlaceAdded: (placeId: string) => void;
}) {
  const queryClient = useQueryClient();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<GeoSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        onPreview(null);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onPreview]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setMessage("");
      onPreview(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setMessage("");
      try {
        const data = await api<GeoSearchResult[]>(`/geo/search?q=${encodeURIComponent(query.trim())}`);
        setResults(data);
        setOpen(true);
        if (data.length === 0) setMessage("Không tìm thấy địa điểm");
      } catch {
        setMessage("Tìm kiếm thất bại");
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, onPreview]);

  const addMutation = useMutation({
    mutationFn: (result: GeoSearchResult) =>
      api<PlaceDto>(`/trips/${tripId}/places`, {
        method: "POST",
        body: JSON.stringify({
          dayId,
          name: result.name,
          lat: result.lat,
          lng: result.lng,
          address: result.address,
          category: guessCategory(result.category),
          providerId: result.providerId,
        } satisfies CreatePlaceInput),
      }),
    onSuccess: (place) => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      setQuery("");
      setResults([]);
      setOpen(false);
      onPreview(null);
      onPlaceAdded(place.id);
    },
  });

  function previewResult(result: GeoSearchResult) {
    onPreview({ latitude: result.lat, longitude: result.lng, name: result.name });
  }

  if (!canEdit) return null;

  return (
    <section className="rounded-2xl border-2 border-[#F3E3D3] bg-white p-4 shadow-sm">
      <h3 className="mb-3 font-display text-sm font-extrabold text-[#2B2118]">Địa điểm khám phá</h3>

      <div ref={rootRef} className="relative">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <MapPin
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A7563]"
              aria-hidden
            />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => {
                if (results.length > 0) setOpen(true);
              }}
              placeholder="Thêm địa điểm"
              className="w-full rounded-full border border-[#E8DDD3] bg-[#F5F5F5] py-2.5 pl-10 pr-4 text-sm font-semibold text-[#2B2118] outline-none placeholder:text-[#8A7563] focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-colors"
            />
          </div>
          <button
            type="button"
            disabled
            title="Sắp ra mắt"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F0F0F0] text-[#8A7563] opacity-60"
            aria-label="Ghi chú"
          >
            <StickyNote size={18} />
          </button>
          <button
            type="button"
            disabled
            title="Sắp ra mắt"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F0F0F0] text-[#8A7563] opacity-60"
            aria-label="Checklist"
          >
            <ClipboardList size={18} />
          </button>
        </div>

        {dayLabel && (
          <p className="mt-2 text-[10px] font-bold text-[#8A7563]">
            Thêm vào: <span className="text-brand-600">{dayLabel}</span>
          </p>
        )}

        {open && (searching || results.length > 0 || message) && (
          <ul
            role="listbox"
            className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-[#F3E3D3] bg-white py-1 shadow-xl"
          >
            {searching && (
              <li className="flex justify-center py-4">
                <Spinner className="size-6" />
              </li>
            )}
            {!searching && message && (
              <li className="px-4 py-3 text-sm font-semibold text-[#8A7563]">{message}</li>
            )}
            {!searching &&
              results.map((r) => (
                <li key={r.providerId}>
                  <button
                    type="button"
                    role="option"
                    className="w-full px-4 py-3 text-left hover:bg-[#FFF4EA] transition-colors cursor-pointer"
                    onMouseEnter={() => previewResult(r)}
                    onMouseLeave={() => onPreview(null)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      previewResult(r);
                      addMutation.mutate(r);
                    }}
                    disabled={addMutation.isPending}
                  >
                    <p className="text-sm font-bold text-[#2B2118]">{r.name}</p>
                    <p className="truncate text-xs font-semibold text-[#8A7563]">{r.address}</p>
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  );
}
