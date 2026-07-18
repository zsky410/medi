"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FREE_FEATURES,
  PRO_FEATURES,
  PRO_PRICE_VND,
  type CheckoutSessionDto,
  type TripDetailDto,
} from "@medi/types";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { Button, Card, ErrorText, Modal } from "@/components/ui";

export function UpgradePrompt({ open, onClose, feature }: { open: boolean; onClose: () => void; feature: string }) {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  async function upgrade() {
    if (!user) {
      window.location.href = "/login?next=/pricing";
      return;
    }
    setRedirecting(true);
    setError("");
    try {
      const session = await api<CheckoutSessionDto>("/billing/checkout", { method: "POST" });
      window.location.href = session.url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không tạo được phiên thanh toán");
      setRedirecting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Mở khoá Mê Đi PRO" size="lg">
      <div className="space-y-5">
        <div className="rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50 to-[#FFF3EB] px-4 py-3 text-center">
          <p className="text-sm font-bold text-[#8A7563]">
            <span className="font-extrabold text-[#2B2118]">{feature}</span>
            {" "}là tính năng dành cho thành viên{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-[#FF3D77]">
              Mê Đi PRO
            </span>
            . Chọn gói phù hợp bên dưới để tiếp tục.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 items-stretch">
          <Card className="flex flex-col justify-between border-2 border-[#F3E3D3] bg-[#FFF3EB]/50 p-5">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-display font-extrabold text-[#2B2118]">Hạng Phổ Thông</h3>
                <p className="mt-1 text-2xl font-display font-extrabold text-[#2B2118]">0 ₫</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7563]">mãi mãi miễn phí</p>
              </div>
              <ul className="space-y-2 border-t border-[#F3E3D3]/50 pt-4">
                {FREE_FEATURES.slice(0, 5).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs font-bold text-[#8A7563]">
                    <span className="text-brand-500">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 rounded-full border border-[#F3E3D3] bg-white py-2.5 text-center text-[11px] font-extrabold text-[#8A7563]">
              Đang sử dụng ✓
            </div>
          </Card>

          <Card className="relative flex flex-col justify-between border-2 border-brand-500 bg-white p-5 shadow-lg ring-4 ring-brand-100">
            <div className="absolute -top-3 left-1/2 w-24 -translate-x-1/2 rotate-1 rounded-sm bg-gradient-to-r from-brand-500 to-[#FF3D77] py-0.5 text-center text-[10px] font-extrabold text-white shadow-sm">
              BEST DEAL 🔥
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-[#FF3D77]">
                  Mê Đi PRO ✨
                </h3>
                <p className="mt-1 text-2xl font-display font-extrabold text-[#2B2118]">
                  {formatMoney(PRO_PRICE_VND)}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7563]">
                  mỗi năm · rẻ hơn 1 bữa lẩu
                </p>
              </div>
              <ul className="space-y-2 border-t border-[#F3E3D3] pt-4">
                <li className="flex items-start gap-2 text-xs font-extrabold text-[#2B2118]">
                  <span className="text-brand-500">✓</span>
                  <span>Tất cả tính năng miễn phí</span>
                </li>
                {PRO_FEATURES.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 text-xs font-bold ${
                      f === feature || f.includes(feature) ? "text-brand-600" : "text-[#2B2118]"
                    }`}
                  >
                    <span aria-hidden>✨</span>
                    <span>
                      {f}
                      {(f === feature || f.includes(feature)) && (
                        <span className="ml-1 rounded bg-brand-500 px-1 py-0.5 text-[9px] font-extrabold text-white">
                          bạn cần
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 space-y-2">
              <Button
                onClick={upgrade}
                disabled={redirecting}
                className="w-full border-none bg-gradient-to-r from-brand-500 to-[#FF3D77] py-2.5 text-sm text-white shadow-md shadow-brand-500/20 hover:from-brand-600 hover:to-[#E8356C]"
              >
                {redirecting ? "Đang nối chuyến bay..." : "Lên PRO ngay thôi! 🚀"}
              </Button>
              <ErrorText>{error}</ErrorText>
            </div>
          </Card>
        </div>

        <p className="text-center text-[11px] font-semibold text-[#8A7563]">
          Xem đầy đủ tại{" "}
          <Link href="/pricing" className="font-extrabold text-brand-600 hover:underline">
            trang bảng giá
          </Link>
          {" "}· Không quảng cáo · Không bán dữ liệu
        </p>
      </div>
    </Modal>
  );
}

const OFFLINE_KEY_PREFIX = "medi.offline.";

export function saveOfflineSnapshot(trip: TripDetailDto) {
  try {
    localStorage.setItem(
      `${OFFLINE_KEY_PREFIX}${trip.id}`,
      JSON.stringify({ trip, savedAt: new Date().toISOString() }),
    );
  } catch {
    // storage full — offline copy is best-effort
  }
}

export function loadOfflineSnapshot(tripId: string): { trip: TripDetailDto; savedAt: string } | null {
  try {
    const raw = localStorage.getItem(`${OFFLINE_KEY_PREFIX}${tripId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
