import { PlayingCard } from "../generatedTypes";
import { DOMKeyframesDefinition, StyleKeyframesDefinition, motion } from "framer-motion";
import { Point, Size } from "../PlayMatch/matchLayoutManager";
import { DOMSegment, DOMSegmentWithTransition, DynamicAnimationOptions, SequenceLabel, SequenceLabelWithTime, SequenceTime } from "./motion-types";
import { ElementOrSelector } from "framer-motion";
import {
  CardFlip,
  Card,
  CardProps,
} from "./Card";
import { SegmentAnimationOptionsWithTransitionEnd, SegmentAnimationOptionsWithTransitionEndAndAt, SmartAnimationSequence, SmartSegment } from "../fixAnimationSequence/createAnimationsFromSegments";
import { At } from "../fixAnimationSequence/motion-types";
import { OnComplete } from "../fixAnimationSequence/common-motion-types";
import { useAnimateSegments } from "../fixAnimationSequence/useAnimateSegments";
import { useEffect, useRef } from "react";

export interface FlipAnimation {
  flip: boolean; // true is flip false is flip back
  duration: number;
  at?: number;
  onComplete?: OnComplete;
}

export type DOMSegmentWithTransitionOptions = DynamicAnimationOptions & At;
export type DomSegmentOptionalElementOrSelector = [
  ElementOrSelector | undefined,
  DOMKeyframesDefinition
];
export type DomSegmentOptionalElementOrSelectorWithOptions = [
  ElementOrSelector | undefined,
  DOMKeyframesDefinition,
  SegmentAnimationOptionsWithTransitionEndAndAt
];
export type OptionalDomSegment =
  | DomSegmentOptionalElementOrSelector
  | DomSegmentOptionalElementOrSelectorWithOptions;

export type CardSegment =
  | OptionalDomSegment
  | SequenceLabel
  | SequenceLabelWithTime;
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

const belowCardClassName = "belowFlipCard";
const aboveCardClassName = "aboveFlipCard";
function getFlipCardSegment(
  flip: boolean,
  cardFlip: CardFlip,
  duration: number,
  at?: SequenceTime,
  onComplete?: OnComplete
): [
  ElementOrSelector,
  StyleKeyframesDefinition,
  SegmentAnimationOptionsWithTransitionEnd & At
] {
  const belowCardRotateY = flip ? 0 : 180;
  const aboveCardRotateY = flip ? 180 : 0;
  const defn: StyleKeyframesDefinition = {
    rotateY:
      cardFlip === CardFlip.BelowCard ? belowCardRotateY : aboveCardRotateY,
  };
  const options: SegmentAnimationOptionsWithTransitionEndAndAt = {
    rotateY: { duration },
    at,
    onComplete,
  };
  const className = cardFlip === CardFlip.AboveCard ? aboveCardClassName : belowCardClassName;
  return [`.${className}`, defn, options];
}

function isFlipAnimation(
  segment: CardSegment | FlipAnimation
): segment is FlipAnimation {
  return typeof segment !== "string" && "flip" in segment;
}

type CommonCardProps = Pick<CardProps, "isHorizontal" | "size">;

function addScopeIfNoSelector(scope: unknown, cardSegment: CardSegment):SmartSegment {
  if (Array.isArray(cardSegment)) {
    if (cardSegment[0] === undefined) {
      if (cardSegment.length === 2) {
        return [scope, cardSegment[1]] as DOMSegment;
      }
      return [
        scope,
        cardSegment[1],
        cardSegment[2],
      ] as DOMSegmentWithTransition;
    }
  }
  return cardSegment as SmartSegment;
}

function addFlipSegments(flipAnimation:FlipAnimation,smartAnimationSequence:SmartAnimationSequence){
  const belowCardSegment = getFlipCardSegment(
    flipAnimation.flip,
    CardFlip.BelowCard,
    flipAnimation.duration,
    flipAnimation.at,
    flipAnimation.onComplete // note single complete
  );
  const aboveCardSegment = getFlipCardSegment(
    flipAnimation.flip,
    CardFlip.AboveCard,
    flipAnimation.duration,
    flipAnimation.at
  )
  if(flipAnimation.at){
    smartAnimationSequence.push(belowCardSegment);
    smartAnimationSequence.push(aboveCardSegment);
  }else{
    smartAnimationSequence.push(belowCardSegment);
    const aboveOptions = aboveCardSegment[2];
    aboveOptions.at = "<"; // or use a marker
    smartAnimationSequence.push(aboveCardSegment);
  }
}

function populateSequence(scope:unknown,flipCardAnimationSequence:FlipCardAnimationSequence) : SmartAnimationSequence{
  const animationSequence : SmartAnimationSequence = [];
  for (let i = 0; i < flipCardAnimationSequence.length; i++) {
    const segment = flipCardAnimationSequence[i];
    if (isFlipAnimation(segment)) {
      addFlipSegments(segment, animationSequence);
    } else {
      animationSequence.push(addScopeIfNoSelector(scope,segment));
    }
  }
  return animationSequence;
}


export function FlipCard(props: FlipCardProps) {
  const [scope, animate] = useAnimateSegments();
  const lastProps = useRef<FlipCardProps | undefined>(undefined);
  useEffect(() => {
    if (lastProps.current !== props && props.animationSequence) {
      const animationSequence = populateSequence(
        scope.current,
        props.animationSequence
      );
      animate(animationSequence);
    }
    lastProps.current = props;
  }, [animate, props, scope]);

  const common: CommonCardProps = {
    isHorizontal: props.isHorizontal,
    size: props.size,
  };

  

  const rotation = props.isHorizontal ? 90 : 0;

  const flipCardId = props.playingCard
    ? `flipCard_${props.playingCard.pips}_${props.playingCard.suit}`
    : "flipCard";
  return (
    <motion.div ref={scope} id={flipCardId} style={
      {
        zIndex:props.zIndex,
        width:props.size.width,
        height:props.size.height
        
      }
    } initial={{
      x: props.position.x,
      y: props.position.y,
      position: "absolute",
      rotate: `${rotation}deg`,
    }}
    >
      <Card
        {...common}
        cardFlip={CardFlip.BelowCard}
        faceDown={props.startFaceUp}
        playingCard={props.startFaceUp ? undefined : props.playingCard}
        size={props.size}
        className={belowCardClassName}
      />
      <Card
        {...common}
        cardFlip={CardFlip.AboveCard}
        faceDown={!props.startFaceUp}
        playingCard={props.startFaceUp ? props.playingCard : undefined}
        size={props.size}
        className={aboveCardClassName}
      />
    </motion.div>
  );
}
