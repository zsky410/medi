"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ImportBookingResultDto, TripDetailDto } from "@medi/types";
import { api, ApiError } from "@/lib/api";
import { Button, ErrorText } from "@/components/ui";

export function ImportBookingPanel({ trip, canEdit }: { trip: TripDetailDto; canEdit: boolean }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [result, setResult] = useState<ImportBookingResultDto | null>(null);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api<ImportBookingResultDto>(`/trips/${trip.id}/import/parse-text`, {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
    onSuccess: (data) => {
      setResult(data);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["trip", trip.id] });
      queryClient.invalidateQueries({ queryKey: ["attachments", trip.id] });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Không phân tích được"),
  });

  if (!canEdit) return null;

  return (
    <div className="rounded-2xl border-2 border-dashed border-[#FFC93C] bg-[#FFFBF0] p-4 space-y-3">
      <h3 className="text-sm font-display font-extrabold text-[#2B2118]">Import booking 📧</h3>
      <p className="text-[10px] font-bold text-[#8A7563]">
        Dán nội dung email xác nhận (vé máy bay, khách sạn...) hoặc forward tới webhook API.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Dán email xác nhận đặt chỗ vào đây..."
        className="w-full resize-none rounded-xl border border-[#F3E3D3] bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-brand-500"
      />
      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || text.trim().length < 20}
        className="w-full text-sm"
      >
        {mutation.isPending ? "Đang phân tích..." : "Phân tích & thêm vào lịch trình"}
      </Button>
      <ErrorText>{error}</ErrorText>
      {result && result.placesCreated > 0 && (
        <p className="text-xs font-bold text-brand-600">
          Đã thêm {result.placesCreated} địa điểm và {result.attachmentsCreated} đính kèm booking ✓
        </p>
      )}
      {result && result.placesCreated === 0 && (
        <p className="text-xs font-bold text-[#8A7563]">Không nhận diện được booking trong nội dung. Thử dán đầy đủ email xác nhận.</p>
      )}
    </div>
  );
}
