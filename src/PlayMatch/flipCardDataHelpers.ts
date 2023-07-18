import { FlipCardData, FlipCardState } from "./PlayMatch";

const numCardsInState = (flipCards: FlipCardData[], state: FlipCardState) => {
  return flipCards.filter((cardData) => cardData.state === state).length;
};

export const numPeggingInPlayCards = (flipCards: FlipCardData[]) => {
  return numCardsInState(flipCards, FlipCardState.PeggingInPlay);
};
