import { CribGameState, PeggedCard, Score } from "../generatedTypes";
import { getPeggedScoreMessage } from "./signalRPeg";
import { EnqueueSnackbar } from "notistack";
import { getColouredScores } from "./getColouredScores";
import { SetCribboardState } from "./PlayMatchTypes";

export function peggingScored(
  peggedCard: PeggedCard,
  pegScoring: Score[],
  gameState: CribGameState,
  setCribBoardState: SetCribboardState,
  enqueueSnackbar: EnqueueSnackbar,
  cribBoardAnimationOnComplete: () => void
) {
  enqueueSnackbar(
    getPeggedScoreMessage(peggedCard.peggingScore, peggedCard.playingCard.pips),
    {
      variant: "success",
    }
  );
  switch (gameState) {
    case CribGameState.GameWon:
    case CribGameState.MatchWon:
      // todo - pegs are reset so need to determine score
      break;
    case CribGameState.Show:
    case CribGameState.Pegging:
      setCribBoardState({
        colouredScores: getColouredScores(pegScoring),
        onComplete: cribBoardAnimationOnComplete,
      });
  }
}
