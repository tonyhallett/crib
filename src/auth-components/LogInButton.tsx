import { useAuth0 } from "@auth0/auth0-react";
import { IconButton } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";

export const LogInButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <IconButton onClick={() => loginWithRedirect()} color="inherit">
      <LoginIcon />
    </IconButton>
  );
  /* return <button
          onClick={() => {
            loginWithRedirect();
          }}
        >
          Log in
        </button> */
};
