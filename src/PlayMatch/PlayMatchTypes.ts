import { Dispatch, SetStateAction } from "react";
import { MatchDetail } from "../App";
import { FlipCardProps } from "../FlipCard/FlipCard";
import { LocalMatch } from "../localMatch";
import { ColouredScores } from "../crib-board/CribBoard";
import { OnComplete } from "../fixAnimationSequence/common-motion-types";
import { CribClient, CribHub, MyMatch } from "../generatedTypes";
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

export class CannotGoes {
  me: boolean;
  otherPlayers: boolean[];
  allCanGo: boolean;
  anyCalledGo: boolean;
  constructor(myMatch: MyMatch) {
    this.me = myMatch.pegging.myCannotGo;
    this.otherPlayers = myMatch.pegging.cannotGoes;
    this.allCanGo = this.getAllCallGo();
    this.anyCalledGo = this.getAnyCalledGo();
  }

  private getAllCallGo() {
    return [this.me, ...this.otherPlayers].every((cannotGo) => !cannotGo);
  }

  private getAnyCalledGo() {
    return [this.me, ...this.otherPlayers].some((cannotGo) => cannotGo);
  }

  private setAll(value: boolean) {
    this.me = value;
    this.otherPlayers = this.otherPlayers.map(() => value);
  }
  setAllCalledGo() {
    this.setAll(true);
  }
  resetGoes() {
    this.setAll(false);
  }
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
