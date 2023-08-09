import { PeggedCard, Score } from "../../../generatedTypes";
import { getPeggedScoreMessage } from "../../signalRPeg";
import { EnqueueSnackbar } from "notistack";
import { getColouredScores } from "../../getColouredScores";
import { SetCribboardState } from "../../PlayMatchTypes";
import { playMatchSnackbarKey } from "../../../App";

export function peggingScored(
  peggedCard: PeggedCard,
  pegScoring: Score[],
  setCribBoardState: SetCribboardState,
  enqueueSnackbar: EnqueueSnackbar,
  peggingScoreSnackbarDurationSeconds: number,
  cribBoardAnimationOnComplete: (() => void) | undefined
) {
  enqueueSnackbar(
    getPeggedScoreMessage(peggedCard.peggingScore, peggedCard.playingCard.pips),
    {
      variant: "success",
      key: playMatchSnackbarKey,
      autoHideDuration: peggingScoreSnackbarDurationSeconds * 1000,
    }
  );
  setCribBoardState({
    colouredScores: getColouredScores(pegScoring),
    onComplete: cribBoardAnimationOnComplete
  });
}
