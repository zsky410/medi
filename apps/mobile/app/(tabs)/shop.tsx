import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import type { GuideListItemDto } from "@medi/types";
import { fetchGuides } from "../../lib/api";
import { formatMoney } from "../../lib/format";
import { publicTripDestinationCover } from "../../lib/public-trips";
import { colors } from "../../lib/theme";
import { EmptyState, ErrorBanner, LoadingState, PageHeader } from "../../components/ui";

function GuideCard({ guide }: { guide: GuideListItemDto }) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Image source={{ uri: guide.coverImage ?? publicTripDestinationCover(guide.destination) }} style={styles.cover} />
      <View style={styles.body}>
        <Text style={styles.destination}>{guide.destination}</Text>
        <Text style={styles.title} numberOfLines={2}>{guide.title}</Text>
        {guide.description ? <Text style={styles.description} numberOfLines={2}>{guide.description}</Text> : null}
        <View style={styles.footer}>
          <Text style={styles.creator} numberOfLines={1}>{guide.creatorName}</Text>
          <Text style={styles.price}>{guide.price > 0 ? formatMoney(guide.price, guide.currency) : "Miễn phí"}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{guide.dayCount} ngày</Text>
          <Text style={styles.meta}>{guide.placeCount} chỗ</Text>
          <Text style={styles.meta}>{guide.purchaseCount} lượt mua</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ShopScreen() {
  const [guides, setGuides] = useState<GuideListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await fetchGuides();
      setGuides(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được Creator Shop");
    }
  }, []);

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
    >
      <PageHeader title="Creator Shop" subtitle="Guide du lịch từ cộng đồng" />
      <View style={styles.creatorStrip}>
        <Text style={styles.creatorStripTitle}>Đăng guide của bạn</Text>
        <Text style={styles.creatorStripBody}>Tạo chuyến đi trên web, bật chia sẻ shop và bán lịch trình mẫu cho cộng đồng.</Text>
      </View>
      <ErrorBanner message={error} />
      {guides.length === 0 ? (
        <EmptyState title="Chưa có guide nào" body="Hãy là người đầu tiên đăng guide từ bản web." />
      ) : (
        guides.map((guide) => <GuideCard key={guide.id} guide={guide} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 26 },
  creatorStrip: {
    borderRadius: 20,
    backgroundColor: colors.surfaceDark,
    padding: 18,
    marginBottom: 14,
  },
  creatorStripTitle: { color: "#fff", fontSize: 18, fontWeight: "900" },
  creatorStripBody: { color: "rgba(255,255,255,0.72)", fontSize: 13, fontWeight: "700", lineHeight: 19, marginTop: 5 },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
    marginBottom: 16,
  },
  pressed: { transform: [{ scale: 0.99 }] },
  cover: { height: 172, width: "100%", backgroundColor: colors.surfaceSoft },
  body: { padding: 16 },
  destination: { color: colors.brand, fontSize: 12, fontWeight: "900", marginBottom: 4 },
  title: { color: colors.text, fontSize: 19, fontWeight: "900", lineHeight: 24 },
  description: { color: colors.secondary, fontSize: 13, fontWeight: "700", lineHeight: 19, marginTop: 8 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 14 },
  creator: { flex: 1, color: colors.muted, fontSize: 12, fontWeight: "800" },
  price: { color: colors.text, fontSize: 13, fontWeight: "900" },
  metaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 12 },
  meta: {
    borderRadius: 999,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
  },
});
