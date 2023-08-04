import { FlipAnimation, FlipCardAnimationSequence } from "../FlipCard/FlipCard";
import {
  MyMatch,
  PeggedCard,
  PlayingCard,
  Score,
  ShowScore,
  ShowScoring,
} from "../generatedTypes";
import { DelayEnqueueSnackbar } from "../hooks/useSnackbarWithDelay";
import {
  FlipCardData,
  FlipCardDatas,
  FlipCardState,
  SetCribboardState,
} from "./PlayMatchTypes";
import {
  createHideShowSegment,
  createZIndexAnimationSegment,
  getMoveRotateSegment,
  setOrAddToAnimationSequence,
} from "./animation/animationSegments";
import { CardsAndOwner, CardsAndOwners } from "./getCardsWithOwners";
import { getPlayerPositionIndex } from "./getPlayerPositions";
import { DeckPosition, PlayerPositions } from "./layout/matchLayoutManager";
import { getCardValue, cardMatch } from "./playingCardUtilities";
import { ShowAndScoreAnimationOptions, showAndScore } from "./showAndScore";

export interface FlipCardDataLookup {
  [playingCard: string]: FlipCardData;
}

export class PlayingCardLookupFlipCardData {
  private lookup: FlipCardDataLookup = {};
  constructor(handAndCutCard: FlipCardData[]) {
    handAndCutCard.reduce<FlipCardDataLookup>((lookup, cardData) => {
      const playingCard = cardData.playingCard as PlayingCard;
      lookup[this.getKey(playingCard)] = cardData;

      return lookup;
    }, this.lookup);
  }
  private getKey(playingCard: PlayingCard) {
    return `${playingCard.pips}${playingCard.suit}`;
  }
  get(playingCard: PlayingCard): FlipCardData {
    return this.lookup[this.getKey(playingCard)];
  }
}

enum ScoringPartType {
  Fifteen,
  Pair,
  Three,
  Four,
  Run,
  Flush,
  HisKnob,
}

interface ContributingPart {
  description: string;
  score: number;
  contributingCards: PlayingCard[];
}

type ScoringPart = (showScore: ShowScore) =>
  | {
      contributingParts: ContributingPart[];
      type: ScoringPartType;
    }
  | undefined;

const scoringParts: ScoringPart[] = [
  (showScore: ShowScore) => {
    const fifteenTwos = showScore.fifteenTwos;
    if (fifteenTwos.length > 0) {
      return {
        contributingParts: fifteenTwos.map((fifteenTwo) => {
          return {
            description: "Fifteen",
            score: 2,
            contributingCards: fifteenTwo,
          };
        }),

        type: ScoringPartType.Fifteen,
      };
    }
    return undefined;
  },
  (showScore: ShowScore) => {
    const pairs = showScore.pairs;
    if (pairs.length > 0) {
      return {
        contributingParts: pairs.map((pair) => {
          return {
            description: "Pairs",
            score: 2,
            contributingCards: [pair.card1, pair.card2],
          };
        }),
        type: ScoringPartType.Pair,
      };
    }
    return undefined;
  },
  (showScore: ShowScore) => {
    const threeOfAKind = showScore.threeOfAKind;
    if (threeOfAKind) {
      return {
        contributingParts: [
          {
            contributingCards: [
              threeOfAKind.card1,
              threeOfAKind.card2,
              threeOfAKind.card3,
            ],
            description: "Threes",
            score: 6,
          },
        ],
        type: ScoringPartType.Three,
      };
    }
    return undefined;
  },
  (showScore: ShowScore) => {
    const fourOfAKind = showScore.fourOfAKind;
    if (fourOfAKind) {
      return {
        contributingParts: [
          {
            contributingCards: [
              fourOfAKind.card1,
              fourOfAKind.card2,
              fourOfAKind.card3,
              fourOfAKind.card4,
            ],
            description: "Fours",
            score: 12,
          },
        ],
        type: ScoringPartType.Four,
      };
    }
    return undefined;
  },
  (showScore: ShowScore) => {
    const runs = showScore.runs;
    if (runs.length > 0) {
      return {
        contributingParts: runs.map((run) => {
          return {
            contributingCards: run,
            description: "Run",
            score: run.length,
          };
        }),
        type: ScoringPartType.Run,
      };
    }
    return undefined;
  },
  (showScore: ShowScore) => {
    const flush = showScore.flush;
    if (flush.length > 0) {
      return {
        contributingParts: [
          {
            contributingCards: flush,
            description: "Flush",
            score: flush.length,
          },
        ],
        type: ScoringPartType.Flush,
      };
    }
    return undefined;
  },
  (showScore: ShowScore) => {
    const oneForHisKnob = showScore.oneForHisKnob;
    if (oneForHisKnob) {
      return {
        contributingParts: [
          {
            contributingCards: [oneForHisKnob],
            description: "One for his knob",
            score: 1,
          },
        ],
        type: ScoringPartType.HisKnob,
      };
    }
    return undefined;
  },
];

