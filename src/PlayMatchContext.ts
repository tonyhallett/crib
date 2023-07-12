import { createContext } from "react";
import { MyMatchAndLocal } from "./App";

type PlayMatchSubscription = (playMatch: MyMatchAndLocal | undefined) => void;
export interface PlayMatchContext {
  playMatch(playMatch: MyMatchAndLocal | undefined): void;
  subscribe(playMatchSubscription: PlayMatchSubscription): void;
}
const subscribers: PlayMatchSubscription[] = [];
export const PlayMatchContext = createContext<PlayMatchContext>({
  playMatch(playMatch: MyMatchAndLocal | undefined) {
    subscribers.forEach((subscriber) => subscriber(playMatch));
  },
  subscribe(playMatchSubscription: PlayMatchSubscription) {
    subscribers.push(playMatchSubscription);
  },
});
export const PlayMatchContextProvider = PlayMatchContext.Provider;
