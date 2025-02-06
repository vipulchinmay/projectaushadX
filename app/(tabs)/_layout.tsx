import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#f84040",
        tabBarStyle: styles.tabBar, // Footer styles with shadow
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header, // Header styles with shadow
        headerShadowVisible: false, // Hide default shadow
        headerTintColor: "#f56e7d",
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "AushadX",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* Doctor Consultation Tab */}
      <Tabs.Screen
        name="DoctorConsult"
        options={{
          headerTitle: "Doctor Consult",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "medical" : "medkit-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* Hidden 'Not Found' Tab */}
      <Tabs.Screen name="not-found" options={{ headerShown: false }} />

      {/* Schedule Medication Tab */}
      <Tabs.Screen
        name="Schedule"
        options={{
          headerTitle: "Schedule Medication",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}

// Styles for header and footer shadows
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#25292e",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  tabBar: {
    backgroundColor: "#25292e",
    borderTopWidth: 0, // Removes default border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f56e7d",
  },
});
