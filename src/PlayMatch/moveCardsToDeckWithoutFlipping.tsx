import { DeckPosition } from "./matchLayoutManager";
import { Duration, FlipCardData } from "./PlayMatchTypes";
import {
  createZIndexAnimationSegment,
  getMoveRotateSegment,
} from "./animationSegments";

export function moveCardsToDeckWithoutFlipping(
  cards: FlipCardData[],
  currentDeckCount: number,
  currentDeckPosition: DeckPosition,
  at: number,
  duration: number
): Duration {
  cards.forEach((boxCard) => {
    boxCard.animationSequence = [
      createZIndexAnimationSegment(currentDeckCount + 1, { at }),
      getMoveRotateSegment(
        currentDeckPosition.isHorizontal,
        currentDeckPosition.position,
        duration
      ),
    ];
  });
  return duration;
}
