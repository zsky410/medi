"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PLACE_CATEGORIES, type PlaceDto, type UpdatePlaceInput } from "@medi/types";
import { api } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/format";
import { Button, Input, Label, Modal } from "@/components/ui";

export function PlaceEditModal({
  tripId,
  place,
  onClose,
}: {
  tripId: string;
  place: PlaceDto | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("OTHER");
  const [note, setNote] = useState("");
  const [cost, setCost] = useState("");

  useEffect(() => {
    if (place) {
      setName(place.name);
      setCategory(place.category);
      setNote(place.note ?? "");
      setCost(place.cost != null ? String(place.cost) : "");
    }
  }, [place]);

  const mutation = useMutation({
    mutationFn: (input: UpdatePlaceInput) =>
      api(`/trips/${tripId}/places/${place!.id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      onClose();
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate({
      name,
      category: category as UpdatePlaceInput["category"],
      note: note || null,
      cost: cost ? Number(cost) : null,
    });
  }

  return (
    <Modal open={!!place} onClose={onClose} title="Chỉnh sửa địa điểm">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="place-name">Tên địa điểm</Label>
          <Input id="place-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="place-category">Phân loại</Label>
          <select
            id="place-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500"
          >
            {PLACE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="place-note">Ghi chú</Label>
          <Input id="place-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Đặt bàn trước, mở cửa 8h..." />
        </div>
        <div>
          <Label htmlFor="place-cost">Chi phí dự kiến (VND)</Label>
          <Input id="place-cost" type="number" min="0" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0" />
        </div>
        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </form>
    </Modal>
  );
}
