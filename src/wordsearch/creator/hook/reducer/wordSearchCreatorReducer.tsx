import { WordSearchCreatorAction } from "./actions";
import { WordSearchCreatorState } from "./state-types";
import { wordTextChangedReducer } from "./wordTextChangedReducer";
import { toggleFillWithRandomLettersReducer } from "./toggleFillWithRandomLettersReducer";
import { orientationChangedReducer } from "./orientationChangedReducer";
import { selectWordReducer } from "./selectWordReducer";
import { clickedSquareReducer } from "./clickedSquareReducer";
import { newWordSearchReducer } from "./newWordSearchReducer";
import { newWordReducer } from "./newWordReducer";
import { deleteWordReducer } from "./deleteWordReducer";
import { flippedReducer } from "./flippedReducer";

// eslint-disable-next-line complexity
export function wordSearchCreatorReducer(
  state: WordSearchCreatorState,
  action: WordSearchCreatorAction
) {
  switch (action.type) {
    case "newWordSearch":
      return newWordSearchReducer(state);
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
    case "newWord":
      return newWordReducer(state);
    case "deleteWord":
      return deleteWordReducer(state);
    case "flipped":
      return flippedReducer(state);
  }
  return state;
}
