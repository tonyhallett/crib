import { getSelectedWord, updateWordGridForWordChange } from "./common";
import { WordSearchCreatorState } from "./state-types";

function getNewSelectedWordId(words: WordSearchCreatorState["words"]) {
  if(words.length === 0) {
    return -1;
  }
  return words[0].id;
}
export function deleteWordReducer(
  state: WordSearchCreatorState
): WordSearchCreatorState {
  const oldWord = getSelectedWord(state);
  const newWords = state.words.filter((word) => word.id !== oldWord.id);

  return {
    ...state,
    selectedWordId: getNewSelectedWordId(newWords),
    words: newWords,
    wordGrid: updateWordGridForWordChange(
      oldWord,
      undefined,
      state.numRows,
      state.numColumns,
      state.wordGrid,
      state.fillWithRandomLetters
    ),
  };
}
