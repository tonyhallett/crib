import { useAuth0 } from "@auth0/auth0-react";
import { LogInButton } from "./LogInButton";
import { LogOutButton } from "./LogOutButton";

export const NavBar = () => {
  const { isAuthenticated } = useAuth0();
  return isAuthenticated ? <LogOutButton /> : <LogInButton />;
};
