import {
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CribClient,
  CribGameState,
  CribHub,
  MyMatch,
  PegScoring,
  PeggedCard,
  Pips,
  PlayingCard,
  Score,
} from "../generatedTypes";
import { LocalMatch, dealActionIndicator } from "../LocalMatch";
import { getDiscardCardDatas } from "./getDiscardCardData";
import { getPeggingCardDatas } from "./getPeggingCardData";
import { Box, Point, Positions, matchLayoutManager } from "./matchLayoutManager";
import { getDealerPositions } from "./getDealerPositions";
import {
  FlipAnimation,
  FlipCard,
  FlipCardAnimationSequence,
  FlipCardProps,
} from "../FlipCard/FlipCard";
import { dealThenDiscardIfRequired } from "./initialDealThenDiscardIfRequired";
import {
  getDiscardToBoxSegment,
  getMoveRotateSegment,
} from "./animationSegments";
import { AnimationManager } from "./AnimationManager";
import { OnComplete } from "../fixAnimationSequence/common-motion-types";
import { AnimatedCribBoard } from "../crib-board/AnimatedCribBoard";
import cribBoardWoodUrl from "../cribBoardWoodUrl";
import { ColouredScore, ColouredScores } from "../crib-board/CribBoard";
import { useOverflowHidden } from "../hooks/useOverflowHidden";
import { MatchDetail } from "../App";
import { getDiscardToBoxZIndexStartSegment } from "./getDiscardToBoxZIndexStartSegment";
import { usePeggingOverlay } from "./usePeggingOverlay";
import { useMyControl } from "./useMyControl";
import { createZIndexAnimationSegment, zIndexAnimationDuration } from "./createZIndexAnimationSegment";
import { getCardValue } from "./getCardValue";
import { useSnackbar } from "notistack";

export type PlayMatchCribClientMethods = Pick<
  CribClient,
  "discard" | "ready" | "peg"
>;
// mapped type from PlayMatchCribClientMethods that omits the 'matchId' parameter
export type PlayMatchCribClient = {
  [K in keyof PlayMatchCribClientMethods]: PlayMatchCribClientMethods[K] extends (
    ...args: infer P
  ) => void
    ? (...args: P) => void
    : never;
};

type PlayMatchCribHubMethods = Pick<CribHub, "discard" | "peg" | "ready">;
//mapped type to remove matchId parameter from PlayMatchCribHubMethods
export type PlayMatchCribHub = {
  [Property in keyof PlayMatchCribHubMethods]: PlayMatchCribHubMethods[Property] extends (
    matchId: string,
    ...args: infer P
  ) => void
    ? (...args: P) => void
    : never;
};

const cardMatch = (playingCard1:PlayingCard, playingCard2:PlayingCard) => {
  return playingCard1.suit === playingCard2.suit &&
  playingCard1.pips === playingCard2.pips
}

function getBoxPosition(myMatch: MyMatch, positions: Positions) {
  const dealerPositions = getDealerPositions(
    myMatch.myId,
    myMatch.dealerDetails.current,
    positions.playerPositions,
    myMatch.otherPlayers.map((op) => op.id)
  );
  return dealerPositions.box;
}

export type UpdateLocalMatch = (localMatch: LocalMatch) => void;

export interface PlayMatchProps {
  matchDetail: MatchDetail;
  playMatchCribHub: PlayMatchCribHub;
  signalRRegistration: (playMatchCribClient: PlayMatchCribClient) => () => void;
  updateLocalMatch: UpdateLocalMatch;
  landscape: boolean;
  hasRenderedAMatch: boolean;
}

export enum FlipCardState {
  Todo,
  MyHand,
  OtherPlayersHand,
  PeggingInPlay,
  PeggingTurnedOver,
}
export type FlipCardData = Omit<FlipCardProps, "size"> & {
  state: FlipCardState;
};

export interface FlipCardDatas {
  cutCard: FlipCardData;
  additionalBoxCard: FlipCardData | undefined;
  bottomDeckCard: FlipCardData;
  myCards: FlipCardData[];
  otherPlayersCards: FlipCardData[][];
}

