import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Alert,
  Vibration,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Вынесенные модули
import { STR } from "./src/i18n/strings";
import { OPS, generateOperands, computeAnswer, generateOptions } from "./src/utils/math";
import { useStopwatch, formatMs } from "./src/hooks/useStopwatch";
import { addRecord } from "./src/storage/records";

/* -------------------- UI helpers -------------------- */
function LevelCard({ text, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.levelCard, active && styles.levelActive]}>
      <Text style={[styles.levelText, active && styles.levelTextActive]}>{text}</Text>
    </TouchableOpacity>
  );
}

/* -------------------- Screens -------------------- */
function HomeScreen({ onPickOp, lang, setLang }) {
  const S = STR[lang];
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{S.title}</Text>

      {/* Переключатель языка */}
      <View style={styles.langRow}>
        <Text style={styles.langLabel}>{S.lang}:</Text>
        <View style={styles.langToggle}>
          <TouchableOpacity
            style={[styles.langBtn, lang === "ru" && styles.langBtnActive]}
            onPress={() => setLang("ru")}
          >
            <Text style={[styles.langBtnText, lang === "ru" && styles.langBtnTextActive]}>RU</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, lang === "en" && styles.langBtnActive]}
            onPress={() => setLang("en")}
          >
            <Text style={[styles.langBtnText, lang === "en" && styles.langBtnTextActive]}>EN</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Выбор операции */}
      <View style={styles.grid}>
        {[
          { key: "add", label: `${S.addition} ${OPS.add}` },
          { key: "sub", label: `${S.subtraction} ${OPS.sub}` },
          { key: "mul", label: `${S.multiplication} ${OPS.mul}` },
          { key: "div", label: `${S.division} ${OPS.div}` },
        ].map(item => (
          <TouchableOpacity key={item.key} style={styles.opBtn} onPress={() => onPickOp(item.key)}>
            <Text style={styles.opText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <StatusBar barStyle="light-content" />
    </SafeAreaView>
  );
}

function DifficultyScreen({ iterations, setIterations, level, setLevel, onStart, lang }) {
  const S = STR[lang];
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{S.chooseDifficulty}</Text>

      <View style={{ gap: 12, width: "100%" }}>
        <LevelCard text={S.level1} active={level === 1} onPress={() => setLevel(1)} />
        <LevelCard text={S.level2} active={level === 2} onPress={() => setLevel(2)} />
        <LevelCard text={S.level3} active={level === 3} onPress={() => setLevel(3)} />
      </View>

      <View style={{ marginTop: 20, width: "100%", alignItems: "center" }}>
        <Text style={styles.label}>{S.questions}: {iterations}</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.step} onPress={() => setIterations(Math.max(5, iterations - 1))}>
            <Text style={styles.stepText}>–</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.step} onPress={() => setIterations(Math.min(50, iterations + 1))}>
            <Text style={styles.stepText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={[styles.primaryBtn, { marginTop: 30 }]} onPress={onStart}>
        <Text style={styles.primaryText}>{S.start}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function QuizScreen({ op, level, iterations, onFinish, onBack, lang }) {
  const S = STR[lang];
  const [index, setIndex] = useState(0);
  const [lock, setLock] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [running, setRunning] = useState(true);
  const { elapsed, reset } = useStopwatch(running);

  const { a, b, correct, options } = useMemo(() => {
    const operands = generateOperands(level, op);
    const ans = computeAnswer(operands.a, operands.b, op);
    const opts = generateOptions(ans, level, op);
    return { a: operands.a, b: operands.b, correct: ans, options: opts };
  }, [index, op, level]);

  useEffect(() => { setRunning(true); reset(); }, []); // старт таймера

  function advance(isOk) {
    const nextCorrect = correctCount + (isOk ? 1 : 0);
    const isLast = index + 1 >= iterations;

    if (isLast) {
      setRunning(false);
      onFinish({ total: iterations, correct: nextCorrect, durationMs: elapsed });
      return;
    }
    setCorrectCount(nextCorrect);
    setIndex(i => i + 1);
    setFeedback(null);
    setLock(false);
  }

  function pickOption(val) {
    if (lock) return;
    setLock(true);
    const isOk = val === correct;
    setFeedback({ value: val, state: isOk ? "ok" : "bad" });

    if (!isOk) Vibration.vibrate(70); // короткая вибра при ошибке

    if (isOk) {
      setTimeout(() => advance(true), 600);
    } else {
      setTimeout(() => {
        setFeedback({ value: correct, state: "ok" });
        setTimeout(() => advance(false), 600);
      }, 600);
    }
  }

  function confirmExit() {
    Alert.alert(S.quitTitle, S.quitMsg, [
      { text: "Cancel", style: "cancel" },
      { text: "OK", style: "destructive", onPress: onBack },
    ]);
  }

  // Ровная сетка 2×2 — без flexWrap/gap
  const rows = [];
  for (let i = 0; i < options.length; i += 2) rows.push(options.slice(i, i + 2));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.progress}>
          {lang === "ru" ? `Задание ${index + 1} из ${iterations}` : `Question ${index + 1} of ${iterations}`}
        </Text>
        <Text style={styles.timerText}>{formatMs(elapsed)}</Text>
        <TouchableOpacity onPress={confirmExit}><Text style={styles.backLink}>{S.back}</Text></TouchableOpacity>
      </View>

      <Text style={styles.problemText}>
        {a} {OPS[op]} {b} = ?
      </Text>

      <View style={styles.optionsWrap}>
        {rows.map((row, rIdx) => (
          <View key={rIdx} style={styles.optionRow}>
            {row.map((item, cIdx) => {
              let btnStyle = [styles.optionBtn2col, cIdx === 0 && styles.optionLeft];
              if (feedback && feedback.value === item) {
                btnStyle.push(feedback.state === "ok" ? styles.ok : styles.bad);
              } else if (feedback && feedback.state === "ok" && item === correct) {
                btnStyle.push(styles.ok);
              }
              return (
                <TouchableOpacity
                  key={`${item}-${cIdx}`}
                  style={btnStyle}
                  onPress={() => pickOption(item)}
                  disabled={lock}
                >
                  <Text style={styles.optionText}>{String(item)}</Text>
                </TouchableOpacity>
              );
            })}
            {row.length === 1 && <View style={[styles.optionBtn2col, styles.optionRightPlaceholder]} />}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

function ResultsScreen({ result, onRepeat, onHome, op, level, lang }) {
  const S = STR[lang];
  const percent = Math.round((result.correct / result.total) * 100);
  const [top5, setTop5] = useState([]);

  useEffect(() => {
    (async () => {
      const updated = await addRecord(op, level, result.correct, result.total, result.durationMs ?? 0);
      setTop5(updated);
    })();
  }, [result]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{S.results}</Text>
      <Text style={styles.resultText}>{S.correctOf(result.correct, result.total, percent)}</Text>
      <Text style={styles.timeText}>{S.time}: {formatMs(result.durationMs ?? 0)}</Text>

      <View style={styles.recordsBox}>
        <Text style={styles.recordsTitle}>{S.records}</Text>
        {top5.length === 0 ? (
          <Text style={styles.recordsEmpty}>—</Text>
        ) : (
          top5.map((r, idx) => (
            <Text key={idx} style={styles.recordsItem}>
              {idx + 1}. {r.correct}/{r.total} • {formatMs(r.durationMs)}
            </Text>
          ))
        )}
      </View>

      <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16 }]} onPress={onRepeat}>
        <Text style={styles.primaryText}>{S.repeat}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={onHome}>
        <Text style={styles.secondaryText}>{S.home}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* -------------------- App Root -------------------- */
export default function App() {
  const [screen, setScreen] = useState("home");
  const [op, setOp] = useState("add");
  const [level, setLevel] = useState(1);
  const [iterations, setIterations] = useState(10);
  const [lastResult, setLastResult] = useState({ total: 10, correct: 0, durationMs: 0 });
  const [lang, setLang] = useState("ru");

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("MMT_LANG");
      if (saved) setLang(saved);
    })();
  }, []);
  useEffect(() => { AsyncStorage.setItem("MMT_LANG", lang).catch(()=>{}); }, [lang]);

  const startQuiz = () => setScreen("quiz");
  const finishQuiz = (res) => { setLastResult(res); setScreen("results"); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b1020" }}>
      {screen === "home" && (
        <HomeScreen
          onPickOp={(k) => { setOp(k); setScreen("diff"); }}
          lang={lang}
          setLang={setLang}
        />
      )}
      {screen === "diff" && (
        <DifficultyScreen
          iterations={iterations}
          setIterations={setIterations}
          level={level}
          setLevel={setLevel}
          onStart={startQuiz}
          lang={lang}
        />
      )}
      {screen === "quiz" && (
        <QuizScreen
          op={op}
          level={level}
          iterations={iterations}
          onFinish={finishQuiz}
          onBack={() => setScreen("home")}
          lang={lang}
        />
      )}
      {screen === "results" && (
        <ResultsScreen
          result={lastResult}
          onRepeat={() => setScreen("quiz")}
          onHome={() => setScreen("home")}
          op={op}
          level={level}
          lang={lang}
        />
      )}
      <StatusBar barStyle="light-content" />
    </SafeAreaView>
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1020", alignItems: "center", padding: 20, gap: 16 },
  title: { fontSize: 28, color: "#eaf2ff", fontWeight: "800", marginTop: 12, marginBottom: 12, textAlign: "center" },

  grid: { width: "100%", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 8 },
  opBtn: { backgroundColor: "#1d2545", paddingVertical: 20, paddingHorizontal: 16, borderRadius: 18, minWidth: "45%", alignItems: "center", borderWidth: 1, borderColor: "#2c3c7a" },
  opText: { color: "#d7e5ff", fontSize: 18, fontWeight: "800", textAlign: "center" },

  levelCard: { backgroundColor: "#121a35", padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "#243163" },
  levelActive: { backgroundColor: "#1a2350", borderColor: "#3b4db5" },
  levelText: { color: "#c7d7ff", fontSize: 16, fontWeight: "700" },
  levelTextActive: { color: "#ffffff" },

  label: { color: "#c7d7ff", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  row: { flexDirection: "row", gap: 12, marginTop: 6 },
  step: { backgroundColor: "#1d2545", width: 72, height: 56, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: "#2c3c7a" },
  stepText: { color: "#eaf2ff", fontSize: 24, fontWeight: "900" },

  primaryBtn: { backgroundColor: "#2d6bff", paddingVertical: 16, paddingHorizontal: 22, borderRadius: 16 },
  primaryText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  secondaryBtn: { backgroundColor: "transparent", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: "#3a4aa0" },
  secondaryText: { color: "#c7d7ff", fontSize: 16, fontWeight: "700" },

  topRow: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progress: { color: "#c7d7ff", fontSize: 16, fontWeight: "800" },
  backLink: { color: "#8fb0ff", fontSize: 16, fontWeight: "800" },
  timerText: { color: "#eaf2ff", fontSize: 16, fontWeight: "900" },

  problemText: { color: "#fff", fontSize: 44, fontWeight: "900", marginVertical: 18, textAlign: "center" },

  // надёжная сетка 2×2
  optionsWrap: { width: "100%" },
  optionRow: { width: "100%", flexDirection: "row", marginBottom: 12 },
  optionLeft: { marginRight: 12 },
  optionRightPlaceholder: { backgroundColor: "transparent", borderColor: "transparent" },
  optionBtn2col: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#243163",
    backgroundColor: "#121a35",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 86,
  },
  optionText: { color: "#eaf2ff", fontSize: 26, fontWeight: "900" },

  ok: { backgroundColor: "#164d2c", borderColor: "#2a9153" },
  bad: { backgroundColor: "#4d1621", borderColor: "#a2384b" },

  resultText: { color: "#eaf2ff", fontSize: 18, fontWeight: "800", textAlign: "center", marginBottom: 6 },
  timeText: { color: "#c7d7ff", fontSize: 16, fontWeight: "800", textAlign: "center", marginBottom: 10 },

  recordsBox: { width: "100%", backgroundColor: "#121a35", borderRadius: 12, borderWidth: 1, borderColor: "#243163", padding: 12, marginTop: 6 },
  recordsTitle: { color: "#eaf2ff", fontSize: 16, fontWeight: "900", marginBottom: 6 },
  recordsItem: { color: "#c7d7ff", fontSize: 14, fontWeight: "700", marginBottom: 4 },
  recordsEmpty: { color: "#3a4aa0", fontSize: 14, fontWeight: "700" },

  // язык
  langRow: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  langLabel: { color: "#c7d7ff", fontSize: 14, fontWeight: "700" },
  langToggle: { flexDirection: "row" },
  langBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: "#3a4aa0", marginLeft: 8 },
  langBtnActive: { backgroundColor: "#1a2350", borderColor: "#3b4db5" },
  langBtnText: { color: "#c7d7ff", fontSize: 14, fontWeight: "800" },
  langBtnTextActive: { color: "#fff" },
});
