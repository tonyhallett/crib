import { MyMatch, OtherPlayer } from "../generatedTypes";
import {
  Box,
  DiscardPositions,
  PlayerPositions,
  Positions,
} from "./matchLayoutManager";
import { getDealerPositions } from "./getDealerPositions";
import { FlipCardData, FlipCardDatas, FlipCardState } from "./PlayMatch";
import { getNonPlayerCardDatas } from "./getNonPlayerCardDatas";
import { getMyHandCardDatas } from "./getMyHandCardDatas";

function getDiscardMyHandAndBoxCardDatas(
  match: MyMatch,
  discardPositions: DiscardPositions,
  box: Box
): FlipCardData[] {
  const discarded = match.myCards.length === 4;

  const cardDatas = getMyHandCardDatas(discardPositions, match.myCards);

  let numberOfBoxCards = 0;
  if (discarded) {
    numberOfBoxCards = match.otherPlayers.length === 1 ? 2 : 1;
    for (let i = 0; i < numberOfBoxCards; i++) {
      cardDatas.push({
        startFaceUp: false,
        position: box.position,
        isHorizontal: box.isHorizontal,
        state: FlipCardState.Todo,
      });
    }
  }
  return cardDatas;
}

function getOtherPlayerBoxCardDatas(
  box: Box,
  cardsInBox: number
): FlipCardData[] {
  const cardDatas: FlipCardData[] = [];
  for (let i = 0; i < cardsInBox; i++) {
    cardDatas.push({
      startFaceUp: false,
      isHorizontal: box.isHorizontal,
      position: box.position,
      state: FlipCardState.Todo,
    });
  }
  return cardDatas;
}

function getDiscardOtherPlayerCardDatas(
  otherPlayer: OtherPlayer,
  playerPositions: PlayerPositions,
  box: Box,
  numDiscards: 1 | 2
): FlipCardData[] {
  const cardDatas: FlipCardData[] = [];

  const cardsInHand = otherPlayer.discarded ? 4 : 4 + numDiscards;
  for (let i = 0; i < cardsInHand; i++) {
    cardDatas.push({
      startFaceUp: false,
      isHorizontal: playerPositions.discard.isHorizontal,
      position: playerPositions.discard.positions[i],
      state: FlipCardState.Todo,
    });
  }

  const cardsInBox = otherPlayer.discarded ? numDiscards : 0;
  const boxCardDatas = getOtherPlayerBoxCardDatas(box, cardsInBox);
  return [...cardDatas, ...boxCardDatas];
}

export function getDiscardCardDatas(
  match: MyMatch,
  positions: Positions
): FlipCardDatas {
  const playerPositions = positions.playerPositions;
  const numPlayers = match.otherPlayers.length + 1;
  // for cut card and box
  const dealerPositions = getDealerPositions(
    match.myId,
    match.dealerDetails.current,
    playerPositions,
    match.otherPlayers.map((op) => op.id)
  );
  const nonPlayerCardDatas = getNonPlayerCardDatas(
    dealerPositions.box,
    dealerPositions.deck,
    undefined,
    numPlayers
  );

  const myCardDatas = getDiscardMyHandAndBoxCardDatas(
    match,
    playerPositions[0].discard,
    dealerPositions.box
  );
  const numDiscards = numPlayers === 2 ? 2 : 1;
  const otherPlayersCardDatas = match.otherPlayers.map((otherPlayer, i) => {
    return getDiscardOtherPlayerCardDatas(
      otherPlayer,
      playerPositions[i + 1],
      dealerPositions.box,
      numDiscards
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
