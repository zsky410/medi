"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, LoaderCircle, WalletCards } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SepayCheckoutDto, SepayCheckoutStatusDto } from "@medi/types";
import { AppHeader } from "@/components/app-header";
import { RequireAuth } from "@/components/require-auth";
import { Button, Card, ErrorText, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatMoney } from "@/lib/format";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#F3E3D3] bg-white text-[#8A7563] transition hover:border-brand-500 hover:text-brand-600"
      title={copied ? "Đã copy" : "Copy"}
      aria-label={copied ? "Đã copy" : "Copy"}
    >
      {copied ? <CheckCircle2 className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}

function PaymentRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#F3E3D3]/70 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase text-[#8A7563]">{label}</p>
        <p className={`${strong ? "text-xl" : "text-sm"} min-w-0 break-words font-display font-extrabold text-[#2B2118]`}>
          {value}
        </p>
      </div>
      <CopyButton value={value} />
    </div>
  );
}

function SepayCheckoutContent({ intentId }: { intentId: string }) {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const detailQuery = useQuery({
    queryKey: ["billing", "sepay-checkout", intentId],
    queryFn: () => api<SepayCheckoutDto>(`/billing/checkout/${intentId}`),
  });

  const statusQuery = useQuery({
    queryKey: ["billing", "sepay-checkout-status", intentId],
    queryFn: () => api<SepayCheckoutStatusDto>(`/billing/checkout/${intentId}/status`),
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === "PAID" || data?.plan === "PRO" ? false : 4000;
    },
  });

  useEffect(() => {
    if (statusQuery.data?.status !== "PAID" && statusQuery.data?.plan !== "PRO") return;
    void refreshUser();
    const timeout = window.setTimeout(() => router.replace("/pricing?success=1"), 900);
    return () => window.clearTimeout(timeout);
  }, [refreshUser, router, statusQuery.data?.plan, statusQuery.data?.status]);

  const detail = detailQuery.data;
  const paid = statusQuery.data?.status === "PAID" || statusQuery.data?.plan === "PRO" || detail?.status === "PAID";
  const error =
    detailQuery.error instanceof ApiError
      ? detailQuery.error.message
      : statusQuery.error instanceof ApiError
        ? statusQuery.error.message
        : "";

  return (
    <div className="min-h-dvh bg-[#FFF9F2] pb-16">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <Link href="/pricing" className="text-sm font-extrabold text-brand-600 hover:underline">
          ← Bảng giá
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="overflow-hidden border-2 border-[#F3E3D3]">
            <div className="border-b border-[#F3E3D3] bg-white px-5 py-5 sm:px-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <WalletCards className="size-6" />
                </span>
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-[#2B2118] sm:text-3xl">
                    Thanh toán Mê Đi PRO
                  </h1>
                  <p className="text-sm font-bold text-[#8A7563]">Chuyển khoản ngân hàng qua SePay</p>
                </div>
              </div>
            </div>

            {detailQuery.isLoading ? (
              <div className="flex min-h-80 items-center justify-center">
                <Spinner className="size-8" />
              </div>
            ) : detail ? (
              <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_280px]">
                <div className="p-5 sm:p-7">
                  <div className="rounded-2xl border border-[#F3E3D3] bg-[#FFF9F2] px-4">
                    <PaymentRow label="Ngân hàng" value={detail.bankName} />
                    <PaymentRow label="Số tài khoản" value={detail.accountNumber} strong />
                    <PaymentRow label="Chủ tài khoản" value={detail.accountName} />
                    <PaymentRow label="Gói PRO" value={detail.period === "WEEK" ? "Tuần" : detail.period === "MONTH" ? "Tháng" : "Năm"} />
                    <PaymentRow label="Số tiền" value={formatMoney(detail.amount, detail.currency)} strong />
                    <PaymentRow label="Nội dung" value={detail.checkoutCode} strong />
                  </div>
                </div>

                <div className="border-t border-[#F3E3D3] bg-[#FFF3EB] p-5 md:border-l md:border-t-0">
                  <div className="flex h-full flex-col justify-between gap-5">
                    <div className="rounded-2xl border border-[#F3E3D3] bg-white p-4 text-center shadow-sm">
                      {detail.qrUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={detail.qrUrl} alt="QR thanh toán SePay" className="mx-auto aspect-square w-full max-w-56 rounded-xl object-contain" />
                      ) : (
                        <div className="mx-auto flex aspect-square w-full max-w-56 items-center justify-center rounded-xl bg-[#FFF9F2] text-center text-sm font-bold text-[#8A7563]">
                          QR chưa cấu hình
                        </div>
                      )}
                    </div>

                    <div
                      className={`rounded-2xl border px-4 py-3 text-center ${
                        paid ? "border-brand-500 bg-brand-100 text-brand-700" : "border-[#F3E3D3] bg-white text-[#8A7563]"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2 font-display font-extrabold">
                        {paid ? <CheckCircle2 className="size-5" /> : <LoaderCircle className="size-5 animate-spin" />}
                        {paid ? "Đã xác nhận" : "Đang chờ SePay"}
                      </div>
                      <p className="mt-1 text-xs font-bold">
                        {paid ? "Tài khoản sẽ chuyển sang PRO." : "Trang tự cập nhật sau khi webhook về."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-7">
                <ErrorText>{error || "Không tải được phiên thanh toán"}</ErrorText>
              </div>
            )}
          </Card>

          <aside className="space-y-4">
            <Card className="border-2 border-brand-200 bg-white p-5">
              <h2 className="font-display text-lg font-extrabold text-[#2B2118]">Mê Đi PRO ✨</h2>
              <p className="mt-2 text-sm font-bold text-[#8A7563]">
                Xác nhận tự động bằng webhook SePay. Nếu đã chuyển khoản, giữ nguyên nội dung để hệ thống đối soát chính xác.
              </p>
            </Card>
            <Card className="border-2 border-[#F3E3D3] bg-white p-5">
              <p className="text-[11px] font-extrabold uppercase text-[#8A7563]">Mã phiên</p>
              <p className="mt-1 break-all font-mono text-xs font-bold text-[#2B2118]">{intentId}</p>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function SepayCheckoutPage({ params }: { params: Promise<{ intentId: string }> }) {
  const { intentId } = use(params);
  return (
    <RequireAuth>
      <SepayCheckoutContent intentId={intentId} />
    </RequireAuth>
  );
}
