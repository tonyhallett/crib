import { UnresolvedValueKeyframe } from "framer-motion";

const isNumber = (keyframe: unknown) => typeof keyframe === "number";
export function isNumberKeyframesArray(
  keyframes: UnresolvedValueKeyframe[]
): keyframes is number[] {
  return keyframes.every(isNumber);
}
