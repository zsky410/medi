import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { SubscriptionDto } from "@medi/types";
import { changePassword, fetchSubscription, updateProfile } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatDateTime } from "../../lib/format";
import { colors } from "../../lib/theme";
import { Avatar, Card, ErrorBanner, Field, PageHeader, Pill, PrimaryButton } from "../../components/ui";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [defaultCurrency, setDefaultCurrency] = useState(user?.defaultCurrency ?? "VND");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    setName(user?.name ?? "");
    setDefaultCurrency(user?.defaultCurrency ?? "VND");
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchSubscription()
      .then(setSubscription)
      .catch(() => setSubscription(null));
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      await updateProfile({ name: name.trim(), defaultCurrency });
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được hồ sơ");
    } finally {
      setSaving(false);
    }
  }

  async function submitPassword() {
    setChangingPassword(true);
    setPasswordError("");
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Không đổi được mật khẩu");
    } finally {
      setChangingPassword(false);
    }
  }

  async function submitLogout() {
    await logout();
    router.replace("/login");
  }

  if (!user) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <PageHeader title="Profile" subtitle="Tài khoản Mê Đi" />
        <Card style={styles.centerCard}>
          <Text style={styles.emptyTitle}>Bạn chưa đăng nhập</Text>
          <Text style={styles.emptyBody}>Đăng nhập để quản lý hồ sơ, chuyến đi và gói PRO.</Text>
          <PrimaryButton onPress={() => router.push("/login")} style={{ marginTop: 16 }}>Đăng nhập</PrimaryButton>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <PageHeader title="Profile" subtitle="Cài đặt tài khoản" />
      <Card>
        <View style={styles.identityRow}>
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size={64} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            {user.plan === "PRO" ? (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Hồ sơ</Text>
        <Field label="Tên hiển thị" value={name} onChangeText={setName} placeholder="Tên của bạn" />
        <Text style={styles.label}>Tiền tệ mặc định</Text>
        <View style={styles.row}>
          <Pill active={defaultCurrency === "VND"} onPress={() => setDefaultCurrency("VND")}>VND</Pill>
          <Pill active={defaultCurrency === "USD"} onPress={() => setDefaultCurrency("USD")} color={colors.teal}>USD</Pill>
        </View>
        <ErrorBanner message={error} />
        <PrimaryButton onPress={saveProfile} disabled={saving}>{saving ? "Đang lưu..." : "Lưu hồ sơ"}</PrimaryButton>
      </Card>

      {user.authProvider === "LOCAL" ? (
        <Card>
          <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
          <Field label="Mật khẩu hiện tại" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
          <Field label="Mật khẩu mới" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
          <ErrorBanner message={passwordError} />
          <PrimaryButton tone="secondary" onPress={submitPassword} disabled={changingPassword}>
            {changingPassword ? "Đang đổi..." : "Cập nhật mật khẩu"}
          </PrimaryButton>
        </Card>
      ) : null}

      <Card>
        <Text style={styles.sectionTitle}>Gói đăng ký</Text>
        <Text style={styles.subscription}>
          Gói hiện tại: <Text style={styles.subscriptionStrong}>{subscription?.plan ?? user.plan}</Text>
          {subscription?.renewsAt ? ` · Gia hạn ${formatDateTime(subscription.renewsAt)}` : ""}
        </Text>
        {user.plan === "PRO" ? (
          <Text style={styles.subscriptionNote}>PRO đã thanh toán qua {subscription?.provider ?? "hệ thống"}.</Text>
        ) : (
          <PrimaryButton onPress={() => router.push("/pro")}>Nâng cấp PRO</PrimaryButton>
        )}
      </Card>

      <PrimaryButton tone="ghost" onPress={submitLogout}>Đăng xuất</PrimaryButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 26 },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  name: { color: colors.text, fontSize: 19, fontWeight: "900" },
  email: { color: colors.muted, fontSize: 12, fontWeight: "800", marginTop: 3 },
  proBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.brand,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  proBadgeText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "900", marginBottom: 12 },
  label: { color: colors.text, fontSize: 13, fontWeight: "900", marginBottom: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  subscription: { color: colors.muted, fontSize: 13, fontWeight: "800", lineHeight: 20, marginBottom: 12 },
  subscriptionStrong: { color: colors.text, fontWeight: "900" },
  subscriptionNote: {
    borderRadius: 14,
    backgroundColor: colors.surfaceSoft,
    padding: 12,
    color: colors.secondary,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
  },
  centerCard: { alignItems: "center", paddingVertical: 28 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: "900", textAlign: "center" },
  emptyBody: { color: colors.muted, fontSize: 13, fontWeight: "700", textAlign: "center", lineHeight: 19, marginTop: 6 },
});
