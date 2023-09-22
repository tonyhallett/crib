import { WordTextChangedAction } from "./actions";
import { updateWord, updateWordGridForWordChange } from "./common";
import { PositionedWord, WordSearchCreatorState } from "./state-types";

function removeDisallowedCharacters(word: string): string {
  return word.replace(/[^A-Z]/g, "");
}

export function updateWordText(
  words: PositionedWord[],
  wordId: number,
  newText: string
): PositionedWord[] {
  newText = removeDisallowedCharacters(newText.toUpperCase());
  return updateWord(words, wordId, (word) => ({ ...word, word: newText }))
    .newWords;
}

export function wordTextChangedReducer(
  state: WordSearchCreatorState,
  action: WordTextChangedAction
): WordSearchCreatorState {
  const wordId = state.words[action.wordIndex].id;
  const newWords = updateWordText(state.words, wordId, action.newText);
  const newWordGrid = updateWordGridForWordChange(
    state.words[action.wordIndex],
    newWords[action.wordIndex],
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
