import { Button } from "@mui/material";
import { Ready, ReadyProps } from "./PlayMatch/Ready";
import { CribGameState } from "./generatedTypes";
import { useState } from "react";

let currentStage = 0;
const stages: ReadyProps[] = [
  {
    gameState: CribGameState.Show,
    meReady: {
      id: "me",
      ready: false,
      readyClickHandler: () => console.log("sending...."),
    },
    otherPlayersReady: [
      {
        id: "other.............................",
        ready: false,
      },
    ],
  },
  {
    gameState: CribGameState.Show,
    meReady: { id: "me", ready: true },
    otherPlayersReady: [
      {
        id: "other",
        ready: false,
      },
    ],
  },
  {
    gameState: CribGameState.Discard,
    meReady: { id: "me", ready: true },
    otherPlayersReady: [
      {
        id: "other",
        ready: false,
      },
    ],
  },
];
export function ReadyDemo() {
  const [readyProps, setReadyProps] = useState<ReadyProps>({
    gameState: CribGameState.Pegging,
    meReady: { id: "me", ready: false },
    otherPlayersReady: [
      {
        id: "other",
        ready: false,
      },
    ],
  });
  return (
    <>
      <Button
        style={{ display: "absolute" }}
        onClick={() => {
          const stage = stages[currentStage];
          setReadyProps(stage);
          currentStage++;
        }}
      >
        Next stage
      </Button>
      <Ready {...readyProps} />
    </>
  );
}
