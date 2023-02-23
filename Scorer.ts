export enum Suit {Hearts , Clubs , Diamonds, Spades}
export enum Pips { Ace, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King }
export interface Card {
  suit : Suit,
  pips : Pips,
  value : number 
}

export function cardFromJson(cardJson:string):Card{
  // expecting AH etc
  const pipsChar = cardJson.charAt(0);
  const pips = getPips(pipsChar);
  const suitChar = cardJson.charAt(1);
  const suit = getSuit(suitChar);

  return {
    pips,
    suit,
    value:getPipsValue(pips)
  }
}

function getPips(pipsChar:string):Pips{
  switch(pipsChar){
    case "A":
      return Pips.Ace;
    case "K":
      return Pips.King;
    case "Q":
      return Pips.Queen;
    case "J":
      return Pips.Jack;
    case "T":
      return Pips.Ten
    default:
      return Number.parseInt(pipsChar) - 1
  }
}

function getSuit(suitChar:string){
  switch(suitChar){
    case "H":
      return Suit.Hearts;
    case "C":
      return Suit.Clubs;
    case "D":
      return Suit.Diamonds;
    case "S":
      return Suit.Spades;
    default:
      throw new Error(`${suitChar} is not a suit.  Should be H, C, D or S.`);
  }
}


type Pair = [Card, Card];
type FiveCards = [Card, Card, Card, Card, Card ]
type FourCards = readonly [Card, Card, Card, Card ]
type ThreeCards = [Card, Card, Card ]
type Cards = Card[]
type Flush = FourCards | FiveCards 
//type Runs = FiveCards | FourCards | [FourCards, FourCards ] 
interface Scores {
    pairs : Pair[] | undefined,
    threes : ThreeCards | undefined, 
    fours : FourCards | undefined ,
    oneForHisKnob : Card | undefined,
    runs : Cards [],
    flush : Flush | undefined,
    fifteenTwos:Cards[] | undefined;
}
type ScoreCards  = FourCards;
export function sortCards(cards:Card[]){
  return cards.sort((a,b) => {
    return a.pips - b.pips;
  })
}
class OrderedGroupedCards{
  private map  = new Map<Pips,Card[]>();
  constructor(cards:Card[]){
    const sortedCards = sortCards(cards);
    sortedCards.forEach(card => {
      let ofAKind = this.map.get(card.pips);
      if(ofAKind === undefined){
        ofAKind = [];
        this.map.set(card.pips,ofAKind);
      };
      ofAKind.push(card);
    })
  }

  forEach(callback:(cards:Cards) => void){
    this.map.forEach((ofAKind) => {
      callback(ofAKind);
    })
  }

}

export function getScores(cards:ScoreCards,topCard:Card,isBox : boolean ) : Scores {
 const scores:Scores = {
  pairs:undefined,
  flush:undefined,
  fours:undefined,
  threes:undefined,
  oneForHisKnob:undefined,
  fifteenTwos:undefined,
  runs:[]
 };
 let checkOfAKind = true;
 const [flushCards,isFullFlush] = getFlush(cards,topCard,isBox);
 if(flushCards){
  scores.flush = flushCards;
  checkOfAKind = !isFullFlush;
 }
 const orderedGroupedCards = new OrderedGroupedCards([...cards, topCard]);
 if(checkOfAKind){
  ofAKind(orderedGroupedCards, scores);
 }
 oneForHisKnob(cards, topCard,scores);
 fifteenTwos(orderedGroupedCards, scores);
 runs(orderedGroupedCards, scores);
 return scores;
}

function oneForHisKnob(cards:ScoreCards,topCard:Card, scores:Pick<Scores,"oneForHisKnob">){
  for(const card of cards){
    if(card.pips === Pips.Jack && card.suit === topCard.suit){
      scores.oneForHisKnob = card;
      return;
    }
  }
}

function fifteenTwos(orderedGroupedCards:OrderedGroupedCards,scores:Pick<Scores,"fifteenTwos">){
  const fifteenTwos:Cards[] = [];
}

function runs(orderedGroupedCards:OrderedGroupedCards,scores:Pick<Scores,"runs">){
  let done = false;
  let pippedCards:Cards[] = [];
  let lastPips:Pips | undefined;
  orderedGroupedCards.forEach(cards => {
    if(!done){
      const pips = cards[0].pips;
      if(lastPips === undefined){
        lastPips = pips;
        pippedCards.push(cards);
      }else{
        const nextInRun = pips - lastPips === 1;
        
        if(!nextInRun){
          pippedCards = [];
          if(pippedCards.length > 2) {
            done = true;
          }
        }
        if(!done){
          pippedCards.push(cards);
        }
      }
      lastPips = pips;
    }
  });
  if(pippedCards.length > 2){
    const runCards:Cards[] = [];
    pippedCards.forEach((cards,index) => {
      cards.forEach(card => {

      })
    });
    scores.runs = runCards;
  }
}

function getPipsValue(pips:Pips){
  switch(pips){
    case Pips.Ten:
    case Pips.Jack:
    case Pips.Queen:
    case Pips.King:
      return 10;
    default:
      return pips + 1;
  }
}

function ofAKind(orderedGroupedCards:OrderedGroupedCards,scores:Pick<Scores,"pairs" |"threes"| "fours">){
  const pairs:Pair[] = [];
  // can you break ?
  orderedGroupedCards.forEach(cards => {
    switch(cards.length){
      case 4:
        scores.fours = cards as unknown as FourCards;
        break;
      case 3:
        scores.threes = cards as unknown as ThreeCards;
        break;
      case 2:
        pairs.push(cards as unknown as Pair)
        break;
    }
  });
  if(pairs.length > 0){
    scores.pairs = pairs;
  }
}





function getFlush(scoreCards:ScoreCards,topCard:Card,isBox:boolean):[Flush|undefined, boolean ]{
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