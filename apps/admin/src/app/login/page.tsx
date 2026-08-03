"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, MapPinned, Plane } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { Button, ErrorText, Input, Label, Spinner } from "@/components/ui";

function LoginForm() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user?.role === "ADMIN") router.replace(next);
  }, [loading, user, router, next]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
      router.replace(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Đăng nhập admin thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && user) {
    return (
      <div className="admin-canvas flex min-h-dvh items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <main className="admin-canvas relative grid min-h-dvh overflow-hidden lg:grid-cols-[minmax(390px,0.92fr)_minmax(480px,1fr)]">
      <section className="relative flex items-center justify-center px-4 py-8 sm:px-8">
        <form onSubmit={onSubmit} className="paper-surface w-full max-w-[430px] rounded-[30px] border border-[#F0DFCD] p-7 sm:p-8">
          <div className="mb-8">
            <Logo imgClassName="h-11" />
          </div>

          <div className="mb-7">
            <h1 className="text-balance font-display text-4xl font-extrabold leading-[0.98] text-[#2B2118] sm:text-[3.35rem]">
              Vào bảng điều hành.
            </h1>
            <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-[#6E5A49]">
              Quản lý người dùng, chuyến đi, thanh toán và nội dung.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@medi.app"
              />
            </div>
            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhập mật khẩu"
              />
            </div>
            <ErrorText>{error}</ErrorText>
            <Button type="submit" disabled={submitting} className="w-full py-3 text-base">
              {submitting ? "Đang kiểm tra..." : "Đăng nhập"}
              {!submitting && <ArrowRight size={17} />}
            </Button>
          </div>
        </form>
      </section>

      <section className="relative hidden items-center justify-center border-l border-[#F0DFCD] px-10 py-8 lg:flex">
        <div className="relative h-[560px] w-full max-w-[640px]">
          <div className="route-thread absolute left-12 top-5 h-16 w-[34rem] rotate-[-6deg] opacity-80" />
          <div className="absolute left-2 top-16 w-[300px] rotate-[-3deg] rounded-[26px] border border-[#F0DFCD] bg-white p-4 shadow-[0_24px_70px_rgba(83,52,29,0.12)]">
            <div className="h-44 rounded-[20px] bg-[linear-gradient(135deg,#FFF3EB,#FFE1CF_48%,#FF6B2C_49%,#FF6B2C_51%,#FFF9F2_52%)] p-4">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm">
                <MapPinned size={19} />
              </div>
              <div className="mt-14 grid grid-cols-3 gap-2">
                {[28, 44, 34].map((height, index) => (
                  <span key={height} className="chart-bar block rounded-full bg-white/90 shadow-sm" style={{ height, animationDelay: `${index * 120}ms` }} />
                ))}
              </div>
            </div>
          </div>

          <div className="absolute right-2 top-8 w-[320px] rotate-[2deg] rounded-[30px] border border-[#F0DFCD] bg-[#2B2118] p-5 text-white shadow-[0_26px_80px_rgba(43,33,24,0.24)]">
            <div className="flex items-center justify-between">
              <Logo imgClassName="h-8 brightness-0 invert" />
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/10 text-brand-200">
                <Plane size={18} />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {["Đà Lạt", "Hội An", "Hà Giang"].map((place, index) => (
                <div key={place} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-brand-500 text-xs font-extrabold">{index + 1}</span>
                    <span className="text-sm font-extrabold">{place}</span>
                  </div>
                  <CheckCircle2 size={16} className="text-brand-200" />
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-16 left-20 w-[430px] rounded-[28px] border border-[#F0DFCD] bg-white p-5 shadow-[0_22px_70px_rgba(83,52,29,0.13)]">
            <div className="grid grid-cols-4 gap-3">
              {[62, 88, 46, 74].map((height, index) => (
                <div key={height} className="flex h-28 items-end rounded-2xl bg-[#FFF3EB] px-3 py-3">
                  <span
                    className="chart-bar w-full rounded-full bg-brand-500"
                    style={{ height: `${height}%`, animationDelay: `${index * 110}ms` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
