// src/storage/records.js
import AsyncStorage from "@react-native-async-storage/async-storage";
const key = (op, level, n) => `megamozg:records:${op}:${level}:${n}`;

export const addRecord = async (op, level, n, ms) => {
  try {
    const k = key(op, level, n);
    const raw = await AsyncStorage.getItem(k);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ ts: Date.now(), ms });
    arr.sort((a, b) => a.ms - b.ms);
    await AsyncStorage.setItem(k, JSON.stringify(arr.slice(0, 5)));
  } catch {}
};

export const getRecords = async (op, level, n) => {
  try {
    const raw = await AsyncStorage.getItem(key(op, level, n));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

