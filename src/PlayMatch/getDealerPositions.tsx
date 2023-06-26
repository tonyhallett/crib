import { PlayerPositions } from "./matchLayoutManager";

export function getDealerPositions(
  myId: string,
  dealer: string,
  playerPositions: PlayerPositions[],
  orderedOtherPlayers: string[]
) {
  let dealerPositions: PlayerPositions;
  const dealerIsMe = dealer === myId;
  if (dealerIsMe) {
    dealerPositions = playerPositions[0];
  } else {
    const dealerPosition = orderedOtherPlayers.findIndex((op) => op === dealer);
    dealerPositions = playerPositions[dealerPosition + 1];
  }
  return dealerPositions;
}
