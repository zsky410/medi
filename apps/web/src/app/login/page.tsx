"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/lib/auth";
import { ApiError, checkApiHealth, DIRECT_API_URL, NetworkError } from "@/lib/api";
import { Button, ErrorText, Input, Label } from "@/components/ui";
import { PasswordInput } from "@/components/password-input";
import { Logo } from "@/components/logo";

function LoginForm() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/trips";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiUp, setApiUp] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    checkApiHealth().then((ok) => {
      if (!cancelled) setApiUp(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, router, next]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
      router.replace(next);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof NetworkError) {
        setError(err.message);
        setApiUp(false);
      } else {
        setError("Đăng nhập thất bại");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative w-full max-w-md bg-white rounded-3xl border-2 border-[#F3E3D3] shadow-xl overflow-hidden flex flex-col">
      {/* Boarding Pass Header */}
      <div className="bg-gradient-to-r from-brand-500 to-[#FF3D77] px-6 py-7 text-white flex justify-between items-center relative">
        <Logo className="brightness-0 invert" />
        <div className="border-2 border-dashed border-white/70 bg-white/20 rounded-full px-3.5 py-1.5 text-[11px] font-display font-extrabold tracking-widest shadow-md backdrop-blur-sm text-white rotate-6 origin-center transition-transform hover:scale-105 cursor-default">
          MÊ ĐI · CHECK-IN
        </div>
      </div>

      {/* Main Ticket Body */}
      <div className="p-8 space-y-5 flex-1 bg-white">
        <h1 className="text-2xl font-display font-extrabold text-[#2B2118] text-center">Đăng nhập</h1>

        {apiUp === false && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-900">
            API chưa chạy. Mở terminal tại thư mục dự án và chạy{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5">pnpm dev:setup</code>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <PasswordInput
              id="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={submitting} className="w-full py-3 text-base shadow-md shadow-brand-500/10 hover:scale-[1.02] transition-transform">
            {submitting ? "Đang check-in..." : "Đăng nhập ngay 🚀"}
          </Button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#F3E3D3]"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-[#8A7563]">hoặc</span>
          <div className="flex-grow border-t border-[#F3E3D3]"></div>
        </div>

        <a
          href={`${DIRECT_API_URL}/auth/google`}
          className="flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-[#F3E3D3] bg-[#FFF9F2] px-5 py-2.5 text-sm font-bold text-[#2B2118] hover:bg-[#FFE1CF] transition-colors active:scale-95"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="size-5" />
          Tiếp tục với Google
        </a>
      </div>

      {/* Perforated Notch Line */}
      <div className="relative h-4 bg-white flex items-center">
        <div className="absolute -left-2 size-4 rounded-full bg-[#FFF9F2] border-r border-[#F3E3D3]" />
        <div className="absolute -right-2 size-4 rounded-full bg-[#FFF9F2] border-l border-[#F3E3D3]" />
        <div className="w-full border-t-2 border-dashed border-[#F3E3D3] mx-3" />
      </div>

      {/* Ticket Stub Footer */}
      <div className="p-6 bg-[#FFF9F2] text-center border-t border-dashed border-[#F3E3D3]/50">
        <p className="text-sm text-[#8A7563]">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-extrabold text-brand-500 hover:text-brand-700 hover:underline">
            Đăng ký miễn phí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-dvh w-full flex bg-[#FFF9F2] relative overflow-hidden">
      {/* Scattered background travel doodles simulation */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M 100 100 Q 300 50 500 200 T 900 100" fill="none" stroke="#2B2118" strokeWidth="4" strokeDasharray="10,10" />
          <path d="M 200 400 Q 400 600 700 300 T 1100 500" fill="none" stroke="#2B2118" strokeWidth="4" strokeDasharray="10,10" />
        </svg>
      </div>

      {/* Left side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Right side: Sunset Gradient Panel (Desktop only) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-500 to-[#FF3D77] items-center justify-center p-12 relative">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative text-center max-w-md space-y-8 z-10">
          {/* Polaroid Photo */}
          <div className="mx-auto w-64 bg-white p-4 pb-8 rounded-2xl border-2 border-white/20 shadow-2xl -rotate-3 transition-transform hover:rotate-0 duration-300">
            <div className="aspect-[4/3] bg-stone-100 rounded-xl overflow-hidden mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=500&q=80" alt="Hội An" className="w-full h-full object-cover" />
            </div>
            <p className="font-display font-extrabold text-lg text-[#2B2118]">📍 Phố cổ Hội An 🏮</p>
          </div>

          <blockquote className="space-y-2">
            <p className="text-2xl font-display font-extrabold text-white leading-normal">
              "Chuyến đi để đời bắt đầu từ một cái hẹn."
            </p>
            <cite className="text-sm font-bold text-white/80 block">— Mê Đi Team</cite>
          </blockquote>
        </div>
      </div>
    </main>
  );
}
