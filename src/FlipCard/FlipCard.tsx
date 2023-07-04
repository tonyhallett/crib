import { PlayingCard } from "../generatedTypes";
import {
  DOMKeyframesDefinition,
  StyleKeyframesDefinition,
} from "framer-motion";
import { Point, Size } from "../PlayMatch/matchLayoutManager";
import { SequenceTime } from "./motion-types";
import { ElementOrSelector } from "framer-motion";
import {
  CardFlip,
  CardSegment,
  Card,
  CardProps,
  OptionalDomSegment,
} from "./Card";
import { SegmentAnimationOptionsWithTransitionEnd } from "../fixAnimationSequence/createAnimationsFromSegments";
import { At } from "../fixAnimationSequence/motion-types";
import { OnComplete } from "../fixAnimationSequence/common-motion-types";

export interface FlipAnimation {
  flip: boolean; // true is flip false is flip back
  duration: number;
  at?: number;
  onComplete?: OnComplete;
}

export type FlipCardAnimationSequence = (CardSegment | FlipAnimation)[];

export interface FlipCardProps {
  startFaceUp: boolean;
  position: Point;
  size: Size;
  playingCard?: PlayingCard;
  animationSequence?: FlipCardAnimationSequence;
  isHorizontal: boolean;
  zIndex?: number;
}

function getFlipCardSegment(
  flip: boolean,
  cardFlip: CardFlip,
  duration: number,
  at?: SequenceTime,
  onComplete?: OnComplete
): [
  ElementOrSelector | undefined,
  StyleKeyframesDefinition,
  SegmentAnimationOptionsWithTransitionEnd & At
] {
  const belowCardRotateY = flip ? 0 : 180;
  const aboveCardRotateY = flip ? 180 : 0;
  const defn: StyleKeyframesDefinition = {
    rotateY:
      cardFlip === CardFlip.BelowCard ? belowCardRotateY : aboveCardRotateY,
  };
  const options: SegmentAnimationOptionsWithTransitionEnd & At = {
    rotateY: { duration },
    at,
    onComplete,
  };
  return [undefined, defn, options];
}

function adjustSegmentZIndex(
  zIndex: number,
  segment: OptionalDomSegment,
  isAboveCard: boolean
) {
  zIndex = zIndex * 2;
  if (isAboveCard) {
    zIndex++;
  }
  const cardSegment = [...segment] as OptionalDomSegment;
  const adjusted = {
    ...cardSegment[1],
    zIndex: zIndex,
  };
  cardSegment[1] = adjusted;
  return cardSegment;
}

function addFlipSegments(
  belowCardSegments: CardSegment[],
  aboveCardSegments: CardSegment[],
  flipAnimation: FlipAnimation
) {
  const belowCardFlipSegment = getFlipCardSegment(
    flipAnimation.flip,
    CardFlip.BelowCard,
    flipAnimation.duration,
    flipAnimation.at,
    flipAnimation.onComplete
  );
  belowCardSegments.push(belowCardFlipSegment);
  const aboveCardFlipSegment = getFlipCardSegment(
    flipAnimation.flip,
    CardFlip.AboveCard,
    flipAnimation.duration,
    flipAnimation.at
  );
  aboveCardSegments.push(aboveCardFlipSegment);
}

function isFlipAnimation(
  segment: CardSegment | FlipAnimation
): segment is FlipAnimation {
  return typeof segment !== "string" && "flip" in segment;
}

function getZIndex(segment: OptionalDomSegment) {
  const domKeyFramesDefinition = segment[1];
  return domKeyFramesDefinition["zIndex"] as number | undefined;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeOnComplete(valueTransition: any) {
  if (typeof valueTransition === "object") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onComplete, ...rest } = valueTransition;
    return rest;
  }

  return valueTransition;
}

function segmentRemoveOnComplete(
  segment: OptionalDomSegment
): OptionalDomSegment {
  if (segment.length === 2) {
    return segment;
  }
  const options = segment[2];
  const remainder = removeOnComplete(options);
  Object.keys(remainder).forEach((key) => {
    if (remainder[key] !== undefined) {
      remainder[key] = removeOnComplete(remainder[key]);
    }
  });

  return [segment[0], segment[1], remainder];
}

function doGetFlipCardSegments(animationSequence: FlipCardAnimationSequence) {
  const belowCardSegments = [];
  const aboveCardSegments = [];
  for (let i = 0; i < animationSequence.length; i++) {
    const segment = animationSequence[i];
    if (isFlipAnimation(segment)) {
      addFlipSegments(belowCardSegments, aboveCardSegments, segment);
    } else {
      if (Array.isArray(segment)) {
        const zIndex = getZIndex(segment);
        let aboveCardSegment = segmentRemoveOnComplete(segment);
        let belowCardSegment = segment;
        if (zIndex !== undefined) {
          belowCardSegment = adjustSegmentZIndex(zIndex, segment, false);
          aboveCardSegment = adjustSegmentZIndex(
            zIndex,
            aboveCardSegment,
            true
          );
        }
        belowCardSegments.push(belowCardSegment);
        aboveCardSegments.push(aboveCardSegment);
      } else {
        belowCardSegments.push(segment);
        aboveCardSegments.push(segment);
      }
    }
  }
  return [belowCardSegments, aboveCardSegments];
}

function getFlipCardSegments(
  animationSequence: FlipCardAnimationSequence | undefined
) {
  if (animationSequence) {
    return doGetFlipCardSegments(animationSequence);
  }
  return [undefined, undefined];
}

type Common = Pick<CardProps, "position" | "isHorizontal" | "size">;

export function FlipCard(props: FlipCardProps) {
  const common: Common = {
    position: props.position,
    isHorizontal: props.isHorizontal,
    size: props.size,
  };

  const [belowCardSegments, aboveCardSegments] = getFlipCardSegments(
    props.animationSequence
  );
  const zIndex = (props.zIndex ?? 1) * 2;

  return (
    <>
      <Card
        {...common}
        zIndex={zIndex}
        cardFlip={CardFlip.BelowCard}
        faceDown={props.startFaceUp}
        playingCard={props.startFaceUp ? undefined : props.playingCard}
        size={props.size}
        segments={belowCardSegments}
      />
      <Card
        {...common}
        zIndex={zIndex + 1}
        cardFlip={CardFlip.AboveCard}
        faceDown={!props.startFaceUp}
        playingCard={props.startFaceUp ? props.playingCard : undefined}
        size={props.size}
        segments={aboveCardSegments}
      />
    </>
  );
}
