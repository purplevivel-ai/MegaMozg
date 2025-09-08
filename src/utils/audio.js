export const HAS_SOUNDS = true;

export const getAsset = (type) =>
  type === "ok"
    ? require("../../assets/sounds/ding.wav")
    : require("../../assets/sounds/buzz.wav");
