"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AttachmentDto, BookingAttachmentType } from "@medi/types";
import { api } from "@/lib/api";
import {
  formatBookingAmount,
  formatBookingSchedule,
  getBookingMetadata,
  getBookingTitle,
  groupBookings,
  isExternalUrl,
  shortDateRange,
} from "@/lib/booking-display";
import { Bed, Bus, ChevronDown, Paperclip, Plane, Trash2 } from "lucide-react";
import { useState } from "react";
import { LodgingBookingCard } from "@/components/trip/lodging-booking-card";

function BookingCard({
  att,
  canEdit,
  onDelete,
  variant,
}: {
  att: AttachmentDto;
  canEdit: boolean;
  onDelete: () => void;
  variant: "lodging" | "transport" | "other";
}) {
  const meta = getBookingMetadata(att);
  const title = getBookingTitle(att);
  const schedule = formatBookingSchedule(meta);
  const amount = formatBookingAmount(meta);

  return (
    <div className="group relative rounded-2xl border border-[#E8DDD3] bg-[#FAFAFA] p-4 shadow-sm transition-shadow hover:shadow-md">
      {canEdit && (
        <button
          type="button"
          onClick={onDelete}
          className="absolute right-3 top-3 rounded-full p-1.5 text-[#8A7563] opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 cursor-pointer"
          aria-label="Xoá"
        >
          <Trash2 size={16} />
        </button>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
        <div className="min-w-0 flex-1 space-y-1">
          <h4 className="font-display text-base font-extrabold uppercase tracking-wide text-[#2B2118]">
            {title}
          </h4>

          {variant === "transport" && (meta?.fromPlace || meta?.toPlace) && (
            <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#2B2118]">
              <span>{meta?.fromPlace ?? "—"}</span>
              <span className="text-[#8A7563]">→</span>
              <span>{meta?.toPlace ?? "—"}</span>
            </div>
          )}

          {variant === "lodging" && meta?.address && (
            <p className="text-xs font-semibold text-[#8A7563] leading-relaxed">{meta.address}</p>
          )}

          {schedule && (
            <p className="text-xs font-bold text-[#5C534A]">{schedule}</p>
          )}

          {!schedule && shortDateRange(meta) && (
            <p className="text-xs font-bold text-[#5C534A]">{shortDateRange(meta)}</p>
          )}

          {meta?.provider && (
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A7563]">
              {meta.provider}
            </p>
          )}

          {meta?.note && (
            <p className="text-xs font-semibold text-[#8A7563]">{meta.note}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {meta?.confirmationCode && (
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#8A7563]">
              Mã xác nhận: <span className="text-[#2B2118]">{meta.confirmationCode}</span>
            </p>
          )}
          {amount && (
            <span className="rounded-full border border-[#E8DDD3] bg-white px-3 py-1 text-sm font-extrabold text-[#2B2118] shadow-sm">
              {amount}
            </span>
          )}
          {isExternalUrl(att.url) && (
            <a
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-8 items-center justify-center rounded-full border border-[#E8DDD3] bg-white text-[#8A7563] hover:text-brand-500 transition-colors"
              aria-label="Mở link đặt chỗ"
            >
              <Paperclip size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingSection({
  title,
  icon: Icon,
  items,
  tripId,
  canEdit,
  type,
  onAdd,
  defaultOpen = true,
}: {
  title: string;
  icon: typeof Bed;
  items: AttachmentDto[];
  tripId: string;
  canEdit: boolean;
  type: BookingAttachmentType;
  onAdd: () => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/trips/${tripId}/attachments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", tripId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId, "summary"] });
    },
  });

  if (items.length === 0) return null;

  const variant = type === "lodging" ? "lodging" : type === "other" ? "other" : "transport";

  return (
    <section className="rounded-2xl border-2 border-[#F3E3D3] bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-[#FFF9F2] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Icon size={18} className="text-[#8A7563]" />
          <span className="font-display text-sm font-extrabold text-[#2B2118]">{title}</span>
          {items.length > 0 && (
            <span className="rounded-full bg-[#FFF3EB] px-2 py-0.5 text-[10px] font-extrabold text-brand-600">
              {items.length}
            </span>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`text-[#8A7563] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-[#F3E3D3] px-4 py-4">
          {items.map((att) =>
            type === "lodging" ? (
              <LodgingBookingCard
                key={att.id}
                att={att}
                tripId={tripId}
                canEdit={canEdit}
                onDelete={() => deleteMutation.mutate(att.id)}
              />
            ) : (
              <BookingCard
                key={att.id}
                att={att}
                canEdit={canEdit}
                variant={variant}
                onDelete={() => deleteMutation.mutate(att.id)}
              />
            ),
          )}
          {canEdit && (
            <button
              type="button"
              onClick={onAdd}
              className="w-full rounded-xl border border-dashed border-[#E8DDD3] py-2.5 text-sm font-bold text-[#8A7563] hover:border-brand-300 hover:text-brand-600 hover:bg-[#FFF9F2] transition-colors cursor-pointer"
            >
              + Thêm {title.toLowerCase()}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export function TripBookingsBoard({
  tripId,
  attachments,
  canEdit,
  onAdd,
}: {
  tripId: string;
  attachments: AttachmentDto[];
  canEdit: boolean;
  onAdd: (type: BookingAttachmentType) => void;
}) {
  const { lodging, transport, other } = groupBookings(attachments);
  const hasAny = lodging.length + transport.length + other.length > 0;

  if (!hasAny) return null;

  return (
    <div className="space-y-3">
      {lodging.length > 0 && (
        <BookingSection
          title="Khách sạn và chỗ ở"
          icon={Bed}
          items={lodging}
          tripId={tripId}
          canEdit={canEdit}
          type="lodging"
          onAdd={() => onAdd("lodging")}
        />
      )}
      {transport.length > 0 && (
        <BookingSection
          title="Phương tiện di chuyển"
          icon={transport.some((a) => a.type === "flight") ? Plane : Bus}
          items={transport}
          tripId={tripId}
          canEdit={canEdit}
          type="train"
          onAdd={() => onAdd("train")}
        />
      )}
      {other.length > 0 && (
        <BookingSection
          title="Đặt chỗ khác"
          icon={Paperclip}
          items={other}
          tripId={tripId}
          canEdit={canEdit}
          type="other"
          onAdd={() => onAdd("other")}
        />
      )}
    </div>
  );
}
