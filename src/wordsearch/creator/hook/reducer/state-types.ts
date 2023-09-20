import { GridCellPosition } from "../../../common-types";

export enum Orientation {
  LeftToRight,
  RightToLeft,
  TopToBottom,
  BottomToTop,
  TopLeftToBottomRight,
  TopRightToBottomLeft,
  BottomLeftToTopRight,
  BottomRightToTopLeft,
}
export interface PositionedWord {
  word: string;
  id: number;
  start: GridCellPosition;
  orientation: Orientation;
}

export interface WordSearchCreatorInitialState {
  words: PositionedWord[];
  numRows: number;
  numColumns: number;
  selectedWordId: number;
}

export interface ContributingLetter {
  letter: string;
  wordId: number;
}
export interface GridCell {
  contributingLetters: ContributingLetter[];
}
type GridRow = GridCell[];
export type WordSearchGrid = GridRow[];
export interface WordSearchCreatorState extends WordSearchCreatorInitialState {
  wordGrid: WordSearchGrid;
  fillWithRandomLetters: boolean;
}

export type LetterState = "ok" | "offGrid" | "conflict";
export interface LetterAndState {
  letter: string;
  state: LetterState;
}

export interface PositionedWordAndLetterState extends PositionedWord {
  letterStates: LetterAndState[];
}

export interface WordSearchCreatorCalculatedState
  extends WordSearchCreatorState {
  words: PositionedWordAndLetterState[];
}
