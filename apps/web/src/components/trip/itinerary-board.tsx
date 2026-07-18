"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, MapPinned, Trash2, X } from "lucide-react";
import {
  ROUTE_LODGING_ID,
  type AttachmentDto,
  type CreatePlaceInput,
  type PlaceDto,
  type ReorderPlacesInput,
  type RouteLegDto,
  type TripDetailDto,
} from "@medi/types";
import { api, ApiError } from "@/lib/api";
import { getBookingMetadata, getBookingTitle } from "@/lib/booking-display";
import { dayColor, formatDayLabel } from "@/lib/format";
import { loadPlaceMeta, patchPlaceMeta, type PlaceMeta } from "@/lib/place-meta";
import { directionsUrl, mockTravel, type TravelEstimate } from "@/lib/travel";
import { useDayRouteLegs } from "@/lib/use-day-route-legs";
import { Spinner } from "@/components/ui";
import { DiscoverPlacesBar } from "@/components/trip/discover-places-bar";
import { LodgingPinCard } from "@/components/trip/lodging-pin-card";
import { PlaceCostModal } from "@/components/trip/place-cost-modal";
import { PlaceItemCard } from "@/components/trip/place-item-card";
import { UpgradePrompt } from "@/components/trip/pro-tools";
import { TravelSegment } from "@/components/trip/travel-segment";
import type { MapPreviewPin } from "@/components/trip/trip-map";

const UNASSIGNED = "unassigned";
const EMPTY_PLACE_IDS: string[] = [];
const DRAG_ACTIVATION = { distance: 5 } as const;

type Containers = Record<string, string[]>;
type DayTarget = { dayId: string | null; label: string; color: string };

function buildContainers(trip: TripDetailDto): Containers {
  const containers: Containers = {
    [UNASSIGNED]: trip.unassignedPlaces.map((p) => p.id),
  };
  for (const day of trip.days) {
    containers[day.id] = day.places.map((p) => p.id);
  }
  return containers;
}

function containersSignature(trip: TripDetailDto): string {
  const parts = [`${UNASSIGNED}:${trip.unassignedPlaces.map((p) => p.id).join(",")}`];
  for (const day of trip.days) {
    parts.push(`${day.id}:${day.places.map((p) => p.id).join(",")}`);
  }
  return parts.join("|");
}

function containersEqual(a: Containers, b: Containers): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of bKeys) {
    const left = a[key];
    const right = b[key];
    if (!left || !right || left.length !== right.length) return false;
    for (let i = 0; i < left.length; i++) {
      if (left[i] !== right[i]) return false;
    }
  }
  return true;
}

function placeIdsSignature(trip: TripDetailDto): string {
  const ids = [
    ...trip.unassignedPlaces.map((p) => p.id),
    ...trip.days.flatMap((d) => d.places.map((p) => p.id)),
  ];
  return ids.sort().join(",");
}

