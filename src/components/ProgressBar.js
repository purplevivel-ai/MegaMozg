// src/components/ProgressBar.js
import React from "react";
import { View, StyleSheet } from "react-native";

export default function ProgressBar({ value = 0 }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, value))}%` }]} />
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { height: 10, backgroundColor: "#e5e7eb", borderRadius: 10, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: "#60a5fa" },
});
