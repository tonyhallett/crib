import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { iconMap } from "./iconMap";
import { Orientation } from "../../hook/reducer/state-types";

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
