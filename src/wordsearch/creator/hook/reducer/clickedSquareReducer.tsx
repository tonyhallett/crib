import { ClickedSquareAction } from "./actions";
import { WordUpdate, updateWord, updateWordGridForWordChange } from "./common";
import { PositionedWord, WordSearchCreatorState } from "./state-types";

function clickedSquareAndSelectedWordReducer(
  state: WordSearchCreatorState,
  action: ClickedSquareAction
): WordSearchCreatorState {
  const words = state.words;
  const selectedWordIndex = words.findIndex(
    (word) => word.id === state.selectedWordId
  );
  const selectedWord = words[selectedWordIndex];
  const selectedWordStart = selectedWord.start;
  if (
    selectedWordStart.col !== action.col ||
    selectedWordStart.row !== action.row
  ) {
    return clickedDifferentStartingSquareReducer(state, action.row, action.col);
  }
  return state;
}

// although current ui does not use word start
function updateWordStart(
  words: PositionedWord[],
  wordId: number,
  newStart: { row: number; col: number }
): WordUpdate {
  return updateWord(words, wordId, (word) => ({ ...word, start: newStart }));
}

function clickedDifferentStartingSquareReducer(
  state: WordSearchCreatorState,
  startRow: number,
  startCol: number
): WordSearchCreatorState {
  const { newWords, newWord, oldWord } = updateWordStart(
    state.words,
    state.selectedWordId,
    {
      row: startRow,
      col: startCol,
    }
  );
  const newState: WordSearchCreatorState = {
    ...state,
    wordGrid: updateWordGridForWordChange(
      oldWord,
      newWord,
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
