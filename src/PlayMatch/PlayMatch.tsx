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
  Pips,
  PlayingCard,
  Score,
} from "../generatedTypes";
import { LocalMatch, dealActionIndicator } from "../LocalMatch";
import { getDiscardCardDatas } from "./getDiscardCardData";
import { getPeggingCardDatas } from "./getPeggingCardData";
import { Box, Positions, Size, matchLayoutManager } from "./matchLayoutManager";
import { getDealerPositions } from "./getDealerPositions";
import { FlipAnimation, FlipCard, FlipCardProps } from "../FlipCard/FlipCard";
import { dealThenDiscardIfRequired } from "./initialDealThenDiscardIfRequired";
import { getDiscardToBoxSegment } from "./animationSegments";
import {
  AnimationManager,
} from "./AnimationManager";
import { OnComplete } from "../fixAnimationSequence/common-motion-types";
import { AnimatedCribBoard } from "../crib-board/AnimatedCribBoard";
import cribBoardWoodUrl from "../cribBoardWoodUrl";
import { ColouredScore, ColouredScores } from "../crib-board/CribBoard";
import { useDrag } from "@use-gesture/react";
import { useAnimateSegments } from "../fixAnimationSequence/useAnimateSegments";
import { Card, CardFlip } from "../FlipCard/Card";

type PlayMatchCribClientMethods = Pick<CribClient, "discard" | "ready" | "peg">;
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
  myMatch: MyMatch;
  localMatch: LocalMatch;
  playMatchCribHub: PlayMatchCribHub;
  signalRRegistration: (playMatchCribClient: PlayMatchCribClient) => () => void;
  updateLocalMatch: UpdateLocalMatch;
  landscape: boolean;
  hasRenderedAMatch: boolean;
}

export enum FlipCardState {
  Todo,
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
const cribBoardWidthRatio = 0.35;
function getSize(isLandscape: boolean) {
  if (isLandscape) {
    const cribBoardWidth =
      document.documentElement.clientHeight * cribBoardWidthRatio;
    return {
      width: document.documentElement.clientWidth - cribBoardWidth,
      height: document.documentElement.clientHeight,
    };
  } else {
    const cribBoardWidth =
      document.documentElement.clientWidth * cribBoardWidthRatio;
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight - cribBoardWidth,
    };
  }
}

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

interface CribBoardState{
  colouredScores:ColouredScores,
  onComplete?:OnComplete
}

