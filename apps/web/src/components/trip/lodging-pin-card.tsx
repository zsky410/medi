"use client";

import { useState } from "react";
import { Bed, ChevronUp, Pencil } from "lucide-react";
import type { AttachmentDto } from "@medi/types";
import {
  formatBookingAmount,
  formatBookingSchedule,
  getBookingMetadata,
  getBookingTitle,
} from "@/lib/booking-display";

function scrollToBookingCard(id: string) {
  const el = document.getElementById(`lodging-booking-${id}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("ring-2", "ring-brand-400");
  window.setTimeout(() => el.classList.remove("ring-2", "ring-brand-400"), 2000);
}

export function LodgingPinCard({ lodging }: { lodging: AttachmentDto }) {
  const [expanded, setExpanded] = useState(false);
  const meta = getBookingMetadata(lodging);
  const title = getBookingTitle(lodging);
  const schedule = formatBookingSchedule(meta);
  const amount = formatBookingAmount(meta);

  const details = [
    meta?.address ? { label: "Địa chỉ", value: meta.address } : null,
    schedule ? { label: "Nhận / trả phòng", value: schedule } : null,
    meta?.confirmationCode ? { label: "Mã xác nhận", value: meta.confirmationCode } : null,
    amount ? { label: "Chi phí", value: amount } : null,
    meta?.note ? { label: "Ghi chú", value: meta.note } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="overflow-hidden rounded-xl border border-[#E9D8FF] bg-[#F5F3FF]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
      >
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#7C3AED] text-white shadow-sm"
          aria-hidden
        >
          <Bed size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold uppercase text-[#374151]">
            {title}
          </span>
          {schedule && (
            <span className="block truncate text-xs font-semibold text-[#8A7563]">{schedule}</span>
          )}
        </span>
        <ChevronUp
          size={18}
          className={`shrink-0 text-[#7C3AED] transition-transform ${expanded ? "" : "rotate-180"}`}
        />
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-[#E9D8FF] px-3 py-2.5">
          {details.length > 0 ? (
            <dl className="space-y-1.5">
              {details.map((d) => (
                <div key={d.label} className="flex gap-2 text-xs">
                  <dt className="shrink-0 font-semibold text-[#8A7563]">{d.label}:</dt>
                  <dd className="min-w-0 flex-1 font-medium text-[#374151]">{d.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-xs font-medium text-[#8A7563]">Chưa có thông tin chi tiết.</p>
          )}
          <button
            type="button"
            onClick={() => scrollToBookingCard(lodging.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#7C3AED] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#6D28D9]"
          >
            <Pencil size={13} />
            Chỉnh sửa
          </button>
        </div>
      )}
    </div>
  );
}
