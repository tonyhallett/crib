import { MyMatch, PeggedCard, PlayingCard } from "../../generatedTypes";
import {
  DeckPosition,
  DiscardPositions,
  PlayerPositions,
  Point,
} from "../layout/matchLayoutManager";
import { CardsAndOwner, CardsAndOwners } from "../getCardsWithOwners";
import { Duration, FlipCardData, FlipCardState } from "../PlayMatchTypes";
import { cardMatch } from "../playingCardUtilities";
import {
  FlipAnimation,
  FlipCardAnimationSequence,
} from "../../FlipCard/FlipCard";
import {
  createHideShowSegment,
  createZIndexAnimationSegment,
  getMoveRotateSegment,
  instantAnimationDuration,
  moveCardsToDeckWithoutFlipping,
  setOrAddToAnimationSequence,
} from "./animationSegments";
import { getPlayerPositions } from "../getPlayerPositions";

function flipStack(cards: FlipCardData[], flipDuration: number): Duration {
  cards.forEach((card, index) => {
    const isTop = index === cards.length - 1;
    const flipAnimation: FlipAnimation = {
      duration: flipDuration,
      flip: true,
    };
    const animationSequence: FlipCardAnimationSequence = [
      createHideShowSegment(!isTop),
      // need a pause
      flipAnimation,
    ];
    setOrAddToAnimationSequence(card, animationSequence);
  });
  return flipDuration + instantAnimationDuration;
}

function slideOver(
  cards: FlipCardData[],
  handPositions: DiscardPositions,
  at: number,
  duration: number
): Duration {
  let slideOverDuration = 0;
  if (cards.length > 1) {
    cards.forEach((card) => {
      setOrAddToAnimationSequence(card, [
        getMoveRotateSegment(
          handPositions.isHorizontal,
          handPositions.positions[0],
          duration,
          undefined,
          at
        ),
      ]);
    });
    slideOverDuration = duration;
  }
  return slideOverDuration;
}

function getCardsInHand(cards: FlipCardData[]) {
  return cards.filter(
    (card) =>
      card.state === FlipCardState.MyHand ||
      card.state === FlipCardState.OtherPlayersHand
  );
}

function showAllCards(cards: FlipCardData[]): Duration {
  cards.forEach((card) =>
    setOrAddToAnimationSequence(card, [createHideShowSegment(false)])
  );
  return instantAnimationDuration;
}

function movePlayerCardsToDeck(
  cardsAndOwners: CardsAndOwner[],
  currentTopOfDeckZindex: number,
  deckPosition: DeckPosition,
  at: number,
  flipDuration: number,
  moveToDeckDuration: number,
  moveToFirstDuration: number,
  myMatch: MyMatch,
  playerPositions: PlayerPositions[]
): Duration {
  let duration = 0;
  const incrementedDuration = (increment: number) => {
    duration += increment;
    at += increment;
  };
  cardsAndOwners.forEach((cardsAndOwner) => {
    const handPosition = getPlayerPositions(
      myMatch.myId,
      cardsAndOwner.owner,
      playerPositions,
      myMatch.otherPlayers
    ).discard;
    const isMe = cardsAndOwner.owner === myMatch.myId;
    const cards = getCardsInHand(cardsAndOwner.cards);

    const slideOverDuration = slideOver(
      cards,
      handPosition,
      at,
      moveToFirstDuration
    );
    incrementedDuration(slideOverDuration);

    if (isMe) {
      const flipStackDuration = flipStack(cards, flipDuration);
      incrementedDuration(flipStackDuration);
    }

    const moveCardsToDeckDuration = moveCardsToDeckWithoutFlipping(
      cards,
      currentTopOfDeckZindex++,
      deckPosition,
      undefined,
      moveToDeckDuration
    );
    incrementedDuration(moveCardsToDeckDuration);

    if (isMe) {
      const showAllCardsDuration = showAllCards(cards);
      incrementedDuration(showAllCardsDuration);
    }
  });
  return duration;
}

