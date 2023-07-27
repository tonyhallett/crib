import { GuessedWord } from "./types";

const numIncorrectGuessesGameOver = 6;
export function incorrectGuessesGameOver(numIncorrectGuesses: number) {
  return numIncorrectGuesses === numIncorrectGuessesGameOver;
}

export enum GamePlayState {
  PLAYING = "Playing",
  WON = "Won",
  LOST = "Lost",
}

export interface GameState {
  incorrectGuesses: string[];
  correctGuesses: string[];
  playState: GamePlayState;
}

export const getCorrectlyGuessed = (word: string, guessedLetters: string[]) => {
  for (let i = 0; i < word.length; i++) {
    if (!guessedLetters.includes(word[i])) {
      return false;
    }
  }
  return true;
};

export function getIncorrectGuesses(
  word: string,
  guessedLetters: string[]
): string[] {
  const incorrectGuesses: string[] = [];
  guessedLetters.forEach((letter) => {
    if (!word.includes(letter)) {
      incorrectGuesses.push(letter);
    }
  });
  return incorrectGuesses;
}

export function getGameState(guessedWord: GuessedWord): GameState {
  const incorrectGuesses = getIncorrectGuesses(
    guessedWord.word,
    guessedWord.guessedLetters
  );
  const correctGuesses = guessedWord.guessedLetters.filter(
    (letter) => !incorrectGuesses.includes(letter)
  );
  const gameState: GameState = {
    incorrectGuesses,
    correctGuesses,
    playState: GamePlayState.PLAYING,
  };
  if (getCorrectlyGuessed(guessedWord.word, guessedWord.guessedLetters)) {
    gameState.playState = GamePlayState.WON;
  }
  if (incorrectGuessesGameOver(incorrectGuesses.length)) {
    gameState.playState = GamePlayState.LOST;
  }
  return gameState;
}
