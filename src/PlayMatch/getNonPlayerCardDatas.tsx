import { PlayingCard } from "../generatedTypes";
import { FlipCardData } from "./PlayMatch";
import { Box, Deck } from "./matchLayoutManager";

export function getNonPlayerCardDatas(
  box: Box,
  deck: Deck,
  cutCard: PlayingCard | undefined,
  numPlayers: number
): NonPlayerCardDatas {
  const requiresAdditionalBoxCard = numPlayers === 3;
  return {
    cutCard: {
      startFaceUp: !!cutCard,
      isHorizontal: deck.isHorizontal,
      position: deck.position,
      zIndex: 2,
      playingCard: cutCard,
    },
    additionalBoxCard: requiresAdditionalBoxCard
      ? {
          startFaceUp: false,
          isHorizontal: deck.isHorizontal,
          position: deck.position,
          zIndex: 1,
        }
      : undefined,
    bottomDeckCard: {
      startFaceUp: false,
      isHorizontal: deck.isHorizontal,
      position: deck.position,
      zIndex: 0,
    },
  };
}

interface NonPlayerCardDatas {
  cutCard: FlipCardData;
  additionalBoxCard: FlipCardData | undefined;
  bottomDeckCard: FlipCardData;
}
