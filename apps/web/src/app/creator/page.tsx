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

  const publicTrips =
    trips?.filter(
      (t) =>
        t.visibility === "PUBLIC" &&
        t.distributionMode === "EXPLORE_FREE" &&
        t.myRole !== "VIEWER",
    ) ?? [];

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

  async function updateGuide(guideId: string, input: { price?: number; published?: boolean }) {
    await api<GuideDetailDto>(`/shop/guides/${guideId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    queryClient.invalidateQueries({ queryKey: ["my-guides"] });
    queryClient.invalidateQueries({ queryKey: ["shop-guides"] });
    queryClient.invalidateQueries({ queryKey: ["public-trips"] });
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[#FFF9F2]">
      <AppHeader />
      <main className="flex-grow max-w-3xl mx-auto px-4 py-10 w-full space-y-10">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-[#2B2118]">Creator Studio 🎬</h1>
          <p className="text-sm font-bold text-[#8A7563] mt-1">Biến lịch trình công khai thành guide trong Creator Shop</p>
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
            <p className="text-[10px] font-bold text-[#8A7563] mt-1">
              Khi đăng lên Creator Shop, chuyến đi sẽ tự ẩn khỏi Home/Explore để tránh bị chôm miễn phí.
            </p>
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
            <Label>Giá bán (VND, 0 = guide miễn phí trong shop)</Label>
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
                <CreatorGuideRow key={g.id} guide={g} onUpdate={updateGuide} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function CreatorGuideRow({
  guide,
  onUpdate,
}: {
  guide: GuideListItemDto;
  onUpdate: (guideId: string, input: { price?: number; published?: boolean }) => Promise<void>;
}) {
  const [price, setPrice] = useState(String(guide.price));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(input: { price?: number; published?: boolean }) {
    setSaving(true);
    setError("");
    try {
      await onUpdate(guide.id, input);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không cập nhật được guide");
    } finally {
      setSaving(false);
    }
  }

  const parsedPrice = Math.max(0, parseFloat(price) || 0);

  return (
    <div className="rounded-2xl border border-[#F3E3D3] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/shop/${guide.id}`} className="min-w-0">
          <p className="truncate font-bold text-[#2B2118]">{guide.title}</p>
          <p className="text-xs font-bold text-[#8A7563]">
            {guide.purchaseCount} lượt lấy · {guide.published ? "Đang ở Shop" : "Đã trả về Explore"}
          </p>
        </Link>
        <span className="shrink-0 text-sm font-extrabold text-brand-500">
          {guide.price > 0 ? `${guide.price.toLocaleString("vi-VN")}đ` : "Miễn phí"}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <Input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          aria-label="Giá guide"
        />
        <Button type="button" variant="secondary" disabled={saving} onClick={() => save({ price: parsedPrice, published: true })}>
          Lưu giá
        </Button>
        <Button type="button" variant="ghost" disabled={saving} onClick={() => save({ price: 0, published: false })}>
          Free Explore
        </Button>
      </div>
      <p className="mt-2 text-[10px] font-bold text-[#8A7563]">
        Lưu giá giữ guide trong Shop; giá 0 là shop-free. Free Explore ẩn guide khỏi Shop và mở clone miễn phí lại.
      </p>
      <ErrorText>{error}</ErrorText>
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
