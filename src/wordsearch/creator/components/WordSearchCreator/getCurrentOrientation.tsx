import { getSelectedWord } from "../../hook/reducer/common";
import {
  Orientation,
  WordSearchCreatorState,
} from "../../hook/reducer/state-types";

export function getSelectedOrientation(
  state: WordSearchCreatorState
): Orientation {
  return getSelectedWord(state)?.orientation ?? Orientation.LeftToRight;
}
