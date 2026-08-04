"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, MapPin, Search } from "lucide-react";
import type {
  AiUsageDto,
  GenerateTripResultDto,
  GeoAutocompleteResult,
  GeoSearchResult,
  TripDestinationInput,
  TripPace,
} from "@medi/types";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { Button, ErrorText, Input, Label } from "@/components/ui";
import { RequireAuth } from "@/components/require-auth";
import { DateInput } from "@/components/date-input";

const INTEREST_OPTIONS = [
  { value: "coffee", label: "Cà phê" },
  { value: "photo", label: "Chụp ảnh" },
  { value: "local-food", label: "Ăn địa phương" },
  { value: "nature", label: "Thiên nhiên" },
  { value: "culture", label: "Văn hoá" },
  { value: "family", label: "Gia đình" },
  { value: "budget", label: "Tiết kiệm" },
  { value: "relax", label: "Chill" },
];

const PACE_OPTIONS: Array<{ value: TripPace; label: string }> = [
  { value: "relaxed", label: "Chill" },
  { value: "balanced", label: "Vừa đủ" },
  { value: "packed", label: "Dày lịch" },
];

function destinationFromGeo(result: GeoSearchResult | GeoAutocompleteResult): TripDestinationInput {
  return {
    placeId: result.providerId,
    name: result.name,
    address: result.address,
    ...(result.lat != null && result.lng != null ? { lat: result.lat, lng: result.lng } : {}),
  };
}

function warningText(result: GenerateTripResultDto | null): string | null {
  const metadata = result?.generationMetadata;
  if (!metadata) return null;
  const warnings = new Set([...(metadata.warnings ?? []), ...(metadata.fallbacks ?? [])]);
  if (warnings.has("web_research_disabled_or_unverified") || warnings.has("ai_web_research_disabled") || warnings.has("ai_web_research_unverified")) {
    return "Web research chưa được xác minh, kế hoạch ưu tiên dữ liệu Goong/catalog và một số ước tính.";
  }
  if (!metadata.usedDistanceMatrix) {
    return "Thời gian di chuyển đang dùng ước tính khi chưa có distance matrix.";
  }
  return null;
}

