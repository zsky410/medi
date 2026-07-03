"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PlaceDto, TripAffiliateDto, TripDetailDto, TripRealtimeEvent } from "@medi/types";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTripRealtime } from "@/lib/socket";
import { dayColor, formatDateRange } from "@/lib/format";
import { AppHeader } from "@/components/app-header";
import { RequireAuth } from "@/components/require-auth";
import { Avatar, Button, Spinner } from "@/components/ui";
import { ItineraryBoard } from "@/components/trip/itinerary-board";
import { PlaceSearchModal } from "@/components/trip/place-search";
import { PlaceEditModal } from "@/components/trip/place-edit-modal";
import { ExpensesTab } from "@/components/trip/expenses-tab";
import { ChecklistTab } from "@/components/trip/checklist-tab";
import { BookingsTab } from "@/components/trip/bookings-tab";
import { TripSetupPanel } from "@/components/trip/trip-setup-panel";
import { AiSuggestPanel } from "@/components/trip/ai-suggest-panel";
import { ImportBookingPanel } from "@/components/trip/import-booking-panel";
import { MembersModal } from "@/components/trip/members-modal";
import { ShareModal } from "@/components/trip/share-modal";
import { ExportMapsButton, loadOfflineSnapshot, saveOfflineSnapshot } from "@/components/trip/pro-tools";
import { TripTabSidebar, type TripTab } from "@/components/trip/trip-tab-sidebar";
import type { MapPlace } from "@/components/trip/trip-map";

const TripMap = dynamic(() => import("@/components/trip/trip-map").then((m) => m.TripMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-stone-100">
      <Spinner />
    </div>
  ),
});

