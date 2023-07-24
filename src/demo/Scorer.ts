import { permute } from "../utilities/permute";

export enum Suit {
  Hearts,
  Clubs,
  Diamonds,
  Spades,
}
export enum Pips {
  Ace,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King,
}
export interface Card {
  suit: Suit;
  pips: Pips;
  value: number;
}

export function cardFromJson(cardJson: string): Card {
  // expecting AH etc
  const pipsChar = cardJson.charAt(0);
  const pips = getPips(pipsChar);
  const suitChar = cardJson.charAt(1);
  const suit = getSuit(suitChar);

  return {
    pips,
    suit,
    value: getPipsValue(pips),
  };
}

const pipsMap = new Map<string, Pips>([
  ["A", Pips.Ace],
  ["K", Pips.King],
  ["Q", Pips.Queen],
  ["J", Pips.Jack],
  ["T", Pips.Ten],
]);
function getPips(pipsChar: string): Pips {
  const pips = pipsMap.get(pipsChar);
  if (pips === undefined) {
    return Number.parseInt(pipsChar) - 1;
  }
  return pips;
}

function getSuit(suitChar: string) {
  switch (suitChar) {
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
type FiveCards = [Card, Card, Card, Card, Card];
type FourCards = readonly [Card, Card, Card, Card];
type ThreeCards = [Card, Card, Card];
export type Cards = Card[];
type Flush = FourCards | FiveCards;
//type Runs = FiveCards | FourCards | [FourCards, FourCards ]
interface Scores {
  pairs: Pair[] | undefined;
  threes: ThreeCards | undefined;
  fours: FourCards | undefined;
  oneForHisKnob: Card | undefined;
  runs: Cards[];
  flush: Flush | undefined;
  fifteenTwos: Cards[] | undefined;
}
type ScoreCards = FourCards;
export function sortCards(cards: Card[]) {
  return cards.sort((a, b) => {
    return a.pips - b.pips;
  });
}
class OrderedGroupedCards {
  private map = new Map<Pips, Card[]>();
  sortedCards: Cards;
  constructor(cards: Card[]) {
    this.sortedCards = sortCards(cards);
    this.sortedCards.forEach((card) => {
      let ofAKind = this.map.get(card.pips);
      if (ofAKind === undefined) {
        ofAKind = [];
        this.map.set(card.pips, ofAKind);
      }
      ofAKind.push(card);
    });
  }

  forEach(callback: (cards: Cards) => void) {
    this.map.forEach((ofAKind) => {
      callback(ofAKind);
    });
  }
}

export function getScores(
  cards: ScoreCards,
  topCard: Card,
  isBox: boolean
): Scores {
  const scores: Scores = {
    pairs: undefined,
    flush: undefined,
    fours: undefined,
    threes: undefined,
    oneForHisKnob: undefined,
    fifteenTwos: undefined,
    runs: [],
  };
  let checkOfAKind = true;
  const [flushCards, isFullFlush] = getFlush(cards, topCard, isBox);
  if (flushCards) {
    scores.flush = flushCards;
    checkOfAKind = !isFullFlush;
  }
  const orderedGroupedCards = new OrderedGroupedCards([...cards, topCard]);
  const orderedCards: FiveCards = orderedGroupedCards.sortedCards as FiveCards;
  if (checkOfAKind) {
    ofAKind(orderedGroupedCards, scores);
  }
  oneForHisKnob(cards, topCard, scores);
  fifteenTwos(orderedCards, scores);
  runs(orderedCards, scores);
  return scores;
}

function oneForHisKnob(
  cards: ScoreCards,
  topCard: Card,
  scores: Pick<Scores, "oneForHisKnob">
) {
  for (const card of cards) {
    if (card.pips === Pips.Jack && card.suit === topCard.suit) {
      scores.oneForHisKnob = card;
      return;
    }
  }
}

function fifteenTwos(cards: FiveCards, scores: Pick<Scores, "fifteenTwos">) {
  const fifteenTwos: Cards[] = [];
  if (sumsToFifteen(cards)) {
    scores.fifteenTwos = [cards];
    return;
  }
  const permutations = [
    ...permute(cards, 4),
    ...permute(cards, 3),
    ...permute(cards, 2),
  ];
  permutations.forEach((testCards) => {
    if (sumsToFifteen(testCards)) {
      fifteenTwos.push(testCards);
    }
  });
  if (fifteenTwos.length > 0) {
    scores.fifteenTwos = fifteenTwos;
  }
}

function sumsToFifteen(cards: Cards) {
  let sum = 0;
  for (const card of cards) {
    sum += card.value;
  }
  return sum === 15;
}

function runs(cards: FiveCards, scores: Pick<Scores, "runs">) {
  const runs: Cards[] = [];
  if (isRun(cards)) {
    runs.push(cards);
    scores.runs = runs;
    return;
  }

  const fourCardPermutations = permute(cards, 4);
  fourCardPermutations.forEach((fourCards) => {
    if (isRun(fourCards)) {
      runs.push(fourCards);
    }
  });

  if (runs.length > 0) {
    scores.runs = runs;
    return;
  }

  const threeCardPermutations = permute(cards, 3);
  threeCardPermutations.forEach((threeCards) => {
    if (isRun(threeCards)) {
      runs.push(threeCards);
    }
  });

  if (runs.length > 0) {
    scores.runs = runs;
  }
}

function isRun(sortedCards: Cards) {
  let cardsAreRun = true;
  let lastCardPips = sortedCards[0].pips;
  for (let i = 1; i < sortedCards.length; i++) {
    const nextCardPips = sortedCards[i].pips;
    if (nextCardPips - lastCardPips !== 1) {
      cardsAreRun = false;
      break;
    }
    lastCardPips = nextCardPips;
  }
  return cardsAreRun;
}

function getPipsValue(pips: Pips) {
  switch (pips) {
    case Pips.Ten:
    case Pips.Jack:
    case Pips.Queen:
    case Pips.King:
      return 10;
    default:
      return pips + 1;
  }
}

function ofAKind(
  orderedGroupedCards: OrderedGroupedCards,
  scores: Pick<Scores, "pairs" | "threes" | "fours">
) {
  const pairs: Pair[] = [];
  // can you break ?
  orderedGroupedCards.forEach((cards) => {
    switch (cards.length) {
      case 4:
        scores.fours = cards as unknown as FourCards;
        break;
      case 3:
        scores.threes = cards as unknown as ThreeCards;
        break;
      case 2:
        pairs.push(cards as unknown as Pair);
        break;
    }
  });
  if (pairs.length > 0) {
    scores.pairs = pairs;
  }
}

function getFlushSuit(scoreCards: ScoreCards): Suit | undefined {
  let suit: Suit | undefined;
  for (const scoreCard of scoreCards) {
    if (suit === undefined) {
      suit = scoreCard.suit;
    } else if (suit !== scoreCard.suit) {
      return undefined;
    }
  }
  return suit;
}

function getFlush(
  scoreCards: ScoreCards,
  topCard: Card,
  isBox: boolean
): [Flush | undefined, boolean] {
  const suit = getFlushSuit(scoreCards);
  if (suit === undefined) {
    return [undefined, false];
  }
  if (isBox) {
    if (topCard.suit === suit) {
      return [[...scoreCards, topCard], true];
    }
    return [undefined, false];
  }

  if (topCard.suit === suit) {
    return [[...scoreCards, topCard], true];
  }
  return [scoreCards, false];
}
