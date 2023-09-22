import {
  Orientation,
  WordSearchCreatorCalculatedState,
} from "../../hook/reducer/state-types";
import { OrientationState } from "../OrientationToolbar/Orientations";

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
