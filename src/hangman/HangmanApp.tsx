import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  TextField,
  DialogActions,
  Box,
  createTheme,
  ThemeProvider,
  CssBaseline,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  IconButton,
  Toolbar,
  styled,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Word, initialWords } from "./initialWords";
import SimpleKeyboard, { KeyboardOptions } from "react-simple-keyboard";
import HangmanSVG from "./HangmanSVG";
import "react-simple-keyboard/build/css/index.css";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";

const CenteredElement = (props: { children: React.ReactNode }) => {
  return (
    <Box display="flex" justifyContent="center">
      {props.children}
    </Box>
  );
};

function getIncorrectGuesses(word: string, guessedLetters: string[]): string[] {
  const incorrectGuesses: string[] = [];
  guessedLetters.forEach((letter) => {
    if (!word.includes(letter)) {
      incorrectGuesses.push(letter);
    }
  });
  return incorrectGuesses;
}

const getCorrectlyGuessed = (word: string, guessedLetters: string[]) => {
  for (let i = 0; i < word.length; i++) {
    if (!guessedLetters.includes(word[i])) {
      return false;
    }
  }
  return true;
};

const numIncorrectGuessesGameOver = 6;
function incorrectGuessesGameOver(numIncorrectGuesses: number) {
  return numIncorrectGuesses === 6;
}

interface GuessedWord {
  word: string;
  clue: string;
  guessedLetters: string[];
  // for simplicity could add state
}

enum GamePlayState {
  PLAYING,
  WON,
  LOST,
}

interface GameState {
  incorrectGuesses: string[];
  correctGuesses: string[];
  playState: GamePlayState;
}

const getGameState = (guessedWord: GuessedWord): GameState => {
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
};

