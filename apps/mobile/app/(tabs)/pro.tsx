import { useMemo, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { FREE_FEATURES, PRO_FEATURES, PRO_PLANS, type ProBillingPeriod } from "@medi/types";
import { createCheckout } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatMoney } from "../../lib/format";
import { colors } from "../../lib/theme";
import { Card, ErrorBanner, PageHeader, Pill, PrimaryButton } from "../../components/ui";

export default function ProScreen() {
  const { user, refreshUser } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<ProBillingPeriod>("YEAR");
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");

  const selectedPlan = useMemo(
    () => PRO_PLANS.find((plan) => plan.period === selectedPeriod) ?? PRO_PLANS[2],
    [selectedPeriod],
  );
  const isPro = user?.plan === "PRO";

  async function upgrade() {
    if (!user) {
      setError("Đăng nhập trước khi nâng cấp PRO.");
      return;
    }
    setRedirecting(true);
    setError("");
    try {
      const session = await createCheckout({ period: selectedPeriod });
      await Linking.openURL(session.url);
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được phiên thanh toán");
    } finally {
      setRedirecting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PageHeader title="Mê Đi PRO" subtitle="Công cụ cho nhóm đi nhiều" />
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>PRO tools</Text>
        <Text style={styles.heroTitle}>Lên lịch nhanh hơn, đi rõ ràng hơn.</Text>
        <Text style={styles.heroBody}>
          Phần lõi vẫn miễn phí. PRO mở thêm AI, tối ưu lộ trình, offline và xuất Google Maps cho những chuyến đi cần chuẩn bị kỹ.
        </Text>
      </View>

      <ErrorBanner message={error} />

      <Card style={styles.proCard}>
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>BEST DEAL</Text>
        </View>
        <Text style={styles.planName}>Mê Đi PRO</Text>
        <Text style={styles.price}>{formatMoney(selectedPlan.price)}</Text>
        <Text style={styles.period}>gói {selectedPlan.label.toLowerCase()} · {selectedPlan.durationLabel}</Text>
        <View style={styles.periodRow}>
          {PRO_PLANS.map((plan) => (
            <Pill
              key={plan.period}
              active={selectedPeriod === plan.period}
              onPress={() => setSelectedPeriod(plan.period)}
              color={colors.pink}
            >
              {plan.label}
            </Pill>
          ))}
        </View>
        <View style={styles.featureList}>
          <Text style={styles.featureStrong}>Tất cả tính năng miễn phí</Text>
          {PRO_FEATURES.map((feature) => (
            <Text key={feature} style={styles.feature}>• {feature}</Text>
          ))}
        </View>
        {isPro ? (
          <View style={styles.currentPlan}>
            <Text style={styles.currentPlanText}>Bạn đang dùng PRO</Text>
          </View>
        ) : (
          <PrimaryButton onPress={upgrade} disabled={redirecting}>
            {redirecting ? "Đang mở thanh toán..." : "Lên PRO qua SePay"}
          </PrimaryButton>
        )}
      </Card>

      <Card style={styles.freeCard}>
        <Text style={styles.freeTitle}>Hạng phổ thông</Text>
        <Text style={styles.freePrice}>0 đ</Text>
        {FREE_FEATURES.map((feature) => (
          <Text key={feature} style={styles.freeFeature}>✓ {feature}</Text>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 26 },
  hero: {
    borderRadius: 24,
    backgroundColor: colors.surfaceDark,
    padding: 22,
    marginBottom: 16,
  },
  heroEyebrow: { color: colors.sun, fontSize: 12, fontWeight: "900", marginBottom: 8 },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "900", lineHeight: 33 },
  heroBody: { color: "rgba(255,255,255,0.72)", fontSize: 13, fontWeight: "700", lineHeight: 20, marginTop: 10 },
  proCard: { borderColor: colors.brand, borderWidth: 2, paddingTop: 24 },
  ribbon: {
    position: "absolute",
    top: -11,
    alignSelf: "center",
    borderRadius: 4,
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  ribbonText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  planName: { color: colors.brand, fontSize: 20, fontWeight: "900" },
  price: { color: colors.text, fontSize: 38, fontWeight: "900", marginTop: 6 },
  period: { color: colors.muted, fontSize: 12, fontWeight: "800", marginBottom: 14 },
  periodRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  featureList: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14, marginTop: 4, marginBottom: 16 },
  featureStrong: { color: colors.text, fontSize: 14, fontWeight: "900", marginBottom: 8 },
  feature: { color: colors.secondary, fontSize: 13, fontWeight: "800", lineHeight: 22 },
  currentPlan: { borderRadius: 999, backgroundColor: colors.brand, paddingVertical: 13, alignItems: "center" },
  currentPlanText: { color: "#fff", fontSize: 14, fontWeight: "900" },
  freeCard: { backgroundColor: colors.surfaceSoft },
  freeTitle: { color: colors.text, fontSize: 18, fontWeight: "900" },
  freePrice: { color: colors.text, fontSize: 30, fontWeight: "900", marginVertical: 8 },
  freeFeature: { color: colors.muted, fontSize: 13, fontWeight: "800", lineHeight: 22 },
});
