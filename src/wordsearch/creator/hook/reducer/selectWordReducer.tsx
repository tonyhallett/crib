import { WordSelectedAction } from "./actions";
import { WordSearchCreatorState } from "./state-types";

export function selectWordReducer(
  state: WordSearchCreatorState,
  action: WordSelectedAction
): WordSearchCreatorState {
  if (state.selectedWordId !== action.id) {
    const newState: WordSearchCreatorState = {
      ...state,
      selectedWordId: action.id,
    };
    return newState;
  }
  return state;
}
