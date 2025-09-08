import { useEffect, useRef, useState } from "react";

export const useStopwatch = (autostart = false) => {
  const [ms, setMs] = useState(0);
  const timerRef = useRef(null);

  const start = () => {
    if (timerRef.current) return;
    const startAt = Date.now() - ms;
    timerRef.current = setInterval(() => setMs(Date.now() - startAt), 50);
  };

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const reset = () => {
    stop();
    setMs(0);
  };

  useEffect(() => {
    if (autostart) start();
    return stop;
  }, []);

  return [ms, { start, stop, reset }];
};

export const formatMs = (ms) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const ms2 = Math.floor((ms % 1000) / 10);
  const pad = (n, w = 2) => String(n).padStart(w, "0");
  return `${pad(m)}:${pad(sec)}.${pad(ms2)}`;
};
