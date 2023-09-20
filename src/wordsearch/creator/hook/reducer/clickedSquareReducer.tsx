import { ClickedSquareAction } from "./actions";
import { updateWord, updateWordGridForWordChange } from "./common";
import { PositionedWord, WordSearchCreatorState } from "./state-types";

function clickedSquareAndSelectedWordReducer(
  state: WordSearchCreatorState,
  action: ClickedSquareAction
): WordSearchCreatorState {
  const words = state.words;
  const selectedWordIndex = words.findIndex(
    (word) => word.id === state.selectedWordId
  );
  const word = words[selectedWordIndex];
  const currentWordStart = word.start;
  if (
    currentWordStart.col !== action.col ||
    currentWordStart.row !== action.row
  ) {
    return clickedDifferentStartingSquareReducer(
      word,
      selectedWordIndex,
      state,
      action
    );
  }
  return state;
}

// although current ui does not use word start
function updateWordStart(
  words: PositionedWord[],
  wordId: number,
  newStart: { row: number; col: number }
): PositionedWord[] {
  return updateWord(words, wordId, (word) => ({ ...word, start: newStart }));
}

function clickedDifferentStartingSquareReducer(
  word: PositionedWord,
  selectedWordIndex: number,
  state: WordSearchCreatorState,
  action: ClickedSquareAction
): WordSearchCreatorState {
  const newWords = updateWordStart(state.words, state.selectedWordId, {
    row: action.row,
    col: action.col,
  });
  const newState: WordSearchCreatorState = {
    ...state,
    wordGrid: updateWordGridForWordChange(
      word,
      newWords[selectedWordIndex],
      state.numRows,
      state.numColumns,
      state.wordGrid,
      state.fillWithRandomLetters
    ),
    words: newWords,
  };
  return newState;
}

export function clickedSquareReducer(
  state: WordSearchCreatorState,
  action: ClickedSquareAction
): WordSearchCreatorState {
  // could have multiple contexts....
  // if there is a selected word we are setting its starting point
  if (state.selectedWordId !== -1) {
    return clickedSquareAndSelectedWordReducer(state, action);
  }
  return state;
}
