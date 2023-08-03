import { OtherPlayer, PeggedCard, Score, ShowScoring } from "../generatedTypes";
import { fill } from "../utilities/arrayHelpers";
import { getPlayerScoreIndex } from "./getPlayerPositions";

export function splitPeggingShowScores(
  peggedCard: PeggedCard,
  showScoring: ShowScoring | undefined,
  myId: string,
  otherPlayers: OtherPlayer[],
  previousScores:Score[]
): Score[][] {
  const splitScores:Score[][] = [];

  const addScore = (playerId: string, score: number) => {
    const lastScores = splitScores.length === 0 ? previousScores : splitScores[splitScores.length - 1];
    const playerScoreIndex = getPlayerScoreIndex(
      playerId,
      myId,
      otherPlayers,
    );
    
    splitScores.push(fill(previousScores.length, (i) => {
      const lastScore = {...lastScores[i]};
      if(i === playerScoreIndex){
        if(score > 0) {
          lastScore.backPeg = lastScore.frontPeg;
        }
        let newFrontPeg = lastScore.frontPeg + score;
        if(newFrontPeg > 121){
          newFrontPeg = 121;
        }
        lastScore.frontPeg = newFrontPeg;
      }
      return lastScore;
    }));
    
  };

  addScore(peggedCard.owner, peggedCard.peggingScore.score);
  let boxPlayerId = "";
  if(showScoring){
    showScoring.playerShowScores.forEach((playerScore) => {
      boxPlayerId = playerScore.playerId;
      addScore(playerScore.playerId, playerScore.showScore.score);
    });
    if(showScoring.boxScore){
      addScore(boxPlayerId, showScoring.boxScore.score);
    }
  }
  return splitScores;
}

