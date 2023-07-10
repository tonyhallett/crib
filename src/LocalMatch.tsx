import { ChangeHistory, CribGameState, MyMatch } from "./generatedTypes";

type LocalChangeHistory = Omit<ChangeHistory,"lastChangeDate"> & {
  lastChangeDate?: Date
}

export interface LocalMatch {
  id: string;
  changeHistory: LocalChangeHistory;
}

function iHaveNotDiscarded(myMatch:MyMatch){
  return myMatch.myCards.length !== 4
}

export const dealActionIndicator = -1;

export function createLocalMatch(myMatch: MyMatch): LocalMatch {
  const changeHistory = myMatch.changeHistory;
  const numberOfActions =
    myMatch.gameState === CribGameState.Discard && iHaveNotDiscarded(myMatch)
      ? dealActionIndicator
      : changeHistory.numberOfActions;
  return {
    id: myMatch.id,
    changeHistory: {
      matchCreationDate:changeHistory.matchCreationDate,
      numberOfActions,
    },
  };
}

export function removeDealIndicator(localMatch:LocalMatch):LocalMatch | undefined {
  if(localMatch.changeHistory.numberOfActions === dealActionIndicator){
    return {
      ...localMatch,
      changeHistory:{
        ...localMatch.changeHistory,
        numberOfActions:0
      }
    }
  }
}

