"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { AiUsageDto, GenerateTripResultDto } from "@medi/types";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { Button, ErrorText } from "@/components/ui";
import { RequireAuth } from "@/components/require-auth";

function AiContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateTripResultDto | null>(null);
  const [statusIdx, setStatusIdx] = useState(0);

  const { data: usage } = useQuery({
    queryKey: ["ai", "usage"],
    queryFn: () => api<AiUsageDto>("/ai/usage"),
  });

  const statuses = [
    "Đang lụm quán cà phê view đồi... ☕",
    "Tìm homestay giá tốt... 🏠",
    "Xếp lịch cho hợp lý... 🗓",
    "Tính budget sơ bộ... 💰",
  ];

  useEffect(() => {
    if (!generating) return;
    const statusTimer = setInterval(() => {
      setStatusIdx((i) => (i + 1) % statuses.length);
    }, 700);
    return () => clearInterval(statusTimer);
  }, [generating, statuses.length]);

  async function handleGenerate() {
    if (!input.trim()) return;
    setGenerating(true);
    setError("");
    setResult(null);
    try {
      const data = await api<GenerateTripResultDto>("/ai/generate-trip", {
        method: "POST",
        body: JSON.stringify({ prompt: input }),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không tạo được kèo");
    } finally {
      setGenerating(false);
    }
  }

  const remaining = user?.plan === "PRO"
    ? null
    : usage?.limit != null
      ? Math.max(usage.limit - usage.used, 0)
      : null;

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
          <p className="text-[#8A7563] text-lg font-bold">Kể mình nghe, mình lên kèo cho</p>
          {usage?.provider && (
            <p className="text-xs font-bold text-[#8A7563]/70 mt-2">
              AI provider: {usage.provider === "openai" ? "OpenAI" : "mock (dev)"}
            </p>
          )}
        </div>

        {!result && !generating && (
          <div className="max-w-2xl mx-auto mb-8 space-y-4">
            <div className="bg-white rounded-3xl border-2 border-[#F3E3D3] p-6 shadow-lg">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
                placeholder="Kể mình nghe chuyến đi trong mơ của bạn... Ví dụ: 3 ngày Đà Lạt, 2 đứa, 5 triệu, mê cà phê với sống ảo"
                className="w-full resize-none outline-none text-[#2B2118] placeholder:text-[#8A7563]/50 text-base font-semibold leading-relaxed"
              />
              <div className="flex flex-wrap gap-2 mb-6 mt-3">
                {["3 ngày", "5 triệu", "Mê cà phê", "Đi 2 đứa", "Solo trip", "Gia đình 4 người"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setInput((p) => (p ? `${p}, ${c}` : c))}
                    className="px-3.5 py-1.5 bg-[#FFF3EB] text-[#FF6B2C] text-xs font-bold rounded-full border border-[#FFE1CF] hover:bg-[#FFE1CF] transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
              <ErrorText>{error}</ErrorText>
              <Button onClick={handleGenerate} className="w-full py-3.5 text-base btn-primary-glow font-extrabold">
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
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push(`/trips/${result.tripId}`)} className="font-extrabold">
                Xem kèo vừa tạo ✈️
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setResult(null);
                  setInput("");
                }}
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
