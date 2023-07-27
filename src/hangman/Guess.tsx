import { Typography } from "@mui/material";
import { GuessDashes } from "./GuessDashes";
import { GuessedWord } from "./types";

export function Guess(props: { guessedWord: GuessedWord }) {
  const { guessedWord } = props;
  return (
    <Typography variant="h4">
      <GuessDashes guessedWord={guessedWord} />
    </Typography>
  );
}
