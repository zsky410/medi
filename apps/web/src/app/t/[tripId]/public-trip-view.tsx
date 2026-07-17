"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PublicTripDto, TripDto } from "@medi/types";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { CATEGORY_LABELS, dayColor, formatDateRange, formatDayLabel, formatMoney } from "@/lib/format";
import { Logo } from "@/components/logo";
import { Button, Spinner } from "@/components/ui";
import { placesToItineraryItems, tripPlacesToMapItems } from "@/components/trip/trip-map";

const TripMap = dynamic(() => import("@/components/trip/trip-map").then((m) => m.TripMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#FFF9F2]">
      <Spinner />
    </div>
  ),
});

function RemixButton({ tripId }: { tripId: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [cloning, setCloning] = useState(false);
  const [error, setError] = useState("");

  async function remix() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/t/${tripId}`)}`);
      return;
    }
    setCloning(true);
    setError("");
    try {
      const trip = await api<TripDto>(`/trips/${tripId}/clone`, { method: "POST" });
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không sao chép được lịch trình");
      setCloning(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={remix}
        disabled={cloning || loading}
        className="px-8 py-4 text-base bg-gradient-to-r from-brand-500 to-[#FF3D77] text-white hover:from-brand-600 hover:to-[#E8356C] border-none shadow-lg shadow-brand-500/20 hover:scale-105 transition-transform"
      >
        {cloning ? "Đang chôm kèo..." : "Chôm kèo này về sửa 😎"}
      </Button>
      {!user && !loading && (
        <p className="text-xs font-bold text-white/80">Miễn phí, đăng nhập là xong!</p>
      )}
      {error && <p className="text-xs font-bold text-red-200 bg-red-500/20 px-3 py-1 rounded-full">{error}</p>}
    </div>
  );
}

