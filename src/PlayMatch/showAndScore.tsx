import { MyMatch, PlayingCard, Score, ShowScoring } from "../generatedTypes";
import { DeckPosition, DiscardPositions, PlayerPositions } from "./matchLayoutManager";
import { getPlayerPositions } from "./getPlayerPositions";
import { defaultCribBoardDuration } from "../crib-board/AnimatedCribBoard";
import { moveCutCardToPlayerHand } from "./signalRPeg";
import { DelayEnqueueSnackbar } from "../hooks/useSnackbarWithDelay";
import { VariantType } from "notistack";
import { CardsAndOwners, OwnerReturnedCards, getPlayerScorings, getShowAnimator } from "./theShow";
import { getColouredScores } from "./getColouredScores";
import { FlipCardData, SetCribboardState } from "./PlayMatchTypes";
import { playMatchSnackbarKey } from "../App";
import { FlipAnimation, FlipCardAnimationSequence } from "../FlipCard/FlipCard";
import { createHideShowSegment, createZIndexAnimationSegment, getMoveRotateSegment, instantFlipAnimation, setOrAddToAnimationSequence } from "./animationSegments";

export interface ShowAndScoreAnimationOptions extends MoveToDeckAnimationOptions {
  at: number;
  moveCutCardDuration: number;
  scoreMessageDuration: number;
  flipBoxDuration:number,
  moveBoxDuration:number
}

function flipBoxAndMoveToPlayerHand(
  boxCardDatas: FlipCardData[],
  handPositions:DiscardPositions,
  at:number,
  flipDuration:number,
  moveDuration:number
):number{
  boxCardDatas.forEach((boxCardData, i) => {
    const startZIndex = 4 - i;
    const animationSequence:FlipCardAnimationSequence = [
      createZIndexAnimationSegment(startZIndex,{at})
    ]
    if(i === 0){
      const flipAnimation:FlipAnimation = {
        duration:flipDuration,
        flip:true
      }
      animationSequence.push(flipAnimation);
    }else{
      animationSequence.push(createHideShowSegment(true));
      animationSequence.push(instantFlipAnimation);
      animationSequence.push(createHideShowSegment(false,at + flipDuration));
    }
    animationSequence.push(getMoveRotateSegment(handPositions.isHorizontal,handPositions.positions[i],moveDuration,moveDuration*i));
    animationSequence.push(createZIndexAnimationSegment(0,{}));
    setOrAddToAnimationSequence(boxCardData,animationSequence);
  });
  return flipDuration + 4 * moveDuration;
}

export function showAndScore(
  showScoring: ShowScoring,
  cardsAndOwners: CardsAndOwners,
  cutCard: FlipCardData,
  additionalBoxCard:FlipCardData | undefined,
  pegShowScoring: Score[][],
  box: PlayingCard[],
  animationOptions: ShowAndScoreAnimationOptions,
  setCribBoardState: SetCribboardState,
  delayEnqueueSnackbar: DelayEnqueueSnackbar,
  myMatch: MyMatch,
  playerPositions: PlayerPositions[],
  currentDeckPosition:DeckPosition,
  ownerReturnedCards:OwnerReturnedCards
) {
  const { moveCutCardDuration, scoreMessageDuration } = animationOptions;
  let at = animationOptions.at;
  const showAndWaitForSnackbar = (msg: string, variant: VariantType) => {
    delayEnqueueSnackbar(at * 1000, playMatchSnackbarKey, msg, {
      variant,
      autoHideDuration: scoreMessageDuration * 1000,
    });
    at += scoreMessageDuration;
  };
  const showAnimator = getShowAnimator();
  // for now game not won and there is a box score
  const {playerScorings,boxCardDatas} = getPlayerScorings(
    showScoring,
    cardsAndOwners,
    cutCard,
    box,
    additionalBoxCard
  );

  // eslint-disable-next-line complexity
  playerScorings.forEach((playerScoring, i) => {
    const cardsAndOwnerIndex = cardsAndOwners.findIndex(cardsAndOwner => playerScoring.playerId === cardsAndOwner.owner);
    const returnedCards = ownerReturnedCards[cardsAndOwnerIndex];
    const handPositions = getPlayerPositions(
      myMatch.myId,
      playerScoring.playerId,
      playerPositions,
      myMatch.otherPlayers
    ).discard;

    const isBox = i === playerScorings.length - 1;

    if (!isBox) {
      moveCutCardToPlayerHand(
        cutCard,
        at,
        moveCutCardDuration,
        handPositions
      );
      at += moveCutCardDuration;
    } else {
      at += flipBoxAndMoveToPlayerHand(boxCardDatas,handPositions,at, animationOptions.flipBoxDuration,animationOptions.moveBoxDuration);
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
      setTimeout(() => {
        setCribBoardState({
          colouredScores: getColouredScores(showScoring),
        });
      }, at * 1000);
      at += defaultCribBoardDuration;
    }
    const cardsToMoveToDeck = isBox ? playerScoring.showCardDatas : returnedCards;
    at += moveToDeck(cardsToMoveToDeck, currentDeckPosition,handPositions, at, 1 + (i * 4),animationOptions);
  });
}

interface MoveToDeckAnimationOptions{
  moveToDeckFlipDuration:number,
  moveToDeckMoveDuration:number
}

function moveToDeck(
  flipCardDatas:FlipCardData[], 
  deckPosition:DeckPosition,
  handPositions:DiscardPositions, 
  at:number, 
  currentDeckCount:number,
  animationOptions:MoveToDeckAnimationOptions
):number{
  const {moveToDeckFlipDuration,moveToDeckMoveDuration} = animationOptions
  flipCardDatas.forEach((flipCardData,i) => {
    const positionIndex = i;
    const flipAnimation:FlipAnimation = {
      duration:moveToDeckFlipDuration,
      flip:true
    }
    const animationSequence:FlipCardAnimationSequence = [
      createZIndexAnimationSegment(currentDeckCount + positionIndex,{at}),
      flipAnimation,
      getMoveRotateSegment(deckPosition.isHorizontal,deckPosition.position,moveToDeckMoveDuration,moveToDeckMoveDuration * positionIndex)
    ]
    setOrAddToAnimationSequence(flipCardData,animationSequence);
  });
  return moveToDeckFlipDuration + flipCardDatas.length * moveToDeckMoveDuration;
}
