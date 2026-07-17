"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, MapPinned, Trash2, X } from "lucide-react";
import type { CreatePlaceInput, PlaceDto, ReorderPlacesInput, TripDetailDto } from "@medi/types";
import { api } from "@/lib/api";
import { dayColor, formatDayLabel } from "@/lib/format";
import { loadPlaceMeta, patchPlaceMeta, type PlaceMeta } from "@/lib/place-meta";
import { DiscoverPlacesBar } from "@/components/trip/discover-places-bar";
import { PlaceCostModal } from "@/components/trip/place-cost-modal";
import { PlaceItemCard } from "@/components/trip/place-item-card";
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
  children,
  footer,
  canEdit,
  onAdd,
  onOptimize,
}: {
  containerId: string;
  title: string;
  subtitle?: string;
  color?: string;
  placeIds: string[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  canEdit: boolean;
  onAdd?: () => void;
  onOptimize?: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: containerId });
  const isUnassigned = containerId === UNASSIGNED;

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
        {canEdit && (onAdd || onOptimize) && (
          <div className="flex items-center gap-1.5">
            {onOptimize && placeIds.length >= 2 && (
              <button
                onClick={onOptimize}
                className="rounded-full px-2.5 py-1 text-[10px] font-extrabold text-[#8B5CF6] bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
                title="Tối ưu lộ trình PRO"
              >
                ⚡ Tối ưu
              </button>
            )}
            {onAdd && (
              <button
                onClick={onAdd}
                className="rounded-full px-3 py-1 text-xs font-extrabold text-brand-500 bg-[#FFF3EB] hover:bg-[#FFE1CF] border border-[#FFE1CF] transition-colors"
              >
                + Thêm chỗ chơi
              </button>
            )}
          </div>
        )}
      </header>
      <SortableContext items={placeIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`space-y-2.5 rounded-xl transition-colors ${
            isOver ? "bg-brand-50/50 p-1" : ""
          } ${placeIds.length === 0 ? "min-h-16 border-2 border-dashed border-[#F3E3D3] flex items-center justify-center text-xs font-bold text-[#8A7563]/50" : ""}`}
        >
          {placeIds.length === 0 ? (
            <div className="py-4 text-center w-full">
              {isUnassigned ? "Chưa có địa điểm nào. Tìm phía dưới để thêm ✨" : "Chưa có địa điểm nào. Thêm ngay thôi! ✨"}
            </div>
          ) : (
            children
          )}
        </div>
      </SortableContext>
      {footer && <div className="mt-3">{footer}</div>}
    </section>
  );
}

export function ItineraryBoard({
  trip,
  selectedPlaceId,
  onSelectPlace,
  onHoverPlace,
  onAddPlace,
  onEditPlace,
  onPreviewPlace,
  onPlaceAdded,
  isPro = false,
}: {
  trip: TripDetailDto;
  selectedPlaceId: string | null;
  onSelectPlace: (id: string | null) => void;
  onHoverPlace?: (id: string | null) => void;
  onAddPlace: (dayId: string | null, dayLabel: string) => void;
  onEditPlace: (place: PlaceDto) => void;
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trip", trip.id] }),
  });

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

  function renderPlaces(containerId: string) {
    const dayIdx = dayIndexByContainer.get(containerId);
    const color = containerId === UNASSIGNED ? "#8A7563" : dayColor(dayIdx ?? 0);
    return containers[containerId]?.map((placeId, i) => {
      const place = placesById.get(placeId);
      if (!place) return null;
      return (
        <PlaceItemCard
          key={placeId}
          tripId={trip.id}
          place={place}
          color={color}
          label={String(i + 1)}
          expanded={selectedPlaceId === placeId}
          checked={checkedIds.has(placeId)}
          meta={placeMeta[placeId] ?? {}}
          canEdit={canEdit}
          isPro={isPro}
          onToggleCheck={(checked) => toggleChecked(placeId, checked)}
          onSelect={() => handleSelectPlace(placeId)}
          onHoverPlace={onHoverPlace}
          onDelete={() => deleteMutation.mutate(placeId)}
          onMetaChange={(patch) => updatePlaceMeta(placeId, patch)}
          onOpenCost={() => setCostPlace(place)}
        />
      );
    });
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
        {trip.days.map((day, i) => (
          <DayColumn
            key={day.id}
            containerId={day.id}
            title={`Ngày ${i + 1}`}
            subtitle={formatDayLabel(day.date)}
            color={dayColor(i)}
            placeIds={containers[day.id] ?? EMPTY_PLACE_IDS}
            canEdit={canEdit}
            onAdd={() => onAddPlace(day.id, `Ngày ${i + 1} (${formatDayLabel(day.date)})`)}
            onOptimize={isPro && canEdit ? () => optimizeMutation.mutate(day.id) : undefined}
          >
            {renderPlaces(day.id)}
          </DayColumn>
        ))}
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
    </>
  );
}
