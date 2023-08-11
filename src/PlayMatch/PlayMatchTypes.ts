import { Dispatch, SetStateAction } from "react";
import { MatchDetail } from "../App";
import { FlipCardProps } from "../FlipCard/FlipCard";
import { LocalMatch } from "../localMatch";
import { ColouredScores } from "../crib-board/CribBoard";
import { OnComplete } from "../fixAnimationSequence/common-motion-types";
import { CribClient, CribHub } from "../generatedTypes";
import { ReadyProps } from "./Ready";

export type PlayMatchCribClientMethods = Pick<
  CribClient,
  "discard" | "ready" | "peg" | "go"
>;
// mapped type from PlayMatchCribClientMethods that omits the 'matchId' parameter
export type PlayMatchCribClient = {
  [K in keyof PlayMatchCribClientMethods]: PlayMatchCribClientMethods[K] extends (
    ...args: infer P
  ) => void
    ? (...args: P) => void
    : never;
};

type PlayMatchCribHubMethods = Pick<CribHub, "discard" | "peg" | "ready">;
//mapped type to remove matchId parameter from PlayMatchCribHubMethods
export type PlayMatchCribHub = {
  [Property in keyof PlayMatchCribHubMethods]: PlayMatchCribHubMethods[Property] extends (
    matchId: string,
    ...args: infer P
  ) => void
    ? (...args: P) => void
    : never;
};

export type ReadyState = Omit<ReadyProps, "zIndex">;

export interface CannotGoes {
  me: boolean;
  otherPlayers: boolean[];
}

export enum FlipCardState {
  Box,
  CutCard,
  MyHand,
  OtherPlayersHand,
  PeggingInPlay,
  PeggingTurnedOver,
  AdditionalBoxCard,
  BottomDeckCard,
}
export type FlipCardData = Omit<FlipCardProps, "size"> & {
  state: FlipCardState;
};

export interface FlipCardDatas {
  cutCard: FlipCardData;
  additionalBoxCard: FlipCardData | undefined;
  bottomDeckCard: FlipCardData;
  myCards: FlipCardData[];
  otherPlayersCards: FlipCardData[][];
}

export type UpdateLocalMatch = (localMatch: LocalMatch) => void;

export interface PlayMatchProps {
  matchDetail: MatchDetail;
  playMatchCribHub: PlayMatchCribHub;
  signalRRegistration: (playMatchCribClient: PlayMatchCribClient) => () => void;
  updateLocalMatch: UpdateLocalMatch;
  landscape: boolean;
  hasRenderedAMatch: boolean;
}

export interface CribBoardState {
  colouredScores: ColouredScores;
  onComplete?: OnComplete;
}
export type SetCribboardState = Dispatch<SetStateAction<CribBoardState>>;

export type Duration = number;
