// src/screens/HomeScreen.js
import React, { useContext } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { QuizContext } from "../../App";
import { LOCALES, STR } from "../i18n/strings";

export default function HomeScreen({ navigation }) {
  const { state, dispatch } = useContext(QuizContext);
  const t = STR[state.locale];

  const go = (op) => { dispatch({ type: "SET_OP", op }); navigation.navigate("Difficulty"); };
  const cycleLocale = () => {
    const idx = LOCALES.indexOf(state.locale);
    dispatch({ type: "SET_LOCALE", locale: LOCALES[(idx + 1) % LOCALES.length] });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Text style={styles.title}>{t.appTitle}</Text>
        <Pressable style={styles.lang} onPress={cycleLocale}>
          <Text>{t.language}: {state.locale.toUpperCase()}</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        <Pressable style={[styles.op, { backgroundColor: "#dbeafe" }]} onPress={() => go("add")}><Text style={styles.opTxt}>➕ {t.addition}</Text></Pressable>
        <Pressable style={[styles.op, { backgroundColor: "#fde68a" }]} onPress={() => go("sub")}><Text style={styles.opTxt}>➖ {t.subtraction}</Text></Pressable>
        <Pressable style={[styles.op, { backgroundColor: "#bbf7d0" }]} onPress={() => go("mul")}><Text style={styles.opTxt}>✖️ {t.multiplication}</Text></Pressable>
        <Pressable style={[styles.op, { backgroundColor: "#fecaca" }]} onPress={() => go("div")}><Text style={styles.opTxt}>➗ {t.division}</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 60, paddingHorizontal: 16, backgroundColor: "#fff" },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "800" },
  lang: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#eee" },
  grid: { marginTop: 20, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  op: { width: "48%", paddingVertical: 26, marginBottom: 12, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  opTxt: { fontSize: 18, fontWeight: "700" },
});
