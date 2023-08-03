import { createRoot } from "react-dom/client";
import App from "./App";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { Auth0Provider, Component } from "./Rad/getRad";
import { WordGrid } from "./wordsearch";

const rootNode = document.getElementById("app");

const theme = createTheme({
  palette: {
    background: {
      default: "transparent",
    },
  },
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(rootNode!);
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {Component}
    <Auth0Provider
      domain="dev-jzu1ks76wi2i513m.uk.auth0.com"
      clientId="WapDWTn1LyQMcXEfXSP6s7HvEQ9jegBZ"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://dev-jzu1ks76wi2i513m.uk.auth0.com/api/v2/",
        scope: "openid profile email read:current_user",
      }}
    >
      <SnackbarProvider maxSnack={3}>
        <App />
      </SnackbarProvider>
    </Auth0Provider>
  </ThemeProvider>
);
