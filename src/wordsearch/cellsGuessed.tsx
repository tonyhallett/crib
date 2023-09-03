import { GridCellPosition } from "./WordSearch";
import { getDirection } from "./getDirection";
import { GuessedCell, WordSearchState } from ".";
import { minMax } from "./minMax";
import { generateDiagonals } from "./generateDiagonals";

const setGuessed = (guessedCell:GuessedCell) => {
  guessedCell.isGuessed = true;
  guessedCell.isSelected = false;
}

const horizontalCellsGuessed = (wordGrid:GuessedCell[][],wordStart:GridCellPosition,wordEnd:GridCellPosition) => {
  const {min,max} = minMax(wordStart.col,wordEnd.col);
  const columnInRange = (col:number) => col >= min && col <= max;
  return wordGrid.map((row, rowIndex) => {
    if (rowIndex === wordStart.row) {
      return row.map((cell, colIndex) => {
        if (columnInRange(colIndex)) {
          cell = {...cell};
          setGuessed(cell);
        }
        return cell;
      });
    }
    return row;
  });
}

const verticalCellsGuessed = (wordGrid:GuessedCell[][],wordStart:GridCellPosition,wordEnd:GridCellPosition) => {
  const {min,max} = minMax(wordStart.row,wordEnd.row);
  const rowInRange = (row:number) => row >= min && row <= max;
  return wordGrid.map((row, rowIndex) => {
    if(rowInRange(rowIndex)){
      return row.map((cell,colIndex) => {
        if(colIndex === wordStart.col){
          cell = {...cell};
          setGuessed(cell);
        }
        return cell;
      });
    }else{
      return row;
    }
  });
}

const diagonalCellsGuessed = (wordGrid:GuessedCell[][],wordStart:GridCellPosition,wordEnd:GridCellPosition) => {
  const {min: minRow,max: maxRow} = minMax(wordStart.row,wordEnd.row);
  const rowInRange = (row:number) => row >= minRow && row <= maxRow;

  const diagonals:GridCellPosition[] = [];
  generateDiagonals(wordStart,wordEnd,(row,col) => {
    diagonals.push({row,col});
  });
  
  const cellOnDiagonal = (col:number, row:number) => {
    return diagonals.some((diagonal) => diagonal.row === row && diagonal.col === col);
  }
  return wordGrid.map((row, rowIndex) => {
    if(rowInRange(rowIndex)){
      return row.map((cell,colIndex) => {
        if(cellOnDiagonal(colIndex, rowIndex)){
          cell = {...cell};
          setGuessed(cell);
        }
        return cell;
      });
    }else{
      return row;
    }
  });
}

export function cellsGuessed(state:WordSearchState, wordEnd: GridCellPosition) {
  const wordStart = state.firstSelectedCell as GridCellPosition;
  const direction = getDirection(wordStart, wordEnd);
  let newWordGrid: GuessedCell[][] = [];
  switch (direction) {
    case "horizontal":
      newWordGrid = horizontalCellsGuessed(state.wordGrid, wordStart, wordEnd);
      break;
    case "vertical":
      newWordGrid = verticalCellsGuessed(state.wordGrid, wordStart, wordEnd);
      break;
    case "diagonal":
      newWordGrid = diagonalCellsGuessed(state.wordGrid, wordStart, wordEnd);
      break;
  }
  state.wordGrid = newWordGrid;
}
