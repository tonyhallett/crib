import {
  CribGameState,
  MyMatch,
  Pips,
  PlayingCard,
  Score,
} from "../../../generatedTypes";
import { Box, Positions } from "../../layout/matchLayoutManager";
import { FlipAnimation, FlipCardAnimationSequence } from "../../../FlipCard/FlipCard";
import { getDiscardToBoxSegment } from "../../animation/animationSegments";
import { AnimationProvider } from "../../animation/AnimationManager";
import { OnComplete } from "../../../fixAnimationSequence/common-motion-types";
import { playMatchSnackbarKey } from "../../../App";
import { getDiscardToBoxZIndexStartSegment } from "./getDiscardToBoxZIndexStartSegment";
import { getColouredScores } from "../../getColouredScores";
import { getBoxPosition, getDeckPosition } from "../../layout/positions-utilities";
import { cardMatch } from "../../playingCardUtilities";
import {
  CribBoardState,
  FlipCardData,
  FlipCardDatas,
  FlipCardState,
} from "../../PlayMatchTypes";
import { flipDuration } from "../../animation/animationDurations";
import { clearUpAfterWon } from "../../animation/clearUpAfterWon";
import { getCardsWithOwners } from "../../getCardsWithOwners";
import { getDiscardScores } from "./getDiscardScores";
import { EnqueueSnackbar } from "notistack";

export interface SignalRDiscardAnimationOptions {
  discardDuration: number;
  secondDiscardDelay: number;
  cardFlipDuration: number;
}

function cutCardWon(gameState:CribGameState){
  return gameState === CribGameState.GameWon ||
      gameState === CribGameState.MatchWon
}