const getShowScoreParts = (
  showScore: ShowScore,
  scoringCardDatas: FlipCardData[]
): ShowScorePart[] => {
  const handAndCutCardPlayingCards = scoringCardDatas.map(
    (flipCardData) => flipCardData.playingCard as PlayingCard
  );
  const flipCardDataLookup = new PlayingCardLookupFlipCardData(
    scoringCardDatas
  );

  const getNotScoring = (contributingCards: PlayingCard[]) => {
    return handAndCutCardPlayingCards
      .filter((handOrCutCard) => !contributingCards.includes(handOrCutCard))
      .map((notIncludedCard) => flipCardDataLookup.get(notIncludedCard));
  };

  const showScoreParts = scoringParts.reduce<ShowScorePart[]>(
    (parts, scoringPart) => {
      const partParts = scoringPart(showScore);
      if (partParts !== undefined) {
        partParts.contributingParts.forEach((contributingPart) => {
          parts.push({
            description: contributingPart.description,
            score: contributingPart.score,
            scoringCards: contributingPart.contributingCards.map(
              (playingCard) => flipCardDataLookup.get(playingCard)
            ),
            notScoringCards: getNotScoring(contributingPart.contributingCards),
          });
        });
      }
      return parts;
    },
    []
  );
  return showScoreParts;
};

interface ShowScorePart {
  scoringCards: FlipCardData[];
  notScoringCards: FlipCardData[];
  score: number;
  description: string;
}

export interface PlayerScoring {
  playerId: string;
  showScoreParts: ShowScorePart[];
  showCardDatas: FlipCardData[];
  isBox: boolean;
}

// naming tbd
export const getPlayerScorings = (
  showScoring: ShowScoring,
  cardsAndOwners: CardsAndOwners,
  cutCard: FlipCardData
): PlayerScoring[] => {
  const playerCardsAndOwners = cardsAndOwners.playerCards;
  // these are in order
  const playerScorings = showScoring.playerShowScores.map((playerShowScore) => {
    const cardsAndOwner = playerCardsAndOwners.find(
      (cardsAndOwner) => cardsAndOwner.owner === playerShowScore.playerId
    ) as CardsAndOwner;
    const cards = cardsAndOwner.cards;
    const showCardDatas: FlipCardData[] = [cutCard, ...cards];
    const playerScoring: PlayerScoring = {
      playerId: playerShowScore.playerId,
      showCardDatas: showCardDatas,
      showScoreParts: getShowScoreParts(
        playerShowScore.showScore,
        showCardDatas
      ),
      isBox: false,
    };
    return playerScoring;
  });

  const showBoxCards = [...cardsAndOwners.boxCards, cutCard];
  if (showScoring.boxScore) {
    playerScorings.push({
      isBox: true,
      showCardDatas: showBoxCards,
      showScoreParts: getShowScoreParts(showScoring.boxScore, showBoxCards),
      playerId:
        showScoring.playerShowScores[showScoring.playerShowScores.length - 1]
          .playerId,
    });
  }

  return playerScorings;
};

