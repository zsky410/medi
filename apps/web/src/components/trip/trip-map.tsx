"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
import type { PlaceDto } from "@medi/types";
import { dayColor } from "@/lib/format";

const GOONG_STYLE = (mapKey?: string) =>
  mapKey ? `https://tiles.goong.io/assets/goong_map_web.json?api_key=${encodeURIComponent(mapKey)}` : null;
const FALLBACK_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const UNASSIGNED_COLOR = "#8A7563";

// NOTE: MapLibre positions markers by writing `transform: translate(...)` onto
// this element every frame. Transitioning `transform` (e.g. `transition-all`)
// makes the marker lag/float behind the map instead of staying pinned, so we
// only transition color/shadow and avoid transform-based scaling here.
const MARKER_BASE =
  "medi-itinerary-marker flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white shadow-lg transition-[box-shadow] duration-200 cursor-pointer";

export interface ItineraryMapItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  visit_order: number;
  color: string;
}

export interface MapPreviewPin {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface LodgingMapPin {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface RoutePath {
  /** Ordered [lng, lat] pairs of the day's road route. */
  coordinates: [number, number][];
  color: string;
}

const ROUTE_SOURCE_ID = "medi-route-path";
const ROUTE_LAYER_ID = "medi-route-path-line";
const ROUTE_CASING_LAYER_ID = "medi-route-path-casing";
const EMPTY_FEATURE_COLLECTION = {
  type: "FeatureCollection" as const,
  features: [],
};

const BED_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>';

interface MarkerEntry {
  marker: Marker;
  element: HTMLButtonElement;
  item: ItineraryMapItem;
}

/** Flat list helper (keeps day-order STT when callers pass a single day). */
export function placesToItineraryItems(
  places: PlaceDto[],
  color: string = "#2563eb",
): ItineraryMapItem[] {
  return places
    .filter((p) => p.lat != null && p.lng != null)
    .map((p, index) => ({
      id: p.id,
      name: p.name,
      latitude: p.lat!,
      longitude: p.lng!,
      visit_order: index + 1,
      color,
    }));
}

/** All trip places for the map — STT + colors match itinerary columns. */
export function tripPlacesToMapItems(
  days: { places: PlaceDto[] }[],
  unassignedPlaces: PlaceDto[] = [],
): ItineraryMapItem[] {
  const items: ItineraryMapItem[] = [];

  unassignedPlaces
    .filter((p) => p.lat != null && p.lng != null)
    .forEach((p, index) => {
      items.push({
        id: p.id,
        name: p.name,
        latitude: p.lat!,
        longitude: p.lng!,
        visit_order: index + 1,
        color: UNASSIGNED_COLOR,
      });
    });

  days.forEach((day, dayIdx) => {
    const color = dayColor(dayIdx);
    day.places
      .filter((p) => p.lat != null && p.lng != null)
      .forEach((p, index) => {
        items.push({
          id: p.id,
          name: p.name,
          latitude: p.lat!,
          longitude: p.lng!,
          visit_order: index + 1,
          color,
        });
      });
  });

  return items;
}

// IMPORTANT: only toggle our own classes / inline styles here. Never reassign
// `element.className`, because MapLibre adds its own `maplibregl-marker` class
// (which provides `position:absolute; left:0; top:0; will-change:transform`).
// Wiping it detaches the marker from absolute positioning and makes it drift on
// zoom/pan.
function applyMarkerStyle(element: HTMLButtonElement, color: string, isActive: boolean) {
  element.classList.toggle("z-10", isActive);
  element.style.backgroundColor = color;
  element.style.boxShadow = isActive
    ? `0 0 0 4px ${color}59, 0 10px 15px -3px rgb(0 0 0 / 0.2)`
    : "";
}

function createMarkerElement(item: ItineraryMapItem, isActive: boolean): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className = MARKER_BASE;
  el.textContent = String(item.visit_order);
  el.setAttribute("aria-label", `${item.visit_order}. ${item.name}`);
  el.title = item.name;
  applyMarkerStyle(el, item.color, isActive);
  return el;
}

function createLodgingMarkerElement(pin: LodgingMapPin): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className =
    "medi-lodging-marker flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-white shadow-lg cursor-pointer";
  el.style.backgroundColor = "#7C3AED";
  el.title = pin.name;
  el.setAttribute("aria-label", `Chỗ ở: ${pin.name}`);
  el.innerHTML = BED_ICON_SVG;
  return el;
}

function routeFeatureCollection(routePath: RoutePath | null) {
  if (!routePath || routePath.coordinates.length < 2) return EMPTY_FEATURE_COLLECTION;
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: { color: routePath.color },
        geometry: { type: "LineString" as const, coordinates: routePath.coordinates },
      },
    ],
  };
}

// Adds the route source + line layers if missing. Must run after every
// `style.load` because switching styles (Goong -> fallback) drops custom layers.
function ensureRouteLayers(map: MLMap, routePath: RoutePath | null) {
  if (!map.getSource(ROUTE_SOURCE_ID)) {
    map.addSource(ROUTE_SOURCE_ID, {
      type: "geojson",
      data: routeFeatureCollection(routePath),
    });
  }
  if (!map.getLayer(ROUTE_CASING_LAYER_ID)) {
    map.addLayer({
      id: ROUTE_CASING_LAYER_ID,
      type: "line",
      source: ROUTE_SOURCE_ID,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#ffffff", "line-width": 7, "line-opacity": 0.9 },
    });
  }
  if (!map.getLayer(ROUTE_LAYER_ID)) {
    map.addLayer({
      id: ROUTE_LAYER_ID,
      type: "line",
      source: ROUTE_SOURCE_ID,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ["get", "color"], "line-width": 4 },
    });
  }
}

