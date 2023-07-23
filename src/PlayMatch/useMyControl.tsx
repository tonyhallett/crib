import {
  MouseEventHandler,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import { CribGameState, PlayingCard } from "../generatedTypes";
import { useAnimateSegments } from "../fixAnimationSequence/useAnimateSegments";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { SequenceTime } from "../FlipCard/motion-types";
import {
  SegmentAnimationOptionsWithTransitionEndAndAt,
  SegmentsAnimationOptions,
  SmartAnimationSequence,
  SmartDomSegmentWithTransition,
  SmartSegment,
} from "../fixAnimationSequence/createAnimationsFromSegments";
import { FlipCardData, FlipCardDatas, FlipCardState } from "./PlayMatchTypes";
import {
  getCardsUnderPoint,
  getCardsUnderPointWithState,
} from "./getCardsUnderPoint";
import { classNameFromPlayingCard } from "../FlipCard/FlipCard";
import { DOMKeyframesDefinition } from "framer-motion";
import { useSnackbar } from "notistack";
import { noop } from "./noop";
import { getCardValue } from "./playingCardUtilities";

type Animate = (
  sequence: SmartAnimationSequence,
  options?: SegmentsAnimationOptions
) => void;

function getAnimatePlayingCardSegment(
  playingCard: PlayingCard,
  domKeyFramesDefinition: DOMKeyframesDefinition,
  options: SegmentAnimationOptionsWithTransitionEndAndAt
): SmartDomSegmentWithTransition {
  const className = classNameFromPlayingCard(playingCard);
  return [`.${className}`, domKeyFramesDefinition, options];
}

function getMyDiscardSelectionAnimationSegmentByClassName(
  flipCardData: FlipCardData,
  selected: boolean,
  at: SequenceTime = 0
): SmartSegment {
  return getAnimatePlayingCardSegment(
    flipCardData.playingCard as PlayingCard,
    { opacity: selected ? 0.5 : 1 },
    { at: at }
  );
}

function getDiscardDialogTitle(numDiscards: number) {
  return `Discard card${numDiscards === 1 ? "" : "s"} ?`;
}

const useMyDiscard = (
  animate: Animate,
  numDiscards: number,
  flipCardDatas: FlipCardDatas | undefined,
  discard: (
    playingCard1: PlayingCard,
    playingCard2: PlayingCard | undefined
  ) => unknown
): [JSX.Element, MouseEventHandler, () => void] => {
  const [showDialog, setShowDialog] = useState(false);
  const [discarded, setDiscarded] = useState(false);
  const handleClose = useCallback(() => {
    setShowDialog(false);
  }, []);

  const deselect = (flipCardData: FlipCardData) => {
    const segment = getMyDiscardSelectionAnimationSegmentByClassName(
      flipCardData,
      false
    );
    selectedFlipCardsRef.current.splice(
      selectedFlipCardsRef.current.indexOf(flipCardData),
      1
    );
    return segment;
  };

  const select = (flipCardData: FlipCardData) => {
    const segment = getMyDiscardSelectionAnimationSegmentByClassName(
      flipCardData,
      true
    );
    selectedFlipCardsRef.current.push(flipCardData);
    return segment;
  };

  const selectedFlipCardsRef = useRef<FlipCardData[]>([]);
  const removeMyDiscardSelection = useCallback(() => {
    selectedFlipCardsRef.current.forEach((flipCardData) => {
      animate([
        getMyDiscardSelectionAnimationSegmentByClassName(flipCardData, false),
      ]);
    });
  }, [animate]);

  const doSelectDeselect = useCallback(
    (flipCardData: FlipCardData) => {
      // deselect if currently selected
      if (selectedFlipCardsRef.current.includes(flipCardData)) {
        animate([deselect(flipCardData)]);
      } else {
        // already selected num discards
        if (selectedFlipCardsRef.current.length === numDiscards) {
          if (numDiscards === 1) {
            animate([
              deselect(selectedFlipCardsRef.current[0]),
              select(flipCardData),
            ]);
          } else {
            return false;
          }
        } else {
          animate([select(flipCardData)]);
        }
      }
      return true;
    },
    [animate, numDiscards]
  );

  const handle = useCallback(
    (flipCardData: FlipCardData) => {
      const showDialogIfSelectedAllDiscards = doSelectDeselect(flipCardData);
      if (
        showDialogIfSelectedAllDiscards &&
        selectedFlipCardsRef.current.length === numDiscards
      ) {
        setShowDialog(true);
      }
    },
    [doSelectDeselect, numDiscards]
  );

  const discardStateClickHandler = useCallback<MouseEventHandler>(
    (event) => {
      const myCards = (flipCardDatas as FlipCardDatas).myCards;
      const myHandCards = myCards.filter(
        (flipCardData) => flipCardData.state === FlipCardState.MyHand
      );
      const alreadyDiscarded = myHandCards.length <= 4;
      if (!discarded && !alreadyDiscarded) {
        const cardsUnderPoint = getCardsUnderPoint(
          myHandCards,
          event.clientX,
          event.clientY
        );
        if (cardsUnderPoint.length === 1) {
          handle(cardsUnderPoint[0]);
        }
      }
    },
    [discarded, flipCardDatas, handle]
  );

  return [
    <Dialog key="discardDialog" open={showDialog} onClose={handleClose}>
      <DialogTitle>{getDiscardDialogTitle(numDiscards)}</DialogTitle>
      <DialogActions>
        <Button onClick={handleClose}>Disagree</Button>
        <Button
          onClick={() => {
            setDiscarded(true);
            const playingCard1 = selectedFlipCardsRef.current[0]
              .playingCard as PlayingCard;
            const selected2 = selectedFlipCardsRef.current[1];
            const playingCard2 =
              selected2 !== undefined
                ? (selected2.playingCard as PlayingCard)
                : undefined;
            discard(playingCard1, playingCard2);
            handleClose();
            // might animate further to show sending to the server
          }}
          autoFocus
        >
          Agree
        </Button>
      </DialogActions>
    </Dialog>,
    flipCardDatas === undefined ? noop : discardStateClickHandler,
    removeMyDiscardSelection,
  ];
};

const getBlurMyCardSegment = (
  playingCard: PlayingCard,
  amount: number,
  duration: number
) => {
  return getAnimatePlayingCardSegment(
    playingCard,
    { filter: `blur(${amount}px)` },
    {
      duration,
      transitionEnd: {
        filter: "none",
      },
    }
  );
};

const useMyPegging = (
  animate: Animate,
  flipCardDatas: FlipCardDatas | undefined,
  peg: (playingCard: PlayingCard) => unknown,
  pegCount: number
): [JSX.Element, MouseEventHandler, () => void] => {
  const selectedPlayingCard = useRef<PlayingCard | undefined>(undefined);
  const allowPegging = useCallback(() => {
    selectedPlayingCard.current = undefined;
  }, []);
  const [showDialog, setShowDialog] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const handleClose = useCallback(() => {
    setShowDialog(false);
  }, []);
  const pegClickHandler = useCallback<MouseEventHandler>(
    (event) => {
      if (selectedPlayingCard.current === undefined) {
        const myHandCards = getCardsUnderPointWithState(
          (flipCardDatas as FlipCardDatas).myCards,
          event.clientX,
          event.clientY,
          FlipCardState.MyHand
        );
        if (myHandCards.length === 1) {
          const playingCard = myHandCards[0].playingCard as PlayingCard;
          const cardValue = getCardValue(playingCard.pips);
          if (pegCount + cardValue <= 31) {
            selectedPlayingCard.current = playingCard;
            setShowDialog(true);
          } else {
            enqueueSnackbar(
              `Cannot peg the ${playingCard.pips} of ${playingCard.suit} when count is ${pegCount}`,
              { variant: "error" }
            );
            animate([getBlurMyCardSegment(playingCard, 1, 2)]);
          }
        }
      }
    },
    [animate, enqueueSnackbar, flipCardDatas, pegCount]
  );
  return [
    <Dialog key="peggingDialog" open={showDialog} onClose={handleClose}>
      <DialogTitle>Peg ?</DialogTitle>
      <DialogActions>
        <Button
          onClick={() => {
            selectedPlayingCard.current = undefined;
            handleClose();
          }}
        >
          Disagree
        </Button>
        <Button
          onClick={() => {
            peg(selectedPlayingCard.current as PlayingCard);
            handleClose();
          }}
          autoFocus
        >
          Agree
        </Button>
      </DialogActions>
    </Dialog>,
    flipCardDatas === undefined ? noop : pegClickHandler,
    allowPegging,
  ];
};

export function useMyControl(
  children: ReactNode,
  numDiscards: number,
  discard: (
    playingCard1: PlayingCard,
    playingCard2: PlayingCard | undefined
  ) => unknown,
  flipCardDatas: FlipCardDatas | undefined,
  peg: (playingCard: PlayingCard) => unknown,
  pegCount: number,
  gameState: CribGameState,
  meNext: boolean
): [JSX.Element, () => void, () => void] {
  const [scope, animate] = useAnimateSegments();
  const [discardDialog, discardClickHandler, removeMyDiscardSelection] =
    useMyDiscard(animate, numDiscards, flipCardDatas, discard);
  const [peggingDialog, pegClickHandler, allowPegging] = useMyPegging(
    animate,
    flipCardDatas,
    peg,
    pegCount
  );

  let clickHandler: MouseEventHandler = () => {
    //
  };
  let element: JSX.Element | undefined;
  switch (gameState) {
    case CribGameState.Discard:
      clickHandler = discardClickHandler;
      element = discardDialog;
      break;
    case CribGameState.Pegging:
      if (meNext) {
        clickHandler = pegClickHandler;
        element = peggingDialog;
      }
      break;
  }

  return [
    // eslint-disable-next-line react/jsx-key
    <div ref={scope} onClick={clickHandler}>
      {element}
      {children}
    </div>,
    removeMyDiscardSelection,
    allowPegging,
  ];
}
