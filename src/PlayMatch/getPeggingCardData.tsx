import { MyMatch, MyPegging, PlayingCard } from "../generatedTypes";
import {
  Box,
  DiscardPositions,
  PeggingPositions,
  PlayerPositions,
  Positions,
} from "./matchLayoutManager";
import { getDealerPositions } from "./getDealerPositions";
import { getNonPlayerCardDatas } from "./getNonPlayerCardDatas";
import { FlipCardData, FlipCardDatas, FlipCardState } from "./PlayMatch";
import { getMyHandCardDatas } from "./getMyHandCardDatas";
import { fill } from "../utilities/arrayHelpers";

interface PlayingCardWithIndex {
  index: number;
  playingCard: PlayingCard;
}

function getOtherPlayersPeggingCardDatas(
  otherPlayerId: string,
  playerPositions: PlayerPositions,
  box: Box,
  pegging: MyPegging,
  peggingPositions: PeggingPositions,
  numCardsInBox: number
): FlipCardData[] {
  const inPlayCardsWithIndex = pegging.inPlayCards
    .map((pc, i) => {
      if (pc.owner === otherPlayerId) {
        return {
          index: i,
          playingCard: pc.playingCard,
        };
      } else {
        return undefined;
      }
    })
    .filter((pcIndex) => pcIndex !== undefined) as PlayingCardWithIndex[];

  const turnedOverCardsWithIndex = pegging.turnedOverCards
    .map((pc, i) => {
      if (pc.owner === otherPlayerId) {
        return {
          index: i,
          playingCard: pc.playingCard,
        };
      } else {
        return undefined;
      }
    })
    .filter((pcIndex) => pcIndex !== undefined) as PlayingCardWithIndex[];

  const numCardsInHand =
    4 - inPlayCardsWithIndex.length - turnedOverCardsWithIndex.length;

  const otherPlayerCardDatas: FlipCardData[] = [];
  for (let i = 0; i < numCardsInHand; i++) {
    otherPlayerCardDatas.push({
      startFaceUp: false,
      isHorizontal: playerPositions.discard.isHorizontal,
      position: playerPositions.discard.positions[i],
      state: FlipCardState.Todo,
    });
  }

  inPlayCardsWithIndex.forEach((inPlayCardWithIndex) => {
    const cardData: FlipCardData = {
      startFaceUp: true,
      playingCard: inPlayCardWithIndex.playingCard,
      position: peggingPositions.inPlay[inPlayCardWithIndex.index],
      isHorizontal: false,
      zIndex: inPlayCardWithIndex.index,
      state: FlipCardState.PeggingInPlay,
    };
    otherPlayerCardDatas.push(cardData);
  });

  turnedOverCardsWithIndex.forEach((turnedOverCardWithIndex) => {
    const cardData: FlipCardData = {
      startFaceUp: false,
      playingCard: turnedOverCardWithIndex.playingCard,
      position: peggingPositions.turnedOver,
      isHorizontal: false,
      state: FlipCardState.PeggingTurnedOver,
    };
    otherPlayerCardDatas.push(cardData);
  });

  const boxCardDatas = fill(numCardsInBox, () => {
    return {
      startFaceUp: false,
      isHorizontal: box.isHorizontal,
      position: box.position,
      state: FlipCardState.Todo,
    };
  });
  return [...otherPlayerCardDatas, ...boxCardDatas];
}

function getMyPeggingCardDatas(
  match: MyMatch,
  discardPositions: DiscardPositions,
  box: Box,
  peggingPositions: PeggingPositions,
  numCardsInBox: number
): FlipCardData[] {
  const cardDatas = getMyHandCardDatas(discardPositions, match.myCards);

  // ging to have to think about card order....
  if (match.myCards.length < 4) {
    match.pegging.inPlayCards.forEach((inPlayCard, i) => {
      if (inPlayCard.owner === match.myId) {
        const inPlayCardData: FlipCardData = {
          startFaceUp: true,
          playingCard: inPlayCard.playingCard,
          position: peggingPositions.inPlay[i], // going to need zIndex ?!
          isHorizontal: false,
          zIndex: i,
          state: FlipCardState.PeggingInPlay,
        };
        cardDatas.push(inPlayCardData);
      }
    });
    match.pegging.turnedOverCards.forEach((turnedOverCard) => {
      if (turnedOverCard.owner === match.myId) {
        const turnedOverCardProps: FlipCardData = {
          startFaceUp: false,
          playingCard: turnedOverCard.playingCard,
          position: peggingPositions.turnedOver,
          isHorizontal: false,
          state: FlipCardState.PeggingTurnedOver,
        };
        cardDatas.push(turnedOverCardProps);
      }
    });
  }

  for (let i = 0; i < numCardsInBox; i++) {
    cardDatas.push({
      startFaceUp: false,
      position: box.position,
      isHorizontal: box.isHorizontal,
      state: FlipCardState.Todo,
    });
  }

  return cardDatas;
}

export function getPeggingCardDatas(
  match: MyMatch,
  positions: Positions
): FlipCardDatas {
  const playerPositions = positions.playerPositions;
  const numPlayers = match.otherPlayers.length + 1;
  const numPlayerCardsInBox = numPlayers === 3 ? 1 : 2;

  const dealerPositions = getDealerPositions(
    match.myId,
    match.dealerDetails.current,
    playerPositions,
    match.otherPlayers.map((op) => op.id)
  );

  const nonPlayerCardDatas = getNonPlayerCardDatas(
    dealerPositions.box,
    dealerPositions.deck,
    match.cutCard,
    numPlayers
  );

  const myCardDatas = getMyPeggingCardDatas(
    match,
    playerPositions[0].discard,
    dealerPositions.box,
    positions.peggingPositions,
    numPlayerCardsInBox
  );

  const otherPlayersCardDatas = match.otherPlayers.map((otherPlayer, i) => {
    return getOtherPlayersPeggingCardDatas(
      otherPlayer.id,
      playerPositions[i + 1],
      dealerPositions.box,
      match.pegging,
      positions.peggingPositions,
      numPlayerCardsInBox
    );
  });

  return {
    additionalBoxCard: nonPlayerCardDatas.additionalBoxCard,
    cutCard: nonPlayerCardDatas.cutCard,
    bottomDeckCard: nonPlayerCardDatas.bottomDeckCard,
    myCards: myCardDatas,
    otherPlayersCards: otherPlayersCardDatas,
  };
}