export function PublicTripView({ trip }: { trip: PublicTripDto }) {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const itineraryItems = useMemo(() => {
    const allPlaces = trip.days.flatMap((d) => d.places);
    if (allPlaces.length > 0) return tripPlacesToMapItems(trip.days);
    return placesToItineraryItems(trip.savedPlaces);
  }, [trip]);

  return (
    <div className="flex min-h-dvh flex-col bg-[#FFF9F2] text-left">
      <header className="sticky top-0 z-40 border-b border-[#F3E3D3] bg-[#FFF9F2]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <Link href="/register">
            <Button variant="secondary" className="text-xs">Tạo kèo của bạn 🚀</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="border-b border-[#F3E3D3] bg-gradient-to-br from-brand-500 to-[#FF3D77] text-white relative overflow-hidden">
        {/* Torn paper bottom edge effect simulation */}
        <div className="absolute inset-0 bg-black/10 z-0" />
        <div className="absolute -bottom-1 inset-x-0 h-4 bg-[#FFF9F2] rounded-t-3xl z-10" />

        <div className="mx-auto max-w-6xl px-4 py-12 text-center space-y-4 relative z-20">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
            <span className="text-xs font-bold">Kèo của {trip.ownerName} 🎒</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white drop-shadow-sm">
            {trip.title}
          </h1>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/10">
              📍 {trip.destination}
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/10">
              🗓️ {formatDateRange(trip.startDate, trip.endDate)}
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/10">
              😎 {trip.cloneCount} người đã chôm
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/10">
              🔥 {trip.placeCount} chỗ chơi
            </span>
          </div>
          <div className="mt-6 flex justify-center pt-2">
            <RemixButton tripId={trip.id} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 z-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Itinerary */}
          <div className="order-2 space-y-5 lg:order-1 max-h-[calc(100dvh-200px)] overflow-y-auto pr-1">
            {trip.days.map((day, i) => (
              <section key={day.id} className="rounded-2xl border-2 border-[#F3E3D3] bg-white p-4 shadow-sm relative overflow-hidden">
                {/* Top spiral line decoration */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 to-[#FF3D77]/40" />

                <header className="mb-3.5 flex items-center gap-2">
                  <span className="size-3.5 rounded-full border border-white shadow-sm" style={{ background: dayColor(i) }} />
                  <h3 className="text-base font-display font-extrabold text-[#2B2118]">Ngày {i + 1}</h3>
                  <span className="text-xs font-bold text-[#8A7563] bg-[#FFF3EB] px-2 py-0.5 rounded-full">{formatDayLabel(day.date)}</span>
                </header>

                <div className="space-y-2.5">
                  {day.places.map((place, pi) => (
                    <button
                      key={place.id}
                      onClick={() => setSelectedPlaceId(place.id)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                        selectedPlaceId === place.id
                          ? "border-brand-500 ring-4 ring-brand-100 shadow-md bg-white"
                          : "border-[#F3E3D3] bg-white hover:shadow-md"
                      }`}
                    >
                      <span
                        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-display font-extrabold text-white shadow-sm border border-white/20"
                        style={{ background: dayColor(i) }}
                      >
                        {pi + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-[#2B2118]">{place.name}</span>
                        <span className="block text-[10px] font-bold text-[#8A7563] mt-0.5 bg-[#FFF3EB] px-2 py-0.5 rounded-full border border-[#FFE1CF] w-fit">
                          {CATEGORY_LABELS[place.category] ?? place.category}
                          {place.cost ? ` · 💸 ${formatMoney(place.cost)}` : ""}
                        </span>
                        {place.note && (
                          <span className="mt-2 block bg-[#FFE07D]/30 border-l-4 border-[#FFC93C] px-2.5 py-1.5 rounded-r-xl text-xs font-semibold text-[#2B2118] leading-relaxed">
                            📝 {place.note}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                  {day.places.length === 0 && (
                    <p className="py-4 text-center text-xs font-bold text-[#8A7563]/40">Hôm này thong thả, chưa xếp chỗ chơi nào ✨</p>
                  )}
                </div>
              </section>
            ))}

            {trip.savedPlaces.length > 0 && (
              <section className="rounded-2xl border-2 border-dashed border-[#8A7563]/40 bg-[#FFF9F2] p-4 shadow-sm">
                <h3 className="text-base font-display font-extrabold text-[#2B2118] mb-3.5">Đã lưu (chưa xếp ngày) 📂</h3>
                <div className="space-y-2.5">
                  {trip.savedPlaces.map((place) => (
                    <button
                      key={place.id}
                      onClick={() => setSelectedPlaceId(place.id)}
                      className="flex w-full items-start gap-3 rounded-xl border border-[#F3E3D3] bg-white p-3 text-left hover:shadow-md transition-shadow"
                    >
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#8A7563] text-xs font-display font-extrabold text-white shadow-sm border border-white/20">
                        ★
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-[#2B2118]">{place.name}</span>
                        <span className="block text-[10px] font-bold text-[#8A7563] mt-0.5 bg-[#FFF3EB] px-2 py-0.5 rounded-full border border-[#FFE1CF] w-fit">
                          {CATEGORY_LABELS[place.category] ?? place.category}
                          {place.cost ? ` · 💸 ${formatMoney(place.cost)}` : ""}
                        </span>
                        {place.note && (
                          <span className="mt-2 block bg-[#FFE07D]/30 border-l-4 border-[#FFC93C] px-2.5 py-1.5 rounded-r-xl text-xs font-semibold text-[#2B2118] leading-relaxed">
                            📝 {place.note}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Sticky Map */}
          <div className="order-1 h-64 overflow-hidden rounded-2xl border-2 border-[#F3E3D3] sm:h-80 lg:order-2 lg:h-[calc(100dvh-200px)] lg:sticky lg:top-24 shadow-sm">
            <TripMap
              itineraryItems={itineraryItems}
              activeItemId={selectedPlaceId}
              focusItemId={selectedPlaceId}
              onMarkerClick={setSelectedPlaceId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