function DestinationMenu({
  targets,
  onPick,
}: {
  targets: DayTarget[];
  onPick: (dayId: string | null) => void;
}) {
  return (
    <div className="absolute right-0 top-full z-30 mt-1 min-w-[240px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-xl">
      {targets.map((target) => (
        <button
          key={target.dayId ?? UNASSIGNED}
          type="button"
          onClick={() => onPick(target.dayId)}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-semibold text-[#374151] hover:bg-[#F3F4F6] transition-colors"
        >
          <span
            className="size-3.5 shrink-0 rotate-[-45deg] rounded-[50%_50%_50%_0] shadow-sm"
            style={{ background: target.color }}
            aria-hidden
          />
          <span className="truncate">{target.label}</span>
        </button>
      ))}
    </div>
  );
}

function SelectionToolbar({
  count,
  targets,
  busy,
  onCopyTo,
  onMoveTo,
  onDelete,
  onClear,
}: {
  count: number;
  targets: DayTarget[];
  busy: boolean;
  onCopyTo: (dayId: string | null) => void;
  onMoveTo: (dayId: string | null) => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  const [menu, setMenu] = useState<"copy" | "move" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setMenu(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div
      ref={rootRef}
      className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#3F3F46] px-3 py-2.5 text-white shadow-lg"
    >
      <p className="text-sm font-bold">
        {count} địa điểm đã chọn
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <div className="relative">
          <button
            type="button"
            disabled={busy}
            onClick={() => setMenu((m) => (m === "copy" ? null : "copy"))}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold hover:bg-white/10 disabled:opacity-50"
          >
            <Copy size={14} />
            Sao chép đến
          </button>
          {menu === "copy" && (
            <DestinationMenu
              targets={targets}
              onPick={(dayId) => {
                setMenu(null);
                onCopyTo(dayId);
              }}
            />
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            disabled={busy}
            onClick={() => setMenu((m) => (m === "move" ? null : "move"))}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold hover:bg-white/10 disabled:opacity-50"
          >
            <MapPinned size={14} />
            Di chuyển đến
          </button>
          {menu === "move" && (
            <DestinationMenu
              targets={targets}
              onPick={(dayId) => {
                setMenu(null);
                onMoveTo(dayId);
              }}
            />
          )}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold hover:bg-white/10 disabled:opacity-50"
        >
          <Trash2 size={14} />
          Xóa
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg p-1.5 hover:bg-white/10"
          aria-label="Bỏ chọn"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function DayColumn({
  containerId,
  title,
  subtitle,
  color,
  placeIds,
  pinned,
  children,
  footer,
  canEdit,
  onOptimize,
  optimizing = false,
  optimizeLocked = false,
  notice,
}: {
  containerId: string;
  title: string;
  subtitle?: string;
  color?: string;
  placeIds: string[];
  pinned?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  canEdit: boolean;
  onOptimize?: () => void;
  /** Optimization request in flight for this day. */
  optimizing?: boolean;
  /** Non-PRO user: show the PRO badge (click opens the upgrade prompt). */
  optimizeLocked?: boolean;
  /** Inline error/notice shown under the header (e.g. optimize failures). */
  notice?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: containerId });
  const isUnassigned = containerId === UNASSIGNED;
  const hasPinned = Array.isArray(pinned) ? pinned.length > 0 : pinned != null;
  const hasActivities = placeIds.length > 0;
  const hasPlaces = hasActivities || hasPinned;

  return (
    <section className={`rounded-2xl border-2 p-4 shadow-sm relative overflow-hidden ${
      isUnassigned ? "border-dashed border-[#8A7563]/40 bg-[#FFF9F2]" : "border-[#F3E3D3] bg-white"
    }`}>
      {!isUnassigned && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 to-[#FF3D77]/40" />
      )}

      <header className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {color && <span className="size-3.5 rounded-full border border-white shadow-sm" style={{ background: color }} />}
          <h3 className="text-base font-display font-extrabold text-[#2B2118]">{title}</h3>
          {subtitle && <span className="text-xs font-bold text-[#8A7563] bg-[#FFF3EB] px-2 py-0.5 rounded-full">{subtitle}</span>}
        </div>
        {canEdit && onOptimize && (
          <button
            onClick={onOptimize}
            disabled={optimizing}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold text-[#8B5CF6] bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors disabled:opacity-60"
            title="Tối ưu thứ tự địa điểm theo thời gian di chuyển"
          >
            {optimizing ? <Spinner className="size-3.5" /> : <span aria-hidden>⚡</span>}
            Tối ưu lộ trình
            {optimizeLocked && (
              <span className="rounded bg-brand-500 px-1 py-0.5 text-[9px] font-extrabold text-white">
                PRO
              </span>
            )}
          </button>
        )}
      </header>
      {notice && (
        <p className="mb-2.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
          {notice}
        </p>
      )}
      {pinned != null && (
        <div className={`mb-2.5 space-y-2.5 ${canEdit ? "pl-6 pr-9" : ""}`}>{pinned}</div>
      )}
      <SortableContext items={placeIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`space-y-2.5 rounded-xl transition-colors ${
            isOver ? "bg-brand-50/50 p-1" : ""
          } ${!hasPlaces ? "min-h-16 border-2 border-dashed border-[#F3E3D3] flex items-center justify-center text-xs font-bold text-[#8A7563]/50" : ""} ${
            hasPinned && !hasActivities ? "min-h-10" : ""
          }`}
        >
          {!hasPlaces ? (
            <div className="py-4 text-center w-full">
              {isUnassigned ? "Chưa có địa điểm nào. Tìm phía dưới để thêm ✨" : "Chưa có địa điểm nào. Thêm ngay thôi! ✨"}
            </div>
          ) : (
            children
          )}
        </div>
      </SortableContext>
      {footer && <div className={`mt-3 ${canEdit ? "pl-6 pr-9" : ""}`}>{footer}</div>}
    </section>
  );
}

/** Render-prop wrapper so each day column can call the route-legs hook. */
function DayRouteLegsProvider({
  tripId,
  dayId,
  orderedIds,
  children,
}: {
  tripId: string;
  dayId: string;
  orderedIds: string[];
  children: (legs: Map<string, RouteLegDto> | null, failed: boolean) => ReactNode;
}) {
  const { legsByFrom, isError } = useDayRouteLegs(tripId, dayId, orderedIds);
  return <>{children(legsByFrom, isError)}</>;
}

export function ItineraryBoard({
  trip,
  selectedPlaceId,
  onSelectPlace,
  onHoverPlace,
  onPreviewPlace,
  onPlaceAdded,
  isPro = false,
}: {
  trip: TripDetailDto;
  selectedPlaceId: string | null;
  onSelectPlace: (id: string | null) => void;
  onHoverPlace?: (id: string | null) => void;
  onPreviewPlace?: (pin: MapPreviewPin | null) => void;
  onPlaceAdded?: (placeId: string) => void;
  isPro?: boolean;
}) {
  const queryClient = useQueryClient();
  const canEdit = trip.myRole !== "VIEWER";
  const [containers, setContainers] = useState<Containers>(() => buildContainers(trip));
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [placeMeta, setPlaceMeta] = useState<Record<string, PlaceMeta>>(() => loadPlaceMeta(trip.id));
  const [costPlace, setCostPlace] = useState<PlaceDto | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [optimizeError, setOptimizeError] = useState<{ dayId: string; message: string } | null>(null);
  const draggingRef = useRef(false);
  const tripLayoutKey = useMemo(() => containersSignature(trip), [trip]);
  const allPlaceIdsKey = useMemo(() => placeIdsSignature(trip), [trip]);

  useEffect(() => {
    setPlaceMeta(loadPlaceMeta(trip.id));
  }, [trip.id]);

  useEffect(() => {
    if (draggingRef.current) return;
    const next = buildContainers(trip);
    setContainers((prev) => (containersEqual(prev, next) ? prev : next));
  }, [trip, tripLayoutKey]);

  useEffect(() => {
    const valid = new Set(allPlaceIdsKey ? allPlaceIdsKey.split(",") : []);
    setCheckedIds((prev) => {
      if (prev.size === 0) return prev;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (valid.has(id)) next.add(id);
      });
      if (next.size === prev.size) {
        for (const id of prev) {
          if (!next.has(id)) return next;
        }
        return prev;
      }
      return next;
    });
  }, [allPlaceIdsKey]);

  const placesById = useMemo(() => {
    const map = new Map<string, PlaceDto>();
    trip.unassignedPlaces.forEach((p) => map.set(p.id, p));
    trip.days.forEach((d) => d.places.forEach((p) => map.set(p.id, p)));
    return map;
  }, [trip]);

  const { data: attachments } = useQuery({
    queryKey: ["attachments", trip.id],
    queryFn: () => api<AttachmentDto[]>(`/trips/${trip.id}/attachments`),
  });

  const lodgings = useMemo(
    () => (attachments ?? []).filter((a) => a.type === "lodging"),
    [attachments],
  );

  const dayIndexByContainer = useMemo(() => {
    const map = new Map<string, number>();
    trip.days.forEach((d, i) => map.set(d.id, i));
    return map;
  }, [trip]);

  const dayTargets = useMemo<DayTarget[]>(() => {
    const targets: DayTarget[] = [
      { dayId: null, label: "Địa điểm khám phá", color: "#8A7563" },
    ];
    trip.days.forEach((day, i) => {
      targets.push({
        dayId: day.id,
        label: formatDayLabel(day.date),
        color: dayColor(i),
      });
    });
    return targets;
  }, [trip.days]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: DRAG_ACTIVATION }));

  const discoverFooter = useMemo(
    () =>
      canEdit && onPreviewPlace && onPlaceAdded ? (
        <DiscoverPlacesBar
          tripId={trip.id}
          canEdit={canEdit}
          onPreview={onPreviewPlace}
          onPlaceAdded={onPlaceAdded}
        />
      ) : null,
    [trip.id, canEdit, onPreviewPlace, onPlaceAdded],
  );

  const reorderMutation = useMutation({
    mutationFn: (input: ReorderPlacesInput) =>
      api(`/trips/${trip.id}/places/reorder`, { method: "PATCH", body: JSON.stringify(input) }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trip", trip.id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (placeId: string) => api(`/trips/${trip.id}/places/${placeId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trip", trip.id] }),
  });

  const bulkMutation = useMutation({
    mutationFn: async (action: { type: "copy" | "move" | "delete"; dayId?: string | null }) => {
      const ids = [...checkedIds];
      if (ids.length === 0) return;

      if (action.type === "delete") {
        await Promise.all(
          ids.map((placeId) => api(`/trips/${trip.id}/places/${placeId}`, { method: "DELETE" })),
        );
        return;
      }

      if (action.type === "copy") {
        for (const placeId of ids) {
          const place = placesById.get(placeId);
          if (!place) continue;
          await api(`/trips/${trip.id}/places`, {
            method: "POST",
            body: JSON.stringify({
              dayId: action.dayId ?? null,
              name: place.name,
              lat: place.lat,
              lng: place.lng,
              category: place.category,
              address: place.address,
              note: place.note,
              cost: place.cost,
              providerId: place.providerId,
            } satisfies CreatePlaceInput),
          });
        }
        return;
      }

      // move
      const targetKey = action.dayId ?? UNASSIGNED;
      const next: Containers = {};
      for (const [key, list] of Object.entries(containers)) {
        next[key] = list.filter((id) => !checkedIds.has(id));
      }
      next[targetKey] = [...(next[targetKey] ?? []), ...ids];
      setContainers(next);
      const moves = Object.entries(next).flatMap(([containerId, placeIds]) =>
        placeIds.map((placeId, index) => ({
          placeId,
          dayId: containerId === UNASSIGNED ? null : containerId,
          order: index,
        })),
      );
      await api(`/trips/${trip.id}/places/reorder`, {
        method: "PATCH",
        body: JSON.stringify({ moves } satisfies ReorderPlacesInput),
      });
    },
    onSuccess: () => {
      setCheckedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["trip", trip.id] });
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: (dayId: string) =>
      api(`/trips/${trip.id}/places/days/${dayId}/optimize`, { method: "POST" }),
    onSuccess: () => {
      setOptimizeError(null);
      queryClient.invalidateQueries({ queryKey: ["trip", trip.id] });
    },
    onError: (err, dayId) =>
      setOptimizeError({
        dayId,
        message: err instanceof ApiError ? err.message : "Không tối ưu được lộ trình",
      }),
  });
  const optimizingDayId = optimizeMutation.isPending ? optimizeMutation.variables : null;

  function handleOptimize(dayId: string, locatedCount: number) {
    if (!isPro) {
      setUpgradeOpen(true);
      return;
    }
    if (locatedCount < 2) {
      setOptimizeError({
        dayId,
        message: "Cần ít nhất 2 địa điểm có toạ độ trong ngày để tối ưu lộ trình.",
      });
      return;
    }
    setOptimizeError(null);
    optimizeMutation.mutate(dayId);
  }

  const findContainer = useCallback(
    (id: string): string | undefined => {
      if (id in containers) return id;
      return Object.keys(containers).find((key) => containers[key].includes(id));
    },
    [containers],
  );

  function toggleChecked(placeId: string, checked: boolean) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(placeId);
      else next.delete(placeId);
      return next;
    });
  }

  function updatePlaceMeta(placeId: string, patch: Partial<PlaceMeta>) {
    patchPlaceMeta(trip.id, placeId, patch);
    setPlaceMeta((prev) => ({ ...prev, [placeId]: { ...prev[placeId], ...patch } }));
  }

  function handleSelectPlace(placeId: string) {
    onSelectPlace(selectedPlaceId === placeId ? null : placeId);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const from = findContainer(String(active.id));
    const to = findContainer(String(over.id));
    if (!from || !to || from === to) return;

    setContainers((prev) => {
      const fromItems = prev[from].filter((id) => id !== active.id);
      const overIndex = prev[to].indexOf(String(over.id));
      const insertAt = overIndex >= 0 ? overIndex : prev[to].length;
      const toItems = [...prev[to]];
      toItems.splice(insertAt, 0, String(active.id));
      return { ...prev, [from]: fromItems, [to]: toItems };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    draggingRef.current = false;
    const { active, over } = event;
    if (!over) return;
    const from = findContainer(String(active.id));
    const to = findContainer(String(over.id));
    if (!from || !to) return;

    let next = containers;
    if (from === to) {
      const oldIndex = containers[from].indexOf(String(active.id));
      const newIndex = containers[to].indexOf(String(over.id));
      if (oldIndex !== newIndex && newIndex >= 0) {
        next = { ...containers, [from]: arrayMove(containers[from], oldIndex, newIndex) };
        setContainers(next);
      }
    }

    const moves = Object.entries(next).flatMap(([containerId, ids]) =>
      ids.map((placeId, index) => ({
        placeId,
        dayId: containerId === UNASSIGNED ? null : containerId,
        order: index,
      })),
    );
    reorderMutation.mutate({ moves });
  }

  function renderPlaceCard(place: PlaceDto, color: string, label: string) {
    return (
      <PlaceItemCard
        key={place.id}
        tripId={trip.id}
        place={place}
        color={color}
        label={label}
        expanded={selectedPlaceId === place.id}
        checked={checkedIds.has(place.id)}
        meta={placeMeta[place.id] ?? {}}
        canEdit={canEdit}
        isPro={isPro}
        onToggleCheck={(checked) => toggleChecked(place.id, checked)}
        onSelect={() => handleSelectPlace(place.id)}
        onHoverPlace={onHoverPlace}
        onDelete={() => deleteMutation.mutate(place.id)}
        onMetaChange={(patch) => updatePlaceMeta(place.id, patch)}
        onOpenCost={() => setCostPlace(place)}
      />
    );
  }

  function renderLodgingPins() {
    if (lodgings.length === 0) return null;
    return lodgings.map((lodging) => <LodgingPinCard key={lodging.id} lodging={lodging} />);
  }

  /** Leg estimate for a segment: real data when loaded, "…" while loading, mock on failure. */
  function resolveEstimate(
    legs: Map<string, RouteLegDto> | null,
    legsFailed: boolean,
    legFromKey: string,
    mockFrom: string,
    mockTo: string,
  ): TravelEstimate | null {
    const leg = legs?.get(legFromKey);
    if (leg) {
      return {
        minutes: Math.max(1, Math.round(leg.durationSec / 60)),
        km: leg.distanceM / 1000,
        estimated: leg.estimated,
      };
    }
    if (!legs && !legsFailed) return null;
    return mockTravel(mockFrom, mockTo);
  }

  function renderPlaces(
    containerId: string,
    legs: Map<string, RouteLegDto> | null = null,
    legsFailed = false,
  ) {
    const dayIdx = dayIndexByContainer.get(containerId);
    const color = containerId === UNASSIGNED ? "#8A7563" : dayColor(dayIdx ?? 0);
    const ids = containers[containerId] ?? [];
    const isDay = containerId !== UNASSIGNED;
    // Horizontal offset (px) of the place pin centre so the dashed connector
    // lines up under the pins. Larger when the selection checkbox is shown.
    // checkbox(16) + gap(8) + card border(1) + px-3(12) + pin half(8) = 45.
    const connectorLeft = canEdit ? 45 : 21;
    // Mock: treat the first lodging as the day's stay until real per-day
    // lodging assignment lands.
    const dayLodging = isDay ? lodgings[0] : undefined;
    const lodgingLabel = dayLodging ? getBookingTitle(dayLodging) : undefined;
    const lodgingPoint = dayLodging
      ? { name: lodgingLabel ?? "", address: getBookingMetadata(dayLodging)?.address }
      : undefined;

    const nodes: ReactNode[] = [];

    // Leg from the lodging to the first stop of the day.
    if (isDay && dayLodging && lodgingPoint && lodgingLabel) {
      const firstId = ids[0];
      const first = firstId ? placesById.get(firstId) : undefined;
      if (first) {
        nodes.push(
          <TravelSegment
            key="seg-start"
            estimate={resolveEstimate(legs, legsFailed, ROUTE_LODGING_ID, dayLodging.id, first.id)}
            connectorLeft={connectorLeft}
            directionsHref={directionsUrl(lodgingPoint, first)}
          />,
        );
      }
    }

    ids.forEach((placeId, index) => {
      const place = placesById.get(placeId);
      if (!place) return;
      nodes.push(renderPlaceCard(place, color, String(index + 1)));
      if (!isDay) return;

      const nextId = ids[index + 1];
      const next = nextId ? placesById.get(nextId) : undefined;
      if (next) {
        nodes.push(
          <TravelSegment
            key={`seg-${place.id}`}
            estimate={resolveEstimate(legs, legsFailed, place.id, place.id, next.id)}
            connectorLeft={connectorLeft}
            directionsHref={directionsUrl(place, next)}
          />,
        );
      } else if (dayLodging && lodgingPoint && lodgingLabel) {
        nodes.push(
          <TravelSegment
            key={`seg-end-${place.id}`}
            estimate={resolveEstimate(legs, legsFailed, place.id, place.id, dayLodging.id)}
            connectorLeft={connectorLeft}
            directionsHref={directionsUrl(place, lodgingPoint)}
            destinationLabel={lodgingLabel}
          />,
        );
      }
    });
    return nodes;
  }

  return (
    <>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={() => (draggingRef.current = true)}
      onDragCancel={() => {
        draggingRef.current = false;
        setContainers(buildContainers(trip));
      }}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-5 text-left">
        {canEdit && checkedIds.size > 0 && (
          <SelectionToolbar
            count={checkedIds.size}
            targets={dayTargets}
            busy={bulkMutation.isPending}
            onCopyTo={(dayId) => bulkMutation.mutate({ type: "copy", dayId })}
            onMoveTo={(dayId) => bulkMutation.mutate({ type: "move", dayId })}
            onDelete={() => {
              if (window.confirm(`Xóa ${checkedIds.size} địa điểm đã chọn?`)) {
                bulkMutation.mutate({ type: "delete" });
              }
            }}
            onClear={() => setCheckedIds(new Set())}
          />
        )}
        <DayColumn
          containerId={UNASSIGNED}
          title="Địa điểm khám phá"
          placeIds={containers[UNASSIGNED] ?? EMPTY_PLACE_IDS}
          canEdit={canEdit}
          footer={discoverFooter ?? undefined}
        >
          {renderPlaces(UNASSIGNED)}
        </DayColumn>
        {trip.days.map((day, i) => {
          const dayPlaceIds = containers[day.id] ?? EMPTY_PLACE_IDS;
          const locatedCount = dayPlaceIds.filter((id) => {
            const place = placesById.get(id);
            return place?.lat != null && place?.lng != null;
          }).length;
          return (
            <DayColumn
              key={day.id}
              containerId={day.id}
              title={`Ngày ${i + 1}`}
              subtitle={formatDayLabel(day.date)}
              color={dayColor(i)}
              placeIds={dayPlaceIds}
              pinned={renderLodgingPins()}
              canEdit={canEdit}
              onOptimize={() => handleOptimize(day.id, locatedCount)}
              optimizing={optimizingDayId === day.id}
              optimizeLocked={!isPro}
              notice={optimizeError?.dayId === day.id ? optimizeError.message : undefined}
            >
              <DayRouteLegsProvider tripId={trip.id} dayId={day.id} orderedIds={dayPlaceIds}>
                {(legs, failed) => renderPlaces(day.id, legs, failed)}
              </DayRouteLegsProvider>
            </DayColumn>
          );
        })}
      </div>
    </DndContext>
    <PlaceCostModal
      tripId={trip.id}
      place={costPlace}
      costDescription={costPlace ? placeMeta[costPlace.id]?.costDescription : undefined}
      onSaveCostDescription={(description) => {
        if (!costPlace) return;
        updatePlaceMeta(costPlace.id, { costDescription: description });
      }}
      onClose={() => setCostPlace(null)}
    />
    <UpgradePrompt
      open={upgradeOpen}
      onClose={() => setUpgradeOpen(false)}
      feature="Tối ưu lộ trình"
    />
    </>
  );
}
