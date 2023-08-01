/* eslint-disable no-case-declarations */
import React, { useState } from 'react';
import { Grid, Paper, Typography } from '@mui/material';

// Define the GuessedCell interface
interface GuessedCell {
  isSelected: boolean;
  isGuessed: boolean;
  letter: string;
}

// Define the GuessedWord interface
interface GuessedWord {
  word: string;
  isGuessed: boolean;
}

const wordGridData: GuessedCell[][] = [
  // Fill in your word grid data with GuessedCell objects
  [
    { isSelected: false, isGuessed: false, letter: 'R' },
    { isSelected: false, isGuessed: false, letter: 'E' },
    { isSelected: false, isGuessed: false, letter: 'A' },
    { isSelected: false, isGuessed: false, letter: 'C' },
    { isSelected: false, isGuessed: false, letter: 'T' },
    { isSelected: false, isGuessed: false, letter: 'L' },
    { isSelected: false, isGuessed: false, letter: 'I' },
    { isSelected: false, isGuessed: false, letter: 'B' },
  ],
  [
    { isSelected: false, isGuessed: false, letter: 'O' },
    { isSelected: false, isGuessed: false, letter: 'G' },
    { isSelected: false, isGuessed: false, letter: 'P' },
    { isSelected: false, isGuessed: false, letter: 'T' },
    { isSelected: false, isGuessed: false, letter: 'S' },
    { isSelected: false, isGuessed: false, letter: 'T' },
    { isSelected: false, isGuessed: false, letter: 'A' },
    { isSelected: false, isGuessed: false, letter: 'R' },
  ],
  [
    { isSelected: false, isGuessed: false, letter: 'L' },
    { isSelected: false, isGuessed: false, letter: 'O' },
    { isSelected: false, isGuessed: false, letter: 'S' },
    { isSelected: false, isGuessed: false, letter: 'D' },
    { isSelected: false, isGuessed: false, letter: 'O' },
    { isSelected: false, isGuessed: false, letter: 'C' },
    { isSelected: false, isGuessed: false, letter: 'I' },
    { isSelected: false, isGuessed: false, letter: 'M' },
  ],
  [
    { isSelected: false, isGuessed: false, letter: 'M' },
    { isSelected: false, isGuessed: false, letter: 'O' },
    { isSelected: false, isGuessed: false, letter: 'B' },
    { isSelected: false, isGuessed: false, letter: 'I' },
    { isSelected: false, isGuessed: false, letter: 'L' },
    { isSelected: false, isGuessed: false, letter: 'E' },
    { isSelected: false, isGuessed: false, letter: 'T' },
    { isSelected: false, isGuessed: false, letter: 'S' },
  ],
  [
    { isSelected: false, isGuessed: false, letter: 'O' },
    { isSelected: false, isGuessed: false, letter: 'A' },
    { isSelected: false, isGuessed: false, letter: 'R' },
    { isSelected: false, isGuessed: false, letter: 'E' },
    { isSelected: false, isGuessed: false, letter: 'L' },
    { isSelected: false, isGuessed: false, letter: 'I' },
    { isSelected: false, isGuessed: false, letter: 'P' },
    { isSelected: false, isGuessed: false, letter: 'M' },
  ],
  [
    { isSelected: false, isGuessed: false, letter: 'B' },
    { isSelected: false, isGuessed: false, letter: 'L' },
    { isSelected: false, isGuessed: false, letter: 'A' },
    { isSelected: false, isGuessed: false, letter: 'N' },
    { isSelected: false, isGuessed: false, letter: 'K' },
    { isSelected: false, isGuessed: false, letter: 'E' },
    { isSelected: false, isGuessed: false, letter: 'T' },
    { isSelected: false, isGuessed: false, letter: 'S' },
  ],
  [
    { isSelected: false, isGuessed: false, letter: 'R' },
    { isSelected: false, isGuessed: false, letter: 'S' },
    { isSelected: false, isGuessed: false, letter: 'T' },
    { isSelected: false, isGuessed: false, letter: 'E' },
    { isSelected: false, isGuessed: false, letter: 'A' },
    { isSelected: false, isGuessed: false, letter: 'R' },
    { isSelected: false, isGuessed: false, letter: 'C' },
    { isSelected: false, isGuessed: false, letter: 'S' },
  ],
  [
    { isSelected: false, isGuessed: false, letter: 'D' },
    { isSelected: false, isGuessed: false, letter: 'S' },
    { isSelected: false, isGuessed: false, letter: 'E' },
    { isSelected: false, isGuessed: false, letter: 'S' },
    { isSelected: false, isGuessed: false, letter: 'E' },
    { isSelected: false, isGuessed: false, letter: 'R' },
    { isSelected: false, isGuessed: false, letter: 'P' },
    { isSelected: false, isGuessed: false, letter: 'O' },
  ],

];

