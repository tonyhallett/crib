import { Typography, AppBar, Toolbar } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { initialWords } from "./initialWords";
import HangmanSVG from "./HangmanSVG";
import "react-simple-keyboard/build/css/index.css";
import { CenteredElement } from "./CenteredElement";
import { CenteredClue } from "./CenteredClue";
import { Guess } from "./Guess";
import { useHangmanKeyboard } from "./HangmanKeyboard";
import { GameOverDialog } from "./GameOverDialog";
import { GamePlayState, getGameState } from "./getGameState";
import { GuessedWord } from "./types";
import { useSettingsDialog } from "./useSettingsDialog";
import { useNewWordDialog } from "./useNewWordDialog";
import { usePickWord } from "./usePickWord";

const getGuessedWord = (
  guessedWords: GuessedWord[],
  currentWordIndex: number
) => {
  let guessedWord: GuessedWord = {
    word: "",
    clue: "",
    guessedLetters: [],
  };
  if (guessedWords.length > 0) {
    guessedWord = guessedWords[currentWordIndex];
  }
  return guessedWord;
};

// eslint-disable-next-line complexity
export const HangmanApp: React.FC = () => {
  const [guessedWords, setGuessedWords] = useState<GuessedWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);

  useEffect(() => {
    const storedGuessedWords = localStorage.getItem("guessedWords");
    const storedCurrentWordIndex = localStorage.getItem("currentWordIndex");

    if (storedGuessedWords) {
      const parsedGuessedWords = JSON.parse(storedGuessedWords);
      setGuessedWords(parsedGuessedWords);
    } else {
      setGuessedWords(
        initialWords.map((initialWord) => {
          return {
            ...initialWord,
            guessedLetters: [],
          };
        })
      );
    }

    if (storedCurrentWordIndex) {
      setCurrentWordIndex(parseInt(storedCurrentWordIndex));
    }
  }, []);

  // Save the guessed letters and current word index to local storage on change
  useEffect(() => {
    const stringifiedGuessedWords = JSON.stringify(guessedWords);
    localStorage.setItem("guessedWords", stringifiedGuessedWords);
    localStorage.setItem("currentWordIndex", currentWordIndex.toString());
  }, [guessedWords, currentWordIndex]);

  const updateGuessedWord = useCallback(
    (newGuessedWord: GuessedWord, guessWordIndex: number) => {
      const newGuessedWords = guessedWords.map((guessedWord, index) => {
        if (index === guessWordIndex) {
          return newGuessedWord;
        }
        return guessedWord;
      });
      setGuessedWords(newGuessedWords);
    },
    [guessedWords]
  );

  const updateCurrentGuessedWord = useCallback(
    (newGuessedWord: GuessedWord) => {
      updateGuessedWord(newGuessedWord, currentWordIndex);
    },
    [currentWordIndex, updateGuessedWord]
  );

  const tryAgain = () => {
    updateCurrentGuessedWord({
      ...guessedWords[currentWordIndex],
      guessedLetters: [],
    });
  };

  const handleGuess = useCallback(
    (letter: string) => {
      const guessedWord = guessedWords[currentWordIndex];
      if (!guessedWord.guessedLetters.includes(letter)) {
        const newGuessedWord: GuessedWord = {
          ...guessedWord,
          guessedLetters: [...guessedWord.guessedLetters, letter],
        };
        updateCurrentGuessedWord(newGuessedWord);
      }
    },
    [guessedWords, currentWordIndex, updateCurrentGuessedWord]
  );

  const nextWord = () => {
    const getNextWordIndex = (prevIndex: number) => {
      return prevIndex === guessedWords.length - 1 ? 0 : prevIndex + 1;
    };

    setCurrentWordIndex((prevIndex) => {
      let count = 0;
      let nextGuessedWord: GuessedWord | undefined;
      let index = prevIndex;
      while (nextGuessedWord === undefined && count < guessedWords.length) {
        index = getNextWordIndex(index);
        const guessedWord = guessedWords[index];
        const { playState } = getGameState(guessedWord);
        if (playState === GamePlayState.PLAYING) {
          nextGuessedWord = guessedWord;
        }
        count++;
      }

      return index;
    });
  };

  const addNewWord = (newWord: string, newClue: string, andPlay: boolean) => {
    const newWordObject: GuessedWord = {
      word: newWord.trim().toUpperCase(),
      clue: newClue.trim(),
      guessedLetters: [],
    };
    setGuessedWords([...guessedWords, newWordObject]);

    if (andPlay) {
      setCurrentWordIndex(guessedWords.length);
    }
  };

  const guessedWord = getGuessedWord(guessedWords, currentWordIndex);

  const { correctGuesses, incorrectGuesses, playState } =
    getGameState(guessedWord);
  const gameOver = playState !== GamePlayState.PLAYING;

  const [isQwertyCheckbox, hangmanKeyboard] = useHangmanKeyboard({
    keyboardHandler: gameOver ? undefined : handleGuess,
    correctGuessButtons: correctGuesses.join(" "),
    incorrectGuessButtons: incorrectGuesses.join(" "),
  });

  const [settingsDialog, showSettingsButton] = useSettingsDialog({
    isQwertyCheckbox,
  });
  const [addNewWordDialog, showAddNewWordDialogButton] =
    useNewWordDialog(addNewWord);

  const [pickWordDialog, showPickWordDialogButton, openPickWordDialog] =
    usePickWord(guessedWords, (pickedWord, index) => {
      setCurrentWordIndex(index);
      updateGuessedWord(
        {
          ...pickedWord,
          guessedLetters: [],
        },
        index
      );
    });

  return (
    <div>
      <div>
        <CenteredElement>
          <Typography variant="h4">Jessica loves hangman!</Typography>
        </CenteredElement>
        <CenteredElement>
          <HangmanSVG guesses={incorrectGuesses.length} />
        </CenteredElement>
      </div>

      <GameOverDialog
        playState={playState}
        winMessage="You won !"
        loseMessage="Unlucky. Try again."
        tryAgain={tryAgain}
        nextWord={nextWord}
        pickNextWord={openPickWordDialog}
      />
      {pickWordDialog}
      {addNewWordDialog}
      {settingsDialog}

      <AppBar position="fixed" color="primary" sx={{ top: "auto", bottom: 0 }}>
        <CenteredElement>
          <Guess guessedWord={guessedWord} />
        </CenteredElement>
        <CenteredClue clue={guessedWord.clue} />
        {hangmanKeyboard}
        <Toolbar>
          {showAddNewWordDialogButton}
          {showSettingsButton}
          {showPickWordDialogButton}
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default HangmanApp;
