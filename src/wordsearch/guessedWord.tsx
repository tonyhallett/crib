import { GuessedWord, GuessedCell } from ".";
import { cellsGuessed } from "./cellsGuessed";

export function guessedWord(matchingWord: GuessedWord,
  wordStart: { row: number; col: number; },
  wordEnd: { row: number; col: number; },
  wordGrid: GuessedCell[][],
  setWordGrid: React.Dispatch<React.SetStateAction<GuessedCell[][]>>,
  guessedWords: GuessedWord[],
  setGuessedWords: React.Dispatch<React.SetStateAction<GuessedWord[]>>) {
  setGuessedWords(guessedWords.map((guessedWord) => {
    if (guessedWord.word === matchingWord.word) {
      return {
        ...guessedWord,
        isGuessed: true
      };
    }
    return guessedWord;
  }));
  cellsGuessed(wordGrid, setWordGrid, wordStart, wordEnd);
}
