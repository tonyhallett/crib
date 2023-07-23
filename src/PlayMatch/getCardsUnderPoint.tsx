import { classNameFromPlayingCard } from "../FlipCard/FlipCard";
import { inBounds } from "./inBounds";
import { FlipCardData, FlipCardState } from "./PlayMatchTypes";

export function getCardsUnderPoint(
  flipCardDatas: FlipCardData[],
  x: number,
  y: number
) {
  return flipCardDatas.filter((cardData) => {
    if (cardData.playingCard === undefined) {
      return false;
    }
    const cardElements = document.getElementsByClassName(
      classNameFromPlayingCard(cardData.playingCard)
    );
    const cardElement = cardElements[0];
    const rect = cardElement.getBoundingClientRect();
    return inBounds(rect, x, y);
  });
}

export function getCardsUnderPointWithState(
  flipCardDatas: FlipCardData[],
  x: number,
  y: number,
  state: FlipCardState
) {
  const cardsUnderPoint = getCardsUnderPoint(flipCardDatas, x, y);
  return cardsUnderPoint.filter((cardData) => cardData.state === state);
}
