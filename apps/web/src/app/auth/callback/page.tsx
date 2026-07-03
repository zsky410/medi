"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/ui";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { acceptTokens } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    if (!accessToken || !refreshToken) {
      router.replace("/login");
      return;
    }
    acceptTokens(accessToken, refreshToken)
      .then(() => router.replace("/trips"))
      .catch(() => router.replace("/login"));
  }, [searchParams, acceptTokens, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center gap-3 text-stone-600">
      <Spinner /> Đang đăng nhập...
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackHandler />
    </Suspense>
  );
}
