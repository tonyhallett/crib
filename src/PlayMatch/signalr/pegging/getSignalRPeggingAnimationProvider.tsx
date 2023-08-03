import {
  CribGameState,
  MyMatch,
  PeggedCard,
  PlayingCard,
  Score,
  ShowScoring,
} from "../../../generatedTypes";
import { DeckPosition, Point, Positions } from "../../matchLayoutManager";
import { AnimationProvider } from "../../AnimationManager";
import { getLastPeggedCard } from "../../signalRPeg";
import { DelayEnqueueSnackbar } from "../../../hooks/useSnackbarWithDelay";
import { EnqueueSnackbar } from "notistack";
import { addShowAnimation } from "../../theShow";
import {
  CardsAndOwner,
  CardsAndOwners,
  getCardsWithOwners,
} from "../../getCardsWithOwners";
import { splitPeggingShowScores } from "../../splitPeggingShowScores";
import {
  Duration,
  FlipCardData,
  FlipCardDatas,
  FlipCardState,
  SetCribboardState,
} from "../../PlayMatchTypes";
import { performPegging } from "./performPegging";
import { discardDuration, flipDuration } from "../../animationDurations";
import { MutableRefObject } from "react";
import { moveCardsToDeckWithoutFlipping } from "../../moveCardsToDeckWithoutFlipping";
import {
  createHideShowSegment,
  createZIndexAnimationSegment,
  getMoveRotateSegment,
  instantAnimationDuration,
  setOrAddToAnimationSequence,
} from "../../animationSegments";
import {
  FlipAnimation,
  FlipCardAnimationSequence,
} from "../../../FlipCard/FlipCard";
import { getDeckPosition } from "../../positions";
import { cardMatch } from "../../playingCardUtilities";

const getDidTurnOver = (peggedCard: PeggedCard, myMatch: MyMatch) => {
  return (
    myMatch.gameState === CribGameState.Pegging && peggedCard.peggingScore.is31
  );
};

const createOnComplete = (
  additionalAnimation: boolean,
  animationCompleteCallback: () => void
) => {
  const numCompletesToComplete = additionalAnimation ? 2 : 1;
  let numCompleted = 0;
  return () => {
    numCompleted++;
    if (numCompleted === numCompletesToComplete) {
      animationCompleteCallback();
    }
  };
};

const shouldShow = (gameState: CribGameState, numScores: number) => {
  if (numScores === 0) {
    return false;
  }
  const states: CribGameState[] = [
    CribGameState.GameWon,
    CribGameState.MatchWon,
    CribGameState.Show,
  ];
  return states.includes(gameState);
};

const shouldClearUpAfterPeggingWon = (
  gameState: CribGameState,
  hasShowScores: boolean
) => {
  return (
    (gameState === CribGameState.GameWon ||
      gameState === CribGameState.MatchWon) &&
    !hasShowScores
  );
};

export function getSignalRPeggingAnimationProvider(
  myMatch: MyMatch,
  getPositions: () => Positions,
  allowPegging: () => void,
  setNextPlayer: (nextPlayer: string) => void,
  snackBarMethods: {
    enqueueSnackbar: EnqueueSnackbar;
    delayEnqueueSnackbar: DelayEnqueueSnackbar;
  },
  setCribBoardState: SetCribboardState,
  scoresRef: MutableRefObject<Score[]> // assumption is that when access current will be current
): AnimationProvider {
  // eslint-disable-next-line complexity
  const animationProvider: AnimationProvider = (
    animationCompleteCallback,
    prevFlipCardDatas
  ) => {
    prevFlipCardDatas = prevFlipCardDatas as FlipCardDatas;
    allowPegging();
    setNextPlayer(myMatch.pegging.nextPlayer);
    const positions = getPositions();
    const peggedCard = getLastPeggedCard(myMatch.pegging);
    const previousScores = scoresRef.current;
    const pegShowScoring = splitPeggingShowScores(
      peggedCard,
      myMatch.showScoring as ShowScoring,
      myMatch.myId,
      myMatch.otherPlayers,
      previousScores
    );

    const didTurnOver = getDidTurnOver(peggedCard, myMatch);

    const onComplete = createOnComplete(
      didTurnOver || myMatch.gameState === CribGameState.Show,
      animationCompleteCallback
    );

    const { pegDelay, newFlipCardDatas } = performPegging(
      didTurnOver,
      prevFlipCardDatas,
      peggedCard,
      pegShowScoring.shift() as Score[],
      positions.peggingPositions,
      myMatch,
      setCribBoardState,
      snackBarMethods.enqueueSnackbar,
      onComplete
    );

    const cardsWithOwners = getCardsWithOwners(
      newFlipCardDatas,
      myMatch.myId,
      myMatch.otherPlayers,
      newFlipCardDatas.additionalBoxCard,
      myMatch.box
    );

    const deckPosition = getDeckPosition(myMatch, positions);

    if (
      shouldClearUpAfterPeggingWon(myMatch.gameState, pegShowScoring.length > 0)
    ) {
      clearUpAfterPeggingWon(
        newFlipCardDatas.cutCard,
        cardsWithOwners,
        deckPosition,
        pegDelay,
        discardDuration,
        flipDuration,
        myMatch.pegging.inPlayCards,
        positions.peggingPositions.inPlay[0]
      );
    }

    if (shouldShow(myMatch.gameState, pegShowScoring.length)) {
      addShowAnimation(
        prevFlipCardDatas,
        newFlipCardDatas,
        {
          at: pegDelay,
          returnDuration: discardDuration,
          moveCutCardDuration: discardDuration,
          flipDuration,
          onComplete,
          flipBoxDuration: discardDuration,
          moveBoxDuration: discardDuration,
          scoreMessageDuration: 2,
          moveToDeckFlipDuration: flipDuration,
          moveToDeckMoveToDeckDuration: discardDuration,
          moveToDeckMoveToFirstDuration: discardDuration,
        },
        pegShowScoring,
        myMatch,
        positions.playerPositions,
        setCribBoardState,
        snackBarMethods.delayEnqueueSnackbar,
        cardsWithOwners,
        deckPosition
      );
    }
    scoresRef.current = myMatch.scores;
    return newFlipCardDatas;
  };
  return animationProvider;
}

