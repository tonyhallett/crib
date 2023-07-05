import {
  Box,
  Deck,
  DiscardPositions,
  PlayerPositions,
  Positions,
} from "./matchLayoutManager";
import { getDealerPositions } from "./getDealerPositions";
import { FlipCardData, UpdateLocalMatch } from "./PlayMatch";
import { getNonPlayerCardDatas } from "./getNonPlayerCardDatas";
import { MyMatch } from "../generatedTypes";
import {
  getDiscardToBoxSegment,
  getMoveRotateSegment,
} from "./animationSegments";
import { FlipAnimation, FlipCardAnimationSequence } from "../FlipCard/FlipCard";
import { arrayOfEmptyArrays } from "../utilities/arrayHelpers";
import {
  AnimationCompletionRegistration,
  FlipCardDatasWithCompletionRegistration,
} from "./AnimationManager";
import { LocalMatch } from "../LocalMatch";
import { DOMKeyframesDefinition } from "framer-motion";
import { OnComplete } from "../fixAnimationSequence/common-motion-types";

interface DealPosition {
  playerPositions: PlayerPositions;
  originalPosition: number;
}

function getNextIndex(currentIndex: number, numPlayers: number): number {
  return currentIndex === numPlayers - 1 ? 0 : currentIndex + 1;
}

function getDealPositions(
  playerPositions: PlayerPositions[],
  nextPlayerId: string,
  playerIds: string[]
): DealPosition[] {
  const numPlayers = playerPositions.length;
  const firstToDealToIndex = playerIds.findIndex((pid) => pid == nextPlayerId);
  let nextIndex = getNextIndex(firstToDealToIndex, numPlayers);
  const dealPositions: DealPosition[] = [
    {
      originalPosition: firstToDealToIndex,
      playerPositions: playerPositions[firstToDealToIndex],
    },
  ];
  while (dealPositions.length != playerPositions.length) {
    dealPositions.push({
      originalPosition: nextIndex,
      playerPositions: playerPositions[nextIndex],
    });
    nextIndex = getNextIndex(nextIndex, numPlayers);
  }

  return dealPositions;
}

type AnimatedFlipCardData = FlipCardData & {
  animationSequence: FlipCardAnimationSequence;
};

function getDealtPlayerCard(
  discardPositions: DiscardPositions,
  cardNumber: number,
  dealNumber: number,
  isMyCard: boolean,
  dealDuration: number,
  flipDuration: number,
  deck: Deck,
  totalDealtCards: number,
  onComplete: OnComplete | undefined
): AnimatedFlipCardData {
  // earlier that dealt the higher the z-index
  // and need the deck z-index to always be greater than any of the hand indices
  const deckZIndex = 100 + (totalDealtCards - dealNumber);

  const handZIndex = 4; // more than the box for discards

  const animationSequence: FlipCardAnimationSequence = [
    getMoveRotateSegment(
      discardPositions.isHorizontal,
      discardPositions.positions[cardNumber],
      dealDuration,
      undefined,
      dealNumber * dealDuration
    ),
    [
      undefined,
      {
        zIndex: handZIndex, //more than the box card
      } as DOMKeyframesDefinition,
      {
        at: dealNumber * dealDuration + dealDuration,
        duration: 0.00001,
        onComplete: isMyCard ? undefined : onComplete,
      },
    ],
  ];
  if (isMyCard) {
    const flipAnimation: FlipAnimation = {
      duration: flipDuration,
      flip: true,
      onComplete: isMyCard ? onComplete : undefined,
    };
    animationSequence.push(flipAnimation);
  }
  return {
    startFaceUp: false,
    isHorizontal: deck.isHorizontal,
    position: deck.position,
    zIndex: deckZIndex,
    animationSequence,
  };
}

function dealPossibleAdditionalBoxCard(
  additionalBoxCard: FlipCardData | undefined,
  boxPosition: Box,
  dealDuration: number,
  dealPlayersDuration: number
) {
  if (additionalBoxCard) {
    // is in the deck position
    additionalBoxCard.zIndex = 3; // above the cut card which has zIndex: 2
    additionalBoxCard.animationSequence = [
      getDiscardToBoxSegment(boxPosition, dealDuration, dealPlayersDuration),
    ];
  }
}

type MyCardsOtherPlayersCards = [FlipCardData[], FlipCardData[][]];

function initializeCards(numOtherPlayers: number): MyCardsOtherPlayersCards {
  const myCards: FlipCardData[] = [];
  const otherPlayersCards = arrayOfEmptyArrays<FlipCardData>(numOtherPlayers);
  return [myCards, otherPlayersCards];
}

