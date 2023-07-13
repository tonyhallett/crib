import { createContext } from "react";
import { MatchDetail } from "./App";

type PlayMatchSubscription = (playMatch: MatchDetail | undefined) => void;
export interface PlayMatchContext {
  playMatch(playMatch: MatchDetail | undefined): void;
  subscribe(playMatchSubscription: PlayMatchSubscription): void;
}
const subscribers: PlayMatchSubscription[] = [];
export const PlayMatchContext = createContext<PlayMatchContext>({
  playMatch(playMatch: MatchDetail | undefined) {
    subscribers.forEach((subscriber) => subscriber(playMatch));
  },
  subscribe(playMatchSubscription: PlayMatchSubscription) {
    subscribers.push(playMatchSubscription);
  },
});
export const PlayMatchContextProvider = PlayMatchContext.Provider;
