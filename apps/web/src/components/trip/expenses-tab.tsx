"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  EXPENSE_CATEGORIES,
  type BudgetSummaryDto,
  type CreateExpenseInput,
  type CreateSettlementInput,
  type ExpenseDto,
  type TripDetailDto,
} from "@medi/types";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { CATEGORY_LABELS, EXPENSE_EMOJIS, formatMoney } from "@/lib/format";
import { Avatar, Button, Card, Input, Label, Modal, Spinner } from "@/components/ui";

// Category emojis — keys match ExpenseCategory from API
const CATEGORY_EMOJIS = EXPENSE_EMOJIS;

function AddExpenseModal({
  trip,
  open,
  onClose,
}: {
  trip: TripDetailDto;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("OTHER");
  const [payerId, setPayerId] = useState(user?.id ?? "");
  const [splitWithIds, setSplitWithIds] = useState<string[]>(trip.members.map((m) => m.userId));

  const mutation = useMutation({
    mutationFn: (input: CreateExpenseInput) =>
      api(`/trips/${trip.id}/expenses`, { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", trip.id] });
      queryClient.invalidateQueries({ queryKey: ["expenses", trip.id, "summary"] });
      onClose();
      setTitle("");
      setAmount("");
    },
  });

  function toggleSplit(userId: string) {
    setSplitWithIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (splitWithIds.length === 0) return;
    mutation.mutate({
      title,
      amount: Number(amount),
      currency: "VND",
      category: category as CreateExpenseInput["category"],
      payerId: payerId || user!.id,
      splitWithIds,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Thêm khoản chi 💸">
      <div className="mb-4 text-xs text-[#8A7563] bg-[#FFF3EB] p-3 rounded-xl border border-[#F3E3D3]">
        Điền hóa đơn chi tiêu của nhóm bạn. Mê Đi sẽ tự động chia tiền sòng phẳng!
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="exp-title">Khoản chi</Label>
          <Input id="exp-title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ăn lẩu nấm, vé cáp treo..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="exp-amount">Số tiền (VND)</Label>
            <Input id="exp-amount" type="number" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500000" />
          </div>
          <div>
            <Label htmlFor="exp-category">Phân loại</Label>
            <select
              id="exp-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-[#F3E3D3] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 font-bold text-[#2B2118]"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_EMOJIS[c] || "🏷️"} {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="exp-payer">Ai trả tiền?</Label>
          <select
            id="exp-payer"
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
            className="w-full rounded-xl border border-[#F3E3D3] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 font-bold text-[#2B2118]"
          >
            {trip.members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Chia đều cho</Label>
          <div className="flex flex-wrap gap-2 pt-1">
            {trip.members.map((m) => {
              const active = splitWithIds.includes(m.userId);
              return (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => toggleSplit(m.userId)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? "border-brand-500 bg-[#FFF3EB] text-brand-700"
                      : "border-[#F3E3D3] bg-white text-[#8A7563] hover:bg-[#FFF9F2]"
                  }`}
                >
                  <Avatar name={m.user.name} avatarUrl={m.user.avatarUrl} size={18} />
                  <span>{m.user.name}</span>
                  {active && <span className="text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
        <Button type="submit" disabled={mutation.isPending || splitWithIds.length === 0} className="w-full py-3 text-base shadow-md shadow-brand-500/10">
          {mutation.isPending ? "Đang ghi hóa đơn..." : "Ghi hóa đơn 🧾"}
        </Button>
      </form>
    </Modal>
  );
}

export function ExpensesTab({ trip }: { trip: TripDetailDto }) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const canEdit = trip.myRole !== "VIEWER";

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses", trip.id],
    queryFn: () => api<ExpenseDto[]>(`/trips/${trip.id}/expenses`),
  });
  const { data: summary } = useQuery({
    queryKey: ["expenses", trip.id, "summary"],
    queryFn: () => api<BudgetSummaryDto>(`/trips/${trip.id}/expenses/summary`),
  });

  const deleteMutation = useMutation({
    mutationFn: (expenseId: string) =>
      api(`/trips/${trip.id}/expenses/${expenseId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", trip.id] });
      queryClient.invalidateQueries({ queryKey: ["expenses", trip.id, "summary"] });
    },
  });

  const settleMutation = useMutation({
    mutationFn: (input: CreateSettlementInput) =>
      api(`/trips/${trip.id}/expenses/settlements`, { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", trip.id, "summary"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-10" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3 text-left">
      {/* Left Column: Sổ chi tiêu */}
      <div className="space-y-4 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-extrabold text-[#2B2118]">Sổ chi tiêu 🧾</h2>
          {canEdit && (
            <Button onClick={() => setModalOpen(true)} className="text-xs py-2 px-4">
              + Thêm khoản chi 💸
            </Button>
          )}
        </div>

        {expenses && expenses.length > 0 ? (
          <div className="space-y-3">
            {expenses.map((e) => {
              const emoji = CATEGORY_EMOJIS[e.category] || "🏷️";
              return (
                <Card key={e.id} className="flex items-center justify-between p-4 border-2 border-[#F3E3D3] bg-white hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl bg-[#FFF3EB] p-2 rounded-xl border border-[#FFE1CF]">
                      {emoji}
                    </span>
                    <div>
                      <p className="font-bold text-[#2B2118]">{e.title}</p>
                      <p className="text-xs font-semibold text-[#8A7563] mt-0.5">
                        {CATEGORY_LABELS[e.category]} · <span className="text-brand-500">{e.payerName}</span> trả · chia {e.splitWithIds.length} người
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-extrabold text-[#2B2118] text-base">
                      {formatMoney(e.amount, e.currency)}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => deleteMutation.mutate(e.id)}
                        className="rounded-full p-1.5 text-[#8A7563]/50 hover:bg-red-50 hover:text-red-500 transition-colors"
                        aria-label="Xoá khoản chi"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="py-16 text-center text-sm font-bold text-[#8A7563] border-2 border-dashed border-[#F3E3D3] bg-white relative">
            <span className="text-5xl block mb-3">💸</span>
            Chưa có khoản chi nào. Thêm khoản chi để theo dõi ngân sách và chia tiền sòng phẳng!
          </Card>
        )}
      </div>

      {/* Right Column: Summary */}
      <div className="space-y-6">
        {/* Budget / Hòm quỹ */}
        {summary?.budget != null && summary.budget > 0 && (
          <Card className="p-5 border-2 border-[#F3E3D3] bg-white relative overflow-hidden">
            <h3 className="text-xs font-extrabold text-[#8A7563] uppercase tracking-wider mb-2">Hòm quỹ 🏦</h3>
            <div className="flex items-center gap-4">
              <div className="relative size-16 shrink-0">
                <svg viewBox="0 0 36 36" className="size-16 -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F3E3D3" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none"
                    stroke={summary.budgetPercent && summary.budgetPercent > 90 ? "#EF4444" : "#FF6B2C"}
                    strokeWidth="3"
                    strokeDasharray={`${Math.min(summary.budgetPercent ?? 0, 100)} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-[#2B2118]">
                  {summary.budgetPercent ?? 0}%
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#2B2118]">
                  {formatMoney(summary.total, summary.currency)} / {formatMoney(summary.budget, summary.budgetCurrency)}
                </p>
                <p className="text-xs font-semibold text-[#8A7563] mt-0.5">
                  Còn lại {formatMoney(Math.max(summary.budget - summary.total, 0), summary.budgetCurrency)}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Total Cost Card */}
        <Card className="p-5 border-2 border-[#F3E3D3] bg-white relative overflow-hidden">
          {/* Washi tape */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#FFE1CF]/80 border-b border-[#F3E3D3] rotate-1" />
          
          <h3 className="text-xs font-extrabold text-[#8A7563] uppercase tracking-wider mb-1">Tổng chi phí chuyến đi</h3>
          <p className="text-3xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-[#FF3D77]">
            {formatMoney(summary?.total ?? 0, summary?.currency ?? "VND")}
          </p>

          {summary && Object.keys(summary.byCategory).length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#F3E3D3]/50 space-y-2">
              {Object.entries(summary.byCategory).map(([cat, amount]) => {
                const emoji = CATEGORY_EMOJIS[cat] || "🏷️";
                return (
                  <div key={cat} className="flex justify-between items-center text-xs font-bold text-[#2B2118]">
                    <span className="text-[#8A7563] flex items-center gap-1.5">
                      <span>{emoji}</span>
                      <span>{CATEGORY_LABELS[cat] ?? cat}</span>
                    </span>
                    <span>{formatMoney(amount, summary.currency)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Balances Card */}
        <Card className="p-5 border-2 border-[#F3E3D3] bg-white relative overflow-hidden">
          {/* Passport Stamp Style Badge */}
          <div className="absolute top-4 right-4 border-2 border-brand-500/20 rounded-full size-12 flex items-center justify-center text-[8px] font-display font-extrabold text-brand-500/30 rotate-12 pointer-events-none">
            MÊ ĐI · OK
          </div>

          <h3 className="text-xs font-extrabold text-[#8A7563] uppercase tracking-wider mb-3">Trả gọn nhất 🎯</h3>
          {summary?.simplifiedDebts && summary.simplifiedDebts.length > 0 ? (
            <div className="space-y-2 mb-4">
              {summary.simplifiedDebts.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b border-[#F3E3D3]/30 pb-2">
                  <span className="font-bold text-[#2B2118]">
                    {d.fromName} → {d.toName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-red-500">
                      {formatMoney(d.amount, summary.currency)}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => settleMutation.mutate({
                          fromUserId: d.fromUserId,
                          toUserId: d.toUserId,
                          amount: d.amount,
                          currency: summary.currency,
                        })}
                        disabled={settleMutation.isPending}
                        className="text-[10px] font-extrabold text-teal-600 bg-teal-50 px-2 py-1 rounded-full border border-teal-200 hover:bg-teal-100"
                      >
                        Đã trả ✓
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-bold text-teal-600 mb-4">Cả nhóm đã sòng phẳng! 🎉</p>
          )}

          <h3 className="text-xs font-extrabold text-[#8A7563] uppercase tracking-wider mb-3">Chi tiết từng người</h3>
          <div className="space-y-3">
            {summary?.balances.map((b) => {
              const isPositive = b.net > 0;
              const isNegative = b.net < 0;
              return (
                <div key={b.userId} className="flex items-center justify-between text-sm border-b border-[#F3E3D3]/30 pb-2 last:border-none last:pb-0">
                  <span className="font-bold text-[#2B2118]">{b.name}</span>
                  <span className={`font-display font-extrabold ${
                    isPositive ? "text-teal-500" : isNegative ? "text-red-500" : "text-[#8A7563]/50"
                  }`}>
                    {isPositive ? "Được nhận " : isNegative ? "Cần trả " : "Đã sòng phẳng ✓"}
                    {b.net !== 0 ? formatMoney(Math.abs(b.net), summary.currency) : ""}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-[10px] font-bold text-[#8A7563] bg-[#FFF3EB] p-2 rounded-lg border border-[#FFE1CF]">
            💡 Mẹo: Hãy chuyển khoản trực tiếp cho nhau rồi bấm "Đã sòng phẳng" để cân bằng sổ sách nhé!
          </p>
        </Card>
      </div>

      <AddExpenseModal trip={trip} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