interface PlayerDealPositions {
  playerPositions: PlayerPositions[];
  boxPosition: Box;
  deck: Deck;
}

interface DealFlipDiscardDurations {
  dealDuration: number;
  flipDuration: number;
  discardDuration: number;
}

interface PlayerDealAnimationParameters extends DealFlipDiscardDurations {
  discardDelay: number;
}

function getNumberOfDiscards(match: MyMatch, discardCount: number) {
  return match.otherPlayers.filter((op) => op.discarded).length * discardCount;
}

const createCompletionCallbacks = (
  localMatch: LocalMatch,
  updateLocalMatch: UpdateLocalMatch,
  numberOfDiscards: number
) => {
  let animationCompleteCallback: () => void | undefined;
  const registration = (callback: () => void) => {
    animationCompleteCallback = callback;
  };

  const lastDealtCompleteCallback: OnComplete = () => {
    localMatch.changeHistory.numberOfActions = 0;
    updateLocalMatch(localMatch);

    if (numberOfDiscards === 0) {
      animationCompleteCallback && animationCompleteCallback();
    }
  };

  const lastDiscardCompleteCallback: OnComplete = () => {
    localMatch.changeHistory.numberOfActions = numberOfDiscards;
    updateLocalMatch(localMatch);
    animationCompleteCallback && animationCompleteCallback();
  };

  return {
    registration,
    lastDiscardCompleteCallback,
    lastDealtCompleteCallback,
  };
};

function addDiscardAnimation(
  dealtCard: AnimatedFlipCardData,
  box: Box,
  discardDuration: number,
  discardAt: number,
  lastDiscard: boolean,
  lastDiscardOnComplete: OnComplete
) {
  dealtCard.animationSequence.push(
    getDiscardToBoxSegment(
      box,
      discardDuration,
      undefined,
      discardAt,
      lastDiscard ? lastDiscardOnComplete : undefined
    )
  );
}

function isOtherPlayerDiscarded(
  match: MyMatch,
  otherPlayerPosition: number,
  isMe: boolean
) {
  if (isMe) return false;
  return match.otherPlayers[otherPlayerPosition].discarded;
}

function doDealPlayerCardsAndPossiblyDiscard(
  match: MyMatch,
  localMatch: LocalMatch,
  dealPositions: DealPosition[],
  playerDealAnimationParameters: PlayerDealAnimationParameters,
  playerDealPositions: PlayerDealPositions,
  myCards: FlipCardData[],
  otherPlayersCards: FlipCardData[][],
  updateLocalMatch: UpdateLocalMatch
): AnimationCompletionRegistration {
  const numPlayers = otherPlayersCards.length + 1;
  const dealDiscardNumbers = getPlayerCardDealDiscardNumbers(numPlayers);

  let discardCount = 0;
  const numberOfDiscards = getNumberOfDiscards(
    match,
    dealDiscardNumbers.discard
  );
  const completionCallbacks = createCompletionCallbacks(
    localMatch,
    updateLocalMatch,
    numberOfDiscards
  );

  // eslint-disable-next-line complexity
  dealPositions.forEach((dealPosition, dealPositionIndex) => {
    const isMe = dealPosition.originalPosition === 0;
    const discardPositions = dealPosition.playerPositions.discard;
    const otherPlayerPosition = dealPosition.originalPosition - 1;
    const otherPlayerDiscarded = isOtherPlayerDiscarded(
      match,
      otherPlayerPosition,
      isMe
    );
    for (let i = 0; i < dealDiscardNumbers.deal; i++) {
      const dealNumber = dealPositionIndex + i * numPlayers;
      const isLastDealtCard =
        dealPositionIndex === dealPositions.length - 1 &&
        i === dealDiscardNumbers.deal - 1;
      const dealtCard = getDealtPlayerCard(
        discardPositions,
        i,
        dealNumber,
        isMe,
        playerDealAnimationParameters.dealDuration,
        playerDealAnimationParameters.flipDuration,
        playerDealPositions.deck,
        dealDiscardNumbers.deal * numPlayers,
        isLastDealtCard
          ? completionCallbacks.lastDealtCompleteCallback
          : undefined
      );

      if (isMe) {
        dealtCard.playingCard = match.myCards[i];
        myCards.push(dealtCard);
      } else {
        if (otherPlayerDiscarded && i < dealDiscardNumbers.discard) {
          addDiscardAnimation(
            dealtCard,
            playerDealPositions.boxPosition,
            playerDealAnimationParameters.discardDuration,
            playerDealAnimationParameters.discardDelay +
              discardCount * playerDealAnimationParameters.discardDuration,
            discardCount === numberOfDiscards - 1,
            completionCallbacks.lastDiscardCompleteCallback
          );

          discardCount++;
        }

        otherPlayersCards[otherPlayerPosition].push(dealtCard);
      }
    }
  });
  return completionCallbacks.registration;
}

