import { GridCellPosition } from "./WordSearch";

export function getDirection(start: GridCellPosition, end: GridCellPosition): string {
  if (start.row === end.row) {
    return "horizontal";
  } else if (start.col === end.col) {
    return "vertical";
  } else {
    return "diagonal";
  }
}
