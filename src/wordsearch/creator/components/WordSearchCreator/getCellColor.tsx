import { GridCellState } from "./getCellState";

const wordColours: string[] = [
  "green",
  "blue",
  "pink",
  "cyan",
  "yellow",
  "purple",
  "brown",
  "limegreen",
];

function getOkColour(wordIndex: number) {
  if (wordIndex === -1) {
    return "white";
  }
  return wordColours[wordIndex];
}

export function getCellColor(cellState: GridCellState, wordIndex: number) {
  switch (cellState) {
    case GridCellState.Ok:
      return getOkColour(wordIndex);
    case GridCellState.OkSelected:
      return "gray";
    case GridCellState.Conflict:
      return "orange";
    case GridCellState.ConflictSelected:
      return "red";
  }
  return "white";
}
