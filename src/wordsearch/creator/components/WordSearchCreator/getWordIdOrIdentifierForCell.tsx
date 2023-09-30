import { same } from "../../../helpers/hasDuplicates";
import randomLetterWordId from "../../hook/reducer/randomLetterWordId";
import { GridCell } from "../../hook/reducer/state-types";
import { findSelectedContributingLetter } from "./findSelectedContributingLetter";

export const CellIdentifiers = {
  noLetters: -1,
  randomLetters: randomLetterWordId,
  multipleSameLetters: -2,
  conflictingLetters: -3,
} as const;
export type CellIdentifier =
  (typeof CellIdentifiers)[keyof typeof CellIdentifiers];

interface WordId {
  id: number;
  isWordId: true;
}
interface WordIdentifier {
  id: CellIdentifier;
  isWordId: false;
}
type WordIdOrIdentifier = WordId | WordIdentifier;
// eslint-disable-next-line complexity
export function getWordIdOrIdentifierForCell(
  cell: GridCell,
  selectedWordId: number
): WordIdOrIdentifier {
  const letters = cell.contributingLetters.map((cl) => cl.letter);
  if (letters.length === 0) {
    return { id: CellIdentifiers.noLetters, isWordId: false };
  }
  if (letters.length === 1) {
    const wordId = cell.contributingLetters[0].wordId;
    if (wordId === randomLetterWordId) {
      return { id: CellIdentifiers.randomLetters, isWordId: false };
    }
    return { id: wordId, isWordId: true };
  }

  const selectedContributingLetter = findSelectedContributingLetter(
    cell,
    selectedWordId
  );
  if (selectedContributingLetter) {
    return { id: selectedContributingLetter.wordId, isWordId: true };
  }
  return {
    id: same(letters)
      ? CellIdentifiers.multipleSameLetters
      : CellIdentifiers.conflictingLetters,
    isWordId: false,
  };
}
