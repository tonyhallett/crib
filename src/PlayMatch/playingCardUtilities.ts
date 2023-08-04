import { PlayingCard } from "../generatedTypes";
import { Pips } from "../generatedTypes";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getPlayingCardString(playingCard: PlayingCard | undefined) {
  if (playingCard) {
    return `${playingCard.pips} of ${playingCard.suit}`;
  }
  return "";
}

export const cardMatch = (
  playingCard1: PlayingCard,
  playingCard2: PlayingCard
) => {
  return (
    playingCard1.suit === playingCard2.suit &&
    playingCard1.pips === playingCard2.pips
  );
};

// eslint-disable-next-line complexity
export const getCardValue = (pips: Pips) => {
  switch (pips) {
    case Pips.Ace:
      return 1;
    case Pips.Two:
      return 2;
    case Pips.Three:
      return 3;
    case Pips.Four:
      return 4;
    case Pips.Five:
      return 5;
    case Pips.Six:
      return 6;
    case Pips.Seven:
      return 7;
    case Pips.Eight:
      return 8;
    case Pips.Nine:
      return 9;
    case Pips.Ten:
    case Pips.Jack:
    case Pips.Queen:
    case Pips.King:
      return 10;
  }
};
