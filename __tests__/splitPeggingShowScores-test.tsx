import { splitPeggingShowScores } from "../src/PlayMatch/splitPeggingShowScores";
import {
  PeggedCard,
  PlayerScoringHistory,
  Score,
  ShowScore,
} from "../src/generatedTypes";
import {
  TenSpades,
} from "../test-helpers/cards";

describe("splitPeggingSchowScores", () => {
  const myId = "me";
  const otherPlayerId = "other";
  it("should work when no show", () => {
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
      myId,
      [{discarded:true,playerScoringHistory:undefined as unknown as PlayerScoringHistory, id:otherPlayerId,ready:false}],
      [{ games: 1, frontPeg: 10, backPeg: 8 },
      { games: 2, frontPeg: 4, backPeg: 0 }],
    );
    expect(splitScores).toEqual([[
      { games: 1, frontPeg: 12, backPeg: 10 },
      { games: 2, frontPeg: 4, backPeg: 0 }
    ]]);
  });

  it("should return 121 without game increment when pegging wins and score exceeds 121", () => {
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
      myId,
      [{discarded:true,playerScoringHistory:undefined as unknown as PlayerScoringHistory, id:otherPlayerId,ready:false}],
      [
        { games: 0, frontPeg: 120, backPeg: 119 },
        { games: 2, frontPeg: 4, backPeg: 0 },
      ]
    );
    const expectedScores:Score[][] = [[
      {
        games:0,
        frontPeg:121,
        backPeg:120
      },
      { games: 2, frontPeg: 4, backPeg: 0 }
    ]]
    expect(splitScores).toEqual(expectedScores);
  });

  function getShowScore(score:number):ShowScore{
    return {
      score,
      fifteenTwos:[],
      runs:[],
      pairs:[],
      flush:[],
      fourOfAKind:undefined,
      oneForHisKnob:undefined,
      threeOfAKind:undefined
    }
  }

  function getPeggedCard(isMe:boolean, score:number):PeggedCard{
    return {
      owner:isMe ? myId : otherPlayerId,
      peggingScore:{
        is15:false,
        is31:false,
        isLastGo:false,
        numCardsInRun:0,
        numOfAKind:0,
        score
      },
      playingCard:TenSpades
    }
  }

  it("should separate box, player scores and pegging", () => {
    const splitScores = splitPeggingShowScores(
      getPeggedCard(true,2),
      {
        boxScore:getShowScore(5),
        playerShowScores:[
          {
            playerId:myId,
            showScore:getShowScore(1)
          },
          {
            playerId:otherPlayerId,
            showScore:getShowScore(3)
          }
        ]
      },
      myId,
      [{discarded:true,playerScoringHistory:undefined as unknown as PlayerScoringHistory, id:otherPlayerId,ready:false}],
      [
        { games: 0, frontPeg: 2, backPeg: 1 },
        { games: 2, frontPeg: 4, backPeg: 0 },
      ]
    );
    const expectedScores:Score[][] = [
      // I pegged 2
      [
        { games: 0, frontPeg: 4, backPeg: 2 },
        { games: 2, frontPeg: 4, backPeg: 0 },
      ],
      // I got 1 for show
      [
        { games: 0, frontPeg: 5, backPeg: 4 },
        { games: 2, frontPeg: 4, backPeg: 0 },
      ],
      // other got 3 for show
      [
        { games: 0, frontPeg: 5, backPeg: 4 },
        { games: 2, frontPeg: 7, backPeg: 4 },
      ],
      // box got 5
      [
        { games: 0, frontPeg: 5, backPeg: 4 },
        { games: 2, frontPeg: 12, backPeg: 7 },
      ]
    ]
    expect(splitScores).toEqual(expectedScores);
  });

  it("should work when game won and show score would exceed 121", () => {
    const splitScores = splitPeggingShowScores(
      getPeggedCard(false,2),
      {
        boxScore:getShowScore(10),
        playerShowScores:[
          {
            playerId:otherPlayerId,
            showScore:getShowScore(0)
          },
          {
            playerId:myId,
            showScore:getShowScore(0)
          }
        ]
      },
      myId,
      [{discarded:true,playerScoringHistory:undefined as unknown as PlayerScoringHistory, id:otherPlayerId,ready:false}],
      [
        { games: 0, frontPeg: 115, backPeg: 112 },
        { games: 2, frontPeg: 4, backPeg: 0 },
      ]
    );
    const expectedScores:Score[][] = [
      // other pegged 2
      [
        { games: 0, frontPeg: 115, backPeg: 112 },
        { games: 2, frontPeg: 6, backPeg: 4 },
      ],
      // other got 0 for show
      [
        { games: 0, frontPeg: 115, backPeg: 112 },
        { games: 2, frontPeg: 6, backPeg: 4 },
      ],
      // I got 0 for show
      [
        { games: 0, frontPeg: 115, backPeg: 112 },
        { games: 2, frontPeg: 6, backPeg: 4 },
      ],
      // box got 10
      [
        { games: 0, frontPeg: 121, backPeg: 115 },
        { games: 2, frontPeg: 6, backPeg: 4 },
      ],
    ]
    expect(splitScores).toEqual(expectedScores);
  });

  it("should work when there is no box score", () => {
    const splitScores = splitPeggingShowScores(
      getPeggedCard(false,2),
      {
        playerShowScores:[
          {
            playerId:otherPlayerId,
            showScore:getShowScore(0)
          },
          {
            playerId:myId,
            showScore:getShowScore(10)
          }
        ]
      },
      myId,
      [{discarded:true,playerScoringHistory:undefined as unknown as PlayerScoringHistory, id:otherPlayerId,ready:false}],
      [
        { games: 0, frontPeg: 115, backPeg: 112 },
        { games: 2, frontPeg: 4, backPeg: 0 },
      ]
    );
    const expectedScores:Score[][] = [
      // other pegged 2
      [
        { games: 0, frontPeg: 115, backPeg: 112 },
        { games: 2, frontPeg: 6, backPeg: 4 },
      ],
      // other got 0 for show
      [
        { games: 0, frontPeg: 115, backPeg: 112 },
        { games: 2, frontPeg: 6, backPeg: 4 },
      ],
      // I got 10 for show
      [
        { games: 0, frontPeg: 121, backPeg: 115 },
        { games: 2, frontPeg: 6, backPeg: 4 },
      ],
    ]
    expect(splitScores).toEqual(expectedScores);
  });

  it("should work with team scores", () => {
    const otherPlayer2Id = "other2";
    const otherPlayer3Id = "other3";
    const splitScores = splitPeggingShowScores(
      getPeggedCard(true,6),
      {
        boxScore:getShowScore(5),
        playerShowScores:[
          
          {
            playerId:myId,
            showScore:getShowScore(1)
          },
          {
            playerId:otherPlayerId,
            showScore:getShowScore(2)
          },
          {
            playerId:otherPlayer2Id,
            showScore:getShowScore(3)
          },
          {
            playerId:otherPlayer3Id,
            showScore:getShowScore(4)
          },
        ]
      },
      myId,
      [
        {discarded:true,playerScoringHistory:undefined as unknown as PlayerScoringHistory, id:otherPlayerId,ready:false},
        {discarded:true,playerScoringHistory:undefined as unknown as PlayerScoringHistory, id:otherPlayer2Id,ready:false},
        {discarded:true,playerScoringHistory:undefined as unknown as PlayerScoringHistory, id:otherPlayer3Id,ready:false}
      ],
      [
        { games: 0, frontPeg: 2, backPeg: 1 },
        { games: 2, frontPeg: 4, backPeg: 0 },
      ]
    );
    const expectedScores:Score[][] = [
      // I pegged 6
      [
        { games: 0, frontPeg: 8, backPeg: 2 },
        { games: 2, frontPeg: 4, backPeg: 0 },
      ],
      // I got 1 for show
      [
        { games: 0, frontPeg: 9, backPeg: 8 },
        { games: 2, frontPeg: 4, backPeg: 0 },
      ],
      // other got 2 for show
      [
        { games: 0, frontPeg: 9, backPeg: 8 },
        { games: 2, frontPeg: 6, backPeg: 4 },
      ],
      // other2 got 3 for show
      [
        { games: 0, frontPeg: 12, backPeg: 9 },
        { games: 2, frontPeg: 6, backPeg: 4 },
      ],
      // other3 got 4 for show
      [
        { games: 0, frontPeg: 12, backPeg: 9 },
        { games: 2, frontPeg: 10, backPeg: 6 },
      ],
      // box got 5
      [
        { games: 0, frontPeg: 12, backPeg: 9 },
        { games: 2, frontPeg: 15, backPeg: 10 },
      ],
    ]
    expect(splitScores).toEqual(expectedScores);
  })
});
