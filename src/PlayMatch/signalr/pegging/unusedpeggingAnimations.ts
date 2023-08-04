import { Point } from "framer-motion";
import { FlipAnimation } from "../../../FlipCard/FlipCard";
import { OnComplete } from "../../../fixAnimationSequence/common-motion-types";
import { MyMatch, PlayingCard } from "../../../generatedTypes";
import {
  FlipCardData,
  FlipCardDatas,
  FlipCardState,
} from "../../PlayMatchTypes";
import { getMoveRotateSegment } from "../../animation/animationSegments";
import {
  createZIndexAnimationSegment,
  instantAnimationDuration,
} from "../../animation/animationSegments";
import { cardMatch } from "../../playingCardUtilities";
import { Positions } from "../../layout/matchLayoutManager";

const addFlipMoveToTurnedOverPositionAnimationSequence = (
  flipCardData: FlipCardData,
  turnedOverCardIndex: number,
  numTurnedOverCardsFromBefore: number,
  numCardsTurningOver: number,
  delay: number,
  turnedOverPosition: Point,
  discardDuration: number,
  flipDuration: number,
  onComplete: OnComplete
): void => {
  const positionFromTop =
    numTurnedOverCardsFromBefore +
    numCardsTurningOver -
    turnedOverCardIndex -
    1;
  // later pegged lower the zindex
  const turnedOverZIndex =
    50 + numTurnedOverCardsFromBefore + 1 + positionFromTop;
  // move later pegged first
  const at =
    delay +
    positionFromTop *
      (discardDuration + flipDuration + instantAnimationDuration);
  const flipAnimation: FlipAnimation = {
    flip: true,
    duration: flipDuration,
  };
  const segments = [
    createZIndexAnimationSegment(turnedOverZIndex, { at }),
    flipAnimation,
    getMoveRotateSegment(
      false,
      turnedOverPosition,
      discardDuration,
      undefined,
      undefined,
      onComplete
    ),
  ];
  if (flipCardData.animationSequence) {
    flipCardData.animationSequence.push(...segments);
  } else {
    flipCardData.animationSequence = segments;
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const addTurnOverOneAtATimeAnimation = (
  prevFlipCardDatas: FlipCardDatas,
  newFlipCardDatas: FlipCardDatas,
  delay: number,
  onComplete: () => void,
  myMatch: MyMatch,
  flipDuration: number,
  discardDuration: number,
  positions: Positions
) => {
  const numTurnedOverCardsFromBefore = prevFlipCardDatas.myCards
    .concat(prevFlipCardDatas.otherPlayersCards.flat())
    .filter((cardData) => {
      return cardData.state === FlipCardState.PeggingTurnedOver;
    }).length;

  const addFlipMoveToTurnedOverPositionAnimationSequenceToTurnedOverCards = (
    newFlipCardDatas: FlipCardData[]
  ) => {
    newFlipCardDatas.forEach((newFlipCardData) => {
      if (newFlipCardData.playingCard !== undefined) {
        const turnedOverCardIndex = myMatch.pegging.turnedOverCards.findIndex(
          (turnedOverCard) => {
            return cardMatch(
              turnedOverCard.playingCard,
              newFlipCardData.playingCard as PlayingCard
            );
          }
        );
        if (turnedOverCardIndex >= numTurnedOverCardsFromBefore) {
          const lastToMove =
            turnedOverCardIndex === numTurnedOverCardsFromBefore;
          addFlipMoveToTurnedOverPositionAnimationSequence(
            newFlipCardData,
            turnedOverCardIndex,
            numTurnedOverCardsFromBefore,
            myMatch.pegging.turnedOverCards.length -
              numTurnedOverCardsFromBefore,
            delay,
            positions.peggingPositions.turnedOver,
            discardDuration,
            flipDuration,
            lastToMove ? onComplete : undefined
          );
        }
      }
    });
  };

  addFlipMoveToTurnedOverPositionAnimationSequenceToTurnedOverCards(
    newFlipCardDatas.otherPlayersCards.flat().concat(newFlipCardDatas.myCards)
  );
};
