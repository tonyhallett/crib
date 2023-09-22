import { GridCell } from "../../hook/reducer/state-types";
import { findSelectedContributingLetter } from "./findSelectedContributingLetter";

export function getWordIdForCell(cell: GridCell, selectedWordId: number) {
  if (cell.contributingLetters.length === 1) {
    return cell.contributingLetters[0].wordId;
  }

  const selectedContributingLetter = findSelectedContributingLetter(
    cell,
    selectedWordId
  );
  if (selectedContributingLetter) {
    return selectedContributingLetter.wordId;
  }
  return -1;
}
