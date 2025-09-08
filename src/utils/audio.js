// src/utils/audio.js
export const HAS_SOUNDS = false; // включим, когда добавим файлы
export const dingAsset = HAS_SOUNDS ? require("../../assets/sounds/ding.wav") : null;
export const buzzAsset = HAS_SOUNDS ? require("../../assets/sounds/buzz.wav") : null;
