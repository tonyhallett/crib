import { GuessedCell, GuessedWord, WordSearchState } from "../src/wordsearch";
import { GridCellPosition, WordPosition, WordSearch } from "../src/wordsearch/WordSearch";
import { getState, getWord } from "../src/wordsearch/getState";
import { wordGridReducer } from "../src/wordsearch/wordGridReducer";

describe("Word search", () => {
    describe("getWord", () => {
        it("should work with rows", () => {
            const grid = [
                ["X", "X", "X", "X","X"],
                ["X","D","O","G","X"],
            ]
            const word = getWord(grid, {start:{row:1,col:1},end:{row:1,col:3}});
            expect(word).toEqual("DOG");
        });
        it("should work with rows in reverse", () => {
            const grid = [
                ["X", "X", "X", "X","X"],
                ["X","G","O","D","X"],
            ]
            const word = getWord(grid, {end:{row:1,col:1},start:{row:1,col:3}});
            expect(word).toEqual("DOG");
        });
        it("should work with columns", () => {
            const grid = [
                ["X","X"],
                ["X","D"],
                ["X","O"],
                ["X","G"],
                ["X","X"],
            ]
            const word = getWord(grid, {start:{row:1,col:1},end:{row:3,col:1}});
            expect(word).toEqual("DOG");
        });

        it("should work with columns in reverse", () => {
            const grid = [
                ["X","X"],
                ["X","G"],
                ["X","O"],
                ["X","D"],
                ["X","X"],
            ]
            const word = getWord(grid, {end:{row:1,col:1},start:{row:3,col:1}});
            expect(word).toEqual("DOG");
        });

        it("should work with diagonals", () => {
            const grid = [
                ["X", "X", "X", "X","X"],
                ["X","D","X","X","X"],
                ["X","X","O","X","X"],
                ["X","X","X","G","X"],
                ["X", "X", "X", "X","X"],
            ]
            const word = getWord(grid, {start:{row:1,col:1},end:{row:3,col:3}});
            expect(word).toEqual("DOG");
        });

        it("should work with diagonals in reverse", () => {
            const grid = [
                ["X", "X", "X", "X","X"],
                ["X","G","X","X","X"],
                ["X","X","O","X","X"],
                ["X","X","X","D","X"],
                ["X", "X", "X", "X","X"],
            ]
            const word = getWord(grid, {end:{row:1,col:1},start:{row:3,col:3}});
            expect(word).toEqual("DOG");
        })
    });

    describe("clicked letter - reducer", () => {
        describe("no selected letter", () => {
            it("should not mutate state", () => {
                const state: WordSearchState = {
                    firstSelectedCell:undefined,
                    wordGrid:[[{isGuessed:false,isSelected:false,letter:"A"}]],
                    guessedWords:[]
                }
                const newState = wordGridReducer(state,{
                    type:"letterClick",
                    gridCellPosition:{
                        row:0,
                        col:0
                    }
                })
                expect(newState).not.toBe(state);
            });
            it("should set the first selected cell", () => {
                const state: WordSearchState = {
                    firstSelectedCell:undefined,
                    wordGrid:[[{isGuessed:false,isSelected:false,letter:"A"}]],
                    guessedWords:[]
                }
                const newState = wordGridReducer(state,{
                    type:"letterClick",
                    gridCellPosition:{
                        row:0,
                        col:0
                    }
                })
                const expectedSelectedCell : GridCellPosition = {
                    row:0,
                    col:0
                }
                expect(newState.firstSelectedCell).toEqual(expectedSelectedCell);
            });
            it("should set the selected cell to selected", () => {
                const state: WordSearchState = {
                    firstSelectedCell:undefined,
                    wordGrid:[[{isGuessed:false,isSelected:false,letter:"A"}]],
                    guessedWords:[]
                }
                const newState = wordGridReducer(state,{
                    type:"letterClick",
                    gridCellPosition:{
                        row:0,
                        col:0
                    }
                })
                const expectedCell : GuessedCell = {isGuessed:false,isSelected:true,letter:"A"};
                expect(newState.wordGrid[0][0]).toEqual(expectedCell);
            });
            it("should not mutate the cell or the row", () => {
                const selectedCell:GuessedCell = {isGuessed:false,isSelected:false,letter:"A"};
                const selectedCellRow:GuessedCell[] = [selectedCell];
                const state: WordSearchState = {
                    firstSelectedCell:undefined,
                    wordGrid:[selectedCellRow],
                    guessedWords:[]
                }
                const newState = wordGridReducer(state,{
                    type:"letterClick",
                    gridCellPosition:{
                        row:0,
                        col:0
                    }
                })
                expect(newState.wordGrid[0][0]).not.toBe(selectedCell);
                expect(newState.wordGrid[0]).not.toBe(selectedCellRow);
            });
            it("should leave other rows unchanged", () => {
                const notSelectedCellRow:GuessedCell[] = [{isGuessed:false,isSelected:false,letter:"B"}];
                const state: WordSearchState = {
                    firstSelectedCell:undefined,
                    wordGrid:[[{isGuessed:false,isSelected:false,letter:"A"}],notSelectedCellRow],
                    guessedWords:[]
                }
                const newState = wordGridReducer(state,{
                    type:"letterClick",
                    gridCellPosition:{
                        row:0,
                        col:0
                    }
                })
                expect(newState.wordGrid[1]).toBe(notSelectedCellRow);
            })
        });

        describe("selected letter", () => {
            describe("matching word", () => {
                it("should set the word to guessed", () => {
                    const guessedWord:GuessedWord = {word:"AB",start:{row:0,col:0},end:{row:0,col:1},isGuessed:false};
                    const guessedWords:GuessedWord[] = [guessedWord];
                    const state: WordSearchState = {
                        firstSelectedCell:{row:0,col:0},
                        wordGrid:[[{isGuessed:false,isSelected:true,letter:"A"},{isGuessed:false,isSelected:false,letter:"B"}]],
                        guessedWords:guessedWords
                    }
                    const newState = wordGridReducer(state,{
                        type:"letterClick",
                        gridCellPosition:{
                            row:0,
                            col:1
                        }
                    });
                    expect(newState.guessedWords[0].isGuessed).toBe(true);
                    expect(newState.guessedWords).not.toBe(guessedWords);
                    expect(newState.guessedWords[0]).not.toBe(guessedWord);
                });

                it("should remove first selected cell", () => {
                    const guessedWord:GuessedWord = {word:"AB",start:{row:0,col:0},end:{row:0,col:1},isGuessed:false};
                    const guessedWords:GuessedWord[] = [guessedWord];
                    const state: WordSearchState = {
                        firstSelectedCell:{row:0,col:0},
                        wordGrid:[[{isGuessed:false,isSelected:true,letter:"A"},{isGuessed:false,isSelected:false,letter:"B"}]],
                        guessedWords:guessedWords
                    }
                    const newState = wordGridReducer(state,{
                        type:"letterClick",
                        gridCellPosition:{
                            row:0,
                            col:1
                        }
                    });
                    expect(newState.firstSelectedCell).toBeUndefined();
                });

                const wordSearch:WordSearch = {
                    grid:[
                      ["R", "E", "A", "C", "T", "L", "I", "B"],
                      ["P", "R", "E", "A", "C", "T", "A", "R"],
                      ["L", "O", "S", "D", "O", "C", "I", "M"],
                      ["M", "O", "B", "I", "L", "E", "T", "S"],
                      ["O", "A", "R", "E", "L", "I", "P", "M"],
                      ["B", "L", "G", "N", "K", "D", "T", "A"],
                      ["A", "O", "T", "E", "E", "R", "D", "S"],
                      ["D", "S", "W", "S", "E", "O", "P", "O"],
                    ],
                    positions:[
                      {start:{row:0,col:0},end:{row:0,col:4}}, // REACT - left to right
                      {start:{row:3,col:0},end:{row:3,col:5}}, // MOBILE - left to right
                      {start:{row:1,col:7},end:{row:1,col:5}}, // RAT - right to left
                  
                      {start:{row:2,col:3},end:{row:4,col:3}}, // DIE - down
                      {start:{row:7,col:0},end:{row:5,col:0}}, // DAB - up
                  
                      {start:{row:7,col:0},end:{row:5,col:2}}, // DOG left/right bottom/top
                      {start:{row:5,col:3},end:{row:7,col:5}}, // NEO left/right top/bottom
                      {start:{row:7,col:7},end:{row:5,col:5}}, // ODD - right/left bottom/top
                      {start:{row:5,col:7},end:{row:7,col:5}}, // ADO - right/left top/bottom
                    ]
                };

                describe("cell guessed", () => {
                    const arrange = (wordPosition:WordPosition) => {
                        const [wordGridData,wordList] = getState(wordSearch);
                        const state: WordSearchState = {
                            wordGrid:wordGridData,
                            guessedWords:wordList,
                            firstSelectedCell:wordPosition.start
                        }
                        const newState = wordGridReducer(state,{
                            type:"letterClick",
                            gridCellPosition:wordPosition.end
                        });
                        return {
                            state,
                            newState
                        }
                    }
                    describe("horizontal", () => {
                        it("should set the cells to guessed - left to right", () => {
                            const leftToRightPosition = wordSearch.positions[0];
                            const {state, newState} = arrange(leftToRightPosition);
                            
                            const row = newState.wordGrid[leftToRightPosition.start.row];
                            row.forEach((cell,colIndex) => {
                                if(colIndex >= leftToRightPosition.start.col && colIndex <= leftToRightPosition.end.col){
                                    expect(cell.isGuessed).toBe(true);
                                }else{
                                    expect(cell.isGuessed).toBe(false);
                                }
                            });
    
                            // mutation
                            expect(state.wordGrid[0]).not.toBe(newState.wordGrid[0]);
                            expect(state.wordGrid[0][7]).toBe(newState.wordGrid[0][7]);
                            expect(newState.wordGrid[1]).toBe(state.wordGrid[1]);
                        });
    
                        it("should set the cells to guessed - right to left", () => {
                            const rightToLeftPosition = wordSearch.positions[2];
                            const {newState} = arrange(rightToLeftPosition);
                            
                            const row = newState.wordGrid[rightToLeftPosition.start.row];
                            row.forEach((cell,colIndex) => {
                                if(colIndex <= rightToLeftPosition.start.col && colIndex >= rightToLeftPosition.end.col){
                                    expect(cell.isGuessed).toBe(true);
                                }else{
                                    expect(cell.isGuessed).toBe(false);
                                }
                            });
                        });
                    });
                    const arrangeAndTest = (wordPosition:WordPosition,inRangePredicate:(row:number,col:number)=>boolean) => {
                        const {newState} = arrange(wordPosition);
                        newState.wordGrid.forEach((row,rowIndex) => {
                            row.forEach((cell,colIndex) => {
                                expect(cell.isGuessed).toBe(inRangePredicate(rowIndex,colIndex));
                            });
                        });
                    }
                    describe("vertical", () => {
                        it("should set the cells to guessed - top to bottom", () => {
                            const topToBottomPosition = wordSearch.positions[3];
                            arrangeAndTest(
                                topToBottomPosition,
                                (rowIndex,colIndex) => colIndex === topToBottomPosition.start.col && rowIndex >= topToBottomPosition.start.row && rowIndex <= topToBottomPosition.end.row
                            );
                        });
    
                        it("should set the cells to guessed - bottom to top", () => {
                            const bottomToTopPosition = wordSearch.positions[4];
                            arrangeAndTest(bottomToTopPosition, (rowIndex,colIndex) => colIndex === bottomToTopPosition.start.col && rowIndex <= bottomToTopPosition.start.row && rowIndex >= bottomToTopPosition.end.row);
                        })
                    })
    
                    describe("diagonal", () => {
                        const arrangeAndTestDiagonals = (wordPosition:WordPosition,diagonals:GridCellPosition[]) => {
                            diagonals = diagonals.concat(wordPosition.start,wordPosition.end);
                            arrangeAndTest(wordPosition, (rowIndex,colIndex) => {
                                return diagonals.some(diagonal => diagonal.row === rowIndex && diagonal.col === colIndex)
                            });
                        }
                        it("should set the cells to guessed - left/right bottom/top", () => {
                            const leftRightBottomTopPosition = wordSearch.positions[5];
                            //{start:{row:7,col:0},end:{row:5,col:2}}, // DOG
                            const diagonals:GridCellPosition[] = [
                                {row:6,col:1}
                            ]
                            arrangeAndTestDiagonals(leftRightBottomTopPosition, diagonals);
                        });

                        it("should set the cells to guessed - left/right top/bottom", () => {
                            const leftRightTopBottomPosition = wordSearch.positions[6];
                            //{start:{row:5,col:3},end:{row:7,col:5}}, // NEO
                            const diagonals:GridCellPosition[] = [
                                {row:6,col:4}
                            ]
                            arrangeAndTestDiagonals(leftRightTopBottomPosition, diagonals)
                        });

                        it("should set the cells to guessed - right/left bottom/top", () => {
                            const rightleftBottomTopPosition = wordSearch.positions[7];
                            //{start:{row:7,col:7},end:{row:5,col:5}}, // ODD 
                            const diagonals:GridCellPosition[] = [
                                {row:6,col:6}
                            ]
                            arrangeAndTestDiagonals(rightleftBottomTopPosition, diagonals)
                        });

                        it("should set the cells to guessed - right/left top/bottom", () => {
                            const rightLeftTopBottomPosition = wordSearch.positions[8];
                            // {start:{row:5,col:7},end:{row:7,col:5}}, // ADO
                            const diagonals:GridCellPosition[] = [
                                {row:6,col:6}
                            ]
                            arrangeAndTestDiagonals(rightLeftTopBottomPosition, diagonals)
                        });
                    });
                })
                
            });

            describe("no matching word", () => {
                it("should remove first selected cell", () => {
                    const state: WordSearchState = {
                        firstSelectedCell:{row:0,col:0},
                        wordGrid:[[{isGuessed:false,isSelected:true,letter:"A"},{isGuessed:false,isSelected:false,letter:"B"}]],
                        guessedWords:[]
                    }
                    const newState = wordGridReducer(state,{
                        type:"letterClick",
                        gridCellPosition:{
                            row:0,
                            col:1
                        }
                    })
                    
                    expect(newState.firstSelectedCell).toBeUndefined();
                    expect(newState.wordGrid[0][0].isSelected).toBe(false);
                });

                it("matches on direction", () => {
                    [true,false].forEach(first => {
                        const guessedWord:GuessedWord = {word:"AB",start:{row:0,col:0},end:{row:0,col:1},isGuessed:false};
                        const guessedWords:GuessedWord[] = [guessedWord];
                        const state: WordSearchState = {
                            firstSelectedCell:first ? {row:0,col:0} : {row:0,col:1},
                            wordGrid:[[
                                {isGuessed:false,isSelected:first,letter:"A"},
                                {isGuessed:false,isSelected:!first,letter:"B"}]],
                            guessedWords:guessedWords
                        }
                        const newState = wordGridReducer(state,{
                            type:"letterClick",
                            gridCellPosition:first ? {row:0,col:1} : {row:0,col:0}
                        });
                        expect(newState.guessedWords[0].isGuessed).toBe(first);
                    });
                    
                    
                });
            });
        })
    })
});