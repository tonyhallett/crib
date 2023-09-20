import { OrientationState } from "../OrientationToolbar";
import {
  Orientation,
  WordSearchCreatorCalculatedState,
} from "../../hook/reducer/state-types";

export const orientationOrder: Orientation[] = [
  Orientation.LeftToRight,
  Orientation.RightToLeft,
  Orientation.TopToBottom,
  Orientation.BottomToTop,
  Orientation.TopLeftToBottomRight,
  Orientation.BottomRightToTopLeft,
  Orientation.TopRightToBottomLeft,
  Orientation.BottomLeftToTopRight,
];

export function getOrientationState(
  state: WordSearchCreatorCalculatedState
): OrientationState[] {
  return orientationOrder.map((orientation) => {
    return {
      orientation,
      enabled: state.selectedWordId !== -1,
    };
  });
}
