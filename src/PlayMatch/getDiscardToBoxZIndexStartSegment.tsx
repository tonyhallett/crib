import { MyMatch } from "../generatedTypes";
import { createZIndexAnimationSegment } from "./animationSegments";

export function getNumCardsAlreadyDiscarded(
  myMatch: MyMatch,
  numDiscards: number
) {
  const numOtherPlayersDiscarded = myMatch.otherPlayers.filter(
    (otherPlayer) => otherPlayer.discarded
  ).length;
  const numPlayersDiscarded =
    numOtherPlayersDiscarded + (myMatch.myCards.length === 4 ? 1 : 0);
  return (numPlayersDiscarded - 1) * numDiscards;
}
export function getDiscardToBoxZIndexStartSegment(
  myMatch: MyMatch,
  countDiscards: number
) {
  const numDiscards = myMatch.otherPlayers.length + 1 === 2 ? 2 : 1;
  const numCardsAlreadyDiscarded = getNumCardsAlreadyDiscarded(
    myMatch,
    numDiscards
  );
  return createDiscardZIndexAnimationSegment(
    numCardsAlreadyDiscarded + countDiscards
  );
}

export function createDiscardZIndexAnimationSegment(discardNumber: number) {
  return createZIndexAnimationSegment(5 + discardNumber, {});
}
