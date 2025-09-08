// src/utils/math.js
export const OPS = { add: '+', sub: '-', mul: '×', div: '÷' };

export const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const rangeForLevel = (level) => {
  if (level === 1) return [0, 9];
  if (level === 2) return [10, 99];
  return [100, 999];
};

export const generateOperands = (level, opKey) => {
  const [min, max] = rangeForLevel(level);
  if (opKey === 'div') {
    const b = getRandomInt(Math.max(1, min), Math.max(1, max));
    const q = getRandomInt(1, Math.max(2, Math.floor(max / b)));
    const a = b * q;            // гарантировано целое деление
    return { a, b, op: 'div' };
  }
  const a = getRandomInt(min, max);
  const b = getRandomInt(min, max);
  return { a, b, op: opKey };
};

export const computeAnswer = ({ a, b, op }) => {
  if (op === 'add') return a + b;
  if (op === 'sub') return a - b;
  if (op === 'mul') return a * b;
  if (op === 'div') return Math.floor(a / b);
  return 0;
};

export const generateOptions = (correct, level, op) => {
  const mag = Math.max(1, Math.floor(Math.log10(Math.abs(correct) || 1)));
  const base = mag <= 1 ? [1,2,3] : mag === 2 ? [2,3,5,10] : [3,5,10,20];
  const deltas = [...new Set(base.concat(base.map(n => -n)))];
  const set = new Set([correct]);
  let guard = 0;
  while (set.size < 4 && guard++ < 200) {
    const d = deltas[getRandomInt(0, deltas.length - 1)];
    const cand = correct + d;
    const positiveOk = op !== 'sub' ? cand >= 0 : true;
    if (cand !== correct && positiveOk) set.add(cand);
  }
  const arr = Array.from(set);
  while (arr.length < 4) arr.push(correct + getRandomInt(1, 9));
  return arr.sort(() => Math.random() - 0.5);
};