function flipAndMoveCardsInPlayToDeck(
  inPlayCards: FlipCardData[],
  flipDuration: number,
  moveOverDuration: number,
  moveToDeckDuration: number,
  zIndex: number,
  deckPosition: DeckPosition,
  firstPeggingPosition: Point,
  at: number
): Duration {
  inPlayCards.forEach((inPlayCard, i) => {
    const isTop = i === inPlayCards.length - 1;
    const flipAnimation: FlipAnimation = {
      duration: flipDuration,
      flip: true,
    };
    const animationSequence: FlipCardAnimationSequence = [
      getMoveRotateSegment(
        false,
        firstPeggingPosition,
        moveOverDuration,
        undefined,
        at
      ),
      createHideShowSegment(!isTop),

      flipAnimation,
      createZIndexAnimationSegment(zIndex, {}),
      getMoveRotateSegment(
        deckPosition.isHorizontal,
        deckPosition.position,
        moveToDeckDuration
      ),
      createHideShowSegment(false),
    ];
    setOrAddToAnimationSequence(inPlayCard, animationSequence);
  });
  return (
    moveOverDuration +
    instantAnimationDuration * 2 +
    flipDuration +
    moveToDeckDuration
  );
}

export function flipCutCard(
  cutCard: FlipCardData,
  flipDuration: number,
  at: number
) {
  const flipAnimation: FlipAnimation = {
    flip: true,
    duration: flipDuration,
    at,
  };
  setOrAddToAnimationSequence(cutCard, [flipAnimation]);
}

function getCardsWithState(
  playerCardsAndOwners: CardsAndOwner[],
  state: FlipCardState
) {
  return playerCardsAndOwners
    .map((playerCards) => playerCards.cards)
    .flat()
    .filter((card) => card.state === state);
}

function getOrderedInPlayCards(
  cardsWithOwners: CardsAndOwners,
  inPlayCards: PeggedCard[]
) {
  const inPlayCardDatas = getCardsWithState(
    cardsWithOwners.playerCards,
    FlipCardState.PeggingInPlay
  );
  inPlayCardDatas.sort((a, b) => {
    const aPlayingCard = a.playingCard as PlayingCard;
    const bPlayingCard = b.playingCard as PlayingCard;
    const aIndex = inPlayCards.findIndex((inPlayCard) =>
      cardMatch(inPlayCard.playingCard, aPlayingCard)
    );
    const bIndex = inPlayCards.findIndex((inPlayCard) =>
      cardMatch(inPlayCard.playingCard, bPlayingCard)
    );
    return aIndex - bIndex;
  });
  return inPlayCardDatas;
}

export function clearUpAfterWon(
  cutCard: FlipCardData,
  cardsWithOwners: CardsAndOwners,
  currentDeckPosition: DeckPosition,
  at: number,
  moveToDeckDuration: number,
  flipDuration: number,
  inPlayCards: PeggedCard[],
  firstPeggingPosition: Point,
  myMatch: MyMatch,
  playerPositions: PlayerPositions[]
) {
  let totalDuration = 0;
  let deckZIndex = 10;

  flipCutCard(cutCard, flipDuration, at);
  totalDuration += flipDuration;
  at += flipDuration;

  const turnedOverCards = getCardsWithState(
    cardsWithOwners.playerCards,
    FlipCardState.PeggingTurnedOver
  );
  if (turnedOverCards.length > 0) {
    
    const moveCardsToDeckDuration =  moveCardsToDeckWithoutFlipping(
      turnedOverCards,
      deckZIndex, // all cards are at this zIndex
      currentDeckPosition,
      at,
      moveToDeckDuration
    );
    totalDuration += moveCardsToDeckDuration;
    at += moveCardsToDeckDuration
  }

  const inPlayCardDatas = getOrderedInPlayCards(cardsWithOwners, inPlayCards);
  if (inPlayCards.length > 0) {
    const moveInPlayToDeckDuration =  flipAndMoveCardsInPlayToDeck(
      inPlayCardDatas,
      flipDuration,
      moveToDeckDuration,
      moveToDeckDuration,
      deckZIndex++, // all cards are at this zIndex
      currentDeckPosition,
      firstPeggingPosition,
      at
    );
    totalDuration += moveInPlayToDeckDuration;
    at += moveInPlayToDeckDuration;
  }

  const movePlayerCardsToDeckDuration =  movePlayerCardsToDeck(
    cardsWithOwners.playerCards,
    deckZIndex, // the current top zIndex - each player has all of their cards at the same zIndex - one more than the previous
    currentDeckPosition,
    at,
    flipDuration,
    moveToDeckDuration,
    moveToDeckDuration,
    myMatch,
    playerPositions
  );
  totalDuration += movePlayerCardsToDeckDuration;
  at += movePlayerCardsToDeckDuration;
  deckZIndex += cardsWithOwners.playerCards.length;

  totalDuration += moveCardsToDeckWithoutFlipping(
    cardsWithOwners.boxCards,
    deckZIndex,
    currentDeckPosition,
    at,
    moveToDeckDuration
  );
  return totalDuration;
}