// todo options
export interface IShowAnimator {
  showScorePart(
    at: number,
    scoringCards: FlipCardData[],
    notScoringCards: FlipCardData[]
  ): number;
  initialize(at: number, flipCardDatas: FlipCardData[]): number;
  finalize(at: number, showCardDatas: FlipCardData[]): number;
}

const showOpacityAnimator: IShowAnimator = (function () {
  // opacity
  const fadeDuration = 1;
  const outOpacity = 0.3;
  const fadeInOut = (fadeIn: boolean, at: number, card: FlipCardData) => {
    const sequence: FlipCardAnimationSequence = [
      [
        undefined,
        { opacity: fadeIn ? 1 : outOpacity },
        { duration: fadeDuration, at },
      ],
    ];
    setOrAddToAnimationSequence(card, sequence);
  };

  return {
    initialize(at: number, showCardDatas: FlipCardData[]): number {
      showCardDatas.forEach((showCardData) => {
        fadeInOut(false, at, showCardData);
      });
      return fadeDuration;
    },
    finalize(at: number, showCardDatas: FlipCardData[]): number {
      showCardDatas.forEach((showCardData) => {
        fadeInOut(true, at, showCardData);
      });
      return fadeDuration;
    },
    showScorePart(
      at: number,
      scoringCards: FlipCardData[],
      notScoringCards: FlipCardData[]
    ) {
      scoringCards.forEach((scoringCard) => fadeInOut(true, at, scoringCard));
      notScoringCards.forEach((scoringCard) =>
        fadeInOut(false, at, scoringCard)
      );
      return fadeDuration;
    },
  };
})();
export const getShowAnimator = (): IShowAnimator => {
  return showOpacityAnimator;
};

// bottom first
export function getTurnOverOrder(turnedOverCards: PeggedCard[]) {
  const turnOverOrder: PeggedCard[] = [];
  let peggedCards: PeggedCard[] = [];
  let currentScore = 0;
  const turnOverTheCards = () => {
    peggedCards.reverse();
    turnOverOrder.push(...peggedCards);
    peggedCards = [];
  };
  for (let i = 0; i < turnedOverCards.length; i++) {
    const peggedCard = turnedOverCards[i];
    const cardValue = getCardValue(peggedCard.playingCard.pips);
    const newCurrentScore = currentScore + cardValue;
    if (newCurrentScore === 31) {
      currentScore = 0;
      peggedCards.push(peggedCard);
      turnOverTheCards();
    } else if (newCurrentScore > 31) {
      turnOverTheCards();

      currentScore = cardValue;
      peggedCards.push(peggedCard);
    } else {
      currentScore = newCurrentScore;
      peggedCards.push(peggedCard);
    }
  }
  if (peggedCards.length > 0) {
    turnOverTheCards();
  }
  return turnOverOrder;
}

export interface ReturnCardsToPlayersAnimationOptions {
  flipDuration: number;
  returnDuration: number;
  onComplete: () => void;
}
export const returnCardsToPlayers = (
  myMatch: MyMatch,
  at: number,
  playerPositions: PlayerPositions[],
  cardsAndOwners: CardsAndOwners,
  animationOptions: ReturnCardsToPlayersAnimationOptions,
  ownerReturnedCards: OwnerReturnedCards
): {
  returnInPlayAt: number;
  duration: number;
} => {
  const { flipDuration, returnDuration, onComplete } = animationOptions;
  let returnInPlayAt = at;
  if (myMatch.pegging.turnedOverCards.length > 0) {
    // prev and new could be the same
    const turnedOverDuration = returnTurnedOverCardsToPlayers(
      cardsAndOwners,
      at,
      flipDuration,
      returnDuration,
      myMatch,
      playerPositions,
      ownerReturnedCards
    );
    returnInPlayAt += turnedOverDuration;
  }

  const duration = returnInPlayCardsToPlayers(
    cardsAndOwners,
    returnInPlayAt,
    returnDuration,
    onComplete,
    myMatch,
    playerPositions,
    ownerReturnedCards
  );

  return { returnInPlayAt, duration };
};

