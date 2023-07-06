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
  Score,
} from "../generatedTypes";
import { LocalMatch } from "../LocalMatch";
import { getDiscardCardDatas } from "./getDiscardCardData";
import { getPeggingCardDatas } from "./getPeggingCardData";
import { Box, Positions, matchLayoutManager } from "./matchLayoutManager";
import { getDealerPositions } from "./getDealerPositions";
import { FlipAnimation, FlipCard, FlipCardProps } from "../FlipCard/FlipCard";
import { dealThenDiscardIfRequired } from "./initialDealThenDiscardIfRequired";
import { getDiscardToBoxSegment } from "./animationSegments";
import {
  AnimationManager,
  FlipCardDatasWithCompletionRegistration,
} from "./AnimationManager";
import { OnComplete } from "../fixAnimationSequence/common-motion-types";
import { AnimatedCribBoard } from "../crib-board/AnimatedCribBoard";
import cribBoardWoodUrl from "../cribBoardWoodUrl";
import { ColouredScore, ColouredScores } from "../crib-board/CribBoard";

type PlayMatchCribClientMethods = Pick<CribClient, "discard" | "ready" | "peg">;
// mapped type from PlayMatchCribClientMethods that omits the 'matchId' parameter
export type PlayMatchCribClient = {
  [K in keyof PlayMatchCribClientMethods]: PlayMatchCribClientMethods[K] extends (
    matchId: string,
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

export type FlipCardData = Omit<FlipCardProps, "size">;

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
    player1: getColouredScore(scores[0], 0),
    player2: getColouredScore(scores[1], 1),
    player3: scores.length === 3 ? getColouredScore(scores[2], 2) : undefined,
  };
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
  const cardDatasRef = useRef<FlipCardDatas | undefined>(cardDatas);
  const setCardDatasAndRef = useCallback((newCardDatas: FlipCardDatas) => {
    cardDatasRef.current = newCardDatas;
    setCardDatas(newCardDatas);
  }, []);

  const animationManager = useRef(new AnimationManager(setCardDatasAndRef));
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
    }
  }, []);
  useEffect(() => {
    return signalRRegistration({
      discard(playerId, cutCard) {
        function getNew(
          prevCardDatas: FlipCardDatas,
          discardDuration: number,
          secondDiscardDelay: number,
          cardFlipDuration: number
        ): FlipCardDatasWithCompletionRegistration {
          let animationCompleteCallback: () => void | undefined;
          const complete = () => {
            animationCompleteCallback && animationCompleteCallback();
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

          const getCutCardAnimationData = (prevCardData: FlipCardData) => {
            const newCardData = { ...prevCardData };
            newCardData.playingCard = cutCard;
            const flipAnimation: FlipAnimation = {
              flip: true,
              duration: cardFlipDuration,
              at: cardFlipDelay,
              onComplete: complete,
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
                  count === numDiscards && !cutCard ? complete : undefined
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

          if (cutCard) {
            newFlipCardDatas.cutCard = getCutCardAnimationData(
              prevFlipCardDatas.cutCard
            );
          }

          return [
            newFlipCardDatas,
            (callback) => {
              animationCompleteCallback = callback;
            },
          ];
        }
        animationManager.current.animate(
          getNew(
            cardDatasRef.current as FlipCardDatas,
            discardDuration,
            0,
            flipDuration
          )
        );
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
  }, [signalRRegistration, myMatch, positions]);

  /* eslint-disable complexity */
  useEffect(() => {
    // need to prevent re-renders from setting state in here causing a loop
    if (!initiallyRendered.current) {
      if (localMatch.changeHistory.numberOfActions === -1) {
        window.setTimeout(
          () => {
            const animations = dealThenDiscardIfRequired(
              myMatch,
              localMatch,
              positions,
              updateLocalMatch,
              { dealDuration: 0.5, flipDuration, discardDuration }
            );
            animationManager.current.animate(animations);
          },
          hasRenderedAMatch ? 0 : 2000
        );
      } else if (
        localMatch.changeHistory.lastChangeDate ===
        myMatch.changeHistory.lastChangeDate
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
          colouredScores={getColouredScores(myMatch.scores)}
        />
      </div>
      <div style={{ perspective: 5000, ...cardsShiftStyle }}>
        {mappedFlipCardDatas.map((cardData, i) => (
          <FlipCard key={i} {...cardData} size={cardSize} />
        ))}
      </div>
    </>
  );
}

export const PlayMatch = memo(PlayMatchInner, (prevProps, nextProps) => {
  return prevProps.localMatch.id === nextProps.localMatch.id;
});
