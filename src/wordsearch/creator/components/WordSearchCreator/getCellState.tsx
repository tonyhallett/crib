import { hasDuplicates } from "../../../helpers/hasDuplicates";
import { GridCell } from "../../hook/reducer/state-types";
import { findSelectedContributingLetter } from "./findSelectedContributingLetter";
import { getCellLetters } from "./getCellLetters";

export enum GridCellState {
  Ok,
  OkSelected,
  Conflict,
  ConflictSelected,
}

function cellIsSelected(cell: GridCell, selectedWordId: number) {
  return findSelectedContributingLetter(cell, selectedWordId) !== undefined;
}

function getSingleLetterState(isSelected: boolean) {
  return isSelected ? GridCellState.OkSelected : GridCellState.Ok;
}

function getMultipleLetterState(letters: string[], isSelected: boolean) {
  if (!hasDuplicates(letters)) {
    return isSelected ? GridCellState.ConflictSelected : GridCellState.Conflict;
  }
  return isSelected ? GridCellState.OkSelected : GridCellState.Ok;
}

function getCellStateFromLetters(letters: string[], isSelected: boolean) {
  return letters.length === 1
    ? getSingleLetterState(isSelected)
    : getMultipleLetterState(letters, isSelected);
}

export function getCellState(
  cell: GridCell,
  selectedWordId: number
): GridCellState {
  const letters = getCellLetters(cell);
  if (letters.length === 0) {
    return GridCellState.Ok;
  }

  const isSelected = cellIsSelected(cell, selectedWordId);
  return getCellStateFromLetters(letters, isSelected);
}