function setRoutePathData(map: MLMap, routePath: RoutePath | null) {
  const source = map.getSource(ROUTE_SOURCE_ID);
  if (source && "setData" in source) {
    (source as maplibregl.GeoJSONSource).setData(routeFeatureCollection(routePath));
  }
}

function getMapErrorText(event: unknown): string {
  if (!event || typeof event !== "object") return "";
  const error = "error" in event ? event.error : event;
  if (!error || typeof error !== "object") return "";
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  const url = "url" in error && typeof error.url === "string" ? error.url : "";
  return `${message} ${url}`;
}

export function TripMap({
  itineraryItems,
  lodgingPins = [],
  activeItemId = null,
  focusItemId = null,
  previewPin = null,
  routePath = null,
  onMarkerClick,
}: {
  itineraryItems: ItineraryMapItem[];
  /** Lodging bookings shown with a bed icon (no number). */
  lodgingPins?: LodgingMapPin[];
  /** Highlight marker (hover or selection). */
  activeItemId?: string | null;
  /** Pan/zoom map to this item (typically click selection only). */
  focusItemId?: string | null;
  /** Temporary pin while browsing discover search results. */
  previewPin?: MapPreviewPin | null;
  /** Road route line for the active day (null hides it). */
  routePath?: RoutePath | null;
  onMarkerClick?: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map());
  const lodgingMarkersRef = useRef<Map<string, Marker>>(new Map());
  const previewMarkerRef = useRef<Marker | null>(null);
  const fittedKeyRef = useRef("");
  const onMarkerClickRef = useRef(onMarkerClick);
  const activeItemIdRef = useRef(activeItemId);
  const focusItemIdRef = useRef(focusItemId);
  const routePathRef = useRef(routePath);

  onMarkerClickRef.current = onMarkerClick;
  activeItemIdRef.current = activeItemId;
  focusItemIdRef.current = focusItemId;
  routePathRef.current = routePath;

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

    // Re-add the route source/layers after each style load (initial load and
    // after the Goong -> fallback swap, which drops all custom layers).
    map.on("style.load", () => ensureRouteLayers(map, routePathRef.current));

    let switchedToFallbackStyle = false;
    map.on("error", (event) => {
      if (switchedToFallbackStyle || style === FALLBACK_STYLE) return;
      const errorText = getMapErrorText(event);
      if (!errorText.includes("tiles.goong.io")) return;

      switchedToFallbackStyle = true;
      map.setStyle(FALLBACK_STYLE);
    });

    // The itinerary panel can be resized, so keep MapLibre's canvas in sync.
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current.clear();
      lodgingMarkersRef.current.forEach((marker) => marker.remove());
      lodgingMarkersRef.current.clear();
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

    const itemsKey = itineraryItems
      .map((i) => `${i.id}:${i.visit_order}:${i.color}`)
      .join("|");
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

      const marker = new maplibregl.Marker({
        element: el,
        anchor: "center",
        // Keep the marker glued to its coordinate during zoom/pan instead of
        // snapping to whole pixels (which looks like the pin drifting).
        subpixelPositioning: true,
      })
        .setLngLat([item.longitude, item.latitude])
        .addTo(map);

      markersRef.current.set(item.id, { marker, element: el, item });
    }

    const located = itineraryItems.length > 0;
    if (shouldRefit && located) {
      fittedKeyRef.current = itemsKey;
      const bounds = new maplibregl.LngLatBounds();
      itineraryItems.forEach((item) => bounds.extend([item.longitude, item.latitude]));
      map.fitBounds(bounds, { padding: 72, maxZoom: 14, duration: 600 });
    } else if (!located) {
      fittedKeyRef.current = "";
    }
  }, [itineraryItems]);

  // Lodging bookings (bed icon, no number). Rebuilt when the geocoded set changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    lodgingMarkersRef.current.forEach((marker) => marker.remove());
    lodgingMarkersRef.current.clear();

    for (const pin of lodgingPins) {
      const el = createLodgingMarkerElement(pin);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        map.flyTo({ center: [pin.longitude, pin.latitude], zoom: Math.max(map.getZoom(), 15) });
      });
      const marker = new maplibregl.Marker({
        element: el,
        anchor: "center",
        subpixelPositioning: true,
      })
        .setLngLat([pin.longitude, pin.latitude])
        .addTo(map);
      lodgingMarkersRef.current.set(pin.id, marker);
    }

    // If the trip has no located places yet, still frame the lodging pins.
    if (itineraryItems.length === 0 && lodgingPins.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      lodgingPins.forEach((pin) => bounds.extend([pin.longitude, pin.latitude]));
      map.fitBounds(bounds, { padding: 72, maxZoom: 14, duration: 600 });
    }
  }, [lodgingPins, itineraryItems.length]);

  // Highlight active marker (hover or selection).
  useEffect(() => {
    markersRef.current.forEach(({ element, item }, id) => {
      applyMarkerStyle(element, item.color, id === activeItemId);
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
      "flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[#FF6B2C] shadow-lg ring-4 ring-[#FF6B2C]/25";
    el.innerHTML = `<span class="text-lg" aria-hidden="true">📍</span>`;
    if (previewPin.name) el.title = previewPin.name;

    const marker = new maplibregl.Marker({
      element: el,
      anchor: "center",
      subpixelPositioning: true,
    })
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

  // Draw / update / clear the active day's road route line.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      ensureRouteLayers(map, routePath);
      setRoutePathData(map, routePath);
    };
    if (map.isStyleLoaded()) apply();
    else map.once("style.load", apply);
  }, [routePath]);

  return <div ref={containerRef} className="h-full w-full" />;
}
