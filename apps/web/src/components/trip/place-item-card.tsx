"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  ChevronUp,
  Clock,
  DollarSign,
  GripVertical,
  Paperclip,
  Trash2,
} from "lucide-react";
import type { PlaceDto, UpdatePlaceInput } from "@medi/types";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { PlaceMeta } from "@/lib/place-meta";
import { PlaceTimePopover } from "@/components/trip/place-time-popover";

function PlacePin({ label, color }: { label: string; color: string }) {
  const fontSize = label.length > 1 ? 7.5 : 9;

  return (
    <span className="relative inline-flex h-[22px] w-[16px] shrink-0" aria-hidden>
      <svg viewBox="0 0 16 22" className="h-full w-full drop-shadow-sm" fill="none">
        <path
          d="M8 0C4.69 0 2 2.69 2 6c0 4.6 5.15 11.05 5.86 12 .18.26.48.26.66 0 .71-.95 5.48-7.4 5.48-12 0-3.31-2.69-6-6-6z"
          fill={color}
        />
        <text
          x="8"
          y="7.2"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={fontSize}
          fontWeight="800"
          fontFamily="system-ui, sans-serif"
        >
          {label}
        </text>
      </svg>
    </span>
  );
}

function ActionButton({
  icon: Icon,
  label,
  active,
  onClick,
  trailing,
}: {
  icon: typeof Check;
  label: string;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-xs font-semibold transition-colors ${
        active ? "text-brand-600" : "text-[#6B7280] hover:text-[#374151]"
      }`}
    >
      <Icon size={14} />
      <span>{label}</span>
      {trailing}
    </button>
  );
}

export function PlaceItemCard({
  tripId,
  place,
  color,
  label,
  expanded,
  checked,
  meta,
  canEdit,
  isPro,
  onToggleCheck,
  onSelect,
  onHoverPlace,
  onDelete,
  onMetaChange,
  onOpenCost,
}: {
  tripId: string;
  place: PlaceDto;
  color: string;
  label: string;
  expanded: boolean;
  checked: boolean;
  meta: PlaceMeta;
  canEdit: boolean;
  isPro?: boolean;
  onToggleCheck: (checked: boolean) => void;
  onSelect: () => void;
  onHoverPlace?: (id: string | null) => void;
  onDelete: () => void;
  onMetaChange: (patch: Partial<PlaceMeta>) => void;
  onOpenCost: () => void;
}) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState(place.note ?? "");
  const [timeOpen, setTimeOpen] = useState(false);
  const timeRef = useRef<HTMLDivElement>(null);
  const closeTimePopover = () => setTimeOpen(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: place.id,
    disabled: !canEdit || expanded,
  });

  useEffect(() => {
    setNote(place.note ?? "");
  }, [place.id, place.note]);

  const noteMutation = useMutation({
    mutationFn: (input: UpdatePlaceInput) =>
      api(`/trips/${tripId}/places/${place.id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trip", tripId] }),
  });

  function saveNote() {
    const trimmed = note.trim();
    if (trimmed === (place.note ?? "")) return;
    noteMutation.mutate({ note: trimmed || null });
  }

  const hasTime = Boolean(meta.startTime || meta.endTime);
  const timeLabel = hasTime
    ? meta.startTime && meta.endTime
      ? `${meta.startTime} – ${meta.endTime}`
      : (meta.startTime ?? meta.endTime)!
    : "Thêm giờ";
  const costLabel =
    place.cost != null ? formatMoney(place.cost) : "Thêm chi phí";
  const collapsedBadges = [
    hasTime ? timeLabel : null,
    place.cost != null ? formatMoney(place.cost) : null,
    meta.visited ? "Đã ghé thăm" : null,
  ].filter(Boolean) as string[];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-start gap-2 ${isDragging ? "z-10 opacity-80" : ""}`}
    >
      {canEdit && (
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggleCheck(e.target.checked)}
          className="mt-3 size-4 shrink-0 cursor-pointer rounded border-[#9CA3AF] text-brand-500 focus:ring-brand-200"
          aria-label={`Chọn ${place.name}`}
        />
      )}

      <div
        className={`min-w-0 flex-1 rounded-xl border px-3 py-2.5 transition-colors ${
          expanded || checked
            ? "border-brand-300 bg-white shadow-sm ring-2 ring-brand-100"
            : "border-[#F3E3D3] bg-white hover:border-brand-200 hover:bg-[#FFF9F2]"
        }`}
      >
        <div className="flex items-start gap-2.5">
          {expanded ? (
            <div
              className="min-w-0 flex-1"
              onMouseEnter={() => onHoverPlace?.(place.id)}
              onMouseLeave={() => onHoverPlace?.(null)}
            >
              <div className="flex items-start gap-2.5">
                <button type="button" onClick={onSelect} className="shrink-0">
                  <PlacePin label={label} color={color} />
                </button>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={onSelect}
                    className="text-left text-sm font-bold text-[#374151] hover:text-brand-600"
                  >
                    {place.name}
                  </button>
                  {canEdit ? (
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      onBlur={saveNote}
                      placeholder="Thêm ghi chú, liên kết, v.v. tại đây"
                      rows={2}
                      className="mt-1 w-full resize-none bg-transparent text-sm font-medium text-[#6B7280] outline-none placeholder:text-[#9CA3AF]"
                    />
                  ) : (
                    place.note && (
                      <p className="mt-1 text-sm font-medium text-[#6B7280]">{place.note}</p>
                    )
                  )}

                  {canEdit && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#E5E7EB]/80 pt-2">
                      <ActionButton
                        icon={Check}
                        label="Đánh dấu ghé thăm"
                        active={meta.visited}
                        onClick={() => onMetaChange({ visited: !meta.visited })}
                      />
                      <div ref={timeRef} className="relative">
                        <ActionButton
                          icon={Clock}
                          label={timeLabel}
                          active={Boolean(meta.startTime || meta.endTime)}
                          onClick={() => setTimeOpen((v) => !v)}
                        />
                        {timeOpen && (
                          <PlaceTimePopover
                            anchorRef={timeRef}
                            startTime={meta.startTime}
                            endTime={meta.endTime}
                            onSave={(start, end) => onMetaChange({ startTime: start, endTime: end })}
                            onClose={closeTimePopover}
                          />
                        )}
                      </div>
                      <ActionButton
                        icon={Paperclip}
                        label="Đính kèm"
                        trailing={
                          !isPro ? (
                            <span className="rounded bg-brand-500 px-1 py-0.5 text-[9px] font-extrabold text-white">
                              PRO
                            </span>
                          ) : undefined
                        }
                      />
                      <ActionButton
                        icon={DollarSign}
                        label={costLabel}
                        active={place.cost != null}
                        onClick={() => onOpenCost()}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSelect}
              onMouseEnter={() => onHoverPlace?.(place.id)}
              onMouseLeave={() => onHoverPlace?.(null)}
              className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
            >
              <PlacePin label={label} color={color} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-[#374151]">
                  {place.name}
                </span>
                {collapsedBadges.length > 0 && (
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    {collapsedBadges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold text-[#4F46E5]"
                      >
                        {badge}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </button>
          )}

          {canEdit && (
            expanded ? (
              <button
                type="button"
                onClick={() => {
                  closeTimePopover();
                  onSelect();
                }}
                className="mt-0.5 shrink-0 rounded p-0.5 text-[#6B7280] hover:bg-[#FFF3EB] hover:text-brand-600"
                aria-label="Thu gọn"
              >
                <ChevronUp size={18} />
              </button>
            ) : (
              <button
                type="button"
                {...attributes}
                {...listeners}
                className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-[#6B7280] hover:text-[#374151] active:cursor-grabbing"
                aria-label="Kéo để sắp xếp"
              >
                <GripVertical size={18} />
              </button>
            )
          )}
        </div>
      </div>

      {canEdit && (
        <button
          type="button"
          onClick={onDelete}
          className="mt-2 shrink-0 rounded-md p-1.5 text-[#9CA3AF] transition-colors hover:bg-red-50 hover:text-red-500"
          aria-label="Xoá"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
