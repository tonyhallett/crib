export interface GuessedWord {
  word: string;
  clue: string;
  guessedLetters: string[];
  // for simplicity could add state
}

declare module "@mui/material/styles" {
  interface Theme {
    guess: {
      success: string;
      failure: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    guess: {
      success: string;
      failure: string;
    };
  }
}
