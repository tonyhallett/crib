import { PlayingCard } from "../generatedTypes";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getPlayingCardString(playingCard: PlayingCard | undefined) {
  if (playingCard) {
    return `${playingCard.pips} of ${playingCard.suit}`;
  }
  return "";
}
