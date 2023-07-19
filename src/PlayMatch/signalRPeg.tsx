import { MyPegging, PeggedCard, PlayingCard } from "../generatedTypes";
import { arrayLast } from "../utilities/arrayHelpers";
import { FlipCardDatas } from "./PlayMatch";
import { numPeggingInPlayCards } from "./flipCardDataHelpers";
import { getCardValue } from "./getCardValue";

// bottom first
export function getTurnOverOrder(turnedOverCards: PeggedCard[]) {
  const turnOverOrder: PeggedCard[] = [];
  let peggedCards: PeggedCard[] = [];
  let currentScore = 0;
  const turnOverTheCards = () => {
    peggedCards.reverse();
    turnOverOrder.push(...peggedCards);
    peggedCards = [];
  };
  for (let i = 0; i < turnedOverCards.length; i++) {
    const peggedCard = turnedOverCards[i];
    const cardValue = getCardValue(peggedCard.playingCard.pips);
    const newCurrentScore = currentScore + cardValue;
    if (newCurrentScore === 31) {
      currentScore = 0;
      peggedCards.push(peggedCard);
      turnOverTheCards();
    } else if (newCurrentScore > 31) {
      turnOverTheCards();

      currentScore = cardValue;
      peggedCards.push(peggedCard);
    } else {
      currentScore = newCurrentScore;
      peggedCards.push(peggedCard);
    }
  }
  if (peggedCards.length > 0) {
    turnOverTheCards();
  }
  return turnOverOrder;
}
export const getPeggedCardPositionIndex = (
  prevFlipCardDatas: FlipCardDatas
): number => {
  return (
    numPeggingInPlayCards(prevFlipCardDatas.myCards) +
    numPeggingInPlayCards(prevFlipCardDatas.otherPlayersCards.flat())
  );
};

export const getLastPeggedCard = (pegging: MyPegging) => {
  const cards =
    pegging.inPlayCards.length === 0
      ? pegging.turnedOverCards
      : pegging.inPlayCards;
  return arrayLast(cards);
};
