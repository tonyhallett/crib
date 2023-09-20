import { GridCellPosition } from "../common-types";

export function generateDiagonals(
  wordStart: GridCellPosition,
  wordEnd: GridCellPosition,
  callback: (row: number, column: number) => void
) {
  const numLetters = Math.abs(wordStart.row - wordEnd.row) + 1;
  const leftToRight = wordStart.col < wordEnd.col;
  const topToBottom = wordStart.row < wordEnd.row;
  let row = wordStart.row;
  let col = wordStart.col;
  for (let i = 0; i < numLetters; i++) {
    callback(row, col);
    if (topToBottom) {
      row++;
    } else {
      row--;
    }
    if (leftToRight) {
      col++;
    } else {
      col--;
    }
  }
}
