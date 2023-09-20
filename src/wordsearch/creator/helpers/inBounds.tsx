export function inBounds(
  row: number,
  col: number,
  numRows: number,
  numColumns: number
) {
  return row >= 0 && row < numRows && col >= 0 && col < numColumns;
}
