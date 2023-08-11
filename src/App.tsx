import * as signalR from "@microsoft/signalr";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
} from "react";
import functionAppPath from "./utilities/functionAppPath";
import { clientFactory, CribHub, hubFactory, MyMatch } from "./generatedTypes";
import { isError } from "./utilities/typeHelpers";
import { cribStorage, signalRX } from "./Rad/getRad";
import { NavBar } from "./auth-components/NavBar";
import { DateTransformingJsonHubProtocol } from "./signalr/DateTransformingJsonHubProtocol";
import { LocalFriendship } from "./LocalMyFriend";
import { IdToken, useAuth0 } from "@auth0/auth0-react";
import {
  LocalMatch,
  createLocalMatch,
  removeDealIndicator,
} from "./localMatch";
import { AppBar, Badge, IconButton, Toolbar } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import { CardsIcon } from "./CardsIcon";
import { Matches } from "./Matches";
import { FetchingIndicator } from "./FetchingIndicator";
import { Friends } from "./Friends";
import {
  PlayMatchCribClient,
  PlayMatchCribClientMethods,
  PlayMatchProps,
} from "./PlayMatch/PlayMatchTypes";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { WoodWhenPlaying, woodUrl } from "./backgrounds/WoodWhenPlaying";
import GamesIcon from "@mui/icons-material/Games";
import { SnackbarAction } from "notistack";
import { useOrientation } from "./hooks/useOrientation";
import { useFullscreenFullscreenElement } from "./hooks/useFullscreen";
import { useWindowResize } from "./hooks/useWindowResize";
import { RequiresFullscreen } from "./RequiresFullscreen";
import cribBoardWoodUrl from "./backgrounds/cribBoardWoodUrl";
import { useImagePreload } from "./hooks/useImagePreload";
import { PlayMatchContext } from "./PlayMatchContext";
import { PlayMatch } from "./PlayMatch/PlayMatch";
import { useSnackbarWithDelay } from "./hooks/useSnackbarWithDelay";

type MenuItem = "Friends" | "Matches";

export const moreButtonZIndex = 1000;

export interface MatchDetail {
  localMatch: LocalMatch;
  match: MyMatch;
}

type CribConnection = ReturnType<(typeof clientFactory)["crib"]>;

function getLocalMatch(match: MyMatch) {
  return cribStorage.getMatch(match.id);
}
function ensureLocalMatch(match: MyMatch) {
  let localMatch = getLocalMatch(match);
  if (localMatch === null) {
    localMatch = createLocalMatch(match);
    cribStorage.setMatch(localMatch);
  }
  return localMatch;
}
export const playMatchSnackbarKey = "playmatch-snackbar";

