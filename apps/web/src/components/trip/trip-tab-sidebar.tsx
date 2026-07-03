"use client";

import { useState } from "react";
import { CalendarDays, CheckSquare, ChevronLeft, ChevronRight, Plane, Wallet } from "lucide-react";

export type TripTab = "itinerary" | "expenses" | "checklist" | "bookings";

const TABS: { id: TripTab; label: string; icon: typeof CalendarDays }[] = [
  { id: "itinerary", label: "Lịch trình", icon: CalendarDays },
  { id: "expenses", label: "Chi phí", icon: Wallet },
  { id: "checklist", label: "Checklist", icon: CheckSquare },
  { id: "bookings", label: "Đặt chỗ", icon: Plane },
];

interface TripTabSidebarProps {
  tab: TripTab;
  onTabChange: (tab: TripTab) => void;
}

export function TripTabSidebar({ tab, onTabChange }: TripTabSidebarProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-[#F3E3D3] bg-white transition-[width] duration-200 ${
        expanded ? "w-44" : "w-14"
      }`}
    >
      <nav className="flex flex-1 flex-col gap-1 p-2 pt-3">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              title={label}
              className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-xs font-bold transition-colors cursor-pointer ${
                active
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-[#8A7563] hover:bg-[#FFF3EB] hover:text-[#2B2118]"
              } ${expanded ? "" : "justify-center px-0"}`}
            >
              <Icon size={18} className="shrink-0" aria-hidden />
              {expanded && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex cursor-pointer items-center justify-center gap-1 border-t border-[#F3E3D3] py-3 text-[#8A7563] hover:bg-[#FFF3EB] hover:text-[#2B2118] transition-colors"
        aria-label={expanded ? "Thu gọn sidebar" : "Mở rộng sidebar"}
      >
        {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        {expanded && <span className="text-[10px] font-bold">Thu gọn</span>}
      </button>
    </aside>
  );
}
