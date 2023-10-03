import { useReducer } from "react";
import { getCalculatedState } from "./getCalculatedState";
import { stateFromInitial } from "./stateFromInitial";
import { wordSearchCreatorReducer } from "./reducer/wordSearchCreatorReducer";
import {
  Orientation,
  WordSearchCreatorInitialState,
} from "./reducer/state-types";

const defaultX: WordSearchCreatorInitialState = {
  words: [
    {
      word: "HELLO",
      id: 1,
      orientation: Orientation.LeftToRight,
      start: { row: 0, col: 0 },
    },
  ],

  numRows: 8,
  numColumns: 8,
  selectedWordId: 1,
};
const defaultState = stateFromInitial(defaultX);
export function useWordSearchCreator(
  initialState: WordSearchCreatorInitialState = defaultState
) {
  const [state, dispatch] = useReducer(
    wordSearchCreatorReducer,
    stateFromInitial(initialState)
  );
  const dispatcher = {
    newWordSearch() {
      dispatch({
        type: "newWordSearch",
      });
    },
    clickedSquare(row: number, col: number) {
      dispatch({ type: "clickedSquare", row, col });
    },
    wordTextChanged(wordIndex: number, newText: string) {
      dispatch({ type: "wordTextChanged", wordIndex, newText });
    },
    wordSelected(wordId: number) {
      dispatch({ type: "wordSelected", id: wordId });
    },
    orientationChanged(orientation: Orientation) {
      dispatch({ type: "orientationChanged", orientation });
    },
    flipped() {
      dispatch({ type: "flipped" });
    },
    toggleFillWithRandomLetters() {
      dispatch({ type: "toggleFillWithRandomLetters" });
    },
    newWord() {
      dispatch({ type: "newWord" });
    },
    deleteWord() {
      dispatch({ type: "deleteWord" });
    },
  };
  return [getCalculatedState(state), dispatcher] as const;
}
