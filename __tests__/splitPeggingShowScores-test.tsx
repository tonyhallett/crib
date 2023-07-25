import { splitPeggingShowScores } from "../src/PlayMatch/splitPeggingShowScores"
import { FourOfAKind, PeggedCard, PlayerScoringHistory, PlayingCard, Score, ShowScoring, ThreeOfAKind } from "../src/generatedTypes";
import { AceHearts, FiveDiamonds, FiveHearts, FourClubs, FourHearts, QueenClubs, QueenDiamonds, TenDiamonds, TenSpades, ThreeClubs, ThreeHearts, TwoHearts } from "../test-helpers/cards"

describe("splitPeggingSchowScores", () => {
    it("should return just the scores when no show", () => {
        const scores = [{games:1,frontPeg:10,backPeg:8},{games:2,frontPeg:4,backPeg:0}];
        const splitScores = splitPeggingShowScores(
            {
                peggingScore:{
                    is15:true,
                    is31:false,
                    isLastGo:false,
                    numCardsInRun:0,
                    numOfAKind:0,
                    score:2,
                },
                owner:"me",
                playingCard:TenSpades
            },
            undefined,
            scores,
            "me",
            []
        );
        expect(splitScores).toEqual([scores]);
    })

    it("should separate box, player scores and pegging", () => {
        const score = (scores:Score[], isMe:boolean, amount:number) => {
            const newScores = [{...scores[0]}, {...scores[1]}];
            const index = isMe ? 0 : 1;
            const scoreToChange = newScores[index];
            scoreToChange.backPeg = scoreToChange.frontPeg;
            scoreToChange.frontPeg = scoreToChange.frontPeg + amount;
            return newScores;
        }
        
        
        const beforePegShowScores = [{games:1,frontPeg:5,backPeg:3},{games:0,frontPeg:2,backPeg:1}];
        
        const peggedCard:PeggedCard = {
            owner:"me",
            peggingScore:{
                is15:true,
                is31:false,
                isLastGo:false,
                numCardsInRun:0,
                numOfAKind:0,
                score:2,
            },
            playingCard:TenSpades
        }
        const expectedScoresAfterPegging2 = score(beforePegShowScores,true,peggedCard.peggingScore.score);
        
        const showScoring:ShowScoring = {
            boxScore:{
                score:4, // ************************************************
                fifteenTwos:[[TenSpades,TenDiamonds],[QueenClubs,QueenDiamonds]],
                runs:[],
                pairs:[],
                flush:[],
                oneForHisKnob:undefined as unknown as PlayingCard,
                threeOfAKind:undefined as unknown as ThreeOfAKind,
                fourOfAKind:undefined as unknown as FourOfAKind,
            },
            playerShowScores:[
                {
                    playerId:"other",
                    showScore:{
                        score:5, // ********************************************
                        fifteenTwos:[],
                        runs:[[AceHearts,TwoHearts,ThreeHearts,FourHearts,FiveHearts]],
                        pairs:[],
                        flush:[],
                        oneForHisKnob:undefined as unknown as PlayingCard,
                        threeOfAKind:undefined as unknown as ThreeOfAKind,
                        fourOfAKind:undefined as unknown as FourOfAKind,
                    }
                },
                {
                    playerId:"me",
                    showScore:{
                        score:3, // ********************************************
                        fifteenTwos:[],
                        runs:[[ThreeClubs, FourClubs,FiveDiamonds]],
                        pairs:[],
                        flush:[],
                        oneForHisKnob:undefined as unknown as PlayingCard,
                        threeOfAKind:undefined as unknown as ThreeOfAKind,
                        fourOfAKind:undefined as unknown as FourOfAKind,
                    }
                },
            ]
        }
        const expectedAfterOtherScores5 = score(expectedScoresAfterPegging2,showScoring.playerShowScores[0].playerId === "me",showScoring.playerShowScores[0].showScore.score);
        const expectedAfterMeScores3 = score(expectedAfterOtherScores5,showScoring.playerShowScores[1].playerId === "me",showScoring.playerShowScores[1].showScore.score);
        const afterBoxScores4 = score(expectedAfterMeScores3,showScoring.playerShowScores[1].playerId === "me",showScoring.boxScore.score);
        
        const stages = [
            beforePegShowScores,

            expectedScoresAfterPegging2,
            expectedAfterOtherScores5,
            expectedAfterMeScores3,
            afterBoxScores4
        ];

        const spltPeggingScores  = splitPeggingShowScores(
            peggedCard,
            showScoring,
            afterBoxScores4,
            "me",
            [{
                id:"other",
                discarded:true,
                playerScoringHistory:undefined as unknown as PlayerScoringHistory,
                ready:false
            }]
        )

        spltPeggingScores.forEach((scores,index) => {
            for(let i = 0;i<scores.length;i++){
                const score = scores[i];
                const expectedScore = stages[index+1][i];
                expect(score.frontPeg).toEqual(expectedScore.frontPeg);
            }
        });
        
    });
    // do a team score

})