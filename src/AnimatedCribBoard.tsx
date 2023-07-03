import { CSSProperties, Fragment, useEffect, useMemo, useRef } from "react";
import { SVGHorizontalLine } from "./SVGHorizontalLine";
import { SVGVerticalLine } from "./SVGVerticalLine";
import { SVGSemiCirclePath } from "./SVGSemiCirclePath";
import { fill } from "./utilities/arrayHelpers";
import { motion } from "framer-motion";
import { useAnimateSegments } from "./fixAnimationSequence/useAnimateSegments";
import { SmartSegment } from "./fixAnimationSequence/createAnimationsFromSegments";
import { ColouredScores, getBottomEllipseAngles, getPlayerTrackPositionIndex, getPegBox, getReversedPlayerTrackPositionIndex, ColouredScore } from "./CribBoard";

export interface PegInfo{
    initial:{
        frontPeg:number,
        backPeg:number
    },
    frontPeg:number,
    backPeg:number,
    peg1Advanced:boolean,
    colour:CSSProperties["color"],
    gameScore:number
}

function getInitialPegInfo(colouredScore:ColouredScore) : PegInfo{
    return {
        initial:{
            frontPeg:colouredScore.frontPeg,
            backPeg:colouredScore.backPeg,
        },
        frontPeg:colouredScore.frontPeg,
        backPeg:colouredScore.backPeg,
        peg1Advanced:true,
        colour:colouredScore.colour,
        gameScore:colouredScore.gameScore
    }
}

export function getPegInfos(colouredScores:ColouredScores){
    const pegInfos = [
        getInitialPegInfo(colouredScores.player1),
        getInitialPegInfo(colouredScores.player2),
    ];
    if(colouredScores.player3){
        pegInfos.push(getInitialPegInfo(colouredScores.player3));
    }
    return pegInfos;
}

export function getPegIdentifier(player:number,front:boolean){
    const frontBackIdentifier = front ? "front" : "back";
    return `player${player}_${frontBackIdentifier}_peg`;
}


const getGamePegId = (player:number) => `gamePeg${player}`;

