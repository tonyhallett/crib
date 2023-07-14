import {
  MouseEventHandler,
  ReactNode, useCallback, useRef,
  useState
} from "react";
import { Pips, PlayingCard, Suit } from "../generatedTypes";
import { useAnimateSegments } from "../fixAnimationSequence/useAnimateSegments";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { SequenceTime } from "../FlipCard/motion-types";
import { SmartSegment } from "../fixAnimationSequence/createAnimationsFromSegments";

export const myDiscardFlipCardSelector = "[id^=flipCard_]";
export function findMyDiscardFlipCards(scope: HTMLDivElement,){
  return scope.querySelectorAll(myDiscardFlipCardSelector);
}

export function getDiscardDialogTitle(numDiscards: number) {
  return `Discard card${numDiscards === 1 ? "" : "s"} ?`;
}

export function playingCardFromId(id: string): PlayingCard {
  const parts = id.split("_");
  const pipsStr = parts[1];
  const suitStr = parts[2];

  return {
    pips: Pips[pipsStr as keyof typeof Pips],
    suit: Suit[suitStr as keyof typeof Suit],
  };
}

export function findFlipCardElement(
  clientX: number,
  clientY: number,
  myDiscardFlipElements:NodeListOf<Element>
): HTMLElement | undefined {
  let matchingElement: HTMLElement | undefined;
  for (let i = 0; i < myDiscardFlipElements.length; i++) {
    const flipCardElement = myDiscardFlipElements[i] as HTMLElement;
    if(inBounds(flipCardElement.children[0],clientX, clientY)){
      matchingElement = flipCardElement;
      break;
    }
  }
  return matchingElement;
}

// might be able to not use children[0]
function inBounds(element:Element, x: number, y: number) {
  const rect = element.getBoundingClientRect();
  if (
    x >= rect.left &&
    x <= rect.right &&
    y >= rect.top &&
    y <= rect.bottom
  ) {
    return true;
  }
  return false;
}

function getMyDiscardSelectionAnimationSegment(
  element: HTMLElement,
  selected: boolean,
  at?: SequenceTime
): SmartSegment;
function getMyDiscardSelectionAnimationSegment(
  id: string,
  selected: boolean,
  at?: SequenceTime
): SmartSegment;
function getMyDiscardSelectionAnimationSegment(
  elementOrId: string | HTMLElement,
  selected: boolean,
  at: SequenceTime = 0
): SmartSegment {
  const id = elementOrId instanceof HTMLElement ? elementOrId.id : elementOrId;
  return [`#${id}`, { opacity: selected ? 0.5 : 1 }, { at: at }];
}

export function useMyDiscard(
  children: ReactNode,
  numDiscards: number,
  discard: (
    playingCard1: PlayingCard,
    playingCard2: PlayingCard | undefined
  ) => unknown
): [JSX.Element, () => void] {
  const [scope, animate] = useAnimateSegments();
  const [showDialog, setShowDialog] = useState(false);
  const [discarded, setDiscarded] = useState(false);
  const handleClose = useCallback(() => {
    setShowDialog(false);
  },[]);

  const deselect = (matchingElement: HTMLElement) => {
    const segment = getMyDiscardSelectionAnimationSegment(
      matchingElement,
      false
    );
    selectedIdsRef.current.splice(
      selectedIdsRef.current.indexOf(matchingElement.id),
      1
    );
    return segment;
  };

  const select = (matchingElement: HTMLElement) => {
    const segment = getMyDiscardSelectionAnimationSegment(
      matchingElement,
      true
    );
    selectedIdsRef.current.push(matchingElement.id);
    return segment;
  };

  const selectedIdsRef = useRef<string[]>([]);
  const removeMyDiscardSelection = () => {
    animate([[myDiscardFlipCardSelector, { opacity: 1 }]]);
  };

  const doSelectDeselect = useCallback((matchingElement:HTMLElement) => {
    const matchingElementId = matchingElement.id;
    // deselect if currently selected
    if (selectedIdsRef.current.includes(matchingElementId)) {
      animate([deselect(matchingElement)]);
    } else {
      // already selected num discards
      if (selectedIdsRef.current.length === numDiscards) {
        if (numDiscards === 1) {
          animate([
            deselect(
              document.getElementById(
                selectedIdsRef.current[0]
              ) as HTMLElement
            ),
            select(matchingElement),
          ]);
        } else {
          //matchingElement = undefined;
          return false;
        }
      } else {
        animate([select(matchingElement)]);
      }
    }
    return true;
  },[animate, numDiscards]);

  const handleClick = useCallback((clientX:number,clientY:number,myDiscardFlipElements:NodeListOf<Element>) => {
    const matchingElement = findFlipCardElement(
      clientX,
      clientY,
      myDiscardFlipElements
    );
    let showDialogIfSelectedAllDiscards = false;

    if (matchingElement) {
      showDialogIfSelectedAllDiscards = doSelectDeselect(matchingElement);
    }

    if (showDialogIfSelectedAllDiscards &&
      selectedIdsRef.current.length === numDiscards) {
      setShowDialog(true);
    }
  },[doSelectDeselect, numDiscards]);

  const clickHandler = useCallback<MouseEventHandler>((event) => {
    if (!discarded) {
      const myDiscardFlipElements = findMyDiscardFlipCards(scope.current as HTMLDivElement);
      if (myDiscardFlipElements.length >= 5) {
        handleClick(event.clientX, event.clientY, myDiscardFlipElements);
      }
    }
  },[discarded, handleClick, scope]);

  return [
    // eslint-disable-next-line react/jsx-key
    <div
      ref={scope}
      onClick={clickHandler}
    >
      <Dialog open={showDialog} onClose={handleClose}>
        <DialogTitle>{getDiscardDialogTitle(numDiscards)}</DialogTitle>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button
            onClick={() => {
              setDiscarded(true);
              const id1 = selectedIdsRef.current[0];
              const playingCard1 = playingCardFromId(id1);
              const id2 = selectedIdsRef.current[1];
              const playingCard2 = id2 !== undefined ? playingCardFromId(id2) : undefined;
              discard(playingCard1, playingCard2);
              handleClose();
              // might animate further to show sending to the server
            }}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      {children}
    </div>,
    removeMyDiscardSelection,
  ];
}
