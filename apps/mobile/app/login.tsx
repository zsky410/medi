import { useState } from "react";
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
import { login } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function LoginScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("demo@medi.app");
  const [password, setPassword] = useState("medi1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      await refreshUser();
      router.replace("/trips");
    } catch {
      setError("Đăng nhập thất bại. Kiểm tra email/mật khẩu.");
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.logo}>Mê Đi ✈️</Text>
      <Text style={styles.subtitle}>Lập kế hoạch du lịch cùng bạn bè</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Mật khẩu"
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F2",
    padding: 24,
    justifyContent: "center",
  },
  logo: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2B2118",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8A7563",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#F3E3D3",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#FF6B2C",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  error: {
    color: "#E11D48",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
});
