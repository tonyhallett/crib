import { stateFromInitial } from "../stateFromInitial";
import { WordSearchCreatorState } from "./state-types";

export function newWordSearchReducer(
  state: WordSearchCreatorState
): WordSearchCreatorState {
  return stateFromInitial({
    numColumns: state.numColumns,
    numRows: state.numRows,
    selectedWordId: -1,
    words: [],
  });
}
