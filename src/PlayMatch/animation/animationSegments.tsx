import { Box, DeckPosition, Point } from "../layout/matchLayoutManager";
import { OnComplete } from "../../fixAnimationSequence/common-motion-types";
import {
  DomSegmentOptionalElementOrSelectorWithOptions,
  FlipAnimation,
  FlipCardAnimationSequence,
} from "../../FlipCard/FlipCard";
import { DOMKeyframesDefinition, DynamicOption, Target } from "framer-motion";
import { Duration, FlipCardData } from "../PlayMatchTypes";
import { SegmentAnimationOptionsWithTransitionEndAndAt } from "../../fixAnimationSequence/createAnimationsFromSegments";

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
  hide: boolean,
  at?: number
): DomSegmentOptionalElementOrSelectorWithOptions => {
  return [
    undefined,
    { opacity: hide ? 0 : 1 },
    { duration: instantAnimationDuration, at },
  ];
};

export const instantFlipAnimation: FlipAnimation = {
  flip: true,
  duration: instantAnimationDuration,
};

export function createDiscardZIndexAnimationSegment(discardNumber: number) {
  return createZIndexAnimationSegment(5 + discardNumber, {});
}

export function moveCardsToDeckWithoutFlipping(
  cards: FlipCardData[],
  zIndex: number,
  currentDeckPosition: DeckPosition,
  at: number | undefined,
  duration: number,
  onComplete?: () => void
): Duration {
  cards.forEach((card, index) => {
    const isLast = index === cards.length - 1;
    setOrAddToAnimationSequence(card, [
      createZIndexAnimationSegment(zIndex, { at }),
      getMoveRotateSegment(
        currentDeckPosition.isHorizontal,
        currentDeckPosition.position,
        duration,
        undefined,
        undefined,
        isLast ? onComplete : undefined
      ),
    ]);
  });
  return duration + instantAnimationDuration;
}
