import { MyMatch } from "../generatedTypes";
import { ReadyProps } from "./Ready";

export function getReadyState(myMatch:MyMatch, meReadyClickHandler?:() => void): ReadyProps {
    return {
        gameState:myMatch.gameState,
        meReady:{
            id:myMatch.myId,
            ready:myMatch.myReady,
            readyClickHandler:meReadyClickHandler
        },
        otherPlayersReady:myMatch.otherPlayers.map(otherPlayer => {
            return {
                id:otherPlayer.id,
                ready:otherPlayer.ready
            }
        })
    }
}