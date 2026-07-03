"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChecklistItemDto, ChecklistType, TripDetailDto } from "@medi/types";
import { api } from "@/lib/api";
import { Button, Card, Input, Spinner } from "@/components/ui";

function ChecklistColumn({
  trip,
  type,
  title,
  placeholder,
  items,
  canEdit,
  icon,
}: {
  trip: TripDetailDto;
  type: ChecklistType;
  title: string;
  placeholder: string;
  items: ChecklistItemDto[];
  canEdit: boolean;
  icon: string;
}) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["checklist", trip.id] });

  const createMutation = useMutation({
    mutationFn: () =>
      api(`/trips/${trip.id}/checklist`, { method: "POST", body: JSON.stringify({ text, type }) }),
    onSuccess: () => {
      setText("");
      invalidate();
    },
  });
  const toggleMutation = useMutation({
    mutationFn: (item: ChecklistItemDto) =>
      api(`/trips/${trip.id}/checklist/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ checked: !item.checked }),
      }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (itemId: string) =>
      api(`/trips/${trip.id}/checklist/${itemId}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (text.trim()) createMutation.mutate();
  }

  const done = items.filter((i) => i.checked).length;
  const isAllDone = items.length > 0 && done === items.length;

  return (
    <Card className="p-5 border-2 border-[#F3E3D3] bg-white relative overflow-hidden flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-md transition-shadow">
      {/* Ruled notebook paper lines background effect */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(#2B2118_1px,transparent_1px)] bg-[size:100%_2rem] z-0" />

      <div className="z-10 flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display font-extrabold text-lg text-[#2B2118] flex items-center gap-2">
            <span>{icon}</span>
            <span>{title}</span>
          </h3>
          <span className="text-xs font-extrabold text-brand-500 bg-[#FFF3EB] px-2.5 py-1 rounded-full border border-[#FFE1CF]">
            {done}/{items.length} xong
          </span>
        </div>

        {canEdit && (
          <form onSubmit={onSubmit} className="mb-4 flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              className="text-xs py-2 px-3"
            />
            <Button type="submit" disabled={createMutation.isPending || !text.trim()} className="text-xs py-2 px-4 whitespace-nowrap">
              Thêm ➕
            </Button>
          </form>
        )}

        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="group flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[#FFF9F2] transition-colors border border-transparent hover:border-[#F3E3D3]/40">
              <input
                type="checkbox"
                checked={item.checked}
                disabled={!canEdit}
                onChange={() => toggleMutation.mutate(item)}
                className="size-4 rounded accent-brand-500 cursor-pointer"
              />
              <span className={`flex-1 text-sm font-bold transition-all ${
                item.checked ? "text-[#8A7563]/50 line-through decoration-brand-500 decoration-2" : "text-[#2B2118]"
              }`}>
                {item.text}
              </span>
              {canEdit && (
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="rounded-full p-1 text-xs text-[#8A7563]/40 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                  aria-label="Xoá"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
          {items.length === 0 && (
            <li className="py-8 text-center text-xs font-bold text-[#8A7563]/40">Chưa có mục nào hết trơn...</li>
          )}
        </ul>
      </div>

      {/* All Done Stamp Celebration */}
      {isAllDone && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white/40 backdrop-blur-[0.5px] z-20">
          <div className="border-4 border-dashed border-brand-500 text-brand-500 font-display font-extrabold text-lg px-4 py-2 rounded-xl rotate-12 bg-white shadow-lg animate-in zoom-in-50 duration-200">
            SẴN SÀNG LÊN ĐƯỜNG! 🎉
          </div>
        </div>
      )}
    </Card>
  );
}

export function ChecklistTab({ trip }: { trip: TripDetailDto }) {
  const canEdit = trip.myRole !== "VIEWER";
  const { data: items, isLoading } = useQuery({
    queryKey: ["checklist", trip.id],
    queryFn: () => api<ChecklistItemDto[]>(`/trips/${trip.id}/checklist`),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-10" />
      </div>
    );
  }

  const todos = items?.filter((i) => i.type === "TODO") ?? [];
  const packing = items?.filter((i) => i.type === "PACKING") ?? [];

  return (
    <div className="grid gap-6 md:grid-cols-2 text-left">
      <ChecklistColumn trip={trip} type="TODO" title="Việc cần làm" placeholder="Đặt vé xe, đổi tiền..." items={todos} canEdit={canEdit} icon="✅" />
      <ChecklistColumn trip={trip} type="PACKING" title="Đồ cần mang" placeholder="Áo khoác, sạc dự phòng..." items={packing} canEdit={canEdit} icon="🎒" />
    </div>
  );
}