function dealPlayerCardsAndPossiblyDiscard(
  match: MyMatch,
  localMatch: LocalMatch,
  playerDealPositions: PlayerDealPositions,
  playerDealAnimationParameters: PlayerDealAnimationParameters,
  updateLocalMatch: UpdateLocalMatch
): [MyCardsOtherPlayersCards, AnimationCompletionRegistration] {
  const dealPositions = getDealPositions(
    playerDealPositions.playerPositions,
    match.pegging.nextPlayer,
    [match.myId, ...match.otherPlayers.map((op) => op.id)]
  );
  const [myCards, otherPlayersCards] = initializeCards(
    match.otherPlayers.length
  );

  const animationCompletionRegistration = doDealPlayerCardsAndPossiblyDiscard(
    match,
    localMatch,
    dealPositions,
    playerDealAnimationParameters,
    playerDealPositions,
    myCards,
    otherPlayersCards,
    updateLocalMatch
  );

  return [[myCards, otherPlayersCards], animationCompletionRegistration];
}

function getNumPlayerCardsToDeal(numPlayers: number): number;
function getNumPlayerCardsToDeal(match: MyMatch): number;
function getNumPlayerCardsToDeal(arg: MyMatch | number): number {
  const numPlayers =
    typeof arg === "number" ? arg : arg.otherPlayers.length + 1;
  return numPlayers === 2 ? 6 : 5;
}

function getNumPlayerCardsToDiscard(numPlayers: number): number {
  return getNumPlayerCardsToDeal(numPlayers) - 4;
}

function getNumCardsToDeal(match: MyMatch) {
  const numPlayers = match.otherPlayers.length + 1;
  return getNumPlayerCardsToDeal(match) * numPlayers;
}

function getPlayerCardDealDiscardNumbers(numPlayers: number): {
  deal: number;
  discard: number;
} {
  const numCardsToDeal = getNumPlayerCardsToDeal(numPlayers);
  const numCardsToDiscard = getNumPlayerCardsToDiscard(numPlayers);
  return { deal: numCardsToDeal, discard: numCardsToDiscard };
}

export function dealThenDiscardIfRequired(
  match: MyMatch,
  localMatch: LocalMatch,
  positions: Positions,
  updateLocalMatch: UpdateLocalMatch,
  dealFlipDurations: DealFlipDiscardDurations
): FlipCardDatasWithCompletionRegistration {
  const playerPositions = positions.playerPositions;
  const numCardsToDeal = getNumCardsToDeal(match);
  // for cut card and box
  const dealerPositions = getDealerPositions(
    match.myId,
    match.dealerDetails.current,
    playerPositions,
    match.otherPlayers.map((op) => op.id)
  );
  const boxPosition = dealerPositions.box;
  const nonPlayerCardDatas = getNonPlayerCardDatas(
    boxPosition,
    dealerPositions.deck,
    undefined,
    match.otherPlayers.length + 1
  );
  const dealPlayersDuration = numCardsToDeal * dealFlipDurations.dealDuration;
  const additionalBoxCard = nonPlayerCardDatas.additionalBoxCard; //  zIndex: 1,
  dealPossibleAdditionalBoxCard(
    additionalBoxCard,
    boxPosition,
    dealFlipDurations.dealDuration,
    dealPlayersDuration
  );
  const fullDealDuration = additionalBoxCard
    ? dealPlayersDuration + dealFlipDurations.dealDuration
    : dealPlayersDuration;

  const [[myCards, otherPlayersCards], animationCompletionRegistration] =
    dealPlayerCardsAndPossiblyDiscard(
      match,
      localMatch,
      {
        playerPositions,
        boxPosition,
        deck: dealerPositions.deck,
      },
      {
        ...dealFlipDurations,
        discardDelay: fullDealDuration,
      },
      updateLocalMatch
    );

  return [
    {
      bottomDeckCard: nonPlayerCardDatas.bottomDeckCard, // has zIndex 0
      additionalBoxCard,
      cutCard: nonPlayerCardDatas.cutCard,
      myCards,
      otherPlayersCards,
    },
    animationCompletionRegistration,
  ];
}
