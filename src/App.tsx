import * as signalR from "@microsoft/signalr";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import functionAppPath from "./utilities/functionAppPath";
import {
  clientFactory,
  CribClient,
  CribHub,
  hubFactory,
  MyMatch,
} from "./generatedTypes";
import { isError } from "./utilities/typeHelpers";
import { cribStorage, signalRX } from "./Rad/getRad";
import { NavBar } from "./auth-components/NavBar";
import { DateTransformingJsonHubProtocol } from "./signalr/DateTransformingJsonHubProtocol";
import { LocalFriendship } from "./LocalMyFriend";
import { IdToken, useAuth0 } from "@auth0/auth0-react";
import { LocalMatch, createLocalMatch } from "./LocalMatch";
import { AppBar, Badge, Collapse, IconButton, Toolbar } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import { CardsIcon } from "./CardsIcon";
import { Matches } from "./Matches";
import { FetchingIndicator } from "./FetchingIndicator";
import { Friends } from "./Friends";
import {
  PlayMatch,
  PlayMatchCribClient,
  PlayMatchCribHub,
  PlayMatchProps,
} from "./PlayMatch/PlayMatch";
import { closeSnackbar, useSnackbar } from "notistack";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { WoodWhenPlaying } from "./WoodWhenPlaying";
import GamesIcon from "@mui/icons-material/Games";
import { SnackbarAction } from "notistack";
import { useOrientation } from "./hooks/useOrientation";
import { useFullscreen } from "./hooks/useFullscreen";
import { RequiresFullscreen } from "./RequiresFullscreen";

type MenuItem = "Friends" | "Matches";

interface PlayMatch {
  localMatch: LocalMatch;
  match: MyMatch;
}

type CribConnection = ReturnType<(typeof clientFactory)["crib"]>;

