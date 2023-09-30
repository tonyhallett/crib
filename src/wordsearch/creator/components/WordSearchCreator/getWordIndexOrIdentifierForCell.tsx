import { GridCell, PositionedWord } from "../../hook/reducer/state-types";
import {
  CellIdentifier,
  getWordIdOrIdentifierForCell,
} from "./getWordIdOrIdentifierForCell";

interface WordIndex {
  index: number;
  isIndex: true;
}
interface WordIdentifier {
  cellIdentifier: CellIdentifier;
  isIndex: false;
}
type WordIndexOrIdentifier = WordIndex | WordIdentifier;
export function getWordIndexOrIdentifierForCell(
  cell: GridCell,
  words: PositionedWord[],
  selectedWordId: number
): WordIndexOrIdentifier {
  const { id, isWordId } = getWordIdOrIdentifierForCell(cell, selectedWordId);
  if (isWordId) {
    return {
      index: words.findIndex((word) => word.id === id),
      isIndex: true,
    };
  }
  return {
    cellIdentifier: id,
    isIndex: false,
  };
}

export function getWordById(id: number, words: PositionedWord[]) {
  return words.find((word) => word.id === id);
}
