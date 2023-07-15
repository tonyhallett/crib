import { DOMKeyframesDefinition } from "framer-motion";
import { SegmentAnimationOptionsWithTransitionEndAndAt } from "../fixAnimationSequence/createAnimationsFromSegments";
import { DomSegmentOptionalElementOrSelectorWithOptions } from "../FlipCard/FlipCard";

export type ZIndexAnimationOptions = Omit<
  SegmentAnimationOptionsWithTransitionEndAndAt,
  "duration"
>;
export function createZIndexAnimationSegment(
  zIndex: number,
  options: ZIndexAnimationOptions
): DomSegmentOptionalElementOrSelectorWithOptions {
  return [
    undefined,
    {
      zIndex,
    } as DOMKeyframesDefinition,
    {
      ...options,
      duration: 0.00001,
    },
  ];
}
