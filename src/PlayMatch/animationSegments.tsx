import { Box, Point } from "./matchLayoutManager";
import { OnComplete } from "../fixAnimationSequence/common-motion-types";
import {
  DomSegmentOptionalElementOrSelectorWithOptions,
  FlipAnimation,
  FlipCardAnimationSequence,
} from "../FlipCard/FlipCard";
import { DOMKeyframesDefinition, DynamicOption, Target } from "framer-motion";
import { FlipCardData } from "./PlayMatchTypes";
import { SegmentAnimationOptionsWithTransitionEndAndAt } from "../fixAnimationSequence/createAnimationsFromSegments";

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
  onComplete?: OnComplete | undefined,
  transitionEnd?: Target | DynamicOption<Target>
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
      transitionEnd,
      duration: duration,
      delay,
      at,
      x: { onComplete }, // so only get the one notification
    },
  ];
}

export const setOrAddToAnimationSequence = (
  flipCardData: FlipCardData,
  segments: FlipCardAnimationSequence
) => {
  if (flipCardData.animationSequence === undefined) {
    flipCardData.animationSequence = segments;
  } else {
    flipCardData.animationSequence.push(...segments);
  }
};

export type ZIndexAnimationOptions = Omit<
  SegmentAnimationOptionsWithTransitionEndAndAt,
  "duration"
>;
export const instantAnimationDuration = 0.00001;
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
      duration: instantAnimationDuration,
    },
  ];
}

export const createHideShowSegment = (
  hide: boolean
): DomSegmentOptionalElementOrSelectorWithOptions => {
  return [
    undefined,
    { opacity: hide ? 0 : 1 },
    { duration: instantAnimationDuration },
  ];
};

export const instantFlipAnimation: FlipAnimation = {
  flip: true,
  duration: instantAnimationDuration,
};
