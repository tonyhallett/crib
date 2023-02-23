import {getScores, sortCards, getPipsValue, cardFromJson, Suit, Pips, Card} from "../Scorer"
describe("scorer", () => {
    const aceClubs = cardFromJson("AC");
    const twoClubs = cardFromJson("2C");
    const threeClubs = cardFromJson("3C");
    const fourClubs = cardFromJson("4C");
    const fiveClubs = cardFromJson("5C");
    const aceHearts = cardFromJson("AH");
    const sameSuitCards = [aceClubs, twoClubs, threeClubs, fourClubs] as const;
    const differentSuitTopCard = aceHearts;
    const sameSuitTopCard = fiveClubs;
    const aceSpades = cardFromJson("AS");
    const aceDiamonds = cardFromJson("AD");
    const twoDiamonds = cardFromJson("2D");
    const jackDiamonds = cardFromJson("JD");
    const jackClubs = cardFromJson("JC");
    const jackSpades = cardFromJson("JS");
    const tenSpades = cardFromJson("TS");
    const queenSpades = cardFromJson("QS")
    const kingSpades = cardFromJson("KS")
    const nineSpades = cardFromJson("9S")
    const nineDiamonds = cardFromJson("9D");


    describe("cardFromJson", () => {
        it("should throw for invalid suit", () => {
            expect(() => cardFromJson("AZ")).toThrowError("Z is not a suit.  Should be H, C, D or S.");
        });

        it("should create card with correct suit", () => {
            expect(aceClubs.suit).toBe(Suit.Clubs);
            expect(aceHearts.suit).toBe(Suit.Hearts);
            expect(aceSpades.suit).toBe(Suit.Spades);
            expect(aceDiamonds.suit).toBe(Suit.Diamonds);
        });

        describe("should create card with correct value", () => {
            it("numbers", () => {
                [2,3,4,5,6,7,8,9].forEach(number => {
                    expect(cardFromJson(`${number}H`).value).toEqual(number);
                })
            });

            it("ten values", () => {
                const tenCards = [tenSpades, jackSpades, queenSpades, kingSpades];
                tenCards.forEach(tenCard => expect(tenCard.value).toBe(10));
            });

            it("ace", () => {
                expect(aceClubs.value).toBe(1);
            })
        });

        describe("create card pips correctly", () => {
            it("should work with pip identifiers", () => {
                expect(aceClubs.pips).toBe(Pips.Ace);
                expect(tenSpades.pips).toBe(Pips.Ten);
                expect(jackSpades.pips).toBe(Pips.Jack);
                expect(queenSpades.pips).toBe(Pips.Queen);
                expect(kingSpades.pips).toBe(Pips.King);
            });
        });
    })

    describe("sort cards", () => {
        it("should sort lowest to highest pips", () => {
            const sortedCards = sortCards([aceSpades,aceDiamonds, fiveClubs,twoClubs,aceHearts]);
            expect(sortedCards).toEqual([aceSpades, aceDiamonds,aceHearts, twoClubs,fiveClubs]);
        });
    });

    describe("flushes", () =>{
        it("should have no flush when box and four card flush", () => {
            const scores = getScores(sameSuitCards,differentSuitTopCard,true);
            expect(scores.flush).toBeUndefined();
        });
        it("should have 5 card flush when box has 5 card flush", () =>{
            const scores = getScores(sameSuitCards,sameSuitTopCard,true);
            expect(scores.flush).toEqual([...sameSuitCards, sameSuitTopCard]);
        });
        it("should have 4 card flush when hand has 4 card flush", () =>{
            const scores = getScores(sameSuitCards,differentSuitTopCard,false);
            expect(scores.flush).toEqual(sameSuitCards);
        });
        it("should have 5 card flush when hand has 5 card flush", () => {
            const scores = getScores(sameSuitCards,sameSuitTopCard,false);
            expect(scores.flush).toEqual([...sameSuitCards, sameSuitTopCard]);
        });
        it("should not have 4 card flush from top card and three cards in hand", () =>{
            const scores = getScores([aceClubs, twoClubs, threeClubs, aceHearts],fourClubs,false);
            expect(scores.flush).toBeUndefined();
        })
    });

    describe("of a kind", () => {
        it("should find a single pair", () => {
            const scores = getScores([aceClubs, aceDiamonds,fiveClubs,fourClubs],twoDiamonds,true);
            expect(scores.threes).toBeUndefined();
            expect(scores.fours).toBeUndefined();
            expect(scores.pairs).toEqual([[aceClubs, aceDiamonds]]);
        });
        it("should find two pairs", () => {
            const scores = getScores([aceClubs, aceDiamonds,twoClubs,fourClubs],twoDiamonds,true);
            expect(scores.threes).toBeUndefined();
            expect(scores.fours).toBeUndefined();
            expect(scores.pairs).toEqual([[aceClubs, aceDiamonds],[twoClubs, twoDiamonds]]);
        });
        it("should find three of a kind", () => {
            const scores = getScores([aceClubs, aceDiamonds,fiveClubs,fourClubs],aceHearts,true);
            expect(scores.threes).toEqual([aceClubs, aceDiamonds, aceHearts])
            expect(scores.fours).toBeUndefined();
            expect(scores.pairs).toBeUndefined();
        });
        it("should find four of a kind", () => {
            const scores = getScores([aceClubs, aceDiamonds,aceSpades,fourClubs],aceHearts,true);
            expect(scores.fours).toEqual([aceClubs, aceDiamonds, aceSpades,aceHearts])
            expect(scores.threes).toBeUndefined();
            expect(scores.pairs).toBeUndefined();
        })
    });

    describe("one for his knob", () => {
        it("should find one for his knob if has a Jack with the same suit as the cut", () => {
            const scores = getScores([jackSpades, jackDiamonds,aceClubs,twoClubs],twoDiamonds,true);
            expect(scores.oneForHisKnob).toBe(jackDiamonds);
        });

        it("should not find one for his knob if has a Jack with different suit as the cut", () => {
            const scores = getScores([jackSpades, jackDiamonds,aceClubs,twoClubs],twoClubs,true);
            expect(scores.oneForHisKnob).toBeUndefined();
        });
    });

    xdescribe("fifteen twos", () => {
        it("should find a fifteen two - two cards", () => {
            const scores = getScores([tenSpades,aceClubs,twoClubs,aceHearts],fiveClubs,true);
            expect(scores.fifteenTwos).toEqual([[tenSpades,fiveClubs]]);
        });

        it("should find a fifteen two - Jack is ten", () => {
            const scores = getScores([jackSpades,aceClubs,twoClubs,aceHearts],fiveClubs,true);
            expect(scores.fifteenTwos).toEqual([[jackSpades,fiveClubs]]);
        });

        it("should find a fifteen two - Queen is ten", () => {
            const scores = getScores([queenSpades,aceClubs,twoClubs,aceHearts],fiveClubs,true);
            expect(scores.fifteenTwos).toEqual([[queenSpades,fiveClubs]]);
        });

        it("should find a fifteen two - King is ten", () => {
            const scores = getScores([kingSpades,aceClubs,twoClubs,aceHearts],fiveClubs,true);
            expect(scores.fifteenTwos).toEqual([[kingSpades,fiveClubs]]);
        });

        it("should find a fifteen two - three cards", () => {

        });

        it("should find a fifteen two - four cards", () => {

        });

        it("should find a fifteen two - five cards", () => {

        });
    })

    xdescribe("runs", () => {
        it("should find run of 5", () => {
            const scores = getScores([kingSpades,nineSpades,tenSpades,jackSpades],queenSpades,true);
            // need to change the tests so is not dependent upon array order
            expect(scores.runs).toEqual([]);
        });

        it("should find single run of 4", () => {
            const scores = getScores([queenSpades,nineSpades,tenSpades,jackSpades],twoClubs,true);
            // need to change the tests so is not dependent upon array order
            expect(scores.runs).toEqual([]);
        });

        it("should find two runs of 4", () => {
            const scores = getScores([queenSpades,nineSpades,tenSpades,jackSpades],jackDiamonds,true);
            expect(scores.runs).toEqual([]);
        });

        it("should find single run of 3", () => {
            const scores = getScores([twoClubs,nineSpades,tenSpades,jackSpades],aceClubs,true);
            expect(scores.runs).toEqual([]);
        });

        it("should find two runs of 3", () => {
            const scores = getScores([twoClubs,nineSpades,tenSpades,jackSpades],jackDiamonds,true);
            // need to change the tests so is not dependent upon array order
            // how to create own expectation 
            expect(scores.runs).toEqual([
                [nineSpades, tenSpades, jackSpades],
                [nineSpades, tenSpades, jackDiamonds]
            ]);
        });

        it("should find three runs of 3", () => {
            const scores = getScores([jackClubs,nineSpades,tenSpades,jackSpades],jackDiamonds,true);
            expect(scores.runs).toEqual([
                [nineSpades, tenSpades, jackSpades],
                [nineSpades, tenSpades, jackDiamonds],
                [nineSpades, tenSpades, jackClubs],
            ]);
        });

        it("should find four runs of 3", () => {
            const scores = getScores([jackClubs,nineSpades,tenSpades,jackSpades],nineDiamonds,true);
            expect(scores.runs).toEqual([
                [nineSpades, tenSpades, jackSpades],
                [nineSpades, tenSpades, jackClubs],
                [nineDiamonds, tenSpades, jackSpades],
                [nineDiamonds, tenSpades, jackClubs],
            ]);
        });
        
    })
})