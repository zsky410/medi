"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
import type { PlaceDto } from "@medi/types";

const GOONG_STYLE = (mapKey?: string) =>
  mapKey ? `https://tiles.goong.io/assets/goong_map_web.json?api_key=${encodeURIComponent(mapKey)}` : null;
const FALLBACK_STYLE = "https://tiles.openfreemap.org/styles/liberty";

const MARKER_BASE =
  "medi-itinerary-marker flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white shadow-lg transition-all duration-200 cursor-pointer";
const MARKER_DEFAULT = `${MARKER_BASE} bg-blue-600 hover:bg-blue-700`;
const MARKER_ACTIVE = `${MARKER_BASE} bg-[#FF6B2C] scale-125 shadow-xl ring-4 ring-[#FF6B2C]/30 z-10`;

export interface ItineraryMapItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  visit_order: number;
}

export interface MapPreviewPin {
  latitude: number;
  longitude: number;
  name?: string;
}

interface MarkerEntry {
  marker: Marker;
  element: HTMLButtonElement;
  item: ItineraryMapItem;
}

export function placesToItineraryItems(places: PlaceDto[]): ItineraryMapItem[] {
  return places
    .filter((p) => p.lat != null && p.lng != null)
    .map((p, index) => ({
      id: p.id,
      name: p.name,
      latitude: p.lat!,
      longitude: p.lng!,
      visit_order: index + 1,
    }));
}

function applyMarkerStyle(element: HTMLButtonElement, isActive: boolean) {
  element.className = isActive ? MARKER_ACTIVE : MARKER_DEFAULT;
}

function createMarkerElement(item: ItineraryMapItem, isActive: boolean): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className = isActive ? MARKER_ACTIVE : MARKER_DEFAULT;
  el.textContent = String(item.visit_order);
  el.setAttribute("aria-label", `${item.visit_order}. ${item.name}`);
  el.title = item.name;
  return el;
}

export function TripMap({
  itineraryItems,
  activeItemId = null,
  focusItemId = null,
  previewPin = null,
  onMarkerClick,
}: {
  itineraryItems: ItineraryMapItem[];
  /** Highlight marker (hover or selection). */
  activeItemId?: string | null;
  /** Pan/zoom map to this item (typically click selection only). */
  focusItemId?: string | null;
  /** Temporary pin while browsing discover search results. */
  previewPin?: MapPreviewPin | null;
  onMarkerClick?: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map());
  const previewMarkerRef = useRef<Marker | null>(null);
  const fittedKeyRef = useRef("");
  const onMarkerClickRef = useRef(onMarkerClick);
  const activeItemIdRef = useRef(activeItemId);
  const focusItemIdRef = useRef(focusItemId);

  onMarkerClickRef.current = onMarkerClick;
  activeItemIdRef.current = activeItemId;
  focusItemIdRef.current = focusItemId;

  // Init map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const goongMapKey = process.env.NEXT_PUBLIC_GOONG_MAP_KEY;
    const style = GOONG_STYLE(goongMapKey) ?? FALLBACK_STYLE;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [106.7, 10.78],
      zoom: 5,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    // The itinerary panel can be resized, so keep MapLibre's canvas in sync.
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current.clear();
      previewMarkerRef.current?.remove();
      previewMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
      fittedKeyRef.current = "";
    };
  }, []);

  // Rebuild markers when itinerary changes (day switch, add/remove places).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const itemsKey = itineraryItems.map((i) => `${i.id}:${i.visit_order}`).join("|");
    const shouldRefit = itemsKey !== fittedKeyRef.current;

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();

    for (const item of itineraryItems) {
      const isActive = item.id === activeItemIdRef.current;
      const el = createMarkerElement(item, isActive);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onMarkerClickRef.current?.(item.id);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([item.longitude, item.latitude])
        .addTo(map);

      markersRef.current.set(item.id, { marker, element: el, item });
    }

    const located = itineraryItems.length > 0;
    if (shouldRefit && located) {
      fittedKeyRef.current = itemsKey;
      const bounds = new maplibregl.LngLatBounds();
      itineraryItems.forEach((item) => bounds.extend([item.longitude, item.latitude]));
      map.fitBounds(bounds, { padding: 72, maxZoom: 14, duration: shouldRefit ? 600 : 0 });
    } else if (!located) {
      fittedKeyRef.current = "";
    }
  }, [itineraryItems]);

  // Highlight active marker (hover or selection).
  useEffect(() => {
    markersRef.current.forEach(({ element }, id) => {
      applyMarkerStyle(element, id === activeItemId);
    });
  }, [activeItemId]);

  // Fly to focused item when user clicks list or marker.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusItemId) return;
    const entry = markersRef.current.get(focusItemId);
    if (!entry) return;

    map.flyTo({
      center: [entry.item.longitude, entry.item.latitude],
      zoom: Math.max(map.getZoom(), 15),
      duration: 700,
      essential: true,
    });
  }, [focusItemId]);

  // Preview pin while discovering places (hover on search result).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    previewMarkerRef.current?.remove();
    previewMarkerRef.current = null;

    if (!previewPin) return;

    const el = document.createElement("div");
    el.className =
      "flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[#FF6B2C] shadow-lg ring-4 ring-[#FF6B2C]/25 animate-pulse";
    el.innerHTML = `<span class="text-lg" aria-hidden="true">📍</span>`;
    if (previewPin.name) el.title = previewPin.name;

    const marker = new maplibregl.Marker({ element: el, anchor: "center" })
      .setLngLat([previewPin.longitude, previewPin.latitude])
      .addTo(map);
    previewMarkerRef.current = marker;

    map.flyTo({
      center: [previewPin.longitude, previewPin.latitude],
      zoom: Math.max(map.getZoom(), 15),
      duration: 650,
      essential: true,
    });
  }, [previewPin]);

  return <div ref={containerRef} className="h-full w-full" />;
}
