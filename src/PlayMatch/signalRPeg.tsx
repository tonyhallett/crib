import { FlipCardAnimationSequence } from "../FlipCard/FlipCard";
import {
  CribGameState,
  MyMatch,
  MyPegging,
  PegScoring,
  PeggedCard,
  Pips,
} from "../generatedTypes";
import { arrayLast } from "../utilities/arrayHelpers";
import { FlipCardData, FlipCardDatas, FlipCardState } from "./PlayMatchTypes";
import {
  createZIndexAnimationSegment,
  getMoveRotateSegment,
  instantAnimationDuration,
  setOrAddToAnimationSequence,
} from "./animationSegments";
import {
  numPeggingInPlayCards,
  setPlayableCardsState,
} from "./flipCardDataHelpers";
import { DiscardPositions, Point } from "./matchLayoutManager";
import { getCardValue } from "./playingCardUtilities";
import { getOfAKindScore } from "./scoringUtilities";
import { getAppendMessage } from "./stringUtilities";

export const setTurnedOver = (flipCardDatas: FlipCardDatas): FlipCardDatas => {
  return setPlayableCardsState(flipCardDatas, FlipCardState.PeggingTurnedOver);
};

export const ensurePeggingState = (cardData: FlipCardData) => {
  if (cardData.state !== FlipCardState.PeggingTurnedOver) {
    cardData.state = FlipCardState.PeggingInPlay;
  }
};

export const moveCutCardToPlayerHand = (
  cutCard: FlipCardData,
  at: number,
  duration: number,
  handPosition: DiscardPositions
) => {
  const animation: FlipCardAnimationSequence = [
    getMoveRotateSegment(
      handPosition.isHorizontal,
      handPosition.positions[4],
      duration,
      undefined,
      at
    ),
  ];
  setOrAddToAnimationSequence(cutCard, animation);
};

export const getMoveToPeggingPositionAnimationSequence = (
  peggedCardPosition: number,
  inPlay: Point[],
  duration: number,
  moveCompleted: () => void
): [FlipCardAnimationSequence, number] => {
  return [
    [
      createZIndexAnimationSegment(5 + peggedCardPosition, {}),
      getMoveRotateSegment(
        false,
        inPlay[peggedCardPosition],
        duration,
        undefined,
        undefined,
        moveCompleted
      ),
    ],
    instantAnimationDuration + duration,
  ];
};

const append15Or31 = (
  pegScoring: PegScoring,
  appendMessage: (messageToAppend: string) => void
) => {
  if (pegScoring.is15) {
    appendMessage("15 for 2");
  } else if (pegScoring.is31) {
    appendMessage("31 for 2");
  }
};

export const getPeggedScoreMessage = (
  pegScoring: PegScoring,
  pips: Pips
): string => {
  const [appendMessage, getMessage] = getAppendMessage();
  append15Or31(pegScoring, appendMessage);
  if (pegScoring.numOfAKind >= 2) {
    const ofAKindScore = getOfAKindScore(pegScoring.numOfAKind);
    appendMessage(`${pegScoring.numOfAKind}x${pips} for ${ofAKindScore}`);
  } else if (pegScoring.numCardsInRun >= 3) {
    // could generate Ace, Two, Three....
    appendMessage(
      `Run of ${pegScoring.numCardsInRun} for ${pegScoring.numCardsInRun}`
    );
  }
  if (pegScoring.isLastGo) {
    appendMessage("One for Go");
  }
  return getMessage();
};

// bottom first
export function getTurnOverOrder(turnedOverCards: PeggedCard[]) {
  const turnOverOrder: PeggedCard[] = [];
  let peggedCards: PeggedCard[] = [];
  let currentScore = 0;
  const turnOverTheCards = () => {
    peggedCards.reverse();
    turnOverOrder.push(...peggedCards);
    peggedCards = [];
  };
  for (let i = 0; i < turnedOverCards.length; i++) {
    const peggedCard = turnedOverCards[i];
    const cardValue = getCardValue(peggedCard.playingCard.pips);
    const newCurrentScore = currentScore + cardValue;
    if (newCurrentScore === 31) {
      currentScore = 0;
      peggedCards.push(peggedCard);
      turnOverTheCards();
    } else if (newCurrentScore > 31) {
      turnOverTheCards();

      currentScore = cardValue;
      peggedCards.push(peggedCard);
    } else {
      currentScore = newCurrentScore;
      peggedCards.push(peggedCard);
    }
  }
  if (peggedCards.length > 0) {
    turnOverTheCards();
  }
  return turnOverOrder;
}

export const getPeggedCardPositionIndex = (
  prevFlipCardDatas: FlipCardDatas
): number => {
  return (
    numPeggingInPlayCards(prevFlipCardDatas.myCards) +
    numPeggingInPlayCards(prevFlipCardDatas.otherPlayersCards.flat())
  );
};

export const getLastPeggedCard = (pegging: MyPegging) => {
  const cards =
    pegging.inPlayCards.length === 0
      ? pegging.turnedOverCards
      : pegging.inPlayCards;
  return arrayLast(cards);
};

export const getPeggingCount = (myMatch: MyMatch): number => {
  let sum = 0;
  if (myMatch.gameState === CribGameState.Pegging) {
    myMatch.pegging.inPlayCards.forEach((inPlayCard) => {
      sum += getCardValue(inPlayCard.playingCard.pips);
    });
  }
  return sum;
};
