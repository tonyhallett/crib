import {getScores, sortCards, getPipsValue, Suit, Pips, Card} from "../Scorer"
describe("scorer", () => {
    const aceClubs:Card = {pips:Pips.Ace,suit:Suit.Clubs};
    const twoClubs:Card = {pips:Pips.Two,suit:Suit.Clubs};
    const threeClubs:Card = {pips:Pips.Three,suit:Suit.Clubs};
    const fourClubs:Card = {pips:Pips.Four,suit:Suit.Clubs};
    const fiveClubs:Card = {pips:Pips.Five,suit:Suit.Clubs};
    const aceHearts:Card = {pips:Pips.Ace,suit:Suit.Hearts};
    const sameSuitCards = [aceClubs, twoClubs, threeClubs, fourClubs] as const;
    const differentSuitTopCard = aceHearts;
    const sameSuitTopCard = fiveClubs;
    const aceSpades:Card = {pips:Pips.Ace,suit:Suit.Spades};
    const aceDiamonds:Card = {pips:Pips.Ace,suit:Suit.Diamonds};
    const twoDiamonds:Card = {pips:Pips.Two,suit:Suit.Diamonds};
    const jackDiamonds:Card = {pips:Pips.Jack,suit:Suit.Diamonds};
    const jackSpades:Card = {pips:Pips.Jack,suit:Suit.Spades};
    const tenSpades:Card = {pips:Pips.Ten,suit:Suit.Spades};
    const queenSpades:Card = {pips:Pips.Queen,suit:Suit.Spades};
    const kingSpades:Card = {pips:Pips.Queen,suit:Suit.Spades};

    describe("sort cards", () => {
        it("should sort lowest to highest pips", () => {
            const sortedCards = sortCards([aceSpades,aceDiamonds, fiveClubs,twoClubs,aceHearts]);
            expect(sortedCards).toEqual([aceSpades, aceDiamonds,aceHearts, twoClubs,fiveClubs]);
        });
    });

    describe("getPipsValue", () => {
        it("should be same as pips up to 10", () => {
            const aceToTenPips:[Pips,number][] = [[Pips.Ace,1], [Pips.Two,2], [Pips.Three,3],[Pips.Four,4], [Pips.Five,5], [Pips.Six,6],[Pips.Seven,7],[Pips.Eight,8], [Pips.Nine,9],[Pips.Ten,10]];
            aceToTenPips.forEach(pipsValue => {
                expect(getPipsValue(pipsValue[0])).toEqual(pipsValue[1]);
            })
        });

        it("should be 10 for Jack, Queen and King", () => {
            [Pips.Jack, Pips.Queen, Pips.King].forEach(pips => expect(getPipsValue(pips)).toEqual(10));
        })
    })

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

    describe("fifteen twos", () => {
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
})