export function AnimatedCribBoard({
    pegHoleRadius, height, pegPadding, pegHorizontalSpacing, pegTrackBoxPaddingPercentage, strokeWidth, colouredScores, pegRadius, at = 0,
    // could even determine distance and keep constant
    moveDuration = 10, raiseDuration = 1
}: {
    pegHoleRadius: number;
    height: number;
    pegPadding: number;
    pegHorizontalSpacing: number;
    pegTrackBoxPaddingPercentage: number;
    strokeWidth: number;
    colouredScores: ColouredScores;
    pegRadius: number;
    at?: number;
    moveDuration?: number;
    raiseDuration?: number;
}) {
    const [scope, animate] = useAnimateSegments();
    const rendered = useRef(false);
    const pegInfos = useRef<PegInfo[]>(getPegInfos(colouredScores));
    const colouredScoresRef = useRef(colouredScores);
    const memoed = useMemo(() => {
        const pegHoleDiameter = 2 * pegHoleRadius;
        const pegBoxHeight = 5 * pegHoleDiameter + 6 * pegPadding;
        const pegBoxWidth = (2 * pegPadding) + (3 * pegHoleDiameter) + (2 * pegHorizontalSpacing);

        const pegTrackPadding = pegTrackBoxPaddingPercentage * pegBoxWidth; // between the three vertical tracks
        const largeEllipseWidth = (3 * pegBoxWidth) + (2 * pegTrackPadding);
        const largeEllipseHeight = largeEllipseWidth / 2;
        const largeEllipseInnerRadius = (pegBoxWidth + (2 * pegTrackPadding)) / 2;
        const finalPegY = ((largeEllipseHeight - largeEllipseInnerRadius) / 2) + largeEllipseInnerRadius;

        const smallEllipseWidth = 2 * pegBoxWidth + pegTrackPadding;
        const smallEllipseHeight = smallEllipseWidth / 2;
        const smallEllipseOuterXStart = pegBoxWidth + pegTrackPadding;
        const smallEllipseInnerXStart = smallEllipseOuterXStart + pegBoxWidth;
        const smallEllipseInnerRadius = pegTrackPadding / 2;
        const smallEllipseY = largeEllipseHeight + 7 * pegBoxHeight;

        const gamePeggingHeight = largeEllipseHeight + smallEllipseHeight + 7 * pegBoxHeight;

        const getPegHoleX = (i: number) => pegPadding + i * (pegHorizontalSpacing + pegHoleDiameter);

        const getPegHoleY = (i: number) => pegPadding + i * (pegPadding + pegHoleDiameter);

        const getPegBoxY = (i: number) => largeEllipseHeight + i * (pegBoxHeight);

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
                let x = radii * Math.cos(angle * Math.PI / 180);
                x += smallEllipseInnerXStart + pegTrackPadding / 2 - pegHoleRadius;
                const y = radii * Math.sin(angle * Math.PI / 180) + smallEllipseY;
                return { x, y };
            });
        });
        const rightQuadrantAngles = fill(5, (i) => (i + 1) * (70 / 5));
        const leftQuadrantAngles = rightQuadrantAngles.map((angle) => Math.abs(180 - angle));

        const getTopEllipsePegPositions = (angles: number[]) => {
            return fill(3, (i) => {
                const radii = largeEllipseHeight / 2 + getPegHoleX(i);
                return angles.map((angle) => {
                    let x = radii * Math.cos(angle * Math.PI / 180);
                    x += center - pegHoleRadius;
                    const y = -(radii * Math.sin(angle * Math.PI / 180)) + largeEllipseHeight;
                    return { x, y };
                });
            });
        };
        const leftQuadrantPegPositions = getTopEllipsePegPositions(leftQuadrantAngles);
        const rightQuadrantPegPositions = getTopEllipsePegPositions(rightQuadrantAngles);


        const topEllipsePegHoles = leftQuadrantPegPositions.flat().concat(rightQuadrantPegPositions.flat()).map(({ x, y }, i) => {
            return <use key={`topEllipse${i}`} href="#pegHole" x={x} y={y} />;
        });
        const bottomEllipsePegHoles = bottomEllipsePegPositions.flat().map(({ x, y }, i) => {
            return <use key={`bottomEllipse${i}`} href="#pegHole" x={x} y={y} />;
        });

        const getTrackAndFrom = (score: number) => {
            const ranges: [number, number][] = [[0, 36], [85, 121], [45, 81]];
            const trackRange = ranges.find(([from, to]) => {
                return score > from && score < to;
            });
            return trackRange ? { track: ranges.indexOf(trackRange) + 1, from: score - trackRange[0] } : { track: 0, from: 0 };
        };

        const getTrackPegX = (track: number, player: number) => {
            const playerTrackPositionIndex = getPlayerTrackPositionIndex(track, player);
            return (track - 1) * (pegBoxWidth + pegTrackPadding) + getPegHoleX(playerTrackPositionIndex);
        };
        const getNonEllipsePegPosition = (score: number, player: number): ({ x: number; y: number; } | undefined) => {
            const { track, from } = getTrackAndFrom(score);
            if (track !== 0) {
                const playerTrackPositionIndex = getPlayerTrackPositionIndex(track, player);
                const x = (track - 1) * (pegBoxWidth + pegTrackPadding) + getPegHoleX(playerTrackPositionIndex);

                const pegBox = getPegBox(from);
                const box = track === 3 ? pegBox.box - 1 : 7 - pegBox.box;
                const peg = track === 3 ? pegBox.peg - 1 : Math.abs(5 - pegBox.peg);
                const y = getPegHoleY(peg) + getPegBoxY(box);
                return {
                    x,
                    y
                };
            }
        };

        const getEllipsePegPosition = (score: number, player: number) => {
            if (score > 80 && score < 86) {
                return getBottomEllipsePosition(score, player);
            } else {
                return getTopEllipsePosition(score, player);
            }

        };

        const getTopEllipsePosition = (score: number, player: number) => {
            const playerTrackPositionIndex = getReversedPlayerTrackPositionIndex(player);
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

            return quadrantPositions[playerTrackPositionIndex][pegIndex];
        };

        const getBottomEllipsePosition = (score: number, player: number) => {
            const playerTrackPositionIndex = getReversedPlayerTrackPositionIndex(player);
            let pegPosition = score % 5;
            if (pegPosition === 0) {
                pegPosition = 5;
            }
            return bottomEllipsePegPositions[playerTrackPositionIndex][pegPosition - 1];
        };

        const getNonWinningPegPosition = (score: number, player: number): { x: number; y: number; } => {
            return getNonEllipsePegPosition(score, player) || getEllipsePegPosition(score, player);
        };
        const getStartPegPosition = (player: number, isFrontPeg: boolean): { x: number; y: number; } => {
            return {
                x: getTrackPegX(1, player),
                y: isFrontPeg ? startPegFrontY : startPegBackY
            };
        };
        const getPegPosition = (score: number, player: number, isFrontPeg: boolean): { x: number; y: number; } => {
            return score === 121 ? winningPegPosition :
                score === 0 ? getStartPegPosition(player, isFrontPeg) : getNonWinningPegPosition(score, player);
        };

        const colouredScores = colouredScoresRef.current;
        const scores = [colouredScores.player1, colouredScores.player2];
        if (colouredScores.player3) {
            scores.push(colouredScores.player3);
        }

        const pegs: JSX.Element[] = pegInfos.current.map((pegInfo, player) => {
            const pegs = [pegInfo.initial.frontPeg, pegInfo.initial.backPeg].map((score, i) => {
                const front = i === 0;
                const { x, y } = getPegPosition(score, player + 1, front);
                return <motion.circle
                    style={{
                        x,
                        y
                    }}
                    id={getPegIdentifier(player, front)}
                    key={`${player}_${i}`}
                    stroke="none"
                    r={pegRadius}
                    cx={pegHoleRadius}
                    cy={pegHoleRadius}
                    fill={pegInfo.colour} />;
            });
            return pegs;
        }).flat();

        const getPegRow = (numPegs: number) => {
            return fill(numPegs, (i) => <use key={i} href="#pegHole" x={getPegHoleX(i)} />);
        };

        const getGamePegPosition = (player:number,score:number) => {
            return {
                x:getPegHoleX(score),
                y:startGameScoreY + getPegHoleY(player)
            }
        }

        const gameScorePegs = scores.map((playerScore) => {
            return {
                score: playerScore.gameScore,
                colour: playerScore.colour
            };
        }).map(({ score, colour }, player) => {
            return <motion.circle
                key={player}
                id={`${getGamePegId(player)}`}
                style={
                    getGamePegPosition(player,score)
                }
                stroke="none"
                r={pegRadius}
                cx={pegHoleRadius}
                cy={pegHoleRadius}
                fill={colour} />;
        });


        const viewBox = `-1 ${-strokeWidth} ${largeEllipseWidth + strokeWidth + 1} ${gamePeggingHeight + strokeWidth * 3 + 2}`; // tbd
        const svg = <svg ref={scope} stroke="black" strokeWidth={strokeWidth} height={height} viewBox={viewBox}>
        <defs>
            <symbol id="pegCircle">
                <circle stroke="none" r={pegHoleRadius} cx={pegHoleRadius} cy={pegHoleRadius} />
            </symbol>
            <symbol id="pegHole">
                <use href="#pegCircle" fill="black" />
            </symbol>
            <symbol id="pegHoleRow">
                {/*fill(3,(i) => <use key={i} href="#pegHole" x={getPegHoleX(i)}/>)*/}
                {getPegRow(3)}
            </symbol>
            <symbol id="pegBox" width={pegBoxWidth} height={pegBoxHeight}> {/* purposely clipping outer stroke*/}
                {/* left / right */}
                <SVGVerticalLine length={pegBoxHeight} />
                <SVGVerticalLine x={pegBoxWidth} length={pegBoxHeight} />

                {/* bottom */}
                <SVGHorizontalLine length={pegBoxWidth} y={pegBoxHeight} />
                {fill(5, (i) => <use key={i} href="#pegHoleRow" y={getPegHoleY(i)} />)}
            </symbol>
            <symbol id="verticalPegboxes">
                {fill(7, (i) => <use key={i} href="#pegBox" y={getPegBoxY(i)} />)}
            </symbol>
        </defs>

        {fill(3, (i) => <Fragment key={i}>
            <use href="#verticalPegboxes" x={i * (pegBoxWidth + pegTrackPadding)} />
            <SVGHorizontalLine strokeWidth={strokeWidth / 2} y={largeEllipseHeight + strokeWidth / 4} x={i * (pegBoxWidth + pegTrackPadding)} length={pegBoxWidth} />
        </Fragment>)}

        <g fill="none" strokeWidth={strokeWidth / 2}>
            <SVGSemiCirclePath x={strokeWidth / 4} y={largeEllipseHeight} radius={largeEllipseHeight - strokeWidth / 4} top />
            <SVGSemiCirclePath x={pegBoxWidth - strokeWidth / 4} y={largeEllipseHeight} radius={largeEllipseInnerRadius + strokeWidth / 4} top />

            <SVGSemiCirclePath x={smallEllipseOuterXStart + strokeWidth / 4} y={smallEllipseY} radius={smallEllipseHeight - strokeWidth / 4} top={false} />
            <SVGSemiCirclePath x={smallEllipseInnerXStart - strokeWidth / 4} y={smallEllipseY} radius={smallEllipseInnerRadius + strokeWidth / 4} top={false} />
        </g>

        {bottomEllipsePegHoles}
        {topEllipsePegHoles}
        <SVGVerticalLine x={center} y={0} length={largeEllipseHeight - largeEllipseInnerRadius} />

        {/* final peg hole*/}
        <use href="#pegHole" {...winningPegPosition} />



        {/* start peg holes */}
        <use href="#pegHoleRow" y={startPegFrontY} />
        <use href="#pegHoleRow" y={startPegBackY} />
        {pegs}

        {/* game score holes */}
        {fill(3, i => {
            return <g key={i} transform={`translate(0,${startGameScoreY + getPegHoleY(i)})`}>
                {getPegRow(numGamesToScore)}
            </g>;
        })}
        {gameScorePegs}


    </svg>;
        
        return {
            viewBox,
            getPegRow,
            pegs,
            getPegPosition,
            getGamePegPosition,
            pegBoxWidth,
            pegBoxHeight,
            svg
        };

    }, [height, pegHoleRadius, pegHorizontalSpacing, pegPadding, pegRadius, pegTrackBoxPaddingPercentage, scope, strokeWidth]);

    
    useEffect(() => {
        const newPegInfos = getPegInfos(colouredScores);
        if (rendered.current) {
            const lastPegInfos = pegInfos.current;

            let isNewGame = true;
            for(let i=0;i<newPegInfos.length;i++){
                const newPegInfo = newPegInfos[i];
                if(newPegInfo.frontPeg + newPegInfo.backPeg !== 0){
                    isNewGame = false;
                    break;
                }
            }
            // eslint-disable-next-line complexity
            const animations = lastPegInfos.reduce<SmartSegment[]>((segments, lastPegInfo, player) => {
                const newPegInfo = newPegInfos[player];
                if(isNewGame){
                    const { x, y } = memoed.getPegPosition(0, player + 1, true);
                    segments.push([`#${getPegIdentifier(player, true)}`, { x, y }, { duration: moveDuration, at:0 }]);

                    const { x:x2, y:y2 } = memoed.getPegPosition(0, player + 1, false);
                    segments.push([`#${getPegIdentifier(player, false)}`, { x:x2, y:y2 }, { duration: moveDuration, at:0 }]);

                    if(newPegInfo.gameScore !== lastPegInfo.gameScore){

                        segments.push([`#${getGamePegId(player)}`, memoed.getGamePegPosition(player,newPegInfo.gameScore), { duration: moveDuration, at:0 }]);
                    }
                }
                else if (newPegInfo.frontPeg !== lastPegInfo.frontPeg) {
                    newPegInfo.peg1Advanced = !lastPegInfo.peg1Advanced;
                    const { x, y } = memoed.getPegPosition(newPegInfo.frontPeg, player + 1, newPegInfo.peg1Advanced);
                    segments.push([`#${getPegIdentifier(player, newPegInfo.peg1Advanced)}`, { x, y }, { duration: moveDuration, at:0 }]);
                }

                return segments;
            }, []);
            pegInfos.current = newPegInfos;
            animate(animations);
        } else {
            rendered.current = true;
        }
    }, [colouredScores, animate, moveDuration, rendered, memoed]);
    
    return memoed.svg;
}