function AiContent() {
  const router = useRouter();
  const destinationRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [destinationQuery, setDestinationQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<TripDestinationInput | null>(null);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [resolvingDestination, setResolvingDestination] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [people, setPeople] = useState("2");
  const [interests, setInterests] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");
  const [pace, setPace] = useState<TripPace>("balanced");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateTripResultDto | null>(null);
  const [statusIdx, setStatusIdx] = useState(0);

  const { data: usage } = useQuery({
    queryKey: ["ai", "usage"],
    queryFn: () => api<AiUsageDto>("/ai/usage"),
  });

  const trimmedDestination = destinationQuery.trim();
  const { data: destinationOptions = [], isFetching: searchingDestination } = useQuery({
    queryKey: ["geo", "autocomplete", trimmedDestination],
    queryFn: () =>
      api<GeoAutocompleteResult[]>(`/geo/autocomplete?q=${encodeURIComponent(trimmedDestination)}`),
    enabled: trimmedDestination.length >= 2 && !selectedDestination,
    staleTime: 60_000,
  });

  const statuses = [
    "Hiểu yêu cầu...",
    "Tìm địa điểm quanh điểm đến...",
    "Xác minh địa điểm...",
    "Tối ưu lộ trình...",
    "Hoàn thiện kế hoạch...",
  ];

  const budgetNumber = Number(totalBudget);
  const peopleNumber = Number(people);
  const isFormValid = Boolean(
    selectedDestination &&
    startDate &&
    endDate &&
    endDate >= startDate &&
    Number.isFinite(budgetNumber) &&
    budgetNumber > 0 &&
    Number.isFinite(peopleNumber) &&
    peopleNumber > 0 &&
    interests.length > 0,
  );

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!destinationRef.current?.contains(e.target as Node)) setDestinationOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!generating) return;
    const statusTimer = setInterval(() => {
      setStatusIdx((i) => (i + 1) % statuses.length);
    }, 900);
    return () => clearInterval(statusTimer);
  }, [generating, statuses.length]);

  async function selectDestination(option: GeoAutocompleteResult) {
    setResolvingDestination(true);
    setError("");
    try {
      const detail = option.lat != null && option.lng != null
        ? ({ ...option, lat: option.lat, lng: option.lng } satisfies GeoSearchResult)
        : await api<GeoSearchResult>(`/geo/place?providerId=${encodeURIComponent(option.providerId)}`);
      const destination = destinationFromGeo(detail);
      setSelectedDestination(destination);
      setDestinationQuery([destination.name, destination.address].filter(Boolean).join(", "));
      setDestinationOpen(false);
    } catch (err) {
      setSelectedDestination(null);
      setError(err instanceof ApiError ? err.message : "Không lấy được tọa độ điểm đến");
    } finally {
      setResolvingDestination(false);
    }
  }

  async function handleGenerate() {
    if (!isFormValid || !selectedDestination) return;
    setGenerating(true);
    setStatusIdx(0);
    setError("");
    setResult(null);
    try {
      const data = await api<GenerateTripResultDto>("/ai/generate-trip", {
        method: "POST",
        body: JSON.stringify({
          destination: selectedDestination,
          startDate,
          endDate,
          totalBudget: budgetNumber,
          people: peopleNumber,
          interests,
          pace,
          ...(notes.trim() ? { notes: notes.trim() } : {}),
          ...(description.trim() ? { description: description.trim() } : {}),
        }),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không tạo được kèo");
    } finally {
      setGenerating(false);
    }
  }

  function toggleInterest(value: string) {
    setInterests((current) => (
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    ));
  }

  function resetForm() {
    setResult(null);
    setDestinationQuery("");
    setSelectedDestination(null);
    setStartDate("");
    setEndDate("");
    setTotalBudget("");
    setPeople("2");
    setInterests([]);
    setNotes("");
    setDescription("");
    setPace("balanced");
    setError("");
  }

  const remaining = user?.plan === "PRO"
    ? null
    : usage?.limit != null
      ? Math.max(usage.limit - usage.used, 0)
      : null;
  const resultWarning = warningText(result);
  const showDestinationDropdown = destinationOpen && !selectedDestination && trimmedDestination.length >= 2;

  return (
    <div className="min-h-dvh flex flex-col bg-[#FFF9F2] overflow-x-hidden">
      <AppHeader />
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 py-16 w-full text-left">
        <div className="text-center mb-10">
          <div className="inline-flex mb-3">
            <span className="bg-[#FF3D77] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md border-2 border-white rotate-2 animate-bounce">
              AI Trợ lý ✨
            </span>
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#2B2118] mb-3">Trợ lý Mê Đi ✨</h1>
          <p className="text-[#8A7563] text-lg font-bold">Chọn điểm đến, mình lên lịch đã xác minh</p>
          {usage?.provider && (
            <p className="text-xs font-bold text-[#8A7563]/70 mt-2">
              AI provider: {usage.provider === "openai" ? "OpenAI" : "mock (dev)"}
            </p>
          )}
        </div>

        {!result && !generating && (
          <div className="max-w-3xl mx-auto mb-8 space-y-4">
            <div className="bg-white rounded-3xl border-2 border-[#F3E3D3] p-5 sm:p-6 shadow-lg">
              <div ref={destinationRef} className="relative mb-4">
                <Label htmlFor="ai-destination">Điểm đến</Label>
                <div className="relative">
                  <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A7563]" />
                  <input
                    id="ai-destination"
                    type="text"
                    role="combobox"
                    aria-expanded={showDestinationDropdown}
                    aria-autocomplete="list"
                    value={destinationQuery}
                    onFocus={() => setDestinationOpen(true)}
                    onChange={(e) => {
                      setDestinationQuery(e.target.value);
                      setSelectedDestination(null);
                      setDestinationOpen(true);
                    }}
                    placeholder="Đà Lạt, Hội An, Phú Quốc..."
                    className="w-full rounded-xl border border-[#F3E3D3] bg-white py-2.5 pl-10 pr-10 text-sm font-semibold text-[#2B2118] outline-none placeholder:text-[#8A7563]/50 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                  />
                  {selectedDestination ? (
                    <CheckCircle2 size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                  ) : (
                    <Search size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A7563]" />
                  )}
                </div>
                {showDestinationDropdown && (
                  <div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-[#F3E3D3] bg-white py-1 shadow-lg">
                    {searchingDestination && (
                      <p className="px-3.5 py-2.5 text-sm font-semibold text-[#8A7563]">Đang tìm điểm đến...</p>
                    )}
                    {!searchingDestination && destinationOptions.map((option) => (
                      <button
                        key={option.providerId}
                        type="button"
                        className="w-full px-3.5 py-2.5 text-left hover:bg-[#FFF4EA]"
                        onClick={() => selectDestination(option)}
                      >
                        <span className="block text-sm font-bold text-[#2B2118]">{option.name}</span>
                        <span className="block text-xs font-semibold text-[#8A7563]">{option.address}</span>
                      </button>
                    ))}
                    {!searchingDestination && destinationOptions.length === 0 && (
                      <p className="px-3.5 py-2.5 text-sm font-semibold text-[#8A7563]">Không tìm thấy điểm đến phù hợp</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="ai-start-date">Ngày đi</Label>
                  <DateInput
                    id="ai-start-date"
                    value={startDate}
                    onChange={setStartDate}
                  />
                </div>
                <div>
                  <Label htmlFor="ai-end-date">Ngày về</Label>
                  <DateInput
                    id="ai-end-date"
                    min={startDate || undefined}
                    value={endDate}
                    onChange={setEndDate}
                  />
                </div>
                <div>
                  <Label htmlFor="ai-total-budget">Budget tổng</Label>
                  <Input
                    id="ai-total-budget"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    placeholder="5000000"
                  />
                </div>
                <div>
                  <Label htmlFor="ai-people">Số người</Label>
                  <Input
                    id="ai-people"
                    type="number"
                    min={1}
                    max={30}
                    inputMode="numeric"
                    value={people}
                    onChange={(e) => setPeople(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-5">
                <Label>Sở thích</Label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((item) => {
                    const selected = interests.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleInterest(item.value)}
                        className={`px-3.5 py-2 text-xs font-bold rounded-full border transition-colors ${
                          selected
                            ? "bg-[#FF6B2C] text-white border-[#FF6B2C]"
                            : "bg-[#FFF3EB] text-[#FF6B2C] border-[#FFE1CF] hover:bg-[#FFE1CF]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <Label>Nhịp đi</Label>
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#FFF3EB] p-1">
                  {PACE_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={pace === item.value}
                      onClick={() => setPace(item.value)}
                      className={`min-h-10 rounded-lg px-2 text-xs font-extrabold transition-all ${
                        pace === item.value
                          ? "bg-white text-[#2B2118] shadow-sm"
                          : "text-[#8A7563] hover:text-[#2B2118]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <Label htmlFor="ai-notes">Ghi chú</Label>
                <textarea
                  id="ai-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: không thuê xe máy, cần quán dễ đi bộ"
                  className="w-full resize-none rounded-xl border border-[#F3E3D3] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#2B2118] outline-none placeholder:text-[#8A7563]/50 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>

              <div className="mt-5">
                <Label htmlFor="ai-description">Mô tả thêm</Label>
                <textarea
                  id="ai-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: muốn có một buổi ngắm hoàng hôn"
                  className="w-full resize-none rounded-xl border border-[#F3E3D3] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#2B2118] outline-none placeholder:text-[#8A7563]/50 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>

              <ErrorText>{error}</ErrorText>
              {startDate && endDate && endDate < startDate && (
                <ErrorText>Ngày về phải sau ngày đi</ErrorText>
              )}
              <Button
                onClick={handleGenerate}
                disabled={!isFormValid || resolvingDestination}
                className="mt-4 w-full py-3.5 text-base btn-primary-glow font-extrabold"
              >
                Lên kèo thôi! ✈️
              </Button>
            </div>

            {user?.plan !== "PRO" && remaining != null && (
              <div className="bg-white rounded-2xl border-2 border-[#FFC93C] p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎟️</span>
                  <div>
                    <p className="text-sm font-extrabold text-[#2B2118]">Còn {remaining} lượt miễn phí hôm nay</p>
                    <p className="text-xs font-bold text-[#8A7563]">Lên PRO để tạo thả ga không giới hạn ✨</p>
                  </div>
                </div>
                <Link href="/pricing">
                  <Button className="text-xs py-1.5 px-3">Lên PRO</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {generating && (
          <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
            <div className="text-6xl inline-block animate-bounce">🛵</div>
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B2C] animate-ping" />
              <p className="text-[#8A7563] font-display font-extrabold text-lg">{statuses[statusIdx]}</p>
            </div>
          </div>
        )}

        {result && !generating && (
          <div className="max-w-xl mx-auto text-center space-y-6 animate-in fade-in">
            <div className="text-6xl">🎉</div>
            <div>
              <h2 className="font-display font-extrabold text-2xl text-[#2B2118]">{result.title}</h2>
              <p className="text-sm font-bold text-[#8A7563] mt-1">📍 {result.destination}</p>
              {result.remainingGenerations != null && (
                <p className="text-xs font-bold text-[#FF6B2C] mt-2">Còn {result.remainingGenerations} lượt AI hôm nay</p>
              )}
            </div>
            {resultWarning && (
              <div className="rounded-2xl border border-[#FFC93C] bg-white px-4 py-3 text-sm font-bold text-[#8A7563]">
                {resultWarning}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push(`/trips/${result.tripId}`)} className="font-extrabold">
                Xem kèo vừa tạo ✈️
              </Button>
              <Button
                variant="secondary"
                onClick={resetForm}
                className="font-extrabold"
              >
                Tạo kèo mới
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function AIPage() {
  return (
    <RequireAuth>
      <AiContent />
    </RequireAuth>
  );
}
