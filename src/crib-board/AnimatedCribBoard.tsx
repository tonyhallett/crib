import {
  CSSProperties,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { SVGHorizontalLine } from "./SVGHorizontalLine";
import { SVGVerticalLine } from "./SVGVerticalLine";
import { SVGSemiCirclePath } from "./SVGSemiCirclePath";
import { fill } from "../utilities/arrayHelpers";
import { motion } from "framer-motion";
import { useAnimateSegments } from "../fixAnimationSequence/useAnimateSegments";
import { SmartSegment } from "../fixAnimationSequence/createAnimationsFromSegments";
import {
  ColouredScores,
  getBottomEllipseAngles,
  getPeggerTrackPositionIndex as getPeggerTrackPositionIndex,
  getPegBox,
  getReversedPeggerTrackPositionIndex as getReversedPeggerTrackPositionIndex,
  ColouredScore,
} from "./CribBoard";
import { OnComplete } from "../fixAnimationSequence/common-motion-types";

export interface PegInfo {
  initial: {
    frontPeg: number;
    backPeg: number;
  };
  frontPeg: number;
  backPeg: number;
  peg1Advanced: boolean;
  colour: CSSProperties["color"];
  gameScore: number;
}

function getPegInfo(colouredScore: ColouredScore): PegInfo {
  return {
    initial: {
      frontPeg: colouredScore.frontPeg,
      backPeg: colouredScore.backPeg,
    },
    frontPeg: colouredScore.frontPeg,
    backPeg: colouredScore.backPeg,
    peg1Advanced: true,
    colour: colouredScore.colour,
    gameScore: colouredScore.gameScore,
  };
}

export function getPegInfos(colouredScores: ColouredScores) {
  const pegInfos = [
    getPegInfo(colouredScores.pegger1),
    getPegInfo(colouredScores.pegger2),
  ];
  if (colouredScores.pegger3) {
    pegInfos.push(getPegInfo(colouredScores.pegger3));
  }
  return pegInfos;
}

export function getNewPegInfos(
  colouredScores: ColouredScores,
  oldPegInfos: PegInfo[]
): PegInfo[] {
  const newPegInfos = getPegInfos(colouredScores);
  newPegInfos.forEach((newPegInfo, index) => {
    newPegInfo.peg1Advanced = oldPegInfos[index].peg1Advanced;
  });
  return newPegInfos;
}

export function getPegIdentifier(pegger: number, front: boolean) {
  const frontBackIdentifier = front ? "front" : "back";
  return `pegger${pegger}_${frontBackIdentifier}_peg`;
}

const getGamePegId = (pegger: number) => `gamePeg${pegger}`;

const getIsNewGame = (newPegInfos: PegInfo[]) => {
  let isNewGame = true;
  for (let i = 0; i < newPegInfos.length; i++) {
    const newPegInfo = newPegInfos[i];
    if (newPegInfo.frontPeg + newPegInfo.backPeg !== 0) {
      isNewGame = false;
      break;
    }
  }
  return isNewGame;
};

export const defaultCribBoardDuration = 2;
export function AnimatedCribBoard({
  cribBoardUrl,
  pegHoleRadius,
  height,
  width,
  pegPadding,
  pegHorizontalSpacing,
  pegTrackBoxPaddingPercentage,
  strokeWidth,
  colouredScores,
  pegRadius,
  at = 0,
  // could even determine distance and keep constant
  moveDuration = defaultCribBoardDuration,
  onComplete,
  style,
}: {
  cribBoardUrl: string;
  pegHoleRadius: number;
  height: number;
  width?: number;
  pegPadding: number;
  pegHorizontalSpacing: number;
  pegTrackBoxPaddingPercentage: number;
  strokeWidth: number;
  colouredScores: ColouredScores;
  pegRadius: number;
  at?: number;
  moveDuration?: number;
  onComplete?: () => void;
  style?: CSSProperties;
}) {
  const [scope, animate] = useAnimateSegments();
  const rendered = useRef(false);
  const pegInfos = useRef<PegInfo[]>(getPegInfos(colouredScores));
  const colouredScoresRef = useRef(colouredScores);
  const memoed = useMemo(() => {
    const pegHoleDiameter = 2 * pegHoleRadius;
    const pegBoxHeight = 5 * pegHoleDiameter + 6 * pegPadding;
    const pegBoxWidth =
      2 * pegPadding + 3 * pegHoleDiameter + 2 * pegHorizontalSpacing;

    const pegTrackPadding = pegTrackBoxPaddingPercentage * pegBoxWidth; // between the three vertical tracks
    const largeEllipseWidth = 3 * pegBoxWidth + 2 * pegTrackPadding;
    const largeEllipseHeight = largeEllipseWidth / 2;
    const largeEllipseInnerRadius = (pegBoxWidth + 2 * pegTrackPadding) / 2;
    const finalPegY =
      (largeEllipseHeight - largeEllipseInnerRadius) / 2 +
      largeEllipseInnerRadius;

    const smallEllipseWidth = 2 * pegBoxWidth + pegTrackPadding;
    const smallEllipseHeight = smallEllipseWidth / 2;
    const smallEllipseOuterXStart = pegBoxWidth + pegTrackPadding;
    const smallEllipseInnerXStart = smallEllipseOuterXStart + pegBoxWidth;
    const smallEllipseInnerRadius = pegTrackPadding / 2;
    const smallEllipseY = largeEllipseHeight + 7 * pegBoxHeight;

    const gamePeggingHeight =
      largeEllipseHeight + smallEllipseHeight + 7 * pegBoxHeight;

    const getPegHoleX = (i: number) =>
      pegPadding + i * (pegHorizontalSpacing + pegHoleDiameter);

    const getPegHoleY = (i: number) =>
      pegPadding + i * (pegPadding + pegHoleDiameter);

    const getPegBoxY = (i: number) => largeEllipseHeight + i * pegBoxHeight;

    const center = 1.5 * pegBoxWidth + pegTrackPadding;
    const winningPegPosition = { x: center - pegHoleRadius, y: finalPegY };

    const startPegFrontY =
      largeEllipseHeight + 7 * pegBoxHeight + getPegHoleY(0);
    const startPegBackY =
      largeEllipseHeight + 7 * pegBoxHeight + getPegHoleY(1);

    const gameScorePadding = pegPadding;
    const numGamesToScore = 10;
    const startGameScoreY = gamePeggingHeight + gameScorePadding;

    const angles = getBottomEllipseAngles(10);
    const bottomEllipsePegPositions = fill(3, (i) => {
      const radii = smallEllipseInnerRadius + getPegHoleX(i) + pegHoleRadius;
      return angles.map((angle) => {
        let x = radii * Math.cos((angle * Math.PI) / 180);
        x += smallEllipseInnerXStart + pegTrackPadding / 2 - pegHoleRadius;
        const y = radii * Math.sin((angle * Math.PI) / 180) + smallEllipseY;
        return { x, y };
      });
    });
    const rightQuadrantAngles = fill(5, (i) => (i + 1) * (70 / 5));
    const leftQuadrantAngles = rightQuadrantAngles.map((angle) =>
      Math.abs(180 - angle)
    );

    const getTopEllipsePegPositions = (angles: number[]) => {
      return fill(3, (i) => {
        const radii = largeEllipseHeight / 2 + getPegHoleX(i);
        return angles.map((angle) => {
          let x = radii * Math.cos((angle * Math.PI) / 180);
          x += center - pegHoleRadius;
          const y =
            -(radii * Math.sin((angle * Math.PI) / 180)) + largeEllipseHeight;
          return { x, y };
        });
      });
    };
    const leftQuadrantPegPositions =
      getTopEllipsePegPositions(leftQuadrantAngles);
    const rightQuadrantPegPositions =
      getTopEllipsePegPositions(rightQuadrantAngles);

    const topEllipsePegHoles = leftQuadrantPegPositions
      .flat()
      .concat(rightQuadrantPegPositions.flat())
      .map(({ x, y }, i) => {
        return <use key={`topEllipse${i}`} href="#pegHole" x={x} y={y} />;
      });
    const bottomEllipsePegHoles = bottomEllipsePegPositions
      .flat()
      .map(({ x, y }, i) => {
        return <use key={`bottomEllipse${i}`} href="#pegHole" x={x} y={y} />;
      });

    const getTrackAndFrom = (score: number) => {
      const ranges: [number, number][] = [
        [0, 36],
        [85, 121],
        [45, 81],
      ];
      const trackRange = ranges.find(([from, to]) => {
        return score > from && score < to;
      });
      return trackRange
        ? { track: ranges.indexOf(trackRange) + 1, from: score - trackRange[0] }
        : { track: 0, from: 0 };
    };

    const getTrackPegX = (track: number, pegger: number) => {
      const peggerTrackPositionIndex = getPeggerTrackPositionIndex(
        track,
        pegger
      );
      return (
        (track - 1) * (pegBoxWidth + pegTrackPadding) +
        getPegHoleX(peggerTrackPositionIndex)
      );
    };

    const getNonEllipsePegPosition = (
      score: number,
      pegger: number
    ): { x: number; y: number } | undefined => {
      const { track, from } = getTrackAndFrom(score);
      if (track !== 0) {
        const peggerTrackPositionIndex = getPeggerTrackPositionIndex(
          track,
          pegger
        );
        const x =
          (track - 1) * (pegBoxWidth + pegTrackPadding) +
          getPegHoleX(peggerTrackPositionIndex);

        const pegBox = getPegBox(from);
        const box = track === 3 ? pegBox.box - 1 : 7 - pegBox.box;
        const peg = track === 3 ? pegBox.peg - 1 : Math.abs(5 - pegBox.peg);
        const y = getPegHoleY(peg) + getPegBoxY(box);
        return {
          x,
          y,
        };
      }
    };

    const getEllipsePegPosition = (score: number, pegger: number) => {
      if (score > 80 && score < 86) {
        return getBottomEllipsePosition(score, pegger);
      } else {
        return getTopEllipsePosition(score, pegger);
      }
    };

    const getTopEllipsePosition = (score: number, pegger: number) => {
      const peggerTrackPositionIndex =
        getReversedPeggerTrackPositionIndex(pegger);
      let pegPosition = score % 5;
      if (pegPosition === 0) {
        pegPosition = 5;
      }
      let pegIndex = pegPosition - 1;
      let quadrantPositions = leftQuadrantPegPositions;

      if (score >= 41) {
        quadrantPositions = rightQuadrantPegPositions;
        pegIndex = Math.abs(5 - pegPosition);
      }

      return quadrantPositions[peggerTrackPositionIndex][pegIndex];
    };

    const getBottomEllipsePosition = (score: number, pegger: number) => {
      const peggerTrackPositionIndex =
        getReversedPeggerTrackPositionIndex(pegger);
      let pegPosition = score % 5;
      if (pegPosition === 0) {
        pegPosition = 5;
      }
      return bottomEllipsePegPositions[peggerTrackPositionIndex][
        pegPosition - 1
      ];
    };

    const getNonWinningPegPosition = (
      score: number,
      pegger: number
    ): { x: number; y: number } => {
      return (
        getNonEllipsePegPosition(score, pegger) ||
        getEllipsePegPosition(score, pegger)
      );
    };
    const getStartPegPosition = (
      pegger: number,
      isFrontPeg: boolean
    ): { x: number; y: number } => {
      return {
        x: getTrackPegX(1, pegger),
        y: isFrontPeg ? startPegFrontY : startPegBackY,
      };
    };
    const getPegPosition = (
      score: number,
      pegger: number,
      isFrontPeg: boolean
    ): { x: number; y: number } => {
      return score === 121
        ? winningPegPosition
        : score === 0
        ? getStartPegPosition(pegger, isFrontPeg)
        : getNonWinningPegPosition(score, pegger);
    };

    const colouredScores = colouredScoresRef.current;
    const scores = [colouredScores.pegger1, colouredScores.pegger2];
    if (colouredScores.pegger3) {
      scores.push(colouredScores.pegger3);
    }

    const pegs: JSX.Element[] = pegInfos.current
      .map((pegInfo, pegger) => {
        const pegs = [pegInfo.initial.frontPeg, pegInfo.initial.backPeg].map(
          (score, i) => {
            const front = i === 0;
            const { x, y } = getPegPosition(score, pegger + 1, front);
            return (
              <motion.circle
                style={{
                  x,
                  y,
                }}
                id={getPegIdentifier(pegger, front)}
                key={`${pegger}_${i}`}
                stroke="none"
                r={pegRadius}
                cx={pegHoleRadius}
                cy={pegHoleRadius}
                fill={pegInfo.colour}
              />
            );
          }
        );
        return pegs;
      })
      .flat();

    const getPegRow = (numPegs: number) => {
      return fill(numPegs, (i) => (
        <use key={i} href="#pegHole" x={getPegHoleX(i)} />
      ));
    };

    const getGamePegPosition = (pegger: number, score: number) => {
      return {
        x: getPegHoleX(score),
        y: startGameScoreY + getPegHoleY(pegger),
      };
    };

    const gameScorePegs = scores
      .map((peggerScore) => {
        return {
          score: peggerScore.gameScore,
          colour: peggerScore.colour,
        };
      })
      .map(({ score, colour }, pegger) => {
        return (
          <motion.circle
            key={pegger}
            id={`${getGamePegId(pegger)}`}
            style={getGamePegPosition(pegger, score)}
            stroke="none"
            r={pegRadius}
            cx={pegHoleRadius}
            cy={pegHoleRadius}
            fill={colour}
          />
        );
      });

    const lastScoreY = startGameScoreY + getPegHoleY(3);
    const viewBox = `0 0 ${largeEllipseWidth + pegPadding * 2} ${
      lastScoreY + pegPadding * 2
    }`; // tbd
    const svg = (
      <svg
        ref={scope}
        stroke="black"
        strokeWidth={strokeWidth}
        height={height}
        width={width}
        viewBox={viewBox}
        style={style}
      >
        <defs>
          <symbol id="pegCircle">
            <circle
              stroke="none"
              r={pegHoleRadius}
              cx={pegHoleRadius}
              cy={pegHoleRadius}
            />
          </symbol>
          <symbol id="pegHole">
            <use href="#pegCircle" fill="black" />
          </symbol>
          <symbol id="pegHoleRow">
            {/*fill(3,(i) => <use key={i} href="#pegHole" x={getPegHoleX(i)}/>)*/}
            {getPegRow(3)}
          </symbol>
          <symbol id="pegBox" width={pegBoxWidth} height={pegBoxHeight}>
            {" "}
            {/* purposely clipping outer stroke*/}
            {/* left / right */}
            <SVGVerticalLine length={pegBoxHeight} />
            <SVGVerticalLine x={pegBoxWidth} length={pegBoxHeight} />
            {/* bottom */}
            <SVGHorizontalLine length={pegBoxWidth} y={pegBoxHeight} />
            {fill(5, (i) => (
              <use key={i} href="#pegHoleRow" y={getPegHoleY(i)} />
            ))}
          </symbol>
          <symbol id="verticalPegboxes">
            {fill(7, (i) => (
              <use key={i} href="#pegBox" y={getPegBoxY(i)} />
            ))}
          </symbol>
        </defs>

        <image
          x="0"
          y="0"
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          href={cribBoardUrl}
        />
        <g transform={`translate(${pegPadding},${pegPadding})`}>
          {fill(3, (i) => (
            <Fragment key={i}>
              <use
                href="#verticalPegboxes"
                x={i * (pegBoxWidth + pegTrackPadding)}
              />
              <SVGHorizontalLine
                strokeWidth={strokeWidth / 2}
                y={largeEllipseHeight + strokeWidth / 4}
                x={i * (pegBoxWidth + pegTrackPadding)}
                length={pegBoxWidth}
              />
            </Fragment>
          ))}

          <g fill="none" strokeWidth={strokeWidth / 2}>
            <SVGSemiCirclePath
              x={strokeWidth / 4}
              y={largeEllipseHeight}
              radius={largeEllipseHeight - strokeWidth / 4}
              top
            />
            <SVGSemiCirclePath
              x={pegBoxWidth - strokeWidth / 4}
              y={largeEllipseHeight}
              radius={largeEllipseInnerRadius + strokeWidth / 4}
              top
            />

            <SVGSemiCirclePath
              x={smallEllipseOuterXStart + strokeWidth / 4}
              y={smallEllipseY}
              radius={smallEllipseHeight - strokeWidth / 4}
              top={false}
            />
            <SVGSemiCirclePath
              x={smallEllipseInnerXStart - strokeWidth / 4}
              y={smallEllipseY}
              radius={smallEllipseInnerRadius + strokeWidth / 4}
              top={false}
            />
          </g>

          {bottomEllipsePegHoles}
          {topEllipsePegHoles}
          <SVGVerticalLine
            strokeWidth={strokeWidth / 2}
            x={center}
            y={0}
            length={largeEllipseHeight - largeEllipseInnerRadius}
          />

          {/* final peg hole*/}
          <use href="#pegHole" {...winningPegPosition} />

          {/* start peg holes */}
          <use href="#pegHoleRow" y={startPegFrontY} />
          <use href="#pegHoleRow" y={startPegBackY} />
          {pegs}

          {/* game score holes */}
          {fill(3, (i) => {
            return (
              <g
                key={i}
                transform={`translate(0,${startGameScoreY + getPegHoleY(i)})`}
              >
                {getPegRow(numGamesToScore)}
              </g>
            );
          })}
          {gameScorePegs}
        </g>
      </svg>
    );

    return {
      viewBox,
      getPegRow,
      pegs,
      getPegPosition,
      getGamePegPosition,
      pegBoxWidth,
      pegBoxHeight,
      svg,
    };
  }, [
    cribBoardUrl,
    height,
    pegHoleRadius,
    pegHorizontalSpacing,
    pegPadding,
    pegRadius,
    pegTrackBoxPaddingPercentage,
    scope,
    strokeWidth,
    style,
    width,
  ]);

  const animatePegPosition = useCallback(
    (
      segments: SmartSegment[],
      score: number,
      pegger: number,
      isFrontPeg: boolean,
      onComplete?: OnComplete
    ) => {
      const { x, y } = memoed.getPegPosition(score, pegger + 1, isFrontPeg);
      segments.push([
        `#${getPegIdentifier(pegger, isFrontPeg)}`,
        { x, y },
        { duration: moveDuration, at, y: { onComplete } },
      ]);
    },
    [at, memoed, moveDuration]
  );

  const animateGameScore = useCallback(
    (segments: SmartSegment[], pegger: number, gameScore: number) => {
      segments.push([
        `#${getGamePegId(pegger)}`,
        memoed.getGamePegPosition(pegger, gameScore),
        { duration: moveDuration, at },
      ]);
    },
    [at, memoed, moveDuration]
  );

  const animatePegsToStartPositions = useCallback(
    (
      segments: SmartSegment[],
      pegger: number,
      onComplete: OnComplete | undefined
    ) => {
      animatePegPosition(segments, 0, pegger, true);
      animatePegPosition(segments, 0, pegger, false, onComplete);
    },
    [animatePegPosition]
  );

  const animateNewGamePegs = useCallback(
    (
      segments: SmartSegment[],
      pegger: number,
      newPegInfo: PegInfo,
      lastPegInfo: PegInfo,
      onComplete: OnComplete | undefined
    ) => {
      animatePegsToStartPositions(segments, pegger, onComplete);
      if (newPegInfo.gameScore !== lastPegInfo.gameScore) {
        animateGameScore(segments, pegger, newPegInfo.gameScore);
      }
      newPegInfo.peg1Advanced = true;
    },
    [animateGameScore, animatePegsToStartPositions]
  );

  const animatePeg = useCallback(
    (
      segments: SmartSegment[],
      newPegInfo: PegInfo,
      lastPegInfo: PegInfo,
      pegger: number,
      onComplete: OnComplete | undefined
    ) => {
      newPegInfo.peg1Advanced = !lastPegInfo.peg1Advanced;
      animatePegPosition(
        segments,
        newPegInfo.frontPeg,
        pegger,
        newPegInfo.peg1Advanced,
        onComplete
      );
    },
    [animatePegPosition]
  );

  useEffect(() => {
    if (rendered.current) {
      const lastPegInfos = pegInfos.current;
      const newPegInfos = getNewPegInfos(colouredScores, lastPegInfos);

      const isNewGame = getIsNewGame(newPegInfos);

      const animations = lastPegInfos.reduce<SmartSegment[]>(
        (segments, lastPegInfo, player) => {
          const newGameMovedCompleted =
            player === lastPegInfos.length - 1 ? onComplete : undefined;

          const newPegInfo = newPegInfos[player];
          if (isNewGame) {
            animateNewGamePegs(
              segments,
              player,
              newPegInfo,
              lastPegInfo,
              newGameMovedCompleted
            );
          } else if (newPegInfo.frontPeg !== lastPegInfo.frontPeg) {
            animatePeg(segments, newPegInfo, lastPegInfo, player, onComplete);
          }

          return segments;
        },
        []
      );
      pegInfos.current = newPegInfos;
      animate(animations);
    } else {
      rendered.current = true;
    }
  }, [
    colouredScores,
    animate,
    moveDuration,
    rendered,
    memoed,
    animateNewGamePegs,
    animatePeg,
    onComplete,
  ]);
  return memoed.svg;
}
