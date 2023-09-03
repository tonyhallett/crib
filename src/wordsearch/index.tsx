/* eslint-disable no-case-declarations */
import { useReducer } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { GridCellPosition, WordPosition } from "./WordSearch";
import { getState } from "./getState";
import { wordSearch } from "./demoWordSearch";
import { wordGridReducer } from "./wordGridReducer";

export interface GuessedCell {
  isSelected: boolean;
  isGuessed: boolean;
  letter: string;
}

export interface GuessedWord extends WordPosition{
  word: string;
  isGuessed: boolean;
}

export interface WordSearchState{
  wordGrid: GuessedCell[][];
  guessedWords: GuessedWord[];
  firstSelectedCell: GridCellPosition | undefined;
}

const [wordGridData,wordList] = getState(wordSearch);

export const WordGrid = () => {
  const [state, dispatch] = useReducer(wordGridReducer, {
    wordGrid: wordGridData,
    guessedWords: wordList,
    firstSelectedCell: undefined,
  });

  const handleLetterClick = (row: number, col: number) => {
    dispatch({type:"letterClick",gridCellPosition:{row,col}});
  };

  return (
    <>
      <Grid container spacing={1} justifyContent="center">
        {state.wordGrid.map((row, rowIndex) => (
          <Grid key={rowIndex} item container justifyContent="center" xs={12}>
            {row.map((cell, colIndex) => (
              <Grid key={colIndex} item>
                <Paper
                  onClick={() => handleLetterClick(rowIndex, colIndex)}
                  style={{
                    width: "40px", // Adjust this size
                    height: "40px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: cell.isSelected
                      ? "#ff0000"
                      : cell.isGuessed
                      ? "#00ff00"
                      : "#ffffff",
                  }}
                  elevation={3}
                >
                  <Typography>{cell.letter}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
      {state.guessedWords.map((guessedWord, index) => {
        return (
          <Typography
            color={guessedWord.isGuessed ? "greenyellow" : "black"}
            key={index}
          >
            {guessedWord.word}
          </Typography>
        );
      })}
    </>
  );
};
