"use client";

import Link from "next/link";
import type { PublicTripListItemDto } from "@medi/types";
import { Plane } from "lucide-react";
import {
  PUBLIC_TRIP_CARD_COLORS,
  PUBLIC_TRIP_FALLBACK_COVER,
  publicTripDurationLabel,
} from "@/lib/public-trips";

export function PublicTripGrid({
  trips,
  columns = "three",
}: {
  trips: PublicTripListItemDto[];
  columns?: "three" | "four";
}) {
  const gridClass =
    columns === "four"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridClass} gap-6 mb-12`}>
      {trips.map((trip, i) => (
        <PublicTripCard key={trip.id} trip={trip} color={PUBLIC_TRIP_CARD_COLORS[i % PUBLIC_TRIP_CARD_COLORS.length]} />
      ))}
    </div>
  );
}

function PublicTripCard({ trip, color }: { trip: PublicTripListItemDto; color: string }) {
  const duration = publicTripDurationLabel(trip.startDate, trip.endDate);

  return (
    <Link
      href={`/t/${trip.id}`}
      className="boarding-card group flex min-h-[17rem] cursor-pointer flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-xl"
    >
      <div className="relative h-48 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trip.coverImage ?? PUBLIC_TRIP_FALLBACK_COVER}
          alt={trip.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-extrabold text-white">{trip.destination.split(",")[0]}</p>
              <p className="truncate text-xs font-semibold text-white/70">
                {trip.title} · {duration}
              </p>
            </div>
            <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/50 bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-[#2B2118] shadow-sm backdrop-blur-sm">
              <Plane size={11} className="rotate-45 fill-[#FF6B2C] text-[#FF6B2C]" />
              <span>{duration}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 bg-white p-4">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white shadow-sm"
            style={{ background: color }}
          >
            {trip.ownerName[0]}
          </div>
          <span className="truncate text-xs font-bold text-[#8A7563]">{trip.ownerName}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs font-bold text-[#8A7563]">
          <span>{trip.placeCount} chỗ</span>
          <span className="font-extrabold text-[#FF6B2C]">{trip.cloneCount} chôm</span>
        </div>
      </div>
    </Link>
  );
}
