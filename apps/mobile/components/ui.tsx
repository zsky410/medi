import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { colors } from "../lib/theme";

const logoSource = require("../assets/logo.png");

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  if (!scroll) return <View style={styles.screen}>{children}</View>;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      source={logoSource}
      resizeMode="contain"
      style={compact ? styles.logoCompact : styles.logo}
      accessibilityLabel="Mê Đi"
    />
  );
}

export function Avatar({
  name,
  avatarUrl,
  size = 34,
}: {
  name?: string | null;
  avatarUrl?: string | null;
  size?: number;
}) {
  const label = (name?.trim()?.[0] ?? "M").toUpperCase();
  const frameStyle = { width: size, height: size, borderRadius: Math.max(12, size / 2) };

  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} resizeMode="cover" style={[styles.avatar, frameStyle]} />;
  }

  return (
    <View style={[styles.avatar, styles.avatarFallback, frameStyle]}>
      <Text style={[styles.avatarText, { fontSize: Math.max(12, size * 0.4) }]}>{label}</Text>
    </View>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        {subtitle ? <Text style={styles.eyebrow}>{subtitle}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({
  children,
  onPress,
  disabled,
  tone = "primary",
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  tone?: "primary" | "secondary" | "danger" | "ghost";
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        tone === "primary" && styles.primaryButton,
        tone === "secondary" && styles.secondaryButton,
        tone === "danger" && styles.dangerButton,
        tone === "ghost" && styles.ghostButton,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          tone === "secondary" && styles.secondaryButtonText,
          tone === "ghost" && styles.ghostButtonText,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function IconButton({
  label,
  onPress,
  tone = "secondary",
}: {
  label: string;
  onPress: () => void;
  tone?: "secondary" | "danger" | "ghost";
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        tone === "danger" && styles.iconDanger,
        tone === "ghost" && styles.ghostButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.iconText, tone === "danger" && { color: colors.danger }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={`${colors.muted}88`}
        multiline={multiline}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
      />
    </View>
  );
}

export function Pill({
  children,
  active,
  onPress,
  color = colors.brand,
}: {
  children: ReactNode;
  active?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[styles.pill, active && { backgroundColor: color, borderColor: color }]}
    >
      <Text style={[styles.pillText, active && { color: "#fff" }]}>{children}</Text>
    </Pressable>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <Card style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
    </Card>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function LoadingState() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.brand} size="large" />
    </View>
  );
}

export function Sheet({
  title,
  visible,
  onClose,
  children,
}: {
  title: string;
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <IconButton label="Đóng" onPress={onClose} tone="ghost" />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export const textStyles: Record<string, StyleProp<TextStyle>> = {
  meta: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  body: { color: colors.secondary, fontSize: 14, fontWeight: "600", lineHeight: 21 },
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  screenContent: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 28 },
  logo: { width: 148, height: 58, alignSelf: "center" },
  logoCompact: { width: 96, height: 34 },
  avatar: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.brand, fontWeight: "900" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  eyebrow: { color: colors.muted, fontSize: 12, fontWeight: "800", marginBottom: 4 },
  title: { color: colors.text, fontSize: 28, fontWeight: "900", lineHeight: 34 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  button: {
    minHeight: 44,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: { backgroundColor: colors.brand },
  secondaryButton: { backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.border },
  dangerButton: { backgroundColor: colors.danger },
  ghostButton: { backgroundColor: "transparent" },
  disabled: { opacity: 0.6 },
  pressed: { transform: [{ scale: 0.98 }] },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "900" },
  secondaryButtonText: { color: colors.text },
  ghostButtonText: { color: colors.muted },
  iconButton: {
    minWidth: 40,
    minHeight: 36,
    borderRadius: 999,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  iconDanger: { backgroundColor: "#FEF2F2" },
  iconText: { color: colors.text, fontSize: 12, fontWeight: "900" },
  field: { marginBottom: 12 },
  label: { color: colors.text, fontSize: 13, fontWeight: "900", marginBottom: 6 },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  textArea: { minHeight: 104, textAlignVertical: "top" },
  pill: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  pillText: { color: colors.muted, fontSize: 12, fontWeight: "900" },
  emptyCard: { alignItems: "center", paddingVertical: 28 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: "900", textAlign: "center" },
  emptyBody: { color: colors.muted, fontSize: 13, fontWeight: "700", textAlign: "center", marginTop: 6, lineHeight: 19 },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: "800" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(43,33,24,0.42)" },
  sheet: {
    maxHeight: "88%",
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
  },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sheetTitle: { color: colors.text, fontSize: 20, fontWeight: "900" },
});
