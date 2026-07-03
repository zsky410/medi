"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bed,
  Car,
  MoreHorizontal,
  Paperclip,
  Plane,
  Sparkles,
  TrainFront,
  type LucideIcon,
} from "lucide-react";
import type {
  AttachmentDto,
  BookingAttachmentType,
  BookingMetadata,
  BudgetSummaryDto,
  CreateAttachmentInput,
  TripDetailDto,
  UpdateTripInput,
} from "@medi/types";
import { BOOKING_ATTACHMENT_TYPES } from "@medi/types";
import { api, ApiError } from "@/lib/api";
import { sumBookingAmounts } from "@/lib/booking-display";
import { formatMoney } from "@/lib/format";
import { Button, Card, ErrorText, Input, Label, Modal, Spinner } from "@/components/ui";
import { DateInput } from "@/components/date-input";
import { TripBookingsBoard } from "@/components/trip/trip-bookings-board";

const CATEGORIES: {
  type: BookingAttachmentType;
  label: string;
  icon: LucideIcon;
  hint: string;
}[] = [
  { type: "flight", label: "Chuyến bay", icon: Plane, hint: "Vé máy bay, mã đặt chỗ, link check-in" },
  { type: "lodging", label: "Chỗ ở", icon: Bed, hint: "Khách sạn, homestay, Airbnb..." },
  { type: "car", label: "Xe thuê", icon: Car, hint: "Thuê xe, grab charter, xe đưa đón" },
  { type: "train", label: "Tàu / xe", icon: TrainFront, hint: "Vé tàu, xe khách, limousine, phà" },
  { type: "link", label: "Tệp đính kèm", icon: Paperclip, hint: "Link Google Drive, PDF, ảnh vé..." },
  { type: "other", label: "Khác", icon: MoreHorizontal, hint: "Tour, vé tham quan, dịch vụ khác" },
];

const TRANSPORT_TYPES = new Set<BookingAttachmentType>(["flight", "car", "train"]);

