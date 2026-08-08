import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { GuideListItemDto } from "@medi/types";
import { fetchGuides } from "../../lib/api";
import { formatMoney } from "../../lib/format";
import { publicTripDestinationCover } from "../../lib/public-trips";
import { colors } from "../../lib/theme";
import { EmptyState, ErrorBanner, LoadingState, PageHeader } from "../../components/ui";

function GuideCard({ guide, onPress }: { guide: GuideListItemDto; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Image source={{ uri: guide.coverImage ?? publicTripDestinationCover(guide.destination) }} style={styles.cover} />
      <View style={styles.body}>
        <Text style={styles.destination} numberOfLines={1}>{guide.destination}</Text>
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
  const router = useRouter();
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
        <View style={styles.grid}>
          {guides.map((guide) => (
            <GuideCard
              key={guide.id}
              guide={guide}
              onPress={() => router.push({ pathname: "/guide/[guideId]", params: { guideId: guide.id } })}
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
  creatorStrip: {
    borderRadius: 20,
    backgroundColor: colors.surfaceDark,
    padding: 18,
    marginBottom: 14,
  },
  creatorStripTitle: { color: "#fff", fontSize: 18, fontWeight: "900" },
  creatorStripBody: { color: "rgba(255,255,255,0.72)", fontSize: 13, fontWeight: "700", lineHeight: 19, marginTop: 5 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  card: {
    width: "48%",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  pressed: { transform: [{ scale: 0.99 }] },
  cover: { height: 120, width: "100%", backgroundColor: colors.surfaceSoft },
  body: { padding: 10 },
  destination: { color: colors.brand, fontSize: 11, fontWeight: "900", marginBottom: 4 },
  title: { color: colors.text, fontSize: 14, fontWeight: "900", lineHeight: 18 },
  description: { color: colors.secondary, fontSize: 11, fontWeight: "700", lineHeight: 15, marginTop: 6 },
  footer: { paddingTop: 9, gap: 5 },
  creator: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  price: { color: colors.text, fontSize: 12, fontWeight: "900" },
  metaRow: { flexDirection: "row", gap: 5, flexWrap: "wrap", marginTop: 8 },
  meta: {
    borderRadius: 999,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 7,
    paddingVertical: 4,
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
  },
});
