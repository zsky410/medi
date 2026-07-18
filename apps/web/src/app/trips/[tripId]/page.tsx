"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { TripDetailDto, TripRealtimeEvent } from "@medi/types";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTripRealtime } from "@/lib/socket";
import { formatDateRange } from "@/lib/format";
import { AppHeader } from "@/components/app-header";
import { RequireAuth } from "@/components/require-auth";
import { Avatar, Button, Spinner } from "@/components/ui";
import { ItineraryBoard } from "@/components/trip/itinerary-board";
import { ExpensesTab } from "@/components/trip/expenses-tab";
import { ChecklistTab } from "@/components/trip/checklist-tab";
import { BookingsTab } from "@/components/trip/bookings-tab";
import { TripSetupPanel } from "@/components/trip/trip-setup-panel";
import { MembersModal } from "@/components/trip/members-modal";
import { ShareModal } from "@/components/trip/share-modal";
import { ExportMapsButton, loadOfflineSnapshot, saveOfflineSnapshot } from "@/components/trip/pro-tools";
import { TripTabSidebar, type TripTab } from "@/components/trip/trip-tab-sidebar";
import { tripPlacesToMapItems, type MapPreviewPin } from "@/components/trip/trip-map";
import { useLodgingPins } from "@/lib/use-lodging-pins";

const TripMap = dynamic(() => import("@/components/trip/trip-map").then((m) => m.TripMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-stone-100">
      <Spinner />
    </div>
  ),
});

function TripDetailContent({ tripId }: { tripId: string }) {
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const itineraryWidthRef = useRef(60);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isPro = user?.plan === "PRO";
  const [tab, setTab] = useState<TripTab>("itinerary");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [mapPreview, setMapPreview] = useState<MapPreviewPin | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [itineraryWidth, setItineraryWidth] = useState(60);
  const [isResizingMap, setIsResizingMap] = useState(false);

  const setSplitWidth = useCallback((nextWidth: number) => {
    const clampedWidth = Math.min(72, Math.max(35, nextWidth));
    itineraryWidthRef.current = clampedWidth;
    setItineraryWidth(clampedWidth);
  }, []);

  useEffect(() => {
    const savedWidth = window.localStorage.getItem("medi:itinerary-map-split-width");
    if (!savedWidth) return;

    const parsedWidth = Number(savedWidth);
    if (Number.isFinite(parsedWidth)) setSplitWidth(parsedWidth);
  }, [setSplitWidth]);

  const startMapResize = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(min-width: 1024px)").matches === false) return;

    const splitter = event.currentTarget;
    splitter.setPointerCapture(event.pointerId);
    setIsResizingMap(true);

    const updateWidth = (clientX: number) => {
      const bounds = splitContainerRef.current?.getBoundingClientRect();
      if (!bounds) return;
      setSplitWidth(((clientX - bounds.left) / bounds.width) * 100);
    };

    const stopResize = () => {
      setIsResizingMap(false);
      window.localStorage.setItem("medi:itinerary-map-split-width", String(itineraryWidthRef.current));
      splitter.removeEventListener("pointermove", onPointerMove);
      splitter.removeEventListener("pointerup", stopResize);
      splitter.removeEventListener("pointercancel", stopResize);
    };

    const onPointerMove = (moveEvent: PointerEvent) => updateWidth(moveEvent.clientX);

    updateWidth(event.clientX);
    splitter.addEventListener("pointermove", onPointerMove);
    splitter.addEventListener("pointerup", stopResize);
    splitter.addEventListener("pointercancel", stopResize);
  }, [setSplitWidth]);

  const { data: fetchedTrip, isLoading, isError } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => api<TripDetailDto>(`/trips/${tripId}`),
  });

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

  const itineraryItems = useMemo(() => {
    if (!trip) return [];
    return tripPlacesToMapItems(trip.days, trip.unassignedPlaces);
  }, [trip]);

  const lodgingPins = useLodgingPins(tripId);

  const activeMapItemId = hoveredPlaceId ?? selectedPlaceId;

  const handlePlaceAdded = useCallback((id: string) => {
    setMapPreview(null);
    setSelectedPlaceId(id);
  }, []);

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
            <div
              ref={splitContainerRef}
              className="flex min-h-0 flex-1 flex-col lg:flex-row"
              style={{ "--itinerary-width": `${itineraryWidth}%` } as CSSProperties}
            >
              <div
                className="order-2 min-h-0 min-w-0 w-full flex-1 overflow-y-auto px-4 py-4 space-y-6 sm:px-6 sm:py-5 lg:order-1 lg:w-[calc(var(--itinerary-width)-6px)] lg:flex-none"
              >
                <TripSetupPanel
                  trip={trip}
                  canEdit={trip.myRole !== "VIEWER"}
                  onViewExpenses={() => setTab("expenses")}
                />
                <ItineraryBoard
                  trip={trip}
                  selectedPlaceId={selectedPlaceId}
                  onSelectPlace={setSelectedPlaceId}
                  onHoverPlace={setHoveredPlaceId}
                  onPreviewPlace={setMapPreview}
                  onPlaceAdded={handlePlaceAdded}
                  isPro={isPro}
                />
              </div>
              <div
                role="separator"
                aria-label="Điều chỉnh độ rộng nội dung và bản đồ"
                aria-orientation="vertical"
                aria-valuemin={35}
                aria-valuemax={72}
                aria-valuenow={Math.round(itineraryWidth)}
                tabIndex={0}
                onPointerDown={startMapResize}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                  event.preventDefault();
                  const direction = event.key === "ArrowLeft" ? -1 : 1;
                  const nextWidth = itineraryWidthRef.current + direction * (event.shiftKey ? 5 : 1);
                  setSplitWidth(nextWidth);
                  window.localStorage.setItem("medi:itinerary-map-split-width", String(itineraryWidthRef.current));
                }}
                className={`relative z-10 order-2 hidden w-3 shrink-0 cursor-col-resize touch-none items-center justify-center border-x border-[#F3E3D3] bg-white outline-none transition-colors hover:bg-[#FFF3EB] focus-visible:bg-[#FFF3EB] lg:flex ${isResizingMap ? "bg-[#FFF3EB]" : ""}`}
              >
                <span className="h-10 w-1 rounded-full bg-[#D7BFA9]" aria-hidden="true" />
              </div>
              <div
                className="order-1 h-52 w-full shrink-0 border-b border-[#F3E3D3] bg-white sm:h-64 lg:order-3 lg:h-auto lg:min-h-0 lg:w-[calc(100%-var(--itinerary-width)-6px)] lg:flex-none lg:border-b-0"
              >
                <TripMap
                  itineraryItems={itineraryItems}
                  lodgingPins={lodgingPins}
                  activeItemId={activeMapItemId}
                  focusItemId={selectedPlaceId}
                  previewPin={mapPreview}
                  onMarkerClick={setSelectedPlaceId}
                />
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
