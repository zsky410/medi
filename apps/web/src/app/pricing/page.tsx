"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FREE_FEATURES, PRO_FEATURES, PRO_PRICE_VND, type CheckoutSessionDto } from "@medi/types";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { AppHeader } from "@/components/app-header";
import { Button, Card, ErrorText } from "@/components/ui";

function PricingContent() {
  const { user, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const success = searchParams.get("success") === "1";
  const canceled = searchParams.get("canceled") === "1";
  const isPro = user?.plan === "PRO";

  useEffect(() => {
    if (success) void refreshUser();
  }, [success, refreshUser]);

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
    <div className="min-h-dvh bg-[#FFF9F2] pb-16">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-12">
        {success && (
          <div className="mb-8 rounded-2xl border-2 border-brand-500 bg-brand-100 p-5 text-center font-display font-extrabold text-brand-700 shadow-md animate-bounce">
            🎉 Chào mừng đến với Mê Đi PRO! Tài khoản của bạn đã được nâng cấp thành công. Chuẩn bị bay hạng thương gia thôi! ✈️
          </div>
        )}
        {canceled && (
          <div className="mb-8 rounded-2xl border-2 border-[#F3E3D3] bg-white p-5 text-center font-bold text-[#8A7563] shadow-sm">
            Thanh toán đã bị huỷ. Đừng lo, bạn có thể nâng cấp bất cứ lúc nào khi sẵn sàng! 🎒
          </div>
        )}

        <div className="text-center space-y-3 mb-12">
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-[#2B2118] leading-tight">
            Chơi lớn với{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-[#FF3D77]">Mê Đi PRO</span>
              <span className="absolute left-0 bottom-1 w-full h-2 bg-[#FFC93C] -rotate-1 z-0 rounded-full" />
            </span>{" "}
            ✈️
          </h1>
          <p className="mx-auto max-w-xl text-[#8A7563] text-sm sm:text-base font-semibold leading-relaxed">
            Phần lõi của Mê Đi hoàn toàn miễn phí mãi mãi — không giới hạn chuyến đi hay thành viên. Gói PRO dành cho những đôi chân đi nhiều, cần các công cụ xịn sò hơn!
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 items-stretch">
          {/* Free Plan Card */}
          <Card className="p-8 bg-[#FFF3EB]/50 border-2 border-[#F3E3D3] flex flex-col justify-between relative">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-display font-extrabold text-[#2B2118]">Hạng Phổ Thông</h2>
                <p className="mt-2 text-4xl font-display font-extrabold text-[#2B2118]">0 ₫</p>
                <p className="text-xs font-bold text-[#8A7563] uppercase tracking-wider">mãi mãi miễn phí</p>
              </div>
              <ul className="space-y-3 pt-6 border-t border-[#F3E3D3]/50">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm font-bold text-[#8A7563]">
                    <span className="text-brand-500 text-base">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-[#F3E3D3]/50">
              <div className="rounded-full bg-white border border-[#F3E3D3] py-3 text-center text-xs font-extrabold text-[#8A7563]">
                Đang sử dụng mặc định ✓
              </div>
            </div>
          </Card>

          {/* Pro Plan Card */}
          <Card className="relative p-8 bg-white border-2 border-brand-500 shadow-xl ring-4 ring-brand-100 flex flex-col justify-between transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            {/* Washi tape sticker */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-gradient-to-r from-brand-500 to-[#FF3D77] text-white text-[10px] font-extrabold flex items-center justify-center rounded-sm shadow-sm rotate-1">
              BEST DEAL 🔥
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-[#FF3D77]">Mê Đi PRO ✨</h2>
                <p className="mt-2 text-4xl font-display font-extrabold text-[#2B2118]">{formatMoney(PRO_PRICE_VND)}</p>
                <p className="text-xs font-bold text-[#8A7563] uppercase tracking-wider">mỗi năm (rẻ hơn 1 bữa lẩu 🍲)</p>
              </div>
              <ul className="space-y-3 pt-6 border-t border-[#F3E3D3]">
                <li className="flex items-start gap-2.5 text-sm font-extrabold text-[#2B2118]">
                  <span className="text-brand-500 text-base">✓</span> Tất cả tính năng miễn phí
                </li>
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm font-bold text-[#2B2118]">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-[#FF3D77] text-base">✨</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#F3E3D3]">
              {isPro ? (
                <div className="rounded-full bg-gradient-to-r from-brand-500 to-[#FF3D77] py-3 text-center font-display font-extrabold text-white shadow-md">
                  Bạn đang bay hạng PRO ✓ ✈️
                </div>
              ) : (
                <Button
                  onClick={upgrade}
                  disabled={redirecting}
                  className="w-full py-3 text-base bg-gradient-to-r from-brand-500 to-[#FF3D77] text-white hover:from-brand-600 hover:to-[#E8356C] border-none shadow-lg shadow-brand-500/20"
                >
                  {redirecting ? "Đang nối chuyến bay..." : "Lên PRO ngay thôi! 🚀"}
                </Button>
              )}
              <ErrorText>{error}</ErrorText>
            </div>
          </Card>
        </div>

        {/* Payment Methods Sticker Row */}
        <div className="mt-12 text-center space-y-3">
          <p className="text-xs font-extrabold text-[#8A7563] uppercase tracking-wider">Hỗ trợ mọi phương thức thanh toán</p>
          <div className="flex flex-wrap justify-center items-center gap-4 opacity-75">
            {["Stripe", "Visa/MC", "MoMo", "VNPay", "ZaloPay"].map((method) => (
              <span key={method} className="bg-white border border-[#F3E3D3] px-3 py-1 rounded-full text-[10px] font-bold text-[#2B2118] shadow-sm">
                💳 {method}
              </span>
            ))}
          </div>
        </div>

        {/* Trust Line */}
        <p className="mt-12 text-center text-xs font-bold text-[#8A7563]">
          🛡️ Không quảng cáo. Không bán dữ liệu của bạn. Hứa danh dự đó! 🤝
        </p>
      </main>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingContent />
    </Suspense>
  );
}
