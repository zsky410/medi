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
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PlaceDto, PlaceDealDto, ReorderPlacesInput, TripDetailDto } from "@medi/types";
import { api } from "@/lib/api";
import { CATEGORY_LABELS, CATEGORY_EMOJIS, dayColor, daysUntil, formatDayLabel, formatMoney } from "@/lib/format";
import { PlaceDealBanner } from "@/components/trip/place-deal-banner";

const UNASSIGNED = "unassigned";

type Containers = Record<string, string[]>;

function buildContainers(trip: TripDetailDto): Containers {
  const containers: Containers = {
    [UNASSIGNED]: trip.unassignedPlaces.map((p) => p.id),
  };
  for (const day of trip.days) {
    containers[day.id] = day.places.map((p) => p.id);
  }
  return containers;
}

// Category emojis — keys match PlaceCategory from API
const PLACE_CATEGORY_EMOJIS = CATEGORY_EMOJIS;

function PlaceItem({
  place,
  color,
  label,
  selected,
  canEdit,
  deal,
  onSelect,
  onEdit,
  onDelete,
}: {
  place: PlaceDto;
  color: string;
  label: string;
  selected: boolean;
  canEdit: boolean;
  deal?: PlaceDealDto;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: place.id,
    disabled: !canEdit,
  });

  const emoji = PLACE_CATEGORY_EMOJIS[place.category] || "📍";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-start gap-3 rounded-2xl border bg-white p-3.5 transition-all ${
        isDragging ? "z-10 opacity-75 shadow-xl rotate-1 scale-[1.02]" : ""
      } ${selected ? "border-brand-500 ring-4 ring-brand-100 shadow-md" : "border-[#F3E3D3] shadow-sm hover:shadow-md"}`}
    >
      {canEdit && (
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab touch-none text-[#8A7563]/40 hover:text-brand-500 active:cursor-grabbing transition-colors text-lg"
          aria-label="Kéo để sắp xếp"
        >
          ⠿
        </button>
      )}
      <button onClick={onSelect} className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left">
        <span
          className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-display font-extrabold text-white shadow-sm border border-white/20"
          style={{ background: color }}
        >
          {label}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-[#2B2118] group-hover:text-brand-500 transition-colors">{place.name}</span>
          
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {/* Category Emoji Chip */}
            <span className="bg-[#FFF3EB] text-[#2B2118] px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#FFE1CF] flex items-center gap-1">
              <span>{emoji}</span>
              <span>{CATEGORY_LABELS[place.category] ?? place.category}</span>
            </span>

            {/* Cost Sticker */}
            {place.cost ? (
              <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-brand-100">
                💸 {formatMoney(place.cost)}
              </span>
            ) : null}
          </div>

          {/* Yellow sticky note style for notes */}
          {place.note && (
            <span className="mt-2 block bg-[#FFE07D]/30 border-l-4 border-[#FFC93C] px-2.5 py-1.5 rounded-r-xl text-xs font-semibold text-[#2B2118] leading-relaxed">
              📝 {place.note}
            </span>
          )}
          {deal && <PlaceDealBanner deal={deal} />}
        </span>
      </button>
      {canEdit && (
        <span className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={onEdit} className="cursor-pointer rounded-full p-1.5 text-xs text-[#8A7563] hover:bg-[#FFF3EB] hover:text-[#2B2118] transition-colors" aria-label="Sửa">
            ✎
          </button>
          <button onClick={onDelete} className="cursor-pointer rounded-full p-1.5 text-xs text-[#8A7563] hover:bg-red-50 hover:text-red-500 transition-colors" aria-label="Xoá">
            ✕
          </button>
        </span>
      )}
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
  canEdit: boolean;
  onAdd: () => void;
  onOptimize?: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: containerId });
  const isUnassigned = containerId === UNASSIGNED;

  return (
    <section className={`rounded-2xl border-2 p-4 shadow-sm relative overflow-hidden ${
      isUnassigned ? "border-dashed border-[#8A7563]/40 bg-[#FFF9F2]" : "border-[#F3E3D3] bg-white"
    }`}>
      {/* Top decorative notebook spiral line for day columns */}
      {!isUnassigned && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 to-[#FF3D77]/40" />
      )}

      <header className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {color && <span className="size-3.5 rounded-full border border-white shadow-sm" style={{ background: color }} />}
          <h3 className="text-base font-display font-extrabold text-[#2B2118]">{title}</h3>
          {subtitle && <span className="text-xs font-bold text-[#8A7563] bg-[#FFF3EB] px-2 py-0.5 rounded-full">{subtitle}</span>}
        </div>
        {canEdit && (
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
            <button
              onClick={onAdd}
              className="rounded-full px-3 py-1 text-xs font-extrabold text-brand-500 bg-[#FFF3EB] hover:bg-[#FFE1CF] border border-[#FFE1CF] transition-colors"
            >
              + Thêm chỗ chơi
            </button>
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
            <div className="py-4 text-center w-full">Chưa có địa điểm nào. Thêm ngay thôi! ✨</div>
          ) : (
            children
          )}
        </div>
      </SortableContext>
    </section>
  );
}

export function ItineraryBoard({
  trip,
  selectedPlaceId,
  placeDeals,
  onSelectPlace,
  onAddPlace,
  onEditPlace,
  isPro = false,
}: {
  trip: TripDetailDto;
  selectedPlaceId: string | null;
  placeDeals?: Map<string, PlaceDealDto>;
  onSelectPlace: (id: string) => void;
  onAddPlace: (dayId: string | null, dayLabel: string) => void;
  onEditPlace: (place: PlaceDto) => void;
  isPro?: boolean;
}) {
  const queryClient = useQueryClient();
  const canEdit = trip.myRole !== "VIEWER";
  const [containers, setContainers] = useState<Containers>(() => buildContainers(trip));
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!draggingRef.current) setContainers(buildContainers(trip));
  }, [trip]);

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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const reorderMutation = useMutation({
    mutationFn: (input: ReorderPlacesInput) =>
      api(`/trips/${trip.id}/places/reorder`, { method: "PATCH", body: JSON.stringify(input) }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trip", trip.id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (placeId: string) => api(`/trips/${trip.id}/places/${placeId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trip", trip.id] }),
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
        <PlaceItem
          key={placeId}
          place={place}
          color={color}
          label={containerId === UNASSIGNED ? "★" : String(i + 1)}
          selected={selectedPlaceId === placeId}
          canEdit={canEdit}
          deal={placeDeals?.get(placeId)}
          onSelect={() => onSelectPlace(placeId)}
          onEdit={() => onEditPlace(place)}
          onDelete={() => deleteMutation.mutate(placeId)}
        />
      );
    });
  }

  return (
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
        {trip.days.map((day, i) => (
          <DayColumn
            key={day.id}
            containerId={day.id}
            title={`Ngày ${i + 1}`}
            subtitle={formatDayLabel(day.date)}
            color={dayColor(i)}
            placeIds={containers[day.id] ?? []}
            canEdit={canEdit}
            onAdd={() => onAddPlace(day.id, `Ngày ${i + 1} (${formatDayLabel(day.date)})`)}
            onOptimize={isPro && canEdit ? () => optimizeMutation.mutate(day.id) : undefined}
          >
            {renderPlaces(day.id)}
          </DayColumn>
        ))}
        <DayColumn
          containerId={UNASSIGNED}
          title="Đã lưu (chưa xếp ngày) 📂"
          placeIds={containers[UNASSIGNED] ?? []}
          canEdit={canEdit}
          onAdd={() => onAddPlace(null, "Đã lưu")}
        >
          {renderPlaces(UNASSIGNED)}
        </DayColumn>
      </div>
    </DndContext>
  );
}
