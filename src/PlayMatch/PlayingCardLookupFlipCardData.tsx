import { PlayingCard } from "../generatedTypes";
import { FlipCardData } from "./PlayMatch";

export interface FlipCardDataLookup {
  [playingCard: string]: FlipCardData;
}

export class PlayingCardLookupFlipCardData {
  private lookup: FlipCardDataLookup = {};
  constructor(handAndCutCard: FlipCardData[]) {
    handAndCutCard.reduce<FlipCardDataLookup>((lookup, cardData) => {
      const playingCard = cardData.playingCard as PlayingCard;
      lookup[this.getKey(playingCard)] = cardData;

      return lookup;
    }, this.lookup);
  }
  private getKey(playingCard: PlayingCard) {
    return `${playingCard.pips}${playingCard.suit}`;
  }
  get(playingCard: PlayingCard): FlipCardData {
    return this.lookup[this.getKey(playingCard)];
  }
}
