import { MyMatch, OtherPlayer, PeggedCard, PlayingCard, Score } from "../../../generatedTypes";
import { PeggingPositions } from "../../matchLayoutManager";
import {
  addTurnOverTogetherAnimation, getMoveToPeggingPositionAnimationSequenceAndScore,
  setTurnedOver
} from "../../signalRPeg";
import { getPeggedCardPositionIndex } from "../../signalRPeg";
import { EnqueueSnackbar } from "notistack";
import { FlipCardData, FlipCardDatas, FlipCardState, SetCribboardState } from "../../PlayMatchTypes";
import { FlipCardAnimationSequence, FlipAnimation } from "../../../FlipCard/FlipCard";
import { cardMatch } from "../../playingCardUtilities";
import { discardDuration, flipDuration } from "../../animationDurations";

const ensurePeggingState = (cardData: FlipCardData) => {
  if (cardData.state !== FlipCardState.PeggingTurnedOver) {
    cardData.state = FlipCardState.PeggingInPlay;
  }
};

const iPegged = (
  newFlipCardDatas: FlipCardDatas,
  moveToPeggingPositionAnimationSequence: FlipCardAnimationSequence,
  peggedPlayingCard: PlayingCard
) => {
  const isPeggedPlayingCard = (cardData: FlipCardData) => {
    const playingCard = cardData.playingCard as PlayingCard;
    return cardMatch(playingCard, peggedPlayingCard);
  };
  // if my pegging selection adds an animation will need to remove
  const newMyFlipCardDatas = newFlipCardDatas.myCards.map((cardData) => {
    if (isPeggedPlayingCard(cardData)) {
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

export const otherPlayerPegged = (
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

export function performPegging(turnedOver: boolean,
  prevFlipCardDatas: FlipCardDatas,
  peggedCard: PeggedCard,
  pegScoring: Score[],
  peggingPositions: PeggingPositions,
  myMatch: MyMatch,
  setCribBoardState: SetCribboardState,
  enqueueSnackbar: EnqueueSnackbar,
  onComplete: () => void) {
  const peggedPlayingCard = peggedCard.playingCard;
  const playerId = peggedCard.owner;
  const newFlipCardDatas = turnedOver
    ? setTurnedOver(prevFlipCardDatas)
    : { ...prevFlipCardDatas };

  const [moveToPeggingPositionAnimationSequence, pegDuration] = getMoveToPeggingPositionAnimationSequenceAndScore(
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
  };
}
