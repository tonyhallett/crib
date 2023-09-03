/* eslint-disable no-case-declarations */
import { useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { GridCellPosition, WordPosition } from "./WordSearch";
import { getState } from "./getState";
import { wordSearch } from "./demoWordSearch";
import { guessedWord } from "./guessedWord";

export interface GuessedCell {
  isSelected: boolean;
  isGuessed: boolean;
  letter: string;
}

export interface GuessedWord extends WordPosition{
  word: string;
  isGuessed: boolean;
}

export function findWord(guessedWords:GuessedWord[],wordStart:GridCellPosition, wordEnd:GridCellPosition) : GuessedWord | undefined {
  return  guessedWords.find(
    (word) => word.start.row === wordStart.row && word.start.col === wordStart.col && word.end.row === wordEnd.row && word.end.col === wordEnd.col
  );
}

const [wordGridData,wordList] = getState(wordSearch);

function updateSelectedCell(wordGrid:GuessedCell[][],row:number,col:number, isSelected:boolean) : GuessedCell[][] {
  return wordGrid.map((gridRow, rowIndex) => gridRow.map((cell, cellIndex) => {
    if(rowIndex === row && cellIndex === col){
      return {
        ...cell,
        isSelected,
      } 
    }
    return cell;
  }));
}

export function clickedLetter(
  row: number, 
  col: number,
  wordGrid:GuessedCell[][],
  setWordGrid:React.Dispatch<React.SetStateAction<GuessedCell[][]>>,
  guessedWords:GuessedWord[],
  setGuessedWords:React.Dispatch<React.SetStateAction<GuessedWord[]>>,
  firstSelectedCell:GridCellPosition|undefined,
  setFirstSelectedCell:React.Dispatch<React.SetStateAction<GridCellPosition | undefined>>,
  ){
    if (firstSelectedCell === undefined) {
      setFirstSelectedCell({ row, col });
      const newWordGrid = updateSelectedCell(wordGrid,row,col,true);
      setWordGrid(newWordGrid);
    } else {
      const wordEnd = { row: row, col: col };

      const matchingWord = findWord(guessedWords,firstSelectedCell, wordEnd);

      if (matchingWord) {
        guessedWord(matchingWord, firstSelectedCell, wordEnd, wordGrid, setWordGrid, guessedWords, setGuessedWords);
      } else {
        const newWordGrid = updateSelectedCell(wordGrid, firstSelectedCell.row,firstSelectedCell.col, false);
        setWordGrid(newWordGrid);
      }
      // Reset the first selected cell
      setFirstSelectedCell(undefined);
    }
}

export const WordGrid = () => {
  const [wordGrid, setWordGrid] = useState(wordGridData);
  const [guessedWords, setGuessedWords] = useState(wordList);
  const [firstSelectedCell, setFirstSelectedCell] = useState<GridCellPosition|undefined>();

  const handleLetterClick = (row: number, col: number) => {
    clickedLetter(row,col,wordGrid,setWordGrid,guessedWords,setGuessedWords,firstSelectedCell,setFirstSelectedCell);
  };

  return (
    <>
      <Grid container spacing={1} justifyContent="center">
        {wordGrid.map((row, rowIndex) => (
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
      {guessedWords.map((guessedWord, index) => {
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
