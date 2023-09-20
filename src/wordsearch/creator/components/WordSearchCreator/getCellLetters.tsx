import { GridCell } from "../../hook/reducer/state-types";

export function getCellLetters(cell: GridCell) {
  return cell.contributingLetters.map(
    (contributingLetter) => contributingLetter.letter
  );
}
