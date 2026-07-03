import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PublicTripDto } from "@medi/types";
import { PublicTripView } from "./public-trip-view";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function fetchPublicTrip(tripId: string): Promise<PublicTripDto | null> {
  try {
    const res = await fetch(`${API_URL}/public/trips/${tripId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as PublicTripDto;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await fetchPublicTrip(tripId);
  if (!trip) return { title: "Lịch trình không tồn tại – Mê Đi" };
  const dayCount = trip.days.length;
  const description = `Lịch trình ${dayCount} ngày tại ${trip.destination} với ${trip.placeCount} địa điểm, chia sẻ bởi ${trip.ownerName} trên Mê Đi. Xem và sao chép về tài khoản của bạn.`;
  return {
    title: `${trip.title} – Mê Đi`,
    description,
    openGraph: {
      title: trip.title,
      description,
      siteName: "Mê Đi",
      type: "article",
    },
    twitter: { card: "summary", title: trip.title, description },
  };
}

export default async function PublicTripPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await fetchPublicTrip(tripId);
  if (!trip) notFound();
  return <PublicTripView trip={trip} />;
}
