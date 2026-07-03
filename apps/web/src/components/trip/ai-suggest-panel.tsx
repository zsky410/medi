"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePlaceInput, SuggestPlacesResultDto, TripDetailDto } from "@medi/types";
import { api, ApiError } from "@/lib/api";
import { Button, ErrorText } from "@/components/ui";

export function AiSuggestPanel({ trip, canEdit }: { trip: TripDetailDto; canEdit: boolean }) {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestPlacesResultDto | null>(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState<string | null>(null);

  const suggestMutation = useMutation({
    mutationFn: () =>
      api<SuggestPlacesResultDto>(`/ai/trips/${trip.id}/suggest-places`, {
        method: "POST",
        body: JSON.stringify({ prompt: prompt || undefined, limit: 5 }),
      }),
    onSuccess: (data) => {
      setSuggestions(data);
      setError("");
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Không gợi ý được"),
  });

  const optimizeMutation = useMutation({
    mutationFn: () =>
      api(`/ai/trips/${trip.id}/optimize-route`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trip", trip.id] }),
    onError: (err) => setError(err instanceof ApiError ? err.message : "Không tối ưu được"),
  });

  async function addSuggestion(s: SuggestPlacesResultDto["suggestions"][number], index: number) {
    const key = `${s.name}-${index}`;
    setAdding(key);
    try {
      const dayId = trip.days[0]?.id ?? null;
      const input: CreatePlaceInput = {
        dayId,
        name: s.name,
        lat: s.lat ?? undefined,
        lng: s.lng ?? undefined,
        category: s.category,
        note: s.note ?? undefined,
        cost: s.cost ?? undefined,
      };
      await api(`/trips/${trip.id}/places`, { method: "POST", body: JSON.stringify(input) });
      queryClient.invalidateQueries({ queryKey: ["trip", trip.id] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thêm được địa điểm");
    } finally {
      setAdding(null);
    }
  }

  if (!canEdit) return null;

  return (
    <div className="rounded-2xl border-2 border-[#F3E3D3] bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-display font-extrabold text-[#2B2118]">AI gợi ý địa điểm ✨</h3>
        <Button
          variant="secondary"
          className="text-xs py-1 px-2.5"
          disabled={optimizeMutation.isPending}
          onClick={() => optimizeMutation.mutate()}
        >
          {optimizeMutation.isPending ? "Đang tối ưu..." : "Tối ưu lộ trình"}
        </Button>
      </div>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="VD: quán cà phê view đẹp, đặc sản địa phương..."
        className="w-full rounded-xl border border-[#F3E3D3] px-3 py-2 text-sm font-semibold outline-none focus:border-brand-500"
      />
      <Button
        onClick={() => suggestMutation.mutate()}
        disabled={suggestMutation.isPending}
        className="w-full text-sm"
      >
        {suggestMutation.isPending ? "Đang tìm..." : "Gợi ý cho tôi"}
      </Button>
      <ErrorText>{error}</ErrorText>
      {suggestions && (
        <div className="space-y-2 pt-1">
          <p className="text-[10px] font-bold text-[#8A7563]">
            Gợi ý từ {suggestions.provider === "openai" ? "OpenAI" : "mock AI"}
          </p>
          {suggestions.suggestions.map((s, i) => (
            <div key={`${s.name}-${i}`} className="flex items-center justify-between gap-2 rounded-xl bg-[#FFF9F2] p-2.5 border border-[#F3E3D3]">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#2B2118] truncate">{s.name}</p>
                {s.note && <p className="text-[10px] text-[#8A7563] truncate">{s.note}</p>}
              </div>
              <Button
                variant="secondary"
                className="text-xs py-1 px-2 shrink-0"
                disabled={adding === `${s.name}-${i}`}
                onClick={() => addSuggestion(s, i)}
              >
                {adding === `${s.name}-${i}` ? "..." : "+ Thêm"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
