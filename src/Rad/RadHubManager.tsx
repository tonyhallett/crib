import { useCallback, useContext, useEffect, useRef, useState } from "react";
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
  Pips,
  Suit,
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
import { PlayMatchContext } from "../PlayMatchContext";
import { MatchDetail } from "../App";
import {
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
} from "@mui/material";

interface MyMatchAction {
  methodName: string;
  args: unknown[];
}

type ActionMyMatch = MyMatch & {
  actions: MyMatchAction[];
  currentAction: number;
};

const matches: ActionMyMatch[] = [
  {
    actions: [
      {
        methodName: "discard",
        args: [
          "Player2",
          {
            id: "New game",
            changeHistory: {
              lastChangeDate: new Date("20 May 2023 09:00"),
              matchCreationDate: new Date("20 December 2022 14:48"),
              numberOfActions: 2,
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
                discarded: true,
                playerScoringHistory: null as unknown as PlayerScoringHistory,
                ready: false,
              },
            ],
            showScoring: undefined as unknown as ShowScoring, //  //todo generation should be optional
          },
        ],
      },
    ],
    currentAction: 0,

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
    actions: [
      {
        methodName: "discard",
        args: [
          "Player2",
          {
            id: "I discarded (Jack cut)",
            changeHistory: {
              lastChangeDate: new Date("20 May 2023 09:00"),
              matchCreationDate: new Date("20 December 2022 14:48"),
              numberOfActions: 2,
            },
            title: "I discarded (Jack cut)",
            gameState: CribGameState.Pegging,
            box: [],
            myCards: [AceSpades, QueenSpades, KingSpades, JackSpades],
            cutCard: JackSpades,
            scores: [
              { games: 1, frontPeg: 22, backPeg: 9 },
              { games: 2, frontPeg: 14, backPeg: 12 },
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
                discarded: true,
                playerScoringHistory: null as unknown as PlayerScoringHistory,
                ready: false,
              },
            ],
            showScoring: undefined as unknown as ShowScoring, //  //todo generation should be optional
          },
        ],
      },
    ],
    currentAction: 0,

    id: "I discarded (Jack cut)",
    changeHistory: {
      lastChangeDate: new Date("19 May 2023 09:00"),
      matchCreationDate: new Date("20 December 2022 14:48"),
      numberOfActions: 1,
    },
    title: "I discarded (Jack cut)",
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
    currentAction: 0,
    actions: [
      {
        methodName: "discard",
        args: [
          "Player2",
          {
            id: "3 player discard - no discards",
            changeHistory: {
              lastChangeDate: new Date("20 May 2023 09:00"),
              matchCreationDate: new Date("20 December 2022 14:48"),
              numberOfActions: 2,
            },
            title: "3 player discard - no discards",
            gameState: CribGameState.Discard,
            box: [],
            myCards: [
              AceSpades,
              QueenSpades,
              KingSpades,
              JackSpades,
              TwoSpades,
            ],
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
                discarded: true,
                playerScoringHistory: null as unknown as PlayerScoringHistory,
                ready: false,
              },
              {
                id: "Player3",
                discarded: false,
                playerScoringHistory: null as unknown as PlayerScoringHistory,
                ready: false,
              },
            ],
            showScoring: undefined as unknown as ShowScoring, //  //todo generation should be optional
          },
        ],
      },
      {
        methodName: "discard",
        args: [
          "Player3",
          {
            id: "3 player discard - no discards",
            changeHistory: {
              lastChangeDate: new Date("21 May 2023 09:00"),
              matchCreationDate: new Date("20 December 2022 14:48"),
              numberOfActions: 3,
            },
            title: "3 player discard - no discards",
            gameState: CribGameState.Discard,
            box: [],
            myCards: [
              AceSpades,
              QueenSpades,
              KingSpades,
              JackSpades,
              TwoSpades,
            ],
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
        ],
      },
    ],
    id: "3 player discard - no discards",
    changeHistory: {
      lastChangeDate: new Date("19 May 2023 09:00"),
      matchCreationDate: new Date("20 December 2022 14:48"),
      numberOfActions: 1,
    },
    title: "3 player discard - no discards",
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
        discarded: false,
        playerScoringHistory: null as unknown as PlayerScoringHistory,
        ready: false,
      },
    ],
    showScoring: undefined as unknown as ShowScoring, //  //todo generation should be optional
  },

  {
    currentAction: 0,
    actions: [],
    id: "3 player discard - p2 discarded",
    changeHistory: {
      lastChangeDate: new Date("19 May 2023 09:00"),
      matchCreationDate: new Date("20 December 2022 14:48"),
      numberOfActions: 1,
    },
    title: "3 player discard - p2 discarded",
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
        discarded: true,
        playerScoringHistory: null as unknown as PlayerScoringHistory,
        ready: false,
      },
      {
        id: "Player3",
        discarded: false,
        playerScoringHistory: null as unknown as PlayerScoringHistory,
        ready: false,
      },
    ],
    showScoring: undefined as unknown as ShowScoring, //  //todo generation should be optional
  },
  
  {
    actions:[
      {
        methodName: "peg",
        args:[
          "Player2",
          {
            pips: Pips.Ace,
            suit: Suit.Hearts,
          } as PlayingCard,
          {
            id: "2 player pegging - none pegged ( no score )",
            changeHistory: {
              lastChangeDate: new Date("21 May 2023 09:00"),
              matchCreationDate: new Date("20 December 2022 14:48"),
              numberOfActions: 8,
            },
            title: "2 player pegging - none pegged ( no score )",
            gameState: CribGameState.Pegging,
            box: [],
            myCards: [AceSpades, KingSpades, QueenSpades, JackSpades],
            cutCard: TwoSpades,
            scores: [
              { games: 1, frontPeg: 22, backPeg: 9 },
              { games: 2, frontPeg: 12, backPeg: 4 },
            ],
            pegging: {
              turnedOverCards: [],
              // temp two in a row
              inPlayCards: [
                {
                  owner:"Player2",
                  playingCard:{
                    pips: Pips.Ace,
                    suit: Suit.Hearts,
                  },
                  peggingScore:{
                    score:0,
                    is31:false,
                    is15:false,
                    isLastGo:false,
                    numCardsInRun:0,
                    numOfAKind:0
                  }
                }
              ],
              goHistory: [],
              nextPlayer: "Me",
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
          } as MyMatch
        ]
      },
      {
        methodName: "peg",
        args:[
          "Me",
          JackSpades,
          {
            id: "2 player pegging - none pegged ( no score )",
            changeHistory: {
              lastChangeDate: new Date("21 May 2023 09:00"),
              matchCreationDate: new Date("20 December 2022 14:48"),
              numberOfActions: 9,
            },
            title: "2 player pegging - none pegged ( no score )",
            gameState: CribGameState.Pegging,
            box: [],
            myCards: [AceSpades, KingSpades, QueenSpades],
            cutCard: TwoSpades,
            scores: [
              { games: 1, frontPeg: 22, backPeg: 9 },
              { games: 2, frontPeg: 12, backPeg: 4 },
            ],
            pegging: {
              turnedOverCards: [],
              // temp two in a row
              inPlayCards: [
                {
                  owner:"Player2",
                  playingCard:{
                    pips: Pips.Ace,
                    suit: Suit.Hearts,
                  },
                  peggingScore:{
                    score:0,
                    is31:false,
                    is15:false,
                    isLastGo:false,
                    numCardsInRun:0,
                    numOfAKind:0
                  }
                },
                {
                  owner:"Me",
                  playingCard:JackSpades,
                  peggingScore:{
                    score:0,
                    is31:false,
                    is15:false,
                    isLastGo:false,
                    numCardsInRun:0,
                    numOfAKind:0
                  }
                }
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
          } as MyMatch
            ]
      }  
    ],
    currentAction:0,
    id: "2 player pegging - none pegged ( no score )",
    changeHistory: {
      lastChangeDate: new Date("19 May 2023 09:00"),
      matchCreationDate: new Date("20 December 2022 14:48"),
      numberOfActions: 7,
    },
    title: "2 player pegging - none pegged ( no score )",
    gameState: CribGameState.Pegging,
    box: [],
    myCards: [AceSpades, KingSpades, QueenSpades, JackSpades],
    cutCard: TwoSpades,
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
    actions: [],
    currentAction: 0,
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
  /*
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
  }, */
];

function useForceRender() {
  const [dummyForceRender, setDummyForceRender] = useState(0);
  return () => setDummyForceRender(dummyForceRender + 1);
}
// eslint-disable-next-line complexity
export function RadHubManager() {
  const subscribedRef = useRef(false);
  const playMatchContext = useContext(PlayMatchContext);
  const [addedInitialPlayerData, setAddedInitialPlayerData] = useState(false);

  const [playMatch, setPlayMatch] = useState<MatchDetail | undefined>();
  const playMatchRef = useRef(playMatch);
  const setPlayMatchAndRef = (playMatch: MatchDetail | undefined) => {
    playMatchRef.current = playMatch;
    setPlayMatch(playMatch);
  };
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0].id);
  const [usePlayingMatch, setUsePlayingMatch] = useState(true);
  const forceRender = useForceRender();
  const actionMatchId =
    !!playMatch && usePlayingMatch ? playMatch.match.id : selectedMatchId;
  const actionMatch = matches.find(
    (match) => match.id === actionMatchId
  ) as ActionMyMatch;
  const myMatchAction = actionMatch.actions[actionMatch.currentAction];

  useEffect(() => {
    if (!subscribedRef.current) {
      RadHubConnectionInstance.interceptSend((methodName, ...args) => {
        if (methodName === "Discard") {
          // 0 is the matchId
          const discard1 = args[1] as PlayingCard;
          const discard2 = args[2] as PlayingCard;
          const match = (playMatchRef.current as MatchDetail).match;

          const cardMatch = (
            card1: PlayingCard,
            card2: PlayingCard | undefined
          ) => {
            if (card2 === undefined) return false;
            return card1.suit === card2.suit && card1.pips === card2.pips;
          };
          const newMyCards = match.myCards.filter(
            (card) => !(cardMatch(card, discard1) || cardMatch(card, discard2))
          );
          const changedMatch: MyMatch = {
            ...match,
            myCards: newMyCards,
            changeHistory: {
              ...match.changeHistory,
              lastChangeDate: new Date(),
              numberOfActions: match.changeHistory.numberOfActions + 1,
            },
          };
          const othersDiscarded = match.otherPlayers.every(
            (otherPlayer) => otherPlayer.discarded
          );
          if (othersDiscarded) {
            changedMatch.gameState = CribGameState.Pegging;
            changedMatch.cutCard = { pips: Pips.Ace, suit: Suit.Spades };
          }
          RadHubConnectionInstance.fromTheServer(
            "discard",
            match.myId,
            changedMatch
          );
        }
      });
      playMatchContext.subscribe((playMatch) => {
        setPlayMatchAndRef(playMatch);
      });
      subscribedRef.current = true;
    }
  }, [playMatchContext]);

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

    RadHubConnectionInstance.fromTheServer(
      "initialPlayerData",
      myFriends,
      matches
    );
    setAddedInitialPlayerData(true);
  }, []);

  const addLocalMatchesClickHandler = useCallback(() => {
    const localMatches: LocalMatch[] = [];

    localMatches.forEach((localMatch) => cribStorage.setMatch(localMatch));
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
        zIndex: 10000,
      }}
    >
      {!addedInitialPlayerData && (
        <>
          <Button
            style={{ display: "block" }}
            onClick={addInitialPlayerDataClickHandler}
          >
            Add InitialPlayerData
          </Button>
          <Button
            style={{ display: "block" }}
            onClick={addLocalMatchesClickHandler}
          >
            Add local matches
          </Button>
        </>
      )}
      <FormControlLabel
        disabled={playMatch === undefined}
        label="Use playing match ?"
        control={
          <Checkbox
            checked={usePlayingMatch}
            onChange={(evt) => {
              setUsePlayingMatch(evt.target.checked);
            }}
          />
        }
      />
      <Select
        MenuProps={{ style: { zIndex: 10000 } }}
        value={selectedMatchId}
        label="Select match"
        onChange={(event) => setSelectedMatchId(event.target.value)}
      >
        {matches.map((match) => {
          return (
            <MenuItem key={match.id} value={match.id}>
              {match.title}
            </MenuItem>
          );
        })}
      </Select>
      <Button
        disabled={!addedInitialPlayerData || myMatchAction === undefined}
        onClick={() => {
          RadHubConnectionInstance.fromTheServer(
            myMatchAction.methodName,
            ...myMatchAction.args
          );
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          actionMatch.currentAction++;
          forceRender();
        }}
      >
        {myMatchAction === undefined
          ? "No more actions"
          : myMatchAction.methodName}
      </Button>
    </motion.div>
  );
}
