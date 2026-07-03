"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TripDto } from "@medi/types";
import { api, ApiError } from "@/lib/api";
import { RequireAuth } from "@/components/require-auth";
import { Spinner } from "@/components/ui";

function JoinContent({ code }: { code: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    api<TripDto>(`/trips/join/${code}`, { method: "POST" })
      .then((trip) => router.replace(`/trips/${trip.id}`))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không tham gia được chuyến đi"));
  }, [code, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="flex items-center gap-3 text-stone-600">
          <Spinner /> Đang tham gia chuyến đi...
        </div>
      )}
    </div>
  );
}

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return (
    <RequireAuth>
      <JoinContent code={code} />
    </RequireAuth>
  );
}
