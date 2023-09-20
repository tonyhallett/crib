import { WordSearch } from "./types";

export const wordSearch: WordSearch = {
  grid: [
    ["R", "E", "A", "C", "T", "L", "I", "B"],
    ["P", "R", "E", "A", "C", "T", "A", "R"],
    ["L", "O", "S", "D", "O", "C", "I", "M"],
    ["M", "O", "B", "I", "L", "E", "T", "S"],
    ["O", "A", "R", "E", "L", "I", "P", "M"],
    ["B", "L", "G", "N", "K", "D", "T", "A"],
    ["A", "O", "T", "E", "E", "R", "D", "S"],
    ["D", "S", "W", "S", "E", "O", "P", "O"],
  ],
  positions: [
    { start: { row: 0, col: 0 }, end: { row: 0, col: 4 } }, // REACT - left to right
    { start: { row: 3, col: 0 }, end: { row: 3, col: 5 } }, // MOBILE - left to right
    { start: { row: 1, col: 7 }, end: { row: 1, col: 5 } }, // RAT - right to left

    { start: { row: 2, col: 3 }, end: { row: 4, col: 3 } }, // DIE - down
    { start: { row: 7, col: 0 }, end: { row: 5, col: 0 } }, // DAB - up

    { start: { row: 7, col: 0 }, end: { row: 5, col: 2 } }, // DOG left/right bottom/top
    { start: { row: 5, col: 3 }, end: { row: 7, col: 5 } }, // NEO left/right top/bottom
    { start: { row: 7, col: 7 }, end: { row: 5, col: 5 } }, // ODD - right/left bottom/top
    { start: { row: 5, col: 7 }, end: { row: 7, col: 5 } }, // ADO - right/left top/bottom
  ],
};
