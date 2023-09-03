import { GuessedWord, WordSearchState } from ".";
import { GridCellPosition } from "./WordSearch";
import { cellsGuessed } from "./cellsGuessed";

export function guessedWord(
  matchingWord: GuessedWord,
  wordEnd: GridCellPosition,
  state:WordSearchState
  ) {
  state.guessedWords = state.guessedWords.map((guessedWord) => {
    if (guessedWord.word === matchingWord.word) {
      return {
        ...guessedWord,
        isGuessed: true
      };
    }
    return guessedWord;
  });
  cellsGuessed(state, wordEnd);
}
