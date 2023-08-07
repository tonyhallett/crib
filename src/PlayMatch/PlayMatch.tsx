import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CribGameState, MyMatch } from "../generatedTypes";
import { LocalMatch, shouldDeal } from "../localMatch";
import { getDiscardCardDatas } from "./getDiscardCardData";
import { getPeggingCardDatas } from "./getPeggingCardData";
import { FlipCard } from "../FlipCard/FlipCard";
import { dealThenDiscardIfRequired } from "./animation/initialDealThenDiscardIfRequired";
import { AnimationManager } from "./animation/AnimationManager";
import { AnimatedCribBoard } from "../crib-board/AnimatedCribBoard";
import cribBoardWoodUrl from "../backgrounds/cribBoardWoodUrl";
import { useOverflowHidden } from "../hooks/useOverflowHidden";
import { MatchDetail } from "../App";
import { useControlMyCards } from "./ui-hooks/useControlMyCards";
import { getPeggingCount } from "./signalRPeg";

import { useSnackbarWithDelay } from "../hooks/useSnackbarWithDelay";
import { getColouredScores } from "./getColouredScores";
import {
  CribBoardState,
  FlipCardDatas,
  PlayMatchProps,
} from "./PlayMatchTypes";
import {
  useMemoedOrientationDependentValues,
  useMemoedPositionsAndCardSize,
} from "./playMatchHooks";
import { getSignalRPeggingAnimationProvider } from "./signalr/pegging/getSignalRPeggingAnimationProvider";
import { discardDuration, flipDuration } from "./animation/animationDurations";
import { getSignalRDiscardAnimationProvider } from "./signalr/discard/getSignalRDiscardAnimationProvider";
import { usePeggingOverlay } from "./ui-hooks/usePeggingOverlay";
import { Ready, ReadyProps } from "./Ready";
import { getReadyState } from "./getReadyState";

function noNewActions(matchDetail: MatchDetail) {
  return (
    matchDetail.localMatch.changeHistory.numberOfActions ===
    matchDetail.match.changeHistory.numberOfActions
  );
}

function PlayMatchInner({
  matchDetail,
  playMatchCribHub,
  signalRRegistration,
  updateLocalMatch,
  landscape,
  hasRenderedAMatch,
}: PlayMatchProps) {
  const scoresRef = useRef(matchDetail.match.scores);
  const myMatch = matchDetail.match;
  const { enqueueSnackbar, delayEnqueueSnackbar } = useSnackbarWithDelay();
  const initiallyRendered = useRef(false);
  const [cardDatas, setCardDatas] = useState<FlipCardDatas | undefined>(
    undefined
  );
  const [readyState, setReadyState] = useState<ReadyProps>({
    gameState: CribGameState.Discard,
    meReady: {
      id: "me",
      ready: false,
    },
    otherPlayersReady: [],
  });

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

  const { cribBoardSize, playAreaSize, styles } =
    useMemoedOrientationDependentValues(landscape);
  const [positions, cardSize] = useMemoedPositionsAndCardSize(
    playAreaSize,
    myMatch
  );

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
    useControlMyCards(
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
    const getPositions = () => positions;
    return signalRRegistration({
      discard(playerId, myMatch) {
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
        animationManager.current.animate(
          getSignalRDiscardAnimationProvider(
            {
              discardDuration,
              secondDiscardDelay: 0,
              cardFlipDuration: flipDuration,
            },
            myMatch,
            playerId,
            getPositions,
            scoresRef,
            removeMyDiscardSelection,
            setGameState,
            setReadyState,
            setCribBoardState,
            enqueueSnackbar,
            syncChangeHistories,
            playMatchCribHub.ready
          )
        );
      },
      peg(playerId, peggedPlayingCard, myMatch) {
        animationManager.current.animate(
          getSignalRPeggingAnimationProvider(
            myMatch,
            getPositions,
            allowPegging,
            setNextPlayer,
            {
              enqueueSnackbar,
              delayEnqueueSnackbar,
            },
            setCribBoardState,
            setReadyState,
            playMatchCribHub.ready,
            scoresRef
          )
        );
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ready(playerId, myMatch) {
        setReadyState(getReadyState(myMatch));
        if (myMatch.gameState === CribGameState.Discard) {
          alert("lets move on to the next game");
          // will animate the deck to the new position if necessary
          // deal !
          // board ?
        }
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
    playMatchCribHub.ready,
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
    const readyState = getReadyState(myMatch, () => {
      playMatchCribHub.ready();
    });
    setReadyState(readyState);
  }, [matchDetail.match, playMatchCribHub, positions, setCardDatasAndRef]);

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
      <Ready {...readyState} />
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

function getNumDiscards(myMatch: MyMatch) {
  return myMatch.otherPlayers.length === 1 ? 2 : 1;
}

export const PlayMatch = memo(PlayMatchInner, (prevProps, nextProps) => {
  return (
    prevProps.matchDetail.localMatch.id === nextProps.matchDetail.localMatch.id
  );
});
