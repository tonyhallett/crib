import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CribClient, CribGameState, CribHub, MyMatch } from "../generatedTypes";
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

function PlayMatchInner({
  localMatch,
  myMatch,
  playMatchCribHub,
  signalRRegistration,
  updateLocalMatch,
}: PlayMatchProps) {
  const size = {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  };
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
  const [positions, cardSize] = useMemo(() => {
    return matchLayoutManager.getPositionsAndCardSize(
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
  }, [myMatch, size.height, size.width]);
  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);
  useEffect(() => {
    return signalRRegistration({
      discard(playerId, cutCard) {
        function getNew(
          prevCardDatas: FlipCardDatas,
          discardDuration:number,
          secondDiscardDelay:number,
          cardFlipDuration:number
        ): FlipCardDatasWithCompletionRegistration {
          let animationCompleteCallback: () => void | undefined;
          const complete = () => {
            animationCompleteCallback && animationCompleteCallback();
          }
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
            onComplete?:OnComplete | undefined
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
              onComplete:complete
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
          getNew(cardDatasRef.current as FlipCardDatas,discardDuration,0,flipDuration)
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
        const animations = dealThenDiscardIfRequired(
          myMatch,
          localMatch,
          positions,
          updateLocalMatch,
          { dealDuration: 0.5, flipDuration, discardDuration }
        );
        animationManager.current.animate(animations);
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
      }else{
        const breakHere = true;
      }
      initiallyRendered.current = true;
    }
  }, [positions, localMatch, myMatch, setCardDatasAndRef, updateLocalMatch]);

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
  
  return (
    <div style={{ perspective: 5000 }}>
      {mappedFlipCardDatas.map((cardData, i) => (
        <FlipCard key={i} {...cardData} size={cardSize} />
      ))}
    </div>
  );
}

export const PlayMatch = memo(PlayMatchInner, (prevProps, nextProps) => {
  return prevProps.localMatch.id === nextProps.localMatch.id;
});
