import { updateWordGridForWordChange } from "./common";
import {
  Orientation,
  PositionedWord,
  WordSearchCreatorState,
} from "./state-types";

export function nextWordId(words: WordSearchCreatorState["words"]): number {
  return words.reduce((maxId, word) => Math.max(maxId, word.id), 0) + 1;
}

export function newWordReducer(
  state: WordSearchCreatorState
): WordSearchCreatorState {
  const id = nextWordId(state.words);
  const newWord: PositionedWord = {
    id,
    word: "",
    orientation: Orientation.LeftToRight,
    start: { row: 0, col: 0 },
  };

  /*
  updateWordGridForWordChange(
      undefined,
      newWord,
      state.numRows,
      state.numColumns,
      state.wordGrid,
      state.fillWithRandomLetters
    ),
  */

  return {
    ...state,
    words: [newWord, ...state.words],
  };
}
