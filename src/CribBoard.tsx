import { CSSProperties } from "@mui/material/styles/createMixins";
import { Fragment, SVGProps, useState } from "react";


function getPegBox(from:number):{peg:number,box:number}{
    let box = Math.floor(from / 5) + 1;
    let peg = (from % 5);
    if(peg === 0){
        peg = 5;
        box -= 1;
    }
    return {
        peg,
        box
    }
}


interface ColouredScore{
    frontPeg:number,
    backPeg:number
    colour:CSSProperties["color"]
}

interface Scores{
    player1:ColouredScore,
    player2:ColouredScore,
    player3:ColouredScore
}

function getBottomEllipseAngles(first:number){
    return [first, first + (90 - first)/2,90, 180 - ((90 - first)/2) - first, 180 - first]
}

export function CribBoard({
    pegHoleRadius,
    height,
    pegPadding,
    pegHorizontalSpacing,
    pegTrackBoxPaddingPercentage,
    strokeWidth,
    scores,
    pegRadius
}:{
    pegHoleRadius:number,
    height:number,
    pegPadding:number,
    pegHorizontalSpacing:number,
    pegTrackBoxPaddingPercentage:number,
    strokeWidth:number,
    scores:Scores,
    pegRadius:number
}){
    const pegHoleDiameter = 2 * pegHoleRadius;
    const pegBoxHeight = 5 * pegHoleDiameter + 6 * pegPadding;
    const pegBoxWidth = (2 * pegPadding) + (3 * pegHoleDiameter) + (2 * pegHorizontalSpacing);

    const pegTrackPadding = pegTrackBoxPaddingPercentage * pegBoxWidth; // between the three vertical tracks
    const largeEllipseWidth = (3 * pegBoxWidth) + (2 * pegTrackPadding);
    const largeEllipseHeight = largeEllipseWidth / 2;
    const largeEllipseInnerRadius = (pegBoxWidth + (2 * pegTrackPadding))/2;
    const finalPegY = ((largeEllipseHeight - largeEllipseInnerRadius) / 2 ) + largeEllipseInnerRadius;
    
    const smallEllipseWidth = 2 * pegBoxWidth + pegTrackPadding;
    const smallEllipseHeight = smallEllipseWidth / 2;
    const smallEllipseOuterXStart = pegBoxWidth + pegTrackPadding;
    const smallEllipseInnerXStart = smallEllipseOuterXStart + pegBoxWidth;
    const smallEllipseInnerRadius = pegTrackPadding / 2;
    const smallEllipseY = largeEllipseHeight + 7 * pegBoxHeight;

    const calculatedHeight = largeEllipseHeight + smallEllipseHeight + 7 * pegBoxHeight;

    function getPlayerTrackPosition(trackNumber:number, playerNumber:number){
        if(trackNumber === 3){
            switch(playerNumber){
                case 2:
                    return 2;
                case 1:
                    return 3;
                case 3:
                    return 1;
            }    
        }
        return playerNumber;
    }

    const getPegHoleX = (i:number) => {
        return pegPadding + i * (pegHorizontalSpacing + pegHoleDiameter);
    }

    const getPegHoleY = (i:number) => {
        return pegPadding + i * (pegPadding + pegHoleDiameter);
    }

    const getPegBoxY = (i:number) => {
        return largeEllipseHeight + i * (pegBoxHeight);
    }

    const winningPegPosition = {x:1.5 * pegBoxWidth + pegTrackPadding, y:finalPegY};

    // eslint-disable-next-line complexity
    const getPegXY = (score:number,player:number):{x:number,y:number} => {
        let track = 0;
        let from = 0;
        if(score === 121){
            return winningPegPosition;
        }
        if(score> 0 && score < 36){
            from = score;
            track = 1;
        }else if(score > 45 && score < 81){
            from = score - 45;
            track = 3;
        }else if(score > 85 && score < 121){
            from = score - 85;
            track = 2;
        }
        if(track === 0){
            console.log(score);
            throw new Error("Not implemented");
        }
        const playerTrackPosition = getPlayerTrackPosition(track,player);
        const pegX = (track -1 )* (pegBoxWidth + pegTrackPadding) + getPegHoleX(playerTrackPosition - 1);

        const pegBox = getPegBox(from);
        const box = track === 3 ? pegBox.box - 1 : 7 - pegBox.box;
        const peg = track === 3 ? pegBox.peg - 1 : Math.abs(5 - pegBox.peg);
        const pegY = getPegHoleY(peg) + getPegBoxY(box);
        return {
            x:pegX,
            y:pegY
        }
    }

    const mappedPegs = [scores.player1,scores.player2,scores.player3].map((playerScore,player) => {
        const pegs = [playerScore.frontPeg,playerScore.backPeg].map((score,i) => {
            const {x,y} = getPegXY(score,player+1);
            return <circle  key={player*4 + i} transform={`translate(${x},${y})`} stroke="none" r={pegRadius} cx={pegHoleRadius} cy={pegHoleRadius} fill={playerScore.colour}/>
        });
        return pegs;
    }).flat();

    const angles = getBottomEllipseAngles(10);
    const bottomEllipsePegs = new Array(3).fill(0).map((_,i) => {
        const radii = smallEllipseInnerRadius + getPegHoleX(i) + pegHoleRadius;
        return angles.map((angle,j) => {
            let x = radii * Math.cos(angle * Math.PI / 180);
            x+= smallEllipseInnerXStart + pegTrackPadding/2 - pegHoleRadius;
            const y = radii * Math.sin(angle * Math.PI / 180) + smallEllipseY;
            return <use key={`${i}_${j}`} href="#pegHole" x={x} y={y}/>
        })
    }).flat();
    

    const viewBox = `-1 ${-strokeWidth} ${largeEllipseWidth + strokeWidth + 1} ${calculatedHeight + strokeWidth*3}`// tbd
    return <svg stroke="black" strokeWidth={strokeWidth} height={height} viewBox={viewBox}>
        <defs>
            <symbol id="pegCircle">
                <circle stroke="none" r={pegHoleRadius} cx={pegHoleRadius} cy={pegHoleRadius}/>
            </symbol>
            <symbol id="pegHole">
                <use href="#pegCircle" fill="black"/>
            </symbol>
            <symbol id="pegHoleRow">
                {new Array(3).fill(0).map((_,i) => <use key={i} href="#pegHole" x={getPegHoleX(i)}/>)}
            </symbol>
            <symbol id="pegBox" width={pegBoxWidth} height={pegBoxHeight} > {/* purposely clipping outer stroke*/}
                {/* left / right */}
                <SVGVerticalLine length={pegBoxHeight}/>
                <SVGVerticalLine x={pegBoxWidth} length={pegBoxHeight}/>
                
                {/* bottom */}
                <SVGHorizontalLine length={pegBoxWidth} y={pegBoxHeight}/>
                {new Array(5).fill(0).map((_,i) => <use key={i} href="#pegHoleRow" y={getPegHoleY(i)}/>)}
            </symbol>
            <symbol id="verticalPegboxes">
                {new Array(7).fill(0).map((_,i) => <use key={i} href="#pegBox" y={getPegBoxY(i)}/>)}
            </symbol>
        </defs>
        
        

        {new Array(3).fill(0).map((_,i) => <Fragment key={i}>
            <use href="#verticalPegboxes" x={i* (pegBoxWidth + pegTrackPadding)}/>
            <SVGHorizontalLine strokeWidth={strokeWidth/2} y={largeEllipseHeight + strokeWidth/4} x={i* (pegBoxWidth + pegTrackPadding)} length={pegBoxWidth}/>
        </Fragment>)}
        
        <g fill="none" strokeWidth={strokeWidth/2}>
            <SVGSemiCirclePath x={strokeWidth/4} y={largeEllipseHeight} radius={largeEllipseHeight - strokeWidth/4} top/>
            <SVGSemiCirclePath x={pegBoxWidth - strokeWidth/4} y={largeEllipseHeight} radius={largeEllipseInnerRadius + strokeWidth/4} top/>
            
            <SVGSemiCirclePath x={smallEllipseOuterXStart + strokeWidth/4} y={smallEllipseY} radius={smallEllipseHeight - strokeWidth/4} top={false}/>
            <SVGSemiCirclePath x={smallEllipseInnerXStart - strokeWidth/4} y={smallEllipseY} radius={smallEllipseInnerRadius + strokeWidth/4} top={false}/>
        </g>

        {bottomEllipsePegs}
        
        {/* final peg hole*/}
        <use href="#pegHole" {...winningPegPosition}/>
        {
            mappedPegs
        }
        
    </svg>
}




