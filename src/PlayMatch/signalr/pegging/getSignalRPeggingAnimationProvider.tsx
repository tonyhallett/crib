import {
  CribGameState,
  MyMatch,
  PeggedCard,
  Score,
  ShowScoring,
} from "../../../generatedTypes";
import { Positions } from "../../matchLayoutManager";
import { AnimationProvider } from "../../AnimationManager";
import { getLastPeggedCard } from "../../signalRPeg";
import { DelayEnqueueSnackbar } from "../../../hooks/useSnackbarWithDelay";
import { EnqueueSnackbar } from "notistack";
import { addShowAnimation } from "../../theShow";
import { splitPeggingShowScores } from "../../splitPeggingShowScores";
import { FlipCardDatas, SetCribboardState } from "../../PlayMatchTypes";
import { performPegging } from "./performPegging";
import { discardDuration, flipDuration } from "../../animationDurations";
import { MutableRefObject } from "react";

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
  scoresRef:MutableRefObject<Score[]> // assumption is that when access current will be current
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

    if (myMatch.gameState === CribGameState.Show) {
      addShowAnimation(
        prevFlipCardDatas,
        newFlipCardDatas,
        {
          at: pegDelay,
          returnDuration: discardDuration,
          moveCutCardDuration: discardDuration,
          flipDuration,
          onComplete,
          flipBoxDuration:discardDuration,
          moveBoxDuration:discardDuration,
          scoreMessageDuration:2,
          moveToDeckFlipDuration:flipDuration,
          moveToDeckMoveToDeckDuration:discardDuration,
          moveToDeckMoveToFirstDuration:discardDuration,
        },
        pegShowScoring,
        myMatch,
        positions.playerPositions,
        setCribBoardState,
        snackBarMethods.delayEnqueueSnackbar
      );
    }
    scoresRef.current = myMatch.scores;
    return newFlipCardDatas;
  };
  return animationProvider;
}
