"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { Spinner } from "@/components/ui";
import { LocationSelect, destinationFilterTerm } from "@/components/location-select";
import { PublicTripGrid } from "@/components/public-trip-grid";
import { fetchPublicTrips } from "@/lib/public-trips";

const POPULAR_DESTINATIONS = ["Đà Lạt", "Đà Nẵng", "Nha Trang", "Ninh Bình", "Hà Nội", "TP.HCM", "Huế", "Phú Quốc"];

export default function ExplorePage() {
  const [destination, setDestination] = useState<string | undefined>();

  const destinationQuery = destination ? destinationFilterTerm(destination) : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-trips", destinationQuery],
    queryFn: () => fetchPublicTrips({ destination: destinationQuery, limit: 24 }),
  });

  const trips = data?.items ?? [];

  return (
    <div className="min-h-dvh flex flex-col bg-[#FFF9F2] overflow-x-hidden">
      <AppHeader />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full text-left">
        <div className="text-center mb-10">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#2B2118] mb-6">Đi đâu chơi ta? 🧭</h1>
          <div className="max-w-xl mx-auto mb-5">
            <LocationSelect
              value={destination ?? ""}
              onChange={(v) => setDestination(v || undefined)}
              placeholder="Nhập điểm đến hoặc loại hình du lịch..."
              allowEmpty
              className="rounded-full border-2 py-4 pl-12 pr-5 text-base font-semibold shadow-md"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8 items-center">
          {POPULAR_DESTINATIONS.map((place) => (
            <button
              key={place}
              type="button"
              onClick={() => setDestination(place)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                destination === place ? "tab-active" : "tab-inactive"
              }`}
            >
              {place}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner className="size-10" />
          </div>
        ) : isError ? (
          <p className="text-center text-[#8A7563] font-bold py-20">Không tải được kèo công khai. Thử lại sau nhé!</p>
        ) : trips.length === 0 ? (
          <p className="text-center text-[#8A7563] font-bold py-20">Chưa có kèo công khai nào. Hãy chia sẻ chuyến đi của bạn trước nhé!</p>
        ) : (
          <PublicTripGrid trips={trips} />
        )}
      </main>
      <Footer />
    </div>
  );
}
