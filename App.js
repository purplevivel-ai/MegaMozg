import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, FlatList, StatusBar, Alert } from "react-native";

/** ---------- Helpers ---------- **/
const OPS = { add: "+", sub: "−", mul: "×", div: "÷" };

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function levelRange(level) {
  if (level === 1) return [0, 9];
  if (level === 2) return [10, 99];
  return [100, 999];
}

function generateOperands(level, op) {
  const [lo, hi] = levelRange(level);
  if (op === "div") {
    let tries = 0;
    while (tries++ < 100) {
      const result = randInt(lo, hi);
      const divisor = randInt(Math.max(lo, 1), Math.max(hi, 1));
      const a = result * divisor;
      const b = divisor;
      if (b !== 0) return { a, b };
    }
    return { a: 10, b: 2 };
  }
  let a = randInt(lo, hi);
  let b = randInt(lo, hi);
  if (op === "sub" && level === 1 && a - b < 0) {
    if (b > a) [a, b] = [b, a];
  }
  return { a, b };
}

function computeAnswer(a, b, op) {
  switch (op) {
    case "add": return a + b;
    case "sub": return a - b;
    case "mul": return a * b;
    case "div": return Math.floor(a / b);
    default: return 0;
  }
}

function nearbyOffsetsFor(n) {
  if (Math.abs(n) <= 20) return [1, -1, 2, -2, 3, -3];
  if (Math.abs(n) <= 200) return [1, -1, 2, -2, 5, -5, 10, -10];
  return [1, -1, 2, -2, 5, -5, 10, -10, 20, -20, 50, -50];
}

