import { useCallback, useEffect, useMemo, useState } from "react";
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type {
  AttachmentDto,
  CreatePlaceInput,
  DayDto,
  PlaceCategory,
  PlaceDto,
  TripDetailDto,
  UpdatePlaceInput,
} from "@medi/types";
import { PLACE_CATEGORIES } from "@medi/types";
import {
  createPlace,
  deletePlace,
  fetchAttachments,
  fetchTripDetail,
  importBookingText,
  updatePlace,
} from "../../lib/api";
import { formatDate, formatDateRange, formatMoney } from "../../lib/format";
import { colors, dayColors } from "../../lib/theme";
import {
  Card,
  EmptyState,
  ErrorBanner,
  Field,
  LoadingState,
  PageHeader,
  Pill,
  PrimaryButton,
  Sheet,
  textStyles,
} from "../../components/ui";

const categoryLabels: Record<PlaceCategory, string> = {
  ATTRACTION: "Tham quan",
  FOOD: "Ăn uống",
  LODGING: "Lưu trú",
  TRANSPORT: "Di chuyển",
  SHOPPING: "Mua sắm",
  OTHER: "Khác",
};

function directionsUrl(place: PlaceDto) {
  if (place.lat != null && place.lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([place.name, place.address].filter(Boolean).join(", "))}`;
}

function PlaceForm({
  days,
  place,
  defaultDayId,
  onSave,
  onDelete,
  busy,
}: {
  days: DayDto[];
  place: PlaceDto | null;
  defaultDayId: string | null;
  onSave: (input: CreatePlaceInput | UpdatePlaceInput, placeId?: string) => Promise<void>;
  onDelete: (place: PlaceDto) => Promise<void>;
  busy: boolean;
}) {
  const [name, setName] = useState(place?.name ?? "");
  const [address, setAddress] = useState(place?.address ?? "");
  const [note, setNote] = useState(place?.note ?? "");
  const [cost, setCost] = useState(place?.cost ? String(place.cost) : "");
  const [category, setCategory] = useState<PlaceCategory>(place?.category ?? "OTHER");
  const [dayId, setDayId] = useState<string | null>(place?.dayId ?? defaultDayId);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (!name.trim()) {
      setError("Tên địa điểm không được để trống.");
      return;
    }
    const numericCost = cost.trim() ? Number(cost.replace(/\D/g, "")) : null;
    await onSave(
      {
        name: name.trim(),
        category,
        dayId,
        address: address.trim() || null,
        note: note.trim() || null,
        cost: numericCost,
      },
      place?.id,
    );
  }

  return (
    <View>
      <ErrorBanner message={error} />
      <Field label="Tên địa điểm" value={name} onChangeText={setName} />
      <Field label="Địa chỉ" value={address} onChangeText={setAddress} />
      <Field label="Ghi chú" value={note} onChangeText={setNote} multiline />
      <Field label="Chi phí dự kiến" value={cost} onChangeText={setCost} keyboardType="numeric" />
      <Text style={styles.sectionLabel}>Danh mục</Text>
      <View style={styles.wrap}>
        {PLACE_CATEGORIES.map((item) => (
          <Pill key={item} active={category === item} onPress={() => setCategory(item)}>
            {categoryLabels[item]}
          </Pill>
        ))}
      </View>
      <Text style={styles.sectionLabel}>Xếp vào ngày</Text>
      <View style={styles.wrap}>
        <Pill active={dayId == null} onPress={() => setDayId(null)} color={colors.muted}>Chưa xếp</Pill>
        {days.map((day) => (
          <Pill
            key={day.id}
            active={dayId === day.id}
            onPress={() => setDayId(day.id)}
            color={dayColors[day.order % dayColors.length]}
          >
            Ngày {day.order + 1}
          </Pill>
        ))}
      </View>
      <PrimaryButton onPress={submit} disabled={busy}>{busy ? "Đang lưu..." : place ? "Lưu địa điểm" : "Thêm địa điểm"}</PrimaryButton>
      {place ? (
        <PrimaryButton tone="danger" onPress={() => onDelete(place)} disabled={busy} style={{ marginTop: 10 }}>
          Xóa địa điểm
        </PrimaryButton>
      ) : null}
    </View>
  );
}

function PlaceCard({ place, index, color, onPress }: { place: PlaceDto; index: number; color: string; onPress: () => void }) {
  return (
    <Card>
      <Pressable onPress={onPress} style={styles.placeRow}>
        <View style={[styles.placeIndex, { backgroundColor: color }]}>
          <Text style={styles.placeIndexText}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeMeta}>
            {categoryLabels[place.category]}{place.cost != null ? ` · ${formatMoney(place.cost)}` : ""}
          </Text>
          {place.address ? <Text style={textStyles.meta}>{place.address}</Text> : null}
          {place.note ? <Text style={styles.note}>{place.note}</Text> : null}
          <Pressable onPress={() => Linking.openURL(directionsUrl(place))} style={styles.mapLink}>
            <Text style={styles.mapText}>Mở chỉ đường</Text>
          </Pressable>
        </View>
      </Pressable>
    </Card>
  );
}

function BookingCard({ attachment }: { attachment: AttachmentDto }) {
  const meta = attachment.metadata;
  return (
    <Card>
      <Text style={styles.bookingTitle}>{attachment.name ?? meta?.provider ?? attachment.type}</Text>
      <Text style={styles.placeMeta}>
        {attachment.type}
        {meta?.confirmationCode ? ` · ${meta.confirmationCode}` : ""}
      </Text>
      {meta?.startDate || meta?.endDate ? (
        <Text style={textStyles.meta}>{[meta.startDate, meta.endDate].filter(Boolean).join(" - ")}</Text>
      ) : null}
      {meta?.address ? <Text style={styles.note}>{meta.address}</Text> : null}
      {attachment.url ? (
        <Pressable onPress={() => Linking.openURL(attachment.url)} style={styles.mapLink}>
          <Text style={styles.mapText}>Mở liên kết</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

export default function TripDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tripId: string }>();
  const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;
  const [trip, setTrip] = useState<TripDetailDto | null>(null);
  const [attachments, setAttachments] = useState<AttachmentDto[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [editingPlace, setEditingPlace] = useState<PlaceDto | null>(null);
  const [placeSheetOpen, setPlaceSheetOpen] = useState(false);
  const [importSheetOpen, setImportSheetOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const selectedDay = useMemo(() => trip?.days.find((day) => day.id === selectedDayId) ?? null, [trip, selectedDayId]);
  const visiblePlaces = selectedDay ? selectedDay.places : trip?.unassignedPlaces ?? [];
  const selectedColor = selectedDay ? dayColors[selectedDay.order % dayColors.length] : colors.muted;

  const load = useCallback(async () => {
    if (!tripId) return;
    setError("");
    const [nextTrip, nextAttachments] = await Promise.all([fetchTripDetail(tripId), fetchAttachments(tripId)]);
    setTrip(nextTrip);
    setAttachments(nextAttachments);
    setSelectedDayId((current) => current ?? nextTrip.days[0]?.id ?? null);
  }, [tripId]);

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) => setError(err instanceof Error ? err.message : "Không tải được trip"))
      .finally(() => setLoading(false));
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load().catch((err) => setError(err instanceof Error ? err.message : "Không tải được trip"));
    setRefreshing(false);
  }

  async function savePlace(input: CreatePlaceInput | UpdatePlaceInput, placeId?: string) {
    if (!tripId) return;
    setBusy(true);
    setError("");
    try {
      if (placeId) {
        await updatePlace(tripId, placeId, input);
      } else {
        await createPlace(tripId, input as CreatePlaceInput);
      }
      setPlaceSheetOpen(false);
      setEditingPlace(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được địa điểm");
    } finally {
      setBusy(false);
    }
  }

  async function removePlace(place: PlaceDto) {
    if (!tripId) return;
    setBusy(true);
    try {
      await deletePlace(tripId, place.id);
      setPlaceSheetOpen(false);
      setEditingPlace(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được địa điểm");
    } finally {
      setBusy(false);
    }
  }

  async function submitImport() {
    if (!tripId || importText.trim().length < 20) {
      setError("Nội dung booking cần ít nhất 20 ký tự.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await importBookingText(tripId, { text: importText.trim() });
      setImportText("");
      setImportSheetOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không import được booking");
    } finally {
      setBusy(false);
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
      <PageHeader
        title={trip?.title ?? "Trip"}
        subtitle={trip ? `${trip.destination} · ${formatDateRange(trip.startDate, trip.endDate)}` : "Companion"}
        action={<PrimaryButton onPress={() => { setEditingPlace(null); setPlaceSheetOpen(true); }}>Thêm</PrimaryButton>}
      />
      <ErrorBanner message={error} />
      {!trip ? (
        <EmptyState title="Không tìm thấy trip" />
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayStrip}>
            <Pill active={selectedDayId == null} onPress={() => setSelectedDayId(null)} color={colors.muted}>Chưa xếp</Pill>
            {trip.days.map((day) => (
              <Pill
                key={day.id}
                active={selectedDayId === day.id}
                onPress={() => setSelectedDayId(day.id)}
                color={dayColors[day.order % dayColors.length]}
              >
                Ngày {day.order + 1} · {formatDate(day.date)}
              </Pill>
            ))}
          </ScrollView>
          <Text style={styles.sectionTitle}>{selectedDay ? `Ngày ${selectedDay.order + 1}` : "Địa điểm chưa xếp"}</Text>
          {visiblePlaces.length === 0 ? (
            <EmptyState title="Chưa có địa điểm" body="Thêm địa điểm nhanh hoặc import booking bên dưới." />
          ) : (
            visiblePlaces.map((place, index) => (
              <PlaceCard
                key={place.id}
                place={place}
                index={index}
                color={selectedColor}
                onPress={() => {
                  setEditingPlace(place);
                  setPlaceSheetOpen(true);
                }}
              />
            ))
          )}
          <View style={styles.bookingHeader}>
            <Text style={styles.sectionTitle}>Booking</Text>
            <PrimaryButton tone="secondary" onPress={() => setImportSheetOpen(true)}>Import</PrimaryButton>
          </View>
          {attachments.length === 0 ? (
            <EmptyState title="Chưa có booking" body="Dán email xác nhận để tạo booking/place nhanh." />
          ) : (
            attachments.map((attachment) => <BookingCard key={attachment.id} attachment={attachment} />)
          )}
        </>
      )}
      <Sheet title={editingPlace ? "Sửa địa điểm" : "Thêm địa điểm"} visible={placeSheetOpen} onClose={() => setPlaceSheetOpen(false)}>
        {trip ? (
          <PlaceForm
            key={editingPlace?.id ?? "new"}
            days={trip.days}
            place={editingPlace}
            defaultDayId={selectedDayId}
            onSave={savePlace}
            onDelete={removePlace}
            busy={busy}
          />
        ) : null}
      </Sheet>
      <Sheet title="Import booking" visible={importSheetOpen} onClose={() => setImportSheetOpen(false)}>
        <Field label="Nội dung email/xác nhận" value={importText} onChangeText={setImportText} multiline />
        <PrimaryButton onPress={submitImport} disabled={busy}>{busy ? "Đang import..." : "Import booking"}</PrimaryButton>
      </Sheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 52, paddingBottom: 28 },
  backButton: { alignSelf: "flex-start", paddingVertical: 8, marginBottom: 4 },
  backText: { color: colors.muted, fontSize: 13, fontWeight: "900" },
  dayStrip: { marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginBottom: 12 },
  sectionLabel: { color: colors.text, fontSize: 13, fontWeight: "900", marginBottom: 8 },
  wrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  placeRow: { flexDirection: "row", gap: 12 },
  placeIndex: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  placeIndexText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  placeName: { color: colors.text, fontSize: 16, fontWeight: "900", marginBottom: 4 },
  placeMeta: { color: colors.muted, fontSize: 12, fontWeight: "900", marginBottom: 4 },
  note: { color: colors.secondary, fontSize: 13, fontWeight: "700", lineHeight: 19, marginTop: 6 },
  mapLink: { alignSelf: "flex-start", paddingVertical: 8, marginTop: 4 },
  mapText: { color: colors.brand, fontSize: 13, fontWeight: "900" },
  bookingHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  bookingTitle: { color: colors.text, fontSize: 15, fontWeight: "900", marginBottom: 4 },
});
