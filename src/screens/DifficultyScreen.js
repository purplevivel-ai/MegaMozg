// src/screens/DifficultyScreen.js
import React, { useContext } from "react";
import { View, Text, Pressable, StyleSheet, Switch } from "react-native";
import { QuizContext } from "../../App";
import { STR } from "../i18n/strings";

export default function DifficultyScreen({ navigation }) {
  const { state, dispatch } = useContext(QuizContext);
  const t = STR[state.locale];

  const setLevel = (level) => dispatch({ type: "SET_LEVEL", level });
  const incN = () => dispatch({ type: "SET_N", n: Math.min(50, state.n + 5) });
  const decN = () => dispatch({ type: "SET_N", n: Math.max(5, state.n - 5) });

  const start = () => { dispatch({ type: "START_QUIZ" }); navigation.navigate("Quiz"); };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t.chooseDifficulty}</Text>

      <View style={styles.levels}>
        <Pressable style={[styles.level, state.level===1 && styles.sel]} onPress={() => setLevel(1)}><Text style={styles.levelTxt}>{t.level1}</Text></Pressable>
        <Pressable style={[styles.level, state.level===2 && styles.sel]} onPress={() => setLevel(2)}><Text style={styles.levelTxt}>{t.level2}</Text></Pressable>
        <Pressable style={[styles.level, state.level===3 && styles.sel]} onPress={() => setLevel(3)}><Text style={styles.levelTxt}>{t.level3}</Text></Pressable>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t.numQuestions}: {state.n}</Text>
        <View style={styles.stepper}>
          <Pressable style={styles.stepBtn} onPress={decN}><Text style={styles.stepTxt}>−5</Text></Pressable>
          <Pressable style={styles.stepBtn} onPress={incN}><Text style={styles.stepTxt}>+5</Text></Pressable>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t.sound}</Text>
        <Switch value={state.sound} onValueChange={(v)=>dispatch({type:"SET_SOUND", sound:v})}/>
      </View>

      <Pressable style={styles.start} onPress={start}><Text style={styles.startTxt}>{t.start}</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 60, paddingHorizontal: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 16 },
  levels: { gap: 10, marginBottom: 20 },
  level: { paddingVertical: 18, borderRadius: 16, backgroundColor: "#f3f4f6", alignItems: "center" },
  sel: { backgroundColor: "#dbeafe" },
  levelTxt: { fontSize: 18, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  label: { fontSize: 16, fontWeight: "600" },
  stepper: { flexDirection: "row", gap: 8 },
  stepBtn: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor:"#eee", borderRadius: 10 },
  stepTxt: { fontSize: 16, fontWeight: "700" },
  start: { marginTop: 12, paddingVertical: 16, borderRadius: 14, backgroundColor: "#60a5fa", alignItems: "center" },
  startTxt: { color:"#fff", fontSize: 18, fontWeight:"800" },
});
