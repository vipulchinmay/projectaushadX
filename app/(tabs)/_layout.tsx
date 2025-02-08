import { Tabs } from "expo-router";
import React, { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, Text, Linking, View, Alert } from "react-native";

export default function TabLayout() {
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const screenOptions = useMemo(() => ({
    tabBarActiveTintColor: "#f84040",
    tabBarInactiveTintColor: "#bbb",
    tabBarStyle: darkMode ? styles.darkTabBar : styles.lightTabBar,
    tabBarLabelStyle: styles.tabBarLabel,
    headerStyle: darkMode ? styles.darkHeader : styles.lightHeader,
    headerShadowVisible: false,
    headerTintColor: darkMode ? "#fff" : "#f56e7d",
    headerLeft: () => <SOSButton />,
    headerRight: () => <ThemeToggleButton darkMode={darkMode} toggleTheme={toggleTheme} />,
  }), [darkMode]);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "AushadX",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "home-sharp" : "home-outline"} color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "person-circle" : "person-circle-outline"} color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="DoctorConsult"
        options={{
          headerTitle: "Doctor Consult",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "medkit" : "medkit-outline"} color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="Schedule"
        options={{
          headerTitle: "Schedule Medication",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen name="not-found" options={{ headerShown: false }} />
    </Tabs>
  );
}

// 🆘 SOS Button Component
const SOSButton = () => {
  const handleSOSPress = () => {
    Alert.alert("Emergency Call", "Do you want to call 108 for emergency services?", [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => Linking.openURL("tel:108") },
    ]);
  };

  return (
    <TouchableOpacity onPress={handleSOSPress} style={styles.sosButton}>
      <Text style={styles.sosText}>SOS</Text>
    </TouchableOpacity>
  );
};

// 🌙 Theme Toggle Button Component
const ThemeToggleButton = ({ darkMode, toggleTheme }) => {
  return (
    <TouchableOpacity onPress={toggleTheme} style={[styles.toggleButton, darkMode ? styles.darkToggle : styles.lightToggle]}>
      <Text style={[styles.toggleText, darkMode ? { color: "#fff" } : { color: "#25292e" }]}>
        {darkMode ? "☀️" : "🌙"}
      </Text>
    </TouchableOpacity>
  );
};

// Styles
const styles = StyleSheet.create({
  lightHeader: {
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  darkHeader: {
    backgroundColor: "#25292e",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  lightTabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  darkTabBar: {
    backgroundColor: "#25292e",
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  sosButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginLeft: 16,
  },
  sosText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 16,
    alignItems: "center",
  },
  darkToggle: {
    backgroundColor: "#444",
  },
  lightToggle: {
    backgroundColor: "#ddd",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
