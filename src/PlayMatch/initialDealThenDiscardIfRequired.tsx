import {
  Box,
  Deck,
  DiscardPositions,
  PlayerPositions,
  Positions,
} from "./matchLayoutManager";
import { getPlayerPositions } from "./getPlayerPositions";
import {
  FlipCardData,
  FlipCardDatas,
  FlipCardState,
  UpdateLocalMatch,
} from "./PlayMatchTypes";
import { getNonPlayerCardDatas } from "./getNonPlayerCardDatas";
import { MyMatch } from "../generatedTypes";
import {
  createZIndexAnimationSegment,
  getDiscardToBoxSegment,
  getMoveRotateSegment,
} from "./animationSegments";
import { FlipAnimation, FlipCardAnimationSequence } from "../FlipCard/FlipCard";
import { arrayOfEmptyArrays } from "../utilities/arrayHelpers";
import { LocalMatch } from "../localMatch";
import { OnComplete } from "../fixAnimationSequence/common-motion-types";
import { MatchDetail } from "../App";
import { createDiscardZIndexAnimationSegment } from "./getDiscardToBoxZIndexStartSegment";

interface DealPosition {
  playerPositions: PlayerPositions;
  // in order 0 is me, other players are clockwise
  playerIndex: number;
}

function getNextIndex(currentIndex: number, numPlayers: number): number {
  return currentIndex === numPlayers - 1 ? 0 : currentIndex + 1;
}

