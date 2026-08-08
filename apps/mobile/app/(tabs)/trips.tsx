import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import type { CreateTripInput, TripDto } from "@medi/types";
import { createTrip, fetchTrips } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatDateRange } from "../../lib/format";
import { colors } from "../../lib/theme";
import { Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, PrimaryButton, Sheet } from "../../components/ui";

const initialForm = {
  title: "",
  destination: "",
  startDate: "",
  endDate: "",
  budget: "",
};

function TripForm({
  onSubmit,
  busy,
}: {
  onSubmit: (input: CreateTripInput) => Promise<void>;
  busy: boolean;
}) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (!form.title.trim() || !form.destination.trim() || !form.startDate || !form.endDate) {
      setError("Nhập đủ tên, điểm đến, ngày đi và ngày về.");
      return;
    }
    if (form.endDate < form.startDate) {
      setError("Ngày về phải sau ngày đi.");
      return;
    }
    await onSubmit({
      title: form.title.trim(),
      destination: form.destination.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      ...(form.budget.trim()
        ? { budgetAmount: Number(form.budget.replace(/\D/g, "")), budgetCurrency: "VND" }
        : {}),
    });
    setForm(initialForm);
  }

  return (
    <View>
      <ErrorBanner message={error} />
      <Field label="Tên chuyến đi" value={form.title} onChangeText={(title) => setForm((v) => ({ ...v, title }))} />
      <Field label="Điểm đến" value={form.destination} onChangeText={(destination) => setForm((v) => ({ ...v, destination }))} />
      <Field label="Ngày đi" placeholder="YYYY-MM-DD" value={form.startDate} onChangeText={(startDate) => setForm((v) => ({ ...v, startDate }))} />
      <Field label="Ngày về" placeholder="YYYY-MM-DD" value={form.endDate} onChangeText={(endDate) => setForm((v) => ({ ...v, endDate }))} />
      <Field label="Ngân sách dự kiến" keyboardType="numeric" value={form.budget} onChangeText={(budget) => setForm((v) => ({ ...v, budget }))} />
      <PrimaryButton onPress={submit} disabled={busy}>{busy ? "Đang tạo..." : "Tạo chuyến đi"}</PrimaryButton>
    </View>
  );
}

function TripCard({ trip, onPress }: { trip: TripDto; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.tripCard}>
        {trip.coverImage ? <Image source={{ uri: trip.coverImage }} style={styles.cover} /> : <View style={styles.coverFallback} />}
        <View style={styles.tripBody}>
          <Text style={styles.tripTitle}>{trip.title}</Text>
          <Text style={styles.tripMeta}>{trip.destination}</Text>
          <Text style={styles.tripDates}>{formatDateRange(trip.startDate, trip.endDate)}</Text>
          <View style={styles.tripFooter}>
            <Text style={styles.role}>{trip.myRole ?? "MEMBER"}</Text>
            <Text style={styles.members}>{trip.members.length} người</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export default function TripsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setTrips(await fetchTrips());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh sách chuyến đi");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function submitTrip(input: CreateTripInput) {
    setCreating(true);
    try {
      const trip = await createTrip(input);
      setSheetOpen(false);
      setTrips((items) => [trip, ...items]);
      router.push({ pathname: "/trip/[tripId]", params: { tripId: trip.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được chuyến đi");
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <PageHeader
              title="Chuyến đi"
              subtitle={`Xin chào, ${user?.name ?? "bạn"}`}
              action={<PrimaryButton onPress={() => setSheetOpen(true)}>Tạo</PrimaryButton>}
            />
            <ErrorBanner message={error} />
          </>
        }
        ListEmptyComponent={<EmptyState title="Chưa có chuyến đi" body="Tạo chuyến đi đầu tiên trên mobile hoặc web." />}
        renderItem={({ item }) => (
          <TripCard trip={item} onPress={() => router.push({ pathname: "/trip/[tripId]", params: { tripId: item.id } })} />
        )}
        ListFooterComponent={<PrimaryButton tone="ghost" onPress={logout}>Đăng xuất</PrimaryButton>}
      />
      <Sheet title="Tạo chuyến đi nhanh" visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <TripForm onSubmit={submitTrip} busy={creating} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 24 },
  tripCard: { padding: 0, overflow: "hidden" },
  cover: { height: 112, width: "100%", backgroundColor: colors.surfaceSoft },
  coverFallback: { height: 84, width: "100%", backgroundColor: colors.surfaceSoft },
  tripBody: { padding: 16 },
  tripTitle: { color: colors.text, fontSize: 19, fontWeight: "900", marginBottom: 4 },
  tripMeta: { color: colors.secondary, fontSize: 13, fontWeight: "700" },
  tripDates: { color: colors.brand, fontSize: 12, fontWeight: "900", marginTop: 8 },
  tripFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  role: { color: colors.text, fontSize: 11, fontWeight: "900" },
  members: { color: colors.muted, fontSize: 11, fontWeight: "800" },
});
