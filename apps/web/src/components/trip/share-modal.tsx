"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TripDetailDto, TripVisibility } from "@medi/types";
import { api } from "@/lib/api";
import { Button, Modal } from "@/components/ui";

const OPTIONS: { value: TripVisibility; label: string; desc: string }[] = [
  { value: "PRIVATE", label: "Riêng tư", desc: "Chỉ thành viên chuyến đi xem được" },
  { value: "LINK", label: "Ai có link", desc: "Bất kỳ ai có link đều xem được (không hiện công khai)" },
  { value: "PUBLIC", label: "Công khai", desc: "Mọi người xem được và sao chép lịch trình của bạn" },
];

export function ShareModal({
  trip,
  open,
  onClose,
}: {
  trip: TripDetailDto;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const canEdit = trip.myRole !== "VIEWER";
  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/t/${trip.id}` : "";

  const mutation = useMutation({
    mutationFn: (visibility: TripVisibility) =>
      api(`/trips/${trip.id}`, { method: "PATCH", body: JSON.stringify({ visibility }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trip", trip.id] }),
  });

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal open={open} onClose={onClose} title="Chia sẻ lịch trình">
      <div className="space-y-4">
        <div className="space-y-2">
          {OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                trip.visibility === opt.value ? "border-brand-500 bg-brand-50" : "border-stone-200"
              } ${!canEdit ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="visibility"
                checked={trip.visibility === opt.value}
                disabled={!canEdit || mutation.isPending}
                onChange={() => mutation.mutate(opt.value)}
                className="mt-1 accent-brand-600"
              />
              <span>
                <span className="block text-sm font-semibold text-stone-800">{opt.label}</span>
                <span className="block text-xs text-stone-500">{opt.desc}</span>
              </span>
            </label>
          ))}
        </div>

        {trip.visibility !== "PRIVATE" && (
          <div>
            <p className="mb-1 text-sm font-medium text-stone-700">Link chia sẻ công khai</p>
            <div className="flex items-center gap-2 rounded-lg bg-stone-100 p-2">
              <span className="min-w-0 flex-1 truncate text-xs text-stone-600">{publicUrl}</span>
              <Button variant="secondary" onClick={copyLink} className="shrink-0 px-3 py-1 text-xs">
                {copied ? "Đã sao chép ✓" : "Sao chép"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-stone-400">
              Người xem có thể sao chép lịch trình này về tài khoản của họ — một cách hay để chia sẻ kinh nghiệm du lịch của bạn.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