function generateOptions(correct, level, op) {
  const opts = new Set([correct]);
  const pool = nearbyOffsetsFor(correct);
  const avoidNegative = (op === "add" || op === "mul");
  let attempts = 0;
  while (opts.size < 4 && attempts++ < 200) {
    const off = pool[randInt(0, pool.length - 1)];
    let cand = correct + off;
    if (opts.has(cand)) continue;
    if (avoidNegative && cand < 0) continue;
    opts.add(cand);
  }
  while (opts.size < 4) {
    const cand = correct + randInt(-9, 9);
    if (!opts.has(cand) && (!avoidNegative || cand >= 0)) opts.add(cand);
  }
  const arr = Array.from(opts);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** ---------- Screens ---------- **/
function HomeScreen({ onPickOp }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mental Math Trainer</Text>
      <View style={styles.grid}>
        {[
          { key: "add", label: `Addition ${OPS.add}` },
          { key: "sub", label: `Subtraction ${OPS.sub}` },
          { key: "mul", label: `Multiplication ${OPS.mul}` },
          { key: "div", label: `Division ${OPS.div}` },
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

function DifficultyScreen({ iterations, setIterations, level, setLevel, onStart }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Choose Difficulty</Text>
      <View style={{ gap: 12, width: "100%" }}>
        <LevelCard text="Level 1 (0–9)" active={level === 1} onPress={() => setLevel(1)} />
        <LevelCard text="Level 2 (10–99)" active={level === 2} onPress={() => setLevel(2)} />
        <LevelCard text="Level 3 (100–999)" active={level === 3} onPress={() => setLevel(3)} />
      </View>
      <View style={{ marginTop: 20, width: "100%", alignItems: "center" }}>
        <Text style={styles.label}>Number of Questions: {iterations}</Text>
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
        <Text style={styles.primaryText}>Start</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function LevelCard({ text, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.levelCard, active && styles.levelActive]}>
      <Text style={[styles.levelText, active && styles.levelTextActive]}>{text}</Text>
    </TouchableOpacity>
  );
}

function QuizScreen({ op, level, iterations, onFinish, onBack }) {
  const [index, setIndex] = useState(0);
  const [lock, setLock] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const { a, b, correct, options } = useMemo(() => {
    const operands = generateOperands(level, op);
    const ans = computeAnswer(operands.a, operands.b, op);
    const opts = generateOptions(ans, level, op);
    return { a: operands.a, b: operands.b, correct: ans, options: opts };
  }, [index, op, level]);

  const progress = `${index + 1} / ${iterations}`;

  function pickOption(val) {
    if (lock) return;
    setLock(true);
    const isOk = val === correct;
    setFeedback({ value: val, state: isOk ? "ok" : "bad" });

    setTimeout(() => {
      if (!isOk) {
        setFeedback({ value: correct, state: "ok" });
        setTimeout(nextStep, 600);
      } else {
        nextStep();
      }
    }, isOk ? 600 : 600);
  }

  function nextStep() {
    if (feedback?.state === "ok" && feedback?.value === correct) {
      setCorrectCount(c => c + 1);
    }
    if (index + 1 >= iterations) {
      onFinish({ total: iterations, correct: correctCount + (feedback?.value === correct ? 1 : 0) });
      return;
    }
    setFeedback(null);
    setLock(false);
    setIndex(i => i + 1);
  }

  function confirmExit() {
    Alert.alert("Quit?", "Progress will be lost.", [
      { text: "Cancel", style: "cancel" },
      { text: "Quit", style: "destructive", onPress: onBack },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.progress}>Question {progress}</Text>
        <TouchableOpacity onPress={confirmExit}><Text style={styles.backLink}>Back</Text></TouchableOpacity>
      </View>
      <Text style={styles.problemText}>
        {a} {OPS[op]} {b} = ?
      </Text>
      <FlatList
        data={options}
        keyExtractor={(item, i) => `${item}-${i}`}
        renderItem={({ item }) => {
          let btnStyle = styles.optionBtn;
          if (feedback && feedback.value === item) {
            btnStyle = [styles.optionBtn, feedback.state === "ok" ? styles.ok : styles.bad];
          } else if (feedback && feedback.state === "ok" && item === correct) {
            btnStyle = [styles.optionBtn, styles.ok];
          }
          return (
            <TouchableOpacity style={btnStyle} onPress={() => pickOption(item)} disabled={lock}>
              <Text style={styles.optionText}>{String(item)}</Text>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ width: "100%" }}
      />
    </SafeAreaView>
  );
}

function ResultsScreen({ result, onRepeat, onHome }) {
  const percent = Math.round((result.correct / result.total) * 100);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Results</Text>
      <Text style={styles.resultText}>Correct: {result.correct} of {result.total} ({percent}%)</Text>
      <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16 }]} onPress={onRepeat}>
        <Text style={styles.primaryText}>Repeat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={onHome}>
        <Text style={styles.secondaryText}>Back to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/** ---------- App Shell ---------- **/
export default function App() {
  const [screen, setScreen] = useState("home");
  const [op, setOp] = useState("add");
  const [level, setLevel] = useState(1);
  const [iterations, setIterations] = useState(10);
  const [lastResult, setLastResult] = useState({ total: 10, correct: 0 });

  const startQuiz = () => setScreen("quiz");
  const finishQuiz = (res) => { setLastResult(res); setScreen("results"); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b1020" }}>
      {screen === "home" && (
        <HomeScreen onPickOp={(k) => { setOp(k); setScreen("diff"); }} />
      )}
      {screen === "diff" && (
        <DifficultyScreen
          iterations={iterations}
          setIterations={setIterations}
          level={level}
          setLevel={setLevel}
          onStart={startQuiz}
        />
      )}
      {screen === "quiz" && (
        <QuizScreen
          op={op}
          level={level}
          iterations={iterations}
          onFinish={finishQuiz}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "results" && (
        <ResultsScreen
          result={lastResult}
          onRepeat={() => setScreen("quiz")}
          onHome={() => setScreen("home")}
        />
      )}
      <StatusBar barStyle="light-content" />
    </SafeAreaView>
  );
}

/** ---------- Styles ---------- **/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1020", alignItems: "center", padding: 20, gap: 16 },
  title: { fontSize: 28, color: "#eaf2ff", fontWeight: "800", marginTop: 12, marginBottom: 12, textAlign: "center" },
  grid: { width: "100%", flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 8 },
  opBtn: { backgroundColor: "#1d2545", paddingVertical: 18, paddingHorizontal: 14, borderRadius: 18, minWidth: "45%", alignItems: "center", borderWidth: 1, borderColor: "#2c3c7a" },
  opText: { color: "#d7e5ff", fontSize: 16, fontWeight: "700", textAlign: "center" },
  levelCard: { backgroundColor: "#121a35", padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "#243163" },
  levelActive: { backgroundColor: "#1a2350", borderColor: "#3b4db5" },
  levelText: { color: "#c7d7ff", fontSize: 16, fontWeight: "700" },
  levelTextActive: { color: "#ffffff" },
  label: { color: "#c7d7ff", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  row: { flexDirection: "row", gap: 12, marginTop: 6 },
  step: { backgroundColor: "#1d2545", width: 64, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: "#2c3c7a" },
  stepText: { color: "#eaf2ff", fontSize: 22, fontWeight: "800" },
  primaryBtn: { backgroundColor: "#2d6bff", paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14 },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  secondaryBtn: { backgroundColor: "transparent", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: "#3a4aa0" },
  secondaryText: { color: "#c7d7ff", fontSize: 16, fontWeight: "700" },
  topRow: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progress: { color: "#c7d7ff", fontSize: 14, fontWeight: "700" },
  backLink: { color: "#8fb0ff", fontSize: 14, fontWeight: "700" },
  problemText: { color: "#fff", fontSize: 40, fontWeight: "900", marginVertical: 20, textAlign: "center" },
  optionBtn: { backgroundColor: "#121a35", paddingVertical: 16, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: "#243163", alignItems: "center" },
  optionText: { color: "#eaf2ff", fontSize: 22, fontWeight: "800" },
  ok: { backgroundColor: "#164d2c", borderColor: "#2a9153" },
  bad: { backgroundColor: "#4d1621", borderColor: "#a2384b" },
  resultText: { color: "#eaf2ff", fontSize: 18, fontWeight: "800", textAlign: "center", marginBottom: 8 },
});

