import { MyMatch, PlayingCard, Score, ShowScoring } from "../generatedTypes";
import {
  DeckPosition,
  DiscardPositions,
  PlayerPositions,
} from "./layout/matchLayoutManager";
import { getPlayerPositions } from "./getPlayerPositions";
import { defaultCribBoardDuration } from "../crib-board/AnimatedCribBoard";
import { moveCutCardToPlayerHand } from "./signalRPeg";
import { DelayEnqueueSnackbar } from "../hooks/useSnackbarWithDelay";
import { VariantType } from "notistack";
import {
  OwnerReturnedCards,
  PlayerScoring,
  getPlayerScorings,
  getShowAnimator,
} from "./theShow";
import { getColouredScores } from "./getColouredScores";
import { Duration, FlipCardData, SetCribboardState } from "./PlayMatchTypes";
import { playMatchSnackbarKey } from "../App";
import { FlipAnimation, FlipCardAnimationSequence } from "../FlipCard/FlipCard";
import {
  createHideShowSegment,
  createZIndexAnimationSegment,
  getMoveRotateSegment,
  instantFlipAnimation,
  moveCardsToDeckWithoutFlipping,
  setOrAddToAnimationSequence,
} from "./animation/animationSegments";
import { CardsAndOwner, CardsAndOwners } from "./getCardsWithOwners";
import { LastToCompleteFactory } from "./signalr/pegging/getSignalRPeggingAnimationProvider";
import {
  HighestScoringShow,
  HighestScoringShowResult,
} from "./signalr/pegging/HighestScoringShow";

export type ShowAndScoreAnimationOptions = Omit<
  MoveHandToDeckAnimationOptions,
  "onComplete"
> & {
  at: number;
  moveCutCardDuration: number;
  scoreMessageDuration: number;
  flipBoxDuration: number;
  moveBoxDuration: number;
  lastToCompleteFactory: LastToCompleteFactory;
};

type FlipAnimationAt = FlipAnimation & { at: number };

function flipBoxAndMoveToPlayerHand(
  boxCardDatas: FlipCardData[],
  handPositions: DiscardPositions,
  at: number,
  flipDuration: number,
  moveDuration: number
): number {
  const pause = 0.1;
  const flipAnimation: FlipAnimationAt = {
    duration: flipDuration,
    flip: true,
    at: at + pause,
  };
  boxCardDatas.forEach((boxCardData, i) => {
    const startZIndex = 4 - i;
    const animationSequence: FlipCardAnimationSequence = [
      createZIndexAnimationSegment(startZIndex, { at }),
    ];

    if (i === 0) {
      animationSequence.push(flipAnimation); // want below to be hidden
    } else {
      animationSequence.push(createHideShowSegment(true));
      animationSequence.push(instantFlipAnimation);

      // need above flip to be completed
      animationSequence.push(
        createHideShowSegment(false, flipAnimation.at + flipDuration)
      );
    }
    animationSequence.push(
      getMoveRotateSegment(
        handPositions.isHorizontal,
        handPositions.positions[i],
        moveDuration,
        moveDuration * i + pause
      )
    );
    animationSequence.push(createZIndexAnimationSegment(0, {}));
    setOrAddToAnimationSequence(boxCardData, animationSequence);
  });
  return 2 * pause + flipDuration + 4 * moveDuration;
}

class HighestScoringShower {
  private highestScoringShow: HighestScoringShow;
  //enqueueSnackbar
  constructor(
    private myMatch: MyMatch,
    private showAndWaitForSnackbar: (msg: string, variant: VariantType) => void
  ) {
    this.highestScoringShow = new HighestScoringShow(myMatch);
  }
  showIfHighestScoring(cards: PlayingCard[], playerId: string, isBox: boolean) {
    const highestScoringResult = this.highestScoringShow.isHighestScoring(
      cards,
      playerId,
      isBox
    );
    if (isBox) {
      this.boxShow(highestScoringResult);
    } else {
      if (highestScoringResult.handOrBox) {
        const ofAllOrNot = highestScoringResult.highestHandOrBoxOfAll
          ? " of all"
          : "";
        this.showAndWaitForSnackbar(
          `Highest scoring hand ${ofAllOrNot} - ${highestScoringResult.score} !`,
          "success"
        );
      }
    }
  }

