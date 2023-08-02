import { CribGameState, OtherPlayer, PeggedCard, Score, ShowScoring } from "../generatedTypes";
import { fill } from "../utilities/arrayHelpers";
import { getPlayerScoreIndex } from "./getPlayerPositions";

interface ScoresAndTotal {
  scores: number[];
  total: number;
  finalScore: Score;
  splitScore: Score[];
}
export function splitPeggingShowScores(
  peggedCard: PeggedCard,
  showScoring: ShowScoring | undefined,
  scores: Score[],
  myId: string,
  otherPlayers: OtherPlayer[],
  gameState:CribGameState,
  previousScores:Score[]
): Score[][] {
  const isTeams = otherPlayers.length === 3;
  if(gameState === CribGameState.GameWon || gameState === CribGameState.MatchWon){
    const playerScoreIndex = getPlayerScoreIndex(
      peggedCard.owner,
      myId,
      otherPlayers,
      isTeams
    );
    const winnerScore = scores[playerScoreIndex];
    winnerScore.frontPeg = 121;
    winnerScore.games = winnerScore.games - 1;
  }
  if(!showScoring){
    return [scores];
  }
  
  
  const scoresAndTotals: ScoresAndTotal[] = scores.map((score) => {
    return {
      finalScore: score,
      scores: [],
      total: 0,
      splitScore: [],
    };
  });
  let numScores = 0;
  const addScore = (playerId: string, score: number, isLast: boolean) => {
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
      if (isLast) {
        const startFrontPeg =
          scoresAndTotal.finalScore.frontPeg - scoresAndTotal.total;
        let accumulatedScore = 0;
        scoresAndTotal.splitScore = scoresAndTotal.scores.map((scoreToAdd) => {
          accumulatedScore += scoreToAdd;
          return {
            games: scoresAndTotal.finalScore.games,
            backPeg: 0, // this is not necessary for the cribboard !
            frontPeg: startFrontPeg + accumulatedScore,
          };
        });
      }
    });
  };

  addScore(peggedCard.owner, peggedCard.peggingScore.score, false);
  const boxIsScored = !!showScoring.boxScore;
  let boxPlayerId = "";
  const numPlayerScores = showScoring.playerShowScores.length;
  showScoring.playerShowScores.forEach((playerScore,index) => {
    const isLast = boxIsScored ? false : index === numPlayerScores - 1;
    boxPlayerId = playerScore.playerId;
    addScore(playerScore.playerId, playerScore.showScore.score, isLast);
  });
  if(showScoring.boxScore){
    addScore(boxPlayerId, showScoring.boxScore.score, true);
  }
  const splitScores = fill(numScores, (i) => {
    return scoresAndTotals.map((scoresAndTotal) => {
      return scoresAndTotal.splitScore[i];
    });
  });
  return splitScores;
}
