import { getSelectedWord } from "../../hook/reducer/common";
import {
  Orientation,
  WordSearchCreatorCalculatedState,
} from "../../hook/reducer/state-types";

export function getCurrentOrientation(
  state: WordSearchCreatorCalculatedState
): Orientation {
  return getSelectedWord(state)?.orientation ?? Orientation.LeftToRight;
}
