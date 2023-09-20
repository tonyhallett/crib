import { getLetterPositions } from "../../hook/getLetterPositions";
import { inBounds } from "../../helpers/inBounds";
import { PositionedWord } from "../../hook/reducer/state-types";

export const getLetterPositionsOnGrid = (
  word: PositionedWord,
  numRows: number,
  numColumns: number
) => {
  const letterPositions = getLetterPositions(word);
  return letterPositions.filter((letterPosition) => {
    return inBounds(
      letterPosition.row,
      letterPosition.col,
      numRows,
      numColumns
    );
  });
};
