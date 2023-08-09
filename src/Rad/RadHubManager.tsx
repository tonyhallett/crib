/* eslint-disable no-case-declarations */
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { RadHubConnectionInstance } from "./RadHubConnection";
import {
  MyMatch,
  Friendship,
  FriendshipStatus,
  CribGameState,
  PlayingCard,
  PlayerScoringHistory,
  PegScoring,
  Pips,
  Suit,
  ShowScore,
} from "../generatedTypes";
import { motion } from "framer-motion";
import { cribStorage } from "./getRad";
import { LocalMatch } from "../localMatch";
import {
  AceHearts,
  AceSpades,
  TwoDiamonds,
  AceClubs,
  JackSpades,
  KingSpades,
  ThreeSpades,
  QueenSpades,
  TwoHearts,
  TwoClubs,
  ThreeDiamonds,
  AceDiamonds,
  TwoSpades,
  ThreeHearts,
  EightSpades,
  KingHearts,
  QueenHearts,
  EightHearts,
  TenDiamonds,
  JackDiamonds,
  KingClubs,
  ThreeClubs,
  QueenDiamonds,
  FourHearts,
  FiveHearts,
  JackHearts,
  FiveClubs,
  FiveDiamonds,
  FiveSpades,
  SevenClubs,
  EightClubs,
  NineClubs,
  QueenClubs,
  FourClubs,
  FourSpades,
  TenHearts,
  SixHearts,
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
import { useForceRender } from "../hooks/useForceRender";

interface MyMatchAction {
  methodName: string;
  args: unknown[];
}

type ActionMyMatch = MyMatch & {
  actions: MyMatchAction[];
  currentAction: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const score19: ShowScore = {
  fifteenTwos: [],
  runs: [],
  pairs: [],
  flush: [],
  score: 0,
};

const zeroPegScoring: PegScoring = {
  is15: false,
  is31: false,
  isLastGo: false,
  numCardsInRun: 0,
  numOfAKind: 0,
  score: 0,
};

const noScoringHistory: PlayerScoringHistory = {
  boxHistory: {
    numScores: 0,
    totalScore: 0,
  },
  handAndBoxHistory: {
    numScores: 0,
    totalScore: 0,
  },
  handHistory: {
    numScores: 0,
    totalScore: 0,
  },
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
              AceClubs,
              AceDiamonds,
            ],
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
            myScoringHistory: noScoringHistory,
            otherPlayers: [
              {
                id: "Player2",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
            ],
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
      AceClubs,
      AceDiamonds,
    ],
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
    myScoringHistory: noScoringHistory,
    otherPlayers: [
      {
        id: "Player2",
        discarded: false,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
    ],
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
            cutCard: JackDiamonds,
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
            myScoringHistory: noScoringHistory,
            otherPlayers: [
              {
                id: "Player2",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
            ],
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
    myScoringHistory: noScoringHistory,
    otherPlayers: [
      {
        id: "Player2",
        discarded: false,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
    ],
  },
  {
    actions: [
      {
        methodName: "discard",
        args: [
          "Player2",
          {
            id: "I discarded (Jack cut wins)",
            changeHistory: {
              lastChangeDate: new Date("20 May 2023 09:00"),
              matchCreationDate: new Date("20 December 2022 14:48"),
              numberOfActions: 2,
            },
            title: "I discarded (Jack cut wins)",
            gameState: CribGameState.GameWon,
            box: [],
            myCards: [AceSpades, QueenSpades, KingSpades, JackSpades],
            cutCard: JackDiamonds,
            scores: [
              { games: 1, frontPeg: 22, backPeg: 9 },
              { games: 3, frontPeg: 0, backPeg: 0 },
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
            myScoringHistory: noScoringHistory,
            otherPlayers: [
              {
                id: "Player2",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
            ],
          },
        ],
      },
    ],
    currentAction: 0,

    id: "I discarded (Jack cut wins)",
    changeHistory: {
      lastChangeDate: new Date("19 May 2023 09:00"),
      matchCreationDate: new Date("20 December 2022 14:48"),
      numberOfActions: 1,
    },
    title: "I discarded (Jack cut wins)",
    gameState: CribGameState.Discard,
    box: [],
    myCards: [AceSpades, QueenSpades, KingSpades, JackSpades],
    scores: [
      { games: 1, frontPeg: 22, backPeg: 9 },
      { games: 2, frontPeg: 120, backPeg: 119 },
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
    myScoringHistory: noScoringHistory,
    otherPlayers: [
      {
        id: "Player2",
        discarded: false,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
    ],
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
            myScoringHistory: noScoringHistory,
            otherPlayers: [
              {
                id: "Player2",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
              {
                id: "Player3",
                discarded: false,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
            ],
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
            myScoringHistory: noScoringHistory,
            otherPlayers: [
              {
                id: "Player2",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
              {
                id: "Player3",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
            ],
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
    myScoringHistory: noScoringHistory,
    otherPlayers: [
      {
        id: "Player2",
        discarded: false,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
      {
        id: "Player3",
        discarded: false,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
    ],
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
    myScoringHistory: noScoringHistory,
    otherPlayers: [
      {
        id: "Player2",
        discarded: true,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
      {
        id: "Player3",
        discarded: false,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
    ],
  },

  {
    actions: [
      {
        methodName: "peg",
        args: [
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
                  owner: "Player2",
                  playingCard: {
                    pips: Pips.Ace,
                    suit: Suit.Hearts,
                  },
                  peggingScore: {
                    score: 0,
                    is31: false,
                    is15: false,
                    isLastGo: false,
                    numCardsInRun: 0,
                    numOfAKind: 0,
                  },
                },
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
            myScoringHistory: noScoringHistory,
            otherPlayers: [
              {
                id: "Player2",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
            ],
          } as MyMatch,
        ],
      },
      {
        methodName: "peg",
        args: [
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
                  owner: "Player2",
                  playingCard: {
                    pips: Pips.Ace,
                    suit: Suit.Hearts,
                  },
                  peggingScore: {
                    score: 0,
                    is31: false,
                    is15: false,
                    isLastGo: false,
                    numCardsInRun: 0,
                    numOfAKind: 0,
                  },
                },
                {
                  owner: "Me",
                  playingCard: JackSpades,
                  peggingScore: {
                    score: 0,
                    is31: false,
                    is15: false,
                    isLastGo: false,
                    numCardsInRun: 0,
                    numOfAKind: 0,
                  },
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
            myScoringHistory: noScoringHistory,
            otherPlayers: [
              {
                id: "Player2",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
            ],
          } as MyMatch,
        ],
      },
    ],
    currentAction: 0,
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
    myScoringHistory: noScoringHistory,
    otherPlayers: [
      {
        id: "Player2",
        discarded: true,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
    ],
  },

  {
    actions: [
      {
        methodName: "peg",
        args: [
          "Player2",
          QueenDiamonds,
          {
            id: "Peg action wins",
            changeHistory: {
              lastChangeDate: new Date("21 May 2023 09:00"),
              matchCreationDate: new Date("20 December 2022 14:48"),
              numberOfActions: 8,
            },
            title: "Peg action wins",
            gameState: CribGameState.GameWon,
            box: [],
            myCards: [AceSpades, KingSpades, JackSpades],
            cutCard: TwoSpades,
            scores: [
              { games: 2, frontPeg: 12, backPeg: 4 },
              { games: 2, frontPeg: 0, backPeg: 0 },
            ],
            pegging: {
              turnedOverCards: [],
              inPlayCards: [
                {
                  owner: "Player2",
                  peggingScore: {
                    is15: false,
                    is31: false,
                    isLastGo: false,
                    numCardsInRun: 0,
                    numOfAKind: 0,
                    score: 0,
                  },
                  playingCard: QueenHearts,
                },
                {
                  owner: "Me",
                  peggingScore: {
                    is15: false,
                    is31: false,
                    isLastGo: false,
                    numCardsInRun: 0,
                    numOfAKind: 2,
                    score: 2,
                  },
                  playingCard: QueenSpades,
                },
                {
                  owner: "Player2",
                  peggingScore: {
                    is15: false,
                    is31: false,
                    isLastGo: false,
                    numCardsInRun: 0,
                    numOfAKind: 3,
                    score: 6,
                  },
                  playingCard: QueenDiamonds,
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
            myScoringHistory: noScoringHistory,
            otherPlayers: [
              {
                id: "Player2",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
            ],
          } as MyMatch,
        ],
      },
      {
        methodName: "ready",
        args: [
          "Player2",
          {
            id: "Peg action wins",
            changeHistory: {
              lastChangeDate: new Date("21 May 2023 09:00"),
              matchCreationDate: new Date("20 December 2022 14:48"),
              numberOfActions: 9,
            },
            title: "Peg action wins",
            gameState: CribGameState.GameWon,
            box: [],
            myCards: [AceSpades, KingSpades, JackSpades],
            cutCard: TwoSpades,
            scores: [
              { games: 2, frontPeg: 12, backPeg: 4 },
              { games: 2, frontPeg: 0, backPeg: 0 },
            ],
            pegging: {
              turnedOverCards: [],
              inPlayCards: [
                {
                  owner: "Player2",
                  peggingScore: {
                    is15: false,
                    is31: false,
                    isLastGo: false,
                    numCardsInRun: 0,
                    numOfAKind: 0,
                    score: 0,
                  },
                  playingCard: QueenHearts,
                },
                {
                  owner: "Me",
                  peggingScore: {
                    is15: false,
                    is31: false,
                    isLastGo: false,
                    numCardsInRun: 0,
                    numOfAKind: 2,
                    score: 2,
                  },
                  playingCard: QueenSpades,
                },
                {
                  owner: "Player2",
                  peggingScore: {
                    is15: false,
                    is31: false,
                    isLastGo: false,
                    numCardsInRun: 0,
                    numOfAKind: 3,
                    score: 6,
                  },
                  playingCard: QueenDiamonds,
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
            myScoringHistory: noScoringHistory,
            otherPlayers: [
              {
                id: "Player2",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: true,
              },
            ],
          } as MyMatch,
        ],
      },
      {
        methodName: "ready",
        args: [
          "Me",
          {
            id: "Peg action wins",
            changeHistory: {
              lastChangeDate: new Date("21 May 2023 09:00"),
              matchCreationDate: new Date("20 December 2022 14:48"),
              numberOfActions: 10,
            },
            title: "Peg action wins",
            gameState: CribGameState.Discard,
            box: [],
            myCards: [
              AceHearts,
              TwoHearts,
              ThreeHearts,
              FourHearts,
              FiveHearts,
              SixHearts
            ],
            cutCard: undefined,
            scores: [
              { games: 2, frontPeg: 0, backPeg: 0 },
              { games: 2, frontPeg: 0, backPeg: 0 },
            ],
            pegging: {
              turnedOverCards: [],
              inPlayCards: [],
              goHistory: [],
              nextPlayer: "Me",
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
            myScoringHistory: noScoringHistory,
            otherPlayers: [
              {
                id: "Player2",
                discarded: false,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
            ],
          } as MyMatch,
        ],
      },
    ],
    currentAction: 0,
    id: "Peg action wins",
    changeHistory: {
      lastChangeDate: new Date("19 May 2023 09:00"),
      matchCreationDate: new Date("20 December 2022 14:48"),
      numberOfActions: 7,
    },
    title: "Peg action wins",
    gameState: CribGameState.Pegging,
    box: [],
    myCards: [AceSpades, KingSpades, JackSpades],
    cutCard: TwoSpades,
    scores: [
      { games: 2, frontPeg: 12, backPeg: 4 },
      { games: 1, frontPeg: 119, backPeg: 110 },
    ],
    pegging: {
      turnedOverCards: [],
      inPlayCards: [
        {
          owner: "Player2",
          peggingScore: {
            is15: false,
            is31: false,
            isLastGo: false,
            numCardsInRun: 0,
            numOfAKind: 0,
            score: 0,
          },
          playingCard: QueenHearts,
        },
        {
          owner: "Me",
          peggingScore: {
            is15: false,
            is31: false,
            isLastGo: false,
            numCardsInRun: 0,
            numOfAKind: 2,
            score: 2,
          },
          playingCard: QueenSpades,
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
    myScoringHistory: noScoringHistory,
    otherPlayers: [
      {
        id: "Player2",
        discarded: true,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
    ],
  },

  {
    actions: [
      {
        methodName: "peg",
        args: [
          "Player2",
          ThreeHearts,
          {
            id: "3 player pegging",
            changeHistory: {
              lastChangeDate: new Date("19 May 2023 09:00"),
              matchCreationDate: new Date("20 December 2022 14:48"),
              numberOfActions: 15,
            },
            title: "3 player pegging",
            gameState: CribGameState.Pegging,
            box: [],
            myCards: [],
            cutCard: TwoSpades,
            scores: [
              { games: 1, frontPeg: 22, backPeg: 9 },
              { games: 2, frontPeg: 18, backPeg: 12 },
              { games: 2, frontPeg: 12, backPeg: 4 },
            ],
            pegging: {
              turnedOverCards: [],
              inPlayCards: [
                {
                  owner: "Me",
                  playingCard: AceSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: AceHearts,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player3",
                  playingCard: AceDiamonds,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Me",
                  playingCard: AceClubs,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: TwoSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player3",
                  playingCard: TwoClubs,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Me",
                  playingCard: TwoHearts,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: TwoDiamonds,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player3",
                  playingCard: ThreeSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Me",
                  playingCard: ThreeDiamonds,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: ThreeHearts,
                  peggingScore: {
                    score: 6,
                    is31: false,
                    is15: false,
                    isLastGo: false,
                    numCardsInRun: 0,
                    numOfAKind: 3,
                  },
                },
              ],
              goHistory: [],
              nextPlayer: "Me",
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
            myScoringHistory: noScoringHistory,
            otherPlayers: [
              {
                id: "Player2",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
              {
                id: "Player3",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
            ],
          },
        ],
      },
    ],
    currentAction: 0,
    id: "3 player pegging",
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
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player2",
          playingCard: AceHearts,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player3",
          playingCard: AceDiamonds,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Me",
          playingCard: AceClubs,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player2",
          playingCard: TwoSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player3",
          playingCard: TwoClubs,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Me",
          playingCard: TwoHearts,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player2",
          playingCard: TwoDiamonds,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player3",
          playingCard: ThreeSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Me",
          playingCard: ThreeDiamonds,
          peggingScore: zeroPegScoring,
        },
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
    myScoringHistory: noScoringHistory,
    otherPlayers: [
      {
        id: "Player2",
        discarded: true,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
      {
        id: "Player3",
        discarded: true,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
    ],
  },
  {
    actions: [
      {
        methodName: "peg",
        args: [
          "Player2",
          AceDiamonds,
          {
            id: "Peg 31 action ( no turned over )",
            changeHistory: {
              lastChangeDate: new Date("19 May 2023 09:00"),
              matchCreationDate: new Date("20 December 2022 14:48"),
              numberOfActions: 15,
            },
            title: "Peg 31 action ( no turned over )",
            gameState: CribGameState.Pegging,
            box: [],
            myCards: [AceHearts, ThreeHearts],
            cutCard: TwoSpades,
            scores: [
              { games: 1, frontPeg: 22, backPeg: 9 },
              { games: 2, frontPeg: 14, backPeg: 6 },
              { games: 2, frontPeg: 12, backPeg: 4 },
            ],
            pegging: {
              turnedOverCards: [
                {
                  owner: "Me",
                  playingCard: KingSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: QueenSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player3",
                  playingCard: EightSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Me",
                  playingCard: TwoHearts,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: AceDiamonds,
                  peggingScore: {
                    score: 2,
                    is31: true,
                    is15: false,
                    isLastGo: false,
                    numCardsInRun: 0,
                    numOfAKind: 0,
                  },
                },
              ],
              inPlayCards: [],
              goHistory: [],
              nextPlayer: "Player3",
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
            myScoringHistory: noScoringHistory,
            otherPlayers: [
              {
                id: "Player2",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
              {
                id: "Player3",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
            ],
          },
        ],
      },
    ],
    currentAction: 0,
    id: "Peg 31 action ( no turned over )",
    changeHistory: {
      lastChangeDate: new Date("19 May 2023 09:00"),
      matchCreationDate: new Date("20 December 2022 14:48"),
      numberOfActions: 14,
    },
    title: "Peg 31 action ( no turned over )",
    gameState: CribGameState.Pegging,
    box: [],
    myCards: [AceHearts, ThreeHearts],
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
          playingCard: KingSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player2",
          playingCard: QueenSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player3",
          playingCard: EightSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Me",
          playingCard: TwoHearts,
          peggingScore: zeroPegScoring,
        },
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
    myScoringHistory: noScoringHistory,
    otherPlayers: [
      {
        id: "Player2",
        discarded: true,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
      {
        id: "Player3",
        discarded: true,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
    ],
  },
  {
    actions: [
      {
        methodName: "peg",
        args: [
          "Player2",
          AceDiamonds,
          {
            id: "Peg 31 action ( turned over )",
            changeHistory: {
              lastChangeDate: new Date("19 May 2023 09:00"),
              matchCreationDate: new Date("20 December 2022 14:48"),
              numberOfActions: 15,
            },
            title: "Peg 31 action ( turned over )",
            gameState: CribGameState.Pegging,
            box: [],
            myCards: [AceHearts],
            cutCard: TwoSpades,
            scores: [
              { games: 1, frontPeg: 22, backPeg: 9 },
              { games: 2, frontPeg: 14, backPeg: 6 },
              { games: 2, frontPeg: 12, backPeg: 4 },
            ],
            pegging: {
              turnedOverCards: [
                {
                  owner: "Me",
                  playingCard: KingHearts,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: QueenHearts,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player3",
                  playingCard: EightHearts,
                  peggingScore: zeroPegScoring,
                },

                {
                  owner: "Me",
                  playingCard: KingSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: QueenSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player3",
                  playingCard: EightSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Me",
                  playingCard: TwoHearts,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: AceDiamonds,
                  peggingScore: {
                    score: 2,
                    is31: true,
                    is15: false,
                    isLastGo: false,
                    numCardsInRun: 0,
                    numOfAKind: 0,
                  },
                },
              ],
              inPlayCards: [],
              goHistory: [],
              nextPlayer: "Player3",
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
            myScoringHistory: noScoringHistory,
            otherPlayers: [
              {
                id: "Player2",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
              {
                id: "Player3",
                discarded: true,
                playerScoringHistory: noScoringHistory,
                ready: false,
              },
            ],
          },
        ],
      },
    ],
    currentAction: 0,
    id: "Peg 31 action ( turned over )",
    changeHistory: {
      lastChangeDate: new Date("19 May 2023 09:00"),
      matchCreationDate: new Date("20 December 2022 14:48"),
      numberOfActions: 14,
    },
    title: "Peg 31 action ( turned over )",
    gameState: CribGameState.Pegging,
    box: [],
    myCards: [AceHearts],
    cutCard: TwoSpades,
    scores: [
      { games: 1, frontPeg: 22, backPeg: 9 },
      { games: 2, frontPeg: 12, backPeg: 4 },
      { games: 2, frontPeg: 12, backPeg: 4 },
    ],
    pegging: {
      turnedOverCards: [
        {
          owner: "Me",
          playingCard: KingHearts,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player2",
          playingCard: QueenHearts,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player3",
          playingCard: EightHearts,
          peggingScore: zeroPegScoring,
        },
      ],
      inPlayCards: [
        {
          owner: "Me",
          playingCard: KingSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player2",
          playingCard: QueenSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player3",
          playingCard: EightSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Me",
          playingCard: TwoHearts,
          peggingScore: zeroPegScoring,
        },
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
    myScoringHistory: noScoringHistory,
    otherPlayers: [
      {
        id: "Player2",
        discarded: true,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
      {
        id: "Player3",
        discarded: true,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
    ],
  },
  {
    actions: [
      {
        methodName: "peg",
        args: [
          "Player2",
          ThreeClubs,
          {
            id: "2 player pegging turnedover - peg completes",
            changeHistory: {
              lastChangeDate: new Date("21 May 2023 09:00"),
              matchCreationDate: new Date("20 December 2022 14:48"),
              numberOfActions: 8,
            },
            title: "2 player pegging turnedover - peg completes",
            gameState: CribGameState.Show,
            box: [AceDiamonds, TenDiamonds, JackDiamonds, KingClubs],
            myCards: [],
            cutCard: TwoDiamonds,
            scores: [
              { games: 1, frontPeg: 27, backPeg: 26 },
              { games: 2, frontPeg: 31, backPeg: 19 },
            ],
            pegging: {
              turnedOverCards: [
                {
                  owner: "Me",
                  playingCard: KingSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: QueenSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Me",
                  playingCard: JackSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: AceSpades,
                  peggingScore: zeroPegScoring,
                },
              ],
              inPlayCards: [
                {
                  owner: "Me",
                  playingCard: TwoSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: ThreeSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Me",
                  playingCard: ThreeHearts,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: ThreeClubs,
                  peggingScore: {
                    score: 7,
                    is31: false,
                    is15: false,
                    isLastGo: true,
                    numCardsInRun: 0,
                    numOfAKind: 3,
                  },
                },
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
            myScoringHistory: {
              handHistory: {
                // not correct values
                numScores: 10,
                totalScore: 100,

                highestScoringCards: {
                  cutCard: FiveHearts,
                  handOrBox: [JackHearts, FiveClubs, FiveDiamonds, FiveSpades],
                  score: 29,
                },
              },
              boxHistory: {
                numScores: 10,
                totalScore: 1,
                highestScoringCards: {
                  cutCard: TwoDiamonds,
                  handOrBox: [
                    AceDiamonds,
                    TenDiamonds,
                    JackDiamonds,
                    KingClubs,
                  ],
                  score: 1,
                },
              },
              handAndBoxHistory: {
                numScores: 10,
                totalScore: 100,
                highestScoringCards: {
                  cutCard: FiveHearts,
                  hand: [JackHearts, FiveClubs, FiveDiamonds, FiveSpades],
                  handScore: 29,
                  boxScore: 2,
                  box: [SevenClubs, EightClubs, AceDiamonds, TwoDiamonds],
                  score: 31,
                },
              },
            },
            otherPlayers: [
              {
                id: "Player2",
                discarded: true,
                playerScoringHistory: {
                  boxHistory: {
                    numScores: 10,
                    totalScore: 100,
                    highestScoringCards: {
                      cutCard: TwoHearts,
                      handOrBox: [NineClubs, JackHearts, QueenClubs, KingClubs],
                      score: 1,
                    },
                  },
                  handHistory: {
                    numScores: 10,
                    totalScore: 100,
                    highestScoringCards: {
                      cutCard: TwoDiamonds,
                      handOrBox: [
                        TwoHearts,
                        FourClubs,
                        FourSpades,
                        TenDiamonds,
                      ],
                      score: 4,
                    },
                  },
                  handAndBoxHistory: {
                    numScores: 10,
                    totalScore: 100,
                    highestScoringCards: {
                      cutCard: TwoDiamonds,
                      hand: [TwoHearts, FourClubs, FourSpades, TenDiamonds],
                      handScore: 4,
                      box: [NineClubs, TenHearts, QueenClubs, KingClubs],
                      boxScore: 0,
                      score: 4,
                    },
                  },
                },
                ready: false,
              },
            ],
            showScoring: {
              boxScore: {
                fifteenTwos: [],
                runs: [],
                pairs: [],
                flush: [],
                oneForHisKnob: JackDiamonds,
                score: 1,
              },
              playerShowScores: [
                {
                  playerId: "Player2",
                  showScore: {
                    fifteenTwos: [
                      [QueenSpades, TwoDiamonds, ThreeClubs],
                      [QueenSpades, TwoDiamonds, ThreeSpades],
                    ],
                    runs: [
                      [AceSpades, TwoDiamonds, ThreeClubs],
                      [AceSpades, TwoDiamonds, ThreeSpades],
                    ],
                    pairs: [
                      {
                        card1: ThreeClubs,
                        card2: ThreeSpades,
                      },
                    ],
                    flush: [],
                    score: 12,
                  },
                },
                {
                  playerId: "Me",
                  showScore: {
                    fifteenTwos: [
                      [KingSpades, TwoSpades, ThreeHearts],
                      [JackSpades, TwoSpades, ThreeHearts],
                      [KingSpades, TwoDiamonds, ThreeHearts],
                      [JackSpades, TwoDiamonds, ThreeHearts],
                    ],
                    runs: [],
                    pairs: [
                      {
                        card1: TwoSpades,
                        card2: TwoDiamonds,
                      },
                    ],
                    flush: [],
                    score: 10,
                  },
                },
              ],
            },
          } as MyMatch,
        ],
      },
    ],
    currentAction: 0,
    id: "2 player pegging turnedover - peg completes",
    changeHistory: {
      lastChangeDate: new Date("19 May 2023 09:00"),
      matchCreationDate: new Date("20 December 2022 14:48"),
      numberOfActions: 7,
    },
    title: "2 player pegging turnedover - peg completes",
    gameState: CribGameState.Pegging,
    box: [],
    myCards: [],
    cutCard: TwoDiamonds,
    scores: [
      { games: 1, frontPeg: 22, backPeg: 9 },
      { games: 2, frontPeg: 12, backPeg: 4 },
    ],
    pegging: {
      turnedOverCards: [
        {
          owner: "Me",
          playingCard: KingSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player2",
          playingCard: QueenSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Me",
          playingCard: JackSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player2",
          playingCard: AceSpades,
          peggingScore: zeroPegScoring,
        },
      ],
      inPlayCards: [
        {
          owner: "Me",
          playingCard: TwoSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player2",
          playingCard: ThreeSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Me",
          playingCard: ThreeHearts,
          peggingScore: zeroPegScoring,
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
    myScoringHistory: noScoringHistory,
    otherPlayers: [
      {
        id: "Player2",
        discarded: true,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
    ],
  },
  {
    actions: [
      {
        methodName: "peg",
        args: [
          "Player2",
          ThreeClubs,
          {
            id: "2 player peg show first wins game",
            changeHistory: {
              lastChangeDate: new Date("21 May 2023 09:00"),
              matchCreationDate: new Date("20 December 2022 14:48"),
              numberOfActions: 8,
            },
            title: "2 player peg show first wins game",
            gameState: CribGameState.GameWon,
            box: [AceDiamonds, TenDiamonds, JackDiamonds, KingClubs],
            myCards: [],
            cutCard: TwoDiamonds,
            scores: [
              { games: 1, frontPeg: 27, backPeg: 26 },
              { games: 3, frontPeg: 0, backPeg: 0 },
            ],
            pegging: {
              turnedOverCards: [
                {
                  owner: "Me",
                  playingCard: KingSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: QueenSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Me",
                  playingCard: JackSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: AceSpades,
                  peggingScore: zeroPegScoring,
                },
              ],
              inPlayCards: [
                {
                  owner: "Me",
                  playingCard: TwoSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: ThreeSpades,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Me",
                  playingCard: ThreeHearts,
                  peggingScore: zeroPegScoring,
                },
                {
                  owner: "Player2",
                  playingCard: ThreeClubs,
                  peggingScore: {
                    score: 7,
                    is31: false,
                    is15: false,
                    isLastGo: true,
                    numCardsInRun: 0,
                    numOfAKind: 3,
                  },
                },
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
            myScoringHistory: noScoringHistory,
            otherPlayers: [
              {
                id: "Player2",
                discarded: true,
                playerScoringHistory: {
                  handHistory: {
                    numScores: 0,
                    totalScore: 0,
                    highestScoringCards: {
                      cutCard: TwoDiamonds,
                      score: 12,
                      handOrBox: [
                        ThreeSpades,
                        ThreeClubs,
                        QueenSpades,
                        AceSpades,
                      ],
                    },
                  },
                  boxHistory: {
                    numScores: 0,
                    totalScore: 0,
                  },
                  handAndBoxHistory: {
                    numScores: 0,
                    totalScore: 0,
                  },
                },
                ready: false,
              },
            ],
            showScoring: {
              playerShowScores: [
                {
                  playerId: "Player2",
                  showScore: {
                    fifteenTwos: [
                      [QueenSpades, TwoDiamonds, ThreeClubs],
                      [QueenSpades, TwoDiamonds, ThreeSpades],
                    ],
                    runs: [
                      [AceSpades, TwoDiamonds, ThreeClubs],
                      [AceSpades, TwoDiamonds, ThreeSpades],
                    ],
                    pairs: [
                      {
                        card1: ThreeClubs,
                        card2: ThreeSpades,
                      },
                    ],
                    flush: [],
                    score: 12,
                  },
                },
              ],
            },
          } as MyMatch,
        ],
      },
    ],
    currentAction: 0,
    id: "2 player peg show first wins game",
    changeHistory: {
      lastChangeDate: new Date("19 May 2023 09:00"),
      matchCreationDate: new Date("20 December 2022 14:48"),
      numberOfActions: 7,
    },
    title: "2 player peg show first wins game",
    gameState: CribGameState.Pegging,
    box: [],
    myCards: [],
    cutCard: TwoDiamonds,
    scores: [
      { games: 1, frontPeg: 22, backPeg: 9 },
      { games: 2, frontPeg: 110, backPeg: 105 },
    ],
    pegging: {
      turnedOverCards: [
        {
          owner: "Me",
          playingCard: KingSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player2",
          playingCard: QueenSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Me",
          playingCard: JackSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player2",
          playingCard: AceSpades,
          peggingScore: zeroPegScoring,
        },
      ],
      inPlayCards: [
        {
          owner: "Me",
          playingCard: TwoSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Player2",
          playingCard: ThreeSpades,
          peggingScore: zeroPegScoring,
        },
        {
          owner: "Me",
          playingCard: ThreeHearts,
          peggingScore: zeroPegScoring,
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
    myScoringHistory: noScoringHistory,
    otherPlayers: [
      {
        id: "Player2",
        discarded: true,
        playerScoringHistory: noScoringHistory,
        ready: false,
      },
    ],
  },
];

const cardMatch = (card1: PlayingCard, card2: PlayingCard | undefined) => {
  if (card2 === undefined) return false;
  return card1.suit === card2.suit && card1.pips === card2.pips;
};

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
      // eslint-disable-next-line complexity
      RadHubConnectionInstance.interceptSend((methodName, ...args) => {
        switch (methodName) {
          case "Discard":
            break;
          case "Peg":
            break;
          case "Ready":
            //const match = (playMatchRef.current as MatchDetail).match;
            // it is me
            break;
        }
        if (methodName === "Discard") {
          // 0 is the matchId
          const discard1 = args[1] as PlayingCard;
          const discard2 = args[2] as PlayingCard;
          const match = (playMatchRef.current as MatchDetail).match;

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
        } else if (methodName === "Peg") {
          const pegged = args[1] as PlayingCard;

          const match = (playMatchRef.current as MatchDetail).match;

          const newMyCards = match.myCards.filter(
            (card) => !cardMatch(card, pegged)
          );
          const changedMatch: MyMatch = {
            ...match,
            myCards: newMyCards,
            changeHistory: {
              ...match.changeHistory,
              lastChangeDate: new Date(),
              numberOfActions: match.changeHistory.numberOfActions + 1,
            },
            pegging: {
              ...match.pegging,
              nextPlayer: match.otherPlayers[0].id,
              inPlayCards: [
                ...match.pegging.inPlayCards,
                {
                  owner: match.myId,
                  playingCard: pegged,
                  peggingScore: {
                    score: 0,
                    is31: false,
                    is15: false,
                    isLastGo: false,
                    numCardsInRun: 0,
                    numOfAKind: 0,
                  },
                },
              ],
            },
          };
          RadHubConnectionInstance.fromTheServer(
            "peg",
            match.myId,
            pegged,
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
