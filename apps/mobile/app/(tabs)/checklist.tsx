import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ChecklistItemDto, ChecklistType } from "@medi/types";
import {
  createChecklistItem,
  deleteChecklistItem,
  fetchChecklist,
  updateChecklistItem,
} from "../../lib/api";
import { Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, Pill, PrimaryButton } from "../../components/ui";
import { colors } from "../../lib/theme";
import { useActiveTripDetail } from "../../lib/use-active-trip";

export default function ChecklistScreen() {
  const { detail, loading, refreshing, error: tripError, refresh } = useActiveTripDetail();
  const [items, setItems] = useState<ChecklistItemDto[]>([]);
  const [type, setType] = useState<ChecklistType>("TODO");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadItems(tripId: string) {
    setItems(await fetchChecklist(tripId));
  }

  useEffect(() => {
    if (!detail) return;
    loadItems(detail.id).catch((err) => setError(err instanceof Error ? err.message : "Không tải được checklist"));
  }, [detail]);

  async function addItem() {
    if (!detail || !text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const item = await createChecklistItem(detail.id, { text: text.trim(), type });
      setItems((current) => [item, ...current]);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thêm được checklist");
    } finally {
      setBusy(false);
    }
  }

  async function toggleItem(item: ChecklistItemDto) {
    if (!detail) return;
    const next = await updateChecklistItem(detail.id, item.id, { checked: !item.checked });
    setItems((current) => current.map((entry) => (entry.id === item.id ? next : entry)));
  }

  async function removeItem(item: ChecklistItemDto) {
    if (!detail) return;
    await deleteChecklistItem(detail.id, item.id);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
  }

  const visibleItems = items.filter((item) => item.type === type);

  if (loading) return <LoadingState />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
    >
      <PageHeader title="Checklist" subtitle={detail?.title ?? "Companion"} />
      <ErrorBanner message={tripError || error} />
      {!detail ? (
        <EmptyState title="Chưa có chuyến đi" body="Tạo chuyến đi trước để dùng checklist." />
      ) : (
        <>
          <View style={styles.pillRow}>
            <Pill active={type === "TODO"} onPress={() => setType("TODO")}>Việc cần làm</Pill>
            <Pill active={type === "PACKING"} onPress={() => setType("PACKING")} color={colors.teal}>Đồ cần mang</Pill>
          </View>
          <Card>
            <Field
              label={type === "TODO" ? "Thêm việc" : "Thêm đồ cần mang"}
              value={text}
              onChangeText={setText}
              placeholder={type === "TODO" ? "VD: Đặt xe sân bay" : "VD: Áo khoác"}
            />
            <PrimaryButton onPress={addItem} disabled={busy}>{busy ? "Đang thêm..." : "Thêm"}</PrimaryButton>
          </Card>
          {visibleItems.length === 0 ? (
            <EmptyState title="Danh sách trống" body="Thêm vài mục để cả nhóm không quên." />
          ) : (
            visibleItems.map((item) => (
              <Card key={item.id} style={styles.item}>
                <Pressable onPress={() => toggleItem(item)} style={styles.itemMain}>
                  <View style={[styles.checkbox, item.checked && styles.checkboxDone]}>
                    {item.checked ? <Text style={styles.checkText}>✓</Text> : null}
                  </View>
                  <Text style={[styles.itemText, item.checked && styles.itemDone]}>{item.text}</Text>
                </Pressable>
                <Pressable onPress={() => removeItem(item)} style={styles.removeButton}>
                  <Text style={styles.removeText}>Xóa</Text>
                </Pressable>
              </Card>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 28 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  item: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkText: { color: "#fff", fontSize: 14, fontWeight: "900" },
  itemText: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "800" },
  itemDone: { color: colors.muted, textDecorationLine: "line-through" },
  removeButton: { paddingHorizontal: 8, paddingVertical: 6 },
  removeText: { color: colors.danger, fontSize: 12, fontWeight: "900" },
});