function PlayMatchInner({
  localMatch,
  myMatch,
  playMatchCribHub,
  signalRRegistration,
  updateLocalMatch,
  landscape,
  hasRenderedAMatch,
}: PlayMatchProps) {
  const initiallyRendered = useRef(false);
  const [cardDatas, setCardDatas] = useState<FlipCardDatas | undefined>(
    undefined
  );
  const [cribBoardState, setCribBoardState] = useState<CribBoardState>(
    {
      colouredScores:getColouredScores(myMatch.scores)
    }
  );

  const cardDatasRef = useRef<FlipCardDatas | undefined>(cardDatas);
  // for when there are no animations
  const setCardDatasAndRef = useCallback((newCardDatas: FlipCardDatas) => {
    cardDatasRef.current = newCardDatas;
    setCardDatas(newCardDatas);
  }, []);

  const animationManager = useRef(new AnimationManager((setter) => {
    
    setCardDatas(prevCardDatas => {
      const newCardDatas =  setter(prevCardDatas);
      cardDatasRef.current = newCardDatas;
      return newCardDatas;
    })
  }));
  const size = useMemo(() => getSize(landscape), [landscape]);
  const [positions, cardSize] = useMemo(() => {
    const positionsAndCardSize = matchLayoutManager.getPositionsAndCardSize(
      size.width,
      size.height,
      myMatch,
      {
        peggingOverlayPercentage: 0.15,
        cardHeightWidthRatio: 88 / 63, // matching the current svg ( poker sized )
        paddingCardPercentage: 0.05,
        deckAndBoxInMiddle: true, //todo options
      }
    );
    return positionsAndCardSize;
  }, [myMatch, size.height, size.width]);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  useEffect(() => {
    return signalRRegistration({
      discard(playerId,myMatch) {
        function getNew(
          prevCardDatas: FlipCardDatas,
          discardDuration: number,
          secondDiscardDelay: number,
          cardFlipDuration: number,
          animationCompleteCallback:() => void
        ): FlipCardDatas {
          const syncChangeHistories = () => {
            const newLocalMatch:LocalMatch = {
              ...localMatch,
              changeHistory:{
                ...myMatch.changeHistory,
                lastChangeDate:new Date()
              }
            }
            updateLocalMatch(newLocalMatch);
          }
          const complete = () => {
            animationCompleteCallback && animationCompleteCallback();
            syncChangeHistories();
          };

          const prevFlipCardDatas = prevCardDatas as FlipCardDatas;

          const numDiscards = myMatch.otherPlayers.length + 1 === 2 ? 2 : 1;
          const discardedIndex = myMatch.otherPlayers.findIndex(
            (otherPlayer) => otherPlayer.id === playerId
          );
          const boxPosition = getBoxPosition(myMatch, positions);

          const cardFlipDelay =
            discardDuration + (numDiscards - 1) * secondDiscardDelay;

          const getDiscardToBoxCardData = (
            boxPosition: Box,
            prevCardData: FlipCardData,
            onComplete?: OnComplete | undefined
          ) => {
            const newCardData = { ...prevCardData };
            newCardData.animationSequence = [
              getDiscardToBoxSegment(
                boxPosition,
                discardDuration,
                count * secondDiscardDelay,
                undefined,
                onComplete
              ),
            ];
            return newCardData;
          };

          const getCutCardAnimationData = (prevCardData: FlipCardData, isJack:boolean) => {
            const newCardData = { ...prevCardData };
            newCardData.playingCard = myMatch.cutCard;
            const flipAnimation: FlipAnimation = {
              flip: true,
              duration: cardFlipDuration,
              at: cardFlipDelay,
              onComplete: () => {
                let requiresCompletion = true;
                if(isJack){
                  if(myMatch.gameState === CribGameState.Pegging){
                    requiresCompletion = false;
                    setCribBoardState({
                      colouredScores:getColouredScores(myMatch.scores),
                      onComplete(){
                        complete();
                      }
                    })
                  }else{
                    throw new Error("Not implemented");
                  }
                }
                if(requiresCompletion){
                  complete();
                }
              }
            };
            newCardData.animationSequence = [flipAnimation];
            return newCardData;
          };

          const prevOtherPlayerCardDatas =
            prevFlipCardDatas.otherPlayersCards[discardedIndex];

          let count = 0;
          const newDiscarderCardDatas = prevOtherPlayerCardDatas.map(
            (prevCardData) => {
              if (count < numDiscards) {
                count++;
                const newData = getDiscardToBoxCardData(
                  boxPosition,
                  prevCardData,
                  count === numDiscards && !myMatch.cutCard ? complete : undefined
                );
                return newData;
              }
              return prevCardData;
            }
          );

          const newOtherPlayersCards = prevFlipCardDatas.otherPlayersCards.map(
            (otherPlayerCards, i) => {
              if (i === discardedIndex) {
                return newDiscarderCardDatas;
              }
              return otherPlayerCards;
            }
          );

          const newFlipCardDatas: FlipCardDatas = {
            ...prevFlipCardDatas,
            otherPlayersCards: newOtherPlayersCards,
          };

          if (myMatch.cutCard) {
            newFlipCardDatas.cutCard = getCutCardAnimationData(
              prevFlipCardDatas.cutCard,
              myMatch.cutCard.pips === Pips.Jack
            );
          }
          return newFlipCardDatas;
        }
        
        animationManager.current.animate((animationCompleteCallback,prevFlipCardDatas) => {
          return getNew(prevFlipCardDatas as FlipCardDatas,discardDuration,0,flipDuration, animationCompleteCallback)
        })
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      peg(playerId, peggedCard) {
        //
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ready(playerId) {
        //
      },
    });
  }, [signalRRegistration, myMatch, positions, localMatch, updateLocalMatch]);

  /* eslint-disable complexity */
  useEffect(() => {
    // need to prevent re-renders from setting state in here causing a loop
    if (!initiallyRendered.current) {
      if (localMatch.changeHistory.numberOfActions === dealActionIndicator) {
        window.setTimeout(
          () => {
            animationManager.current.animate((animationCompleteCallback) => {
              return dealThenDiscardIfRequired(
                myMatch,
                localMatch,
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
    localMatch,
    myMatch,
    setCardDatasAndRef,
    updateLocalMatch,
    hasRenderedAMatch,
  ]);

  const mappedFlipCardDatas = useMemo(() => {
    if (cardDatas === undefined) {
      return [];
    }
    const flattenedOtherPlayerCards = cardDatas.otherPlayersCards.reduce(
      (acc, otherPlayerCards) => {
        return acc.concat(otherPlayerCards);
      },
      [] as FlipCardData[]
    );
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
    ))
  },[cardSize, mappedFlipCardDatas]);

  const cribBoardHeight = landscape ? window.innerHeight : window.innerWidth;
  const cribBoardWidth = cribBoardHeight * cribBoardWidthRatio;

  // do not need to translateY when provide the width
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

  const [peggingOverlay, bind] = usePeggingOverlay({
    cardSize,
    cribBoardWidth,
    landscape,
    mappedFlipCardDatas,
  });

  return (
    <>
      <div style={cribBoardStyle}>
        <AnimatedCribBoard
          cribBoardUrl={cribBoardWoodUrl}
          pegHoleRadius={0.05}
          pegRadius={0.09}
          pegTrackBoxPaddingPercentage={0.3}
          height={landscape ? window.innerHeight : window.innerWidth}
          width={cribBoardWidth}
          pegHorizontalSpacing={0.3}
          pegPadding={0.1}
          strokeWidth={0.05}
          colouredScores={cribBoardState.colouredScores}
          onComplete={cribBoardState.onComplete}
        />
      </div>
      {peggingOverlay}
      <div
        {...bind()}
        style={{ perspective: 5000, ...cardsShiftStyle, touchAction: "none" }}
      >
        {flipCards}
      </div>
    </>
  );
}

export const PlayMatch = memo(PlayMatchInner, (prevProps, nextProps) => {
  return prevProps.localMatch.id === nextProps.localMatch.id;
});

const maximizePeggingOverlayCardSize = (
  numCards: number,
  maxHeight: number,
  heightWidthRatio: number
) => {
  let lastWidth = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const cardsWidth = numCards * lastWidth;
    const cardHeight = lastWidth * heightWidthRatio;
    if (
      cardsWidth > document.documentElement.clientWidth ||
      cardHeight > maxHeight
    ) {
      return {
        width: lastWidth,
        height: lastWidth * heightWidthRatio,
        totalWidth: cardsWidth,
      };
    }
    lastWidth++;
  }
};

function usePeggingOverlay({
  mappedFlipCardDatas,
  cardSize,
  landscape,
  cribBoardWidth,
}: {
  mappedFlipCardDatas: FlipCardData[];
  cardSize: Size;
  cribBoardWidth: number;
  landscape: boolean;
}) {
  const lookedAtDragInitial = useRef<
    { overPeggedCards: boolean } | undefined
  >();
  const overlayCardSize = useRef<(Size & { totalWidth: number }) | undefined>();
  const [scope, animate] = useAnimateSegments();
  const [scaleTranslate, setScaleTranslate] = useState<{
    scale: number;
    translateX: number;
  }>({ scale: 1, translateX: 0 });
  const peggingCardDatas = mappedFlipCardDatas
    .filter((cardData) => cardData.state === FlipCardState.PeggingInPlay)
    .sort((a, b) => a.position.x - b.position.x);
  const hasPeggedCards = peggingCardDatas.length > 0;
  const peggedCardY = hasPeggedCards
    ? peggingCardDatas[0].position.y + (landscape ? 0 : cribBoardWidth)
    : 0;
  const bind = useDrag(
    ({ down, initial: [initX, initY], movement: [mx, my] }) => {
      if (down) {
        if (lookedAtDragInitial.current === undefined) {
          const overCards = mappedFlipCardDatas.filter((cardData) => {
            if (cardData.playingCard === undefined) {
              return false;
            }
            const position = cardData.position;
            const compareY = position.y + (landscape ? 0 : cribBoardWidth);
            if (
              initX > position.x &&
              initX < position.x + cardSize.width &&
              initY > compareY &&
              initY < compareY + cardSize.height
            ) {
              return true;
            }
          });

          lookedAtDragInitial.current = {
            overPeggedCards: overCards.some(
              (cardData) => cardData.state === FlipCardState.PeggingInPlay
            ),
          };
          if (lookedAtDragInitial.current.overPeggedCards) {
            animate([[scope.current, { zIndex: 100, opacity: 1 }]]);
          }
        }
        if (lookedAtDragInitial.current.overPeggedCards) {
          const myMax = Math.min(
            document.documentElement.clientHeight - peggedCardY,
            document.documentElement.clientHeight -
              (peggedCardY + cardSize.width)
          );
          const maxScaleFactor = peggedCardY / (overlayCardSize.current as Size).height;
          const myScale = Math.min(1, Math.abs(my) / myMax);
          const scale = 1 + myScale * (maxScaleFactor - 1);
          const unscaledWidth = overlayCardSize.current
            ? overlayCardSize.current.totalWidth
            : 0;
          const scaledWidth = unscaledWidth * scale;
          const widthDiff = scaledWidth - unscaledWidth;

          const maxXFactor = 0.75;
          const maxX = (document.documentElement.clientWidth / 2) * maxXFactor;
          if (mx < 0) mx = 0; // there is probably a useDrag option to constrain
          const absX = Math.abs(mx);
          const restrainedX = Math.min(maxX, absX);
          const xRatio = mx === 0 ? 0 : restrainedX / maxX;
          const translateX = -(xRatio * widthDiff);
          setScaleTranslate({ scale, translateX: translateX });
        }
      } else {
        lookedAtDragInitial.current = undefined;
        animate([[scope.current, { zIndex: 0, opacity: 0 }]]);
      }
    },
    { enabled: hasPeggedCards }
  );

  function getPeggingOverlay() {
    if (!hasPeggedCards) {
      return undefined;
    }
    const overlayCardSizes = maximizePeggingOverlayCardSize(
      peggingCardDatas.length,
      peggedCardY,
      cardSize.height / cardSize.width
    );

    overlayCardSize.current = overlayCardSizes;
    return peggingCardDatas.map((cardData, i) => {
      const x = i * overlayCardSizes.width;
      return (
        <Card
          key={i}
          segments={[]}
          isHorizontal={false}
          faceDown={false}
          cardFlip={CardFlip.AboveCard}
          position={{ x, y: 0 }}
          size={overlayCardSizes}
          playingCard={cardData.playingCard as PlayingCard}
        />
      );
    });
  }

  return [
    <div
      key="peggingOverlay"
      ref={scope}
      style={{
        position: "absolute",
        top: 0,
        opacity: 0,
        transform: `translateX(${scaleTranslate.translateX}px) scale(${scaleTranslate.scale})`,
      }}
    >
      {getPeggingOverlay()}
    </div>,
    bind,
  ] as const;
}
