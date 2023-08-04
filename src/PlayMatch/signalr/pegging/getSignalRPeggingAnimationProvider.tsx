import {
  CribGameState,
  MyMatch,
  PeggedCard,
  Score,
  ShowScoring,
} from "../../../generatedTypes";
import {
  Positions,
} from "../../layout/matchLayoutManager";
import { AnimationProvider } from "../../animation/AnimationManager";
import { getLastPeggedCard } from "../../signalRPeg";
import { DelayEnqueueSnackbar } from "../../../hooks/useSnackbarWithDelay";
import { EnqueueSnackbar } from "notistack";
import { addShowAnimation } from "../../theShow";
import {
  getCardsWithOwners,
} from "../../getCardsWithOwners";
import {
  FlipCardDatas,
  SetCribboardState,
} from "../../PlayMatchTypes";
import { performPegging } from "./performPegging";
import { discardDuration, flipDuration } from "../../animation/animationDurations";
import { MutableRefObject } from "react";
import { getDeckPosition } from "../../layout/positions-utilities";
import { clearUpAfterWon } from "../../animation/clearUpAfterWon";
import { splitPeggingShowScores } from "../../scoring/splitPeggingShowScores";

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
      clearUpAfterWon(
        newFlipCardDatas.cutCard,
        cardsWithOwners,
        deckPosition,
        pegDelay,
        discardDuration,
        flipDuration,
        myMatch.pegging.inPlayCards,
        positions.peggingPositions.inPlay[0],
        myMatch,
        positions.playerPositions
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




