import {
  ElementOrSelector,
  DOMKeyframesDefinition,
  motion,
} from "framer-motion";
import { CSSProperties, useRef, useEffect } from "react";
import {
  DynamicAnimationOptions,
  At,
  SequenceLabel,
  SequenceLabelWithTime,
  DOMSegment,
  DOMSegmentWithTransition,
} from "./motion-types";
import { getSVG } from "./getSVG";
import { Point, Size } from "../PlayMatch/matchLayoutManager";
import { PlayingCard } from "../generatedTypes";
import { useAnimateSegments } from "../fixAnimationSequence/useAnimateSegments";
import { SegmentAnimationOptionsWithTransitionEnd } from "../fixAnimationSequence/createAnimationsFromSegments";

export enum CardFlip {
  BelowCard,
  AboveCard,
}

function getAnimateCardStyle(props: CardProps) {
  const scale = !props.faceDown
    ? CardFlip.BelowCard
      ? -1
      : undefined
    : CardFlip.BelowCard
    ? undefined
    : -1;
  const style: CSSProperties = {
    width: props.size.width,
    height: props.size.height,
    zIndex: props.zIndex === undefined ? 0 : props.zIndex,

    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",

    scale,
  };
  return style;
}

export type DOMSegmentWithTransitionOptions = DynamicAnimationOptions & At;
export type DomSegmentOptionalElementOrSelector = [
  ElementOrSelector | undefined,
  DOMKeyframesDefinition
];
export type DomSegmentOptionalElementOrSelectorWithOptions = [
  ElementOrSelector | undefined,
  DOMKeyframesDefinition,
  SegmentAnimationOptionsWithTransitionEnd & At
];
export type OptionalDomSegment = | DomSegmentOptionalElementOrSelector
| DomSegmentOptionalElementOrSelectorWithOptions;

export type CardSegment =
  | OptionalDomSegment
  | SequenceLabel
  | SequenceLabelWithTime;

export interface CardProps {
  segments: CardSegment[] | undefined;
  cardFlip: CardFlip;
  faceDown: boolean;
  size: Size;
  zIndex?: number;
  isHorizontal: boolean;
  position: Point;
  playingCard?: PlayingCard;
}

function addScopeIfNoSelector(scope: unknown, segments: CardSegment[]) {
  return segments.map((cardSegment) => {
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
    return cardSegment as SequenceLabel | SequenceLabelWithTime;
  });
}

export function Card(props: CardProps) {
  const animationCounter = useRef(0);
  const lastProps = useRef<CardProps | undefined>(undefined);
  const [scope, animate] = useAnimateSegments();
  useEffect(() => {
    if (lastProps.current !== props && props.segments) {
      const segments = addScopeIfNoSelector(scope.current, props.segments);
      animationCounter.current = 0;
      animate(segments); 
    }
    lastProps.current = props;
  }, [animate, props, scope]);
  const style: CSSProperties = getAnimateCardStyle(props);
  const Svg = getSVG(props);

  const rotation = props.isHorizontal ? 90 : 0;
  let rotationY = undefined;
  if (props.cardFlip !== undefined) {
    rotationY = props.cardFlip === CardFlip.BelowCard ? 180 : 0;
  }
  return (
    <motion.div
      initial={{
        x: props.position.x,
        y: props.position.y,
        position: "absolute",
        rotate: `${rotation}deg`,
        rotateY: rotationY,
      }}
      style={style}
      ref={scope}
    >
      <Svg
        style={{
          width: props.size.width,
          height: props.size.height,
        }}
      />
    </motion.div>
  );
}
