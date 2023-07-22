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
  OtherPlayer,
  PegScoring,
  PeggedCard,
  Pips,
  PlayerShowScore,
  PlayingCard,
  Score,
  ShowScore,
  ShowScoring,
} from "../generatedTypes";
import { LocalMatch, dealActionIndicator } from "../LocalMatch";
import { getDiscardCardDatas } from "./getDiscardCardData";
import { getPeggingCardDatas } from "./getPeggingCardData";
import {
  Box,
  DiscardPositions,
  Point,
  Positions,
  matchLayoutManager,
} from "./matchLayoutManager";
import {
  getPlayerPositionIndex,
  getPlayerPositions,
  getPlayerScoreIndex,
} from "./getPlayerPositions";
import {
  DomSegmentOptionalElementOrSelectorWithOptions,
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
import {
  createZIndexAnimationSegment,
  instantAnimationDuration,
} from "./createZIndexAnimationSegment";
import { getCardValue } from "./getCardValue";
import {
  getLastPeggedCard,
  getPeggedCardPositionIndex,
  getTurnOverOrder,
} from "./signalRPeg";
import { useSnackbarWithDelay } from "../hooks/useSnackbarWithDelay";
import { PlayingCardLookupFlipCardData } from "./PlayingCardLookupFlipCardData";

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

const cardMatch = (playingCard1: PlayingCard, playingCard2: PlayingCard) => {
  return (
    playingCard1.suit === playingCard2.suit &&
    playingCard1.pips === playingCard2.pips
  );
};

function getBoxPosition(myMatch: MyMatch, positions: Positions) {
  const dealerPositions = getPlayerPositions(
    myMatch.myId,
    myMatch.dealerDetails.current,
    positions.playerPositions,
    myMatch.otherPlayers
  );
  return dealerPositions.box;
}

function shouldDeal(matchDetail: MatchDetail) {
  return (
    matchDetail.localMatch.changeHistory.numberOfActions === dealActionIndicator
  );
}

function noNewActions(matchDetail: MatchDetail) {
  return (
    matchDetail.localMatch.changeHistory.numberOfActions ===
    matchDetail.match.changeHistory.numberOfActions
  );
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
    if (message.length > 0) {
      //lowercase the first letter
      messageToAppend =
        messageToAppend[0].toLowerCase() + messageToAppend.slice(1);
      messageToAppend = `, ${messageToAppend}`;
    }
    message += messageToAppend;
  };
  return [apppendMessage, () => message] as const;
};