/* eslint-disable complexity */
export default function App() {
  const playMatchContext = useContext(PlayMatchContext);
  // this is a hack - animations do not work the first time the two images are rendered
  const hasRenderAMatch = useRef(false);
  const cribBoardImageLoaded = useImagePreload(cribBoardWoodUrl);
  const woodImageLoaded = useImagePreload(woodUrl);
  const { enqueueSnackbar, stopDelayed, closeSnackbar } =
    useSnackbarWithDelay();
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
  // necessary as android is inconsistent with values when orientation changes
  const size = useWindowResize();
  const fullscreen = useFullscreenFullscreenElement();
  const [connected, setConnected] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [fetchedInitialData, setFetchedInitialData] = useState(false);
  const [friendships, setFriendships] = useState<LocalFriendship[]>([]);
  const [matchDetails, setMatchDetails] = useState<MatchDetail[]>([]);
  const matchDetailsRef = useRef<MatchDetail[]>([]);

  const [selectedMenuItem, setSelectedMenuItem] = useState<
    MenuItem | undefined
  >(undefined);
  const selectedMenuItemRef = useRef<MenuItem | undefined>(undefined);
  const [playMatchId, setPlayMatchId] = useState<string | undefined>(undefined);
  const playMatchIdRef = useRef<string | undefined>(undefined);

  const signalRRegistration = useCallback<
    PlayMatchProps["signalRRegistration"]
  >((playMatchCribClient) => {
    playMatchCribClientRef.current = playMatchCribClient;
    return () => {
      playMatchCribClientRef.current = undefined;
    };
  }, []);

  const fetchedAndAuthenticated = fetchedInitialData && isAuthenticated;
  const canPlayMatch =
    fetchedAndAuthenticated &&
    playMatchId !== undefined &&
    woodImageLoaded &&
    cribBoardImageLoaded;

  const setSelectedMenuItemAndRef = (menuItem: MenuItem | undefined) => {
    selectedMenuItemRef.current = menuItem;
    setSelectedMenuItem(menuItem);
  };
  const menuClickedHandler = useCallback((menuItem: MenuItem) => {
    setSelectedMenuItemAndRef(menuItem);
  }, []);

  const setMatchDetailsAndRef = (matchDetails: MatchDetail[]) => {
    matchDetailsRef.current = matchDetails;
    setMatchDetails(matchDetails);
  };

  const setPlayMatchIdAndRef = useCallback(
    (matchId: string | undefined) => {
      playMatchIdRef.current = matchId;
      setPlayMatchId(matchId);
      const matchDetail =
        matchId === undefined
          ? undefined
          : matchDetailsRef.current.find(
              (matchDetail) => matchDetail.match.id === matchId
            );
      playMatchContext.playMatch(matchDetail);
    },
    [playMatchContext]
  );

  const doPlayMatch = useCallback(
    (matchId: string) => {
      setSelectedMenuItemAndRef(undefined);
      setPlayMatchIdAndRef(matchId);
    },
    [setPlayMatchIdAndRef]
  );

  const enqueueMatchesSnackbar = useCallback(
    (matchId: string, matchTitle: string, matchAction: string) => {
      const action: SnackbarAction = (key) => {
        return (
          <IconButton
            onClick={() => {
              closeSnackbar(key);
              doPlayMatch(matchId);
            }}
          >
            <GamesIcon />
          </IconButton>
        );
      };

      enqueueSnackbar(`${matchAction} in '${matchTitle}' !`, {
        variant: "info",
        action,
      });
    },
    [doPlayMatch, enqueueSnackbar, closeSnackbar]
  );

  const updateLocalMatch = useCallback((newLocalMatch: LocalMatch) => {
    cribStorage.setMatch(newLocalMatch);
    const updatedMatchDetails = matchDetailsRef.current.map((matchDetail) => {
      if (matchDetail.match.id === newLocalMatch.id) {
        return { ...matchDetail, localMatch: newLocalMatch };
      }
      return matchDetail;
    });
    setMatchDetailsAndRef(updatedMatchDetails);
  }, []);

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

      const gameAction = <TAction extends keyof PlayMatchCribClientMethods>(
        action: TAction,
        myMatch: MyMatch,
        args: Parameters<PlayMatchCribClientMethods[TAction]>
      ) => {
        const actionMessage = action[0].toUpperCase() + action.slice(1);
        const matchDetails = matchDetailsRef.current;
        const matchDetail = matchDetails.find(
          (matchDetail) => matchDetail.match.id === myMatch.id
        );
        if (matchDetail === undefined) {
          // tbd
          throw new Error(`${actionMessage} but no match`);
        }
        const newMatchDetail: MatchDetail = {
          ...matchDetail,
          match: myMatch,
        };
        const newLocalMatch = removeDealIndicator(matchDetail.localMatch);
        if (newLocalMatch) {
          cribStorage.setMatch(newLocalMatch);
          newMatchDetail.localMatch = newLocalMatch;
        }

        const playMatchId = playMatchIdRef.current;
        if (playMatchId === myMatch.id) {
          (playMatchCribClientRef.current as PlayMatchCribClient)[action].apply(
            null,
            args
          );
        } else {
          enqueueMatchesSnackbar(myMatch.id, myMatch.title, actionMessage);
        }

        setMatchDetailsAndRef(
          matchDetails.map((matchDetail) => {
            if (matchDetail.match.id === myMatch.id) {
              return newMatchDetail;
            }
            return matchDetail;
          })
        );
        playMatchContext.playMatch(newMatchDetail);
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const cribConnection = clientFactory.crib(connection, {
        initialPlayerData(friendships, matches) {
          setFriendships(
            friendships.map((f) => {
              return { ...f, fromServer: true };
            })
          );
          const matchDetails = matches.map((match) => {
            return {
              localMatch: ensureLocalMatch(match),
              match,
            };
          });
          setMatchDetailsAndRef(matchDetails);
          setFetchedInitialData(true);
        },

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        discard(playerId, myMatch) {
          gameAction("discard", myMatch, [playerId, myMatch]);
        },

        // common code for removing deal indicator

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
        peg(playerId, peggedCard, myMatch) {
          gameAction("peg", myMatch, [playerId, peggedCard, myMatch]);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ready(playerId, myMatch) {
          gameAction("ready", myMatch, [playerId, myMatch]);
        },
        go(playerId, myMatch) {
          gameAction("go", myMatch, [playerId, myMatch]);
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
  }, [
    isAuthenticated,
    connected,
    getIdTokenClaims,
    enqueueMatchesSnackbar,
    updateLocalMatch,
    playMatchContext,
  ]);
  useEffect(() => {
    if (!hasRenderAMatch.current && canPlayMatch) {
      hasRenderAMatch.current = true;
    }
  });
  useEffect(() => {
    return () => {
      if (playMatchIdRef.current === undefined) {
        closeSnackbar(playMatchSnackbarKey);
        stopDelayed(playMatchSnackbarKey);
      }
    };
  });
  const playMatchCribHub = useMemo<PlayMatchProps["playMatchCribHub"]>(
    () => ({
      discard(discard1, discard2) {
        (cribHubRef.current as CribHub).discard(
          playMatchId as string,
          discard1,
          discard2
        );
      },
      peg(peggedCard) {
        (cribHubRef.current as CribHub).peg(playMatchId as string, peggedCard);
      },
      ready() {
        (cribHubRef.current as CribHub).ready(playMatchId as string);
      },
    }),
    [playMatchId]
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

  const showMenuComponents =
    fetchedAndAuthenticated && playMatchId === undefined;
  const friendshipsIcon = fetchedAndAuthenticated ? (
    <Badge badgeContent={friendships.length}>
      <PeopleIcon fontSize="large" />
    </Badge>
  ) : (
    <PeopleIcon fontSize="large" />
  );

  const matchesIcon = fetchedAndAuthenticated ? (
    <Badge badgeContent={matchDetails.length}>{CardsIcon}</Badge>
  ) : (
    CardsIcon
  );
  const playMatch = matchDetails.find((matchDetail) => {
    return matchDetail.match.id === playMatchId;
  });
  return (
    <div>
      {woodImageLoaded && <WoodWhenPlaying playing={!!playMatchId} />}
      {!playMatchId && (
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
      )}
      {!!playMatchId && (
        <IconButton
          style={{ position: "absolute", zIndex: moreButtonZIndex, bottom: 0 }}
          size="small"
          color="primary"
          onClick={() => setPlayMatchIdAndRef(undefined)}
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
        <Matches matchDetails={matchDetails} playMatch={doPlayMatch} />
      )}
      {canPlayMatch && (
        <PlayMatch
          hasRenderedAMatch={hasRenderAMatch.current}
          landscape={landscape}
          key={`${landscape.toString()}-${playMatchId}-${size.width}-${
            size.height
          }`}
          matchDetail={playMatch as MatchDetail}
          signalRRegistration={signalRRegistration}
          playMatchCribHub={playMatchCribHub}
          updateLocalMatch={updateLocalMatch}
        />
      )}
      <div>{connectError}</div>
    </div>
  );
}
