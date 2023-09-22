import { ToggleButton, ToggleButtonGroup } from "@mui/material";
// import SwitchLeftIcon from "@mui/icons-material/SwitchLeft";
// import SwitchRightIcon from "@mui/icons-material/SwitchRight";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

export enum FlipState {
  Left,
  Right,
  Disabled,
}

export interface FlipOrientationProps {
  state: FlipState;
  flipped: () => void;
  size: "small" | "medium" | "large";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getToggleButtonGroupValue(state: FlipState) {
  return state === FlipState.Left
    ? "left"
    : state === FlipState.Right
    ? "right"
    : undefined;
}

export function FlipOrientation(props: FlipOrientationProps) {
  return (
    <ToggleButton
      value="check"
      size={props.size}
      disabled={props.state === FlipState.Disabled}
      onChange={() => props.flipped()}
    >
      <SwapHorizIcon />
    </ToggleButton>
  );
}
