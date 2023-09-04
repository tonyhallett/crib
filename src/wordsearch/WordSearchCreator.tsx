import { Button, Grid, Paper, Typography } from "@mui/material";
import { useReducer } from "react";
import { fill } from "../utilities/arrayHelpers";
import { Orientation, getLettersOnGrid } from "./orientationLettersOnGridMap";

interface GridCellPosition {
    row:number,
    col:number
}

export interface PositionedWord {
    word: string;
    id:number,
    start: GridCellPosition,
    orientation:Orientation,
    // could have each letter with a state enum - ok, conflict
}

interface WordSearchCreatorInitialState {
    words:PositionedWord[];
    numRows:number,
    numColumns:number,
    selectedWordId:number,
}
interface WordSearchCreatorState extends WordSearchCreatorInitialState {
    wordGrid:WordSearchGrid
}

enum GridCellState {Ok,Conflict, OkSelected, ConflictSelected}
interface ContributingLetter{
    letter:string,
    wordId:number
}
interface GridCell {
    letter:string,
    contributingWordId?:number,
    state:GridCellState,
    contributingLetters:ContributingLetter[]
}
type GridRow = GridCell[]
type WordSearchGrid = GridRow[]
    

interface Action {
    type:string;
}

interface NewWordSearchAction extends Action {
    type:"newWordSearch";
}

interface ClickedSquareAction extends Action, GridCellPosition {
    type:"clickedSquare";
}
interface SelectWordAction extends Action {
    type:"selectWord";
    id:number
}

type WordSearchCreatorAction = NewWordSearchAction | ClickedSquareAction | SelectWordAction;

const hasDuplicates = (arr:unknown[]) => arr.length !== new Set(arr).size;

// eslint-disable-next-line complexity
export function wordSearchCreatorReducer(state: WordSearchCreatorState, action: WordSearchCreatorAction){
    switch(action.type){
        case "newWordSearch":
            // clear word list and clear the grid
            return stateFromInitial({
                numColumns:state.numColumns,
                numRows:state.numRows,
                selectedWordId:-1,
                words:[]
            })
            break;
        case "clickedSquare":
            // could have multiple contexts....
            // if there is a selected word we are setting its starting point
            if(state.selectedWordId !== -1){
                const words = state.words;
                const selectedWordIndex = words.findIndex((word) => word.id === state.selectedWordId);
                const word = words[selectedWordIndex];
                const currentWordStart = word.start;
                if(currentWordStart.col !== action.col || currentWordStart.row !== action.row){
                    const oldLettersOnGrid = getLettersOnGrid(word);
                    // although current ui does not use word start
                    const newWords = state.words.map(word => {
                        if(word.id === state.selectedWordId){
                            const newWord = {...word};
                            newWord.start = {
                                row:action.row,
                                col:action.col
                            }
                        }
                        return word;
                    });
                    const newLettersOnGrid = getLettersOnGrid(newWords[selectedWordIndex]);
                    const newWordGrid = state.wordGrid.map((row, rowIndex) => {
                        // eslint-disable-next-line complexity
                        return row.map((cell, colIndex) => {
                            const oldLetterOnGrid = oldLettersOnGrid.find((letterOnGrid) => {
                                if(letterOnGrid.row === rowIndex && letterOnGrid.col === colIndex){
                                    return true;
                                }
                                return false;
                            });
                            const newLetterOnGrid = newLettersOnGrid.find((letterOnGrid) => {
                                if(letterOnGrid.row === rowIndex && letterOnGrid.col === colIndex){
                                    return true;
                                }
                                return false;
                            });
                            if(oldLetterOnGrid && newLetterOnGrid){
                                if(oldLetterOnGrid.letter === newLetterOnGrid.letter){
                                    return cell;
                                }
                                const newCell = {...cell};
                                // as selected takes precedence
                                newCell.letter = newLetterOnGrid.letter;
                                newCell.contributingWordId = state.selectedWordId;
                                newCell.contributingLetters = newCell.contributingLetters.map((contributingLetter) => {
                                    if(contributingLetter.wordId === state.selectedWordId){
                                        return {
                                            ...contributingLetter,
                                            letter:newLetterOnGrid.letter
                                        }
                                    }
                                    return contributingLetter;
                                });
                                // calculated state
                                const hasConflict = hasDuplicates(newCell.contributingLetters.map((contributingLetter) => contributingLetter.letter));
                                newCell.state = hasConflict ? GridCellState.ConflictSelected : GridCellState.OkSelected;
                                return newCell;
                            }else{
                                if(oldLetterOnGrid){
                                    const newCell = {...cell};
                                    // remove letter from this word
                                    newCell.contributingLetters = newCell.contributingLetters.filter((contributingLetter) => contributingLetter.wordId !== state.selectedWordId);
                                    const hasConflict = hasDuplicates(newCell.contributingLetters.map((contributingLetter) => contributingLetter.letter));
                                    newCell.state = hasConflict ? GridCellState.Conflict : GridCellState.Ok;
                                    if(newCell.contributingLetters.length === 0){
                                        newCell.letter = "";
                                        newCell.contributingWordId = undefined;
                                    }else{
                                        if(hasConflict){
                                            newCell.letter = "*";
                                            newCell.contributingWordId = -1;
                                        }else{
                                            newCell.letter = newCell.contributingLetters[0].letter;
                                            // BUT !!!!!!
                                            newCell.contributingWordId = newCell.contributingLetters[0].wordId;

                                        }
                                    }
                                    // need to set the letter and contributing word id - may not be one - GIVEN THAT THIS WAS ALREADY THE SELECTED WORD
                                    // might want a class for the cell ?
                                    return newCell;
                                }else{

                                }
                            }
                        });
                    })
                }
                

            }
            

    }
    return state;
}




