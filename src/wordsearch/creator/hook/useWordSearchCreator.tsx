import { useReducer } from "react";
import { getCalculatedState } from "./getCalculatedState";
import { stateFromInitial } from "./stateFromInitial";
import { wordSearchCreatorReducer } from "./reducer/wordSearchCreatorReducer";
import {
  Orientation,
  WordSearchCreatorInitialState,
} from "./reducer/state-types";

export function useWordSearchCreator(
  initialState: WordSearchCreatorInitialState = {
    words: [
      {
        word: "HELLO",
        id: 1,
        orientation: Orientation.LeftToRight,
        start: { row: 0, col: 0 },
      },
      {
        word: "YOU",
        id: 2,
        orientation: Orientation.RightToLeft,
        start: { row: 0, col: 7 },
      },

      {
        word: "CONFLICT",
        id: 3,
        orientation: Orientation.TopToBottom,
        start: { row: 0, col: 7 },
      },
      {
        word: "UP",
        id: 4,
        orientation: Orientation.BottomToTop,
        start: { row: 7, col: 6 },
      },

      {
        word: "TLBR",
        id: 5,
        orientation: Orientation.TopLeftToBottomRight,
        start: { row: 1, col: 0 },
      },
      {
        word: "BRTL",
        id: 6,
        orientation: Orientation.BottomRightToTopLeft,
        start: { row: 4, col: 4 },
      },
      {
        word: "TRBL",
        id: 7,
        orientation: Orientation.TopRightToBottomLeft,
        start: { row: 4, col: 6 },
      },
      {
        word: "BLTR",
        id: 8,
        orientation: Orientation.BottomLeftToTopRight,
        start: { row: 7, col: 2 },
      },
    ],

    numRows: 8,
    numColumns: 8,
    selectedWordId: 3,
  }
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
