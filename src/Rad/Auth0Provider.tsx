import {
  Auth0Context,
  Auth0ContextInterface,
  Auth0ProviderOptions,
  IdToken,
  User,
} from "@auth0/auth0-react";
import { AuthState } from "@auth0/auth0-react/src/auth-state";
import { useCallback, useMemo, useState, useContext } from "react";
import { RadHubManager } from "./RadHubManager";
import { PlayMatchContext, PlayMatchContextProvider } from "../PlayMatchContext";

export const Auth0Provider = (opts: Auth0ProviderOptions): JSX.Element => {
  const [state, setState] = useState<AuthState<User>>({
    isAuthenticated: false,
    isLoading: false,
  });
  const loginWithPopup = useCallback(() => {
    throw new Error("Function not implemented.");
  }, []);
  const getAccessTokenSilently = useCallback(() => {
    throw new Error("Function not implemented.");
  }, []);

  const getAccessTokenWithPopup = useCallback(() => {
    throw new Error("Function not implemented.");
  }, []);

  const loginWithRedirect = useCallback(() => {
    const newState: AuthState<User> = {
      isAuthenticated: true,
      isLoading: false,
      user: {
        email: "tonyhallett74@gmail.com",
      },
    };
    setState(newState);
  }, []);

  const logout = useCallback(() => {
    const newState: AuthState<User> = {
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
    };
    setState(newState);
  }, []);

  const handleRedirectCallback = useCallback(() => {
    throw new Error("Function not implemented.");
  }, []);

  const getIdTokenClaims = useCallback(() => {
    return Promise.resolve({
      __raw: "fake",
    } as unknown as IdToken);
  }, []);

  const contextValue: Auth0ContextInterface = useMemo(() => {
    return {
      ...state,
      getAccessTokenSilently,
      getAccessTokenWithPopup,
      getIdTokenClaims,
      loginWithRedirect,
      loginWithPopup,
      logout,
      handleRedirectCallback,
    };
  }, [
    state,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
    getIdTokenClaims,
    loginWithRedirect,
    loginWithPopup,
    logout,
    handleRedirectCallback,
  ]) as unknown as Auth0ContextInterface;

  const defaultPlayMatchContext = useContext(PlayMatchContext)

  return (
    <Auth0Context.Provider value={contextValue}>
      <PlayMatchContextProvider value={defaultPlayMatchContext}>
        <RadHubManager />
        {opts.children}
      </PlayMatchContextProvider>
    </Auth0Context.Provider>
  );
};
