import { OtherPlayer, PeggedCard, Score, ShowScoring } from "../generatedTypes";
import { getPlayerScoreIndex } from "./getPlayerPositions";

function shiftScoreBack(score: Score, amount: number): Score {
  const frontPegFromBefore  = score.backPeg;
  const shiftedScore = {
    games: score.games,
    frontPeg: frontPegFromBefore,// revert previous numeric score
    backPeg: frontPegFromBefore - amount,
  };
  return shiftedScore;
}

export function splitPeggingShowScores(
  peggedCard: PeggedCard,
  showScoring: ShowScoring|undefined,
  scores: Score[],
  myId: string,
  otherPlayers: OtherPlayer[]
): Score[][] {
  const isTeams = otherPlayers.length === 3;
  const scoresInReverse = [scores]; //box
  const addScore = (playerId: string, score: number) => {
    const playerScoreIndex = getPlayerScoreIndex(
      playerId,
      myId,
      otherPlayers,
      isTeams
    );
    const lastScores = scoresInReverse[scoresInReverse.length - 1];
    scoresInReverse.push(
      lastScores.map((lastScore, index) => {
        if (index === playerScoreIndex) {
          return shiftScoreBack(lastScore, score);
        } else {
          return { ...lastScore }; // might not need to do this
        }
      })
    );
  };
  if(showScoring){
    showScoring.playerShowScores.reverse().forEach((playerScore) => {
      addScore(playerScore.playerId, playerScore.showScore.score);
    });
    addScore(peggedCard.owner, peggedCard.peggingScore.score);
    return scoresInReverse.reverse();
  } 
  
  return [scores];
}
