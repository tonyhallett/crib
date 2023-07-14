import {
  useRef,
  useState
} from "react";
import { PlayingCard } from "../generatedTypes";
import { Size } from "./matchLayoutManager";
import { FlipCard } from "../FlipCard/FlipCard";
import { useDrag } from "@use-gesture/react";
import { useAnimateSegments } from "../fixAnimationSequence/useAnimateSegments";
import { FlipCardData, FlipCardState } from "./PlayMatch";

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

export function usePeggingOverlay({
  mappedFlipCardDatas, cardSize, landscape, cribBoardWidth,
}: {
  mappedFlipCardDatas: FlipCardData[];
  cardSize: Size;
  cribBoardWidth: number;
  landscape: boolean;
}) {
  const lookedAtDragInitial = useRef<
    { overPeggedCards: boolean; } | undefined
  >();
  const overlayCardSize = useRef<(Size & { totalWidth: number; }) | undefined>();
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
            if (initX > position.x &&
              initX < position.x + cardSize.width &&
              initY > compareY &&
              initY < compareY + cardSize.height) {
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
        <FlipCard
          key={i}
          isHorizontal={false}
          startFaceUp={true}
          position={{ x, y: 0 }}
          size={overlayCardSizes}
          playingCard={cardData.playingCard as PlayingCard} />
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