// first DealPosition is the player dealt to first, remaining are clockwise
function getDealPositions(
  playerPositions: PlayerPositions[],
  nextPlayerId: string,
  playerIds: string[] // in order 0 is me, other players are clockwise
): DealPosition[] {
  const numPlayers = playerPositions.length;
  const firstToDealToIndex = playerIds.findIndex((pid) => pid == nextPlayerId);
  let nextIndex = getNextIndex(firstToDealToIndex, numPlayers);
  const dealPositions: DealPosition[] = [
    {
      playerIndex: firstToDealToIndex,
      playerPositions: playerPositions[firstToDealToIndex],
    },
  ];
  while (dealPositions.length != playerPositions.length) {
    dealPositions.push({
      playerIndex: nextIndex,
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
  cardIndex: number,
  dealNumber: number, // lower the deal number the earlier dealt and higher z-index
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

  const moveRotateAt = dealNumber * dealDuration;
  const animationSequence: FlipCardAnimationSequence = [
    getMoveRotateSegment(
      discardPositions.isHorizontal,
      discardPositions.positions[cardIndex],
      dealDuration,
      undefined,
      moveRotateAt // at - lower deal number less wait
    ),
    createZIndexAnimationSegment(
      handZIndex, //more than the box card
      {
        at: moveRotateAt + dealDuration,
        onComplete: isMyCard ? undefined : onComplete,
      }
    ),
  ];
  let state: FlipCardState = FlipCardState.Todo;
  if (isMyCard) {
    state = FlipCardState.MyHand;
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
    state,
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
  numberOfDiscards: number,
  numberOfMatchActions: number,
  animationCompleteCallback: () => void
) => {
  const lastDealtCompleteCallback: OnComplete = () => {
    const newLocalMatch: LocalMatch = {
      ...localMatch,
      changeHistory: {
        ...localMatch.changeHistory,
        numberOfActions: numberOfMatchActions - numberOfDiscards,
      },
    };
    updateLocalMatch(newLocalMatch);

    if (numberOfDiscards === 0) {
      animationCompleteCallback && animationCompleteCallback();
    }
  };

  const lastDiscardCompleteCallback: OnComplete = () => {
    const newLocalMatch: LocalMatch = {
      ...localMatch,
      changeHistory: {
        matchCreationDate: localMatch.changeHistory.matchCreationDate,
        numberOfActions: numberOfMatchActions,
        lastChangeDate: new Date(),
      },
    };

    updateLocalMatch(newLocalMatch);
    animationCompleteCallback && animationCompleteCallback();
  };

  return {
    lastDiscardCompleteCallback,
    lastDealtCompleteCallback,
  };
};

function addDiscardAnimation(
  dealtCard: AnimatedFlipCardData,
  box: Box,
  discardDuration: number,
  discardAt: number,
  discardNumber: number,
  lastDiscardOnComplete: OnComplete | undefined
) {
  dealtCard.animationSequence.push(
    createDiscardZIndexAnimationSegment(discardNumber),
    getDiscardToBoxSegment(
      box,
      discardDuration,
      undefined,
      discardAt,
      lastDiscardOnComplete
    )
  );
}

function isOtherPlayerDiscarded(
  match: MyMatch,
  otherPlayerPosition: number,
  isMe: boolean
) {
  return isMe ? false : match.otherPlayers[otherPlayerPosition].discarded;
}

function doDealPlayerCardsAndPossiblyDiscard(
  match: MyMatch,
  localMatch: LocalMatch,
  dealPositions: DealPosition[],
  playerDealAnimationParameters: PlayerDealAnimationParameters,
  playerDealPositions: PlayerDealPositions,
  myCards: FlipCardData[],
  otherPlayersCards: FlipCardData[][],
  updateLocalMatch: UpdateLocalMatch,
  animationCompleteCallback: () => void
): void {
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
    numberOfDiscards,
    match.changeHistory.numberOfActions,
    animationCompleteCallback
  );

  // eslint-disable-next-line complexity
  dealPositions.forEach((dealPosition, dealPositionIndex) => {
    const isMe = dealPosition.playerIndex === 0;

    const otherPlayerPosition = dealPosition.playerIndex - 1;
    const otherPlayerDiscarded = isOtherPlayerDiscarded(
      match,
      otherPlayerPosition,
      isMe
    );

    const cards = isMe ? myCards : otherPlayersCards[otherPlayerPosition];

    for (let i = 0; i < dealDiscardNumbers.deal; i++) {
      /*
        D1 first dealt etc
        e.g 4 players
        [D1_1, D2_1, D3_1, D4_1, D1_2, D2_2 etc ] 
      */
      const dealNumber = dealPositionIndex + i * numPlayers;

      const dealtCard = getDealtPlayerCard(
        dealPosition.playerPositions.discard,
        i,
        dealNumber,
        isMe,
        playerDealAnimationParameters.dealDuration,
        playerDealAnimationParameters.flipDuration,
        playerDealPositions.deck,
        dealDiscardNumbers.deal * numPlayers,
        isLastDealtCard(
          dealPositionIndex,
          numPlayers,
          i,
          dealDiscardNumbers.deal
        )
          ? completionCallbacks.lastDealtCompleteCallback
          : undefined
      );

      if (isMe) {
        dealtCard.playingCard = match.myCards[i];
      } else if (otherPlayerDiscarded && i < dealDiscardNumbers.discard) {
        addDiscardAnimation(
          dealtCard,
          playerDealPositions.boxPosition,
          playerDealAnimationParameters.discardDuration,
          playerDealAnimationParameters.discardDelay +
            discardCount * playerDealAnimationParameters.discardDuration,
          discardCount,
          discardCount === numberOfDiscards - 1
            ? completionCallbacks.lastDiscardCompleteCallback
            : undefined
        );

        discardCount++;
      }
      cards.push(dealtCard);
    }
  });
}

function isLastDealtCard(
  dealPositionIndex: number,
  numPlayers: number,
  playerDealtCardNumber: number,
  numCardsToDeal: number
) {
  return (
    dealPositionIndex === numPlayers - 1 &&
    playerDealtCardNumber === numCardsToDeal - 1
  );
}

function dealPlayerCardsAndPossiblyDiscard(
  match: MyMatch,
  localMatch: LocalMatch,
  playerDealPositions: PlayerDealPositions,
  playerDealAnimationParameters: PlayerDealAnimationParameters,
  updateLocalMatch: UpdateLocalMatch,
  animationCompleteCallback: () => void
): MyCardsOtherPlayersCards {
  const dealPositions = getDealPositions(
    playerDealPositions.playerPositions,
    match.pegging.nextPlayer,
    [match.myId, ...match.otherPlayers.map((op) => op.id)]
  );
  const [myCards, otherPlayersCards] = initializeCards(
    match.otherPlayers.length
  );

  doDealPlayerCardsAndPossiblyDiscard(
    match,
    localMatch,
    dealPositions,
    playerDealAnimationParameters,
    playerDealPositions,
    myCards,
    otherPlayersCards,
    updateLocalMatch,
    animationCompleteCallback
  );
  return [myCards, otherPlayersCards];
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
  matchDetail: MatchDetail,
  positions: Positions,
  updateLocalMatch: UpdateLocalMatch,
  dealFlipDurations: DealFlipDiscardDurations,
  animationCompleteCallback: () => void
): FlipCardDatas {
  const match = matchDetail.match;
  const localMatch = matchDetail.localMatch;
  const playerPositions = positions.playerPositions;
  const numCardsToDeal = getNumCardsToDeal(match);
  // for cut card and box
  const dealerPositions = getPlayerPositions(
    match.myId,
    match.dealerDetails.current,
    playerPositions,
    match.otherPlayers
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

  const [myCards, otherPlayersCards] = dealPlayerCardsAndPossiblyDiscard(
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
    updateLocalMatch,
    animationCompleteCallback
  );

  return {
    bottomDeckCard: nonPlayerCardDatas.bottomDeckCard, // has zIndex 0
    additionalBoxCard,
    cutCard: nonPlayerCardDatas.cutCard,
    myCards,
    otherPlayersCards,
  };
}
