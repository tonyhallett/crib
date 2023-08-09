import { MyMatch } from "../generatedTypes";
import { ReadyState } from "./PlayMatchTypes";
export function getReadyState(
  myMatch: MyMatch,
  meReadyClickHandler?: () => void
): ReadyState {
  return {
    gameState: myMatch.gameState,
    meReady: {
      id: myMatch.myId,
      ready: myMatch.myReady,
      readyClickHandler: meReadyClickHandler,
    },
    otherPlayersReady: myMatch.otherPlayers.map((otherPlayer) => {
      return {
        id: otherPlayer.id,
        ready: otherPlayer.ready,
      };
    }),
  };
}
