import { Score } from "../generatedTypes";
import { ColouredScore, ColouredScores } from "../crib-board/CribBoard";
import { CSSProperties } from "react";

const colours: CSSProperties["color"][] = ["red", "blue", "green"];
export function getColouredScore(score: Score, index: number): ColouredScore {
  return {
    frontPeg: score.frontPeg,
    backPeg: score.backPeg,
    gameScore: score.games,
    colour: colours[index],
  };
}

export function getColouredScores(scores: Score[]): ColouredScores {
  return {
    pegger1: getColouredScore(scores[0], 0),
    pegger2: getColouredScore(scores[1], 1),
    pegger3: scores.length === 3 ? getColouredScore(scores[2], 2) : undefined,
  };
}