type SVGHorizontalVerticalLineProps = Omit<SVGProps<SVGLineElement>,"x1"|"x2"|"y1"|"y2"> & {y?:number,x?:number,length:number}

type SVGSemiCircleProps = Omit<SVGProps<SVGPathElement>,"d"> & {x:number,y:number,radius:number,top:boolean}
function SVGSemiCirclePath(props:SVGSemiCircleProps){
    const {x,y,radius,top,...remainder} = props;
    const d = `M${x},${y} A${radius},${radius} 0 0,${(top?1:0)} ${x + 2 *radius},${y}`;
    return <path d={d} {...remainder}/>
}

function SVGHorizontalLine(props:SVGHorizontalVerticalLineProps){
    // eslint-disable-next-line prefer-const
    let {y,x,length,...remainder} = props;
    x = x ?? 0;
    return <line x1={x} x2={x + length} y1={y} y2={y} {...remainder}/>
}

function SVGVerticalLine(props:SVGHorizontalVerticalLineProps){
    // eslint-disable-next-line prefer-const
    let {y,x,length,...remainder} = props;
    y = y ?? 0;
    return <line x1={x} x2={x} y1={y} y2={y + length} {...remainder}/>
}

const scoresDemo:Scores[] = [
    {
        player1:{
          frontPeg:20,
          backPeg:1,
          colour:"red"
        },
        player2:{
          frontPeg:50,
          backPeg:46,
          colour:"blue"
        },
        player3:{
          frontPeg:110,
          backPeg:86,
          colour:"green"
        }
      },
      {
        player2:{
          frontPeg:20,
          backPeg:1,
          colour:"red"
        },
        player3:{
          frontPeg:50,
          backPeg:46,
          colour:"blue"
        },
        player1:{
          frontPeg:110,
          backPeg:86,
          colour:"green"
        }
      },
      {
        player3:{
          frontPeg:20,
          backPeg:1,
          colour:"red"
        },
        player1:{
          frontPeg:50,
          backPeg:46,
          colour:"blue"
        },
        player2:{
          frontPeg:110,
          backPeg:86,
          colour:"green"
        }
      }
]

