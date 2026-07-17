"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import type { CreatePlaceInput, GeoAutocompleteResult, GeoSearchResult, PlaceDto } from "@medi/types";
import { api } from "@/lib/api";
import { guessCategory } from "@/lib/place-category";
import { Spinner } from "@/components/ui";
import type { MapPreviewPin } from "@/components/trip/trip-map";

export function DiscoverPlacesBar({
  tripId,
  canEdit,
  onPreview,
  onPlaceAdded,
}: {
  tripId: string;
  canEdit: boolean;
  onPreview: (pin: MapPreviewPin | null) => void;
  onPlaceAdded: (placeId: string) => void;
}) {
  const queryClient = useQueryClient();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const onPreviewRef = useRef(onPreview);
  const onPlaceAddedRef = useRef(onPlaceAdded);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<GeoAutocompleteResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const searchCacheRef = useRef(new Map<string, GeoAutocompleteResult[]>());
  const requestIdRef = useRef(0);
  const wasSearchingRef = useRef(false);

  onPreviewRef.current = onPreview;
  onPlaceAddedRef.current = onPlaceAdded;

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
        onPreviewRef.current(null);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    const requestId = ++requestIdRef.current;
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      setResults((prev) => (prev.length === 0 ? prev : []));
      setMessage((prev) => (prev === "" ? prev : ""));
      setSearching(false);
      // Only clear map preview when the user actually stops an active search —
      // calling setState on the parent on every mount/render causes update loops.
      if (wasSearchingRef.current) {
        wasSearchingRef.current = false;
        onPreviewRef.current(null);
      }
      return;
    }

    wasSearchingRef.current = true;
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setMessage("");
      try {
        const cacheKey = normalizedQuery.toLocaleLowerCase("vi-VN");
        const cached = searchCacheRef.current.get(cacheKey);
        const data =
          cached ??
          (await api<GeoAutocompleteResult[]>(
            `/geo/autocomplete?q=${encodeURIComponent(normalizedQuery)}`,
          ));
        if (!cached && data.length > 0) searchCacheRef.current.set(cacheKey, data);
        if (requestId !== requestIdRef.current) return;
        setResults(data);
        setOpen(true);
        if (data.length === 0) setMessage("Không tìm thấy địa điểm");
      } catch {
        if (requestId !== requestIdRef.current) return;
        setMessage("Tìm kiếm thất bại");
        setResults([]);
      } finally {
        if (requestId === requestIdRef.current) setSearching(false);
      }
    }, 450);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const menuVisible = open && (searching || results.length > 0 || Boolean(message));

  useLayoutEffect(() => {
    if (!menuVisible) return;
    function updatePosition() {
      const rect = inputWrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    }
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [menuVisible]);

  const addMutation = useMutation({
    mutationFn: async (result: GeoAutocompleteResult) => {
      const place =
        result.lat != null && result.lng != null
          ? (result as GeoSearchResult)
          : await api<GeoSearchResult>(`/geo/place?providerId=${encodeURIComponent(result.providerId)}`);
      return api<PlaceDto>(`/trips/${tripId}/places`, {
        method: "POST",
        body: JSON.stringify({
          dayId: null,
          name: place.name,
          lat: place.lat,
          lng: place.lng,
          address: place.address,
          category: guessCategory([place.category, place.name].filter(Boolean).join(" ")),
          providerId: place.providerId,
        } satisfies CreatePlaceInput),
      });
    },
    onSuccess: (place) => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      setQuery("");
      setResults([]);
      setOpen(false);
      onPlaceAddedRef.current(place.id);
    },
  });

  function previewResult(result: GeoAutocompleteResult) {
    if (result.lat == null || result.lng == null) return;
    onPreviewRef.current({ latitude: result.lat, longitude: result.lng, name: result.name });
  }

  if (!canEdit) return null;

  return (
    <div ref={rootRef} className="relative">
      <div ref={inputWrapRef} className="relative">
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

      {menuVisible && menuPos && typeof document !== "undefined" &&
        createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            style={{
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
            }}
            className="z-[1000] max-h-72 overflow-y-auto rounded-2xl border border-[#F3E3D3] bg-white py-1 shadow-xl"
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
                  onMouseLeave={() => onPreviewRef.current(null)}
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
          </ul>,
          document.body,
        )}
    </div>
  );
}
