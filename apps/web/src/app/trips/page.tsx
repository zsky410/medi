"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateTripInput, TripDto } from "@medi/types";
import { api, ApiError } from "@/lib/api";
import { daysUntil, formatDateRange, parseLocalDate } from "@/lib/format";
import { AppHeader } from "@/components/app-header";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/lib/auth";
import { Avatar, Button, Card, ErrorText, Input, Label, Modal, Spinner } from "@/components/ui";
import { LocationSelect } from "@/components/location-select";
import { DateInput } from "@/components/date-input";
import { UploadCloud, Trash2, Backpack, Camera } from "lucide-react";
import { compressImageFile, IMAGE_PRESETS } from "@/lib/compress-image";

// Playful preset covers
const PRESET_COVERS = [
  "https://images.unsplash.com/photo-1583249890652-f10151567757?auto=format&fit=crop&w=500&q=80", // Da Lat
  "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=500&q=80", // Hoi An
  "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=500&q=80", // Nha Trang
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80", // Beach
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80", // Mountain
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=500&q=80", // Lake
];

function NewTripModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [selectedCover, setSelectedCover] = useState<string | null>(null);
  const [coverInputKey, setCoverInputKey] = useState(0);
  const [budget, setBudget] = useState("");

  const mutation = useMutation({
    mutationFn: (input: CreateTripInput) =>
      api<TripDto>("/trips", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      onClose();
      setTitle("");
      setOrigin("");
      setDest("");
      setStartDate("");
      setEndDate("");
      setSelectedCover(null);
      setCoverInputKey((k) => k + 1);
      setBudget("");
      setError("");
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 413) {
        setError("Ảnh bìa quá lớn. Hãy chọn ảnh nhẹ hơn hoặc đổi ảnh khác.");
        return;
      }
      setError(err instanceof ApiError ? err.message : "Không tạo được chuyến đi");
    },
  });

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      setError("Ảnh quá lớn. Vui lòng chọn file dưới 12MB.");
      return;
    }

    try {
      const result = await compressImageFile(file, IMAGE_PRESETS.tripCover);
      setSelectedCover(result.dataUrl);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không nén được ảnh");
      setSelectedCover(null);
    }
  };

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedCover) {
      setError("Vui lòng tải lên ảnh bìa cho sổ tay");
      return;
    }
    mutation.mutate({
      title,
      destination: `${origin} → ${dest}`,
      startDate,
      endDate,
      coverImage: selectedCover,
      ...(budget.trim() ? { budgetAmount: Number(budget.replace(/\D/g, "")), budgetCurrency: "VND" } : {}),
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Tạo chuyến đi mới">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="trip-title">Tên chuyến đi</Label>
          <Input id="trip-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="trip-origin">Xuất phát</Label>
            <LocationSelect
              id="trip-origin"
              required
              value={origin}
              onChange={setOrigin}
              placeholder="Tìm điểm xuất phát..."
            />
          </div>
          <div>
            <Label htmlFor="trip-destination">Điểm đến</Label>
            <LocationSelect
              id="trip-destination"
              required
              value={dest}
              onChange={setDest}
              placeholder="Tìm điểm đến (vd: Đà Lạt)..."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Ngày đi</Label>
            <DateInput id="trip-start" required value={startDate} onChange={setStartDate} />
          </div>
          <div>
            <Label>Ngày về</Label>
            <DateInput id="trip-end" required value={endDate} onChange={setEndDate} min={startDate || undefined} />
          </div>
        </div>

        <div>
          <Label htmlFor="trip-budget">Ngân sách dự kiến (tuỳ chọn)</Label>
          <Input
            id="trip-budget"
            inputMode="numeric"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="VD: 5.000.000 VND"
          />
        </div>

        <div>
          <Label>Chọn bìa sổ tay của bạn</Label>
          <input
            key={coverInputKey}
            type="file"
            id="cover-upload"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          {selectedCover ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#F3E3D3] aspect-[21/9] h-28 bg-stone-100 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedCover} alt="Cover preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <label
                  htmlFor="cover-upload"
                  className="px-3 py-1.5 bg-white text-[#2B2118] font-bold text-xs rounded-full cursor-pointer hover:bg-[#FFE1CF] transition-colors shadow-sm"
                >
                  Đổi ảnh 📸
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCover(null);
                    setCoverInputKey((k) => k + 1);
                  }}
                  className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-sm"
                  aria-label="Delete cover"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="cover-upload"
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#F3E3D3] hover:border-brand-500 bg-[#FFF9F2] hover:bg-[#FFF3EB] rounded-2xl p-5 text-center cursor-pointer transition-colors duration-200 group"
            >
              <UploadCloud size={28} className="text-[#8A7563] group-hover:text-brand-500 transition-colors" />
              <div>
                <p className="text-xs font-bold text-[#2B2118]">Tải lên ảnh bìa riêng của bạn</p>
                <p className="text-[10px] font-semibold text-[#8A7563] mt-0.5">Hỗ trợ JPG, PNG, WEBP (tự động nén tối ưu)</p>
              </div>
            </label>
          )}
        </div>

        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={mutation.isPending} className="w-full py-3 text-base shadow-md shadow-brand-500/10">
          {mutation.isPending ? "Đang tạo sổ tay..." : "Lên kèo ngay thôi!"}
        </Button>
      </form>
    </Modal>
  );
}

