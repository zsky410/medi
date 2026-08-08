import { useEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import type { TripMessageDto } from "@medi/types";
import { fetchMessages, sendMessage } from "../../lib/api";
import { Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, PrimaryButton } from "../../components/ui";
import { colors } from "../../lib/theme";
import { useActiveTripDetail } from "../../lib/use-active-trip";

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export default function ChatScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const { detail, loading, refreshing, error: tripError, refresh } = useActiveTripDetail();
  const [messages, setMessages] = useState<TripMessageDto[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadMessages(tripId: string) {
    setMessages(await fetchMessages(tripId));
  }

  useEffect(() => {
    if (!detail) return;
    loadMessages(detail.id).catch((err) => setError(err instanceof Error ? err.message : "Không tải được chat"));
  }, [detail]);

  async function submit() {
    if (!detail || !body.trim()) return;
    setBusy(true);
    setError("");
    try {
      const message = await sendMessage(detail.id, { body });
      setMessages((current) => [...current, message]);
      setBody("");
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không gửi được tin nhắn");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
    >
      <PageHeader title="Chat" subtitle={detail?.title ?? "Companion"} />
      <ErrorBanner message={tripError || error} />
      {!detail ? (
        <EmptyState title="Chưa có chuyến đi" body="Tạo hoặc tham gia chuyến đi trước để chat nhóm." />
      ) : (
        <>
          {messages.length === 0 ? (
            <EmptyState title="Chưa có tin nhắn" body="Gửi tin đầu tiên để cả nhóm cập nhật nhanh." />
          ) : (
            messages.map((message) => (
              <Card key={message.id} style={styles.message}>
                <View style={styles.messageHeader}>
                  <Text style={styles.sender}>{message.sender.name}</Text>
                  <Text style={styles.time}>{formatTime(message.createdAt)}</Text>
                </View>
                <Text style={styles.body}>{message.body}</Text>
              </Card>
            ))
          )}
          <Card>
            <Field label="Tin nhắn" value={body} onChangeText={setBody} multiline placeholder="Cập nhật cho cả nhóm..." />
            <PrimaryButton onPress={submit} disabled={busy}>{busy ? "Đang gửi..." : "Gửi"}</PrimaryButton>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 28 },
  message: { marginBottom: 8 },
  messageHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: 6 },
  sender: { color: colors.text, fontSize: 13, fontWeight: "900" },
  time: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  body: { color: colors.secondary, fontSize: 14, fontWeight: "700", lineHeight: 21 },
});
