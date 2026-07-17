"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let h = 6; h < 24; h++) {
    for (const m of [0, 30]) {
      if (h === 23 && m === 30) continue;
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const suffix = h < 12 ? "SA" : "CH";
      slots.push(`${hour12}:${String(m).padStart(2, "0")} ${suffix}`);
    }
  }
  return slots;
})();

export function PlaceTimePopover({
  anchorRef,
  startTime,
  endTime,
  onSave,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  startTime?: string;
  endTime?: string;
  onSave: (start: string | undefined, end: string | undefined) => void;
  onClose: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(startTime ?? "");
  const [end, setEnd] = useState(endTime ?? "");
  const [activeField, setActiveField] = useState<"start" | "end">("start");
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    function update() {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const width = 300;
      const left = Math.min(
        Math.max(8, rect.left),
        window.innerWidth - width - 8,
      );
      setPos({ top: rect.bottom + 6, left });
    }
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [anchorRef, onClose]);

  function pickTime(value: string) {
    if (activeField === "start") {
      setStart(value);
      setActiveField("end");
    } else {
      setEnd(value);
    }
  }

  if (!pos) return null;

  return createPortal(
    <div
      ref={rootRef}
      style={{ top: pos.top, left: pos.left }}
      className="fixed z-[80] w-[300px] rounded-2xl border border-[#F3E3D3] bg-white p-3 shadow-2xl"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveField("start")}
          className={`min-w-0 rounded-xl border px-3 py-2.5 text-center text-sm font-bold whitespace-nowrap ${
            activeField === "start"
              ? "border-brand-400 bg-[#FFF4EA] text-[#2B2118]"
              : "border-[#E8DDD3] bg-[#FAFAFA] text-[#8A7563]"
          }`}
        >
          {start || "Giờ bắt đầu"}
        </button>
        <span className="text-[#9CA3AF]">–</span>
        <button
          type="button"
          onClick={() => setActiveField("end")}
          className={`min-w-0 rounded-xl border px-3 py-2.5 text-center text-sm font-bold whitespace-nowrap ${
            activeField === "end"
              ? "border-brand-400 bg-[#FFF4EA] text-[#2B2118]"
              : "border-[#E8DDD3] bg-[#FAFAFA] text-[#8A7563]"
          }`}
        >
          {end || "Giờ kết thúc"}
        </button>
      </div>

      <ul className="max-h-48 overflow-y-auto rounded-xl border border-[#F3E3D3]">
        {TIME_SLOTS.map((slot) => {
          const selected =
            (activeField === "start" && slot === start) ||
            (activeField === "end" && slot === end);
          return (
            <li key={slot}>
              <button
                type="button"
                onClick={() => pickTime(slot)}
                className={`w-full px-3 py-2 text-left text-sm font-semibold transition-colors ${
                  selected
                    ? "bg-brand-50 text-brand-700"
                    : "text-[#374151] hover:bg-[#FFF4EA]"
                }`}
              >
                {slot}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setStart("");
            setEnd("");
            onSave(undefined, undefined);
            onClose();
          }}
          className="rounded-full bg-[#F3E3D3] px-4 py-1.5 text-sm font-bold text-[#2B2118]"
        >
          Xóa
        </button>
        <button
          type="button"
          onClick={() => {
            onSave(start || undefined, end || undefined);
            onClose();
          }}
          className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-bold text-white"
        >
          Lưu
        </button>
      </div>
    </div>,
    document.body,
  );
}
