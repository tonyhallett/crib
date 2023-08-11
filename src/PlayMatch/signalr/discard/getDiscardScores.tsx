import { CribGameState, MyMatch, Score } from "../../../generatedTypes";

export function getWinningScoreIndex(scores: Score[]) {
  return scores.findIndex(
    (score) => score.frontPeg === 0 && score.backPeg === 0
  );
}
export function getDiscardScores(myMatch: MyMatch) {
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
