"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { Spinner } from "@/components/ui";
import { LocationSelect, destinationFilterTerm } from "@/components/location-select";
import { PublicTripGrid } from "@/components/public-trip-grid";
import { fetchPublicTrips } from "@/lib/public-trips";
import { MapPin } from "lucide-react";

const DURATIONS = ["2-3 ngày", "4-5 ngày", "1 tuần+"];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [destination, setDestination] = useState<string | undefined>();

  const destinationQuery = destination ? destinationFilterTerm(destination) : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-trips", destinationQuery],
    queryFn: () => fetchPublicTrips({ destination: destinationQuery, limit: 24 }),
  });

  const filtered = useMemo(() => {
    if (!data?.items) return [];
    if (!search.trim()) return data.items;
    const q = search.toLowerCase();
    return data.items.filter(
      (c) => c.title.toLowerCase().includes(q) || c.destination.toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <div className="min-h-dvh flex flex-col bg-[#FFF9F2] overflow-x-hidden">
      <AppHeader />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full text-left">
        <div className="text-center mb-10">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#2B2118] mb-6">Đi đâu chơi ta? 🧭</h1>
          <div className="max-w-xl mx-auto relative mb-5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhập điểm đến hoặc loại hình du lịch..."
              className="w-full pl-5 pr-12 py-4 rounded-full border-2 border-[#F3E3D3] focus:border-[#FF6B2C] outline-none text-base shadow-md bg-white font-semibold text-[#2B2118]"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#FF6B2C] rounded-full flex items-center justify-center text-white hover:bg-[#E8551A] transition-colors shadow-sm">
              <MapPin size={18} />
            </button>
          </div>
          <div className="max-w-sm mx-auto mb-5">
            <LocationSelect
              value={destination ?? ""}
              onChange={(v) => setDestination(v || undefined)}
              placeholder="Tất cả địa điểm"
              allowEmpty
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8 items-center">
          {DURATIONS.map((d) => (
            <span key={d} className="px-4 py-2 rounded-full text-sm font-bold tab-inactive">
              {d}
            </span>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner className="size-10" />
          </div>
        ) : isError ? (
          <p className="text-center text-[#8A7563] font-bold py-20">Không tải được kèo công khai. Thử lại sau nhé!</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[#8A7563] font-bold py-20">Chưa có kèo công khai nào. Hãy chia sẻ chuyến đi của bạn trước nhé!</p>
        ) : (
          <PublicTripGrid trips={filtered} />
        )}
      </main>
      <Footer />
    </div>
  );
}