const discardDuration = 0.5;
const flipDuration = 0.5;

const colours: CSSProperties["color"][] = ["red", "blue", "green"];
function getColouredScore(score: Score, index: number): ColouredScore {
  return {
    frontPeg: score.frontPeg,
    backPeg: score.backPeg,
    gameScore: score.games,
    colour: colours[index],
  };
}
function getColouredScores(scores: Score[]): ColouredScores {
  return {
    pegger1: getColouredScore(scores[0], 0),
    pegger2: getColouredScore(scores[1], 1),
    pegger3: scores.length === 3 ? getColouredScore(scores[2], 2) : undefined,
  };
}

interface CribBoardState {
  colouredScores: ColouredScores;
  onComplete?: OnComplete;
}

const getPeggingCount = (myMatch: MyMatch): number => {
  if (myMatch.gameState === CribGameState.Pegging) {
    const inPlayCards = myMatch.pegging.inPlayCards;
    let sum = 0;
    inPlayCards.forEach((inPlayCard) => {
      sum += getCardValue(inPlayCard.playingCard.pips);
    });
    return sum;
  }
  return 0;
};

const getAppendMessage = () => {
  let message = "";
  const apppendMessage = (messageToAppend: string) => {
    if(message.length > 0){
      //lowercase the first letter
      messageToAppend = messageToAppend[0].toLowerCase() + messageToAppend.slice(1);
      messageToAppend = `, ${messageToAppend}`;
    }
    message += messageToAppend;
  }
  return [apppendMessage,() => message] as const;
}

const getOfAKindScore = (numOfAKind:number) => {
  let ofAKindScore = 0
  switch(numOfAKind){
    case 2:
      ofAKindScore = 2;
      break;
    case 3:
      ofAKindScore = 6;
      break;
    case 4:
      ofAKindScore = 12;
      break;
  }
  return ofAKindScore;
}

const append15Or31 = (pegScoring: PegScoring,appendMessage:(messageToAppend:string) => void) => {
  if(pegScoring.is15){
    appendMessage("15 for 2");
  } else  if(pegScoring.is31){
    appendMessage("31 for 2");
  }
}

const getPeggedScoreMessage = (pegScoring: PegScoring,pips:Pips): string => {
  const [appendMessage, getMessage] = getAppendMessage();
  append15Or31(pegScoring,appendMessage)
  if(pegScoring.numOfAKind >= 2){
    const ofAKindScore = getOfAKindScore(pegScoring.numOfAKind)
    appendMessage(`${pegScoring.numOfAKind}x${pips} for ${ofAKindScore}`);
  } else if(pegScoring.numCardsInRun >= 3){
    // could generate Ace, Two, Three....
    appendMessage(`Run of ${pegScoring.numCardsInRun} for ${pegScoring.numCardsInRun}`);
  }
  if(pegScoring.isLastGo){
    appendMessage("One for Go");
  }
  return getMessage();
}

const addFlipMoveToTurnedOverPositionAnimationSequence = (
  flipCardData:FlipCardData,
  turnedOverCardIndex:number,
  numTurnedOverCardsFromBefore:number,
  numCardsTurningOver:number,
  delay:number,
  turnedOverPosition:Point
):void => {
  // greater turnedOverCardIndex lower the zIndex animation
  const newZIndex = 50 + numTurnedOverCardsFromBefore - turnedOverCardIndex;
  // move higher index first
  const at = delay + ((numCardsTurningOver - turnedOverCardIndex - 1) * ( discardDuration + flipDuration + zIndexAnimationDuration));
  const flipAnimation:FlipAnimation = {
    flip:true,
    duration:flipDuration,
  }
  const segments =  [
    createZIndexAnimationSegment(newZIndex,{at}),
    flipAnimation,
    getMoveRotateSegment(false,turnedOverPosition,discardDuration)
  ]
  if(flipCardData.animationSequence){
    flipCardData.animationSequence.push(...segments);
  }else{
    flipCardData.animationSequence = segments;
  }
}

