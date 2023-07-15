import { motion } from "framer-motion";
import { CSSProperties } from "react";
import { getSVG } from "./getSVG";
import { Size } from "../PlayMatch/matchLayoutManager";
import { PlayingCard } from "../generatedTypes";

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
    width: props.size.width, // necessary on FlipCard / Card and SVG
    height: props.size.height,

    position: "absolute", // the two cards need to occupy the same space

    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",

    scale,
  };
  return style;
}

export interface CardProps {
  cardFlip: CardFlip;
  faceDown: boolean;
  size: Size;
  isHorizontal: boolean;
  playingCard?: PlayingCard;
  className: string;
}

export function Card(props: CardProps) {
  const style: CSSProperties = getAnimateCardStyle(props);
  const Svg = getSVG(props);

  const rotationY = props.cardFlip === CardFlip.BelowCard ? 180 : 0;

  return (
    <motion.div
      className={props.className}
      initial={{
        rotateY: rotationY,
      }}
      style={style}
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
