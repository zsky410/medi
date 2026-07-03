import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import type { TripDto } from "@medi/types";
import { fetchTrips } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function TripsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchTrips();
      setTrips(data);
    } catch {
      setTrips([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B2C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào, {user?.name ?? "bạn"} 👋</Text>
          <Text style={styles.title}>Chuyến đi của tôi</Text>
        </View>
        <Pressable onPress={handleLogout}>
          <Text style={styles.logout}>Đăng xuất</Text>
        </Pressable>
      </View>

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B2C" />}
        contentContainerStyle={trips.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có chuyến đi. Tạo trên web app nhé!</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>📍 {item.destination}</Text>
            <Text style={styles.cardDates}>
              {item.startDate} → {item.endDate}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF9F2" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF9F2" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  greeting: { fontSize: 13, fontWeight: "600", color: "#8A7563" },
  title: { fontSize: 24, fontWeight: "800", color: "#2B2118", marginTop: 4 },
  logout: { fontSize: 13, fontWeight: "700", color: "#FF6B2C" },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  emptyList: { flexGrow: 1, paddingHorizontal: 20, justifyContent: "center" },
  empty: { textAlign: "center", color: "#8A7563", fontWeight: "600", fontSize: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#F3E3D3",
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#2B2118", marginBottom: 4 },
  cardMeta: { fontSize: 13, fontWeight: "600", color: "#8A7563" },
  cardDates: { fontSize: 12, fontWeight: "600", color: "#FF6B2C", marginTop: 6 },
});
