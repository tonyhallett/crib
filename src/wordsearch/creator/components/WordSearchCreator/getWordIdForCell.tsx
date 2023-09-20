import { GridCell } from "../../hook/reducer/state-types";
import { findSelectedContributingLetter } from "./findSelectedContributingLetter";

export function getWordIdForCell(cell: GridCell, selectedWordId: number) {
  if (cell.contributingLetters.length === 1) {
    return cell.contributingLetters[0].wordId;
  }

  const selectedWordIdForCell = findSelectedContributingLetter(
    cell,
    selectedWordId
  );
  if (selectedWordIdForCell) {
    return selectedWordIdForCell;
  }
  return -1;
}
