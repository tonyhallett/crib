import { GridCellPosition, GridRow, WordPosition, WordSearch } from "./WordSearch";
import { GuessedCell, GuessedWord } from ".";
import { generateDiagonals } from "./generateDiagonals";
import { getDirection } from "./getDirection";

function reverseWord(word:string) : string {
  return word.split("").reverse().join("");
}

function getWordMayReverse(letters:string[], leftToRight:boolean):string{
  if(!leftToRight){
    return reverseWord(letters.join(""));
  }
  return letters.join("");
}

function getHorizontalWord(grid:GridRow[],rowIndex:number, startCol:number, endCol:number) : string {
  const startColumn = Math.min(startCol,endCol);
  const endColumn = Math.max(startCol,endCol);
  const letters = grid[rowIndex].slice(startColumn,endColumn+1);
  return getWordMayReverse(letters,startCol < endCol);
}

function getVerticalWord(grid:GridRow[], colIndex:number,startRow:number, endRow:number) : string {
 // vertical
 const start = Math.min(startRow,endRow);
 const end= Math.max(startRow,endRow);
 const letters = [];
 for(let row = start;row <= end;row++) {
   letters.push(grid[row][colIndex]);
 }
 return getWordMayReverse(letters,startRow < endRow);
}

function getDiagonalWord(grid:GridRow[],wordStart:GridCellPosition, wordEnd:GridCellPosition):string{
 const letters:string[] = [];
 generateDiagonals(wordStart,wordEnd,(row,col) => {
   letters.push(grid[row][col]);
 });
 return letters.join("");
}


export function getWord(grid:GridRow[],wordPosition:WordPosition) : string {
 const wordStart = wordPosition.start;
 const wordEnd = wordPosition.end;
 const direction = getDirection(wordStart,wordEnd);
 switch (direction) {
   case "horizontal":
     return getHorizontalWord(grid,wordStart.row,wordStart.col,wordEnd.col);
   case "vertical":
     return getVerticalWord(grid,wordStart.col, wordStart.row,wordEnd.row);
   case "diagonal":
     return getDiagonalWord(grid,wordStart,wordEnd);
   default:
     throw new Error("Invalid direction");
 }
}

export function getState(wordSearch: WordSearch): [GuessedCell[][], GuessedWord[]] {
  const guessedRows = wordSearch.grid.map((row) => {
    return row.map((letter) => {
      const guessedCell: GuessedCell = {
        letter: letter,
        isGuessed: false,
        isSelected: false,
      };
      return guessedCell;
    });
  });
  const guessedWords = wordSearch.positions.map((wordPosition) => {
    const guessedWord: GuessedWord = {
      ...wordPosition,
      word: getWord(wordSearch.grid, wordPosition),
      isGuessed: false
    };
    return guessedWord;
  });

  return [guessedRows, guessedWords];

}
