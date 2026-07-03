"use client";

import { useState } from "react";
import Link from "next/link";
import type { TripDetailDto } from "@medi/types";
import { dayColor, formatDayLabel } from "@/lib/format";
import { Button, Modal } from "@/components/ui";

/** Directions URL for one day's places, in itinerary order. */
function buildDayMapsUrl(places: { lat: number | null; lng: number | null }[]): string | null {
  const coords = places
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => `${p.lat},${p.lng}`);
  if (coords.length === 0) return null;
  if (coords.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${coords[0]}`;
  }
  return `https://www.google.com/maps/dir/${coords.join("/")}`;
}

function UpgradePrompt({ open, onClose, feature }: { open: boolean; onClose: () => void; feature: string }) {
  return (
    <Modal open={open} onClose={onClose} title="Tính năng PRO">
      <div className="space-y-4 text-center">
        <span className="text-4xl">✨</span>
        <p className="text-sm text-stone-600">
          <span className="font-semibold text-stone-800">{feature}</span> là tính năng dành cho thành viên
          Mê Đi PRO. Nâng cấp để mở khoá tính năng này và nhiều hơn nữa.
        </p>
        <Link href="/pricing">
          <Button className="w-full">Xem gói PRO</Button>
        </Link>
      </div>
    </Modal>
  );
}

export function ExportMapsButton({ trip, isPro }: { trip: TripDetailDto; isPro: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} className="text-xs">
        🗺 Xuất Google Maps {!isPro && <span className="rounded bg-brand-100 px-1 text-[10px] font-bold text-brand-700">PRO</span>}
      </Button>
      {isPro ? (
        <Modal open={open} onClose={() => setOpen(false)} title="Mở lộ trình trong Google Maps">
          <div className="space-y-2">
            {trip.days.map((day, i) => {
              const url = buildDayMapsUrl(day.places);
              return (
                <div key={day.id} className="flex items-center justify-between rounded-lg border border-stone-200 p-3">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full" style={{ background: dayColor(i) }} />
                    <span className="text-sm font-semibold text-stone-800">Ngày {i + 1}</span>
                    <span className="text-xs text-stone-400">{formatDayLabel(day.date)}</span>
                  </div>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-brand-600 hover:underline"
                    >
                      Mở lộ trình →
                    </a>
                  ) : (
                    <span className="text-xs text-stone-400">Chưa có toạ độ</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-stone-400">
            Lộ trình mở theo thứ tự địa điểm trong ngày. Địa điểm chưa có toạ độ sẽ bị bỏ qua.
          </p>
        </Modal>
      ) : (
        <UpgradePrompt open={open} onClose={() => setOpen(false)} feature="Xuất lịch trình sang Google Maps" />
      )}
    </>
  );
}

const OFFLINE_KEY_PREFIX = "medi.offline.";

export function saveOfflineSnapshot(trip: TripDetailDto) {
  try {
    localStorage.setItem(
      `${OFFLINE_KEY_PREFIX}${trip.id}`,
      JSON.stringify({ trip, savedAt: new Date().toISOString() }),
    );
  } catch {
    // storage full — offline copy is best-effort
  }
}

export function loadOfflineSnapshot(tripId: string): { trip: TripDetailDto; savedAt: string } | null {
  try {
    const raw = localStorage.getItem(`${OFFLINE_KEY_PREFIX}${tripId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
