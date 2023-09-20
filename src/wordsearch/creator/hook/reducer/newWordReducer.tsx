import { updateWordGridForWordChange } from "./common";
import {
  Orientation,
  PositionedWord,
  WordSearchCreatorState,
} from "./state-types";

function nextWordId(words: WordSearchCreatorState["words"]): number {
  return words.reduce((maxId, word) => Math.max(maxId, word.id), 0) + 1;
}

export function newWordReducer(
  state: WordSearchCreatorState
): WordSearchCreatorState {
  const id = nextWordId(state.words);
  const fakeOldWord: PositionedWord = {
    id,
    word: "",
    orientation: Orientation.LeftToRight,
    start: { row: 0, col: 0 },
  };
  const newWord: PositionedWord = {
    id,
    word: "___",
    orientation: Orientation.LeftToRight,
    start: { row: 0, col: 0 },
  };

  return {
    ...state,
    words: [newWord, ...state.words],
    wordGrid: updateWordGridForWordChange(
      fakeOldWord,
      newWord,
      state.numRows,
      state.numColumns,
      state.wordGrid,
      state.fillWithRandomLetters
    ),
  };
}
