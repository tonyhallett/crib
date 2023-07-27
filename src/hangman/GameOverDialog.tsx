import { Button, Dialog, DialogTitle, DialogActions } from "@mui/material";
import { GamePlayState } from "./getGameState";

export function GameOverDialog({
  playState,
  winMessage,
  loseMessage,
  tryAgain,
  nextWord,
  pickNextWord,
}: {
  playState: GamePlayState;
  winMessage: string;
  loseMessage: string;
  tryAgain: () => void;
  nextWord: () => void;
  pickNextWord: () => void;
}) {
  const gameOver = playState !== GamePlayState.PLAYING;
  const gameOverMessage =
    playState === GamePlayState.WON ? winMessage : loseMessage;

  return (
    <Dialog open={gameOver}>
      <DialogTitle>{gameOverMessage}</DialogTitle>
      <DialogActions>
        {playState === GamePlayState.LOST && (
          <Button variant="contained" onClick={tryAgain}>
            Try Again ?
          </Button>
        )}
        <Button variant="contained" onClick={nextWord}>
          Next Word
        </Button>
        <Button variant="contained" onClick={pickNextWord}>
          Pick Next Word
        </Button>
      </DialogActions>
    </Dialog>
  );
}
