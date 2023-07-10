import { useCallback, useState } from "react";
import { RadHubConnectionInstance } from "./RadHubConnection";
import {
  MyMatch,
  Friendship,
  FriendshipStatus,
  CribGameState,
  PlayingCard,
  PlayerScoringHistory,
  ShowScoring,
  PegScoring,
} from "../generatedTypes";
import { motion } from "framer-motion";
import { cribStorage } from "./getRad";
import { LocalMatch } from "../LocalMatch";
import {
  AceSpades,
  EightSpades,
  FiveSpades,
  FourSpades,
  JackSpades,
  KingSpades,
  NineSpades,
  QueenSpades,
  SevenSpades,
  SixSpades,
  TenSpades,
  ThreeSpades,
  TwoSpades,
} from "../../test-helpers/cards";

export function RadHubManager() {
  const addInitialPlayerDataClickHandler = useCallback(() => {
    const myFriends: Friendship[] = [
      {
        status: FriendshipStatus.Accepted,
        player: "tonyhallett74@gmail.com",
        isInviter: true,
        inviteDate: new Date(),
        friend: "friend1",
        id: "id1",
        otherId: "otherid1",
      },
      {
        status: FriendshipStatus.Pending,
        player: "tonyhallett74@gmail.com",
        isInviter: true,
        inviteDate: new Date(),
        friend: "friend2",
        id: "id2",
        otherId: "otherid2",
      },
      {
        status: FriendshipStatus.Rejected,
        player: "tonyhallett74@gmail.com",
        isInviter: false,
        inviteDate: new Date(),
        friend: "friend3",
        id: "id3",
        otherId: "otherid3",
      },
    ];
    const matches: MyMatch[] = [
      {
        id: "New game",
        changeHistory: {
          lastChangeDate: new Date("19 May 2023 09:00"),
          matchCreationDate: new Date("20 December 2022 14:48"),
          numberOfActions: 1,
        },
        title: "New game",
        gameState: CribGameState.Discard,
        box: [],
        myCards: [
          AceSpades,
          QueenSpades,
          KingSpades,
          JackSpades,
          FourSpades,
          ThreeSpades,
        ],
        cutCard: undefined as unknown as PlayingCard, //todo generation should be optional
        scores: [
          { games: 1, frontPeg: 22, backPeg: 9 },
          { games: 2, frontPeg: 12, backPeg: 4 },
        ],
        pegging: {
          turnedOverCards: [],
          inPlayCards: [],
          goHistory: [],
          nextPlayer: "Player2",
          cannotGoes: [false],
          myCannotGo: false,
        },
        myId: "Me",
        dealerDetails: {
          first: "Me",
          current: "Player2",
        },
        myReady: false,
        matchWinDeterminant: "BestOf_3",
        myScoringHistory: null as unknown as PlayerScoringHistory,
        otherPlayers: [
          {
            id: "Player2",
            discarded: false,
            playerScoringHistory: null as unknown as PlayerScoringHistory,
            ready: false,
          },
        ],
        showScoring: undefined as unknown as ShowScoring, //  //todo generation should be optional
      },
      {
        id: "I discarded",
        changeHistory: {
          lastChangeDate: new Date("19 May 2023 09:00"),
          matchCreationDate: new Date("20 December 2022 14:48"),
          numberOfActions: 1,
        },
        title: "I discarded",
        gameState: CribGameState.Discard,
        box: [],
        myCards: [AceSpades, QueenSpades, KingSpades, JackSpades],
        cutCard: undefined as unknown as PlayingCard, //todo generation should be optional
        scores: [
          { games: 1, frontPeg: 22, backPeg: 9 },
          { games: 2, frontPeg: 12, backPeg: 4 },
        ],
        pegging: {
          turnedOverCards: [],
          inPlayCards: [],
          goHistory: [],
          nextPlayer: "Player2",
          cannotGoes: [false],
          myCannotGo: false,
        },
        myId: "Me",
        dealerDetails: {
          first: "Me",
          current: "Player2",
        },
        myReady: false,
        matchWinDeterminant: "BestOf_3",
        myScoringHistory: null as unknown as PlayerScoringHistory,
        otherPlayers: [
          {
            id: "Player2",
            discarded: false,
            playerScoringHistory: null as unknown as PlayerScoringHistory,
            ready: false,
          },
        ],
        showScoring: undefined as unknown as ShowScoring, //  //todo generation should be optional
      },
      {
        id: "3 player discard",
        changeHistory: {
          lastChangeDate: new Date("19 May 2023 09:00"),
          matchCreationDate: new Date("20 December 2022 14:48"),
          numberOfActions: 1,
        },
        title: "3 player discard",
        gameState: CribGameState.Discard,
        box: [],
        myCards: [AceSpades, QueenSpades, KingSpades, JackSpades, TwoSpades],
        cutCard: undefined as unknown as PlayingCard, //todo generation should be optional
        scores: [
          { games: 1, frontPeg: 22, backPeg: 9 },
          { games: 2, frontPeg: 12, backPeg: 4 },
          { games: 0, frontPeg: 1, backPeg: 2 },
        ],
        pegging: {
          turnedOverCards: [],
          inPlayCards: [],
          goHistory: [],
          nextPlayer: "Player2",
          cannotGoes: [false, false],
          myCannotGo: false,
        },
        myId: "Me",
        dealerDetails: {
          first: "Me",
          current: "Player2",
        },
        myReady: false,
        matchWinDeterminant: "BestOf_3",
        myScoringHistory: null as unknown as PlayerScoringHistory,
        otherPlayers: [
          {
            id: "Player2",
            discarded: false,
            playerScoringHistory: null as unknown as PlayerScoringHistory,
            ready: false,
          },
          {
            id: "Player3",
            discarded: true,
            playerScoringHistory: null as unknown as PlayerScoringHistory,
            ready: false,
          },
        ],
        showScoring: undefined as unknown as ShowScoring, //  //todo generation should be optional
      },
      {
        id: "3",
        changeHistory: {
          lastChangeDate: new Date("19 May 2023 09:00"),
          matchCreationDate: new Date("20 December 2022 14:48"),
          numberOfActions: 7,
        },
        title: "2 player pegging",
        gameState: CribGameState.Pegging,
        box: [],
        myCards: [AceSpades, QueenSpades],
        cutCard: TwoSpades,
        scores: [
          { games: 1, frontPeg: 22, backPeg: 9 },
          { games: 2, frontPeg: 12, backPeg: 4 },
        ],
        pegging: {
          turnedOverCards: [
            {
              owner: "Me",
              playingCard: ThreeSpades,
              peggingScore: null as unknown as PegScoring,
            },
            {
              owner: "Player2",
              playingCard: TwoSpades,
              peggingScore: null as unknown as PegScoring,
            },
          ],
          // temp two in a row
          inPlayCards: [
            {
              owner: "Me",
              playingCard: FourSpades,
              peggingScore: null as unknown as PegScoring,
            },
            {
              owner: "Player2",
              playingCard: KingSpades,
              peggingScore: null as unknown as PegScoring,
            },
            {
              owner: "Me",
              playingCard: JackSpades,
              peggingScore: null as unknown as PegScoring,
            },
          ],
          goHistory: [],
          nextPlayer: "Player2",
          cannotGoes: [false],
          myCannotGo: false,
        },
        myId: "Me",
        dealerDetails: {
          first: "Me",
          current: "Me",
        },
        myReady: false,
        matchWinDeterminant: "BestOf_3",
        myScoringHistory: null as unknown as PlayerScoringHistory,
        otherPlayers: [
          {
            id: "Player2",
            discarded: true,
            playerScoringHistory: null as unknown as PlayerScoringHistory,
            ready: false,
          },
        ],
        showScoring: undefined as unknown as ShowScoring, //  //todo generation should be optional
      },
      /* {
        id: "4",
        changeHistory: {
          lastChangeDate: new Date("19 May 2023 09:00"),
          matchCreationDate: new Date("20 December 2022 14:48"),
        },
        title: "2 player pegging - 8 cards",
        gameState: CribGameState.Pegging,
        box: [],
        myCards: [],
        cutCard: TwoSpades,
        scores: [
          { games: 1, frontPeg: 22, backPeg: 9 },
          { games: 2, frontPeg: 12, backPeg: 4 },
        ],
        pegging: {
          turnedOverCards: [
          ],
          inPlayCards: [
            { owner: "Me", playingCard: KingSpades },
            { owner: "Player2", playingCard: KingSpades },
            { owner: "Me", playingCard: KingSpades },
            { owner: "Player2", playingCard: KingSpades },
            { owner: "Me", playingCard: KingSpades },
            { owner: "Player2", playingCard: KingSpades },
            { owner: "Me", playingCard: KingSpades },
            { owner: "Player2", playingCard: KingSpades },
          ],
          goHistory: [],
          nextPlayer: "Player2",
          cannotGoes: [false, false],
        },
        myId: "Me",
        dealerDetails: {
          first: "Me",
          current: "Me",
        },
        myReady: false,
        matchWinDeterminant: "BestOf_3",
        myScoringHistory: null as unknown as PlayerScoringHistory,
        otherPlayers: [
          {
            id: "Player2",
            discarded: true,
            playerScoringHistory: null as unknown as PlayerScoringHistory,
            ready: false,
          },
        ],
      }, */
      {
        id: "5",
        changeHistory: {
          lastChangeDate: new Date("19 May 2023 09:00"),
          matchCreationDate: new Date("20 December 2022 14:48"),
          numberOfActions: 14,
        },
        title: "3 player pegging",
        gameState: CribGameState.Pegging,
        box: [],
        myCards: [],
        cutCard: TwoSpades,
        scores: [
          { games: 1, frontPeg: 22, backPeg: 9 },
          { games: 2, frontPeg: 12, backPeg: 4 },
          { games: 2, frontPeg: 12, backPeg: 4 },
        ],
        pegging: {
          turnedOverCards: [],
          inPlayCards: [
            {
              owner: "Me",
              playingCard: AceSpades,
              peggingScore: null as unknown as PegScoring,
            },
            {
              owner: "Player2",
              playingCard: TwoSpades,
              peggingScore: null as unknown as PegScoring,
            },
            {
              owner: "Player3",
              playingCard: ThreeSpades,
              peggingScore: null as unknown as PegScoring,
            },
            {
              owner: "Me",
              playingCard: FourSpades,
              peggingScore: null as unknown as PegScoring,
            },
            {
              owner: "Player2",
              playingCard: FiveSpades,
              peggingScore: null as unknown as PegScoring,
            },
            {
              owner: "Player3",
              playingCard: SixSpades,
              peggingScore: null as unknown as PegScoring,
            },
            {
              owner: "Me",
              playingCard: SevenSpades,
              peggingScore: null as unknown as PegScoring,
            },
            {
              owner: "Player2",
              playingCard: EightSpades,
              peggingScore: null as unknown as PegScoring,
            },
            {
              owner: "Player3",
              playingCard: NineSpades,
              peggingScore: null as unknown as PegScoring,
            },
            {
              owner: "Me",
              playingCard: TenSpades,
              peggingScore: null as unknown as PegScoring,
            },
            {
              owner: "Player2",
              playingCard: JackSpades,
              peggingScore: null as unknown as PegScoring,
            },
            //{ owner: "Player3", playingCard: JackSpades },
          ],
          goHistory: [],
          nextPlayer: "Player2",
          cannotGoes: [false, false],
          myCannotGo: false,
        },
        myId: "Me",
        dealerDetails: {
          first: "Me",
          current: "Me",
        },
        myReady: false,
        matchWinDeterminant: "BestOf_3",
        myScoringHistory: null as unknown as PlayerScoringHistory,
        otherPlayers: [
          {
            id: "Player2",
            discarded: true,
            playerScoringHistory: null as unknown as PlayerScoringHistory,
            ready: false,
          },
          {
            id: "Player3",
            discarded: true,
            playerScoringHistory: null as unknown as PlayerScoringHistory,
            ready: false,
          },
        ],
        showScoring: undefined as unknown as ShowScoring, //  //todo generation should be optional
      },
      {
        id: "fourplayerdiscard",
        changeHistory: {
          lastChangeDate: new Date("19 May 2023 09:00"),
          matchCreationDate: new Date("20 December 2022 14:48"),
          numberOfActions: 2,
        },
        title: "4 player discard",
        gameState: CribGameState.Discard,
        box: [],
        myCards: [AceSpades, QueenSpades, KingSpades, JackSpades, TwoSpades],
        cutCard: undefined as unknown as PlayingCard, //todo generation should be optional
        scores: [
          { games: 1, frontPeg: 22, backPeg: 9 },
          { games: 2, frontPeg: 12, backPeg: 4 },
        ],
        pegging: {
          turnedOverCards: [],
          inPlayCards: [],
          goHistory: [],
          nextPlayer: "Player2",
          cannotGoes: [false, false, false],
          myCannotGo: false,
        },
        myId: "Me",
        dealerDetails: {
          first: "Me",
          current: "Player2",
        },
        myReady: false,
        matchWinDeterminant: "BestOf_3",
        myScoringHistory: null as unknown as PlayerScoringHistory,
        otherPlayers: [
          {
            id: "Player2",
            discarded: true,
            playerScoringHistory: null as unknown as PlayerScoringHistory,
            ready: false,
          },
          {
            id: "Player3",
            discarded: true,
            playerScoringHistory: null as unknown as PlayerScoringHistory,
            ready: false,
          },
          {
            id: "Player4",
            discarded: true,
            playerScoringHistory: null as unknown as PlayerScoringHistory,
            ready: false,
          },
        ],
        showScoring: undefined as unknown as ShowScoring, //  //todo generation should be optional
      },
    ];
    RadHubConnectionInstance.fromTheServer(
      "initialPlayerData",
      myFriends,
      matches
    );
  }, []);

  const addLocalMatchesClickHandler = useCallback(() => {
    const localMatches: LocalMatch[] = [];

    localMatches.forEach((localMatch) => cribStorage.setMatch(localMatch));
  }, []);


  
  const discardedClickHandler = useCallback(() => {
    const cutAJack = true;
    const cutCard: PlayingCard = cutAJack ? JackSpades : KingSpades;
    const myMatch = {
      id: "I discarded",
      changeHistory: {
        lastChangeDate: new Date("20 May 2023 09:00"),
        matchCreationDate: new Date("20 December 2022 14:48"),
        numberOfActions: 2,
      },
      title: "I discarded",
      gameState: CribGameState.Pegging,
      box: [],
      myCards: [AceSpades, QueenSpades, KingSpades, JackSpades],
      cutCard,
      scores: [
        { games: 1, frontPeg: 22, backPeg: 9 },
        { games: 2, frontPeg: cutAJack ? 14 : 12, backPeg: cutAJack ? 12 : 4 },
      ],
      pegging: {
        turnedOverCards: [],
        inPlayCards: [],
        goHistory: [],
        nextPlayer: "Player2",
        cannotGoes: [false],
        myCannotGo: false,
      },
      myId: "Me",
      dealerDetails: {
        first: "Me",
        current: "Player2",
      },
      myReady: false,
      matchWinDeterminant: "BestOf_3",
      myScoringHistory: null as unknown as PlayerScoringHistory,
      otherPlayers: [
        {
          id: "Player2",
          discarded: false,
          playerScoringHistory: null as unknown as PlayerScoringHistory,
          ready: false,
        },
      ],
      showScoring: undefined as unknown as ShowScoring, //  //todo generation should be optional
    };
    RadHubConnectionInstance.fromTheServer(
      "discard",
      myMatch.id,
      "Player2",
      cutCard,
      myMatch
    );
  }, []);

  return (
    <motion.div
      drag
      initial={{
        y: 100,
      }}
      style={{
        padding: 50,
        backgroundColor: "white",
        position: "fixed",
        zIndex: 1000000,
      }}
    >
      <button onClick={addInitialPlayerDataClickHandler}>
        Add InitialPlayerData
      </button>
      <button onClick={addLocalMatchesClickHandler}>Add local matches</button>
      <button onClick={discardedClickHandler}>Discard</button>
    </motion.div>
  );
}
