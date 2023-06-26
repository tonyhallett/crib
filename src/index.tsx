import { createRoot } from "react-dom/client";
import App from "./App";
import { Auth0Provider as ActualAuth0Provider } from "@auth0/auth0-react";
import { Auth0Provider as RadAuth0Provider } from "./Rad/Auth0Provider";
import isParcelDevMode from "./utilities/isParcelDevMode";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { FixAnimationTest } from "./fixAnimationSequence/test";
import { SequenceAnimationDemo } from "./sequenceAnimationDemo";

const rootNode = document.getElementById("app");

const Auth0Provider = isParcelDevMode()
  ? RadAuth0Provider
  : ActualAuth0Provider;

const theme = createTheme({
  palette: {
    background: {
      default: "transparent",
    },
  },
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(rootNode!);
/* root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
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
); */
root.render(<FixAnimationTest/>)