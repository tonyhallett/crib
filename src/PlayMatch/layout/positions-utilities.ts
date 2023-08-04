import { MyMatch } from "../../generatedTypes";
import { getPlayerPositions } from "../getPlayerPositions";
import { Positions } from "./matchLayoutManager";

export function getBoxPosition(myMatch: MyMatch, positions: Positions) {
  const playerPositions = getPlayerPositions(
    myMatch.myId,
    myMatch.dealerDetails.current,
    positions.playerPositions,
    myMatch.otherPlayers
  );
  return playerPositions.box;
}

export function getDeckPosition(myMatch: MyMatch, positions: Positions) {
  const playerPositions = getPlayerPositions(
    myMatch.myId,
    myMatch.dealerDetails.current,
    positions.playerPositions,
    myMatch.otherPlayers
  );

  return playerPositions.deck;
}
