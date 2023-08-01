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

export interface ShowAndScoreAnimationOptions extends MoveToDeckTogetherAnimationOptions {
  at: number;
  moveCutCardDuration: number;
  scoreMessageDuration: number;
  flipBoxDuration:number,
  moveBoxDuration:number
}

type FlipAnimationAt = FlipAnimation & { at: number };

function flipBoxAndMoveToPlayerHand(
  boxCardDatas: FlipCardData[],
  handPositions:DiscardPositions,
  at:number,
  flipDuration:number,
  moveDuration:number
):number{
  const pause = 0.1;
  const flipAnimation:FlipAnimationAt = {
    duration:flipDuration,
    flip:true,
    at:at+ pause
  }
  boxCardDatas.forEach((boxCardData, i) => {
    const startZIndex = 4 - i;
    const animationSequence:FlipCardAnimationSequence = [
      createZIndexAnimationSegment(startZIndex,{at})
    ]

    if(i === 0){
      animationSequence.push(flipAnimation);// want below to be hidden 
    }else{
      animationSequence.push(createHideShowSegment(true));
      animationSequence.push(instantFlipAnimation);

      // need above flip to be completed
      animationSequence.push(createHideShowSegment(false,flipAnimation.at + flipDuration));
    }
    animationSequence.push(
      getMoveRotateSegment(
        handPositions.isHorizontal,
        handPositions.positions[i],
        moveDuration,
        moveDuration*i + pause
      )
    );
    animationSequence.push(createZIndexAnimationSegment(0,{}));
    setOrAddToAnimationSequence(boxCardData,animationSequence);
  });
  return 2 * pause + flipDuration + 4 * moveDuration;
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
      at += flipBoxAndMoveToPlayerHand(
        boxCardDatas,
        handPositions,
        at, 
        animationOptions.flipBoxDuration,
        animationOptions.moveBoxDuration);
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
    at += moveToDeckTogether(cardsToMoveToDeck, currentDeckPosition,handPositions, at, 1 + (i * 4),animationOptions);
  });
}

interface MoveToDeckAnimationOptions{
  moveToDeckFlipDuration:number,
  moveToDeckMoveDuration:number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function moveToDeckIndividually(
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

interface MoveToDeckTogetherAnimationOptions{
  moveToDeckMoveToFirstDuration:number,
  moveToDeckFlipDuration:number,
  moveToDeckMoveToDeckDuration:number
}

function moveToDeckTogether(
  flipCardDatas:FlipCardData[], 
  deckPosition:DeckPosition,
  handPositions:DiscardPositions, 
  at:number, 
  currentDeckCount:number,
  animationOptions:MoveToDeckTogetherAnimationOptions
):number{
  const pause = 0.1;
  const firstPosition = handPositions.positions[0];
  const lastCardIndex = flipCardDatas.length - 1;
  const {moveToDeckFlipDuration,moveToDeckMoveToDeckDuration,moveToDeckMoveToFirstDuration} = animationOptions
  //const {moveToDeckFlipDuration,moveToDeckMoveDuration} = {moveToDeckFlipDuration:2,moveToDeckMoveDuration:2};
  flipCardDatas.forEach((flipCardData,positionIndex) => {

    const flipAnimation:FlipAnimationAt = {
      duration:moveToDeckFlipDuration,
      flip:true,
      at:at + moveToDeckMoveToFirstDuration + pause
    }
    const animationSequence:FlipCardAnimationSequence = [
      createZIndexAnimationSegment(currentDeckCount + positionIndex,{at}),// for correct positioning when slide upon each other
      getMoveRotateSegment(handPositions.isHorizontal,firstPosition,moveToDeckMoveToFirstDuration),
    ]
    if(positionIndex === lastCardIndex){
      animationSequence.push(flipAnimation);
      
    }else{
      animationSequence.push(createHideShowSegment(true));
      animationSequence.push(instantFlipAnimation);
      animationSequence.push(createHideShowSegment(false,flipAnimation.at + flipAnimation.duration));
    }

    // needs a pause
    animationSequence.push(getMoveRotateSegment(deckPosition.isHorizontal,deckPosition.position,moveToDeckMoveToDeckDuration));

    setOrAddToAnimationSequence(flipCardData,animationSequence);
  });
  return moveToDeckMoveToFirstDuration + pause + moveToDeckFlipDuration + moveToDeckMoveToDeckDuration;
}
