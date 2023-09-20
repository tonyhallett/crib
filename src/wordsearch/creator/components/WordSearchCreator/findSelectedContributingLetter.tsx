import { GridCell } from "../../hook/reducer/state-types";

export function findSelectedContributingLetter(
  cell: GridCell,
  selectedWordId: number
) {
  return cell.contributingLetters.find(
    (contributingLetter) => contributingLetter.wordId === selectedWordId
  );
}
