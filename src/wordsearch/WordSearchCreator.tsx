import { Button, Grid, Paper, Typography } from "@mui/material";
import { useReducer } from "react";
import { fill } from "../utilities/arrayHelpers";
import { Orientation, getLetterPositions } from "./orientationLettersOnGridMap";
import {TestWord} from "./TestWord";

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

interface ContributingLetter{
    letter:string,
    wordId:number
}
interface GridCell {
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
const getLetterPositionsOnGrid = (word:PositionedWord, numRows:number, numColumns:number) => {
    const letterPositions = getLetterPositions(word);
    return letterPositions.filter((letterPosition) => {
        return inBounds(letterPosition.row, letterPosition.col, numRows, numColumns);
    });
}
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
                    const oldLettersOnGrid = getLetterPositionsOnGrid(word, state.numRows, state.numColumns);
                    // although current ui does not use word start
                    const newWords = state.words.map(word => {
                        if(word.id === state.selectedWordId){
                            const newWord = {...word};
                            newWord.start = {
                                row:action.row,
                                col:action.col
                            }
                            return newWord;
                        }
                        return word;
                    });
                    const newLettersOnGrid = getLetterPositionsOnGrid(newWords[selectedWordIndex], state.numRows, state.numColumns);
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
                                newCell.contributingLetters = newCell.contributingLetters.map((contributingLetter) => {
                                    if(contributingLetter.wordId === state.selectedWordId){
                                        return {
                                            ...contributingLetter,
                                            letter:newLetterOnGrid.letter
                                        }
                                    }
                                    return contributingLetter;
                                });
                                return newCell;
                            }else{
                                if(oldLetterOnGrid){
                                    const newCell = {...cell};
                                    // remove letter from this word
                                    newCell.contributingLetters = newCell.contributingLetters.filter((contributingLetter) => contributingLetter.wordId !== state.selectedWordId);
                                    return newCell;
                                }
                                if(newLetterOnGrid){
                                    const newCell = {...cell};
                                    newCell.contributingLetters = [{letter:newLetterOnGrid.letter, wordId:state.selectedWordId},...newCell.contributingLetters];
                                    return newCell;
                                }
                                return cell;
                            }
                        });
                    })
                    const newState:WordSearchCreatorState = {
                        ...state,
                        wordGrid:newWordGrid,
                        words:newWords
                    }
                    return newState;
                }
                

        }
            

    }
    return state;
}


function inBounds(row:number, col:number, numRows:number, numColumns:number){
    return row >= 0 && row < numRows && col >= 0 && col < numColumns;
}

function stateFromInitial(initialState:WordSearchCreatorInitialState):WordSearchCreatorState {
    const wordSearchGrid:WordSearchGrid = fill(initialState.numRows, () => {
        return fill(initialState.numColumns, () => {
            return {contributingLetters:[]}
        })
    })
    initialState.words.forEach((word) => {
        const lettersOnGrid = getLetterPositionsOnGrid(word, initialState.numRows, initialState.numColumns);
        // eslint-disable-next-line complexity
        lettersOnGrid.forEach((letterOnGrid) => {
            const cell = wordSearchGrid[letterOnGrid.row][letterOnGrid.col];
            cell.contributingLetters.push({letter:letterOnGrid.letter, wordId:word.id});
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
    selectedWordId:3,
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
enum GridCellState {Ok, OkSelected, Conflict, ConflictSelected}
// eslint-disable-next-line complexity
function getCellColor(cellState:GridCellState, wordIndex:number){
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
    return "white";
}

function getLetter(cell:GridCell):string{
    const letters = getCellLetters(cell);
    if(letters.length === 0){
        return "";
    }
    const firstLetter = letters[0];
    if(letters.length === 1){
        return firstLetter;
    }
    if(!hasDuplicates(letters)){
        return "*";
    }
    return firstLetter;
}

function getCellLetters(cell:GridCell){
    return cell.contributingLetters.map((contributingLetter) => contributingLetter.letter);
}

function findSelectedContributingLetter(cell:GridCell, selectedWordId:number){
    return cell.contributingLetters.find((contributingLetter) => contributingLetter.wordId === selectedWordId);
}

function cellIsSelected(cell:GridCell, selectedWordId:number){
    return findSelectedContributingLetter(cell, selectedWordId) !== undefined;
}

// eslint-disable-next-line complexity
function getCellState(cell:GridCell, selectedWordId:number):GridCellState{
    const letters = getCellLetters(cell);
    if(letters.length === 0){
        return GridCellState.Ok;
    }
    
    const isSelected = cellIsSelected(cell, selectedWordId);
    if(letters.length === 1){
        return isSelected ? GridCellState.OkSelected : GridCellState.Ok;
    }
    if(!hasDuplicates(letters)){
        return isSelected ? GridCellState.ConflictSelected : GridCellState.Conflict;
    }
    return isSelected ? GridCellState.OkSelected : GridCellState.Ok;
}

function getWordId(cell:GridCell,selectedWordId:number){
    if(cell.contributingLetters.length === 1){
        return cell.contributingLetters[0].wordId;
    }
    
    const selectedWordIdForCell = findSelectedContributingLetter(cell, selectedWordId);
    if(selectedWordIdForCell){
        return selectedWordIdForCell;
    }
    return -1;
}

function getWordIndex(cell:GridCell,words:PositionedWord[], selectedWordId:number ){
    const wordId = getWordId(cell, selectedWordId);
    if(wordId === -1){
        return -1;
    }
    return words.findIndex((word) => word.id === wordId);

}

export function WordSearchCreator(){
    const [state, dispatch] = useWordSearchCreator();
    return <>
        <TestWord/>
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
                    backgroundColor: getCellColor(getCellState(cell, state.selectedWordId),getWordIndex(cell, state.words, state.selectedWordId)),
                  }}
                  elevation={3}
                >
                  <Typography>{getLetter(cell)}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
    </>
}