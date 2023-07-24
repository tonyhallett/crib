import { MyMatch, PlayingCard, Score, ShowScoring } from "../generatedTypes";
import { PlayerPositions } from "./matchLayoutManager";
import { getPlayerPositions } from "./getPlayerPositions";
import { defaultCribBoardDuration } from "../crib-board/AnimatedCribBoard";
import { moveCutCardToPlayerHand } from "./signalRPeg";
import { DelayEnqueueSnackbar } from "../hooks/useSnackbarWithDelay";
import { VariantType } from "notistack";
import { CardsAndOwners, getPlayerScorings, getShowAnimator } from "./theShow";
import { getColouredScores } from "./getColouredScores";
import { FlipCardData, SetCribboardState } from "./PlayMatchTypes";

export interface ShowAndScoreAnimationOptions {
  at: number;
  moveCutCardDuration: number;
  scoreMessageDuration: number;
}

export function showAndScore(
  showScoring: ShowScoring,
  cardsAndOwners: CardsAndOwners,
  cutCard: FlipCardData,
  pegShowScoring: Score[][],
  box: PlayingCard[],
  animationOptions: ShowAndScoreAnimationOptions,
  setCribBoardState: SetCribboardState,
  delayEnqueueSnackbar: DelayEnqueueSnackbar,
  myMatch: MyMatch,
  playerPositions: PlayerPositions[]
) {
  const { moveCutCardDuration, scoreMessageDuration } = animationOptions;
  let at = animationOptions.at;
  const showAndWaitForSnackbar = (msg: string, variant: VariantType) => {
    delayEnqueueSnackbar(at * 1000, msg, {
      variant,
      autoHideDuration: scoreMessageDuration * 1000,
    });
    at += scoreMessageDuration;
  };
  const showAnimator = getShowAnimator();
  // for now game not won and there is a box score
  const playerScorings = getPlayerScorings(
    showScoring,
    cardsAndOwners,
    cutCard,
    box
  );
  // eslint-disable-next-line complexity
  playerScorings.forEach((playerScoring, i) => {
    const isBox = i === playerScorings.length - 1;
    if (!isBox) {
      moveCutCardToPlayerHand(
        cutCard,
        at,
        moveCutCardDuration,
        getPlayerPositions(
          myMatch.myId,
          playerScoring.playerId,
          playerPositions,
          myMatch.otherPlayers
        ).discard
      );
      at += moveCutCardDuration;
    }

    const showScoreParts = playerScoring.showScoreParts;
    if (showScoreParts.length === 0) {
      // todo have option for player id
      showAndWaitForSnackbar(
        `${playerScoring.playerId} ${isBox ? "box " : ""}scored 19 !`,
        "info"
      );
    } else {
      if (isBox) {
        // do box movement and increment at
      }
      at += showAnimator.initialize(at, playerScoring.showCardDatas);
    }

    let scoreTotal = 0;
    playerScoring.showScoreParts.forEach((showScorePart) => {
      at += showAnimator.showScorePart(
        at,
        showScorePart.scoringCards,
        showScorePart.notScoringCards
      );

      scoreTotal += showScorePart.score;
      showAndWaitForSnackbar(
        `${showScorePart.description} ${scoreTotal}`,
        "success"
      );
    });
    const showScoring = pegShowScoring.shift() as Score[];
    if (showScoreParts.length !== 0) {
      at += showAnimator.finalize(at, playerScoring.showCardDatas);
      setTimeout(() => {
        setCribBoardState({
          colouredScores: getColouredScores(showScoring),
        });
      }, at * 1000);
      at += defaultCribBoardDuration;
    }
    // playerScoringFinishedAnimation -
  });
}
