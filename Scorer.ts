enum Suit {Hearts , Clubs , Diamonds, Spades}
enum Pips { Ace, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King }
interface Card {
  suit : Suit,
  pipss : Pips 
}

enum ScoreType { Pair, Three,Four, Flush, Run }
interface Score{
    type : ScoreType
   cards  : Card []
}
type FiveCards = [Card, Card, Card, Card, Card ]
type FourCards = [Card, Card, Card, Card ]
type ThreeCards = [Card, Card, Card ]
type Cards = Card[]
type Flush = FourCards | FiveCards 
//type Runs = FiveCards | FourCards | [FourCards, FourCards ] 
interface Scores {
    pairs : [Card, Card ][]
    threes : ThreeCards | undefined 
    fours : [FourCards | undefined ,
    // nob 
    runs : Cards [],
    flush : Flush | undefined 
}
type ScoreCards  = [Card, Card,Card, Card,Card]
function getScores(Cards:ScoreCards,topCard:Card,isBox : boolean ) : Score[] {
 const scores:Score[] = [];

}

function getFlush(isBox:boolean):[Flush|undefined, isFullFlush ]{

}