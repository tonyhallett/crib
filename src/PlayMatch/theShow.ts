import { FlipCardAnimationSequence } from "../FlipCard/FlipCard";
import {
  OtherPlayer,
  PlayingCard,
  ShowScore,
  ShowScoring,
} from "../generatedTypes";
import { FlipCardData, FlipCardDatas, FlipCardState } from "./PlayMatchTypes";
import { setOrAddToAnimationSequence } from "./animationSegments";

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
    if (threeOfAKind !== undefined) {
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
    if (fourOfAKind !== undefined) {
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
    if (oneForHisKnob !== undefined) {
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

interface PlayerScoring {
  playerId: string;
  showScoreParts: ShowScorePart[];
  showCardDatas: FlipCardData[];
}

type CardsAndOwner = { cards: FlipCardData[]; owner: string };
export type CardsAndOwners = CardsAndOwner[];
export const getCardsWithOwners = (
  newFlipCardDatas: FlipCardDatas,
  myId: string,
  otherPlayers: OtherPlayer[]
) => {
  const cardsAndOwners: CardsAndOwners = [
    {
      cards: newFlipCardDatas.myCards,
      owner: myId,
    },
  ];
  otherPlayers.forEach((otherPlayer, index) => {
    cardsAndOwners.push({
      owner: otherPlayer.id,
      cards: newFlipCardDatas.otherPlayersCards[index],
    });
  });
  return cardsAndOwners;
};

// naming tbd
export const getPlayerScorings = (
  showScoring: ShowScoring,
  cardsAndOwners: CardsAndOwners,
  cutCard: FlipCardData,
  box: PlayingCard[]
): PlayerScoring[] => {
  const boxCardDatas: FlipCardData[] = [];
  // these are in order
  const playerScoring = showScoring.playerShowScores.map((playerShowScore) => {
    const cardsAndOwner = cardsAndOwners.find(
      (cardsAndOwner) => cardsAndOwner.owner === playerShowScore.playerId
    ) as CardsAndOwner;
    const cards = cardsAndOwner.cards;
    const showCardDatas: FlipCardData[] = [cutCard];
    cards.forEach((card) => {
      if (
        card.state === FlipCardState.PeggingInPlay ||
        card.state === FlipCardState.PeggingTurnedOver
      ) {
        showCardDatas.push(card);
      } else {
        boxCardDatas.push(card);
      }
    });
    const playerScoring: PlayerScoring = {
      playerId: playerShowScore.playerId,
      showCardDatas: showCardDatas,
      showScoreParts: getShowScoreParts(
        playerShowScore.showScore,
        showCardDatas
      ),
    };
    return playerScoring;
  });
  boxCardDatas.forEach((boxCardData, i) => {
    boxCardData.playingCard = box[i];
  });
  boxCardDatas.push(cutCard);
  // for now game not won and there is a box score
  playerScoring.push({
    showCardDatas: boxCardDatas,
    showScoreParts: getShowScoreParts(showScoring.boxScore, boxCardDatas),
    playerId:
      showScoring.playerShowScores[showScoring.playerShowScores.length - 1]
        .playerId,
  });

  return playerScoring;
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

  const showOpacityAnimator:IShowAnimator = (function () {
    // opacity
    const fadeDuration = 1;
    const outOpacity = 0.3;
    const fadeInOut = (
      fadeIn: boolean,
      at: number,
      card: FlipCardData
    ) => {
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
        scoringCards.forEach((scoringCard) =>
          fadeInOut(true, at, scoringCard)
        );
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

