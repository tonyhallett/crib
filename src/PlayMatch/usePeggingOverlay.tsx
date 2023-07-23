import { useRef, useState } from "react";
import { CribGameState, PlayingCard } from "../generatedTypes";
import { Size } from "./matchLayoutManager";
import { FlipCard, classNameFromPlayingCard } from "../FlipCard/FlipCard";
import { useDrag } from "@use-gesture/react";
import { useAnimateSegments } from "../fixAnimationSequence/useAnimateSegments";
import { FlipCardData, FlipCardState } from "./PlayMatchTypes";
import { getCardsUnderPointWithState } from "./getCardsUnderPoint";

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
  flipCardDatas,
  cardSize,
  gameState,
}: {
  flipCardDatas: FlipCardData[];
  cardSize: Size;
  gameState: CribGameState;
}) {
  const lookedAtDragInitial = useRef<
    { overPeggedCards: boolean } | undefined
  >();
  const overlayCardSizeRef = useRef<
    (Size & { totalWidth: number }) | undefined
  >();
  const peggedCardYRef = useRef(0);
  const [scope, animate] = useAnimateSegments();
  const [scaleTranslate, setScaleTranslate] = useState<{
    scale: number;
    translateX: number;
  }>({ scale: 1, translateX: 0 });

  const peggingCardDatas = flipCardDatas.filter(
    (cardData) => cardData.state === FlipCardState.PeggingInPlay
  );

  const applyInitial = (initX: number, initY: number) => {
    if (lookedAtDragInitial.current === undefined) {
      const cardsUnderPointWithState = getCardsUnderPointWithState(
        flipCardDatas,
        initX,
        initY,
        FlipCardState.PeggingInPlay
      );
      lookedAtDragInitial.current = {
        overPeggedCards: cardsUnderPointWithState.length > 0,
      };
      if (lookedAtDragInitial.current.overPeggedCards) {
        peggedCardYRef.current = document
          .getElementsByClassName(
            classNameFromPlayingCard(
              peggingCardDatas[0].playingCard as PlayingCard
            )
          )[0]
          .getBoundingClientRect().y;

        overlayCardSizeRef.current = maximizePeggingOverlayCardSize(
          peggingCardDatas.length,
          peggedCardYRef.current,
          cardSize.height / cardSize.width
        );
        animate([[scope.current, { zIndex: 100, opacity: 1 }]]);
      }
    }
    return lookedAtDragInitial.current.overPeggedCards;
  };

  const applyDown = (initX: number, initY: number, mx: number, my: number) => {
    const overPeggedCards = applyInitial(initX, initY);
    const peggedCardY = peggedCardYRef.current;
    if (overPeggedCards) {
      const myMax = Math.min(
        document.documentElement.clientHeight - peggedCardY,
        document.documentElement.clientHeight - (peggedCardY + cardSize.width)
      );

      const maxScaleFactor =
        peggedCardY / (overlayCardSizeRef.current as Size).height;
      const myScale = Math.min(1, Math.abs(my) / myMax);
      const scale = 1 + myScale * (maxScaleFactor - 1);
      const unscaledWidth = overlayCardSizeRef.current
        ? overlayCardSizeRef.current.totalWidth
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
  };

  const up = () => {
    lookedAtDragInitial.current = undefined;
    overlayCardSizeRef.current = undefined;
    animate([[scope.current, { zIndex: 0, opacity: 0 }]]);
  };

  const bind = useDrag(
    ({ down, initial: [initX, initY], movement: [mx, my] }) => {
      if (down) {
        applyDown(initX, initY, mx, my);
      } else {
        up();
      }
    },
    { enabled: gameState === CribGameState.Pegging }
  );

  function getPeggingOverlay() {
    if (overlayCardSizeRef.current === undefined) {
      return undefined;
    }

    return peggingCardDatas.map((cardData, i) => {
      const overlayCardSize = overlayCardSizeRef.current as Size;
      const x = i * overlayCardSize.width;
      return (
        <FlipCard
          key={i}
          isHorizontal={false}
          startFaceUp={true}
          position={{ x, y: 0 }}
          size={overlayCardSize}
          playingCard={cardData.playingCard as PlayingCard}
          applyClass={false}
          applyDropShadow={false}
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
