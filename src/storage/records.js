import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "megamozg:records";

export const addRecord = async (ms) => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ ts: Date.now(), ms });
    arr.sort((a, b) => a.ms - b.ms);
    await AsyncStorage.setItem(KEY, JSON.stringify(arr.slice(0, 20)));
  } catch (e) {
    // noop
  }
};

export const getRecords = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