function PlayMatchInner({
  matchDetail,
  playMatchCribHub,
  signalRRegistration,
  updateLocalMatch,
  landscape,
  hasRenderedAMatch,
}: PlayMatchProps) {
  const myMatch = matchDetail.match;
  const { enqueueSnackbar } = useSnackbar();
  const initiallyRendered = useRef(false);
  const [cardDatas, setCardDatas] = useState<FlipCardDatas | undefined>(
    undefined
  );
  // todo - used for my discard behaviour - will need to fully consider setGameState
  const [gameState, setGameState] = useState<CribGameState>(
    matchDetail.match.gameState
  );
  const [nextPlayer, setNextPlayer] = useState<string | undefined>(
    matchDetail.match.pegging.nextPlayer
  );
  const [cribBoardState, setCribBoardState] = useState<CribBoardState>({
    colouredScores: getColouredScores(myMatch.scores),
  });

  const cardDatasRef = useRef<FlipCardDatas | undefined>(cardDatas);
  // for when there are no animations
  const setCardDatasAndRef = useCallback((newCardDatas: FlipCardDatas) => {
    cardDatasRef.current = newCardDatas;
    setCardDatas(newCardDatas);
  }, []);

  const animationManager = useRef(
    new AnimationManager((setter) => {
      setCardDatas((prevCardDatas) => {
        const newCardDatas = setter(prevCardDatas);
        cardDatasRef.current = newCardDatas;
        return newCardDatas;
      });
    })
  );

  const { cribBoardSize, playAreaSize, styles } = useMemo(
    () => getOrientationDependentValues(landscape),
    [landscape]
  );
  const [positions, cardSize] = useMemo(() => {
    const positionsAndCardSize = matchLayoutManager.getPositionsAndCardSize(
      playAreaSize.width,
      playAreaSize.height,
      myMatch,
      {
        peggingOverlayPercentage: 0.15,
        cardHeightWidthRatio: 88 / 63, // matching the current svg ( poker sized )
        paddingCardPercentage: 0.05,
        deckAndBoxInMiddle: true, //todo options
      }
    );
    return positionsAndCardSize;
  }, [myMatch, playAreaSize]);
  const mappedFlipCardDatas = useMemo(() => {
    if (cardDatas === undefined) {
      return [];
    }

    const flattenedOtherPlayerCards = cardDatas.otherPlayersCards.flat();
    const additionalBoxCard = cardDatas.additionalBoxCard
      ? [cardDatas.additionalBoxCard]
      : [];
    return [
      cardDatas.cutCard,
      ...additionalBoxCard,
      cardDatas.bottomDeckCard,
      ...cardDatas.myCards,
      ...flattenedOtherPlayerCards,
    ];
  }, [cardDatas]);

  const flipCards = useMemo(() => {
    return mappedFlipCardDatas.map((cardData, i) => (
      <FlipCard key={i} {...cardData} size={cardSize} />
    ));
  }, [cardSize, mappedFlipCardDatas]);

  const [peggingOverlay, bind] = usePeggingOverlay({
    cardSize,
    flipCardDatas: mappedFlipCardDatas,
    gameState,
  });

  const [myDiscardOverlay, removeMyDiscardSelection, allowPegging] = useMyControl(
    <div
      {...bind()}
      style={{
        perspective: 5000,
        ...styles.cardsShiftStyle,
        touchAction: "none",
      }}
    >
      {flipCards}
    </div>,
    getNumDiscards(myMatch),
    playMatchCribHub.discard,
    cardDatas,
    playMatchCribHub.peg,
    getPeggingCount(myMatch),
    gameState,
    nextPlayer === myMatch.myId
  );

  useOverflowHidden();
  useEffect(() => {
    return signalRRegistration({
      discard(playerId, myMatch) {
        function getNew(
          prevCardDatas: FlipCardDatas,
          discardDuration: number,
          secondDiscardDelay: number,
          cardFlipDuration: number,
          animationCompleteCallback: () => void
        ): FlipCardDatas {
          const syncChangeHistories = () => {
            const newLocalMatch: LocalMatch = {
              ...matchDetail.localMatch,
              changeHistory: {
                ...myMatch.changeHistory,
                lastChangeDate: new Date(),
              },
            };
            updateLocalMatch(newLocalMatch);
          };
          const complete = () => {
            animationCompleteCallback && animationCompleteCallback();
            syncChangeHistories();
          };
          const iDiscarded = playerId === myMatch.myId;

          const prevFlipCardDatas = prevCardDatas as FlipCardDatas;

          const numDiscards = myMatch.otherPlayers.length + 1 === 2 ? 2 : 1;

          const boxPosition = getBoxPosition(myMatch, positions);

          const cardFlipDelay =
            discardDuration + (numDiscards - 1) * secondDiscardDelay;

          let countDiscards = 0;
          const getDiscardToBoxCardData = (
            boxPosition: Box,
            prevCardData: FlipCardData,
            onComplete?: OnComplete | undefined
          ) => {
            const newCardData = { ...prevCardData };
            newCardData.animationSequence = [
              getDiscardToBoxZIndexStartSegment(myMatch, countDiscards),
              getDiscardToBoxSegment(
                boxPosition,
                discardDuration,
                countDiscards * secondDiscardDelay,
                undefined,
                onComplete
              ),
            ];
            return newCardData;
          };

          const getCutCardAnimationData = (
            prevCardData: FlipCardData,
            isJack: boolean
          ) => {
            const newCardData = { ...prevCardData };
            newCardData.playingCard = myMatch.cutCard;
            const flipAnimation: FlipAnimation = {
              flip: true,
              duration: cardFlipDuration,
              at: cardFlipDelay + (iDiscarded ? cardFlipDuration : 0),
              onComplete: () => {
                let requiresCompletion = true;
                if (isJack) {
                  if (myMatch.gameState === CribGameState.Pegging) {
                    requiresCompletion = false;
                    setCribBoardState({
                      colouredScores: getColouredScores(myMatch.scores),
                      onComplete() {
                        complete();
                      },
                    });
                  } else {
                    throw new Error("Not implemented");
                  }
                }
                if (requiresCompletion) {
                  complete();
                }
              },
            };
            newCardData.animationSequence = [flipAnimation];
            return newCardData;
          };

          let newFlipCardDatas: FlipCardDatas;
          
          if (iDiscarded) {
            removeMyDiscardSelection();
            newFlipCardDatas = {
              ...prevFlipCardDatas,
              myCards: prevFlipCardDatas.myCards.map((prevCardData) => {
                const playingCard = prevCardData.playingCard as PlayingCard;
                if (
                  !myMatch.myCards.some((myCard) => {
                    return cardMatch(myCard, playingCard);
                  })
                ) {
                  countDiscards++;
                  const discardToBoxCardData = getDiscardToBoxCardData(
                    boxPosition,
                    prevCardData,
                    countDiscards === numDiscards && !myMatch.cutCard
                      ? complete
                      : undefined
                  );
                  const flipAnimation: FlipAnimation = {
                    flip: true,
                    duration: cardFlipDuration,
                  };
                  (
                    discardToBoxCardData.animationSequence as FlipCardAnimationSequence
                  ).unshift(flipAnimation);
                  return discardToBoxCardData;
                } else {
                  return prevCardData;
                }
              }),
            };
          } else {
            const discardedIndex = myMatch.otherPlayers.findIndex(
              (otherPlayer) => otherPlayer.id === playerId
            );
            const prevOtherPlayerCardDatas =
              prevFlipCardDatas.otherPlayersCards[discardedIndex];

            const newDiscarderCardDatas = prevOtherPlayerCardDatas.map(
              (prevCardData) => {
                if (countDiscards < numDiscards) {
                  countDiscards++;
                  const newData = getDiscardToBoxCardData(
                    boxPosition,
                    prevCardData,
                    countDiscards === numDiscards && !myMatch.cutCard
                      ? complete
                      : undefined
                  );
                  return newData;
                }
                return prevCardData;
              }
            );

            const newOtherPlayersCards =
              prevFlipCardDatas.otherPlayersCards.map((otherPlayerCards, i) => {
                if (i === discardedIndex) {
                  return newDiscarderCardDatas;
                }
                return otherPlayerCards;
              });

            newFlipCardDatas = {
              ...prevFlipCardDatas,
              otherPlayersCards: newOtherPlayersCards,
            };
          }

          if (myMatch.cutCard) {
            newFlipCardDatas.cutCard = getCutCardAnimationData(
              prevFlipCardDatas.cutCard,
              myMatch.cutCard.pips === Pips.Jack
            );
          }
          return newFlipCardDatas;
        }

        animationManager.current.animate(
          (animationCompleteCallback, prevFlipCardDatas) => {
            setGameState(myMatch.gameState);
            return getNew(
              prevFlipCardDatas as FlipCardDatas,
              discardDuration,
              0,
              flipDuration,
              animationCompleteCallback
            );
          }
        );
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      peg(playerId, peggedPlayingCard, myMatch) {
        allowPegging();
        setNextPlayer(myMatch.pegging.nextPlayer); //????????????????????????????????????
        const numCardsInState = (
          flipCards: FlipCardData[],
          state: FlipCardState
        ) => {
          return flipCards.filter((cardData) => cardData.state === state)
            .length;
        };
        const numPeggingInPlayCards = (flipCards: FlipCardData[]) => {
          return numCardsInState(flipCards, FlipCardState.PeggingInPlay);
        };

        const getPeggedCardPositionIndex = (
          prevFlipCardDatas: FlipCardDatas
        ): number => {
          return (
            numPeggingInPlayCards(prevFlipCardDatas.myCards) +
            numPeggingInPlayCards(prevFlipCardDatas.otherPlayersCards.flat())
          );
        };
        let peggedCard:PeggedCard;
        if(myMatch.pegging.inPlayCards.length === 0){
          peggedCard = myMatch.pegging.turnedOverCards[myMatch.pegging.turnedOverCards.length - 1]
        }else{
          peggedCard = myMatch.pegging.inPlayCards[myMatch.pegging.inPlayCards.length - 1]
        }
        animationManager.current.animate(
          (animationCompleteCallback, prevFlipCardDatas) => {
            prevFlipCardDatas = prevFlipCardDatas as FlipCardDatas;

            const isMe = myMatch.myId === playerId;
            const newFlipCardDatas = { ...prevFlipCardDatas };
            const peggedCardPosition = getPeggedCardPositionIndex(prevFlipCardDatas);
            const peggingPosition =
              positions.peggingPositions.inPlay[peggedCardPosition];

            let delay = discardDuration + zIndexAnimationDuration;
            const getMoveToPeggingPositionAnimationSequence =
              (): FlipCardAnimationSequence => {
                return [
                  createZIndexAnimationSegment(5 + peggedCardPosition, {}),
                  getMoveRotateSegment(
                    false,
                    peggingPosition,
                    discardDuration,
                    undefined,
                    undefined,
                    // eslint-disable-next-line complexity
                    () => {
                      const peggingScore = peggedCard.peggingScore;
                      if (peggingScore.score > 0) {
                        enqueueSnackbar(getPeggedScoreMessage(peggingScore,peggedCard.playingCard.pips), {
                          variant: "success",
                        });
                        switch(myMatch.gameState){
                          case CribGameState.GameWon:
                          case CribGameState.MatchWon:
                            // todo - pegs are reset so need to determine score
                            break;
                          case CribGameState.Show:
                            // todo
                            break;
                          case CribGameState.Pegging:
                            setCribBoardState({
                              colouredScores: getColouredScores(myMatch.scores),
                            });
                        }
                        
                      }
                      // todo updating local state and refactor
                      animationCompleteCallback();
                    }
                  ),
                ];
              };

            

            if (isMe) {
              // if selection adds an animation will need to remove
              const newMyFlipCardDatas = prevFlipCardDatas.myCards.map(
                (prevCardData) => {
                  const playingCard = prevCardData.playingCard as PlayingCard;
                  if (
                    playingCard &&
                    cardMatch(playingCard, peggedPlayingCard)
                  ) {
                    const newCardData = {
                      ...prevCardData,
                    };
                    newCardData.state = FlipCardState.PeggingInPlay;
                    newCardData.animationSequence =
                      getMoveToPeggingPositionAnimationSequence();
                    return newCardData;
                  } else {
                    return prevCardData;
                  }
                }
              );
              newFlipCardDatas.myCards = newMyFlipCardDatas;
            } else {
              const peggerIndex = myMatch.otherPlayers.findIndex(
                (otherPlayer) => otherPlayer.id === playerId
              );
              const prevOtherPlayerCardDatas =
                prevFlipCardDatas.otherPlayersCards[peggerIndex];

              let done = false;
              const newOtherPlayerCardDatas = prevOtherPlayerCardDatas.map(
                (prevCardData) => {
                  if (
                    !done &&
                    prevCardData.state === FlipCardState.OtherPlayersHand
                  ) {
                    done = true;
                    const newCardData = { ...prevCardData };
                    newCardData.state = FlipCardState.PeggingInPlay;
                    newCardData.playingCard = peggedPlayingCard;
                    const animationSequence =
                      getMoveToPeggingPositionAnimationSequence();
                    animationSequence.unshift({
                      flip: true,
                      duration: flipDuration,
                    } as FlipAnimation);
                    delay += flipDuration;
                    newCardData.animationSequence = animationSequence;
                    return newCardData;
                  }
                  return prevCardData;
                }
              );

              const newOtherPlayersCards =
                prevFlipCardDatas.otherPlayersCards.map(
                  (otherPlayerCards, i) => {
                    if (i === peggerIndex) {
                      return newOtherPlayerCardDatas;
                    }
                    return otherPlayerCards;
                  }
                );
              newFlipCardDatas.otherPlayersCards = newOtherPlayersCards;
            }
            // todo above - state has been set to PeggingInPlay when should be PeggingTurnedOver when turn over
            if(myMatch.gameState === CribGameState.Pegging && peggedCard.peggingScore.is31){
              const numTurnedOverCardsFromBefore = prevFlipCardDatas.myCards.concat(prevFlipCardDatas.otherPlayersCards.flat()).filter((cardData) => {
                return cardData.state === FlipCardState.PeggingTurnedOver;
              }).length;
              

              const addFlipMoveToTurnedOverPositionAnimationSequenceToTurnedOverCards = (newFlipCardDatas:FlipCardData[]) => {
                newFlipCardDatas.forEach(
                  (newFlipCardData) => {
                    if(newFlipCardData.state === FlipCardState.PeggingInPlay){
                      const turnedOverCardIndex = myMatch.pegging.turnedOverCards.findIndex((turnedOverCard) => {
                        return cardMatch(turnedOverCard.playingCard,newFlipCardData.playingCard as PlayingCard)
                      });
                      if(turnedOverCardIndex !== -1){
                        addFlipMoveToTurnedOverPositionAnimationSequence(
                          newFlipCardData,
                          turnedOverCardIndex,
                          numTurnedOverCardsFromBefore,
                          myMatch.pegging.turnedOverCards.length - numTurnedOverCardsFromBefore,
                          delay,
                          positions.peggingPositions.turnedOver
                          );
                      }
                    }
                  });
              }
              
              addFlipMoveToTurnedOverPositionAnimationSequenceToTurnedOverCards(newFlipCardDatas.myCards);
              newFlipCardDatas.otherPlayersCards.forEach((otherPlayerCards) => {
                 addFlipMoveToTurnedOverPositionAnimationSequenceToTurnedOverCards(otherPlayerCards);
              });
            }
            return newFlipCardDatas;
          }
        );
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ready(playerId) {
        //
      },
    });
  }, [signalRRegistration, matchDetail, positions, updateLocalMatch, removeMyDiscardSelection, enqueueSnackbar, allowPegging]);

  /* eslint-disable complexity */
  useEffect(() => {
    const localMatch = matchDetail.localMatch;
    const myMatch = matchDetail.match;
    // need to prevent re-renders from setting state in here causing a loop
    if (!initiallyRendered.current) {
      if (
        matchDetail.localMatch.changeHistory.numberOfActions ===
        dealActionIndicator
      ) {
        window.setTimeout(
          () => {
            animationManager.current.animate((animationCompleteCallback) => {
              return dealThenDiscardIfRequired(
                matchDetail,
                positions,
                updateLocalMatch,
                { dealDuration: 0.5, flipDuration, discardDuration },
                animationCompleteCallback
              );
            });
          },
          hasRenderedAMatch ? 0 : 2000
        );
      } else if (
        localMatch.changeHistory.numberOfActions ===
        myMatch.changeHistory.numberOfActions
      ) {
        // no animations required
        switch (myMatch.gameState) {
          case CribGameState.Discard:
            setCardDatasAndRef(getDiscardCardDatas(myMatch, positions));
            break;
          case CribGameState.Pegging:
            setCardDatasAndRef(getPeggingCardDatas(myMatch, positions));
            break;
          default:
            throw new Error("Not implemented !");
        }
      } else {
        const breakHere = true;
      }
      initiallyRendered.current = true;
    }
  }, [
    positions,
    matchDetail,
    setCardDatasAndRef,
    updateLocalMatch,
    hasRenderedAMatch,
  ]);

  return (
    <>
      <div style={styles.cribBoardStyle}>
        <AnimatedCribBoard
          cribBoardUrl={cribBoardWoodUrl}
          pegHoleRadius={0.05}
          pegRadius={0.09}
          pegTrackBoxPaddingPercentage={0.3}
          height={cribBoardSize.height}
          width={cribBoardSize.width}
          pegHorizontalSpacing={0.3}
          pegPadding={0.1}
          strokeWidth={0.05}
          colouredScores={cribBoardState.colouredScores}
          onComplete={cribBoardState.onComplete}
        />
      </div>
      {peggingOverlay}
      {myDiscardOverlay}
    </>
  );
}

function getSize(isLandscape: boolean, cribBoardWidth: number) {
  if (isLandscape) {
    return {
      width: window.innerWidth - cribBoardWidth,
      height: window.innerHeight,
    };
  } else {
    return {
      width: window.innerWidth,
      height: window.innerHeight - cribBoardWidth,
    };
  }
}

function getCribBoardSize(landscape: boolean, ratio: number) {
  const height = landscape ? window.innerHeight : window.innerWidth;
  const width = height * ratio;
  return { height, width };
}

function getOrientationDependentValues(landscape: boolean) {
  const cribBoardSize = getCribBoardSize(landscape, 0.35);
  const playAreaSize = getSize(landscape, cribBoardSize.width);
  const styles = getOrientationDependentStyles(landscape, cribBoardSize.width);
  return { cribBoardSize, playAreaSize, styles };
}

function getOrientationDependentStyles(
  landscape: boolean,
  cribBoardWidth: number
) {
  const cribBoardPortraitStyle: CSSProperties = {
    position: "absolute",
    transform: `translateX(${window.innerWidth}px) rotate(90deg)`,
    transformOrigin: "left top",
  };
  const cribBoardLandscapeStyle: CSSProperties = {
    position: "absolute",
    right: 0,
  };
  const cribBoardStyle = landscape
    ? cribBoardLandscapeStyle
    : cribBoardPortraitStyle;
  const cardsShiftStyle = landscape
    ? {}
    : { transform: `translateY(${cribBoardWidth}px)` };

  return { cribBoardStyle, cardsShiftStyle };
}

function getNumDiscards(myMatch: MyMatch) {
  return myMatch.otherPlayers.length === 1 ? 2 : 1;
}

export const PlayMatch = memo(PlayMatchInner, (prevProps, nextProps) => {
  return (
    prevProps.matchDetail.localMatch.id === nextProps.matchDetail.localMatch.id
  );
});
