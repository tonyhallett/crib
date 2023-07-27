import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { HangmanApp } from "./HangmanApp";

export function HangmanRoot() {
  const theme = createTheme({
    typography: {
      fontFamily: "Indie Flower, cursive",
    },
    guess: {
      success: "green",
      failure: "red",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HangmanApp />
    </ThemeProvider>
  );
}
