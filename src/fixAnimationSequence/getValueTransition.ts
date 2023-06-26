/* eslint-disable @typescript-eslint/no-explicit-any */
import { SegmentAnimationOptionsWithTransitionEnd, SegmentTransitionWithTransitionEnd } from "./createAnimationsFromSegments";

export function getValueTransition(
    transition: SegmentAnimationOptionsWithTransitionEnd,
    key: string
): SegmentTransitionWithTransitionEnd {
    return (transition as any)[key]
        ? { ...transition, ...(transition as any)[key] }
        : { ...transition };
}
