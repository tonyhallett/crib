import { CSSProperties } from "@mui/material/styles/createMixins";
import { Fragment } from "react";
import { SVGHorizontalLine } from "./SVGHorizontalLine";
import { SVGVerticalLine } from "./SVGVerticalLine";
import { SVGSemiCirclePath } from "./SVGSemiCirclePath";
import { fill } from "../utilities/arrayHelpers";

export function getPegBox(from: number): { peg: number; box: number } {
  let box = Math.floor(from / 5) + 1;
  let peg = from % 5;
  if (peg === 0) {
    peg = 5;
    box -= 1;
  }
  return {
    peg,
    box,
  };
}

export function getBottomEllipseAngles(first: number) {
  return [
    first,
    first + (90 - first) / 2,
    90,
    180 - (90 - first) / 2 - first,
    180 - first,
  ];
}

export function getPeggerTrackPositionIndex(
  trackNumber: number,
  peggerNumber: number
) {
  return getReversedPeggerTrackPosition(trackNumber === 3, peggerNumber) - 1;
}

function getReversedPeggerTrackPosition(
  reversed: boolean,
  pegger: number
) {
  if (reversed) {
    switch (pegger) {
      case 2:
        return 2;
      case 1:
        return 3;
      case 3:
        return 1;
    }
  }
  return pegger;
}

export function getReversedPeggerTrackPositionIndex(pegger: number) {
  return getReversedPeggerTrackPosition(true, pegger) - 1;
}

export interface ColouredScore {
  frontPeg: number;
  backPeg: number;
  gameScore: number;
  colour: CSSProperties["color"];
}

export interface ColouredScores {
  pegger1: ColouredScore;
  pegger2: ColouredScore;
  pegger3?: ColouredScore;
}

export function CribBoard({
  pegHoleRadius,
  height,
  pegPadding,
  pegHorizontalSpacing,
  pegTrackBoxPaddingPercentage,
  strokeWidth,
  colouredScores,
  pegRadius,
}: {
  pegHoleRadius: number;
  height: number;
  pegPadding: number;
  pegHorizontalSpacing: number;
  pegTrackBoxPaddingPercentage: number;
  strokeWidth: number;
  colouredScores: ColouredScores;
  pegRadius: number;
}) {
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

  const startPegFrontY = largeEllipseHeight + 7 * pegBoxHeight + getPegHoleY(0);
  const startPegBackY = largeEllipseHeight + 7 * pegBoxHeight + getPegHoleY(1);

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
      return <use key={i} href="#pegHole" x={x} y={y} />;
    });
  const bottomEllipsePegHoles = bottomEllipsePegPositions
    .flat()
    .map(({ x, y }, i) => {
      return <use key={i} href="#pegHole" x={x} y={y} />;
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
    const peggerTrackPositionIndex = getPeggerTrackPositionIndex(track, pegger);
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
    return bottomEllipsePegPositions[peggerTrackPositionIndex][pegPosition - 1];
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
  const scores = [colouredScores.pegger1, colouredScores.pegger2];
  if (colouredScores.pegger3) {
    scores.push(colouredScores.pegger3);
  }
  const pegs = scores
    .map((peggerScore, pegger) => {
      const pegs = [peggerScore.frontPeg, peggerScore.backPeg].map(
        (score, i) => {
          const { x, y } = getPegPosition(score, pegger + 1, i === 0);
          return (
            <circle
              key={`${pegger}_{i}`}
              transform={`translate(${x},${y})`}
              stroke="none"
              r={pegRadius}
              cx={pegHoleRadius}
              cy={pegHoleRadius}
              fill={peggerScore.colour}
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

  const gameScorePegs = scores
    .map((peggerScore) => {
      return {
        score: peggerScore.gameScore,
        colour: peggerScore.colour,
      };
    })
    .map(({ score, colour }, pegger) => {
      const x = getPegHoleX(score);
      return (
        <circle
          key={pegger}
          transform={`translate(${x},${startGameScoreY + getPegHoleY(pegger)})`}
          stroke="none"
          r={pegRadius}
          cx={pegHoleRadius}
          cy={pegHoleRadius}
          fill={colour}
        />
      );
    });

  const viewBox = `-1 ${-strokeWidth} ${largeEllipseWidth + strokeWidth + 1} ${
    gamePeggingHeight + strokeWidth * 3 + 2
  }`; // tbd
  return (
    <svg
      stroke="black"
      strokeWidth={strokeWidth}
      height={height}
      viewBox={viewBox}
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
    </svg>
  );
}
