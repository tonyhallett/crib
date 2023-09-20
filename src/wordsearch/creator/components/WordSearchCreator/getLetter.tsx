import { hasDuplicates } from "../../../helpers/hasDuplicates";
import { GridCell } from "../../hook/reducer/state-types";
import { getCellLetters } from "./getCellLetters";

export function getLetter(cell: GridCell): string {
  const letters = getCellLetters(cell);
  if (letters.length === 0) {
    return "";
  }
  const firstLetter = letters[0];
  if (letters.length === 1) {
    return firstLetter;
  }
  if (!hasDuplicates(letters)) {
    return "*";
  }
  return firstLetter;
}
