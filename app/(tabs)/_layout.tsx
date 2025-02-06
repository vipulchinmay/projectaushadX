import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, Text, Linking, View, Alert } from "react-native";

export default function TabLayout() {
  const screenOptions = useMemo(() => ({
    tabBarActiveTintColor: "#f84040",
    tabBarInactiveTintColor: "#bbb", // Light gray for inactive tabs
    tabBarStyle: styles.tabBar,
    tabBarLabelStyle: styles.tabBarLabel,
    headerStyle: styles.header,
    headerShadowVisible: false,
    headerTintColor: "#f56e7d",
    headerLeft: () => <SOSButton />, // Add the SOS button to the left side
  }), []);

  return (
    <Tabs screenOptions={screenOptions}>
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "AushadX",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={26}
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
              size={26}
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
              name={focused ? "medkit" : "medkit-outline"}
              color={color}
              size={26}
            />
          ),
        }}
      />

      {/* Schedule Medication Tab */}
      <Tabs.Screen
        name="Schedule"
        options={{
          headerTitle: "Schedule Medication",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              color={color}
              size={26}
            />
          ),
        }}
      />

      {/* Hidden 'Not Found' Tab */}
      <Tabs.Screen name="not-found" options={{ headerShown: false }} />
    </Tabs>
  );
}

// 🆘 SOS Button Component
const SOSButton = () => {
  const handleSOSPress = () => {
    Alert.alert(
      "Emergency Call",
      "Do you want to call 108 for emergency services?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => Linking.openURL("tel:108") },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleSOSPress} style={styles.sosButton}>
      <Text style={styles.sosText}>SOS</Text>
    </TouchableOpacity>
  );
};

// Styles for header, tab bar, and SOS button
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
  },
  sosButton: {
    backgroundColor: "#ff3b30", // Red color for emergency
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20, // Capsule shape
    marginLeft: 16, // Move it away from the screen edge
  },
  sosText: {
    color: "#fff", // White text for contrast
    fontWeight: "bold",
    fontSize: 14,
  },
});

