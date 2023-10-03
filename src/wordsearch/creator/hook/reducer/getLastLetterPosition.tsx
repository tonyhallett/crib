import {
  GridCellPositionAndLetter,
  getLetterPositions,
} from "../getLetterPositions";
import { PositionedWord } from "./state-types";

export function getLastLetterPosition(
  word: PositionedWord
): GridCellPositionAndLetter {
  const letterPositions = getLetterPositions(word);
  return letterPositions[letterPositions.length - 1];
}
