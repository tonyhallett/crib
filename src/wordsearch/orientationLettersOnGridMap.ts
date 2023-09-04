import { GridCellPosition } from "./WordSearch";
import { PositionedWord } from "./WordSearchCreator";

interface GridCellPositionAndLetter extends GridCellPosition {
    letter:string
}
export enum Orientation {LeftToRight, RightToLeft, TopToBottom, BottomToTop, TopLeftToBottomRight, TopRightToBottomLeft, BottomLeftToTopRight, BottomRightToTopLeft}

type WordLettersOnGridProvider = (word:PositionedWord) => GridCellPositionAndLetter[];
const orientationLettersOnGridMap = new Map<Orientation, WordLettersOnGridProvider>();

orientationLettersOnGridMap.set(Orientation.LeftToRight, (word) => {
    const letters:GridCellPositionAndLetter[] = [];
    for(let i = 0; i < word.word.length; i++){
        const col = word.start.col+i;
        letters.push({row:word.start.row,col,letter:word.word[i]});
    }
    return letters;
});
orientationLettersOnGridMap.set(Orientation.RightToLeft, (word) => {
    const letters:GridCellPositionAndLetter[] = [];
    for(let i = 0; i < word.word.length; i++){
        const col = word.start.col-i;
        letters.push({row:word.start.row,col,letter:word.word[i]});
    }
    return letters;
});
orientationLettersOnGridMap.set(Orientation.TopToBottom, (word) => {
    const letters:GridCellPositionAndLetter[] = [];
    for(let i = 0; i < word.word.length; i++){
        const row = word.start.row+i;
        letters.push({row,col:word.start.col,letter:word.word[i]});
    }
    return letters;
});

orientationLettersOnGridMap.set(Orientation.BottomToTop, (word) => {
    const letters:GridCellPositionAndLetter[] = [];
    for(let i = 0; i < word.word.length; i++){
        const row = word.start.row-i;
        letters.push({row,col:word.start.col,letter:word.word[i]});
    }
    return letters;
});

orientationLettersOnGridMap.set(Orientation.TopLeftToBottomRight, (word) => {
    const letters:GridCellPositionAndLetter[] = [];
    for(let i = 0; i < word.word.length; i++){
        const row = word.start.row+i;
        const col = word.start.col+i;
        letters.push({row,col,letter:word.word[i]});
    }
    return letters;
});

orientationLettersOnGridMap.set(Orientation.BottomRightToTopLeft, (word) => {
    const letters:GridCellPositionAndLetter[] = [];
    for(let i = 0; i < word.word.length; i++){
        const row = word.start.row-i;
        const col = word.start.col-i;
        letters.push({row,col,letter:word.word[i]});
    }
    return letters;
});
orientationLettersOnGridMap.set(Orientation.TopRightToBottomLeft, (word) => {
    const letters:GridCellPositionAndLetter[] = [];
    for(let i = 0; i < word.word.length; i++){
        const row = word.start.row+i;
        const col = word.start.col-i;
        letters.push({row,col,letter:word.word[i]});
    }
    return letters;
});

orientationLettersOnGridMap.set(Orientation.BottomLeftToTopRight, (word) => {
    const letters:GridCellPositionAndLetter[] = [];
    for(let i = 0; i < word.word.length; i++){
        const row = word.start.row-i;
        const col = word.start.col+i;
        letters.push({row,col,letter:word.word[i]});
    }
    return letters;
});

export const getLettersOnGrid = (word:PositionedWord) => {
    const wordLettersOnGridProvider = orientationLettersOnGridMap.get(word.orientation) as WordLettersOnGridProvider;
    return wordLettersOnGridProvider(word);
}
