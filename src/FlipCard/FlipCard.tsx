import { PlayingCard } from "../generatedTypes";
import { DOMKeyframesDefinition, StyleKeyframesDefinition } from "framer-motion";
import { Point, Size } from "../PlayMatch/matchLayoutManager";
import { SequenceTime } from "./motion-types";
import { ElementOrSelector } from "framer-motion";
import {
  CardFlip,
  CardSegment,
  DOMSegmentWithTransitionOptions,
  Card,
  CardProps,
  AnimationCompleteCallback,
  OptionalDomSegment,
} from "./Card";

export interface FlipAnimation {
  flip: boolean; // true is flip false is flip back
  duration: number;
  at?: number;
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
  animationCompleteCallback?: AnimationCompleteCallback;
}

function getFlipCardSegment(
  flip: boolean,
  cardFlip: CardFlip,
  duration: number,
  at?: SequenceTime
): [
  ElementOrSelector | undefined,
  StyleKeyframesDefinition,
  DOMSegmentWithTransitionOptions
] {
  const belowCardRotateY = flip ? 0 : 180;
  const aboveCardRotateY = flip ? 180 : 0;
  const defn: StyleKeyframesDefinition = {
    rotateY:
      cardFlip === CardFlip.BelowCard ? belowCardRotateY : aboveCardRotateY,
  };
  const options: DOMSegmentWithTransitionOptions = {
    rotateY: { duration },
    at: at,
  };
  return [undefined, defn, options];
}

function adjustSegmentZIndex(zIndex:number, segment:OptionalDomSegment,isAboveCard:boolean){
  zIndex = zIndex *2;
  if(isAboveCard){
    zIndex++;
  }
  const cardSegment = [...segment] as OptionalDomSegment;
  const adjusted = {
    ...cardSegment[1],
    "z-index":zIndex
  };
  cardSegment[1] = adjusted;
  return cardSegment;
}

function addFlipSegments(
  belowCardSegments:CardSegment[],
  aboveCardSegments:CardSegment[],
  flipAnimation:FlipAnimation
){
  const belowCardFlipSegment = getFlipCardSegment(
    flipAnimation.flip,
    CardFlip.BelowCard,
    flipAnimation.duration,
    flipAnimation.at
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

function isFlipAnimation(segment: CardSegment | FlipAnimation): segment is FlipAnimation {
  return typeof segment !== "string" && "flip" in segment;
}

/* 
  Animation sequence fails when want a zIndex animation.  It becomes an immediate animation.
  There is no transitionEnd available. https://github.com/framer/motion/issues/260
  The typescript does not permit onUpdate either.
  Solution from https://github.com/framer/motion/issues/1254 which is still an issue
*/
type WorkaroundDomKeyFramesDefinition = DOMKeyframesDefinition & {
  "z-index": number | undefined;
}
function getWorkaroundZIndex(segment:OptionalDomSegment){
  const domKeyFramesDefinition = segment[1] as WorkaroundDomKeyFramesDefinition;
  return domKeyFramesDefinition["z-index"] as number | undefined;
}

function doGetFlipCardSegments( animationSequence: FlipCardAnimationSequence){
  const belowCardSegments = [];
  const aboveCardSegments = [];
    for (let i = 0; i < animationSequence.length; i++) {
      const segment = animationSequence[i];
      if (isFlipAnimation(segment)) {
        addFlipSegments(belowCardSegments,aboveCardSegments,segment);
      } else {
        if(Array.isArray(segment)){
          const zIndex = getWorkaroundZIndex(segment);
          if(zIndex !== undefined){
            belowCardSegments.push(adjustSegmentZIndex(zIndex,segment,false));
            aboveCardSegments.push(adjustSegmentZIndex(zIndex,segment,true));
            continue;
          }
        }

        belowCardSegments.push(segment);
        aboveCardSegments.push(segment);
        
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
        onComplete={props.animationCompleteCallback}
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
