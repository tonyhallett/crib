import { OrientationChangedAction } from "./actions";
import { getWordById, updateWord, updateWordGridForWordChange } from "./common";
import {
  Orientation,
  PositionedWord,
  WordSearchCreatorState,
} from "./state-types";

export function updateWordOrientation(
  words: PositionedWord[],
  wordId: number,
  newOrientation: Orientation
): PositionedWord[] {
  return updateWord(words, wordId, (word) => ({
    ...word,
    orientation: newOrientation,
  }));
}

export function orientationChangedReducer(
  state: WordSearchCreatorState,
  action: OrientationChangedAction
): WordSearchCreatorState {
  const currentWord = getWordById(state.words, state.selectedWordId);
  const newWords = updateWordOrientation(
    state.words,
    state.selectedWordId,
    action.orientation
  );
  const newWord = getWordById(newWords, state.selectedWordId);
  const newWordGrid = updateWordGridForWordChange(
    currentWord,
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