  private boxShow(highestScoringResult: HighestScoringShowResult) {
    if (highestScoringResult.handOrBox) {
      const ofAllOrNot = highestScoringResult.highestHandOrBoxOfAll
        ? " of all"
        : "";
      this.showAndWaitForSnackbar(
        `Highest scoring box ${ofAllOrNot} - ${highestScoringResult.score} !`,
        "success"
      );
    }
    if (highestScoringResult.handAndBox) {
      const ofAllOrNot = highestScoringResult.highestHandAndBoxOfAll
        ? " of all"
        : "";
      this.showAndWaitForSnackbar(
        `Highest scoring hand and box ${ofAllOrNot} - ${highestScoringResult.handAndBoxScore} !`,
        "success"
      );
    }
  }
}

export function showAndScore(
  showScoring: ShowScoring,
  cardsAndOwners: CardsAndOwners,
  cutCard: FlipCardData,
  pegShowScoring: Score[][],
  animationOptions: ShowAndScoreAnimationOptions,
  setCribBoardState: SetCribboardState,
  delayEnqueueSnackbar: DelayEnqueueSnackbar,
  myMatch: MyMatch,
  playerPositions: PlayerPositions[],
  currentDeckPosition: DeckPosition,
  ownerReturnedCards: OwnerReturnedCards // need to use this for the animation to work
) {
  const playerCardsAndOwners = cardsAndOwners.playerCards;
  const { moveCutCardDuration, scoreMessageDuration } = animationOptions;
  let at = animationOptions.at;
  const showAndWaitForSnackbar = (msg: string, variant: VariantType) => {
    delayEnqueueSnackbar(at * 1000, playMatchSnackbarKey, msg, {
      variant,
      autoHideDuration: scoreMessageDuration * 1000,
    });
    at += scoreMessageDuration;
  };
  const highestScoringShower = new HighestScoringShower(
    myMatch,
    showAndWaitForSnackbar
  );
  const showAnimator = getShowAnimator();
  const playerScorings = getPlayerScorings(
    showScoring,
    cardsAndOwners,
    cutCard
  );

  // eslint-disable-next-line complexity
  playerScorings.forEach((playerScoring, i) => {
    const handPositions = getPlayerPositions(
      myMatch.myId,
      playerScoring.playerId,
      playerPositions,
      myMatch.otherPlayers
    ).discard;

    const isBox = playerScoring.isBox;

    if (!isBox) {
      moveCutCardToPlayerHand(cutCard, at, moveCutCardDuration, handPositions);
      at += moveCutCardDuration;
    } else {
      at += flipBoxAndMoveToPlayerHand(
        cardsAndOwners.boxCards,
        handPositions,
        at,
        animationOptions.flipBoxDuration,
        animationOptions.moveBoxDuration
      );
    }

    const showScoreParts = playerScoring.showScoreParts;
    if (showScoreParts.length === 0) {
      // todo have option for player id
      showAndWaitForSnackbar(
        `${playerScoring.playerId} ${isBox ? "box " : ""}scored 19 !`,
        "info"
      );
    } else {
      at += showAnimator.initialize(at, playerScoring.showCardDatas);
    }

    let scoreTotal = 0;
    playerScoring.showScoreParts.forEach((showScorePart) => {
      at += showAnimator.showScorePart(
        at,
        showScorePart.scoringCards,
        showScorePart.notScoringCards
      );
      scoreTotal += showScorePart.score;
      showAndWaitForSnackbar(
        `${showScorePart.description} ${scoreTotal}`,
        "success"
      );
    });
    const showScoring = pegShowScoring.shift() as Score[];
    if (showScoreParts.length !== 0) {
      at += showAnimator.finalize(at, playerScoring.showCardDatas);
      highestScoringShower.showIfHighestScoring(
        playerScoring.showCardDatas.map((d) => d.playingCard as PlayingCard),
        playerScoring.playerId,
        isBox
      );
      setTimeout(() => {
        setCribBoardState({
          colouredScores: getColouredScores(showScoring),
        });
      }, at * 1000);
      at += defaultCribBoardDuration;
    }

    const cardsAndOwnerIndex = playerCardsAndOwners.findIndex(
      (cardsAndOwner) => playerScoring.playerId === cardsAndOwner.owner
    );
    const returnedCards = ownerReturnedCards[cardsAndOwnerIndex];
    const cardsToMoveToDeck = isBox
      ? playerScoring.showCardDatas
      : returnedCards;
    at += moveHandToDeck(
      cardsToMoveToDeck,
      currentDeckPosition,
      handPositions,
      at,
      1 + i * 4,
      {
        ...animationOptions,
        onComplete: animationOptions.lastToCompleteFactory(),
      }
    );
  });

  returnRemainingCardsToDeck(
    cutCard,
    cardsAndOwners,
    ownerReturnedCards,
    playerScorings,
    currentDeckPosition,
    at,
    animationOptions,
    myMatch,
    playerPositions
  );
}

