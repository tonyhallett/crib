import { OtherPlayer, PeggedCard, Score, ShowScoring } from "../generatedTypes";
import { fill } from "../utilities/arrayHelpers";
import { getPlayerScoreIndex } from "./getPlayerPositions";

interface ScoresAndTotal {
  scores:number[],
  total:number,
  finalScore:Score,
  splitScore:Score[]
}
export function splitPeggingShowScores(
  peggedCard: PeggedCard,
  showScoring: ShowScoring|undefined,
  scores: Score[],
  myId: string,
  otherPlayers: OtherPlayer[]
): Score[][] {
  
  const isTeams = otherPlayers.length === 3;
  const scoresAndTotals: ScoresAndTotal[]= scores.map((score) => {
    return {
      finalScore:score,
      scores:[],
      total:0,
      splitScore:[]
    }
  });
  let numScores = 0;
  const addScore = (playerId: string, score: number,isLast:boolean) => {
    const playerScoreIndex = getPlayerScoreIndex(
      playerId,
      myId,
      otherPlayers,
      isTeams
    );
    scoresAndTotals.forEach((scoresAndTotal, index) => {
      const scoreToAdd = playerScoreIndex === index ? score : 0;
      scoresAndTotal.total += scoreToAdd;
      scoresAndTotal.scores.push(scoreToAdd);
      numScores = scoresAndTotal.scores.length;
      if(isLast){
        const startFrontPeg = scoresAndTotal.finalScore.frontPeg - scoresAndTotal.total;
        let accumulatedScore = 0;
        scoresAndTotal.splitScore = scoresAndTotal.scores.map((scoreToAdd) => {
          accumulatedScore += scoreToAdd;
          return {
            games: scoresAndTotal.finalScore.games,
            backPeg:0, // this is not necessary for the cribboard !
            frontPeg: startFrontPeg + accumulatedScore
          }
        });
      }
    });
  };
  
  if(showScoring){
    addScore(peggedCard.owner, peggedCard.peggingScore.score,false);
    let boxId = '';
    showScoring.playerShowScores.forEach((playerScore) => {
      boxId = playerScore.playerId;
      addScore(playerScore.playerId, playerScore.showScore.score,false);
    });
    addScore(boxId, showScoring.boxScore.score,true);
    const splitScores = fill(numScores,i => {
      return scoresAndTotals.map((scoresAndTotal) => {
        return scoresAndTotal.splitScore[i];
      });
    });
    console.log("split scores");
    console.log(JSON.stringify(splitScores));
    return splitScores;
  } 
  
  return [scores];
}
