/* eslint-disable */
// Generated from ServerlessHub<T>
import * as signalR from "@microsoft/signalr";

export type Friendship = {
  player: string;
  friend: string;
  status: FriendshipStatus;
  inviteDate: Date;
  isInviter: boolean;
  id: string;
  otherId: string;
};
export type MatchOptions = {
  otherPlayers: string[];
  matchWinDeterminant: string;
  title: string;
};
export type PlayingCard = {
  suit: Suit;
  pips: Pips;
};
export type MyMatch = {
  id: string;
  title: string;
  gameState: CribGameState;
  matchWinDeterminant: string;
  dealerDetails: DealerDetails;
  changeHistory: ChangeHistory;
  showScoring?: null | ShowScoring;
  pegging: MyPegging;
  scores: Score[];
  cutCard?: null | PlayingCard;
  box?: null | PlayingCard[];
  otherPlayers: OtherPlayer[];
  myCards: PlayingCard[];
  myReady: boolean;
  myScoringHistory: PlayerScoringHistory;
  myId: string;
};
export interface CribClient {
  discard(playerId: string, myMatch: MyMatch): void;
  ready(playerId: string, myMatch: MyMatch): void;
  peg(playerId: string, peggedCard: PlayingCard, myMatch: MyMatch): void;
  friendRequest(friendship: Friendship): void;
  friendRequestAccepted(inviterFriendship: Friendship): void;
  initialPlayerData(myFriends: Friendship[], matches: MyMatch[]): void;
  matchCreated(match: MyMatch): void;
  sentFriendRequests(inviterFriendships: Friendship[]): void;
}
export enum FriendshipStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Rejected = "Rejected",
}
export enum Suit {
  Clubs = "Clubs",
  Diamonds = "Diamonds",
  Hearts = "Hearts",
  Spades = "Spades",
}
export enum Pips {
  Ace = "Ace",
  Two = "Two",
  Three = "Three",
  Four = "Four",
  Five = "Five",
  Six = "Six",
  Seven = "Seven",
  Eight = "Eight",
  Nine = "Nine",
  Ten = "Ten",
  Jack = "Jack",
  Queen = "Queen",
  King = "King",
}
export enum CribGameState {
  Discard = "Discard",
  Pegging = "Pegging",
  Show = "Show",
  MatchWon = "MatchWon",
  GameWon = "GameWon",
}
export type DealerDetails = {
  first: string;
  current: string;
};
export type ChangeHistory = {
  matchCreationDate: Date;
  lastChangeDate: Date;
  numberOfActions: number;
};
export type ShowScoring = {
  boxScore?: null | ShowScore;
  playerShowScores: PlayerShowScore[];
};
export type MyPegging = {
  turnedOverCards: PeggedCard[];
  inPlayCards: PeggedCard[];
  nextPlayer: string;
  myCannotGo: boolean;
  cannotGoes: boolean[];
  goHistory: Go[];
};
export type Score = {
  games: number;
  frontPeg: number;
  backPeg: number;
};
export type OtherPlayer = {
  id: string;
  discarded: boolean;
  ready: boolean;
  playerScoringHistory: PlayerScoringHistory;
};
export type PlayerScoringHistory = {
  handHistory: ScoringHistory<HighestScoringCards>;
  boxHistory: ScoringHistory<HighestScoringCards>;
  handAndBoxHistory: ScoringHistory<HandAndBoxHighestScoringCards>;
};
export type ShowScore = {
  pairs: Pair[];
  threeOfAKind?: null | ThreeOfAKind;
  fourOfAKind?: null | FourOfAKind;
  oneForHisKnob?: null | PlayingCard;
  runs: PlayingCard[][];
  fifteenTwos: PlayingCard[][];
  flush: PlayingCard[];
  score: number;
};
export type PlayerShowScore = {
  showScore: ShowScore;
  playerId: string;
};
export type PeggedCard = {
  owner: string;
  playingCard: PlayingCard;
  peggingScore: PegScoring;
};
export type Go = {
  playerId: string;
  afterPegged: number;
};
export type ScoringHistory<T> = {
  numScores: number;
  totalScore: number;
  highestScoringCards?: null | T;
};
export type HighestScoringCards = {
  score: number;
  handOrBox: PlayingCard[];
  cutCard: PlayingCard;
};
export type HandAndBoxHighestScoringCards = {
  score: number;
  handScore: number;
  boxScore: number;
  hand: PlayingCard[];
  box?: null | PlayingCard[];
  cutCard: PlayingCard;
};
export type Pair = {
  card1: PlayingCard;
  card2: PlayingCard;
};
export type ThreeOfAKind = {
  card1: PlayingCard;
  card2: PlayingCard;
  card3: PlayingCard;
};
export type FourOfAKind = {
  card1: PlayingCard;
  card2: PlayingCard;
  card3: PlayingCard;
  card4: PlayingCard;
};
export type PegScoring = {
  is31: boolean;
  is15: boolean;
  numCardsInRun: number;
  numOfAKind: number;
  isLastGo: boolean;
  score: number;
};

