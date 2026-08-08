import { useMemo } from "react";
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { DayDto, PlaceDto } from "@medi/types";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, PrimaryButton, Pill, textStyles } from "../../components/ui";
import { formatDate, todayIso } from "../../lib/format";
import { colors, dayColors } from "../../lib/theme";
import { useActiveTripDetail } from "../../lib/use-active-trip";

function buildDirections(place: PlaceDto) {
  if (place.lat != null && place.lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([place.name, place.address].filter(Boolean).join(", "))}`;
}

function pickTodayDay(days: DayDto[]) {
  const today = todayIso();
  return days.find((day) => day.date === today) ?? days.find((day) => day.date > today) ?? days[0] ?? null;
}

export default function TodayScreen() {
  const router = useRouter();
  const { detail, loading, refreshing, error, refresh } = useActiveTripDetail();
  const selectedDay = useMemo(() => (detail ? pickTodayDay(detail.days) : null), [detail]);

  if (loading) return <LoadingState />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
    >
      <PageHeader title="Hôm nay" subtitle={detail?.title ?? "Companion"} />
      <ErrorBanner message={error} />
      {!detail || !selectedDay ? (
        <EmptyState title="Chưa có lịch trình" body="Tạo chuyến đi hoặc thêm địa điểm trong trip detail." />
      ) : (
        <>
          <View style={styles.dayHeader}>
            <Pill active color={dayColors[selectedDay.order % dayColors.length]}>
              Ngày {selectedDay.order + 1}
            </Pill>
            <Text style={styles.date}>{formatDate(selectedDay.date)}</Text>
          </View>
          {selectedDay.places.length === 0 ? (
            <EmptyState title="Ngày này chưa có điểm đến" body="Mở trip detail để thêm địa điểm nhanh." />
          ) : (
            selectedDay.places.map((place, index) => (
              <View key={place.id} style={styles.placeCard}>
                <View style={[styles.index, { backgroundColor: dayColors[selectedDay.order % dayColors.length] }]}>
                  <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  {place.address ? <Text style={textStyles.meta}>{place.address}</Text> : null}
                  {place.note ? <Text style={styles.note}>{place.note}</Text> : null}
                  <Pressable onPress={() => Linking.openURL(buildDirections(place))} style={styles.linkButton}>
                    <Text style={styles.linkText}>Mở chỉ đường</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
          <PrimaryButton onPress={() => router.push({ pathname: "/trip/[tripId]", params: { tripId: detail.id } })}>
            Mở trip detail
          </PrimaryButton>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 28 },
  dayHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  date: { color: colors.text, fontSize: 14, fontWeight: "900", marginBottom: 8 },
  placeCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  index: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  indexText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  placeName: { color: colors.text, fontSize: 16, fontWeight: "900", marginBottom: 4 },
  note: { color: colors.secondary, fontSize: 13, fontWeight: "700", marginTop: 8, lineHeight: 19 },
  linkButton: { alignSelf: "flex-start", marginTop: 10, paddingVertical: 8 },
  linkText: { color: colors.brand, fontSize: 13, fontWeight: "900" },
});
