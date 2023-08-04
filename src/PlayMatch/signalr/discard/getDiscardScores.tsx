import { CribGameState, MyMatch } from "../../../generatedTypes";

export function getDiscardScores(myMatch: MyMatch) {
  let scores = myMatch.scores;
  if (
    myMatch.gameState === CribGameState.MatchWon ||
    myMatch.gameState === CribGameState.GameWon
  ) {
    const winningScoreIndex = scores.findIndex(
      (score) => score.frontPeg === 0 && score.backPeg === 0
    );
    scores = [...scores];
    const winningScore = { ...scores[winningScoreIndex] };
    winningScore.games--;
    winningScore.frontPeg = 121;
    scores[winningScoreIndex] = winningScore;
  }
  return scores;
}
