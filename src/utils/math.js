// src/utils/math.js
export const OPS = { add: "+", sub: "−", mul: "×", div: "÷" };

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function levelRange(level) {
  if (level === 1) return [0, 9];
  if (level === 2) return [10, 99];
  return [100, 999];
}
export function generateOperands(level, op) {
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
  if (op === "sub" && level === 1 && a - b < 0) { if (b > a) [a, b] = [b, a]; }
  return { a, b };
}
export function computeAnswer(a, b, op) {
  switch (op) {
    case "add": return a + b;
    case "sub": return a - b;
    case "mul": return a * b;
    case "div": return Math.floor(a / b);
    default: return 0;
  }
}
export function nearbyOffsetsFor(n) {
  if (Math.abs(n) <= 20) return [1, -1, 2, -2, 3, -3];
  if (Math.abs(n) <= 200) return [1, -1, 2, -2, 5, -5, 10, -10];
  return [1, -1, 2, -2, 5, -5, 10, -10, 20, -20, 50, -50];
}
export function generateOptions(correct, level, op) {
  const opts = new Set([correct]);
  const pool = nearbyOffsetsFor(correct);
  const avoidNegative = (op === "add" || op === "mul");
  let attempts = 0;
  while (opts.size < 4 && attempts++ < 200) {
    const off = pool[Math.floor(Math.random() * pool.length)];
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
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