const returnedZIndex = -1;
export const returnTurnedOverCardsToPlayers = (
  cardsAndOwners: CardsAndOwners,
  at: number,
  flipDuration: number,
  returnDuration: number,
  myMatch: MyMatch,
  playerPositions: PlayerPositions[],
  ownerReturnedCards: OwnerReturnedCards
): number => {
  const playerCardsAndOwners = cardsAndOwners.playerCards;
  const order = getTurnOverOrder(myMatch.pegging.turnedOverCards);
  const moveDelay = 0.2;

  playerCardsAndOwners.forEach((cardsAndOwner, cardsAndOwnerIndex) => {
    const owner = cardsAndOwner.owner;
    const ownerCardsWithTurnOverOrderIndex = order
      .map((peggedCard, index) => ({ peggedCard, index }))
      .filter(
        (cardWithTurnOverOrderIndex) =>
          cardWithTurnOverOrderIndex.peggedCard.owner === owner
      );

    const playerPosition =
      playerPositions[
        getPlayerPositionIndex(owner, myMatch.myId, myMatch.otherPlayers)
      ];
    const handPositions = playerPosition.discard;

    cardsAndOwner.cards.forEach((flipCardData) => {
      if (flipCardData.state === FlipCardState.PeggingTurnedOver) {
        const playingCard = flipCardData.playingCard as PlayingCard;
        const index = order.findIndex((peggedCard) =>
          cardMatch(peggedCard.playingCard, playingCard)
        );
        const segments: FlipCardAnimationSequence = [
          createZIndexAnimationSegment(50 + order.length - index, {
            at,
          }),
        ];
        if (index !== 0) {
          segments.push(createHideShowSegment(true));
        }
        const flipAnimation: FlipAnimation = {
          flip: true,
          duration: flipDuration,
        };
        segments.push(flipAnimation);

        if (index !== 0) {
          segments.push(createHideShowSegment(false));
        }

        //lower the order lower the positionIndex
        const positionIndex = ownerCardsWithTurnOverOrderIndex.findIndex(
          (ownerCardWithTurnOverOrderIndex) =>
            ownerCardWithTurnOverOrderIndex.index === index
        );
        ownerReturnedCards[cardsAndOwnerIndex][positionIndex] = flipCardData;
        /*
            top card needs to account for ones below it have longer durations
            this should be the code but does not work
            const additionalDelayIfTop = index === 0 ? 2 * instantAnimationDuration : 0;

            0.1 does but can just have a delay that applied to all of them
          */

        segments.push(
          getMoveRotateSegment(
            handPositions.isHorizontal,
            handPositions.positions[positionIndex],
            returnDuration,
            moveDelay + index * returnDuration
          )
        );
        segments.push(createZIndexAnimationSegment(returnedZIndex, {}));
        setOrAddToAnimationSequence(flipCardData, segments);
      }
    });
  });

  const duration =
    moveDelay +
    myMatch.pegging.turnedOverCards.length * returnDuration +
    flipDuration;
  return duration;
};

