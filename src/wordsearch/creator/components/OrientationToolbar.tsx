import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Orientation } from "../hook/reducer/state-types";
import SwitchLeftIcon from "@mui/icons-material/SwitchLeft";
import SwitchRightIcon from "@mui/icons-material/SwitchRight";
import EastIcon from "@mui/icons-material/East";
import WestIcon from "@mui/icons-material/West";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import NorthWestIcon from "@mui/icons-material/NorthWest";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import SouthWestIcon from "@mui/icons-material/SouthWest";

export interface OrientationState {
  orientation: Orientation;
  enabled: boolean;
}

export interface OrientationToolbarProps {
  hasSelectedWord: boolean;
  orientations: OrientationState[];
  currentOrientation: Orientation;
  orientationChanged: (orientation: Orientation) => void;
  size: "small" | "medium" | "large";
}

const leftToRightOrientations: Orientation[] = [
  Orientation.LeftToRight,
  Orientation.TopLeftToBottomRight,
  Orientation.BottomLeftToTopRight,

  Orientation.TopToBottom,
];

const orientationPairs = [
  [Orientation.LeftToRight, Orientation.RightToLeft],
  [Orientation.TopLeftToBottomRight, Orientation.BottomRightToTopLeft],
  [Orientation.BottomLeftToTopRight, Orientation.TopRightToBottomLeft],
  [Orientation.TopToBottom, Orientation.BottomToTop],
];

function getFlipOrientation(orientation: Orientation): Orientation {
  let flippedOrientation = Orientation.LeftToRight;
  for (let i = 0; i < orientationPairs.length; i++) {
    const orientationPair = orientationPairs[i];
    const orientationIndex = orientationPair.indexOf(orientation);
    if (orientationIndex !== -1) {
      const flipIndex = orientationIndex === 0 ? 1 : 0;
      flippedOrientation = orientationPair[flipIndex];
    }
  }
  return flippedOrientation;
}

const iconMap = new Map<Orientation, React.ElementType>();
iconMap.set(Orientation.LeftToRight, EastIcon);
iconMap.set(Orientation.RightToLeft, WestIcon);
iconMap.set(Orientation.TopToBottom, SouthIcon);
iconMap.set(Orientation.BottomToTop, NorthIcon);
iconMap.set(Orientation.TopLeftToBottomRight, SouthEastIcon);
iconMap.set(Orientation.BottomRightToTopLeft, NorthWestIcon);
iconMap.set(Orientation.TopRightToBottomLeft, SouthWestIcon);
iconMap.set(Orientation.BottomLeftToTopRight, NorthEastIcon);

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

export function OrientationToolbarWithFlip(props: OrientationToolbarProps) {
  const flipState = getFlipState(props);

  const flipped = () => {
    props.orientationChanged(getFlipOrientation(props.currentOrientation));
  };
  return (
    <>
      <FlipOrientation state={flipState} flipped={flipped} size={props.size} />
      <Orientations {...props} />
    </>
  );
}

export function Orientations(props: OrientationToolbarProps) {
  const value = props.hasSelectedWord ? props.currentOrientation : undefined;
  return (
    <ToggleButtonGroup
      size={props.size}
      exclusive
      disabled={!props.hasSelectedWord}
      value={value}
      onChange={(evt, v) => {
        if (v !== null) {
          return props.orientationChanged(v);
        }
      }}
    >
      {props.orientations.map((orientationState) => {
        const Icon = iconMap.get(
          orientationState.orientation
        ) as React.ElementType;
        return (
          <ToggleButton
            disabled={!orientationState.enabled}
            key={orientationState.orientation}
            value={orientationState.orientation}
          >
            <Icon />
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
}

enum FlipState {
  Left,
  Right,
  Disabled,
}
interface FlipOrientationProps {
  state: FlipState;
  flipped: () => void;
  size: "small" | "medium" | "large";
}

function FlipOrientation(props: FlipOrientationProps) {
  const value =
    props.state === FlipState.Left
      ? "left"
      : props.state === FlipState.Right
      ? "right"
      : undefined;
  return (
    <ToggleButtonGroup
      size={props.size}
      exclusive
      disabled={props.state === FlipState.Disabled}
      value={value}
      onChange={props.flipped}
    >
      <ToggleButton value="left">
        <SwitchLeftIcon />
      </ToggleButton>
      <ToggleButton value="right">
        <SwitchRightIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
