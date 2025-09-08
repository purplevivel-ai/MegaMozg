// src/state/quizReducer.js
export const initialState = {
  locale: 'en',          // 'ru' | 'ro'
  op: 'add',             // add|sub|mul|div
  level: 1,              // 1|2|3
  n: 10,                 // 5..50
  sound: true,
  index: 0,              // 0..n-1
  correctCount: 0,
  ms: 0,                 // текущий таймер
};

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_OP': return { ...state, op: action.op };
    case 'SET_LEVEL': return { ...state, level: action.level };
    case 'SET_N': return { ...state, n: action.n };
    case 'SET_SOUND': return { ...state, sound: action.sound };
    case 'SET_LOCALE': return { ...state, locale: action.locale };
    case 'START_QUIZ': return { ...state, index: 0, correctCount: 0, ms: 0 };
    case 'ANSWER_OK': return { ...state, correctCount: state.correctCount + 1 };
    case 'NEXT': return { ...state, index: state.index + 1 };
    case 'SET_MS': return { ...state, ms: action.ms };
    default: return state;
  }
}