function getRemainingCardsToMoveToDeck(
  cardsAndOwners: CardsAndOwners,
  ownerReturnedCards: OwnerReturnedCards,
  playerScorings: PlayerScoring[]
): CardsAndOwner[] {
  const boxMarker = "box";
  let additionalToMoveToDeck: CardsAndOwner[] = cardsAndOwners.playerCards.map(
    (playerCards, i) => {
      return {
        owner: playerCards.owner,
        cards: ownerReturnedCards[i],
      };
    }
  );
  additionalToMoveToDeck.push({
    owner: boxMarker,
    cards: cardsAndOwners.boxCards,
  });

  additionalToMoveToDeck = additionalToMoveToDeck.filter((additional) => {
    if (additional.owner === boxMarker) {
      return !playerScorings.some((ps) => ps.isBox);
    }
    return !playerScorings.some((ps) => ps.playerId === additional.owner);
  });
  return additionalToMoveToDeck;
}

function returnRemainingCardsToDeck(
  cutCard: FlipCardData,
  cardsAndOwners: CardsAndOwners,
  ownerReturnedCards: OwnerReturnedCards,
  playerScorings: PlayerScoring[],
  currentDeckPosition: DeckPosition,
  at: number,
  animationOptions: MoveHandToDeckAnimationOptions & {
    lastToCompleteFactory: LastToCompleteFactory;
  },
  myMatch: MyMatch,
  playerPositions: PlayerPositions[]
) {
  const additionalToMoveToDeck = getRemainingCardsToMoveToDeck(
    cardsAndOwners,
    ownerReturnedCards,
    playerScorings
  );

  // for now do in any order
  additionalToMoveToDeck.forEach((additional) => {
    if (additional.owner === "box") {
      const currentDeckCount = 1 + cardsAndOwners.playerCards.length * 4;
      at += moveCardsToDeckWithoutFlipping(
        additional.cards,
        currentDeckCount,
        currentDeckPosition,
        at,
        animationOptions.moveToDeckMoveToDeckDuration
      );
    } else {
      const handPositions = getPlayerPositions(
        myMatch.myId,
        additional.owner,
        playerPositions,
        myMatch.otherPlayers
      ).discard;
      const currentDeckCount = 1 + playerScorings.length * 4;
      at += moveHandToDeck(
        additional.cards,
        currentDeckPosition,
        handPositions,
        at,
        currentDeckCount,
        animationOptions
      );
    }
  });

  if (additionalToMoveToDeck.length > 0) {
    const currentDeckCount = 1 + (cardsAndOwners.playerCards.length + 1) * 4;

    moveCutCardToDeck(
      cutCard,
      animationOptions.moveToDeckMoveToDeckDuration,
      animationOptions.moveToDeckFlipDuration,
      at,
      currentDeckCount,
      currentDeckPosition,
      animationOptions.lastToCompleteFactory()
    );
  }
}