export const returnInPlayCardsToPlayers = (
  cardsAndOwners: CardsAndOwners,
  at: number,
  returnDuration: number,
  onComplete: () => void,
  myMatch: MyMatch,
  playerPositions: PlayerPositions[],
  ownerReturnedCards: OwnerReturnedCards
): number => {
  const inPlayCards = myMatch.pegging.inPlayCards;
  let numCardsReturned = 0;
  const playerCardsAndOwners = cardsAndOwners.playerCards;
  playerCardsAndOwners.forEach((cardsAndOwner, cardsAndOwnerIndex) => {
    const owner = cardsAndOwner.owner;
    const handPosition =
      playerPositions[
        getPlayerPositionIndex(owner, myMatch.myId, myMatch.otherPlayers)
      ].discard;

    // should pass this in as parameter ?
    const ownerNumTurnedOver = myMatch.pegging.turnedOverCards.filter(
      (turnedOverCard) => turnedOverCard.owner === owner
    ).length;
    const startIndex = 4 - ownerNumTurnedOver - 1;

    const ownerInPlayCards = inPlayCards.filter((pc) => pc.owner === owner);

    cardsAndOwner.cards.forEach((flipCardData) => {
      if (flipCardData.state === FlipCardState.PeggingInPlay) {
        const peggedCardIndex = inPlayCards.findIndex((peggedCard) =>
          cardMatch(
            peggedCard.playingCard,
            flipCardData.playingCard as PlayingCard
          )
        );

        const ownerInPlayCardsIndex = ownerInPlayCards.indexOf(
          inPlayCards[peggedCardIndex]
        );
        // greater the index lower the position index
        const inPlayIndex = ownerInPlayCards.length - ownerInPlayCardsIndex;

        const discardPositionIndex = startIndex + inPlayIndex;
        ownerReturnedCards[cardsAndOwnerIndex][discardPositionIndex] =
          flipCardData;
        const returnIndex = inPlayCards.length - peggedCardIndex - 1;
        numCardsReturned++;
        const segments: FlipCardAnimationSequence = [
          getMoveRotateSegment(
            handPosition.isHorizontal,
            handPosition.positions[discardPositionIndex],
            returnDuration,
            undefined,
            at + returnDuration * returnIndex
          ),
          createZIndexAnimationSegment(returnedZIndex, {
            onComplete: peggedCardIndex === 0 ? onComplete : undefined,
          }),
        ];

        setOrAddToAnimationSequence(flipCardData, segments);
      }
    });
  });

  return numCardsReturned * returnDuration;
};

type ShowAnimationOptions = ReturnCardsToPlayersAnimationOptions &
  ShowAndScoreAnimationOptions;

export type OwnerReturnedCards = FlipCardData[][];

const initializeOwnerReturnedCards = (
  numPlayers: number
): OwnerReturnedCards => {
  const ownerReturnedCards: OwnerReturnedCards = new Array(numPlayers);
  for (let i = 0; i < numPlayers; i++) {
    ownerReturnedCards[i] = new Array(4);
  }
  return ownerReturnedCards;
};

export const addShowAnimation = (
  prevFlipCardDatas: FlipCardDatas,
  newFlipCardDatas: FlipCardDatas,
  showAnimationOptions: ShowAnimationOptions,
  pegShowScoring: Score[][],
  myMatch: MyMatch,
  playerPositions: PlayerPositions[],
  setCribBoardState: SetCribboardState,
  delayEnqueueSnackbar: DelayEnqueueSnackbar,
  cardsWithOwners: CardsAndOwners,
  deckPosition: DeckPosition
) => {
  const cardsAndOwners = cardsWithOwners.playerCards;
  const ownerReturnedCards = initializeOwnerReturnedCards(
    cardsAndOwners.length
  );

  const { returnInPlayAt, duration } = returnCardsToPlayers(
    myMatch,
    showAnimationOptions.at,
    playerPositions,
    cardsWithOwners,
    { ...showAnimationOptions },
    ownerReturnedCards
  );

  showAndScore(
    myMatch.showScoring as ShowScoring,
    cardsWithOwners,
    newFlipCardDatas.cutCard,
    pegShowScoring,
    {
      ...showAnimationOptions,
      at: returnInPlayAt + duration,
    },
    setCribBoardState,
    delayEnqueueSnackbar,
    myMatch,
    playerPositions,
    deckPosition,
    ownerReturnedCards
  );
};
