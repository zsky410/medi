"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { GuideDetailDto, GuideListItemDto, PublishGuideInput, TripDto } from "@medi/types";
import { api, ApiError } from "@/lib/api";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { Button, ErrorText, Input, Label, Spinner } from "@/components/ui";
import { RequireAuth } from "@/components/require-auth";

function CreatorContent() {
  const queryClient = useQueryClient();
  const [tripId, setTripId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);

  const { data: trips } = useQuery({
    queryKey: ["trips"],
    queryFn: () => api<TripDto[]>("/trips"),
  });

  const { data: myGuides, isLoading } = useQuery({
    queryKey: ["my-guides"],
    queryFn: () => api<GuideListItemDto[]>("/shop/my-guides"),
  });

  const publicTrips = trips?.filter((t) => t.visibility === "PUBLIC" && t.myRole !== "VIEWER") ?? [];

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!tripId || !title.trim()) return;
    setPublishing(true);
    setError("");
    try {
      const input: PublishGuideInput = {
        tripId,
        title: title.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price) || 0,
        currency: "VND",
      };
      await api<GuideDetailDto>("/shop/guides", { method: "POST", body: JSON.stringify(input) });
      queryClient.invalidateQueries({ queryKey: ["my-guides"] });
      queryClient.invalidateQueries({ queryKey: ["shop-guides"] });
      setTitle("");
      setDescription("");
      setTripId("");
      setPrice("0");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không đăng được guide");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[#FFF9F2]">
      <AppHeader />
      <main className="flex-grow max-w-3xl mx-auto px-4 py-10 w-full space-y-10">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-[#2B2118]">Creator Studio 🎬</h1>
          <p className="text-sm font-bold text-[#8A7563] mt-1">Đăng lịch trình công khai thành guide bán trên Creator Shop</p>
        </div>

        <form onSubmit={handlePublish} className="rounded-3xl border-2 border-[#F3E3D3] bg-white p-6 space-y-4 shadow-sm">
          <h2 className="font-display font-extrabold text-lg">Đăng guide mới</h2>
          <div>
            <Label>Chuyến đi công khai</Label>
            <select
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              required
              className="w-full mt-1 rounded-xl border border-[#F3E3D3] px-3 py-2 text-sm font-semibold outline-none focus:border-brand-500"
            >
              <option value="">Chọn chuyến đi...</option>
              {publicTrips.map((t) => (
                <option key={t.id} value={t.id}>{t.title} — {t.destination}</option>
              ))}
            </select>
            {publicTrips.length === 0 && (
              <p className="text-[10px] font-bold text-[#8A7563] mt-1">Cần đặt chuyến đi ở chế độ Công khai trước (tab Chia sẻ).</p>
            )}
          </div>
          <div>
            <Label>Tiêu đề guide</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="3 ngày Đà Lạt cho couple" />
          </div>
          <div>
            <Label>Mô tả</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full mt-1 rounded-xl border border-[#F3E3D3] px-3 py-2 text-sm font-semibold outline-none focus:border-brand-500"
              placeholder="Guide chi tiết gồm quán ăn, homestay, tips..."
            />
          </div>
          <div>
            <Label>Giá (VND, 0 = miễn phí)</Label>
            <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={publishing} className="w-full">
            {publishing ? "Đang đăng..." : "Đăng lên Creator Shop"}
          </Button>
        </form>

        <section>
          <h2 className="font-display font-extrabold text-lg mb-4">Guide của tôi</h2>
          {isLoading ? (
            <Spinner />
          ) : !myGuides?.length ? (
            <p className="text-sm font-bold text-[#8A7563]">Chưa có guide nào.</p>
          ) : (
            <div className="space-y-3">
              {myGuides.map((g) => (
                <Link
                  key={g.id}
                  href={`/shop/${g.id}`}
                  className="flex items-center justify-between rounded-2xl border border-[#F3E3D3] bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="font-bold text-[#2B2118]">{g.title}</p>
                    <p className="text-xs text-[#8A7563]">{g.purchaseCount} lượt mua</p>
                  </div>
                  <span className="text-sm font-extrabold text-brand-500">
                    {g.price > 0 ? `${g.price.toLocaleString("vi-VN")}đ` : "Miễn phí"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function CreatorPage() {
  return (
    <RequireAuth>
      <CreatorContent />
    </RequireAuth>
  );
}