function buildBookingUrl(link: string): string {
  const trimmed = link.trim();
  if (!trimmed) return `medi://booking/${Date.now()}`;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

function AddBookingModal({
  tripId,
  type,
  open,
  onClose,
}: {
  tripId: string;
  type: BookingAttachmentType;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const category = CATEGORIES.find((c) => c.type === type)!;
  const isLodging = type === "lodging";
  const isTransport = TRANSPORT_TYPES.has(type);

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [address, setAddress] = useState("");
  const [fromPlace, setFromPlace] = useState("");
  const [toPlace, setToPlace] = useState("");
  const [provider, setProvider] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (input: CreateAttachmentInput) =>
      api<AttachmentDto>(`/trips/${tripId}/attachments`, { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", tripId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId, "summary"] });
      onClose();
      setTitle("");
      setLink("");
      setConfirmation("");
      setAddress("");
      setFromPlace("");
      setToPlace("");
      setProvider("");
      setStartDate("");
      setEndDate("");
      setStartTime("");
      setEndTime("");
      setAmount("");
      setNote("");
      setError("");
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Không lưu được"),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const metadata: BookingMetadata = {
      currency: "VND",
      ...(confirmation.trim() ? { confirmationCode: confirmation.trim() } : {}),
      ...(address.trim() ? { address: address.trim() } : {}),
      ...(fromPlace.trim() ? { fromPlace: fromPlace.trim() } : {}),
      ...(toPlace.trim() ? { toPlace: toPlace.trim() } : {}),
      ...(provider.trim() ? { provider: provider.trim() } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(startTime.trim() ? { startTime: startTime.trim() } : {}),
      ...(endTime.trim() ? { endTime: endTime.trim() } : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
    };

    const parsedAmount = Number(amount.replace(/\D/g, ""));
    if (parsedAmount > 0) metadata.amount = parsedAmount;

    mutation.mutate({
      type,
      url: buildBookingUrl(link),
      name: title.trim(),
      metadata,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={`Thêm ${category.label.toLowerCase()}`}>
      <p className="mb-4 text-xs font-semibold text-[#8A7563]">{category.hint}</p>
      <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <Label htmlFor="booking-title">Tên / mô tả</Label>
          <Input
            id="booking-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isLodging ? "OHAYOU DALAT HOMESTAY" : "VD: Vietnam Airlines HAN → DAD"}
          />
        </div>

        {isLodging && (
          <div>
            <Label htmlFor="booking-address">Địa chỉ</Label>
            <Input
              id="booking-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, phường, thành phố..."
            />
          </div>
        )}

        {isTransport && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="booking-from">Điểm đi</Label>
              <Input id="booking-from" value={fromPlace} onChange={(e) => setFromPlace(e.target.value)} placeholder="Đà Nẵng" />
            </div>
            <div>
              <Label htmlFor="booking-to">Điểm đến</Label>
              <Input id="booking-to" value={toPlace} onChange={(e) => setToPlace(e.target.value)} placeholder="Đà Lạt" />
            </div>
          </div>
        )}

        {isTransport && (
          <div>
            <Label htmlFor="booking-provider">Nhà xe / hãng</Label>
            <Input id="booking-provider" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Phương Trang, Vietnam Airlines..." />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{isLodging ? "Nhận phòng" : "Ngày đi"}</Label>
            <DateInput value={startDate} onChange={setStartDate} />
          </div>
          <div>
            <Label>{isLodging ? "Trả phòng" : "Ngày về"}</Label>
            <DateInput value={endDate} onChange={setEndDate} min={startDate || undefined} />
          </div>
        </div>

        {isTransport && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="booking-start-time">Giờ đi</Label>
              <Input id="booking-start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="17:30" />
            </div>
            <div>
              <Label htmlFor="booking-end-time">Giờ đến</Label>
              <Input id="booking-end-time" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="08:00" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="booking-code">Mã đặt chỗ</Label>
            <Input id="booking-code" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="ABC123" />
          </div>
          <div>
            <Label htmlFor="booking-amount">Chi phí (VND)</Label>
            <Input
              id="booking-amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="870000"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="booking-link">Link đặt chỗ (tuỳ chọn)</Label>
          <Input id="booking-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="booking.com, email xác nhận..." />
        </div>

        <div>
          <Label htmlFor="booking-note">Ghi chú thêm (tuỳ chọn)</Label>
          <Input id="booking-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Phòng 302, liên hệ..." />
        </div>

        {amount.replace(/\D/g, "") && (
          <p className="text-xs font-semibold text-brand-600 bg-brand-50 rounded-xl px-3 py-2 border border-brand-100">
            Chi phí này sẽ tự động thêm vào tab Chi phí để tính ngân sách.
          </p>
        )}

        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? "Đang lưu..." : "Lưu đặt chỗ"}
        </Button>
      </form>
    </Modal>
  );
}

function BudgetModal({
  trip,
  open,
  onClose,
}: {
  trip: TripDetailDto;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState(trip.budgetAmount?.toString() ?? "");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (input: UpdateTripInput) =>
      api<TripDetailDto>(`/trips/${trip.id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", trip.id] });
      onClose();
      setError("");
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Không cập nhật được"),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount.replace(/\D/g, ""));
    if (!value || value <= 0) {
      setError("Nhập số tiền hợp lệ");
      return;
    }
    mutation.mutate({ budgetAmount: value, budgetCurrency: "VND" });
  }

  return (
    <Modal open={open} onClose={onClose} title="Lập ngân sách dự kiến">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-xs font-semibold text-[#8A7563]">
          Tổng ngân sách dự kiến cho cả nhóm. Mê Đi so sánh với chi phí đặt chỗ và chi tiêu thực tế.
        </p>
        <div>
          <Label htmlFor="budget-amount">Số tiền (VND)</Label>
          <Input
            id="budget-amount"
            inputMode="numeric"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="VD: 5000000"
          />
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? "Đang lưu..." : "Lưu ngân sách"}
        </Button>
      </form>
    </Modal>
  );
}

export function TripSetupPanel({
  trip,
  canEdit,
  onViewExpenses,
}: {
  trip: TripDetailDto;
  canEdit: boolean;
  onViewExpenses: () => void;
}) {
  const [addType, setAddType] = useState<BookingAttachmentType | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);

  const { data: attachments, isLoading } = useQuery({
    queryKey: ["attachments", trip.id],
    queryFn: () => api<AttachmentDto[]>(`/trips/${trip.id}/attachments`),
  });

  const { data: summary } = useQuery({
    queryKey: ["expenses", trip.id, "summary"],
    queryFn: () => api<BudgetSummaryDto>(`/trips/${trip.id}/expenses/summary`),
  });

  const counts = useMemo(() => {
    const map = new Map<BookingAttachmentType, number>();
    for (const c of CATEGORIES) map.set(c.type, 0);
    attachments?.forEach((a) => {
      const t = (BOOKING_ATTACHMENT_TYPES.includes(a.type as BookingAttachmentType)
        ? a.type
        : "other") as BookingAttachmentType;
      map.set(t, (map.get(t) ?? 0) + 1);
    });
    return map;
  }, [attachments]);

  const displayAttachments = attachments ?? [];

  const bookingsTotal = sumBookingAmounts(displayAttachments.filter((a) => a.type !== "link"));
  const spent = summary?.total ?? 0;
  const budget = trip.budgetAmount;
  const budgetPercent = budget && budget > 0 ? Math.round((spent / budget) * 100) : null;

  function handleCategoryClick(type: BookingAttachmentType) {
    if (canEdit) setAddType(type);
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-2 border-[#F3E3D3] bg-[#F8F8F8] p-4 sm:p-5">
            <h3 className="mb-1 text-sm font-display font-extrabold text-[#2B2118]">
              Đặt chỗ và tệp đính kèm
            </h3>
            <p className="mb-4 text-[10px] font-semibold text-[#8A7563]">
              Thêm vé, khách sạn đã mua — hiện ngay bên dưới và tính vào chi phí
            </p>
            {isLoading ? (
              <Spinner className="size-6" />
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {CATEGORIES.map(({ type, label, icon: Icon }) => {
                  const count = counts.get(type) ?? 0;
                  const muted = type === "link" || type === "other";
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleCategoryClick(type)}
                      disabled={!canEdit}
                      className={`group relative flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors cursor-pointer disabled:cursor-default disabled:opacity-50 ${
                        muted ? "text-[#8A7563]/70 hover:bg-white/80" : "text-[#2B2118] hover:bg-white"
                      }`}
                    >
                      <span className="relative flex size-10 items-center justify-center rounded-full bg-white shadow-sm border border-[#F3E3D3] group-hover:border-brand-200 transition-colors">
                        <Icon size={20} strokeWidth={1.75} className={muted ? "text-[#8A7563]" : "text-[#2B2118]"} />
                        {count > 0 && (
                          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-extrabold text-white">
                            {count}
                          </span>
                        )}
                        {type === "link" && count === 0 && (
                          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brand-500 text-white">
                            <Sparkles size={10} />
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] font-bold text-center leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="border-2 border-[#F3E3D3] bg-[#F8F8F8] p-4 sm:p-5 flex flex-col justify-between min-h-[140px]">
            <div>
              <h3 className="text-sm font-display font-extrabold text-[#2B2118]">Lập ngân sách</h3>
              <button
                type="button"
                onClick={() => (canEdit ? setBudgetOpen(true) : undefined)}
                className={`mt-3 block text-left ${canEdit ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
              >
                {budget ? (
                  <p className="text-2xl font-display font-extrabold text-[#5C534A]">
                    {formatMoney(budget, trip.budgetCurrency)}
                  </p>
                ) : (
                  <p className="text-sm font-bold text-[#8A7563]">
                    {canEdit ? "Nhấn để đặt ngân sách dự kiến" : "Chưa có ngân sách"}
                  </p>
                )}
              </button>
              {bookingsTotal > 0 && (
                <p className="mt-1 text-[10px] font-semibold text-[#8A7563]">
                  Đã đặt chỗ {formatMoney(bookingsTotal)}
                </p>
              )}
              {spent > 0 && (
                <p className="mt-0.5 text-[10px] font-semibold text-[#8A7563]">
                  Tổng chi {formatMoney(spent)}
                  {budgetPercent !== null && ` · ${budgetPercent}% ngân sách`}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onViewExpenses}
              className="mt-4 self-start text-sm font-extrabold text-[#8A7563] hover:text-brand-500 transition-colors cursor-pointer"
            >
              Xem chi tiết →
            </button>
          </Card>
        </div>

        {!isLoading && displayAttachments.length > 0 && (
          <TripBookingsBoard
            tripId={trip.id}
            attachments={displayAttachments}
            canEdit={canEdit}
            onAdd={setAddType}
          />
        )}
      </div>

      {addType && (
        <AddBookingModal
          tripId={trip.id}
          type={addType}
          open={!!addType}
          onClose={() => setAddType(null)}
        />
      )}

      <BudgetModal trip={trip} open={budgetOpen} onClose={() => setBudgetOpen(false)} />
    </>
  );
}
