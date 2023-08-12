import { CribGameState, MyMatch } from "../../generatedTypes";
import { getWinningScoreIndex } from "./getWinningScoreIndex";

export function getScoresBeforeWinReset(myMatch: MyMatch) {
  let scores = myMatch.scores;
  if (
    myMatch.gameState === CribGameState.MatchWon ||
    myMatch.gameState === CribGameState.GameWon
  ) {
    const winningScoreIndex = getWinningScoreIndex(scores);
    scores = [...scores];
    const winningScore = { ...scores[winningScoreIndex] };
    winningScore.games--;
    winningScore.frontPeg = 121;
    scores[winningScoreIndex] = winningScore;
  }
  return scores;
}
