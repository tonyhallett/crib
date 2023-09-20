import { GridCell, PositionedWord } from "../../hook/reducer/state-types";
import { getWordIdForCell } from "./getWordIdForCell";

export function getWordIndex(
  cell: GridCell,
  words: PositionedWord[],
  selectedWordId: number
) {
  const wordId = getWordIdForCell(cell, selectedWordId);
  if (wordId === -1) {
    return -1;
  }
  return words.findIndex((word) => word.id === wordId);
}
