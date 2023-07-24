import {
  CribGameState,
  MyMatch,
  OtherPlayer,
  PeggedCard,
  PlayingCard,
  Score,
} from "../generatedTypes";
import { PeggingPositions, Positions } from "./matchLayoutManager";
import { FlipAnimation, FlipCardAnimationSequence } from "../FlipCard/FlipCard";
import { AnimationProvider } from "./AnimationManager";
import {
  addTurnOverTogetherAnimation,
  ensurePeggingState,
  getMoveToPeggingPositionAnimationSequenceAndScore,
  setTurnedOver,
} from "./signalRPeg";
import { getLastPeggedCard, getPeggedCardPositionIndex } from "./signalRPeg";
import { DelayEnqueueSnackbar } from "../hooks/useSnackbarWithDelay";
import { EnqueueSnackbar } from "notistack";
import { addShowAnimation } from "./theShow";
import { splitPeggingShowScores } from "./splitPeggingShowScores";
import { cardMatch } from "./playingCardUtilities";
import {
  FlipCardDatas,
  FlipCardState,
  SetCribboardState,
} from "./PlayMatchTypes";
import { getTurnedOver, discardDuration, flipDuration } from "./PlayMatch";

const iPegged = (
  newFlipCardDatas: FlipCardDatas,
  moveToPeggingPositionAnimationSequence: FlipCardAnimationSequence,
  peggedPlayingCard: PlayingCard
) => {
  // if my pegging selection adds an animation will need to remove
  const newMyFlipCardDatas = newFlipCardDatas.myCards.map((cardData) => {
    const playingCard = cardData.playingCard as PlayingCard;
    if (playingCard && cardMatch(playingCard, peggedPlayingCard)) {
      const newCardData = { ...cardData };
      ensurePeggingState(newCardData);
      newCardData.animationSequence = moveToPeggingPositionAnimationSequence;
      return newCardData;
    } else {
      return cardData;
    }
  });
  newFlipCardDatas.myCards = newMyFlipCardDatas;
};

const otherPlayerPegged = (
  prevFlipCardDatas: FlipCardDatas,
  newFlipCardDatas: FlipCardDatas,
  flipDuration: number,
  moveToPeggingPositionAnimationSequence: FlipCardAnimationSequence,
  peggedPlayingCard: PlayingCard,
  playerId: string,
  otherPlayers: OtherPlayer[]
) => {
  const peggerIndex = otherPlayers.findIndex(
    (otherPlayer) => otherPlayer.id === playerId
  );
  const prevOtherPlayerCardDatas =
    prevFlipCardDatas.otherPlayersCards[peggerIndex];

  let newOtherPlayerCardDatas = newFlipCardDatas.otherPlayersCards[peggerIndex];

  let done = false;
  newOtherPlayerCardDatas = newOtherPlayerCardDatas.map((cardData, i) => {
    if (
      !done &&
      prevOtherPlayerCardDatas[i].state === FlipCardState.OtherPlayersHand
    ) {
      done = true;
      const newCardData = { ...cardData };
      ensurePeggingState(newCardData);
      newCardData.playingCard = peggedPlayingCard;

      moveToPeggingPositionAnimationSequence.unshift({
        flip: true,
        duration: flipDuration,
      } as FlipAnimation);

      newCardData.animationSequence = moveToPeggingPositionAnimationSequence;
      return newCardData;
    }
    return cardData;
  });

  const newOtherPlayersCards = newFlipCardDatas.otherPlayersCards.map(
    (otherPlayerCards, i) => {
      if (i === peggerIndex) {
        return newOtherPlayerCardDatas;
      }
      return otherPlayerCards;
    }
  );
  newFlipCardDatas.otherPlayersCards = newOtherPlayersCards;
};

const performPegging = (
  turnedOver:boolean,
  prevFlipCardDatas:FlipCardDatas,

  peggedCard:PeggedCard,// are these the same
  peggedPlayingCard:PlayingCard,
  
  pegScoring:Score[],
  peggingPositions:PeggingPositions,
  playerId:string, // need this if supply the peggedCard
  myMatch:MyMatch,
  setCribBoardState:SetCribboardState,
  enqueueSnackbar:EnqueueSnackbar,
  onComplete:() => void
) => {
  const newFlipCardDatas = turnedOver
      ? setTurnedOver(prevFlipCardDatas)
      : { ...prevFlipCardDatas };

    const [moveToPeggingPositionAnimationSequence, pegDuration] =
      getMoveToPeggingPositionAnimationSequenceAndScore(
        getPeggedCardPositionIndex(prevFlipCardDatas),
        peggingPositions.inPlay,
        pegScoring,
        peggedCard,
        discardDuration,
        myMatch.gameState,
        setCribBoardState,
        enqueueSnackbar,
        onComplete
      );

    let pegDelay = pegDuration;
    const isMe = myMatch.myId === playerId;
    if (isMe) {
      iPegged(
        newFlipCardDatas,
        moveToPeggingPositionAnimationSequence,
        peggedPlayingCard
      );
    } else {
      pegDelay += flipDuration;
      otherPlayerPegged(
        prevFlipCardDatas,
        newFlipCardDatas,
        flipDuration,
        moveToPeggingPositionAnimationSequence,
        peggedPlayingCard,
        playerId,
        myMatch.otherPlayers
      );
    }

    if (turnedOver) {
      addTurnOverTogetherAnimation(
        prevFlipCardDatas,
        newFlipCardDatas,
        pegDelay,
        onComplete,
        myMatch,
        peggingPositions,
        discardDuration,
        flipDuration
      );
    }
    return {
      pegDelay,
      newFlipCardDatas
    }
}

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
  playerId: string,// don't need this
  peggedPlayingCard: PlayingCard, // don't need this
  getPositions: () => Positions,
  allowPegging: () => void,
  setNextPlayer: (nextPlayer: string) => void,

  enqueueSnackbar: EnqueueSnackbar,
  delayEnqueueSnackbar: DelayEnqueueSnackbar,

  setCribBoardState: SetCribboardState
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
    const pegShowScoring = splitPeggingShowScores(
      peggedCard,
      myMatch.showScoring,
      myMatch.scores,
      myMatch.myId,
      myMatch.otherPlayers
    );

    const turnedOver = getTurnedOver(peggedCard, myMatch);

    const onComplete = createOnComplete(
      turnedOver || myMatch.gameState === CribGameState.Show,
      animationCompleteCallback
    );

    const {pegDelay,newFlipCardDatas} = performPegging(
      turnedOver,
      prevFlipCardDatas,
      peggedCard,
      peggedPlayingCard,
      pegShowScoring.shift() as Score[],
      positions.peggingPositions,
      playerId,
      myMatch,
      setCribBoardState,
      enqueueSnackbar,
      onComplete
    )

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
        },
        pegShowScoring,
        myMatch,
        positions.playerPositions,
        setCribBoardState,
        delayEnqueueSnackbar
      );
    }

    return newFlipCardDatas;
  };
  return animationProvider;
}
