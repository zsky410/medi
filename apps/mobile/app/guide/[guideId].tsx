import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { GuideDetailDto } from "@medi/types";
import { fetchGuideDetail, purchaseGuide } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatMoney } from "../../lib/format";
import { publicTripDestinationCover } from "../../lib/public-trips";
import { colors } from "../../lib/theme";
import { Card, EmptyState, ErrorBanner, LoadingState, PrimaryButton } from "../../components/ui";

export default function GuideDetailScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const params = useLocalSearchParams<{ guideId: string }>();
  const guideId = Array.isArray(params.guideId) ? params.guideId[0] : params.guideId;
  const [guide, setGuide] = useState<GuideDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!guideId) return;
    setError("");
    try {
      setGuide(await fetchGuideDetail(guideId, Boolean(user)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được guide");
    }
  }, [guideId, user]);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [authLoading, load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function buyGuide() {
    if (!guide) return;
    if (!user) {
      router.push("/login");
      return;
    }
    setBuying(true);
    setError("");
    try {
      const result = await purchaseGuide(guide.id);
      router.replace({ pathname: "/trip/[tripId]", params: { tripId: result.clonedTripId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không mua được guide");
    } finally {
      setBuying(false);
    }
  }

  if (loading || authLoading) return <LoadingState />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
    >
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Creator Shop</Text>
      </Pressable>
      <ErrorBanner message={error} />
      {!guide ? (
        <EmptyState title="Không tìm thấy guide" />
      ) : (
        <>
          <View style={styles.hero}>
            <Image source={{ uri: guide.coverImage ?? publicTripDestinationCover(guide.destination) }} style={styles.heroImage} />
          </View>
          <Card style={styles.mainCard}>
            <Text style={styles.destination}>{guide.destination}</Text>
            <Text style={styles.title}>{guide.title}</Text>
            <Text style={styles.creator}>by {guide.creatorName}</Text>
            {guide.description ? <Text style={styles.description}>{guide.description}</Text> : null}
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{guide.placeCount}</Text>
                <Text style={styles.statLabel}>địa điểm</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{guide.dayCount}</Text>
                <Text style={styles.statLabel}>ngày</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{guide.purchaseCount}</Text>
                <Text style={styles.statLabel}>lượt mua</Text>
              </View>
            </View>
            <Text style={styles.price}>{guide.price > 0 ? formatMoney(guide.price, guide.currency) : "Miễn phí"}</Text>
            {guide.owned ? (
              <PrimaryButton tone="secondary" onPress={() => router.push({ pathname: "/trip/[tripId]", params: { tripId: guide.tripId } })}>
                Xem chuyến đi gốc
              </PrimaryButton>
            ) : (
              <PrimaryButton onPress={buyGuide} disabled={buying}>
                {buying ? "Đang xử lý..." : guide.purchased ? "Mở bản remix đã mua" : "Mua & remix guide"}
              </PrimaryButton>
            )}
          </Card>

          <Card style={styles.noteCard}>
            <Text style={styles.noteTitle}>Guide sẽ được sao chép vào Trips</Text>
            <Text style={styles.noteBody}>
              Sau khi mua, Mê Đi tạo một bản chuyến đi riêng để bạn chỉnh ngày, địa điểm, checklist và chi phí theo nhóm của mình.
            </Text>
          </Card>
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
  hero: { height: 238, borderRadius: 24, overflow: "hidden", backgroundColor: colors.surfaceSoft, marginBottom: 14 },
  heroImage: { width: "100%", height: "100%" },
  mainCard: { borderWidth: 2, borderColor: colors.border },
  destination: { color: colors.brand, fontSize: 12, fontWeight: "900", marginBottom: 5 },
  title: { color: colors.text, fontSize: 26, fontWeight: "900", lineHeight: 31 },
  creator: { color: colors.muted, fontSize: 13, fontWeight: "800", marginTop: 6 },
  description: { color: colors.secondary, fontSize: 14, fontWeight: "700", lineHeight: 21, marginTop: 14 },
  stats: { flexDirection: "row", gap: 8, marginTop: 16 },
  stat: { flex: 1, borderRadius: 14, backgroundColor: colors.surfaceSoft, padding: 11 },
  statValue: { color: colors.text, fontSize: 18, fontWeight: "900" },
  statLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", marginTop: 2 },
  price: { color: colors.text, fontSize: 24, fontWeight: "900", marginVertical: 16 },
  noteCard: { backgroundColor: colors.surfaceSoft },
  noteTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  noteBody: { color: colors.secondary, fontSize: 13, fontWeight: "700", lineHeight: 19, marginTop: 6 },
});
