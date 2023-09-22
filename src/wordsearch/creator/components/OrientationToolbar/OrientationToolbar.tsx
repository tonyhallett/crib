import { Orientation } from "../../hook/reducer/state-types";
import { OrientationToolbarProps, Orientations } from "./Orientations";
import { FlipOrientation, FlipState } from "./FlipOrientation";

const leftToRightOrientations: Orientation[] = [
  Orientation.LeftToRight,
  Orientation.TopLeftToBottomRight,
  Orientation.BottomLeftToTopRight,

  Orientation.TopToBottom,
];

function getFlipState(props: OrientationToolbarProps) {
  let flipState = FlipState.Disabled;
  if (props.hasSelectedWord) {
    const isLeftToRight = leftToRightOrientations.includes(
      props.currentOrientation
    );
    flipState = isLeftToRight ? FlipState.Left : FlipState.Right;
  }
  return flipState;
}

interface OrientationToolbarWithFlipProps extends OrientationToolbarProps {
  flipped: () => void;
}

export function OrientationToolbarWithFlip(
  props: OrientationToolbarWithFlipProps
) {
  const flipState = getFlipState(props);

  return (
    <>
      <FlipOrientation
        state={flipState}
        flipped={props.flipped}
        size={props.size}
      />
      <Orientations {...props} />
    </>
  );
}
