enum Suit {Hearts , Clubs , Diamonds, Spades}
enum Pips { Ace, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King }
interface Card {
  suit : Suit,
  pips : Pips 
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
    pairs : [Card, Card ][],
    threes : ThreeCards | undefined, 
    fours : FourCards | undefined ,
    // nob 
    runs : Cards [],
    flush : Flush | undefined 
}
type ScoreCards  = [Card, Card,Card, Card,Card]
export function getScores(Cards:ScoreCards,topCard:Card,isBox : boolean ) : Scores {
 const scores:Scores = {
  pairs:[],
  flush:undefined,
  fours:undefined,
  threes:undefined,
  runs:[]
 };
 const [flushCards,isFullFlush] = getFlush(scoreCards,topCard,isBox);
 if(flushCards){
  scores.flush = flushCards;
  if(isFullFlush){
    // no need to check of kind
  }
 }
 return scores;
}

function sortCards(cards:Card[]){
  
}

function getFlush(scoreCards:ScoreCards,topCard:Card,isBox:boolean):[Flush|undefined, isFullFlush ]{
  let suit:Suit | undefined;
  let scoreCardsFlush = true;
  for(const scoreCard of scoreCards){
    if(suit === undefined){
      suit = scoreCard.suit
    }else if(suit !== scoreCard.suit){
      scoreCardsFlush = false;
      break;
    }
  }
  if(!scoreCardsFlush){
    return [undefined,false];
  }
  if(isBox){
    if(topCard.suit === suit){
      return [[...scoreCards,topCard],true]
    }
    return [undefined,false];
  }

  if(topCard.suit === suit){
    return [[...scoreCards,topCard], true]
  }
  return [scoreCards,false];


}