import { Box, Point } from "./matchLayoutManager";
import { OnComplete } from "../fixAnimationSequence/common-motion-types";
import { DomSegmentOptionalElementOrSelectorWithOptions } from "../FlipCard/FlipCard";

export function getDiscardToBoxSegment(
  boxPosition: Box,
  duration: number,
  delay?: number,
  at?: number,
  onComplete?: OnComplete | undefined
): DomSegmentOptionalElementOrSelectorWithOptions {
  return getMoveRotateSegment(
    boxPosition.isHorizontal,
    boxPosition.position,
    duration,
    delay,
    at,
    onComplete
  );
}

export function getMoveRotateSegment(
  isHorizontal: boolean,
  position: Point,
  duration: number,
  delay?: number,
  at?: number,
  onComplete?: OnComplete | undefined
): DomSegmentOptionalElementOrSelectorWithOptions {
  const rotation = isHorizontal ? 90 : 0;
  return [
    undefined,
    {
      x: position.x,
      y: position.y,
      rotate: `${rotation}deg`,
    },
    {
      duration: duration,
      delay,
      at,
      x: { onComplete }, // so only get the one notification
    },
  ];
}
