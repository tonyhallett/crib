import { cellsGuessed } from "./cellsGuessed";
import { GridCellPosition } from "../common-types";
import { GuessedWord, WordSearchState } from ".";

export function guessedWord(
  matchingWord: GuessedWord,
  wordEnd: GridCellPosition,
  state: WordSearchState
) {
  state.guessedWords = state.guessedWords.map((guessedWord) => {
    if (guessedWord.word === matchingWord.word) {
      return {
        ...guessedWord,
        isGuessed: true,
      };
    }
    return guessedWord;
  });
  cellsGuessed(state, wordEnd);
}
