import {
  PositionedWordAndLetterState,
  WordSearchCreatorCalculatedState,
  WordSearchGrid,
} from "../../hook/reducer/state-types";

function gridHasLetters(wordGrid: WordSearchGrid): boolean {
  for (let row = 0; row < wordGrid.length; row++) {
    for (let col = 0; col < wordGrid[row].length; col++) {
      const cell = wordGrid[row][col];
      if (cell.contributingLetters.length === 0) {
        return false;
      }
    }
  }
  return true;
}

function wordsAreOk(words: PositionedWordAndLetterState[]): boolean {
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.letterStates.length; j++) {
      const letterState = word.letterStates[j].state;
      if (letterState !== "ok") {
        return false;
      }
    }
  }
  return true;
}

export function gridHasLettersAndOkState(
  wordGrid: WordSearchGrid,
  words: PositionedWordAndLetterState[]
): boolean {
  return gridHasLetters(wordGrid) && wordsAreOk(words);
}
export function canExport(state: WordSearchCreatorCalculatedState): boolean {
  const hasWordsWithLength =
    state.words.length > 0 && state.words.every((word) => word.word.length > 0);
  return (
    hasWordsWithLength && gridHasLettersAndOkState(state.wordGrid, state.words)
  );
}
