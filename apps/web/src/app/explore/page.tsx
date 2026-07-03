"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { PublicTripsListDto } from "@medi/types";
import { API_URL } from "@/lib/api";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { Spinner } from "@/components/ui";
import { LocationSelect, destinationFilterTerm } from "@/components/location-select";
import { MapPin, Plane } from "lucide-react";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop&auto=format";
const CARD_COLORS = ["#FF6B2C", "#FF3D77", "#8B5CF6", "#0EA5E9", "#84CC16", "#FFC93C"];

const DURATIONS = ["2-3 ngày", "4-5 ngày", "1 tuần+"];

function durationLabel(startDate: string, endDate: string): string {
  const days = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000) + 1;
  const nights = Math.max(days - 1, 0);
  return `${nights}N${days}Đ`;
}

async function fetchPublicTrips(destination?: string): Promise<PublicTripsListDto> {
  const params = new URLSearchParams({ sort: "cloneCount", limit: "24" });
  if (destination) params.set("destination", destination);
  const res = await fetch(`${API_URL}/public/trips?${params}`);
  if (!res.ok) throw new Error("Không tải được danh sách kèo");
  return res.json();
}

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [destination, setDestination] = useState<string | undefined>();

  const destinationQuery = destination ? destinationFilterTerm(destination) : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-trips", destinationQuery],
    queryFn: () => fetchPublicTrips(destinationQuery),
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filtered.map((c, i) => {
              const color = CARD_COLORS[i % CARD_COLORS.length];
              const dur = durationLabel(c.startDate, c.endDate);
              return (
                <Link
                  key={c.id}
                  href={`/t/${c.id}`}
                  className="boarding-card group cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative overflow-hidden h-48">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.coverImage ?? FALLBACK_COVER}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-white font-display font-extrabold text-xl">{c.destination.split(",")[0]}</p>
                          <p className="text-white/70 text-xs font-semibold">{c.title} · {dur}</p>
                        </div>
                        <div className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#2B2118] shadow-sm border border-white/50">
                          <Plane size={11} className="text-[#FF6B2C] fill-[#FF6B2C] rotate-45" />
                          <span>{dur}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold shadow-sm"
                        style={{ background: color }}
                      >
                        {c.ownerName[0]}
                      </div>
                      <span className="text-xs font-bold text-[#8A7563]">{c.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-[#8A7563]">
                      <span>📍 {c.placeCount} chỗ</span>
                      <span className="text-[#FF6B2C] font-extrabold">{c.cloneCount} chôm</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