function stateFromInitial(initialState:WordSearchCreatorInitialState):WordSearchCreatorState {
    const wordSearchGrid:WordSearchGrid = fill(initialState.numRows, () => {
        return fill(initialState.numColumns, () => {
            return {letter:"",state:GridCellState.Ok, contributingLetters:[]}
        })
    })
    initialState.words.forEach((word) => {
        const lettersOnGrid = getLettersOnGrid(word);
        const isSelected = word.id === initialState.selectedWordId;
        // eslint-disable-next-line complexity
        lettersOnGrid.forEach((letterOnGrid) => {
            // todo check that it is within  bounds
            const cell = wordSearchGrid[letterOnGrid.row][letterOnGrid.col];
            cell.contributingLetters.push({letter:letterOnGrid.letter, wordId:word.id});
            if(cell.letter === ""){
                cell.letter = letterOnGrid.letter;
                cell.contributingWordId = word.id;
                cell.state = isSelected ? GridCellState.OkSelected : GridCellState.Ok;
            } else {
                cell.letter = isSelected ? letterOnGrid.letter : "*";
                cell.contributingWordId = isSelected ? word.id : -1;
                cell.state = isSelected ? GridCellState.ConflictSelected : GridCellState.Conflict;
            }
        });
    });
    return {
        ...initialState,
        wordGrid:wordSearchGrid
    };
}
// todo - id should be optional
export function useWordSearchCreator(initialState:WordSearchCreatorInitialState = {
    words: [
        {word:"HELLO",id:1, orientation:Orientation.LeftToRight, start:{row:0,col:0}}, 
        {word:"YOU",id:2, orientation:Orientation.RightToLeft, start:{row:0,col:7}},
        
        {word:"CONFLICT", id:3, orientation:Orientation.TopToBottom, start:{row:0,col:7}},
        {word:"UP", id:4, orientation:Orientation.BottomToTop, start:{row:7,col:6}},

        {word:"TLBR", id:5, orientation:Orientation.TopLeftToBottomRight, start:{row:1,col:0}},
        {word:"BRTL", id:6, orientation:Orientation.BottomRightToTopLeft, start:{row:4,col:4}},
        {word:"TRBL", id:7, orientation:Orientation.TopRightToBottomLeft, start:{row:4,col:6}},
        {word:"BLTR", id:8, orientation:Orientation.BottomLeftToTopRight, start:{row:7,col:2}},
    ],
        
    numRows:8,
    numColumns:8,
    selectedWordId:1,
}){
    return useReducer(wordSearchCreatorReducer, stateFromInitial(initialState));
}

const wordColours:string[] = [
    "green",
    "blue",
    "pink",
    "cyan",
    "yellow",
    "purple",
    "brown",
    "limegreen"
]
// eslint-disable-next-line complexity
function getCellColor(cellState:GridCellState,wordIndex:number){
    switch(cellState){
        case GridCellState.Ok:
            if(wordIndex === -1){
                return "white";
            }
            return wordColours[wordIndex]
        case GridCellState.OkSelected:
            return "gray";
        case GridCellState.Conflict:
            return "orange";
        case GridCellState.ConflictSelected:
            return "red";
    }
}

export function WordSearchCreator(){
    const [state, dispatch] = useWordSearchCreator();
    return <>
        <Button onClick={() => dispatch({type:"newWordSearch"})}>New Word Search</Button>

        {state.words.map((word) => {
            return <div key={word.id}>{word.word}</div>
        })}
        
        <Grid container spacing={1} justifyContent="center">
        {state.wordGrid.map((row, rowIndex) => (
          <Grid key={rowIndex} item container justifyContent="center" xs={12}>
            {row.map((cell, colIndex) => (
              <Grid key={colIndex} item>
                <Paper
                  onClick={() => dispatch({type:"clickedSquare",row:rowIndex,col:colIndex})}
                  style={{
                    width: "40px", // Adjust this size
                    height: "40px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: getCellColor(cell.state,state.words.findIndex((word) => word.id === cell.contributingWordId)),
                  }}
                  elevation={3}
                >
                  <Typography>{cell.letter}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
    </>
}