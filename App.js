import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";

import { STR } from "./src/i18n/strings";
import { OPS, generateOperands, computeAnswer, generateOptions } from "./src/utils/math";
import { useStopwatch, formatMs } from "./src/hooks/useStopwatch";
import { addRecord } from "./src/storage/records";

export default function App() {
  const [lang, setLang] = useState("ru");
  const [operands, setOperands] = useState(generateOperands());
  const [options, setOptions] = useState(generateOptions(operands));
  const [ms, { start, stop, reset }] = useStopwatch(false);
  const [message, setMessage] = useState("");

  const strings = useMemo(() => STR[lang] ?? STR.ru, [lang]);

  useEffect(() => {
    // новый пример — сбрасываем сообщение
    setMessage("");
  }, [operands]);

  const nextQuestion = () => {
    const next = generateOperands();
    setOperands(next);
    setOptions(generateOptions(next));
  };

  const onStart = () => {
    reset();
    setMessage("");
    start();
  };

  const onAnswer = async (val) => {
    const correct = computeAnswer(operands);
    if (val === correct) {
      stop();
      await addRecord(ms);
      setMessage(strings.correct);
      // новый раунд
      nextQuestion();
      reset();
    } else {
      setMessage(strings.wrong);
    }
  };

  const toggleLang = () => setLang((p) => (p === "ru" ? "en" : "ru"));

  const renderItem = ({ item }) => (
    <Pressable style={styles.answerBtn} onPress={() => onAnswer(item)}>
      <Text style={styles.answerText}>{String(item)}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{strings.appName}</Text>
        <Pressable style={styles.langBtn} onPress={toggleLang}>
          <Text style={styles.langText}>{strings.chooseLang}: {lang.toUpperCase()}</Text>
        </Pressable>
      </View>

      <Text style={styles.task}>
        {operands.a} {operands.op} {operands.b} = ?
      </Text>

      <Text style={styles.timerLabel}>{strings.timer}: <Text style={styles.timer}>{formatMs(ms)}</Text></Text>

      <View style={styles.controls}>
        <Pressable style={[styles.ctrlBtn, styles.primary]} onPress={onStart}>
          <Text style={styles.ctrlText}>{strings.start}</Text>
        </Pressable>
        <Pressable style={styles.ctrlBtn} onPress={reset}>
          <Text style={styles.ctrlText}>{strings.reset}</Text>
        </Pressable>
      </View>

      {!!message && <Text style={styles.message}>{message}</Text>}

      <FlatList
        data={options}
        keyExtractor={(x, i) => String(x) + "_" + i}
        numColumns={2}              // ✅ 2 колонки
        columnWrapperStyle={styles.row}
        renderItem={renderItem}
        contentContainerStyle={styles.answers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16, backgroundColor: "#fff" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "700" },
  langBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#eee" },
  langText: { fontSize: 14 },
  task: { fontSize: 36, fontWeight: "600", textAlign: "center", marginVertical: 20 },
  timerLabel: { fontSize: 16, textAlign: "center" },
  timer: { fontWeight: "700" },
  controls: { flexDirection: "row", justifyContent: "center", gap: 12, marginVertical: 16 },
  ctrlBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: "#eee" },
  primary: { backgroundColor: "#dbeafe" },
  ctrlText: { fontSize: 16, fontWeight: "600" },
  message: { textAlign: "center", marginBottom: 8 },
  answers: { paddingTop: 12 },
  row: { justifyContent: "space-between" },
  answerBtn: { flex: 1, paddingVertical: 18, marginBottom: 12, marginHorizontal: 6, borderRadius: 14, backgroundColor: "#f3f4f6", alignItems: "center" },
  answerText: { fontSize: 20, fontWeight: "600" },
});
