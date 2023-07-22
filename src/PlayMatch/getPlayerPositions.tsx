import { OtherPlayer } from "../generatedTypes";
import { PlayerPositions } from "./matchLayoutManager";

export const getPlayerPositionIndex = (
  playerId: string,
  myId: string,
  otherPlayers: OtherPlayer[]
) => {
  return playerId === myId
    ? 0
    : otherPlayers.findIndex((otherPlayer) => otherPlayer.id === playerId) + 1;
};

export function getPlayerPositions(
  myId: string,
  playerId: string,
  allPlayerPositions: PlayerPositions[],
  otherPlayers: OtherPlayer[]
) {
  return allPlayerPositions[
    getPlayerPositionIndex(playerId, myId, otherPlayers)
  ];
}

export function getPlayerScoreIndex(
  player: string,
  myId: string,
  otherPlayers: OtherPlayer[],
  teamGame: boolean
) {
  let playerScoreIndex = getPlayerPositionIndex(player, myId, otherPlayers);
  if (teamGame && playerScoreIndex !== 0) {
    playerScoreIndex = 1;
  }
  return playerScoreIndex;
}