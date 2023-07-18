import { MyPegging } from "../generatedTypes";
import { arrayLast } from "../utilities/arrayHelpers";
import { FlipCardDatas } from "./PlayMatch";
import { numPeggingInPlayCards } from "./flipCardDataHelpers";

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
