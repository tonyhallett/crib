import { ChangeHistory, CribGameState, MyMatch } from "./generatedTypes";

export interface LocalMatch {
  id: string;
  changeHistory: ChangeHistory;
}

export function createLocalMatch(myMatch: MyMatch): LocalMatch {
  const changeHistory = myMatch.changeHistory;
  const numberOfActions =
    myMatch.gameState === CribGameState.Discard && myMatch.myCards.length !== 4
      ? -1
      : changeHistory.numberOfActions;
  return {
    id: myMatch.id,
    changeHistory: {
      ...changeHistory,
      numberOfActions,
    },
  };
}
