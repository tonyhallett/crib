import { useState } from "react";
import { WoodWhenPlaying } from "../WoodWhenPlaying";
import { Pips, Suit } from "../generatedTypes";
import {
  FlipCardProps,
  FlipCard,
  FlipAnimation,
  DomSegmentOptionalElementOrSelectorWithOptions,
} from "./FlipCard";
import { Size } from "../PlayMatch/matchLayoutManager";

const magnification = 3;
const size: Size = { width: 63 * magnification, height: 88 * magnification };
export function FlipCardDemo() {
  const [flip, setFlip] = useState<boolean | undefined>(undefined);
  //let flipOnly: FlipCardProps["animationSequence"] = undefined;
  //let moveThenFlip: FlipCardProps["animationSequence"] = undefined;
  let flipMoveFlip: FlipCardProps["animationSequence"] = undefined;
  if (flip !== undefined) {
    const flipAnimation: FlipAnimation = {
      flip: true,
      duration: 1,
    };
    const movementSegment: DomSegmentOptionalElementOrSelectorWithOptions = [
      undefined,
      {
        x: 900,
      },
      {
        x: { duration: 5 },
      },
    ];
    //flipOnly = [flipAnimation];
    //moveThenFlip = [movementSegment, flipAnimation];
    flipMoveFlip = [flipAnimation, movementSegment, flipAnimation];
  }

  return (
    <div style={{ perspective: 5000 }}>
      <WoodWhenPlaying playing />
      <FlipCard
        playingCard={{ suit: Suit.Clubs, pips: Pips.Ace }}
        size={size}
        startFaceUp
        isHorizontal={false}
        position={{ x: 200, y: 200 }}
        //animationSequence={moveThenFlip}
        animationSequence={flipMoveFlip}
      />
      {/* <FlipCard
        playingCard={{ suit: Suit.Hearts, pips: Pips.Ace }}
        size={size}
        startFaceUp={false}
        isHorizontal={false}
        position={{ x: 600, y: 200 }}
        animationSequence={flipOnly}
      /> */}
      <button
        onClick={() => {
          setFlip((f) => !f);
        }}
      >
        Flip
      </button>
    </div>
  );
}
