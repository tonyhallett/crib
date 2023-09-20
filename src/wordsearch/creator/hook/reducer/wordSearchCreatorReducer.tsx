import { stateFromInitial } from "../stateFromInitial";
import { WordSearchCreatorAction } from "./actions";
import { WordSearchCreatorState } from "./state-types";
import { wordTextChangedReducer } from "./wordTextChangedReducer";
import { toggleFillWithRandomLettersReducer } from "./toggleFillWithRandomLettersReducer";
import { orientationChangedReducer } from "./orientationChangedReducer";
import { selectWordReducer } from "./selectWordReducer";
import { clickedSquareReducer } from "./clickedSquareReducer";

// eslint-disable-next-line complexity
export function wordSearchCreatorReducer(
  state: WordSearchCreatorState,
  action: WordSearchCreatorAction
) {
  switch (action.type) {
    case "newWordSearch":
      // clear word list and clear the grid
      return stateFromInitial({
        numColumns: state.numColumns,
        numRows: state.numRows,
        selectedWordId: -1,
        words: [],
      });
    case "clickedSquare":
      return clickedSquareReducer(state, action);
    case "wordTextChanged":
      return wordTextChangedReducer(state, action);
    case "wordSelected":
      return selectWordReducer(state, action);
    case "orientationChanged":
      return orientationChangedReducer(state, action);
    case "toggleFillWithRandomLetters":
      return toggleFillWithRandomLettersReducer(state);
  }
  return state;
}
