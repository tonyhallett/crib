import { PlayingCard } from "../generatedTypes";
import { DiscardPositions } from "./layout/matchLayoutManager";
import { FlipCardData, FlipCardState } from "./PlayMatchTypes";

export function getMyHandCardDatas(
  discardPositions: DiscardPositions,
  myCards: PlayingCard[]
): FlipCardData[] {
  return myCards.map((myCard, index) => {
    const handCardData: FlipCardData = {
      startFaceUp: true,
      playingCard: myCard,
      position: discardPositions.positions[index],
      isHorizontal: false,
      state: FlipCardState.MyHand,
    };
    return handCardData;
  });
}
