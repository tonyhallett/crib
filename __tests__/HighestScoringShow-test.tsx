import {
  HighestScoringShow,
  HighestScoringShowResult,
} from "../src/PlayMatch/signalr/pegging/HighestScoringShow";
import { MyMatch, PlayingCard } from "../src/generatedTypes";
import {
  AceClubs,
  AceDiamonds,
  AceHearts,
  AceSpades,
  FiveClubs,
  FiveDiamonds,
  FiveHearts,
  FiveSpades,
  FourClubs,
  JackDiamonds,
  JackHearts,
  JackSpades,
  KingClubs,
  KingHearts,
  KingSpades,
  NineDiamonds,
  NineSpades,
  QueenClubs,
  SevenSpades,
  SixClubs,
  SixSpades,
  TenSpades,
  ThreeClubs,
  ThreeDiamonds,
  TwoClubs,
  TwoDiamonds,
  TwoHearts,
  TwoSpades,
} from "../test-helpers/cards";

describe("HighestScoringShow", () => {
  type MyMatchRequired = Pick<
    MyMatch,
    "myId" | "myScoringHistory" | "otherPlayers"
  >;
  describe("hand", () => {
    it("should return false when hand is not the highest scoring for the player", () => {
      const myMatch: MyMatchRequired = {
        myId: "me",
        myScoringHistory: {
          handHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              score: 12,
              cutCard: TwoSpades,
              handOrBox: [TwoDiamonds, TwoClubs, TwoHearts, AceDiamonds],
            },
          },
          boxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: undefined,
          },
          handAndBoxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: undefined,
          },
        },
        otherPlayers: [
          {
            id: "other",
            playerScoringHistory: {
              handHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: undefined,
              },
              boxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: undefined,
              },
              handAndBoxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: undefined,
              },
            },
            ready: false,
            discarded: true,
          },
        ],
      };
      const highestScoringShow = new HighestScoringShow(
        myMatch as unknown as MyMatch
      );
      const myHand: PlayingCard[] = [
        FourClubs,
        TwoDiamonds,
        TwoClubs,
        TwoHearts,
        AceDiamonds,
      ];
      const result = highestScoringShow.isHighestScoring(
        myHand,
        myMatch.myId,
        false
      );
      const expectedResult: HighestScoringShowResult = {
        handOrBox: false,
        score: 0,
        highestHandOrBoxOfAll: false,

        handAndBox: false,
        handAndBoxScore: 0,
        highestHandAndBoxOfAll: false,
      };
      expect(result).toEqual(expectedResult);
    });

    it("should return true when hand is the highest scoring for the player - not highest scoring of all", () => {
      const myMatch: MyMatchRequired = {
        myId: "me",
        myScoringHistory: {
          handHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              score: 12,
              cutCard: TwoSpades,
              handOrBox: [TwoDiamonds, TwoClubs, TwoHearts, AceDiamonds],
            },
          },
          boxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: undefined,
          },
          handAndBoxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: undefined,
          },
        },
        otherPlayers: [
          {
            id: "other",
            playerScoringHistory: {
              handHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: {
                  score: 29,
                  cutCard: FiveHearts,
                  handOrBox: [JackHearts, FiveClubs, FiveDiamonds, FiveSpades],
                },
              },
              boxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: undefined,
              },
              handAndBoxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: undefined,
              },
            },
            ready: false,
            discarded: true,
          },
        ],
      };
      const highestScoringShow = new HighestScoringShow(
        myMatch as unknown as MyMatch
      );
      const myHand: PlayingCard[] = [
        TwoSpades,
        TwoDiamonds,
        TwoClubs,
        TwoHearts,
        AceDiamonds,
      ];
      const result = highestScoringShow.isHighestScoring(
        myHand,
        myMatch.myId,
        false
      );
      const expectedResult: HighestScoringShowResult = {
        handOrBox: true,
        score: 12,
        highestHandOrBoxOfAll: false,

        handAndBox: false,
        handAndBoxScore: 0,
        highestHandAndBoxOfAll: false,
      };
      expect(result).toEqual(expectedResult);
    });

    it("should return true when hand is the highest scoring of all", () => {
      const myMatch: MyMatchRequired = {
        myId: "me",
        myScoringHistory: {
          handHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              score: 12,
              cutCard: TwoSpades,
              handOrBox: [TwoDiamonds, TwoClubs, TwoHearts, AceDiamonds],
            },
          },
          boxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: undefined,
          },
          handAndBoxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: undefined,
          },
        },
        otherPlayers: [
          {
            id: "other",
            playerScoringHistory: {
              handHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: {
                  score: 1,
                  cutCard: FiveHearts,
                  handOrBox: [JackHearts, AceDiamonds, SixClubs, TwoDiamonds],
                },
              },
              boxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: undefined,
              },
              handAndBoxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: undefined,
              },
            },
            ready: false,
            discarded: true,
          },
        ],
      };
      const highestScoringShow = new HighestScoringShow(
        myMatch as unknown as MyMatch
      );
      const myHand: PlayingCard[] = [
        TwoSpades,
        TwoDiamonds,
        TwoClubs,
        TwoHearts,
        AceDiamonds,
      ];
      const result = highestScoringShow.isHighestScoring(
        myHand,
        myMatch.myId,
        false
      );
      const expectedResult: HighestScoringShowResult = {
        handOrBox: true,
        score: 12,
        highestHandOrBoxOfAll: true,

        handAndBox: false,
        handAndBoxScore: 0,
        highestHandAndBoxOfAll: false,
      };
      expect(result).toEqual(expectedResult);
    });
  });

  describe("box", () => {
    it("should return false if not the highest scoring box for the player", () => {
      const myMatch: MyMatchRequired = {
        myId: "me",
        myScoringHistory: {
          handHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              score: 12,
              cutCard: TwoSpades,
              handOrBox: [TwoDiamonds, TwoClubs, TwoHearts, AceDiamonds],
            },
          },
          boxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              cutCard: AceDiamonds,
              score: 3,
              handOrBox: [AceHearts, JackDiamonds, NineDiamonds, KingClubs],
            },
          },
          handAndBoxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              cutCard: TwoSpades,
              score: 15,
              handScore: 12,
              hand: [TwoDiamonds, TwoHearts, TwoClubs, ThreeDiamonds],
              boxScore: 3,
              box: [JackSpades, FiveClubs, KingHearts, AceDiamonds],
            },
          },
        },
        otherPlayers: [
          {
            id: "other",
            playerScoringHistory: {
              handHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: {
                  cutCard: AceDiamonds,
                  handOrBox: [AceHearts, AceSpades, AceClubs, TenSpades],
                  score: 12,
                },
              },
              boxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: undefined,
              },
              handAndBoxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: undefined,
              },
            },
            ready: false,
            discarded: true,
          },
        ],
      };
      const highestScoringShow = new HighestScoringShow(
        myMatch as unknown as MyMatch
      );
      const myHand: PlayingCard[] = [
        FourClubs,
        TwoDiamonds,
        TwoClubs,
        TwoHearts,
        AceDiamonds,
      ];
      const otherHand: PlayingCard[] = [
        FourClubs,
        QueenClubs,
        KingClubs,
        ThreeClubs,
        SixSpades,
      ];
      const myBox: PlayingCard[] = [
        FourClubs,
        JackSpades,
        JackDiamonds,
        SixClubs,
        SevenSpades,
      ];
      highestScoringShow.isHighestScoring(myHand, myMatch.myId, false);
      highestScoringShow.isHighestScoring(
        otherHand,
        myMatch.otherPlayers[0].id,
        false
      );
      const result = highestScoringShow.isHighestScoring(
        myBox,
        myMatch.myId,
        true
      );

      const expectedResult: HighestScoringShowResult = {
        handOrBox: false,
        score: 0,
        highestHandOrBoxOfAll: false,

        handAndBox: false,
        handAndBoxScore: 0,
        highestHandAndBoxOfAll: false,
      };
      expect(result).toEqual(expectedResult);
    });

    it("should return true if the highest scoring box for the player - not highest of all", () => {
      const myMatch: MyMatchRequired = {
        myId: "me",
        myScoringHistory: {
          handHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              score: 12,
              cutCard: TwoSpades,
              handOrBox: [TwoDiamonds, TwoClubs, TwoHearts, AceDiamonds],
            },
          },
          boxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              cutCard: FourClubs,
              score: 2,
              handOrBox: [JackSpades, JackDiamonds, SixClubs, SevenSpades],
            },
          },
          handAndBoxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              cutCard: TwoSpades,
              score: 15,
              handScore: 12,
              hand: [TwoDiamonds, TwoHearts, TwoClubs, ThreeDiamonds],
              boxScore: 3,
              box: [JackSpades, FiveClubs, KingHearts, AceDiamonds],
            },
          },
        },
        otherPlayers: [
          {
            id: "other",
            playerScoringHistory: {
              handHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: {
                  cutCard: AceDiamonds,
                  handOrBox: [AceHearts, AceSpades, AceClubs, TenSpades],
                  score: 12,
                },
              },
              boxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: {
                  cutCard: TwoHearts,
                  score: 12,
                  handOrBox: [TwoDiamonds, JackDiamonds, TwoClubs, TwoSpades],
                },
              },
              handAndBoxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: undefined,
              },
            },
            ready: false,
            discarded: true,
          },
        ],
      };
      const highestScoringShow = new HighestScoringShow(
        myMatch as unknown as MyMatch
      );
      const myHand: PlayingCard[] = [
        FourClubs,
        TwoDiamonds,
        TwoClubs,
        TwoHearts,
        AceDiamonds,
      ];
      const otherHand: PlayingCard[] = [
        FourClubs,
        QueenClubs,
        KingClubs,
        ThreeClubs,
        SixSpades,
      ];
      const myBox: PlayingCard[] = [
        FourClubs,
        JackSpades,
        JackDiamonds,
        SixClubs,
        SevenSpades,
      ];
      highestScoringShow.isHighestScoring(myHand, myMatch.myId, false);
      highestScoringShow.isHighestScoring(
        otherHand,
        myMatch.otherPlayers[0].id,
        false
      );
      const result = highestScoringShow.isHighestScoring(
        myBox,
        myMatch.myId,
        true
      );

      const expectedResult: HighestScoringShowResult = {
        handOrBox: true,
        score: 2,
        highestHandOrBoxOfAll: false,

        handAndBox: false,
        handAndBoxScore: 0,
        highestHandAndBoxOfAll: false,
      };
      expect(result).toEqual(expectedResult);
    });

    it("should return true if the highest scoring box of all", () => {
      const myMatch: MyMatchRequired = {
        myId: "me",
        myScoringHistory: {
          handHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              score: 12,
              cutCard: TwoSpades,
              handOrBox: [TwoDiamonds, TwoClubs, TwoHearts, AceDiamonds],
            },
          },
          boxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              cutCard: FourClubs,
              score: 2,
              handOrBox: [JackSpades, JackDiamonds, SixClubs, SevenSpades],
            },
          },
          handAndBoxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              cutCard: TwoSpades,
              score: 15,
              handScore: 12,
              hand: [TwoDiamonds, TwoHearts, TwoClubs, ThreeDiamonds],
              boxScore: 3,
              box: [JackSpades, FiveClubs, KingHearts, AceDiamonds],
            },
          },
        },
        otherPlayers: [
          {
            id: "other",
            playerScoringHistory: {
              handHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: {
                  cutCard: AceDiamonds,
                  handOrBox: [AceHearts, AceSpades, AceClubs, TenSpades],
                  score: 12,
                },
              },
              boxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: {
                  cutCard: TwoHearts,
                  score: 1,
                  handOrBox: [KingSpades, JackDiamonds, TwoClubs, TwoSpades],
                },
              },
              handAndBoxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: undefined,
              },
            },
            ready: false,
            discarded: true,
          },
        ],
      };
      const highestScoringShow = new HighestScoringShow(
        myMatch as unknown as MyMatch
      );
      const myHand: PlayingCard[] = [
        FourClubs,
        TwoDiamonds,
        TwoClubs,
        TwoHearts,
        AceDiamonds,
      ];
      const otherHand: PlayingCard[] = [
        FourClubs,
        QueenClubs,
        KingClubs,
        ThreeClubs,
        SixSpades,
      ];
      const myBox: PlayingCard[] = [
        FourClubs,
        JackSpades,
        JackDiamonds,
        SixClubs,
        SevenSpades,
      ];
      highestScoringShow.isHighestScoring(myHand, myMatch.myId, false);
      highestScoringShow.isHighestScoring(
        otherHand,
        myMatch.otherPlayers[0].id,
        false
      );
      const result = highestScoringShow.isHighestScoring(
        myBox,
        myMatch.myId,
        true
      );

      const expectedResult: HighestScoringShowResult = {
        handOrBox: true,
        score: 2,
        highestHandOrBoxOfAll: true,

        handAndBox: false,
        handAndBoxScore: 0,
        highestHandAndBoxOfAll: false,
      };
      expect(result).toEqual(expectedResult);
    });
  });

  describe("hand and box", () => {
    it("should return true if the highest scoring hand and box for the player", () => {
      const myMatch: MyMatchRequired = {
        myId: "me",
        myScoringHistory: {
          handHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              score: 13,
              cutCard: TwoSpades,
              handOrBox: [TwoDiamonds, TwoClubs, TwoHearts, JackSpades],
            },
          },
          boxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              cutCard: AceDiamonds,
              score: 4,
              handOrBox: [AceHearts, TwoClubs, TwoSpades, FiveClubs],
            },
          },
          handAndBoxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              cutCard: TwoHearts,
              score: 15,
              handScore: 12,
              hand: [TwoDiamonds, TwoSpades, TwoClubs, ThreeDiamonds],
              boxScore: 3,
              box: [JackHearts, FiveClubs, KingHearts, AceDiamonds],
            },
          },
        },
        otherPlayers: [
          {
            id: "other",
            playerScoringHistory: {
              handHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: {
                  cutCard: AceDiamonds,
                  handOrBox: [AceHearts, AceSpades, AceClubs, TenSpades],
                  score: 12,
                },
              },
              boxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: undefined,
              },
              handAndBoxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: {
                  cutCard: FiveHearts,
                  box: [JackHearts, FiveClubs, FiveDiamonds, FiveSpades],
                  boxScore: 29,
                  hand: [TwoDiamonds, TwoSpades, TwoClubs, ThreeDiamonds],
                  handScore: 6,
                  score: 35,
                },
              },
            },
            ready: false,
            discarded: true,
          },
        ],
      };
      const highestScoringShow = new HighestScoringShow(
        myMatch as unknown as MyMatch
      );

      const myHand: PlayingCard[] = [
        TwoHearts,
        TwoDiamonds,
        TwoSpades,
        TwoClubs,
        ThreeDiamonds,
      ];
      const otherHand: PlayingCard[] = [
        FourClubs,
        QueenClubs,
        KingClubs,
        ThreeClubs,
        SixSpades,
      ];
      const myBox: PlayingCard[] = [
        TwoHearts,
        JackHearts,
        FiveClubs,
        KingHearts,
        AceDiamonds,
      ];
      highestScoringShow.isHighestScoring(myHand, myMatch.myId, false);
      highestScoringShow.isHighestScoring(
        otherHand,
        myMatch.otherPlayers[0].id,
        false
      );
      const result = highestScoringShow.isHighestScoring(
        myBox,
        myMatch.myId,
        true
      );

      const expectedResult: HighestScoringShowResult = {
        handOrBox: false,
        score: 0,
        highestHandOrBoxOfAll: false,

        handAndBox: true,
        handAndBoxScore: 15,
        highestHandAndBoxOfAll: false,
      };
      expect(result).toEqual(expectedResult);
    });

    it("should return true if the highest scoring hand and box of all", () => {
      const myMatch: MyMatchRequired = {
        myId: "me",
        myScoringHistory: {
          handHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              score: 13,
              cutCard: TwoSpades,
              handOrBox: [TwoDiamonds, TwoClubs, TwoHearts, JackSpades],
            },
          },
          boxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              cutCard: AceDiamonds,
              score: 4,
              handOrBox: [AceHearts, TwoClubs, TwoSpades, FiveClubs],
            },
          },
          handAndBoxHistory: {
            numScores: 0,
            totalScore: 0,
            highestScoringCards: {
              cutCard: TwoHearts,
              score: 15,
              handScore: 12,
              hand: [TwoDiamonds, TwoSpades, TwoClubs, ThreeDiamonds],
              boxScore: 3,
              box: [JackHearts, FiveClubs, KingHearts, AceDiamonds],
            },
          },
        },
        otherPlayers: [
          {
            id: "other",
            playerScoringHistory: {
              handHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: {
                  cutCard: AceDiamonds,
                  handOrBox: [AceHearts, AceSpades, AceClubs, TenSpades],
                  score: 12,
                },
              },
              boxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: undefined,
              },
              handAndBoxHistory: {
                numScores: 0,
                totalScore: 0,
                highestScoringCards: {
                  cutCard: FiveHearts,
                  box: [FiveDiamonds, NineSpades, JackSpades, KingSpades],
                  boxScore: 2,
                  hand: [TwoDiamonds, TwoSpades, TwoClubs, ThreeDiamonds],
                  handScore: 6,
                  score: 8,
                },
              },
            },
            ready: false,
            discarded: true,
          },
        ],
      };
      const highestScoringShow = new HighestScoringShow(
        myMatch as unknown as MyMatch
      );

      const myHand: PlayingCard[] = [
        TwoHearts,
        TwoDiamonds,
        TwoSpades,
        TwoClubs,
        ThreeDiamonds,
      ];
      const otherHand: PlayingCard[] = [
        FourClubs,
        QueenClubs,
        KingClubs,
        ThreeClubs,
        SixSpades,
      ];
      const myBox: PlayingCard[] = [
        TwoHearts,
        JackHearts,
        FiveClubs,
        KingHearts,
        AceDiamonds,
      ];
      highestScoringShow.isHighestScoring(myHand, myMatch.myId, false);
      highestScoringShow.isHighestScoring(
        otherHand,
        myMatch.otherPlayers[0].id,
        false
      );
      const result = highestScoringShow.isHighestScoring(
        myBox,
        myMatch.myId,
        true
      );

      const expectedResult: HighestScoringShowResult = {
        handOrBox: false,
        score: 0,
        highestHandOrBoxOfAll: false,

        handAndBox: true,
        handAndBoxScore: 15,
        highestHandAndBoxOfAll: true,
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
