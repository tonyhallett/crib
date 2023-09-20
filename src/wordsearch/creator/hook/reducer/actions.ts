import { GridCellPosition } from "../../../common-types";
import { Orientation } from "./state-types";

export interface Action {
  type: string;
}

export interface NewWordSearchAction extends Action {
  type: "newWordSearch";
}

export interface ClickedSquareAction extends Action, GridCellPosition {
  type: "clickedSquare";
}

export interface WordSelectedAction extends Action {
  type: "wordSelected";
  id: number;
}

export interface WordTextChangedAction extends Action {
  type: "wordTextChanged";
  wordIndex: number;
  newText: string;
}

export interface OrientationChangedAction extends Action {
  type: "orientationChanged";
  orientation: Orientation;
}

export interface ToggleFillWithRandomLettersAction extends Action {
  type: "toggleFillWithRandomLetters";
}

export type WordSearchCreatorAction =
  | NewWordSearchAction
  | ClickedSquareAction
  | WordSelectedAction
  | WordTextChangedAction
  | OrientationChangedAction
  | ToggleFillWithRandomLettersAction;
