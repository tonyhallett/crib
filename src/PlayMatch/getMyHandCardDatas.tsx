import { PlayingCard } from "../generatedTypes";
import { DiscardPositions } from "./matchLayoutManager";
import { FlipCardData } from "./PlayMatch";

export function getMyHandCardDatas(
  discardPositions: DiscardPositions,
  myCards: PlayingCard[]
): FlipCardData[] {
  return myCards.map((myCard, index) => {
    const handCardData: FlipCardData = {
      //owner: myId,
      //cardNumber: index,
      startFaceUp: true,
      playingCard: myCard,
      position: discardPositions.positions[index],
      isHorizontal: false,
    };
    return handCardData;
  });
}
