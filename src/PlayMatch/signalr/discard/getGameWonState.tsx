import { MyMatch } from "../../../generatedTypes";
import { getWinningScoreIndex } from "./getDiscardScores";
import { GameWonProps } from "../../GameWon";

export function getGameWonState(myMatch: MyMatch): GameWonProps {
  const scores = myMatch.scores;
  const winningScoreIndex = getWinningScoreIndex(scores);
  let winner = "You";
  if (winningScoreIndex !== 0) {
    const teamGame = myMatch.otherPlayers.length === 3;
    if (teamGame) {
      winner = "They";
    } else {
      winner = myMatch.otherPlayers[winningScoreIndex - 1].id;
    }
  }
  return {
    winner
  };

}