function TripDetailContent({ tripId }: { tripId: string }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isPro = user?.plan === "PRO";
  const [tab, setTab] = useState<TripTab>("itinerary");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [searchTarget, setSearchTarget] = useState<{ dayId: string | null; label: string } | null>(null);
  const [editingPlace, setEditingPlace] = useState<PlaceDto | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const { data: fetchedTrip, isLoading, isError } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => api<TripDetailDto>(`/trips/${tripId}`),
  });

  const { data: affiliate } = useQuery({
    queryKey: ["affiliate", tripId],
    queryFn: () => api<TripAffiliateDto>(`/trips/${tripId}/affiliate`),
    enabled: !!fetchedTrip,
  });

  const placeDeals = useMemo(() => {
    const map = new Map<string, TripAffiliateDto["placeDeals"][number]>();
    affiliate?.placeDeals.forEach((d) => map.set(d.placeId, d));
    return map;
  }, [affiliate]);

  useEffect(() => {
    if (fetchedTrip && isPro) saveOfflineSnapshot(fetchedTrip);
  }, [fetchedTrip, isPro]);
  const offline = useMemo(
    () => (isError && isPro ? loadOfflineSnapshot(tripId) : null),
    [isError, isPro, tripId],
  );
  const trip = fetchedTrip ?? offline?.trip;

  const onRealtimeEvent = useCallback(
    (event: TripRealtimeEvent) => {
      switch (event.type) {
        case "trip:updated":
          queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
          queryClient.invalidateQueries({ queryKey: ["attachments", tripId] });
          break;
        case "itinerary:changed":
        case "members:changed":
          queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
          break;
        case "expenses:changed":
          queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
          break;
        case "checklist:changed":
          queryClient.invalidateQueries({ queryKey: ["checklist", tripId] });
          break;
      }
    },
    [queryClient, tripId],
  );
  useTripRealtime(tripId, onRealtimeEvent);

  const mapPlaces: MapPlace[] = useMemo(() => {
    if (!trip) return [];
    const places: MapPlace[] = [];
    trip.days.forEach((day, dayIdx) => {
      day.places.forEach((p, i) => {
        places.push({ ...p, color: dayColor(dayIdx), label: String(i + 1) });
      });
    });
    trip.unassignedPlaces.forEach((p) => {
      places.push({ ...p, color: "#78716c", label: "★" });
    });
    return places;
  }, [trip]);

  if (!trip) {
    if (isLoading) {
      return (
        <div className="flex min-h-dvh items-center justify-center">
          <Spinner className="size-8" />
        </div>
      );
    }
    return (
      <div className="flex min-h-dvh items-center justify-center text-stone-500">
        Không tải được chuyến đi. Kiểm tra kết nối mạng và thử lại.
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#FFF9F2]">
      <AppHeader />

      {offline && (
        <div className="shrink-0 bg-sun-400/20 border-b border-sun-400/40 px-4 py-2 text-center text-sm font-bold text-[#2B2118]">
          📴 Đang xem bản offline (lưu lúc {new Date(offline.savedAt).toLocaleString("vi-VN")}). Thay đổi sẽ không được lưu.
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <TripTabSidebar tab={tab} onTabChange={setTab} />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Sticky trip header */}
          <div className="shrink-0 border-b border-[#F3E3D3] bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <h1 className="truncate text-xl font-display font-extrabold text-[#2B2118] sm:text-2xl">{trip.title}</h1>
                <p className="text-sm font-semibold text-[#8A7563] flex items-center gap-1 truncate">
                  <span>📍</span> {trip.destination} · {formatDateRange(trip.startDate, trip.endDate)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setMembersOpen(true)}
                  className="flex items-center -space-x-1.5 rounded-full p-1.5 hover:bg-[#FFF3EB] transition-colors"
                  aria-label="Thành viên"
                >
                  {trip.members.slice(0, 4).map((m) => (
                    <Avatar key={m.userId} name={m.user.name} avatarUrl={m.user.avatarUrl} size={30} />
                  ))}
                  {trip.members.length > 4 && (
                    <span className="flex items-center justify-center size-7 rounded-full bg-[#FFF3EB] text-xs font-bold text-[#2B2118] border-2 border-white">
                      +{trip.members.length - 4}
                    </span>
                  )}
                </button>
                <Button variant="secondary" onClick={() => setShareOpen(true)} className="text-xs">
                  Chia sẻ 🔗
                </Button>
                <Button onClick={() => setMembersOpen(true)} className="text-xs">
                  Rủ bạn +
                </Button>
                {tab === "itinerary" && <ExportMapsButton trip={trip} isPro={isPro} />}
              </div>
            </div>
          </div>

          {/* Body: itinerary = scrollable content + fixed map; other tabs = full scroll */}
          {tab === "itinerary" ? (
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              <div className="order-2 min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-6 lg:order-1 lg:flex-[6]">
                <TripSetupPanel
                  trip={trip}
                  canEdit={trip.myRole !== "VIEWER"}
                  onViewExpenses={() => setTab("expenses")}
                />
                <ItineraryBoard
                  trip={trip}
                  selectedPlaceId={selectedPlaceId}
                  placeDeals={placeDeals}
                  onSelectPlace={setSelectedPlaceId}
                  onAddPlace={(dayId, label) => setSearchTarget({ dayId, label })}
                  onEditPlace={setEditingPlace}
                  isPro={isPro}
                />
                <AiSuggestPanel trip={trip} canEdit={trip.myRole !== "VIEWER"} />
                <ImportBookingPanel trip={trip} canEdit={trip.myRole !== "VIEWER"} />
              </div>
              <div className="order-1 h-52 shrink-0 border-b border-[#F3E3D3] bg-white sm:h-64 lg:order-2 lg:h-auto lg:min-h-0 lg:flex-[4] lg:border-b-0 lg:border-l">
                <TripMap places={mapPlaces} selectedPlaceId={selectedPlaceId} onSelect={setSelectedPlaceId} />
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              {tab === "expenses" && <ExpensesTab trip={trip} />}
              {tab === "checklist" && <ChecklistTab trip={trip} />}
              {tab === "bookings" && <BookingsTab trip={trip} />}
            </div>
          )}
        </div>
      </div>

      <PlaceSearchModal
        tripId={trip.id}
        dayId={searchTarget?.dayId ?? null}
        dayLabel={searchTarget?.label ?? ""}
        open={!!searchTarget}
        onClose={() => setSearchTarget(null)}
      />
      <PlaceEditModal tripId={trip.id} place={editingPlace} onClose={() => setEditingPlace(null)} />
      <MembersModal trip={trip} open={membersOpen} onClose={() => setMembersOpen(false)} />
      <ShareModal trip={trip} open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}

export default function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params);
  return (
    <RequireAuth>
      <TripDetailContent tripId={tripId} />
    </RequireAuth>
  );
}
