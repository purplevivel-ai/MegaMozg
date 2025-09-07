// src/storage/records.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const RECORDS_KEY = "MMT_RECORDS_V1";
// entry: { correct, total, durationMs, ts }

export function modeKey(op, level) {
  return `${op}_L${level}`;
}
function sortEntries(a, b) {
  if (b.correct !== a.correct) return b.correct - a.correct;
  return a.durationMs - b.durationMs; // быстрее — лучше
}

export async function loadRecords() {
  try {
    const s = await AsyncStorage.getItem(RECORDS_KEY);
    return s ? JSON.parse(s) : {};
  } catch { return {}; }
}
export async function saveRecords(obj) {
  try { await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(obj)); } catch {}
}

export async function addRecord(op, level, correct, total, durationMs) {
  const key = modeKey(op, level);
  const obj = await loadRecords();
  const arr = Array.isArray(obj[key]) ? obj[key] : [];
  arr.push({ correct, total, durationMs, ts: Date.now() });
  arr.sort(sortEntries);
  obj[key] = arr.slice(0, 5);
  await saveRecords(obj);
  return obj[key];
}
