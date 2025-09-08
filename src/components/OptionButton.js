// src/components/OptionButton.js
import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export default function OptionButton({ label, status = "neutral", onPress }) {
  const bg =
    status === "correct" ? "#bbf7d0" : status === "wrong" ? "#fecaca" : "#f3f4f6";
  return (
    <Pressable onPress={onPress} style={[styles.btn, { backgroundColor: bg }]}>
      <Text style={styles.txt}>{String(label)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    paddingVertical: 22,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    marginVertical: 6,
  },
  txt: { fontSize: 22, fontWeight: "700" },
});
