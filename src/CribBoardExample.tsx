import { useState } from "react";
import { CribBoard, ColouredScores, ColouredScore } from "./CribBoard";
import { AnimatedCribBoard } from "./AnimatedCribBoard";

export function CribBoardExample() {
    const [scores, setScores] = useState<ColouredScores>(
        {
            player1: {
                frontPeg: 0,
                backPeg: 0,
                colour: "red",
                gameScore:0
            },
            player2: {
                frontPeg: 0,
                backPeg: 0,
                colour: "blue",
                gameScore:1
            },
            /* player3: {
                frontPeg: 0,
                backPeg: 0,
                colour: "green",
                gameScore: 2
            } */
        }
    );

return <>
        <button onClick={() => {
            setScores(scores => {
                let frontPeg = scores.player1.frontPeg;
                const backPeg = frontPeg === 0 ? 0 : frontPeg;
                frontPeg++;
                
                return {
                    player1: {
                        frontPeg,
                        backPeg,
                        colour: "red",
                        gameScore:scores.player1.gameScore
                    },
                    player2: {
                        frontPeg,
                        backPeg,
                        colour: "blue",
                        gameScore:scores.player2.gameScore
                    },
                    player3: scores.player3 ? {
                        frontPeg,
                        backPeg,
                        colour: "green",
                        gameScore:scores.player3.gameScore
                    } : undefined
                };
            });
        }}>Next</button>
        <CribBoard
            pegHoleRadius={0.05}
            pegRadius={0.09}
            pegTrackBoxPaddingPercentage={0.3}
            height={800} // 963
            pegHorizontalSpacing={0.3}
            pegPadding={0.1}
            strokeWidth={0.01}
            colouredScores={scores} />
    </>;
}

export function AnimatedCribBoardExample() {
    const [twoPlayers,setTwoPlayers] = useState(false);
    const [player1Score,setPlayer1Score] =  useState<ColouredScore>({
        frontPeg: 0,
        backPeg: 0,
        colour: "red",
        gameScore:0
    });
    const [player2Score,setPlayer2Score] =  useState<ColouredScore>({
        frontPeg: 0,
        backPeg: 0,
        colour: "blue",
        gameScore:0
    });
    const [player3Score,setPlayer3Score] =  useState<ColouredScore>({
        frontPeg: 0,
        backPeg: 0,
        colour: "green",
        gameScore:0
    });
    const [begin,setBegin] = useState(false);
    const [scores, setScores] = useState<ColouredScores|undefined>(
    );

return <>
        <PlayerScoreSetter playerNumber={1} changed={setPlayer1Score} score={player1Score} />
        <PlayerScoreSetter playerNumber={2} changed={setPlayer2Score} score={player2Score} />
        {twoPlayers ? undefined : <PlayerScoreSetter playerNumber={3} changed={setPlayer3Score} score={player3Score} /> }
        <button disabled={begin} onClick={() => {
            setBegin(true);
            setScores({
                player1:player1Score,
                player2:player2Score,
                player3:twoPlayers ? undefined : player3Score

            })
        }}>Begin</button>
        <button onClick={() => {
            setScores({
                player1:player1Score,
                player2:player2Score,
                player3:twoPlayers ? undefined : player3Score
            })
        }}>Upate Scores</button>
        {scores && <AnimatedCribBoard
            pegHoleRadius={0.05}
            pegRadius={0.09}
            pegTrackBoxPaddingPercentage={0.3}
            height={800} // 963
            pegHorizontalSpacing={0.3}
            pegPadding={0.1}
            strokeWidth={0.01}
            colouredScores={scores} />
        }
    </>;
}

function PlayerScoreSetter(props:{score:ColouredScore,playerNumber:1|2|3,changed:(colouredScore:ColouredScore) => void}){
    return <div>
        <label>{`Player ${props.playerNumber}`}</label>
            <label>
        Text input: <input name="myInput" value={props.score.colour} onChange={e => {
            props.changed({
                ...props.score,
                colour:e.target.value,
            })
        }}/>
      </label> 

      <label>
        Front peg: <input name="myInput" type="number" min="0" max="121" value={props.score.frontPeg} onChange={e => {
            props.changed({
                ...props.score,
                frontPeg:Number.parseInt(e.target.value),
            })
        }}/>
      </label> 
      <label>
        Back peg: <input name="myInput" type="number" min="0" max="120" value={props.score.backPeg} onChange={e => {
            props.changed({
                ...props.score,
                backPeg:Number.parseInt(e.target.value),
            })
        }}/>
      </label> 
      <label>
        Game score: <input name="myInput" type="number" min="0" max="10" value={props.score.gameScore} onChange={e => {
            props.changed({
                ...props.score,
                gameScore:Number.parseInt(e.target.value),
            })
        }}/>
      </label> 
    </div>
}


