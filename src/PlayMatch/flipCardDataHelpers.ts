import { FlipCardData, FlipCardDatas, FlipCardState } from "./PlayMatchTypes";

const numCardsInState = (flipCards: FlipCardData[], state: FlipCardState) => {
  return flipCards.filter((cardData) => cardData.state === state).length;
};

export const numPeggingInPlayCards = (flipCards: FlipCardData[]) => {
  return numCardsInState(flipCards, FlipCardState.PeggingInPlay);
};

export const setPlayableCardsState = (
  flipCardDatas: FlipCardDatas,
  flipCardState: FlipCardState
): FlipCardDatas => {
  const newFlipCardDatas = { ...flipCardDatas };
  newFlipCardDatas.myCards = newFlipCardDatas.myCards.map((cardData) => {
    return {
      ...cardData,
      state: flipCardState,
    };
  });
  newFlipCardDatas.otherPlayersCards = newFlipCardDatas.otherPlayersCards.map(
    (otherPlayerCards) => {
      return otherPlayerCards.map((otherPlayerCard) => {
        return {
          ...otherPlayerCard,
          state: flipCardState,
        };
      });
    }
  );
  return newFlipCardDatas;
};
