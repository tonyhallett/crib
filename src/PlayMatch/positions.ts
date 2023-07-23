import { MyMatch } from "../generatedTypes";
import { getPlayerPositions } from "./getPlayerPositions";
import { Positions } from "./matchLayoutManager";

export function getBoxPosition(myMatch: MyMatch, positions: Positions) {
  const dealerPositions = getPlayerPositions(
    myMatch.myId,
    myMatch.dealerDetails.current,
    positions.playerPositions,
    myMatch.otherPlayers
  );
  return dealerPositions.box;
}