/* eslint-disable complexity */
export default function App() {
  const { enqueueSnackbar } = useSnackbar();
  const cribHubRef = useRef<CribHub | undefined>(undefined);
  const playMatchCribClientRef = useRef<PlayMatchCribClient | undefined>(
    undefined
  );
  const cribConnectionRef = useRef<CribConnection | undefined>(undefined);
  const signalRHubConnectionRef = useRef<signalR.HubConnection | undefined>(
    undefined
  );

  const { isLoading, error, isAuthenticated, getIdTokenClaims } = useAuth0();
  const landscape = useOrientation();
  const fullscreen = useFullscreen();
  const [connected, setConnected] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [fetchedInitialData, setFetchedInitialData] = useState(false);
  const [friendships, setFriendships] = useState<LocalFriendship[]>([]);
  const [matches, setMatches] = useState<MyMatch[]>([]);
  const matchesRef = useRef<MyMatch[]>([]);
  const [localMatches, setLocalMatches] = useState<LocalMatch[]>([]);
  const localMatchesRef = useRef<LocalMatch[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<
    MenuItem | undefined
  >(undefined);
  const selectedMenuItemRef = useRef<MenuItem | undefined>(undefined);
  const [playMatch, setPlayMatch] = useState<PlayMatch | undefined>(undefined);
  const playMatchRef = useRef<PlayMatch | undefined>(undefined);

  const signalRRegistration = useCallback<
    PlayMatchProps["signalRRegistration"]
  >((playMatchCribClient) => {
    playMatchCribClientRef.current = playMatchCribClient;
    return () => {
      playMatchCribClientRef.current = undefined;
    };
  }, []);

  const setSelectedMenuItemAndRef = (menuItem: MenuItem | undefined) => {
    selectedMenuItemRef.current = menuItem;
    setSelectedMenuItem(menuItem);
  };
  const menuClickedHandler = useCallback((menuItem: MenuItem) => {
    setSelectedMenuItemAndRef(menuItem);
  }, []);

  const setLocalMatchesAndRef = (localMatches:LocalMatch[]) => {
    localMatchesRef.current = localMatches;
    setLocalMatches(localMatches);
  }
  const setMatchesAndRef = (matches: MyMatch[]) => {
    matchesRef.current = matches;
    setMatches(matches);
  };

  const setPlayMatchAndRef = (playMatch: PlayMatch | undefined) => {
    playMatchRef.current = playMatch;
    setPlayMatch(playMatch);
  };

  const doPlayMatch = useCallback((match: MyMatch, localMatch: LocalMatch) => {
    setSelectedMenuItemAndRef(undefined);
    document.documentElement.requestFullscreen();
    setPlayMatchAndRef({ localMatch, match });
  }, []);

  const enqueueMatchesSnackbar = useCallback(
    (myMatch: MyMatch) => {
      const action: SnackbarAction = (key) => {
        return (
          <IconButton
            onClick={() => {
              closeSnackbar(key);
              const localMatch = localMatchesRef.current.find(
                (localMatch) => localMatch?.id === myMatch.id
              );
              doPlayMatch(myMatch, localMatch as LocalMatch);
            }}
          >
            <GamesIcon />
          </IconButton>
        );
      };

      enqueueSnackbar(`Action in '${myMatch.title}' !`, {
        variant: "info",
        action,
      });
    },
    [doPlayMatch, enqueueSnackbar]
  );

  useEffect(() => {
    async function signalRConnect() {
      //todo store the connection and more configuration
      const connection = new signalRX.HubConnectionBuilder()
        .withUrl(`${functionAppPath}/api`, {
          async accessTokenFactory() {
            const claims = await getIdTokenClaims();
            return (claims as IdToken).__raw;
          },
        })
        .withHubProtocol(new DateTransformingJsonHubProtocol())
        .configureLogging(signalR.LogLevel.Trace)
        .build();
      signalRHubConnectionRef.current = connection;
      const cribHub = hubFactory.crib(connection);
      cribHubRef.current = cribHub;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const cribConnection = clientFactory.crib(connection, {
        initialPlayerData(friendships, matches) {
          //setMatches(matches);
          setMatchesAndRef(matches);
          setFriendships(
            friendships.map((f) => {
              return { ...f, fromServer: true };
            })
          );

          const localMatches = matches.map((match) => {
            let localMatch = cribStorage.getMatch(match.id);
            if (localMatch === null) {
              localMatch = createLocalMatch(match);
              cribStorage.setMatch(localMatch);
            }
            return localMatch;
          });
          setLocalMatchesAndRef(localMatches);
          setFetchedInitialData(true);
        },

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        discard(matchId, playerId, cutCard, myMatch) {
          const matches = matchesRef.current;

          const playMatch = playMatchRef.current;
          let showSnackbar = true;
          if (playMatch && playMatch.match.id === matchId) {
            showSnackbar = false;
            playMatchCribClientRef.current?.discard(playerId, cutCard, myMatch);
          }
          //if(selectedMenuItemRef.current !== "Matches"){
          if (showSnackbar) {
            enqueueMatchesSnackbar(myMatch);
          }
          //}
          setMatchesAndRef(
            matches.map((match) => {
              if (match.id === myMatch.id) {
                return myMatch;
              }
              return match;
            })
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        friendRequest(friendship) {
          //todo
          //enqueueSnackbar('You have a friend request !', { variant:"info" });
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        friendRequestAccepted(inviterFriendship) {
          //
          //enqueueSnackbar('Friend request accepted !', { variant:"info" });
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        matchCreated(match) {
          //
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sentFriendRequests(inviterFriendships) {
          //
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        peg(matchId, playerId, peggedCard, myMatch) {
          /* const matchWithChange = matches.find((m) => m.id === matchId);
          if(matchWithChange){
            if(selectedMenuItem !== "Matches"){
              enqueueSnackbar('There has been match action !', { variant:"info" });
            }
            
            setMatches(matches.map(match => {
              if(match === matchWithChange){
                return myMatch;
              }
              return match;
            }))
          } */
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ready(matchId, playerId, myMatch) {
          /* const match = matches.find((m) => m.id === matchId);
          if(match){
            if(selectedMenuItem !== "Matches"){
              enqueueSnackbar('There has been match action !', { variant:"info" });
            }
          } */
        },
      });
      cribConnectionRef.current = cribConnection;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      connection.onclose((possibleError) => {
        //const msg = "Connection closed " + (possibleError ? possibleError.message : "");
        //alert(msg);
        //setConnected(false);// which will connect again !
      });

      try {
        await connection.start();
        setConnected(true);
        await cribHub.initialPlayerData(); // consider if catch should catch this
      } catch (e) {
        const connectError = isError(e) ? e.message : "Error connecting";
        setConnectError(connectError);
      }
    }
    if (isAuthenticated && !connected) {
      signalRConnect();
    }
  }, [isAuthenticated, connected, getIdTokenClaims, enqueueMatchesSnackbar]);

  const playMatchCribHub = useMemo<PlayMatchProps["playMatchCribHub"]>(
    () => ({
      discard(discard1, discard2) {
        (cribHubRef.current as CribHub).discard(
          (playMatch as PlayMatch).match.id,
          discard1,
          discard2
        );
      },
      peg(peggedCard) {
        (cribHubRef.current as CribHub).peg(
          (playMatch as PlayMatch).match.id,
          peggedCard
        );
      },
      ready() {
        (cribHubRef.current as CribHub).ready(
          (playMatch as PlayMatch).match.id
        );
      },
    }),
    [playMatch]
  );

  if (!fullscreen) {
    return (
      <>
        <RequiresFullscreen />
      </>
    );
  }
  if (error) {
    return <div>Error !</div>;
  }

  if (isLoading) {
    return <div>Loading</div>;
  }

  const fetchedAndAuthenticated = fetchedInitialData && isAuthenticated;
  const showMenuComponents = fetchedAndAuthenticated && playMatch === undefined;
  const friendshipsIcon = fetchedAndAuthenticated ? (
    <Badge badgeContent={friendships.length}>
      <PeopleIcon fontSize="large" />
    </Badge>
  ) : (
    <PeopleIcon fontSize="large" />
  );

  const matchesIcon = fetchedAndAuthenticated ? (
    <Badge badgeContent={matches.length}>{CardsIcon}</Badge>
  ) : (
    CardsIcon
  );
  
  return (
    <div>
      <WoodWhenPlaying playing={!!playMatch} />
      {/* adding orientation reduced width of app bar  */}
      <Collapse in={!playMatch}>
        <AppBar position="sticky">
          <Toolbar>
            <NavBar />
            <IconButton
              disabled={!fetchedAndAuthenticated}
              onClick={() => menuClickedHandler("Matches")}
            >
              {matchesIcon}
            </IconButton>
            <IconButton
              disabled={!fetchedAndAuthenticated}
              onClick={() => menuClickedHandler("Friends")}
            >
              {friendshipsIcon}
            </IconButton>
          </Toolbar>
        </AppBar>
      </Collapse>
      {!!playMatch && (
        <IconButton
          style={{ position: "absolute" }}
          size="small"
          color="primary"
          onClick={() => setPlayMatch(undefined)}
        >
          <MoreHorizIcon />
        </IconButton>
      )}
      {isAuthenticated && !fetchedInitialData && <FetchingIndicator />}
      {showMenuComponents && selectedMenuItem === "Friends" && (
        <Friends
          friendships={friendships}
          acceptFriendship={(cribHubRef.current as CribHub).acceptFriendRequest}
        />
      )}
      {showMenuComponents && selectedMenuItem === "Matches" && (
        <Matches
          matches={matches}
          localMatches={localMatches}
          playMatch={doPlayMatch}
        />
      )}
      {fetchedAndAuthenticated && playMatch && (
        <PlayMatch
          key={`${landscape.toString()}${playMatch.match.id}`}
          myMatch={playMatch.match}
          localMatch={playMatch.localMatch}
          signalRRegistration={signalRRegistration}
          playMatchCribHub={playMatchCribHub}
          updateLocalMatch={(newLocalMatch) => {
            cribStorage.setMatch(newLocalMatch);
            const updatedLocalMatches = localMatches.map((localMatch) => {
              if (localMatch) {
                if (localMatch.id === newLocalMatch.id) {
                  return newLocalMatch;
                }
              }
              return localMatch;
            })
            setLocalMatchesAndRef(updatedLocalMatches);
          }}
        />
      )}
      <div>{connectError}</div>
    </div>
  );
}