export function CribBoardExample(){
    const [scores, setScores] = useState<Scores>(
        {
            player1:{
              frontPeg:2,
              backPeg:1,
              colour:"red"
            },
            player2:{
              frontPeg:2,
              backPeg:1,
              colour:"blue"
            },
            player3:{
              frontPeg:2,
              backPeg:1,
              colour:"green"
            }
          },
    );


    return <>
        <button onClick={() => {
            setScores(scores => {
                let frontPeg = scores.player1.frontPeg;
                switch(frontPeg){
                    case 35:
                        frontPeg = 46;
                        break;
                    case 80:
                        frontPeg = 86;
                        break;
                }
                frontPeg++;
                const backPeg = frontPeg - 1;
                return {
                    player1:{
                        frontPeg,
                        backPeg,
                        colour:"red"
                      },
                      player2:{
                        frontPeg,
                        backPeg,
                        colour:"blue"
                      },
                      player3:{
                        frontPeg,
                        backPeg,
                        colour:"green"
                      }
                }
            })
        }}>Next</button>
        <CribBoard 
        pegHoleRadius={0.05} 
        pegRadius={0.09}
        pegTrackBoxPaddingPercentage={0.3} 
        height={800} // 963
        pegHorizontalSpacing={0.3} 
        pegPadding={0.1}
        strokeWidth={0.01}
        scores= {scores}
        />
  </>
}