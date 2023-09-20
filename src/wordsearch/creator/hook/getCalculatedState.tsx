import { inBounds } from "../helpers/inBounds";
import { getLetterPositions } from "./getLetterPositions";
import {
  PositionedWord,
  WordSearchGrid,
  PositionedWordAndLetterState,
  LetterState,
  LetterAndState,
  WordSearchCreatorState,
  WordSearchCreatorCalculatedState,
} from "./reducer/state-types";

function getWordsWithLetterStates(
  words: PositionedWord[],
  wordSearchGrid: WordSearchGrid
): PositionedWordAndLetterState[] {
  const numRows = wordSearchGrid.length;
  const numColumns = wordSearchGrid.length > 0 ? wordSearchGrid[0].length : 0;
  const isOnGrid = (row: number, col: number) => {
    return inBounds(row, col, numRows, numColumns);
  };
  return words.map((positionedWord) => {
    const letterPositions = getLetterPositions(positionedWord);

    const letterStates = letterPositions.map((letterPosition) => {
      let letterState: LetterState = "offGrid";
      if (isOnGrid(letterPosition.row, letterPosition.col)) {
        const gridCell = wordSearchGrid[letterPosition.row][letterPosition.col];
        letterState =
          gridCell.contributingLetters.length === 1 ? "ok" : "conflict";
      }
      const letterAndState: LetterAndState = {
        letter: letterPosition.letter,
        state: letterState,
      };
      return letterAndState;
    });
    const positionedWordAndLetterState: PositionedWordAndLetterState = {
      ...positionedWord,
      letterStates,
    };
    return positionedWordAndLetterState;
  });
}

export function getCalculatedState(
  state: WordSearchCreatorState
): WordSearchCreatorCalculatedState {
  return {
    ...state,
    words: getWordsWithLetterStates(state.words, state.wordGrid),
  };
}