export const hubFactory = {
  crib(connection: signalR.HubConnection) {
    return {
      initialPlayerData: () => connection.send("InitialPlayerData"),
      sendFriendRequests: (friends: string[]) =>
        connection.send("SendFriendRequests", friends),
      acceptFriendRequest: (friendship: Friendship) =>
        connection.send("AcceptFriendRequest", friendship),
      createMatch: (matchOptions: MatchOptions) =>
        connection.send("CreateMatch", matchOptions),
      discard: (
        matchId: string,
        discard1: PlayingCard,
        discard2?: PlayingCard
      ) => connection.send("Discard", matchId, discard1, discard2),
      peg: (matchId: string, peggedCard: PlayingCard) =>
        connection.send("Peg", matchId, peggedCard),
      ready: (matchId: string) => connection.send("Ready", matchId),
    };
  },
};
export type CribHub = ReturnType<(typeof hubFactory)["crib"]>;

interface ITypedConnection<T> {
  toggleAll(on: boolean): void;
  off(toOff: keyof T): void;
  on(toOn: keyof T): void;
}

type UntypedHandler = Parameters<signalR.HubConnection["on"]>[1];
type UntypedClient<T> = {
  [Property in keyof T]: UntypedHandler;
};

class TypedConnection<T> implements ITypedConnection<T> {
  constructor(
    private untypedClient: UntypedClient<T>,
    private connection: signalR.HubConnection,
    addHandlers: boolean = true
  ) {
    if (addHandlers) {
      this.addHandlers();
    }
  }

  addHandlers() {
    for (const method in this.untypedClient) {
      this.connection.on(
        method,
        this.untypedClient[method as keyof UntypedClient<T>]
      );
    }
  }
  removeHandlers() {
    for (const method in this.untypedClient) {
      this.connection.off(
        method,
        this.untypedClient[method as keyof UntypedClient<T>]
      );
    }
  }
  toggleAll(on: boolean) {
    if (on) {
      this.addHandlers();
    } else {
      this.removeHandlers();
    }
  }

  off(toOff: Extract<keyof T, string>) {
    this.connection.off(toOff, this.untypedClient[toOff]);
  }

  on(toOn: Extract<keyof T, string>) {
    this.connection.on(toOn, this.untypedClient[toOn]);
  }
}

export const clientFactory = {
  crib(
    connection: signalR.HubConnection,
    client: CribClient
  ): ITypedConnection<CribClient> {
    const untypedClient: UntypedClient<CribClient> = {
      discard(playerId: string, myMatch: MyMatch) {
        return client.discard(playerId, myMatch);
      },

      ready(playerId: string, myMatch: MyMatch) {
        return client.ready(playerId, myMatch);
      },

      peg(playerId: string, peggedCard: PlayingCard, myMatch: MyMatch) {
        return client.peg(playerId, peggedCard, myMatch);
      },

      friendRequest(friendship: Friendship) {
        return client.friendRequest(friendship);
      },

      friendRequestAccepted(inviterFriendship: Friendship) {
        return client.friendRequestAccepted(inviterFriendship);
      },

      initialPlayerData(myFriends: Friendship[], matches: MyMatch[]) {
        return client.initialPlayerData(myFriends, matches);
      },

      matchCreated(match: MyMatch) {
        return client.matchCreated(match);
      },

      sentFriendRequests(inviterFriendships: Friendship[]) {
        return client.sentFriendRequests(inviterFriendships);
      },
    };

    return new TypedConnection(untypedClient, connection);
  },
};
