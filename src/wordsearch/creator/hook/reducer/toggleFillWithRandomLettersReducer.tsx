import {
  getRandomLetterContribution,
  isRandomLetterContribution,
} from "./common";
import { WordSearchCreatorState, WordSearchGrid } from "./state-types";

function fillWordGridWithRandomLetters(
  wordSearchGrid: WordSearchGrid,
  on: boolean
): WordSearchGrid {
  return wordSearchGrid.map((row) => {
    return row.map((cell) => {
      if (on) {
        if (cell.contributingLetters.length === 0) {
          const newCell = { ...cell };
          newCell.contributingLetters = getRandomLetterContribution();
          return newCell;
        }
      } else {
        if (isRandomLetterContribution(cell.contributingLetters)) {
          return { ...cell, contributingLetters: [] };
        }
      }
      return cell;
    });
  });
}

export function toggleFillWithRandomLettersReducer(
  state: WordSearchCreatorState
): WordSearchCreatorState {
  const fillWithRandomLetters = !state.fillWithRandomLetters;
  return {
    ...state,
    fillWithRandomLetters,
    wordGrid: fillWordGridWithRandomLetters(
      state.wordGrid,
      fillWithRandomLetters
    ),
  };
}
