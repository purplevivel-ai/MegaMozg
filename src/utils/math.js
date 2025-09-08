export const OPS = ["+", "-"];

export const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const generateOperands = () => {
  const a = getRandomInt(1, 20);
  const b = getRandomInt(1, 20);
  const op = OPS[getRandomInt(0, OPS.length - 1)];
  return { a, b, op };
};

export const computeAnswer = ({ a, b, op }) => (op === "+" ? a + b : a - b);

export const generateOptions = (operands, count = 4) => {
  const answer = computeAnswer(operands);
  const set = new Set([answer]);
  while (set.size < count) {
    set.add(answer + getRandomInt(-5, 5));
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
};
