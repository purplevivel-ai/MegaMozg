// src/screens/ResultsScreen.js
import React, { useContext, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { QuizContext } from "../../App";
import { STR } from "../i18n/strings";
import { addRecord, getRecords } from "../storage/records";

export default function ResultsScreen({ route, navigation }) {
  const { state, dispatch } = useContext(QuizContext);
  const t = STR[state.locale];
  const totalMs = route.params?.totalMs || 0;

  const percent = Math.round((state.correctCount / state.n) * 100);
  const [records, setRecords] = useState([]);

  const formatMs = (ms) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const ms2 = Math.floor((ms % 1000) / 10);
    const pad = (n, w = 2) => String(n).padStart(w, "0");
    return `${pad(m)}:${pad(sec)}.${pad(ms2)}`;
  };

  useEffect(() => {
    (async () => {
      await addRecord(state.op, state.level, state.n, totalMs);
      const top = await getRecords(state.op, state.level, state.n);
      setRecords(top);
    })();
  }, []);

  const repeat = () => { dispatch({ type:"START_QUIZ" }); navigation.replace("Quiz"); };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t.results}</Text>
      <Text style={styles.line}>{t.correctOf(state.correctCount, state.n, percent)}</Text>
      <Text style={styles.line}>{t.time}: <Text style={{fontWeight:"800"}}>{formatMs(totalMs)}</Text></Text>

      <Text style={[styles.title, {marginTop:16}]}>{t.records}</Text>
      <FlatList
        data={records}
        keyExtractor={(item, i) => String(item.ts) + "_" + i}
        renderItem={({item, index}) => (
          <View style={styles.recRow}>
            <Text style={styles.recIdx}>{index+1}.</Text>
            <Text style={styles.recMs}>{formatMs(item.ms)}</Text>
            <Text style={styles.recTs}>{new Date(item.ts).toLocaleDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{textAlign:"center", color:"#666"}}>—</Text>}
      />

      <View style={styles.row}>
        <Pressable style={[styles.btn, styles.primary]} onPress={repeat}><Text style={styles.btnTxt}>{t.repeat}</Text></Pressable>
        <Pressable style={styles.btn} onPress={()=>navigation.popToTop()}><Text style={styles.btnTxt}>{t.backHome}</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex:1, paddingTop: 60, paddingHorizontal: 16, backgroundColor:"#fff" },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  line: { fontSize: 16, textAlign:"center", marginBottom: 4 },
  row: { flexDirection:"row", justifyContent:"space-between", gap: 10, marginTop: 16 },
  btn: { flex:1, paddingVertical:14, borderRadius:12, backgroundColor:"#e5e7eb", alignItems:"center" },
  primary: { backgroundColor:"#60a5fa" },
  btnTxt: { color:"#111", fontSize:16, fontWeight:"700" },
  recRow: { flexDirection:"row", justifyContent:"space-between", paddingVertical:8, borderBottomWidth:1, borderBottomColor:"#eee" },
  recIdx: { width:24, textAlign:"left", fontWeight:"700" },
  recMs: { flex:1, textAlign:"center", fontWeight:"700" },
  recTs: { width:100, textAlign:"right", color:"#666" },
});