function TripCard({ trip, index }: { trip: TripDto; index: number }) {
  // Generate a random rotation between -2 and 2 degrees based on the index
  const rotations = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-1.5", "rotate-1.5"];
  const rotation = rotations[index % rotations.length];

  // Pick a cover image based on index
  const cover = trip.coverImage ?? PRESET_COVERS[index % PRESET_COVERS.length];

  const diffDays = daysUntil(trip.startDate);
  const isUpcoming = diffDays > 0;

  return (
    <Link href={`/trips/${trip.id}`} className={`block transform ${rotation} hover:rotate-0 hover:scale-[1.03] transition-all duration-300`}>
      <Card className="p-3 pb-5 bg-white border-2 border-[#F3E3D3] shadow-md relative group">
        {/* Washi tape sticker on top corner */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#FFE1CF]/80 border-b border-[#F3E3D3] rotate-1 z-10" />

        {/* Countdown Sticker */}
        {isUpcoming && (
          <div className="absolute top-5 right-5 bg-gradient-to-r from-brand-500 to-[#FF3D77] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md z-10 animate-pulse">
            Còn {diffDays} ngày 🔥
          </div>
        )}

        {/* Polaroid Photo Frame */}
        <div className="aspect-[4/3] bg-stone-100 rounded-xl overflow-hidden mb-4 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <h3 className="absolute bottom-3 inset-x-3 text-base font-display font-extrabold text-white drop-shadow">
            {trip.title}
          </h3>
        </div>

        {/* Polaroid Caption */}
        <div className="space-y-2 px-1 text-left">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#2B2118] flex items-center gap-1">
              <span>📍</span> {trip.destination}
            </p>
          </div>
          <p className="text-xs font-semibold text-[#8A7563]">{formatDateRange(trip.startDate, trip.endDate)}</p>

          {/* Member Avatars Overlapping */}
          <div className="flex items-center justify-between pt-2 border-t border-[#F3E3D3]/50">
            <div className="flex items-center -space-x-1.5">
              {trip.members.slice(0, 4).map((m) => (
                <div key={m.userId} className="rounded-full border-2 border-white">
                  <Avatar name={m.user.name} avatarUrl={m.user.avatarUrl} size={24} />
                </div>
              ))}
              {trip.members.length > 4 && (
                <span className="flex items-center justify-center size-6 rounded-full bg-[#FFF3EB] text-[10px] font-bold text-[#2B2118] border-2 border-white">
                  +{trip.members.length - 4}
                </span>
              )}
            </div>
            <span className="text-[10px] font-extrabold text-brand-500 bg-[#FFF3EB] px-2 py-0.5 rounded-full border border-[#FFE1CF]">
              {trip.members.length} người chốt
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function TripsContent() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // all, upcoming, past
  const { data: trips, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: () => api<TripDto[]>("/trips"),
  });

  const filteredTrips = trips?.filter((trip) => {
    if (filter === "all") return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = parseLocalDate(trip.startDate);
    if (filter === "upcoming") return start >= today;
    if (filter === "past") return start < today;
    return true;
  });

  return (
    <div className="min-h-dvh bg-[#FFF9F2] pb-16">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-1 text-left">
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#2B2118]">
              Chào {user?.name || "bạn"} 👋
            </h1>
            <p className="text-[#8A7563] text-sm font-semibold">Sắp tới tụi mình đi đâu chơi đây ta?</p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="shadow-lg shadow-brand-500/10 hover:scale-105 transition-transform self-start sm:self-auto">
            + Lên kèo mới
          </Button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {[
            { id: "all", label: "Tất cả kèo", icon: null },
            { id: "upcoming", label: "Sắp đi", icon: Backpack },
            { id: "past", label: "Kỷ niệm cũ", icon: Camera },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-5 py-2 rounded-full text-xs font-bold border-2 transition-all whitespace-nowrap ${
                filter === tab.id
                  ? "bg-brand-500 border-[#2B2118] text-white shadow-sm"
                  : "bg-white border-[#F3E3D3] text-[#8A7563] hover:bg-[#FFF3EB] hover:text-[#2B2118]"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                {tab.icon && (
                  <tab.icon
                    size={14}
                    strokeWidth={2.2}
                    className={filter === tab.id ? "text-white" : "text-brand-500"}
                  />
                )}
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Spinner className="size-10" />
          </div>
        ) : filteredTrips && filteredTrips.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip, idx) => (
              <TripCard key={trip.id} trip={trip} index={idx} />
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center gap-5 py-20 text-center max-w-md mx-auto border-2 border-[#F3E3D3] bg-white relative">
            {/* Washi tape sticker */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#FFE1CF]/80 border-b border-[#F3E3D3] rotate-2" />
            <span className="text-6xl animate-bounce">🧳</span>
            <div className="space-y-1.5 px-6">
              <p className="font-display font-extrabold text-xl text-[#2B2118]">Chưa có kèo nào hết trơn...</p>
              <p className="text-sm text-[#8A7563] leading-relaxed">
                Rủ ngay hội bạn thân vào lên kế hoạch ăn chơi, chia tiền sòng phẳng thôi nào!
              </p>
            </div>
            <Button onClick={() => setModalOpen(true)} className="shadow-md shadow-brand-500/10">
              Tạo chuyến đi đầu tiên 🚀
            </Button>
          </Card>
        )}
      </main>
      <NewTripModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default function TripsPage() {
  return (
    <RequireAuth>
      <TripsContent />
    </RequireAuth>
  );
}
