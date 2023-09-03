import { guessedWord } from "./guessedWord";
import { GuessedCell, GuessedWord, WordSearchState } from ".";
import { GridCellPosition } from "./WordSearch";

export interface LetterClickAction{
  type: "letterClick";
  gridCellPosition:GridCellPosition
}

export function findWord(guessedWords:GuessedWord[],wordStart:GridCellPosition, wordEnd:GridCellPosition) : GuessedWord | undefined {
  return  guessedWords.find(
    (word) => word.start.row === wordStart.row && word.start.col === wordStart.col && word.end.row === wordEnd.row && word.end.col === wordEnd.col
  );
}

export function updateSelectedCell(wordGrid:GuessedCell[][],row:number,col:number, isSelected:boolean) : GuessedCell[][] {
  return wordGrid.map((gridRow, rowIndex) => {
    if(rowIndex === row){
      return gridRow.map((cell, cellIndex) => {
        if(cellIndex === col){
          return {
            ...cell,
            isSelected,
          } 
        }
        return cell;
      })
    }
    return gridRow;
  })
}

export function wordGridReducer(state: WordSearchState, action: LetterClickAction) {
  const newState = {
    ...state
  };
  if (state.firstSelectedCell === undefined) {
    newState.firstSelectedCell = action.gridCellPosition;
    const newWordGrid = updateSelectedCell(state.wordGrid, action.gridCellPosition.row, action.gridCellPosition.col, true);
    newState.wordGrid = newWordGrid;
  } else {
    const matchingWord = findWord(state.guessedWords, state.firstSelectedCell, action.gridCellPosition);

    if (matchingWord) {
      guessedWord(matchingWord, action.gridCellPosition, newState);
    } else {
      const newWordGrid = updateSelectedCell(state.wordGrid, state.firstSelectedCell.row, state.firstSelectedCell.col, false);
      newState.wordGrid = newWordGrid;
    }
    newState.firstSelectedCell = undefined;
  }

  return newState;
}