declare module "@mui/material/styles" {
  interface Theme {
    guess: {
      success: string;
      failure: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    guess: {
      success: string;
      failure: string;
    };
  }
}

export const HangmanRoot = () => {
  const theme = createTheme({
    typography: {
      fontFamily: "Indie Flower, cursive",
    },
    guess: {
      success: "green",
      failure: "red",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HangmanApp />
    </ThemeProvider>
  );
};

const correctGuessClassName = "correctguess";
const incorrectGuessClassName = "incorrectguess";
const KeyboardWrapper = styled("div")(({ theme }) => {
  const guess = theme.guess;
  return {
    "& .hg-theme-default": {
      fontFamily: theme.typography.fontFamily,
    },
    "& .hg-button.incorrectguess": {
      backgroundColor: guess.failure,
    },
    "& .hg-button.correctguess": {
      backgroundColor: guess.success,
    },
  };
});

// eslint-disable-next-line complexity
type BottomNavigationValue = "Words" | "Options";
// eslint-disable-next-line complexity
const HangmanApp: React.FC = () => {
  const [guessedWords, setGuessedWords] = useState<GuessedWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [newWord, setNewWord] = useState<string>("");
  const [newClue, setNewClue] = useState<string>("");

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
    (newGuessedWord: GuessedWord) => {
      const newGuessedWords = guessedWords.map((guessedWord, index) => {
        if (index === currentWordIndex) {
          return newGuessedWord;
        }
        return guessedWord;
      });
      setGuessedWords(newGuessedWords);
    },
    [currentWordIndex, guessedWords]
  );
  // THIS USED GAMEOVER STATE - would be better to use calculated and disable the keyboard
  const handleGuess = useCallback(
    (letter: string) => {
      const guessedWord = guessedWords[currentWordIndex];
      if (!guessedWord.guessedLetters.includes(letter)) {
        const newGuessedWord: GuessedWord = {
          ...guessedWord,
          guessedLetters: [...guessedWord.guessedLetters, letter],
        };
        updateGuessedWord(newGuessedWord);
      }
    },
    [guessedWords, currentWordIndex, updateGuessedWord]
  );

  const resetGame = () => {
    setCurrentWordIndex((prevIndex) => {
      const newIndex =
        prevIndex === guessedWords.length - 1 ? 0 : prevIndex + 1;
      return newIndex;
    });
  };

  const tryAgain = () => {
    updateGuessedWord({
      ...guessedWords[currentWordIndex],
      guessedLetters: [],
    });
  };

  /* const handleWordSelection = (index: number) => {
    setCurrentWordIndex(index);
    resetGame();
  };

  const handleNewWord = () => {
    if (newWord.trim() && newClue.trim()) {
      const newWordObject: Word = {
        word: newWord.toUpperCase(),
        clue: newClue,
      };
      setGuessedWords([...words, newWordObject]);
      setOpenDialog(false);
      setNewWord("");
      setNewClue("");
    }
  }; */

  if (guessedWords.length === 0) {
    return null;
  }
  const guessedWord = guessedWords[currentWordIndex];
  const { correctGuesses, incorrectGuesses, playState } =
    getGameState(guessedWord);
  const gameOver = playState !== GamePlayState.PLAYING;
  const gameOverMessage =
    playState === GamePlayState.WON ? "You Won!" : `Unlucky - try again`;
  const keyboardHandler: KeyboardOptions["onKeyReleased"] = gameOver
    ? undefined
    : (input) => handleGuess(input);

  const correctGuessButtons = correctGuesses.join(" ");
  const incorrectGuessButtons = incorrectGuesses.join(" ");
  return (
    <div>
      <div>
        <CenteredElement>
          <Typography variant="h4">Jessica loves hangman!</Typography>
        </CenteredElement>
        <CenteredElement>
          <HangmanSVG guesses={incorrectGuesses.length} />
        </CenteredElement>
        <CenteredElement>
          <Typography variant="h4">Clue: {guessedWord.clue}</Typography>
        </CenteredElement>

        {/* Render the hangman word with horizontal lines */}
        <CenteredElement>
          <Typography variant="h4">
            {guessedWord.word.split(" ").map((wordPart, index) => (
              <span key={index}>
                {wordPart.split("").map((letter, letterIndex) => (
                  <span key={letterIndex} style={{ marginRight: "10px" }}>
                    {guessedWord.guessedLetters.includes(letter) ? letter : "_"}
                  </span>
                ))}
                {index < guessedWord.word.split(" ").length - 1 && " "}
              </span>
            ))}
          </Typography>
        </CenteredElement>
      </div>
      {gameOver && (
        <div>
          <Dialog open>
            <DialogActions>
              {playState === GamePlayState.LOST && (
                <Button variant="contained" onClick={tryAgain}>
                  Try Again ?
                </Button>
              )}
              <Button variant="contained" onClick={resetGame}>
                Next Word
              </Button>
            </DialogActions>
          </Dialog>
          <Typography variant="body1">{gameOverMessage}</Typography>

          {/* <Button variant="contained" onClick={() => setOpenDialog(true)}>
            Add New Word
          </Button> */}
        </div>
      )}
      {/* Render the filter and word selection UI */}
      <div>
        {/* <Typography variant="body1">Word Selection:</Typography>
        {words.map((word, index) => (
          <Button
            key={index}
            onClick={() => handleWordSelection(index)}
            variant="outlined"
          >
            {word.word}
          </Button>
        ))}
        */}
        {/* <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Add New Word</DialogTitle>
          <div style={{ padding: "16px" }}>
            <TextField
              label="Word"
              variant="outlined"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              fullWidth
            />
            <TextField
              label="Clue"
              variant="outlined"
              value={newClue}
              onChange={(e) => setNewClue(e.target.value)}
              fullWidth
              style={{ marginTop: "16px" }}
            />
          </div>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleNewWord} color="primary">
              Add
            </Button>
          </DialogActions>
        </Dialog> */}
      </div>
      {/* Render the keyboard */}
      <div>
        <KeyboardWrapper>
          <SimpleKeyboard
            onKeyReleased={keyboardHandler}
            layout={{
              default: [
                "Q W E R T Y U I O P",
                "A S D F G H J K L",
                "Z X C V B N M",
              ],
            }}
            buttonTheme={[
              {
                class: correctGuessClassName,
                buttons: correctGuessButtons,
              },
              {
                class: incorrectGuessClassName,
                buttons: incorrectGuessButtons,
              },
            ]}
          />
        </KeyboardWrapper>
      </div>
      <AppBar position="fixed" color="primary" sx={{ top: "auto", bottom: 0 }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="edit words">
            <EditIcon />
          </IconButton>
          <IconButton color="inherit" aria-label="settings">
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default HangmanApp;
