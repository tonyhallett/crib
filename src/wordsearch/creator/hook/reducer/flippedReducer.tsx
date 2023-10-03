import { getSelectedOrientation } from "../../components/WordSearchCreator/getCurrentOrientation";
import { updateWord, updateWordGridForWordChange } from "./common";
import { getLastLetterPosition } from "./getLastLetterPosition";
import { Orientation, WordSearchCreatorState } from "./state-types";

export const orientationPairs = [
  [Orientation.LeftToRight, Orientation.RightToLeft],
  [Orientation.TopLeftToBottomRight, Orientation.BottomRightToTopLeft],
  [Orientation.BottomLeftToTopRight, Orientation.TopRightToBottomLeft],
  [Orientation.TopToBottom, Orientation.BottomToTop],
];

export function getFlipOrientation(orientation: Orientation): Orientation {
  let flippedOrientation = Orientation.LeftToRight;
  for (let i = 0; i < orientationPairs.length; i++) {
    const orientationPair = orientationPairs[i];
    const orientationIndex = orientationPair.indexOf(orientation);
    if (orientationIndex !== -1) {
      const flipIndex = orientationIndex === 0 ? 1 : 0;
      flippedOrientation = orientationPair[flipIndex];
      break;
    }
  }
  return flippedOrientation;
}

export function flippedReducer(
  state: WordSearchCreatorState
): WordSearchCreatorState {
  const orientation = getSelectedOrientation(state);
  const flipOrientation = getFlipOrientation(orientation);
  const { newWords, oldWord, newWord } = updateWord(
    state.words,
    state.selectedWordId,
    (word) => {
      const newStartPosition = getLastLetterPosition(word);
      return {
        ...word,
        orientation: flipOrientation,
        start: { row: newStartPosition.row, col: newStartPosition.col },
      };
    }
  );

  return {
    ...state,
    words: newWords,
    wordGrid: updateWordGridForWordChange(
      oldWord,
      newWord,
      state.numRows,
      state.numColumns,
      state.wordGrid,
      state.fillWithRandomLetters
    ),
  };
}
