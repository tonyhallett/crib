import { fill } from "../../../utilities/arrayHelpers";
import {
  WordSearchCreatorInitialState,
  WordSearchCreatorState,
  WordSearchGrid,
} from "./reducer/state-types";
import { getLetterPositionsOnGrid } from "../components/WordSearchCreator/getLetterPositionsOnGrid";

function getBlankWordSearchGrid(
  numRows: number,
  numColumns: number
): WordSearchGrid {
  return fill(numRows, () => {
    return fill(numColumns, () => {
      return { contributingLetters: [] };
    });
  });
}
export function stateFromInitial(
  initialState: WordSearchCreatorInitialState
): WordSearchCreatorState {
  const wordSearchGrid = getBlankWordSearchGrid(
    initialState.numRows,
    initialState.numColumns
  );
  initialState.words.forEach((word) => {
    const letterPositionsOnGrid = getLetterPositionsOnGrid(
      word,
      initialState.numRows,
      initialState.numColumns
    );
    letterPositionsOnGrid.forEach((letterOnGrid) => {
      const cell = wordSearchGrid[letterOnGrid.row][letterOnGrid.col];
      cell.contributingLetters.push({
        letter: letterOnGrid.letter,
        wordId: word.id,
      });
    });
  });
  return {
    ...initialState,
    wordGrid: wordSearchGrid,
    fillWithRandomLetters: false,
  };
}
