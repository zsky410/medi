"use client";

import type { PlaceDealDto } from "@medi/types";

export function PlaceDealBanner({ deal }: { deal: PlaceDealDto }) {
  if (deal.deals.length === 0) return null;

  const primary = deal.deals[0];
  const extra = deal.deals.slice(1);

  return (
    <div className="mt-2 rounded-xl border border-brand-200/60 bg-gradient-to-r from-brand-50/80 to-[#FFF9F2] px-3 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-extrabold text-brand-700">
          {primary.emoji} Đặt qua {primary.name}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <a
            href={primary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brand-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white hover:bg-brand-600 transition-colors"
          >
            Xem giá →
          </a>
          {extra.map((d) => (
            <a
              key={d.id}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-brand-200 bg-white px-2 py-0.5 text-[10px] font-bold text-brand-600 hover:bg-brand-50 transition-colors"
              title={d.description}
            >
              {d.emoji}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
