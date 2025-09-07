// src/hooks/useStopwatch.js
import { useEffect, useRef, useState } from "react";

export function useStopwatch(running) {
  const [elapsed, setElapsed] = useState(0); // ms
  useEffect(() => {
    let id;
    if (running) {
      const startAt = Date.now() - elapsed;
      id = setInterval(() => setElapsed(Date.now() - startAt), 50);
    }
    return () => { if (id) clearInterval(id); };
  }, [running]);
  const reset = () => setElapsed(0);
  return { elapsed, reset };
}

export function formatMs(ms) {
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, "0");
  return `${mm}:${ss}:${cs}`;
}

