import { Tabs } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Avatar, BrandLogo } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { colors } from "../../lib/theme";

function TabIcon({ glyph, color, focused }: { glyph: string; color: string; focused: boolean }) {
  return (
    <View style={[styles.tabIconFrame, focused && styles.tabIconFrameActive]}>
      <Text style={[styles.tabIconText, { color: focused ? "#fff" : color }]}>{glyph}</Text>
    </View>
  );
}

function HeaderRight() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.headerRight}>
      {user?.plan === "PRO" ? (
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>PRO</Text>
        </View>
      ) : null}
      <Pressable onPress={() => router.push("/profile")} accessibilityLabel="Mở hồ sơ">
        <Avatar name={user?.name} avatarUrl={user?.avatarUrl} size={34} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: () => <BrandLogo compact />,
        headerTitleAlign: "left",
        headerRight: () => <HeaderRight />,
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1.5,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 8,
        },
        headerShadowVisible: true,
        headerLeftContainerStyle: { paddingLeft: 4 },
        headerRightContainerStyle: { paddingRight: 18 },
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 76,
          paddingTop: 7,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "900",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => <TabIcon glyph="⌖" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, focused }) => <TabIcon glyph="▣" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "Trips",
          tabBarIcon: ({ color, focused }) => <TabIcon glyph="✈" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="pro"
        options={{
          title: "Pro",
          tabBarIcon: ({ color, focused }) => <TabIcon glyph="✦" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => <TabIcon glyph="●" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen name="today" options={{ href: null }} />
      <Tabs.Screen name="checklist" options={{ href: null }} />
      <Tabs.Screen name="expenses" options={{ href: null }} />
      <Tabs.Screen name="chat" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  proBadge: {
    borderRadius: 999,
    backgroundColor: colors.text,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  proBadgeText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  tabIconFrame: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconText: { fontSize: 17, fontWeight: "900", lineHeight: 20 },
  tabIconFrameActive: {
    backgroundColor: colors.brand,
    shadowColor: colors.brand,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
