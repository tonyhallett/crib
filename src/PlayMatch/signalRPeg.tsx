import { FlipAnimation, FlipCardAnimationSequence } from "../FlipCard/FlipCard";
import { OnComplete } from "../fixAnimationSequence/common-motion-types";
import {
  CribGameState,
  MyMatch,
  MyPegging,
  PegScoring,
  PeggedCard,
  Pips,
  PlayingCard,
  Score,
} from "../generatedTypes";
import { EnqueueSnackbar } from "../hooks/useSnackbarWithDelay";
import { arrayLast } from "../utilities/arrayHelpers";
import {
  Duration,
  FlipCardData,
  FlipCardDatas,
  FlipCardState,
  SetCribboardState,
} from "./PlayMatchTypes";
import {
  createZIndexAnimationSegment,
  getMoveRotateSegment,
  instantAnimationDuration,
  instantFlipAnimation,
  setOrAddToAnimationSequence,
} from "./animation/animationSegments";
import {
  numPeggingInPlayCards,
  setPlayableCardsState,
} from "./flipCardDataHelpers";
import {
  DiscardPositions,
  PeggingPositions,
  Point,
} from "./layout/matchLayoutManager";
import { getPeggingScored } from "./signalr/pegging/peggingScored";
import { cardMatch, getCardValue } from "./playingCardUtilities";
import { getOfAKindScore } from "./scoring/scoring-utilities";
import { getAppendMessage } from "../utilities/stringUtilities";

export const setTurnedOver = (flipCardDatas: FlipCardDatas): FlipCardDatas => {
  return setPlayableCardsState(
    flipCardDatas,
    FlipCardState.PeggingInPlay,
    FlipCardState.PeggingTurnedOver
  );
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

export const getMoveToPeggingPositionAnimationSequenceAndScore = (
  peggedCardPosition: number,
  inPlayPositions: Point[],
  pegScores: Score[],
  peggedCard: PeggedCard,
  discardDuration: number,
  setCribBoardState: SetCribboardState,
  enqueueSnackbar: EnqueueSnackbar,
  animationCompleteCallback: (() => void) | undefined,
  peggingScoreSnackbarDurationSeconds = 5
): [FlipCardAnimationSequence, Duration] => {
  const scored = peggedCard.peggingScore.score > 0;
  const [peggingScored, peggingScoredDuration] = getPeggingScored(
    peggedCard,
    pegScores,
    setCribBoardState,
    enqueueSnackbar,
    peggingScoreSnackbarDurationSeconds,
    animationCompleteCallback
  );
  const scoreDuration = scored ? peggingScoredDuration : 0;

  const [sequence, moveToPeggingPositionDuration] =
    getMoveToPeggingPositionAnimationSequence(
      peggedCardPosition,
      inPlayPositions,
      discardDuration,
      () => {
        if (scored) {
          peggingScored();
        } else {
          animationCompleteCallback?.();
        }
      }
    );
  return [sequence, moveToPeggingPositionDuration + scoreDuration];
};

export const getMoveToPeggingPositionAnimationSequence = (
  peggedCardPosition: number,
  inPlay: Point[],
  duration: number,
  moveCompleted: () => void
): [FlipCardAnimationSequence, Duration] => {
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

const applyTurnOverTogetherAnimation = (
  flipCardData: FlipCardData,
  turnedOverCardIndex: number,
  numTurnedOverCardsFromBefore: number,
  numCardsTurningOver: number,
  delay: number,
  turnedOverPosition: Point,
  firstPeggedPosition: Point,
  overlayDuration: number,
  moveToTurnOverDuration: number,
  flipDuration: number,
  onComplete: OnComplete
): Duration => {
  const positionFromTop =
    numTurnedOverCardsFromBefore +
    numCardsTurningOver -
    turnedOverCardIndex -
    1;
  // later pegged lower the zindex
  const turnedOverZIndex =
    50 + numTurnedOverCardsFromBefore + 1 + positionFromTop;
  const isTop = positionFromTop === 0;

  const segments: FlipCardAnimationSequence = [
    getMoveRotateSegment(
      false,
      firstPeggedPosition,
      overlayDuration,
      undefined,
      delay,
      undefined
    ),
  ];

  if (!isTop) {
    segments.push(instantFlipAnimation, [
      undefined,
      { opacity: 0 },
      { duration: instantAnimationDuration },
    ]);
  } else {
    const flipAnimation: FlipAnimation = {
      flip: true,
      duration: flipDuration,
    };
    segments.push(flipAnimation);
  }
  segments.push(
    createZIndexAnimationSegment(turnedOverZIndex, {
      at: delay + overlayDuration + flipDuration,
    }),
    getMoveRotateSegment(false, turnedOverPosition, moveToTurnOverDuration),
    [
      undefined,
      { opacity: 1 },
      {
        duration: instantAnimationDuration,
        onComplete: isTop ? onComplete : undefined,
      },
    ]
  );

  setOrAddToAnimationSequence(flipCardData, segments);
  return (
    overlayDuration +
    flipDuration +
    moveToTurnOverDuration +
    instantAnimationDuration
  );
};

export const addTurnOverTogetherAnimation = (
  prevFlipCardDatas: FlipCardDatas,
  newFlipCardDatas: FlipCardDatas,
  delay: number,
  onComplete: (() => void) | undefined,
  myMatch: MyMatch,
  peggingPositions: PeggingPositions,
  discardDuration: number,
  flipDuration: number
): Duration => {
  let duration = 0;
  const numTurnedOverCardsFromBefore = prevFlipCardDatas.myCards
    .concat(prevFlipCardDatas.otherPlayersCards.flat())
    .filter((cardData) => {
      return cardData.state === FlipCardState.PeggingTurnedOver;
    }).length;

  const addAnimationToTurnedOverCards = (newFlipCardDatas: FlipCardData[]) => {
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
          duration = applyTurnOverTogetherAnimation(
            newFlipCardData,
            turnedOverCardIndex,
            numTurnedOverCardsFromBefore,
            myMatch.pegging.turnedOverCards.length -
              numTurnedOverCardsFromBefore,
            delay,
            peggingPositions.turnedOver,
            peggingPositions.inPlay[0],
            discardDuration,
            discardDuration,
            flipDuration,
            onComplete
          );
        }
      }
    });
  };

  addAnimationToTurnedOverCards(
    newFlipCardDatas.otherPlayersCards.flat().concat(newFlipCardDatas.myCards)
  );
  return duration;
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
