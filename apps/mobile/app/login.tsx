import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { API_URL, checkApiHealth, login, register } from "../lib/api";
import { useAuth } from "../lib/auth";
import { BrandLogo, ErrorBanner, Field, PrimaryButton } from "../components/ui";
import { colors } from "../lib/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@medi.app");
  const [password, setPassword] = useState("medi1234");
  const [error, setError] = useState("");
  const [apiUp, setApiUp] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    checkApiHealth().then((ok) => {
      if (active) setApiUp(ok);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      if (mode === "register") {
        await register({ name: name.trim(), email: email.trim(), password });
      } else {
        await login(email.trim(), password);
      }
      await refreshUser();
      router.replace("/explore");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xác thực được tài khoản.");
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.hero}>
        <BrandLogo />
        <Text style={styles.subtitle}>Lập kế hoạch du lịch cùng bạn bè</Text>
        <View style={[styles.apiStatus, apiUp === false && styles.apiStatusDown]}>
          <Text style={styles.apiStatusText}>
            API {apiUp == null ? "đang kiểm tra" : apiUp ? "đã kết nối" : "không kết nối được"}
          </Text>
          <Text style={styles.apiUrl}>{API_URL}</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.segment}>
          <Pressable style={[styles.segmentItem, mode === "login" && styles.segmentActive]} onPress={() => setMode("login")}>
            <Text style={[styles.segmentText, mode === "login" && styles.segmentTextActive]}>Đăng nhập</Text>
          </Pressable>
          <Pressable style={[styles.segmentItem, mode === "register" && styles.segmentActive]} onPress={() => setMode("register")}>
            <Text style={[styles.segmentText, mode === "register" && styles.segmentTextActive]}>Đăng ký</Text>
          </Pressable>
        </View>

        {mode === "register" ? <Field label="Tên" value={name} onChangeText={setName} placeholder="Tên của bạn" /> : null}
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
        <Field label="Mật khẩu" value={password} onChangeText={setPassword} placeholder="Mật khẩu" secureTextEntry />

        <ErrorBanner message={error} />

        <PrimaryButton onPress={handleLogin} disabled={loading}>
          {loading ? "Đang xử lý..." : mode === "register" ? "Tạo tài khoản" : "Đăng nhập"}
        </PrimaryButton>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 22,
    justifyContent: "center",
  },
  hero: { alignItems: "center", marginBottom: 20 },
  subtitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.muted,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  panel: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
  },
  segment: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 18,
  },
  segmentItem: { flex: 1, minHeight: 38, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  segmentActive: { backgroundColor: colors.brand },
  segmentText: { color: colors.muted, fontSize: 13, fontWeight: "900" },
  segmentTextActive: { color: "#fff" },
  apiStatus: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: "100%",
  },
  apiStatusDown: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  apiStatusText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 3,
  },
  apiUrl: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },
});
