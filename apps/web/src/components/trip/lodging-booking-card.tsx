"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AttachmentDto, BookingMetadata, UpdateAttachmentInput } from "@medi/types";
import { api } from "@/lib/api";
import { getBookingMetadata, getBookingTitle, isExternalUrl } from "@/lib/booking-display";
import {
  InlineAmountField,
  InlineDateField,
  InlineTextField,
} from "@/components/trip/inline-booking-fields";
import { ExternalLink, Paperclip, Trash2 } from "lucide-react";

export function LodgingBookingCard({
  att,
  tripId,
  canEdit,
  onDelete,
}: {
  att: AttachmentDto;
  tripId: string;
  canEdit: boolean;
  onDelete: () => void;
}) {
  const queryClient = useQueryClient();
  const meta = getBookingMetadata(att) ?? { currency: "VND" as const };

  const saveMutation = useMutation({
    mutationFn: (input: UpdateAttachmentInput) =>
      api<AttachmentDto>(`/trips/${tripId}/attachments/${att.id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", tripId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId, "summary"] });
    },
  });

  const patch = useCallback(
    (input: UpdateAttachmentInput) => {
      if (!canEdit) return;
      saveMutation.mutate(input);
    },
    [canEdit, saveMutation],
  );

  const patchMeta = useCallback(
    (partial: Partial<BookingMetadata>) => {
      patch({ metadata: partial });
    },
    [patch],
  );

  const propertyName = getBookingTitle(att);
  const streetAddress = meta.address ?? "";

  return (
    <div
      id={`lodging-booking-${att.id}`}
      className="group relative scroll-mt-4 rounded-2xl border border-[#E0E0E0] bg-[#F3F3F3] p-4 transition-shadow sm:p-5"
    >
      {canEdit && (
        <button
          type="button"
          onClick={onDelete}
          className="absolute right-3 top-3 rounded-full p-1.5 text-[#8A7563] opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 cursor-pointer"
          aria-label="Xoá"
        >
          <Trash2 size={16} />
        </button>
      )}

      <div className="grid gap-4 sm:grid-cols-2 pr-6">
        <div className="space-y-4">
          <InlineTextField
            label="Địa chỉ khách sạn hoặc chỗ ở"
            value={propertyName === "Đặt chỗ" ? "" : propertyName}
            placeholder="Tên homestay, khách sạn..."
            canEdit={canEdit}
            onSave={(name) => patch({ name: name.trim() || "Đặt chỗ" })}
          />

          <InlineTextField
            label="Địa chỉ chi tiết"
            value={streetAddress}
            placeholder="Số nhà, đường, phường, tỉnh..."
            canEdit={canEdit}
            onSave={(address) => patchMeta({ address: address.trim() || undefined })}
          />

          <div className="grid grid-cols-2 gap-3">
            <InlineDateField
              label="Nhận phòng"
              value={meta.startDate ?? ""}
              placeholder="Chọn ngày"
              canEdit={canEdit}
              onSave={(startDate) => patchMeta({ startDate: startDate || undefined })}
            />
            <InlineDateField
              label="Trả phòng"
              value={meta.endDate ?? ""}
              placeholder="Chọn ngày"
              canEdit={canEdit}
              min={meta.startDate}
              onSave={(endDate) => patchMeta({ endDate: endDate || undefined })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <InlineTextField
            label="Mã xác nhận"
            value={meta.confirmationCode ?? ""}
            placeholder="6024816143"
            canEdit={canEdit}
            onSave={(confirmationCode) =>
              patchMeta({ confirmationCode: confirmationCode.trim() || undefined })
            }
          />

          <InlineTextField
            label="Ghi chú"
            value={meta.note ?? ""}
            placeholder="Thêm ghi chú bổ sung ở đây"
            canEdit={canEdit}
            multiline
            onSave={(note) => patchMeta({ note: note.trim() || undefined })}
          />

          <InlineAmountField
            label="Chi phí"
            value={meta.amount}
            canEdit={canEdit}
            onSave={(amount) => patchMeta({ amount, currency: "VND" })}
          />

          {(isExternalUrl(att.url) || canEdit) && (
            <div>
              <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wide text-[#8A7563]">
                Tệp đính kèm
              </p>
              {isExternalUrl(att.url) ? (
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#E8DDD3] bg-white px-3 py-2 text-sm font-bold text-[#2B2118] hover:border-brand-300 hover:text-brand-600 transition-colors"
                >
                  <Paperclip size={15} />
                  Mở link đặt chỗ
                  <ExternalLink size={13} className="text-[#8A7563]" />
                </a>
              ) : canEdit ? (
                <InlineTextField
                  label=""
                  value=""
                  placeholder="Dán link booking.com, email..."
                  canEdit={canEdit}
                  onSave={(url) => {
                    const trimmed = url.trim();
                    if (!trimmed) return;
                    const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
                    patch({ url: normalized });
                  }}
                />
              ) : null}
            </div>
          )}
        </div>
      </div>

      {saveMutation.isPending && (
        <p className="mt-3 text-[10px] font-semibold text-[#8A7563]">Đang lưu...</p>
      )}
    </div>
  );
}