function getCardsWithState(
  playerCardsAndOwners: CardsAndOwner[],
  state: FlipCardState
) {
  return playerCardsAndOwners
    .map((playerCards) => playerCards.cards)
    .flat()
    .filter((card) => card.state === state);
}

function clearUpAfterPeggingWon(
  cutCard: FlipCardData,
  cardsWithOwners: CardsAndOwners,
  currentDeckPosition: DeckPosition,
  at: number,
  moveToDeckDuration: number,
  flipDuration: number,
  inPlayCards: PeggedCard[],
  firstPeggingPosition: Point
) {
  flipCutCard(cutCard, flipDuration, at);
  at += flipDuration;
  const turnedOverCards = getCardsWithState(
    cardsWithOwners.playerCards,
    FlipCardState.PeggingTurnedOver
  );
  let currentDeckCount = 3;
  if (turnedOverCards.length > 0) {
    at += moveCardsToDeckWithoutFlipping(
      turnedOverCards,
      currentDeckCount,
      currentDeckPosition,
      at,
      moveToDeckDuration
    ); // need to change the file name
    currentDeckCount += turnedOverCards.length;
  }
  const inPlayCardDatas = getCardsWithState(
    cardsWithOwners.playerCards,
    FlipCardState.PeggingInPlay
  );
  inPlayCardDatas.sort((a, b) => {
    const aPlayingCard = a.playingCard as PlayingCard;
    const bPlayingCard = b.playingCard as PlayingCard;
    const aIndex = inPlayCards.findIndex((inPlayCard) =>
      cardMatch(inPlayCard.playingCard, aPlayingCard)
    );
    const bIndex = inPlayCards.findIndex((inPlayCard) =>
      cardMatch(inPlayCard.playingCard, bPlayingCard)
    );
    return aIndex - bIndex; // tbd
  });

  at += flipAndMoveCardsInPlayToDeck(
    inPlayCardDatas,
    flipDuration,
    moveToDeckDuration,
    moveToDeckDuration,
    currentDeckCount,
    currentDeckPosition,
    firstPeggingPosition,
    at
  );
  currentDeckCount += inPlayCardDatas.length + 1;
  /* 
  
  
  possiblyFlipAndMovePlayerCardsToDeck(cardsWithOwners.playerCards);
  
   */
  currentDeckCount += cardsWithOwners.playerCards.length * 4;
  moveCardsToDeckWithoutFlipping(
    cardsWithOwners.boxCards,
    currentDeckCount,
    currentDeckPosition,
    at,
    moveToDeckDuration
  );
}

function flipCutCard(cutCard: FlipCardData, flipDuration: number, at: number) {
  const flipAnimation: FlipAnimation = {
    flip: true,
    duration: flipDuration,
    at,
  };
  setOrAddToAnimationSequence(cutCard, [flipAnimation]);
}

function flipAndMoveCardsInPlayToDeck(
  inPlayCards: FlipCardData[],
  flipDuration: number,
  moveOverDuration: number,
  moveToDeckDuration: number,
  currentDeckCount: number,
  deckPosition: DeckPosition,
  firstPeggingPosition: Point,
  at: number
): Duration {
  flipDuration = 2;
  moveOverDuration = 2;
  moveToDeckDuration = 2;
  inPlayCards.forEach((inPlayCard, i) => {
    const isTop = i === inPlayCards.length - 1;
    const flipAnimation: FlipAnimation = {
      duration: flipDuration,
      flip: true,
    };
    const animationSequence: FlipCardAnimationSequence = [
      getMoveRotateSegment(
        false,
        firstPeggingPosition,
        moveOverDuration,
        undefined,
        at
      ),
      createHideShowSegment(!isTop),
      createZIndexAnimationSegment(currentDeckCount + 1, {}),
      flipAnimation,
      getMoveRotateSegment(
        deckPosition.isHorizontal,
        deckPosition.position,
        moveToDeckDuration
      ),
    ];
    setOrAddToAnimationSequence(inPlayCard, animationSequence);
  });
  return (
    moveOverDuration +
    instantAnimationDuration * 2 +
    flipDuration +
    moveToDeckDuration
  );
}

function possiblyFlipAndMovePlayerCardsToDeck(cardsAndOwners: CardsAndOwner[]) {
  // will need to check the state
}
