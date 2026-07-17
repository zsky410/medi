"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bed,
  Bus,
  ChevronRight,
  Layers,
  ShoppingBag,
  Ticket,
  Trash2,
  Utensils,
} from "lucide-react";
import { PLACE_CATEGORIES, type PlaceDto, type UpdatePlaceInput } from "@medi/types";
import { api } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/format";
import { Button, Input, Modal } from "@/components/ui";

const PLACE_CATEGORY_UI: Record<
  (typeof PLACE_CATEGORIES)[number],
  { label: string; icon: typeof Ticket }
> = {
  ATTRACTION: { label: "Tham quan", icon: Ticket },
  FOOD: { label: "Ẩm thực", icon: Utensils },
  LODGING: { label: "Chỗ ở", icon: Bed },
  TRANSPORT: { label: "Di chuyển", icon: Bus },
  SHOPPING: { label: "Mua sắm", icon: ShoppingBag },
  OTHER: { label: "Khác", icon: Layers },
};

export function PlaceCostModal({
  tripId,
  place,
  costDescription,
  onSaveCostDescription,
  onClose,
}: {
  tripId: string;
  place: PlaceDto | null;
  costDescription?: string;
  onSaveCostDescription: (description: string | undefined) => void;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("OTHER");
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!place) return;
    setAmount(place.cost != null ? String(place.cost) : "");
    setDescription(costDescription ?? "");
    setCategory(place.category);
    setPickerOpen(false);
  }, [place, costDescription]);

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
    onSaveCostDescription(description.trim() || undefined);
    mutation.mutate({
      cost: amount ? Number(amount) : null,
      category: category as UpdatePlaceInput["category"],
    });
  }

  function onDeleteCost() {
    onSaveCostDescription(undefined);
    mutation.mutate({ cost: null });
  }

  const categoryUi =
    PLACE_CATEGORY_UI[category as keyof typeof PLACE_CATEGORY_UI] ?? PLACE_CATEGORY_UI.OTHER;
  const CategoryIcon = categoryUi.icon;

  return (
    <Modal open={!!place} onClose={onClose} title="Thêm chi phí">
      {pickerOpen ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <button type="button" onClick={() => setPickerOpen(false)} className="text-sm font-bold text-[#6B7280]">
              ←
            </button>
            <p className="text-sm font-extrabold text-[#111827]">Chọn danh mục</p>
            <span className="w-6" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PLACE_CATEGORIES.map((c) => {
              const ui = PLACE_CATEGORY_UI[c];
              const Icon = ui.icon;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCategory(c);
                    setPickerOpen(false);
                  }}
                  className="flex flex-col items-center gap-1 rounded-xl bg-[#F3F4F6] px-2 py-3 text-center hover:bg-[#E5E7EB]"
                >
                  <Icon size={20} className="text-[#374151]" />
                  <span className="text-[10px] font-bold text-[#374151]">{ui.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex overflow-hidden rounded-xl border-2 border-brand-300">
            <span className="flex items-center border-r border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm font-bold text-[#374151]">
              đ
            </span>
            <Input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="border-0 focus:ring-0"
            />
          </div>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-[#E5E7EB] px-3 py-3 text-left hover:bg-[#F9FAFB]"
          >
            <CategoryIcon size={18} className="text-[#6B7280]" />
            <span className="flex-1 text-sm font-semibold text-[#374151]">
              {CATEGORY_LABELS[category] ?? categoryUi.label}
            </span>
            <ChevronRight size={16} className="text-[#9CA3AF]" />
          </button>

          <div>
            <label className="mb-1 block text-xs font-bold text-[#6B7280]">Thêm mô tả chi phí</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú riêng cho khoản chi này..."
              rows={3}
              className="w-full resize-y rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm font-medium text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 gap-2"
              onClick={onDeleteCost}
              disabled={mutation.isPending || place?.cost == null}
            >
              <Trash2 size={16} />
              Xóa
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
