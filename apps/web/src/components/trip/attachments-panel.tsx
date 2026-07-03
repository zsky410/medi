"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AttachmentDto, CreateAttachmentInput, TripDetailDto } from "@medi/types";
import { api, ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { Button, Card, ErrorText, Input, Label, Modal, Spinner } from "@/components/ui";

function AddAttachmentModal({
  tripId,
  open,
  onClose,
}: {
  tripId: string;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (input: CreateAttachmentInput) =>
      api<AttachmentDto>(`/trips/${tripId}/attachments`, { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", tripId] });
      onClose();
      setUrl("");
      setName("");
      setError("");
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Không thêm được file"),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate({ url, name: name || undefined, type: "link" });
  }

  return (
    <Modal open={open} onClose={onClose} title="Đính kèm link 📎">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="att-url">URL (Google Drive, ảnh, PDF...)</Label>
          <Input id="att-url" type="text" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://... hoặc ghi chú" />
        </div>
        <div>
          <Label htmlFor="att-name">Tên gợi nhớ (tuỳ chọn)</Label>
          <Input id="att-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Vé máy bay, booking khách sạn..." />
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? "Đang lưu..." : "Đính kèm"}
        </Button>
      </form>
    </Modal>
  );
}

export function AttachmentsPanel({ trip }: { trip: TripDetailDto }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const canEdit = trip.myRole !== "VIEWER";
  const isPro = user?.plan === "PRO";

  const { data: attachments, isLoading } = useQuery({
    queryKey: ["attachments", trip.id],
    queryFn: () => api<AttachmentDto[]>(`/trips/${trip.id}/attachments`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/trips/${trip.id}/attachments/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attachments", trip.id] }),
  });

  if (isLoading) {
    return <Spinner className="size-6" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-display font-extrabold text-[#2B2118]">Đính kèm 📎</h3>
        {canEdit && (
          <Button onClick={() => setModalOpen(true)} className="text-xs py-1.5 px-3">
            + Thêm
          </Button>
        )}
      </div>
      {!isPro && (
        <p className="text-[10px] font-bold text-[#8A7563] bg-[#FFF3EB] p-2 rounded-lg border border-[#FFE1CF]">
          FREE: tối đa 3 file · PRO: không giới hạn
        </p>
      )}
      {attachments && attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map((a) => (
            <Card key={a.id} className="flex items-center justify-between p-3 border border-[#F3E3D3] bg-white">
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1">
                <p className="text-sm font-bold text-brand-500 truncate">{a.name ?? a.url}</p>
                <p className="text-[10px] text-[#8A7563]">{a.uploaderName ?? "Ẩn danh"} · {formatDateTime(a.createdAt)}</p>
              </a>
              {canEdit && (
                <button
                  onClick={() => deleteMutation.mutate(a.id)}
                  className="ml-2 text-[#8A7563]/50 hover:text-red-500 text-xs"
                  aria-label="Xoá"
                >
                  ✕
                </button>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-xs font-semibold text-[#8A7563]/60">Chưa có file đính kèm</p>
      )}
      <AddAttachmentModal tripId={trip.id} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
