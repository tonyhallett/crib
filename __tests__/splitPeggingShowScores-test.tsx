import { splitPeggingShowScores } from "../src/PlayMatch/splitPeggingShowScores";
import {
  CribGameState,
  FourOfAKind,
  PegScoring,
  PeggedCard,
  PlayerScoringHistory,
  PlayingCard,
  Score,
  ShowScoring,
  ThreeOfAKind,
} from "../src/generatedTypes";
import {
  AceHearts,
  FiveDiamonds,
  FiveHearts,
  FourClubs,
  FourHearts,
  QueenClubs,
  QueenDiamonds,
  TenDiamonds,
  TenSpades,
  ThreeClubs,
  ThreeHearts,
  TwoHearts,
} from "../test-helpers/cards";

describe("splitPeggingSchowScores", () => {
  it("should return just the scores when no show", () => {
    const scores = [
      { games: 1, frontPeg: 10, backPeg: 8 },
      { games: 2, frontPeg: 4, backPeg: 0 },
    ];
    const splitScores = splitPeggingShowScores(
      {
        peggingScore: {
          is15: true,
          is31: false,
          isLastGo: false,
          numCardsInRun: 0,
          numOfAKind: 0,
          score: 2,
        },
        owner: "me",
        playingCard: TenSpades,
      },
      undefined,
      scores,
      myId,
      [],
      CribGameState.Pegging,
      []
    );
    expect(splitScores).toEqual([scores]);
  });

  it("should return 121 without game increment when pegging wins", () => {
    const scores = [
      { games: 1, frontPeg: 0, backPeg: 0 },
      { games: 2, frontPeg: 4, backPeg: 0 },
    ];
    const splitScores = splitPeggingShowScores(
      {
        peggingScore: {
          is15: true,
          is31: false,
          isLastGo: false,
          numCardsInRun: 0,
          numOfAKind: 0,
          score: 2,
        },
        owner: myId,
        playingCard: TenSpades,
      },
      undefined,
      scores,
      "me",
      [{discarded:true,playerScoringHistory:undefined as unknown as PlayerScoringHistory, id:otherPlayerId,ready:false}],
      CribGameState.GameWon,
      []
    );
    const expectedScores:Score[][] = [[
      {
        games:0,
        frontPeg:121,
        backPeg:0
      },
      scores[1]
    ]]
    expect(splitScores).toEqual(expectedScores);
  });

  const myId = "me";
  const otherPlayerId = "other";
  function scoringTest(
    beforePegShowScores:Score[], 
    showScoring:ShowScoring|undefined, 
    pegScoring:PegScoring, 
    pegScoringIsMe:boolean,
    cribGameState:CribGameState,
  ){
    // this needs to change for game won
    const score = (scores: Score[], isMe: boolean, amount: number) => {
      const newScores = [{ ...scores[0] }, { ...scores[1] }];
      const index = isMe ? 0 : 1;
      const scoreToChange = newScores[index];
      scoreToChange.backPeg = scoreToChange.frontPeg;
      scoreToChange.frontPeg = scoreToChange.frontPeg + amount;
      return newScores;
    };

    const stages:Score[][] = []

    const peggedCard: PeggedCard = {
      owner: pegScoringIsMe ? myId : otherPlayerId,
      peggingScore: pegScoring,
      playingCard: TenSpades,
    };

    const expectedScoresAfterPegging = score(
      beforePegShowScores,
      pegScoringIsMe,
      peggedCard.peggingScore.score
    );
    stages.push(expectedScoresAfterPegging);

    if(showScoring !== undefined){
      const playerShowScores = [...showScoring.playerShowScores];
      if(showScoring.boxScore){
        playerShowScores.push({
          playerId:playerShowScores[1].playerId,
          showScore:showScoring.boxScore
        })
      }
      playerShowScores.forEach(playerShowScore => {
        stages.push(score(stages[stages.length -1 ], playerShowScore.playerId === myId,playerShowScore.showScore.score));
      })
    }

    
    const spltPeggingScores = splitPeggingShowScores(
      peggedCard,
      showScoring,
      stages[stages.length - 1],
      myId,
      [
        {
          id: otherPlayerId,
          discarded: true,
          playerScoringHistory: undefined as unknown as PlayerScoringHistory,
          ready: false,
        },
      ],
      cribGameState,
      beforePegShowScores
    );

    spltPeggingScores.forEach((scores, index) => {
      for (let i = 0; i < scores.length; i++) {
        const score = scores[i];
        const expectedScore = stages[index][i];
        expect(score.frontPeg).toEqual(expectedScore.frontPeg);
      }
    });
  }

  it("should separate box, player scores and pegging", () => {
    const beforePegShowScores = [
      { games: 1, frontPeg: 5, backPeg: 3 },
      { games: 0, frontPeg: 2, backPeg: 1 },
    ];
    scoringTest(
      beforePegShowScores,
      {
        boxScore: {
          score: 4, // ************************************************
          fifteenTwos: [
            [TenSpades, TenDiamonds],
            [QueenClubs, QueenDiamonds],
          ],
          runs: [],
          pairs: [],
          flush: [],
          oneForHisKnob: undefined as unknown as PlayingCard,
          threeOfAKind: undefined as unknown as ThreeOfAKind,
          fourOfAKind: undefined as unknown as FourOfAKind,
        },
        playerShowScores: [
          {
            playerId: otherPlayerId,
            showScore: {
              score: 5, // ********************************************
              fifteenTwos: [],
              runs: [[AceHearts, TwoHearts, ThreeHearts, FourHearts, FiveHearts]],
              pairs: [],
              flush: [],
              oneForHisKnob: undefined as unknown as PlayingCard,
              threeOfAKind: undefined as unknown as ThreeOfAKind,
              fourOfAKind: undefined as unknown as FourOfAKind,
            },
          },
          {
            playerId: myId,
            showScore: {
              score: 3, // ********************************************
              fifteenTwos: [],
              runs: [[ThreeClubs, FourClubs, FiveDiamonds]],
              pairs: [],
              flush: [],
              oneForHisKnob: undefined as unknown as PlayingCard,
              threeOfAKind: undefined as unknown as ThreeOfAKind,
              fourOfAKind: undefined as unknown as FourOfAKind,
            },
          },
        ],
      },
      {
        is15: true,
        is31: false,
        isLastGo: false,
        numCardsInRun: 0,
        numOfAKind: 0,
        score: 2,
      },
      true,
      CribGameState.Show,
      )
  });

  it("should work when there is no box score", () => {
    const beforePegShowScores = [
      { games: 1, frontPeg: 5, backPeg: 3 },
      { games: 0, frontPeg: 2, backPeg: 1 },
    ];
    scoringTest(
      beforePegShowScores,
      {
        playerShowScores: [
          {
            playerId: otherPlayerId,
            showScore: {
              score: 5, // ********************************************
              fifteenTwos: [],
              runs: [[AceHearts, TwoHearts, ThreeHearts, FourHearts, FiveHearts]],
              pairs: [],
              flush: [],
              oneForHisKnob: undefined as unknown as PlayingCard,
              threeOfAKind: undefined as unknown as ThreeOfAKind,
              fourOfAKind: undefined as unknown as FourOfAKind,
            },
          },
          {
            playerId: myId,
            showScore: {
              score: 3, // ********************************************
              fifteenTwos: [],
              runs: [[ThreeClubs, FourClubs, FiveDiamonds]],
              pairs: [],
              flush: [],
              oneForHisKnob: undefined as unknown as PlayingCard,
              threeOfAKind: undefined as unknown as ThreeOfAKind,
              fourOfAKind: undefined as unknown as FourOfAKind,
            },
          },
        ],
      },
      {
        is15: true,
        is31: false,
        isLastGo: false,
        numCardsInRun: 0,
        numOfAKind: 0,
        score: 2,
      },
      true,
      CribGameState.Show)
  });

  it("should work when game won and show score would exceed 121", () => {
    throw new Error("not implemented");
  });



  // A change the score function to replicate server when game wins

  // do a team score
});
