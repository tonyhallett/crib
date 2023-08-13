import {
  CribGameState,
  MyMatch,
  PeggedCard,
  Score,
  ShowScoring,
} from "../../../generatedTypes";
import { Positions } from "../../layout/matchLayoutManager";
import { AnimationProvider } from "../../animation/AnimationManager";
import { getLastPeggedCard } from "../../signalRPeg";
import { DelayEnqueueSnackbar } from "../../../hooks/useSnackbarWithDelay";
import { EnqueueSnackbar } from "notistack";
import { addShowAnimation } from "../../theShow";
import { getCardsWithOwners } from "../../getCardsWithOwners";
import {
  FlipCardDatas,
  SetCribboardState,
  ReadyState,
  CannotGoes,
  FlipCardState,
  FlipCardData,
} from "../../PlayMatchTypes";
import { performPegging } from "./performPegging";
import {
  discardDuration,
  flipDuration,
} from "../../animation/animationDurations";
import { MutableRefObject } from "react";
import { getDeckPosition } from "../../layout/positions-utilities";
import { clearUpAfterWon } from "../../animation/clearUpAfterWon";
import { splitPeggingShowScores } from "../../scoring/splitPeggingShowScores";
import { getReadyState } from "../../getReadyState";
import { GameWonProps } from "../../GameWon";
import { createLastCompleteFactory } from "../../animation/createLastCompleteFactory";
import { addAnimateGo } from "../../animation/animationSegments";

const getDidTurnOver = (peggedCard: PeggedCard, myMatch: MyMatch) => {
  return (
    myMatch.gameState === CribGameState.Pegging && peggedCard.peggingScore.is31
  );
};

const didPeggingWin = (gameState: CribGameState, hasShowScores: boolean) => {
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
  setReadyState: (readyState: ReadyState) => void,
  setGameWonState: (gameWonProps: GameWonProps) => void,
  cribHubReady: () => void,
  scoresRef: MutableRefObject<Score[]>, // assumption is that when access current will be current
  previousCannotGoesRef: MutableRefObject<CannotGoes>
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
    const hasShow = pegShowScoring.length > 1;
    const peggingWon = didPeggingWin(myMatch.gameState, hasShow);

    const lastToCompleteFactory = createLastCompleteFactory(() => {
      setReadyState(getReadyState(myMatch));
      if (peggingWon) {
        cribHubReady();
      }
      animationCompleteCallback();
    });

    const { pegDelay, newFlipCardDatas } = performPegging(
      didTurnOver,
      prevFlipCardDatas,
      peggedCard,
      pegShowScoring.shift() as Score[],
      positions.peggingPositions,
      myMatch,
      setCribBoardState,
      setGameWonState,
      peggingWon,
      snackBarMethods.enqueueSnackbar,
      lastToCompleteFactory
    );
    let showOrClearUpAt = pegDelay;

    const previousCannotGoes = previousCannotGoesRef.current;
    const cannotGoes = new CannotGoes(myMatch);
    if (previousCannotGoes.anyCalledGo && cannotGoes.allCanGo) {
      const animateGoDuration = 1;
      const addAnimateGoToCardsInHand = (
        previousCannotGo: boolean,
        flipCardDatas: FlipCardData[]
      ) => {
        if (previousCannotGo) {
          flipCardDatas.forEach((flipCardData) => {
            if (
              flipCardData.state === FlipCardState.MyHand ||
              flipCardData.state === FlipCardState.OtherPlayersHand
            ) {
              flipCardData.animationSequence = undefined;
              addAnimateGo(flipCardData, false, animateGoDuration, pegDelay); // todo needs complete ?
            }
          });
        }
      };
      addAnimateGoToCardsInHand(
        previousCannotGoes.me,
        newFlipCardDatas.myCards
      );

      newFlipCardDatas.otherPlayersCards.forEach((otherPlayerCards, i) => {
        addAnimateGoToCardsInHand(
          previousCannotGoes.otherPlayers[i],
          otherPlayerCards
        );
      });

      showOrClearUpAt += animateGoDuration;
    }
    previousCannotGoesRef.current = cannotGoes;

    const cardsWithOwners = getCardsWithOwners(
      newFlipCardDatas,
      myMatch.myId,
      myMatch.otherPlayers,
      newFlipCardDatas.additionalBoxCard,
      myMatch.box
    );

    const deckPosition = getDeckPosition(myMatch, positions);

    if (peggingWon) {
      clearUpAfterWon(
        newFlipCardDatas.cutCard,
        cardsWithOwners,
        deckPosition,
        showOrClearUpAt,
        discardDuration,
        flipDuration,
        myMatch.pegging.inPlayCards,
        positions.peggingPositions.inPlay[0],
        myMatch,
        positions.playerPositions,
        lastToCompleteFactory()
      );
    }

    if (hasShow) {
      addShowAnimation(
        prevFlipCardDatas,
        newFlipCardDatas,
        {
          at: showOrClearUpAt,
          returnDuration: discardDuration,
          moveCutCardDuration: discardDuration,
          flipDuration,
          lastToCompleteFactory,
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
        setGameWonState,
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