const wordList: GuessedWord[] = [
    { word: 'REACT', isGuessed: false },
    { word: 'WORDSEARCH', isGuessed: false },
    { word: 'MOBILE', isGuessed: false },
    { word: 'GPT3', isGuessed: false },
];

export const WordGrid = () => {
  const [wordGrid, setWordGrid] = useState(wordGridData);
  const [guessedWords, setGuessedWords] = useState(wordList);
  const [firstSelectedCell, setFirstSelectedCell] = useState({ rowIndex: -1, colIndex: -1 });

  // eslint-disable-next-line complexity
  const markWordAsGuessed = (
    matchingWord: GuessedWord,
    wordStart: { row: number; col: number },
    wordEnd: { row: number; col: number },
    direction: string
  ) => {
    matchingWord.isGuessed = true;
    switch (direction) {
      case 'horizontal':
        for (let col = Math.min(wordStart.col, wordEnd.col); col <= Math.max(wordStart.col, wordEnd.col); col++) {
          wordGrid[wordStart.row][col].isGuessed = true;
          wordGrid[wordStart.row][col].isSelected = false;
        }
        break;
      case 'vertical':
        for (let row = Math.min(wordStart.row, wordEnd.row); row <= Math.max(wordStart.row, wordEnd.row); row++) {
          wordGrid[row][wordStart.col].isGuessed = true;
          wordGrid[row][wordStart.col].isSelected = false;
        }
        break;
      case 'diagonal':
        let row = wordStart.row;
        let col = wordStart.col;
        while (row !== wordEnd.row && col !== wordEnd.col) {
          wordGrid[row][col].isGuessed = true;
          wordGrid[row][col].isSelected = false;
          row += row < wordEnd.row ? 1 : -1;
          col += col < wordEnd.col ? 1 : -1;
        }
        wordGrid[wordEnd.row][wordEnd.col].isGuessed = true;
        wordGrid[wordEnd.row][wordEnd.col].isSelected = false;
        break;
      default:
        break;
    }
    setWordGrid([...wordGrid]);
    setGuessedWords([...guessedWords]);
  };
  
  const clearSelection = (wordStart: { row: number; col: number }, wordEnd: { row: number; col: number }) => {
    for (let row = Math.min(wordStart.row, wordEnd.row); row <= Math.max(wordStart.row, wordEnd.row); row++) {
      for (let col = Math.min(wordStart.col, wordEnd.col); col <= Math.max(wordStart.col, wordEnd.col); col++) {
        wordGrid[row][col].isSelected = false;
      }
    }
    setWordGrid([...wordGrid]);
  };

  // eslint-disable-next-line complexity
  const getFormedWord = (
    wordStart: { row: number; col: number },
    wordEnd: { row: number; col: number },
    direction: string
  ) => {
    let formedWord = '';
    switch (direction) {
      case 'horizontal':
        for (let col = Math.min(wordStart.col, wordEnd.col); col <= Math.max(wordStart.col, wordEnd.col); col++) {
          formedWord += wordGrid[wordStart.row][col].letter;
        }
        break;
      case 'vertical':
        for (let row = Math.min(wordStart.row, wordEnd.row); row <= Math.max(wordStart.row, wordEnd.row); row++) {
          formedWord += wordGrid[row][wordStart.col].letter;
        }
        break;
      case 'diagonal':
        const rowIncrement = wordStart.row < wordEnd.row ? 1 : -1;
        const colIncrement = wordStart.col < wordEnd.col ? 1 : -1;
        let row = wordStart.row;
        let col = wordStart.col;
        while (row !== wordEnd.row + rowIncrement && col !== wordEnd.col + colIncrement) {
          formedWord += wordGrid[row][col].letter;
          row += rowIncrement;
          col += colIncrement;
        }
        break;
      default:
        break;
    }
    return formedWord;
  };

  // eslint-disable-next-line complexity
  const handleLetterClick = (rowIndex: number, colIndex: number) => {
    const selectedCell = wordGrid[rowIndex][colIndex];

    if (firstSelectedCell.rowIndex === -1) {
      // If no cell is selected, select the clicked cell
      selectedCell.isSelected = true;
      setFirstSelectedCell({ rowIndex, colIndex });
      setWordGrid([...wordGrid]);
    } else {
      // If a cell is already selected, we need to form a word
      const wordStart = { row: firstSelectedCell.rowIndex, col: firstSelectedCell.colIndex };
      const wordEnd = { row: rowIndex, col: colIndex };
      const direction = getWordDirection(wordStart, wordEnd);

      // Extract the letters to form the word based on direction
      const formedWord = getFormedWord(wordStart, wordEnd, direction);
      const reversedFormedWord = formedWord.split('').reverse().join('');
      /* switch (direction) {
        case 'horizontal':
          for (let col = Math.min(wordStart.col, wordEnd.col); col <= Math.max(wordStart.col, wordEnd.col); col++) {
            formedWord += wordGrid[wordStart.row][col].letter;
          }
          break;
        case 'vertical':
          for (let row = Math.min(wordStart.row, wordEnd.row); row <= Math.max(wordStart.row, wordEnd.row); row++) {
            formedWord += wordGrid[row][wordStart.col].letter;
          }
          break;
        case 'diagonal':
          const rowIncrement = wordStart.row < wordEnd.row ? 1 : -1;
          const colIncrement = wordStart.col < wordEnd.col ? 1 : -1;
          let row = wordStart.row;
          let col = wordStart.col;
          while (row !== wordEnd.row + rowIncrement && col !== wordEnd.col + colIncrement) {
            formedWord += wordGrid[row][col].letter;
            row += rowIncrement;
            col += colIncrement;
          }
          break;
        default:
          break;
      } */

      // Check if the formed word matches any word in the word list
      const matchingWord = guessedWords.find((word) => word.word === formedWord || word.word === reversedFormedWord);


      if (matchingWord) {
        markWordAsGuessed(matchingWord, wordStart, wordEnd, direction);
        // If there is a match, mark the word as guessed and the cells as guessed
        /* matchingWord.isGuessed = true;
        for (let row = Math.min(wordStart.row, wordEnd.row); row <= Math.max(wordStart.row, wordEnd.row); row++) {
          for (let col = Math.min(wordStart.col, wordEnd.col); col <= Math.max(wordStart.col, wordEnd.col); col++) {
            wordGrid[row][col].isGuessed = true;
            wordGrid[row][col].isSelected = false;
          }
        }
        setWordGrid([...wordGrid]);
        setGuessedWords([...guessedWords]); */
      } else {
        // If no match, clear the selection
        /* for (let row = Math.min(wordStart.row, wordEnd.row); row <= Math.max(wordStart.row, wordEnd.row); row++) {
          for (let col = Math.min(wordStart.col, wordEnd.col); col <= Math.max(wordStart.col, wordEnd.col); col++) {
            wordGrid[row][col].isSelected = false;
          }
        }
        setWordGrid([...wordGrid]); */
        clearSelection(wordStart, wordEnd)
      }
      // Reset the first selected cell
      setFirstSelectedCell({ rowIndex: -1, colIndex: -1 });
    }
  };

  const getWordDirection = (start: { row: number; col: number }, end: { row: number; col: number }) => {
    // Determine the direction of the word based on start and end positions
    if (start.row === end.row) return 'horizontal';
    if (start.col === end.col) return 'vertical';
    if (Math.abs(end.row - start.row) === Math.abs(end.col - start.col)) return 'diagonal';
    return '';
  };

  return (
    <><Grid container spacing={1} justifyContent="center">
      {wordGrid.map((row, rowIndex) => (
        <Grid key={rowIndex} item container justifyContent="center" xs={12}>
          {row.map((cell, colIndex) => (
            <Grid key={colIndex} item>
              <Paper
                onClick={() => handleLetterClick(rowIndex, colIndex)}
                style={{
                  width: '40px', // Adjust this size
                  height: '40px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: cell.isSelected ? '#ff0000' : cell.isGuessed ? '#00ff00' : '#ffffff',
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
    {guessedWords.map((guessedWord, index)=> {
        return <Typography color={guessedWord.isGuessed ? "greenyellow" : "black"} key={index}>{guessedWord.word}</Typography>
    })}
    </>
  );
}