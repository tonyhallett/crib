//type Letter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
export type GridRow = string[];
export type GridCellPosition = { row: number; col: number };
export interface WordPosition {
  start:GridCellPosition,
  end:GridCellPosition,
}

export interface WordSearch {
  grid: GridRow[];
  positions: WordPosition[];
}

