"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { GuideDetailDto, PurchaseGuideResultDto } from "@medi/types";
import { API_URL, api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { Button, Spinner } from "@/components/ui";
import { formatMoney } from "@/lib/format";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop&auto=format";

function PurchaseButton({ guideId }: { guideId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function purchase() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/shop/${guideId}`)}`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await api<PurchaseGuideResultDto>(`/shop/guides/${guideId}/purchase`, { method: "POST" });
      router.push(`/trips/${result.clonedTripId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không mua được guide");
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={purchase} disabled={loading} className="w-full font-extrabold">
        {loading ? "Đang xử lý..." : "Mua & remix guide"}
      </Button>
      {error && <p className="text-xs font-bold text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default function ShopGuidePage({ id }: { id: string }) {
  const { user } = useAuth();

  const { data: guide, isLoading } = useQuery({
    queryKey: ["shop-guide", id, user?.id],
    queryFn: () =>
      user
        ? api<GuideDetailDto>(`/shop/guides/${id}`)
        : fetch(`${API_URL}/shop/public/guides/${id}`).then((r) => r.json() as Promise<GuideDetailDto>),
  });

  if (isLoading || !guide) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[#FFF9F2]">
      <AppHeader />
      <main className="flex-grow max-w-3xl mx-auto px-4 py-10 w-full">
        <Link href="/shop" className="text-sm font-bold text-brand-500 hover:underline">← Creator Shop</Link>
        <div className="mt-6 rounded-3xl overflow-hidden border-2 border-[#F3E3D3] bg-white shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={guide.coverImage ?? FALLBACK_COVER} alt="" className="w-full h-56 object-cover" />
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-brand-500">{guide.destination}</p>
              <h1 className="font-display font-extrabold text-2xl text-[#2B2118]">{guide.title}</h1>
              <p className="text-sm font-semibold text-[#8A7563] mt-1">by {guide.creatorName}</p>
            </div>
            {guide.description && <p className="text-sm text-[#2B2118]">{guide.description}</p>}
            <div className="flex gap-4 text-xs font-bold text-[#8A7563]">
              <span>📍 {guide.placeCount} địa điểm</span>
              <span>🗓 {guide.dayCount} ngày</span>
              <span>😎 {guide.purchaseCount} lượt mua</span>
            </div>
            <p className="text-xl font-extrabold text-[#2B2118]">
              {guide.price > 0 ? formatMoney(guide.price, guide.currency) : "Miễn phí"}
            </p>
            {guide.owned ? (
              <Link href={`/trips/${guide.tripId}`}>
                <Button variant="secondary" className="w-full">Xem chuyến đi gốc</Button>
              </Link>
            ) : guide.purchased ? (
              <p className="text-sm font-bold text-brand-600">Bạn đã mua guide này ✓</p>
            ) : (
              <PurchaseButton guideId={guide.id} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
