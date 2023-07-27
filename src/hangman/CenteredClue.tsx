import { Typography } from "@mui/material";
import { CenteredElement } from "./CenteredElement";

export function CenteredClue({ clue }: { clue: string }) {
  return (
    <CenteredElement>
      <Clue clue={clue} />
    </CenteredElement>
  );
}
export const Clue = ({ clue }: { clue: string }) => {
  return <Typography variant="h4">Clue: {clue}</Typography>;
};
