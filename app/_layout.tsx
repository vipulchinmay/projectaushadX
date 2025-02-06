import { Stack } from "expo-router";
import React from "react";
import { LogBox } from "react-native";
LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  return <Stack >
    <Stack.Screen name="(tabs)" options={{headerShown: false,}} />
    <Stack.Screen name="not-found" options={{headerShown:false}}/>
    </Stack>;
}