export function getSignalRDiscardAnimationProvider(
  animationOptions: SignalRDiscardAnimationOptions,
  myMatch: MyMatch,
  discarderId: string,
  getPositions: () => Positions,
  scoresRef: React.MutableRefObject<Score[]>,
  removeMyDiscardSelection: () => void,
  setGameState: (gameState: CribGameState) => void,
  setCribBoardState: (cribBoardState: CribBoardState) => void,
  enqueueSnackbar: EnqueueSnackbar,
  syncChangeHistories: () => void
): AnimationProvider {
  const { cardFlipDuration, discardDuration, secondDiscardDelay } =
    animationOptions;
  // eslint-disable-next-line complexity
  const animationProvider: AnimationProvider = (
    animationCompleteCallback,
    prevFlipCardDatas
  ) => {
    setGameState(myMatch.gameState);
    const positions = getPositions();
    prevFlipCardDatas = prevFlipCardDatas as FlipCardDatas;
    
    const complete = () => {
      animationCompleteCallback && animationCompleteCallback();
      syncChangeHistories();
    };
    
    const iDiscarded = discarderId === myMatch.myId;
    const numDiscards = myMatch.otherPlayers.length + 1 === 2 ? 2 : 1;

    const boxPosition = getBoxPosition(myMatch, positions);

    const cutCardDelay =
      discardDuration + (numDiscards - 1) * secondDiscardDelay;

    let countDiscards = 0;
    const getDiscardToBoxCardData = (
      boxPosition: Box,
      prevCardData: FlipCardData,
      onComplete?: OnComplete | undefined
    ) => {
      const newCardData = { ...prevCardData };
      newCardData.state = FlipCardState.Box;
      newCardData.animationSequence = [
        getDiscardToBoxZIndexStartSegment(myMatch, countDiscards),
        getDiscardToBoxSegment(
          boxPosition,
          discardDuration,
          countDiscards * secondDiscardDelay,
          undefined,
          onComplete
        ),
      ];
      return newCardData;
    };
    const cutCardAt = cutCardDelay + (iDiscarded ? cardFlipDuration : 0);
    const getCutCardAnimationData = (
      prevCardData: FlipCardData,
      isJack: boolean,
      cutCard: PlayingCard
    ) => {
      const newCardData = { ...prevCardData };
      newCardData.playingCard = cutCard;
      const flipAnimation: FlipAnimation = {
        flip: true,
        duration: cardFlipDuration,
        at: cutCardAt,
        onComplete: () => {
          let requiresCompletion = true;
          if (isJack) {
            const nibs = "nibs";
            enqueueSnackbar(`Two for his ${nibs} !`, {
              variant: "success",
              key: playMatchSnackbarKey,
            });
            requiresCompletion = false;
            setCribBoardState({
              colouredScores: getColouredScores(getDiscardScores(myMatch)),
              onComplete() {
                complete();
              },
            });
          }
          if (requiresCompletion) {
            complete();
          }
        },
      };
      newCardData.animationSequence = [flipAnimation];
      return newCardData;
    };

    let newFlipCardDatas: FlipCardDatas;

    if (iDiscarded) {
      removeMyDiscardSelection();
      newFlipCardDatas = {
        ...prevFlipCardDatas,
        myCards: prevFlipCardDatas.myCards.map((prevCardData) => {
          const playingCard = prevCardData.playingCard as PlayingCard;
          if (
            !myMatch.myCards.some((myCard) => {
              return cardMatch(myCard, playingCard);
            })
          ) {
            countDiscards++;
            const discardToBoxCardData = getDiscardToBoxCardData(
              boxPosition,
              prevCardData,
              countDiscards === numDiscards && !myMatch.cutCard
                ? complete
                : undefined
            );
            const flipAnimation: FlipAnimation = {
              flip: true,
              duration: cardFlipDuration,
            };
            (
              discardToBoxCardData.animationSequence as FlipCardAnimationSequence
            ).unshift(flipAnimation);
            return discardToBoxCardData;
          } else {
            return prevCardData;
          }
        }),
      };
    } else {
      const discardedIndex = myMatch.otherPlayers.findIndex(
        (otherPlayer) => otherPlayer.id === discarderId
      );
      const prevOtherPlayerCardDatas =
        prevFlipCardDatas.otherPlayersCards[discardedIndex];

      const newDiscarderCardDatas = prevOtherPlayerCardDatas.map(
        (prevCardData) => {
          if (countDiscards < numDiscards) {
            countDiscards++;
            const newData = getDiscardToBoxCardData(
              boxPosition,
              prevCardData,
              countDiscards === numDiscards && !myMatch.cutCard
                ? complete
                : undefined
            );
            return newData;
          }
          return prevCardData;
        }
      );

      const newOtherPlayersCards = prevFlipCardDatas.otherPlayersCards.map(
        (otherPlayerCards, i) => {
          if (i === discardedIndex) {
            return newDiscarderCardDatas;
          }
          return otherPlayerCards;
        }
      );

      newFlipCardDatas = {
        ...prevFlipCardDatas,
        otherPlayersCards: newOtherPlayersCards,
      };
    }

    if (myMatch.cutCard) {
      newFlipCardDatas.cutCard = getCutCardAnimationData(
        prevFlipCardDatas.cutCard,
        myMatch.cutCard.pips === Pips.Jack,
        myMatch.cutCard
      );
    }

    if (cutCardWon(myMatch.gameState)) {
      const at = cutCardAt + cardFlipDuration + 5; // 5 as currently using the default snackbar which is greater than the crib board duration.
      clearUpAfterWon(
        newFlipCardDatas.cutCard,
        getCardsWithOwners(
          newFlipCardDatas,
          myMatch.myId,
          myMatch.otherPlayers,
          newFlipCardDatas.additionalBoxCard,
          myMatch.box
        ),
        getDeckPosition(myMatch, positions),
        at,
        0.5,
        flipDuration,
        [],
        { x: 0, y: 0 },
        myMatch,
        positions.playerPositions
      );
    }
    scoresRef.current = myMatch.scores;
    return newFlipCardDatas;
  };
  return animationProvider;
}
