import {
  Dialog,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useState } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { GuessDashes } from "./GuessDashes";
import { GamePlayState, getGameState } from "./getGameState";
import { GuessedWord } from "./types";

export function usePickWord(
  guessedWords: GuessedWord[],
  playWord: (word: GuessedWord, index: number) => void
) {
  const [openPickWordDialog, setOpenPickWordDialog] = useState<boolean>(false);
  return [
    <Dialog
      key="pickworddialog"
      open={openPickWordDialog}
      onClose={() => setOpenPickWordDialog(false)}
    >
      <DialogTitle>Pick New Word</DialogTitle>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Word</TableCell>
              <TableCell>Clue</TableCell>
              <TableCell>Guesses</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Play</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              // eslint-disable-next-line complexity
              guessedWords.map((guessedWord, index) => {
                //const isCurrentWord = index === currentWordIndex; - could use this
                const playState = getGameState(guessedWord).playState;
                const guessWordForDisplay =
                  playState === GamePlayState.PLAYING
                    ? guessedWord
                    : {
                        ...guessedWord,
                        guessedLetters: [],
                      };

                let state = playState.toString();
                if (playState === GamePlayState.PLAYING) {
                  if (guessedWord.guessedLetters.length === 0) {
                    state = "Available";
                  }
                }

                const stateColourLookup = {
                  Lost: "red",
                  Playing: "#32de84",
                  Won: "orange",
                  Available: "#4CBB17",
                };
                const guessDashesColour = (stateColourLookup as any)[state];

                const guessedLettersForDisplay =
                  playState === GamePlayState.PLAYING
                    ? guessedWord.guessedLetters.join(" ")
                    : "";
                return (
                  <TableRow key={guessedWord.word}>
                    <TableCell component="th" scope="row">
                      <GuessDashes guessedWord={guessWordForDisplay} />
                    </TableCell>
                    <TableCell>{guessedWord.clue}</TableCell>
                    <TableCell>{guessedLettersForDisplay}</TableCell>
                    <TableCell>
                      <div style={{ color: guessDashesColour }}>{state}</div>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          playWord(guessedWord, index);
                          /* setCurrentWordIndex(index);
                          updateGuessedWord(
                            {
                              ...guessedWord,
                              guessedLetters: [],
                            },
                            index
                          ); */
                          setOpenPickWordDialog(false);
                        }}
                        color="inherit"
                        aria-label={`play ${guessedWord.word}`}
                      >
                        <PlayArrowIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>
      </TableContainer>
    </Dialog>,
    <IconButton
      key="openPickWordDialogButton"
      onClick={() => setOpenPickWordDialog(true)}
      color="inherit"
      aria-label="settings"
    >
      <PlayArrowIcon />
    </IconButton>,
    () => {
      setOpenPickWordDialog(true);
    },
  ] as const;
}
