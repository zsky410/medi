"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasStoredSession } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Spinner } from "./ui";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !hasStoredSession()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#FFF9F2]">
        <Spinner className="size-8" />
      </div>
    );
  }

  return <>{children}</>;
}
