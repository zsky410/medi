import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import type { PublicTripListItemDto } from "@medi/types";
import { fetchPublicTrips } from "../../lib/api";
import { colors } from "../../lib/theme";
import { ErrorBanner, LoadingState, PageHeader, Pill } from "../../components/ui";
import {
  PUBLIC_TRIP_CARD_COLORS,
  publicTripDurationLabel,
  publicTripPreviewCover,
} from "../../lib/public-trips";

const POPULAR_DESTINATIONS = ["Đà Lạt", "Đà Nẵng", "Nha Trang", "Ninh Bình", "Hà Nội", "TP.HCM", "Huế", "Phú Quốc"];

function TripCard({ trip, color, onPress }: { trip: PublicTripListItemDto; color: string; onPress: () => void }) {
  const duration = publicTripDurationLabel(trip.startDate, trip.endDate);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tripCard, pressed && styles.pressed]}>
      <View style={styles.coverWrap}>
        <Image source={{ uri: publicTripPreviewCover(trip) }} style={styles.cover} />
        <View style={styles.coverScrim} />
        <View style={styles.coverContent}>
          <Text style={styles.destination} numberOfLines={1}>{trip.destination.split(",")[0]}</Text>
          <Text style={styles.tripTitle} numberOfLines={2}>{trip.title}</Text>
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{duration}</Text>
        </View>
      </View>
      <View style={styles.tripFooter}>
        <View style={styles.ownerRow}>
          <View style={[styles.ownerDot, { backgroundColor: color }]}>
            <Text style={styles.ownerInitial}>{trip.ownerName[0]}</Text>
          </View>
          <Text style={styles.ownerName} numberOfLines={1}>{trip.ownerName}</Text>
        </View>
        <View style={styles.tripStats}>
          <Text style={styles.stat}>{trip.placeCount} chỗ</Text>
          <Text style={styles.cloneStat}>{trip.cloneCount} chôm</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState<string | undefined>();
  const [trips, setTrips] = useState<PublicTripListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const destinationQuery = useMemo(() => {
    const value = destination ?? query.trim();
    return value.length > 0 ? value : undefined;
  }, [destination, query]);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await fetchPublicTrips({ destination: destinationQuery, limit: 24 });
      setTrips(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được kèo công khai");
    }
  }, [destinationQuery]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) return <LoadingState />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
      keyboardShouldPersistTaps="handled"
    >
      <PageHeader title="Đi đâu chơi ta?" subtitle="Khám phá các kèo công khai" />
      <TextInput
        value={query}
        onChangeText={(value) => {
          setQuery(value);
          setDestination(undefined);
        }}
        placeholder="Nhập điểm đến hoặc kiểu du lịch..."
        placeholderTextColor={`${colors.muted}99`}
        style={styles.search}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRail}>
        {POPULAR_DESTINATIONS.map((place) => (
          <Pill
            key={place}
            active={destination === place}
            onPress={() => {
              setDestination(place);
              setQuery("");
            }}
          >
            {place}
          </Pill>
        ))}
      </ScrollView>
      <ErrorBanner message={error} />
      {trips.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Chưa có kèo phù hợp</Text>
          <Text style={styles.emptyBody}>Thử đổi điểm đến hoặc mở web để chia sẻ chuyến đi đầu tiên.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {trips.map((trip, index) => (
            <TripCard
              key={trip.id}
              trip={trip}
              color={PUBLIC_TRIP_CARD_COLORS[index % PUBLIC_TRIP_CARD_COLORS.length]}
              onPress={() => router.push({ pathname: "/public-trip/[tripId]", params: { tripId: trip.id } })}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 26 },
  search: {
    minHeight: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 14,
  },
  chipRail: { marginBottom: 10 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  tripCard: {
    width: "48%",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  pressed: { transform: [{ scale: 0.99 }] },
  coverWrap: { height: 132, overflow: "hidden" },
  cover: { height: "100%", width: "100%", backgroundColor: colors.surfaceSoft },
  coverScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(43,33,24,0.28)" },
  coverContent: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
  },
  destination: { color: "#fff", fontSize: 19, fontWeight: "900", lineHeight: 23 },
  tripTitle: { color: "rgba(255,255,255,0.82)", fontSize: 11, fontWeight: "800", lineHeight: 15, marginTop: 2 },
  durationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  durationText: { color: colors.text, fontSize: 10, fontWeight: "900" },
  tripFooter: { padding: 10, gap: 9 },
  ownerRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  ownerDot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  ownerInitial: { color: "#fff", fontSize: 11, fontWeight: "900" },
  ownerName: { flex: 1, color: colors.muted, fontSize: 11, fontWeight: "800" },
  tripStats: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, paddingTop: 2 },
  stat: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  cloneStat: { color: colors.brand, fontSize: 10, fontWeight: "900" },
  empty: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: "900", textAlign: "center" },
  emptyBody: { color: colors.muted, fontSize: 13, fontWeight: "700", textAlign: "center", lineHeight: 19, marginTop: 6 },
});
