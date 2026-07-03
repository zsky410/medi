"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
import type { PlaceDto } from "@medi/types";

export interface MapPlace extends PlaceDto {
  color: string;
  label: string;
}

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

export function TripMap({
  places,
  selectedPlaceId,
  onSelect,
}: {
  places: MapPlace[];
  selectedPlaceId: string | null;
  onSelect: (placeId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const fittedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [106.7, 10.78], // default: Vietnam
      zoom: 5,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      fittedRef.current = false;
    };
  }, []);

  // Rebuild markers whenever places change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    const located = places.filter((p) => p.lat != null && p.lng != null);
    for (const place of located) {
      const el = document.createElement("button");
      el.className = "medi-marker";
      el.style.cssText = [
        `background:${place.color}`,
        "width:28px;height:28px;border-radius:50% 50% 50% 0",
        "transform:rotate(-45deg)",
        "border:2px solid white",
        "box-shadow:0 2px 6px rgba(0,0,0,.3)",
        "cursor:pointer",
        "display:flex;align-items:center;justify-content:center",
      ].join(";");
      const inner = document.createElement("span");
      inner.textContent = place.label;
      inner.style.cssText = "transform:rotate(45deg);color:white;font-size:11px;font-weight:700";
      el.appendChild(inner);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelect(place.id);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([place.lng!, place.lat!])
        .setPopup(new maplibregl.Popup({ offset: 24, closeButton: false }).setText(place.name))
        .addTo(map);
      markersRef.current.set(place.id, marker);
    }

    if (!fittedRef.current && located.length > 0) {
      fittedRef.current = true;
      const bounds = new maplibregl.LngLatBounds();
      located.forEach((p) => bounds.extend([p.lng!, p.lat!]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 0 });
    }
  }, [places, onSelect]);

  // Fly to the selected place.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlaceId) return;
    const marker = markersRef.current.get(selectedPlaceId);
    if (marker) {
      map.flyTo({ center: marker.getLngLat(), zoom: Math.max(map.getZoom(), 13) });
      marker.togglePopup();
    }
  }, [selectedPlaceId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
