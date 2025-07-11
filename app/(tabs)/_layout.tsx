import { Tabs } from "expo-router";
import React, { Suspense } from "react";
import { Platform, Text } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";

export default function TabLayout() {
  // const colorScheme = useColorScheme();

  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#447dfc",
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: "absolute",
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="write"
          options={{
            title: "Write",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="pencil.line" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.crop.circle" color={color} />
            ),
          }}
        />
      </Tabs>
    </Suspense>
  );
}
