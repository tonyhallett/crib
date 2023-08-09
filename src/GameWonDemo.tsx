import { Button } from "@mui/material";
import { useState } from "react";
import { GameWon, GameWonProps } from "./PlayMatch/GameWon";

export function GameWonDemo() {
  const [gameWonState, setGameState] = useState<GameWonProps | undefined>();
  return (
    <>
      <Button
        onClick={() => {
          setGameState({
            winner: "You*****************************************************",
          });
        }}
      >
        Game won
      </Button>
      {gameWonState && <GameWon {...gameWonState} />}
    </>
  );
}
