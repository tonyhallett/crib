import { FlipCardData, FlipCardDatas, FlipCardState } from "./PlayMatchTypes";

const numCardsInState = (flipCards: FlipCardData[], state: FlipCardState) => {
  return flipCards.filter((cardData) => cardData.state === state).length;
};

export const numPeggingInPlayCards = (flipCards: FlipCardData[]) => {
  return numCardsInState(flipCards, FlipCardState.PeggingInPlay);
};

export const setPlayableCardsState = (
  flipCardDatas: FlipCardDatas,
  previousState: FlipCardState,
  flipCardState: FlipCardState
): FlipCardDatas => {
  const newFlipCardDatas = { ...flipCardDatas };
  newFlipCardDatas.myCards = newFlipCardDatas.myCards.map((cardData) => {
    if (cardData.state !== previousState) {
      return cardData;
    }
    return {
      ...cardData,
      state: flipCardState,
    };
  });
  newFlipCardDatas.otherPlayersCards = newFlipCardDatas.otherPlayersCards.map(
    (otherPlayerCards) => {
      return otherPlayerCards.map((otherPlayerCard) => {
        if (otherPlayerCard.state !== previousState) {
          return otherPlayerCard;
        }
        return {
          ...otherPlayerCard,
          state: flipCardState,
        };
      });
    }
  );
  return newFlipCardDatas;
};
