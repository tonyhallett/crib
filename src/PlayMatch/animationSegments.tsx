import { Box, Point } from "./matchLayoutManager";
import { DomSegmentOptionalElementOrSelectorWithOptions } from "../FlipCard/Card";

export function getDiscardToBoxSegment(
  boxPosition: Box,
  duration: number,
  delay?: number,
  at?: number
): DomSegmentOptionalElementOrSelectorWithOptions {
  return getMoveRotateSegment(
    boxPosition.isHorizontal,
    boxPosition.position,
    duration,
    delay,
    at
  );
}

export function getMoveRotateSegment(
  isHorizontal: boolean,
  position: Point,
  duration: number,
  delay?: number,
  at?: number
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
    },
  ];
}
