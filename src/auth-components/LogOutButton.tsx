import { useAuth0 } from "@auth0/auth0-react";
import LogoutIcon from "@mui/icons-material/Logout";
import { IconButton } from "@mui/material";

export const LogOutButton = () => {
  const { logout } = useAuth0();

  const logoutWithRedirect = () =>
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });

  return (
    <IconButton onClick={logoutWithRedirect} color="inherit">
      <LogoutIcon />
    </IconButton>
  );
};
