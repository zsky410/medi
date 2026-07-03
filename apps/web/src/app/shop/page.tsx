"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { GuidesListDto } from "@medi/types";
import { API_URL } from "@/lib/api";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { Spinner } from "@/components/ui";
import { formatMoney } from "@/lib/format";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop&auto=format";

async function fetchGuides(): Promise<GuidesListDto> {
  const res = await fetch(`${API_URL}/shop/guides`);
  if (!res.ok) throw new Error("Không tải được shop");
  return res.json();
}

export default function ShopPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["shop-guides"],
    queryFn: fetchGuides,
  });

  return (
    <div className="min-h-dvh flex flex-col bg-[#FFF9F2] overflow-x-hidden">
      <AppHeader />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full text-left">
        <div className="text-center mb-10">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#2B2118] mb-3">Creator Shop 🛍️</h1>
          <p className="text-[#8A7563] text-lg font-bold">Mua guide du lịch từ KOL, remix về tài khoản của bạn</p>
          <Link href="/creator" className="inline-block mt-4 text-sm font-extrabold text-brand-500 hover:underline">
            Đăng guide của bạn →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner className="size-10" /></div>
        ) : isError ? (
          <p className="text-center text-[#8A7563] font-bold py-20">Không tải được shop. Thử lại sau nhé!</p>
        ) : !data?.items.length ? (
          <p className="text-center text-[#8A7563] font-bold py-20">Chưa có guide nào. Hãy là người đầu tiên đăng guide!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((g) => (
              <Link
                key={g.id}
                href={`/shop/${g.id}`}
                className="boarding-card group overflow-hidden hover:shadow-xl transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.coverImage ?? FALLBACK_COVER} alt="" className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="p-4 bg-white space-y-2">
                  <p className="text-xs font-bold text-brand-500">{g.destination}</p>
                  <h2 className="font-display font-extrabold text-lg text-[#2B2118] line-clamp-2">{g.title}</h2>
                  <div className="flex items-center justify-between text-xs font-bold text-[#8A7563]">
                    <span>{g.creatorName}</span>
                    <span>{g.price > 0 ? formatMoney(g.price, g.currency) : "Miễn phí"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
