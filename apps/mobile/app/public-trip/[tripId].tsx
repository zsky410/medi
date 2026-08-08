import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { PlaceCategory, PublicTripDto } from "@medi/types";
import { clonePublicTrip, fetchPublicTrip } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatDate, formatDateRange, formatMoney } from "../../lib/format";
import { publicTripPreviewCover } from "../../lib/public-trips";
import { colors, dayColors } from "../../lib/theme";
import { TripMapWebView, type MobileMapItem } from "../../components/trip-map-webview";
import { Card, EmptyState, ErrorBanner, LoadingState, PrimaryButton } from "../../components/ui";

const categoryLabels: Record<PlaceCategory, string> = {
  ATTRACTION: "Tham quan",
  FOOD: "Ăn uống",
  LODGING: "Lưu trú",
  TRANSPORT: "Di chuyển",
  SHOPPING: "Mua sắm",
  OTHER: "Khác",
};

export default function PublicTripScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const params = useLocalSearchParams<{ tripId: string }>();
  const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;
  const [trip, setTrip] = useState<PublicTripDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!tripId) return;
    setError("");
    try {
      setTrip(await fetchPublicTrip(tripId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được lịch trình");
    }
  }, [tripId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const savedPlaceCount = useMemo(
    () => (trip ? trip.days.reduce((count, day) => count + day.places.length, 0) + trip.savedPlaces.length : 0),
    [trip],
  );
  const mapItems = useMemo<MobileMapItem[]>(() => {
    if (!trip) return [];
    const items: MobileMapItem[] = [];

    trip.days.forEach((day, dayIndex) => {
      day.places
        .filter((place) => place.lat != null && place.lng != null)
        .forEach((place, placeIndex) => {
          items.push({
            id: place.id,
            name: place.name,
            latitude: place.lat!,
            longitude: place.lng!,
            visitOrder: placeIndex + 1,
            color: dayColors[dayIndex % dayColors.length],
          });
        });
    });

    trip.savedPlaces
      .filter((place) => place.lat != null && place.lng != null)
      .forEach((place, placeIndex) => {
        items.push({
          id: place.id,
          name: place.name,
          latitude: place.lat!,
          longitude: place.lng!,
          visitOrder: placeIndex + 1,
          color: colors.muted,
        });
      });

    return items;
  }, [trip]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function cloneTrip() {
    if (!trip) return;
    if (!user) {
      router.push("/login");
      return;
    }
    setCloning(true);
    setError("");
    try {
      const cloned = await clonePublicTrip(trip.id);
      router.replace({ pathname: "/trip/[tripId]", params: { tripId: cloned.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không sao chép được lịch trình");
    } finally {
      setCloning(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
    >
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Quay lại</Text>
      </Pressable>
      <ErrorBanner message={error} />
      {!trip ? (
        <EmptyState title="Không tìm thấy lịch trình" />
      ) : (
        <>
          <View style={styles.hero}>
            <Image source={{ uri: publicTripPreviewCover(trip) }} style={styles.heroImage} />
            <View style={styles.heroScrim} />
            <View style={styles.heroContent}>
              <Text style={styles.owner}>Kèo của {trip.ownerName}</Text>
              <Text style={styles.title}>{trip.title}</Text>
              <Text style={styles.meta}>{trip.destination} · {formatDateRange(trip.startDate, trip.endDate)}</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{trip.cloneCount}</Text>
              <Text style={styles.statLabel}>lượt chôm</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{savedPlaceCount}</Text>
              <Text style={styles.statLabel}>địa điểm</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{trip.memberCount}</Text>
              <Text style={styles.statLabel}>thành viên</Text>
            </View>
          </View>

          {trip.distributionMode !== "EXPLORE_FREE" && trip.guideId ? (
            <PrimaryButton onPress={() => router.push({ pathname: "/guide/[guideId]", params: { guideId: trip.guideId } })}>
              {trip.guidePrice && trip.guidePrice > 0
                ? `Mua guide ${formatMoney(trip.guidePrice, trip.guideCurrency)}`
                : "Lấy guide trong Shop"}
            </PrimaryButton>
          ) : (
            <PrimaryButton onPress={cloneTrip} disabled={cloning || authLoading}>
              {cloning ? "Đang chôm kèo..." : "Chôm kèo này về sửa"}
            </PrimaryButton>
          )}

          <View style={styles.mapSection}>
            <View style={styles.mapHeader}>
              <Text style={styles.sectionTitle}>Bản đồ</Text>
              <Text style={styles.mapCount}>{mapItems.length} điểm có tọa độ</Text>
            </View>
            <TripMapWebView items={mapItems} routePath={null} />
          </View>

          <View style={styles.days}>
            {trip.days.map((day, dayIndex) => (
              <Card key={day.id} style={styles.dayCard}>
                <View style={[styles.dayAccent, { backgroundColor: dayColors[dayIndex % dayColors.length] }]} />
                <View style={styles.dayHeader}>
                  <Text style={styles.dayTitle}>Ngày {dayIndex + 1}</Text>
                  <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                </View>
                {day.places.length === 0 ? (
                  <Text style={styles.emptyDay}>Chưa xếp chỗ chơi.</Text>
                ) : (
                  day.places.map((place, placeIndex) => (
                    <View key={place.id} style={styles.placeRow}>
                      <View style={[styles.placeIndex, { backgroundColor: dayColors[dayIndex % dayColors.length] }]}>
                        <Text style={styles.placeIndexText}>{placeIndex + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.placeName}>{place.name}</Text>
                        <Text style={styles.placeMeta}>
                          {categoryLabels[place.category] ?? place.category}
                          {place.cost ? ` · ${formatMoney(place.cost)}` : ""}
                        </Text>
                        {place.note ? <Text style={styles.note}>{place.note}</Text> : null}
                      </View>
                    </View>
                  ))
                )}
              </Card>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 28 },
  backButton: { alignSelf: "flex-start", paddingVertical: 8, marginBottom: 8 },
  backText: { color: colors.brand, fontSize: 13, fontWeight: "900" },
  hero: { height: 286, borderRadius: 24, overflow: "hidden", marginBottom: 14, backgroundColor: colors.surfaceSoft },
  heroImage: { width: "100%", height: "100%" },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(43,33,24,0.36)" },
  heroContent: { position: "absolute", left: 18, right: 18, bottom: 18 },
  owner: { color: "rgba(255,255,255,0.82)", fontSize: 12, fontWeight: "900", marginBottom: 6 },
  title: { color: "#fff", fontSize: 28, fontWeight: "900", lineHeight: 33 },
  meta: { color: "rgba(255,255,255,0.82)", fontSize: 13, fontWeight: "800", lineHeight: 19, marginTop: 8 },
  statRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statCard: { flex: 1, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, padding: 12 },
  statValue: { color: colors.text, fontSize: 20, fontWeight: "900" },
  statLabel: { color: colors.muted, fontSize: 11, fontWeight: "800", marginTop: 2 },
  mapSection: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 10,
    marginTop: 14,
    marginBottom: 16,
  },
  mapHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingHorizontal: 4, marginBottom: 8 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "900" },
  mapCount: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  days: { marginTop: 16 },
  dayCard: { position: "relative", overflow: "hidden" },
  dayAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5 },
  dayHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12, paddingLeft: 4 },
  dayTitle: { color: colors.text, fontSize: 17, fontWeight: "900" },
  dayDate: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  placeRow: { flexDirection: "row", gap: 10, paddingVertical: 9, borderTopWidth: 1, borderTopColor: colors.border },
  placeIndex: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  placeIndexText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  placeName: { color: colors.text, fontSize: 14, fontWeight: "900" },
  placeMeta: { color: colors.muted, fontSize: 11, fontWeight: "800", marginTop: 3 },
  note: { color: colors.secondary, fontSize: 12, fontWeight: "700", lineHeight: 17, marginTop: 6 },
  emptyDay: { color: colors.muted, fontSize: 12, fontWeight: "800", paddingLeft: 4 },
});
