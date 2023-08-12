import { Score } from "../../generatedTypes";

export function getWinningScoreIndex(scores: Score[]) {
  return scores.findIndex(
    (score) => score.frontPeg === 0 && score.backPeg === 0
  );
}