function moveCutCardToDeck(
  cutCard: FlipCardData,
  moveDuration: number,
  flipDuration: number,
  at: number,
  currentDeckCount: number,
  currentDeckPosition: DeckPosition,
  onComplete: () => void
) {
  const flipAnimation: FlipAnimation = {
    duration: flipDuration,
    flip: true,
    at,
  };
  const flipCardAnimationSequence: FlipCardAnimationSequence = [
    createZIndexAnimationSegment(currentDeckCount + 1, {}),
    flipAnimation,
    getMoveRotateSegment(
      currentDeckPosition.isHorizontal,
      currentDeckPosition.position,
      moveDuration,
      undefined,
      undefined,
      onComplete
    ),
  ];
  setOrAddToAnimationSequence(cutCard, flipCardAnimationSequence);
}

interface MoveToDeckAnimationOptions {
  moveToDeckFlipDuration: number;
  moveToDeckMoveDuration: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function moveToDeckIndividually(
  flipCardDatas: FlipCardData[],
  deckPosition: DeckPosition,
  handPositions: DiscardPositions,
  at: number,
  currentDeckCount: number,
  animationOptions: MoveToDeckAnimationOptions
): number {
  const { moveToDeckFlipDuration, moveToDeckMoveDuration } = animationOptions;
  flipCardDatas.forEach((flipCardData, i) => {
    const positionIndex = i;
    const flipAnimation: FlipAnimation = {
      duration: moveToDeckFlipDuration,
      flip: true,
    };
    const animationSequence: FlipCardAnimationSequence = [
      createZIndexAnimationSegment(currentDeckCount + positionIndex, { at }),
      flipAnimation,
      getMoveRotateSegment(
        deckPosition.isHorizontal,
        deckPosition.position,
        moveToDeckMoveDuration,
        moveToDeckMoveDuration * positionIndex
      ),
    ];
    setOrAddToAnimationSequence(flipCardData, animationSequence);
  });
  return moveToDeckFlipDuration + flipCardDatas.length * moveToDeckMoveDuration;
}

interface MoveHandToDeckAnimationOptions {
  moveToDeckMoveToFirstDuration: number;
  moveToDeckFlipDuration: number;
  moveToDeckMoveToDeckDuration: number;
  onComplete?: () => void;
}

function moveHandToDeck(
  flipCardDatas: FlipCardData[],
  deckPosition: DeckPosition,
  handPositions: DiscardPositions,
  at: number,
  currentDeckCount: number,
  animationOptions: MoveHandToDeckAnimationOptions
): Duration {
  const pause = 0.1;
  const firstPosition = handPositions.positions[0];
  const lastCardIndex = flipCardDatas.length - 1;
  const {
    moveToDeckFlipDuration,
    moveToDeckMoveToDeckDuration,
    moveToDeckMoveToFirstDuration,
  } = animationOptions;
  flipCardDatas.forEach((flipCardData, positionIndex) => {
    const flipAnimation: FlipAnimationAt = {
      duration: moveToDeckFlipDuration,
      flip: true,
      at: at + moveToDeckMoveToFirstDuration + pause,
    };
    const animationSequence: FlipCardAnimationSequence = [
      createZIndexAnimationSegment(currentDeckCount + positionIndex, { at }), // for correct positioning when slide upon each other
      getMoveRotateSegment(
        handPositions.isHorizontal,
        firstPosition,
        moveToDeckMoveToFirstDuration
      ),
    ];
    if (positionIndex === lastCardIndex) {
      animationSequence.push(flipAnimation);
    } else {
      animationSequence.push(createHideShowSegment(true));
      animationSequence.push(instantFlipAnimation);
      animationSequence.push(
        createHideShowSegment(false, flipAnimation.at + flipAnimation.duration)
      );
    }

    // needs a pause
    animationSequence.push(
      getMoveRotateSegment(
        deckPosition.isHorizontal,
        deckPosition.position,
        moveToDeckMoveToDeckDuration,
        undefined,
        undefined,
        positionIndex === lastCardIndex
          ? animationOptions.onComplete
          : undefined
      )
    );

    setOrAddToAnimationSequence(flipCardData, animationSequence);
  });
  return (
    moveToDeckMoveToFirstDuration +
    pause +
    moveToDeckFlipDuration +
    moveToDeckMoveToDeckDuration
  );
}
