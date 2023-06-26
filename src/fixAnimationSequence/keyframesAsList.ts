import { UnresolvedValueKeyframe } from "framer-motion";

export function keyframesAsList(
    keyframes: UnresolvedValueKeyframe | UnresolvedValueKeyframe[]
): UnresolvedValueKeyframe[] {
    return Array.isArray(keyframes) ? keyframes : [keyframes];
}
