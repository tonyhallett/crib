import { OrientationChangedAction } from "./actions";
import { WordUpdate, updateWord, updateWordGridForWordChange } from "./common";
import {
  Orientation,
  PositionedWord,
  WordSearchCreatorState,
} from "./state-types";

export function updateWordOrientation(
  words: PositionedWord[],
  wordId: number,
  newOrientation: Orientation
): WordUpdate {
  return updateWord(words, wordId, (word) => ({
    ...word,
    orientation: newOrientation,
  }));
}

export function orientationChangedReducer(
  state: WordSearchCreatorState,
  action: OrientationChangedAction
): WordSearchCreatorState {
  const { newWords, newWord, oldWord } = updateWordOrientation(
    state.words,
    state.selectedWordId,
    action.orientation
  );
  const newWordGrid = updateWordGridForWordChange(
    oldWord,
    newWord,
    state.numRows,
    state.numColumns,
    state.wordGrid,
    state.fillWithRandomLetters
  );
  return {
    ...state,
    words: newWords,
    wordGrid: newWordGrid,
  };
}