const getOfAKindScore = (numOfAKind: number) => {
  let ofAKindScore = 0;
  switch (numOfAKind) {
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
};

const append15Or31 = (
  pegScoring: PegScoring,
  appendMessage: (messageToAppend: string) => void
) => {
  if (pegScoring.is15) {
    appendMessage("15 for 2");
  } else if (pegScoring.is31) {
    appendMessage("31 for 2");
  }
};

const getPeggedScoreMessage = (pegScoring: PegScoring, pips: Pips): string => {
  const [appendMessage, getMessage] = getAppendMessage();
  append15Or31(pegScoring, appendMessage);
  if (pegScoring.numOfAKind >= 2) {
    const ofAKindScore = getOfAKindScore(pegScoring.numOfAKind);
    appendMessage(`${pegScoring.numOfAKind}x${pips} for ${ofAKindScore}`);
  } else if (pegScoring.numCardsInRun >= 3) {
    // could generate Ace, Two, Three....
    appendMessage(
      `Run of ${pegScoring.numCardsInRun} for ${pegScoring.numCardsInRun}`
    );
  }
  if (pegScoring.isLastGo) {
    appendMessage("One for Go");
  }
  return getMessage();
};

const addFlipMoveToTurnedOverPositionAnimationSequence = (
  flipCardData: FlipCardData,
  turnedOverCardIndex: number,
  numTurnedOverCardsFromBefore: number,
  numCardsTurningOver: number,
  delay: number,
  turnedOverPosition: Point,
  onComplete: OnComplete
): void => {
  const positionFromTop =
    numTurnedOverCardsFromBefore +
    numCardsTurningOver -
    turnedOverCardIndex -
    1;
  // later pegged lower the zindex
  const turnedOverZIndex =
    50 + numTurnedOverCardsFromBefore + 1 + positionFromTop;
  // move later pegged first
  const at =
    delay +
    positionFromTop *
      (discardDuration + flipDuration + instantAnimationDuration);
  const flipAnimation: FlipAnimation = {
    flip: true,
    duration: flipDuration,
  };
  const segments = [
    createZIndexAnimationSegment(turnedOverZIndex, { at }),
    flipAnimation,
    getMoveRotateSegment(
      false,
      turnedOverPosition,
      discardDuration,
      undefined,
      undefined,
      onComplete
    ),
  ];
  if (flipCardData.animationSequence) {
    flipCardData.animationSequence.push(...segments);
  } else {
    flipCardData.animationSequence = segments;
  }
};

function getTeamShowScore(pegger: string, myMatch: MyMatch): number {
  const isMe = pegger === myMatch.myId;
  if (isMe) {
    return (
      getPeggerShowScore(pegger, myMatch) +
      getPeggerShowScore(myMatch.otherPlayers[1].id, myMatch)
    );
  }
  return (
    getPeggerShowScore(myMatch.otherPlayers[0].id, myMatch) +
    getPeggerShowScore(myMatch.otherPlayers[2].id, myMatch)
  );
}

function getPeggerBoxScore(pegger: string, myMatch: MyMatch): number {
  const dealer = myMatch.dealerDetails.current;
  const boxScore = myMatch.showScoring.boxScore.score;
  return pegger === dealer ? boxScore : 0;
}

function getPeggerShowScore(pegger: string, myMatch: MyMatch): number {
  const showScoring = myMatch.showScoring;
  const playerShowScore = showScoring.playerShowScores.find(
    (playerShowScore) => playerShowScore.playerId === pegger
  ) as PlayerShowScore;
  const playerBoxScore = getPeggerBoxScore(pegger, myMatch);
  return playerShowScore.showScore.score + playerBoxScore;
}

// todo - this needs to change as need to remove show scores for non pegger
function getPeggedScoreWhenShowState(peggedCard: PeggedCard, myMatch: MyMatch) {
  const teamGame = myMatch.otherPlayers.length === 3;
  const scorer = teamGame ? getTeamShowScore : getPeggerShowScore;
  const pegger = peggedCard.owner;
  const showScore = scorer(pegger, myMatch);

  const peggerScoreIndex = getPlayerScoreIndex(
    pegger,
    myMatch.myId,
    myMatch.otherPlayers,
    teamGame
  );
  return myMatch.scores.map((score, index) => {
    const isPegger = index === peggerScoreIndex;
    if (isPegger) {
      return {
        ...score,
        frontPeg: score.frontPeg - showScore,
        backPeg: score.backPeg - showScore,
      };
    }
    return score;
  });
}

function getPeggedScores(peggedCard: PeggedCard, myMatch: MyMatch): Score[] {
  switch (myMatch.gameState) {
    case CribGameState.Show:
      return getPeggedScoreWhenShowState(peggedCard, myMatch);
    default:
      return myMatch.scores;
  }
}



function cloneScore(score:Score):Score {
  return {
    ...score
  }
}
function cloneScores(scores:Score[]):Score[]{
  return scores.map(score => cloneScore(score));
}

/*
 scores [f:100:b:50], [f:80:b:20]
                                                     want the score to be  
                     teampegger ( team dealer), team non dealer -           teampegger ( team dealer), team non dealer
peg 5                5                          0                           shifted 5 from fs - 19     shifted 0 ( no change ) from fs - 6
-- scoring
team non dealer  2   5                          2                           no change                  shifted 2 from before
team dealer      3   8                          2                           shifted 3 from 1st or 8        no change
team non dealer  4   8                          6
team dealer      5   13                         6
-------
team dealer box  6   19                         6    

if run backwards in playerScores then take away from the last one ( first time is total ) - then can move the pegs properly.
*/



interface SplitPeggingShowScores{
  peggingScores:Score[],
  showScores:Score[][] // one for when scoring each player in turn order

  boxScores:Score[]
}

function shiftScoreBack(score:Score, amount:number): Score {
  return {
    games:score.games,
    frontPeg:score.backPeg,
    backPeg:score.frontPeg - amount
  }
}

function getTeamTotalScored(
  peggedCard:PeggedCard,
  showScoring:ShowScoring,
  scores:Score[],
  myId:string,
  otherPlayers:OtherPlayer[]
){
  const peggingScore = peggedCard.peggingScore.score;

  let teamNonBoxScores = showScoring.playerShowScores[0].showScore.score + showScoring.playerShowScores[2].showScore.score;
  const teamNonBoxFullScore = scores[getPlayerScoreIndex(showScoring.playerShowScores[0].playerId,myId,otherPlayers, true)]
  let teamNonBoxRunningTotal = 0

  let teamBoxScores = showScoring.playerShowScores[1].showScore.score + showScoring.playerShowScores[3].showScore.score + showScoring.boxScore.score;
  const teamBoxFullScore = scores[getPlayerScoreIndex(showScoring.playerShowScores[3].playerId,myId,otherPlayers, true)]
  let teamBoxRunningTotal = 0;

  const peggerIndex = showScoring.playerShowScores.map(psc => psc.playerId).indexOf(peggedCard.owner);
  if(peggerIndex === 0 || peggerIndex === 2){
    teamNonBoxScores += peggingScore;
    teamNonBoxRunningTotal = peggingScore;
  }else{
    teamBoxScores += peggingScore;
    teamBoxRunningTotal = peggingScore;
  }

  const scoresInReverse:Score[][] = [[teamBoxFullScore, teamNonBoxFullScore]]
  showScoring.playerShowScores.reverse().forEach((playerScore, index) => {
    const score = playerScore.showScore.score;

    const lastScores = scoresInReverse[scoresInReverse.length - 1];
    const lastTeamBoxScore = lastScores[0];
    const lastTeamNonBoxScore = lastScores[1];
    
    // as reversed the team with the box is first
    if(index === 2 || index === 0){
      scoresInReverse.push([shiftScoreBack(lastTeamBoxScore,score),cloneScore(lastTeamNonBoxScore)])
    }else{
      scoresInReverse.push([cloneScore(lastTeamBoxScore),shiftScoreBack(lastTeamNonBoxScore,score)]);
    }
  });

  
  // do pegged last

  
}

function splitPeggingShowScoresForTeams(
  peggedCard:PeggedCard,
  showScoring:ShowScoring,
){

}

function splitPeggingShowScores(
  peggedCard:PeggedCard,
  showScoring:ShowScoring,
  scores:Score[],
  myId:string,
  otherPlayers:OtherPlayer[],
  isTeams:boolean
) :SplitPeggingShowScores {
  

  // if peg can shift backwards ?
  
  throw new Error("Not implemented");
  /* return {
    boxScores:scores,    
  } */
 
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
  const { enqueueSnackbar, delayEnqueueSnackbar } = useSnackbarWithDelay();
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

  const [myDiscardOverlay, removeMyDiscardSelection, allowPegging] =
    useMyControl(
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
                  const nibs = "nibs";
                  enqueueSnackbar(`Two for his ${nibs} !`, {
                    variant: "success",
                  });
                  requiresCompletion = false;
                  setCribBoardState({
                    colouredScores: getColouredScores(myMatch.scores),
                    onComplete() {
                      complete();
                    },
                  });
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
      peg(playerId, peggedPlayingCard, myMatch) {
        const peggingScored = (
          peggedCard: PeggedCard,
          cribBoardAnimationOnComplete?: () => void
        ) => {
          enqueueSnackbar(
            getPeggedScoreMessage(
              peggedCard.peggingScore,
              peggedCard.playingCard.pips
            ),
            {
              variant: "success",
            }
          );
          const peggedScores = getPeggedScores(peggedCard, myMatch);
          switch (myMatch.gameState) {
            case CribGameState.GameWon:
            case CribGameState.MatchWon:
              // todo - pegs are reset so need to determine score
              break;
            case CribGameState.Show:
            case CribGameState.Pegging:
              setCribBoardState({
                colouredScores: getColouredScores(peggedScores),
                onComplete: cribBoardAnimationOnComplete,
              });
          }
        };

        const getMoveToPeggingPositionAnimationSequence = (
          peggedCard: PeggedCard,
          peggedCardPosition: number,
          duration: number,
          animationCompleteCallback: () => void
        ): [FlipCardAnimationSequence, number] => {
          return [
            [
              createZIndexAnimationSegment(5 + peggedCardPosition, {}),
              getMoveRotateSegment(
                false,
                positions.peggingPositions.inPlay[peggedCardPosition],
                duration,
                undefined,
                undefined,
                () => {
                  const peggingScore = peggedCard.peggingScore;
                  if (peggingScore.score > 0) {
                    peggingScored(peggedCard, animationCompleteCallback);
                  } else {
                    animationCompleteCallback();
                  }
                }
              ),
            ],
            instantAnimationDuration + duration,
          ];
        };

        const ensurePeggingState = (cardData: FlipCardData) => {
          if (cardData.state !== FlipCardState.PeggingTurnedOver) {
            cardData.state = FlipCardState.PeggingInPlay;
          }
        };

        const iPegged = (
          newFlipCardDatas: FlipCardDatas,
          moveToPeggingPositionAnimationSequence: FlipCardAnimationSequence
        ) => {
          // if my pegging selection adds an animation will need to remove
          const newMyFlipCardDatas = newFlipCardDatas.myCards.map(
            (cardData) => {
              const playingCard = cardData.playingCard as PlayingCard;
              if (playingCard && cardMatch(playingCard, peggedPlayingCard)) {
                const newCardData = { ...cardData };
                ensurePeggingState(newCardData);
                newCardData.animationSequence =
                  moveToPeggingPositionAnimationSequence;
                return newCardData;
              } else {
                return cardData;
              }
            }
          );
          newFlipCardDatas.myCards = newMyFlipCardDatas;
        };

        const otherPlayerPegged = (
          prevFlipCardDatas: FlipCardDatas,
          newFlipCardDatas: FlipCardDatas,
          flipDuration: number,
          moveToPeggingPositionAnimationSequence: FlipCardAnimationSequence
        ) => {
          const peggerIndex = myMatch.otherPlayers.findIndex(
            (otherPlayer) => otherPlayer.id === playerId
          );
          const prevOtherPlayerCardDatas =
            prevFlipCardDatas.otherPlayersCards[peggerIndex];

          let newOtherPlayerCardDatas =
            newFlipCardDatas.otherPlayersCards[peggerIndex];

          let done = false;
          newOtherPlayerCardDatas = newOtherPlayerCardDatas.map(
            (cardData, i) => {
              if (
                !done &&
                prevOtherPlayerCardDatas[i].state ===
                  FlipCardState.OtherPlayersHand
              ) {
                done = true;
                const newCardData = { ...cardData };
                ensurePeggingState(newCardData);
                newCardData.playingCard = peggedPlayingCard;

                moveToPeggingPositionAnimationSequence.unshift({
                  flip: true,
                  duration: flipDuration,
                } as FlipAnimation);

                newCardData.animationSequence =
                  moveToPeggingPositionAnimationSequence;
                return newCardData;
              }
              return cardData;
            }
          );

          const newOtherPlayersCards = newFlipCardDatas.otherPlayersCards.map(
            (otherPlayerCards, i) => {
              if (i === peggerIndex) {
                return newOtherPlayerCardDatas;
              }
              return otherPlayerCards;
            }
          );
          newFlipCardDatas.otherPlayersCards = newOtherPlayersCards;
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const addTurnOverOneAtATimeAnimation = (
          prevFlipCardDatas: FlipCardDatas,
          newFlipCardDatas: FlipCardDatas,
          delay: number,
          onComplete: () => void
        ) => {
          const numTurnedOverCardsFromBefore = prevFlipCardDatas.myCards
            .concat(prevFlipCardDatas.otherPlayersCards.flat())
            .filter((cardData) => {
              return cardData.state === FlipCardState.PeggingTurnedOver;
            }).length;

          const addFlipMoveToTurnedOverPositionAnimationSequenceToTurnedOverCards =
            (newFlipCardDatas: FlipCardData[]) => {
              newFlipCardDatas.forEach((newFlipCardData) => {
                if (newFlipCardData.playingCard !== undefined) {
                  const turnedOverCardIndex =
                    myMatch.pegging.turnedOverCards.findIndex(
                      (turnedOverCard) => {
                        return cardMatch(
                          turnedOverCard.playingCard,
                          newFlipCardData.playingCard as PlayingCard
                        );
                      }
                    );
                  if (turnedOverCardIndex >= numTurnedOverCardsFromBefore) {
                    const lastToMove =
                      turnedOverCardIndex === numTurnedOverCardsFromBefore;
                    addFlipMoveToTurnedOverPositionAnimationSequence(
                      newFlipCardData,
                      turnedOverCardIndex,
                      numTurnedOverCardsFromBefore,
                      myMatch.pegging.turnedOverCards.length -
                        numTurnedOverCardsFromBefore,
                      delay,
                      positions.peggingPositions.turnedOver,
                      lastToMove ? onComplete : undefined
                    );
                  }
                }
              });
            };

          addFlipMoveToTurnedOverPositionAnimationSequenceToTurnedOverCards(
            newFlipCardDatas.otherPlayersCards
              .flat()
              .concat(newFlipCardDatas.myCards)
          );
        };

        const applyTurnOverTogetherAnimation = (
          flipCardData: FlipCardData,
          turnedOverCardIndex: number,
          numTurnedOverCardsFromBefore: number,
          numCardsTurningOver: number,
          delay: number,
          turnedOverPosition: Point,
          firstPeggedPosition: Point,
          overlayDuration: number,
          turnOverDuration: number,
          flipDuration: number,
          onComplete: OnComplete
        ): void => {
          const positionFromTop =
            numTurnedOverCardsFromBefore +
            numCardsTurningOver -
            turnedOverCardIndex -
            1;
          // later pegged lower the zindex
          const turnedOverZIndex =
            50 + numTurnedOverCardsFromBefore + 1 + positionFromTop;
          const isTop = positionFromTop === 0;

          const segments: FlipCardAnimationSequence = [
            getMoveRotateSegment(
              false,
              firstPeggedPosition,
              overlayDuration,
              undefined,
              delay,
              undefined
            ),
          ];

          if (!isTop) {
            const instantFlipAnimation: FlipAnimation = {
              flip: true,
              duration: instantAnimationDuration,
            };
            segments.push(instantFlipAnimation, [
              undefined,
              { opacity: 0 },
              { duration: instantAnimationDuration },
            ]);
          } else {
            const flipAnimation: FlipAnimation = {
              flip: true,
              duration: flipDuration,
            };
            segments.push(flipAnimation);
          }
          segments.push(
            createZIndexAnimationSegment(turnedOverZIndex, {
              at: delay + overlayDuration + flipDuration,
            }),
            getMoveRotateSegment(false, turnedOverPosition, turnOverDuration),
            [
              undefined,
              { opacity: 1 },
              {
                duration: instantAnimationDuration,
                onComplete: isTop ? onComplete : undefined,
              },
            ]
          );

          setOrAddToAnimationSequence(flipCardData, segments);
        };

        const addTurnOverTogetherAnimation = (
          prevFlipCardDatas: FlipCardDatas,
          newFlipCardDatas: FlipCardDatas,
          delay: number,
          onComplete: () => void
        ) => {
          const numTurnedOverCardsFromBefore = prevFlipCardDatas.myCards
            .concat(prevFlipCardDatas.otherPlayersCards.flat())
            .filter((cardData) => {
              return cardData.state === FlipCardState.PeggingTurnedOver;
            }).length;

          const addAnimationToTurnedOverCards = (
            newFlipCardDatas: FlipCardData[]
          ) => {
            newFlipCardDatas.forEach((newFlipCardData) => {
              if (newFlipCardData.playingCard !== undefined) {
                const turnedOverCardIndex =
                  myMatch.pegging.turnedOverCards.findIndex(
                    (turnedOverCard) => {
                      return cardMatch(
                        turnedOverCard.playingCard,
                        newFlipCardData.playingCard as PlayingCard
                      );
                    }
                  );
                if (turnedOverCardIndex >= numTurnedOverCardsFromBefore) {
                  applyTurnOverTogetherAnimation(
                    newFlipCardData,
                    turnedOverCardIndex,
                    numTurnedOverCardsFromBefore,
                    myMatch.pegging.turnedOverCards.length -
                      numTurnedOverCardsFromBefore,
                    delay,
                    positions.peggingPositions.turnedOver,
                    positions.peggingPositions.inPlay[0],
                    discardDuration,
                    discardDuration,
                    flipDuration,
                    onComplete
                  );
                }
              }
            });
          };

          addAnimationToTurnedOverCards(
            newFlipCardDatas.otherPlayersCards
              .flat()
              .concat(newFlipCardDatas.myCards)
          );
        };

        const createOnComplete = (
          additionalAnimation: boolean,
          animationCompleteCallback: () => void
        ) => {
          const numCompletesToComplete = additionalAnimation ? 2 : 1;
          let numCompleted = 0;
          return () => {
            numCompleted++;
            if (numCompleted === numCompletesToComplete) {
              animationCompleteCallback();
            }
          };
        };

        const setTurnedOver = (flipCardDatas: FlipCardDatas): FlipCardDatas => {
          const newFlipCardDatas = { ...flipCardDatas };
          newFlipCardDatas.myCards = newFlipCardDatas.myCards.map(
            (cardData) => {
              return {
                ...cardData,
                state: FlipCardState.PeggingTurnedOver,
              };
            }
          );
          newFlipCardDatas.otherPlayersCards =
            newFlipCardDatas.otherPlayersCards.map((otherPlayerCards) => {
              return otherPlayerCards.map((otherPlayerCard) => {
                return {
                  ...otherPlayerCard,
                  state: FlipCardState.PeggingTurnedOver,
                };
              });
            });
          return newFlipCardDatas;
        };

        const setOrAddToAnimationSequence = (
          flipCardData: FlipCardData,
          segments: FlipCardAnimationSequence
        ) => {
          if (flipCardData.animationSequence === undefined) {
            flipCardData.animationSequence = segments;
          } else {
            flipCardData.animationSequence.push(...segments);
          }
        };

        const createHideShowSegment = (
          hide: boolean
        ): DomSegmentOptionalElementOrSelectorWithOptions => {
          return [
            undefined,
            { opacity: hide ? 0 : 1 },
            { duration: instantAnimationDuration },
          ];
        };
        const returnedZIndex = -1;
        const returnTurnedOverCardsToPlayers = (
          cardsAndOwners: CardsAndOwners,
          at: number,
          flipDuration: number,
          returnDuration: number
        ): number => {
          const order = getTurnOverOrder(myMatch.pegging.turnedOverCards);
          const moveDelay = 0.2;

          cardsAndOwners.forEach((cardsAndOwner) => {
            const owner = cardsAndOwner.owner;
            const ownerCardsWithTurnOverOrderIndex = order
              .map((peggedCard, index) => ({ peggedCard, index }))
              .filter(
                (cardWithTurnOverOrderIndex) =>
                  cardWithTurnOverOrderIndex.peggedCard.owner === owner
              );

            const playerPosition =
              positions.playerPositions[
                getPlayerPositionIndex(
                  owner,
                  myMatch.myId,
                  myMatch.otherPlayers
                )
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
                const positionIndex =
                  ownerCardsWithTurnOverOrderIndex.findIndex(
                    (ownerCardWithTurnOverOrderIndex) =>
                      ownerCardWithTurnOverOrderIndex.index === index
                  );
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

        const returnInPlayCardsToPlayers = (
          cardsAndOwners: CardsAndOwners,
          at: number,
          returnDuration: number,
          onComplete: () => void
        ): number => {
          const inPlayCards = myMatch.pegging.inPlayCards;
          let numCardsReturned = 0;
          cardsAndOwners.forEach((cardsAndOwner) => {
            const owner = cardsAndOwner.owner;
            const handPosition =
              positions.playerPositions[
                getPlayerPositionIndex(
                  owner,
                  myMatch.myId,
                  myMatch.otherPlayers
                )
              ].discard;

            // should pass this in as parameter ?
            const ownerNumTurnedOver = myMatch.pegging.turnedOverCards.filter(
              (turnedOverCard) => turnedOverCard.owner === owner
            ).length;
            const startIndex = 4 - ownerNumTurnedOver - 1;

            const ownerCards = inPlayCards.filter((pc) => pc.owner === owner);

            cardsAndOwner.cards.forEach((flipCardData) => {
              if (flipCardData.state === FlipCardState.PeggingInPlay) {
                const peggedCardIndex = inPlayCards.findIndex((peggedCard) =>
                  cardMatch(
                    peggedCard.playingCard,
                    flipCardData.playingCard as PlayingCard
                  )
                );

                const ownerIndex = ownerCards.indexOf(
                  inPlayCards[peggedCardIndex]
                );
                // greater the index lower the position index
                const inPlayIndex = ownerCards.length - ownerIndex;

                const discardPositionIndex = startIndex + inPlayIndex;

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
        
        type CardsAndOwner = { cards: FlipCardData[]; owner: string };
        type CardsAndOwners = CardsAndOwner[];
        const getCardsWithOwners = (newFlipCardDatas: FlipCardDatas) => {
          const cardsAndOwners: CardsAndOwners = [
            {
              cards: newFlipCardDatas.myCards,
              owner: myMatch.myId,
            },
          ];
          myMatch.otherPlayers.forEach((otherPlayer, index) => {
            cardsAndOwners.push({
              owner: otherPlayer.id,
              cards: newFlipCardDatas.otherPlayersCards[index],
            });
          });
          return cardsAndOwners;
        };

        interface ShowScorePart {
          scoringCards: FlipCardData[];
          notScoringCards: FlipCardData[];
          score: number;
          /*
            todo - will have an option for specifying
            e.g
            Pair royal / Threes / Three of a kind
            Double pair / Fours / Four of a kind
            Run / x-card run
            Flush / x-card flush
            One for his nob

          */
          description: string;

          // add an id for sorting ?
        }

        type GetNotScoring = (
          contributingCards: PlayingCard[]
        ) => FlipCardData[];

        const addFifteenTwoShowScoreParts = (
          showScoreParts: ShowScorePart[],
          contributingCards: PlayingCard[][],
          getNotScoring: GetNotScoring,
          flipCardDataLookup: PlayingCardLookupFlipCardData
        ) => {
          contributingCards.forEach((playingCards) => {
            const showScorePart: ShowScorePart = {
              description: "Fifteen",
              score: 2,
              scoringCards: playingCards.map((playingCard) =>
                flipCardDataLookup.get(playingCard)
              ),
              notScoringCards: getNotScoring(playingCards),
            };
            showScoreParts.push(showScorePart);
          });
        };

        const getShowScoreParts = (
          showScore: ShowScore,
          scoringCardDatas: FlipCardData[]
        ): ShowScorePart[] => {
          const showScoreParts: ShowScorePart[] = [];
          const handAndCutCardPlayingCards = scoringCardDatas.map(
            (flipCardData) => flipCardData.playingCard as PlayingCard
          );
          const flipCardDataLookup = new PlayingCardLookupFlipCardData(
            scoringCardDatas
          );

          const getNotScoring: GetNotScoring = (contributingCards) => {
            return handAndCutCardPlayingCards
              .filter(
                (handOrCutCard) => !contributingCards.includes(handOrCutCard)
              )
              .map((notIncludedCard) =>
                flipCardDataLookup.get(notIncludedCard)
              );
          };
          //for now not sorting
          addFifteenTwoShowScoreParts(
            showScoreParts,
            showScore.fifteenTwos,
            getNotScoring,
            flipCardDataLookup
          );
          // todo remaining enough to do RAD
          return showScoreParts;
        };

        interface PlayerScoring {
          playerId: string;
          showScoreParts: ShowScorePart[];
          showCardDatas: FlipCardData[];
        }
        // naming tbd
        const getPlayerScorings = (
          showScoring: ShowScoring,
          cardsAndOwners: CardsAndOwners,
          cutCard: FlipCardData,
          box: PlayingCard[]
        ): PlayerScoring[] => {
          const boxCardDatas: FlipCardData[] = [];
          // these are in order
          const playerScoring = showScoring.playerShowScores.map(
            (playerShowScore) => {
              const cardsAndOwner = cardsAndOwners.find(
                (cardsAndOwner) =>
                  cardsAndOwner.owner === playerShowScore.playerId
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
            }
          );
          boxCardDatas.forEach((boxCardData, i) => {
            boxCardData.playingCard = box[i];
          });
          boxCardDatas.push(cutCard);
          // for now game not won and there is a box score
          playerScoring.push({
            showCardDatas: boxCardDatas,
            showScoreParts: getShowScoreParts(
              showScoring.boxScore,
              boxCardDatas
            ),
            playerId:
              showScoring.playerShowScores[
                showScoring.playerShowScores.length - 1
              ].playerId,
          });

          return playerScoring;
        };

        // todo options
        interface IShowAnimator {
          showScorePart(
            at: number,
            scoringCards: FlipCardData[],
            notScoringCards: FlipCardData[]
          ): number;
          initialize(at: number, flipCardDatas: FlipCardData[]): number;
          finalize(at: number, showCardDatas: FlipCardData[]): number;
        }

        const getShowAnimator = (): IShowAnimator => {
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
        };

        const moveCutCardToPlayerHand = (
          cutCard: FlipCardData,
          at: number,
          duration: number,
          handPosition: DiscardPositions
        ) => {
          const animation: FlipCardAnimationSequence = [
            getMoveRotateSegment(
              handPosition.isHorizontal,
              handPosition.positions[4],
              duration,
              undefined,
              at
            ),
          ];
          setOrAddToAnimationSequence(cutCard, animation);
        };

        const showAndScore = (
          showScoring: ShowScoring,
          cardsAndOwners: CardsAndOwners,
          cutCard: FlipCardData,
          scores: Score[],
          box: PlayingCard[],
          startAt: number,
          moveCutCardDuration: number,
          scoreMessageDuration: number
        ) => {
          let at = startAt;

          const showAnimator = getShowAnimator();
          // for now game not won and there is a box score

          const playerScorings = getPlayerScorings(
            showScoring,
            cardsAndOwners,
            cutCard,
            box
          );
          // eslint-disable-next-line complexity
          playerScorings.forEach((playerScoring, i) => {
            const isBox = i === playerScorings.length - 1;
            if (!isBox) {
              moveCutCardToPlayerHand(
                cutCard,
                at,
                moveCutCardDuration,
                getPlayerPositions(
                  myMatch.myId,
                  playerScoring.playerId,
                  positions.playerPositions,
                  myMatch.otherPlayers
                ).discard
              );
              at += moveCutCardDuration;
            }

            const showScoreParts = playerScoring.showScoreParts;
            if (showScoreParts.length === 0) {
              // have option for player name
              delayEnqueueSnackbar(
                at * 1000,
                `${playerScoring.playerId} ${isBox ? "box " : ""}scored 19 !`,
                {
                  variant: "info",
                  autoHideDuration: scoreMessageDuration * 1000,
                }
              );
              at += scoreMessageDuration;
            } else {
              if (isBox) {
                // do box movement and increment at
              }
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
              //todo create function for these two lines
              delayEnqueueSnackbar(
                at * 1000,
                `${showScorePart.description} ${scoreTotal}`,
                {
                  variant: "success",
                  autoHideDuration: scoreMessageDuration * 1000,
                }
              );
              at += scoreMessageDuration;
            });

            if (showScoreParts.length !== 0) {
              at += showAnimator.finalize(at, playerScoring.showCardDatas);
              // need to use the scoreTotal to update the cribboard ? Yes because of box too

              //getColouredScores(myMatch.scores) - but do not want to do other players just the current player
              // but need to supply them all ! - keep a ref to previous scores

              // will need to increase at
              /* setCribBoardState(
                {
                  // need to determine which Score use 
                  colouredScores:getColouredScores(tbd)
                }
              ) */
            }

            // playerScoringFinishedAnimation -
            // cribboard
          });
        };

        const addShowAnimation = (
          prevFlipCardDatas: FlipCardDatas,
          newFlipCardDatas: FlipCardDatas,
          at: number,
          flipDuration: number,
          returnDuration: number,
          onComplete: () => void
        ) => {
          const cardsAndOwners = getCardsWithOwners(newFlipCardDatas);

          let returnInPlayAt = at;
          if (myMatch.pegging.turnedOverCards.length > 0) {
            // prev and new could be the same
            const turnedOverDuration = returnTurnedOverCardsToPlayers(
              cardsAndOwners,
              at,
              flipDuration,
              returnDuration
            );
            returnInPlayAt += turnedOverDuration;
          }

          const returnInPlayCardsDuration = returnInPlayCardsToPlayers(
            cardsAndOwners,
            returnInPlayAt,
            returnDuration,
            onComplete
          );

          showAndScore(
            myMatch.showScoring,
            cardsAndOwners,
            newFlipCardDatas.cutCard,
            myMatch.scores,
            myMatch.box,
            returnInPlayAt + returnInPlayCardsDuration,
            discardDuration,
            2
          );
        };

        animationManager.current.animate(
          // eslint-disable-next-line complexity
          (animationCompleteCallback, prevFlipCardDatas) => {
            allowPegging();
            setNextPlayer(myMatch.pegging.nextPlayer);

            const peggedCard = getLastPeggedCard(myMatch.pegging);
            prevFlipCardDatas = prevFlipCardDatas as FlipCardDatas;

            const isMe = myMatch.myId === playerId;

            const turnedOver =
              myMatch.gameState === CribGameState.Pegging &&
              peggedCard.peggingScore.is31;

            const newFlipCardDatas = turnedOver
              ? setTurnedOver(prevFlipCardDatas)
              : { ...prevFlipCardDatas };

            const peggedCardPosition =
              getPeggedCardPositionIndex(prevFlipCardDatas);

            const onComplete = createOnComplete(
              turnedOver || myMatch.gameState === CribGameState.Show,
              animationCompleteCallback
            );

            const [moveToPeggingPositionAnimationSequence, pegDuration] =
              getMoveToPeggingPositionAnimationSequence(
                peggedCard,
                peggedCardPosition,
                discardDuration,
                onComplete
              );
            let pegDelay = pegDuration;
            if (isMe) {
              iPegged(newFlipCardDatas, moveToPeggingPositionAnimationSequence);
            } else {
              pegDelay += flipDuration;
              otherPlayerPegged(
                prevFlipCardDatas,
                newFlipCardDatas,
                flipDuration,
                moveToPeggingPositionAnimationSequence
              );
            }

            if (turnedOver) {
              addTurnOverTogetherAnimation(
                prevFlipCardDatas,
                newFlipCardDatas,
                pegDelay,
                onComplete
              );
            }

            if (myMatch.gameState === CribGameState.Show) {
              addShowAnimation(
                prevFlipCardDatas,
                newFlipCardDatas,
                pegDelay,
                flipDuration,
                discardDuration,
                onComplete
              );
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
  }, [
    signalRRegistration,
    matchDetail,
    positions,
    updateLocalMatch,
    removeMyDiscardSelection,
    enqueueSnackbar,
    allowPegging,
    delayEnqueueSnackbar,
  ]);

  const staticRender = useCallback(() => {
    const myMatch = matchDetail.match;
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
  }, [matchDetail, positions, setCardDatasAndRef]);

  useEffect(() => {
    // need to prevent re-renders from setting state in here causing a loop
    if (!initiallyRendered.current) {
      if (shouldDeal(matchDetail)) {
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
      } else if (noNewActions(matchDetail)) {
        staticRender();
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
    staticRender,
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
