import { getLetterPositionsOnGrid } from "../../components/WordSearchCreator/getLetterPositionsOnGrid";
import { GridCellPositionAndLetter } from "../getLetterPositions";
import randomLetterWordId from "./randomLetterWordId";
import {
  ContributingLetter,
  PositionedWord,
  WordSearchGrid,
} from "./state-types";

export function updateWord(
  words: PositionedWord[],
  wordToUpdateId: number,
  updater: (word: PositionedWord) => PositionedWord
): PositionedWord[] {
  return words.map((word) => {
    if (word.id === wordToUpdateId) {
      return updater(word);
    }
    return word;
  });
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function getRandomLetter(): string {
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}
export function getRandomLetterContribution(): ContributingLetter[] {
  return [{ letter: getRandomLetter(), wordId: randomLetterWordId }];
}

export function isRandomLetterContribution(
  contributingLetters: ContributingLetter[]
): boolean {
  return (
    contributingLetters.length === 1 &&
    contributingLetters[0].wordId === randomLetterWordId
  );
}

function updateContributingLetter(
  contributingLetters: ContributingLetter[],
  wordId: number,
  newLetter: string
): ContributingLetter[] {
  return contributingLetters.map((contributingLetter) => {
    if (contributingLetter.wordId === wordId) {
      return {
        ...contributingLetter,
        letter: newLetter,
      };
    }
    return contributingLetter;
  });
}

function removeContributingLetter(
  contributingLetters: ContributingLetter[],
  wordId: number
): ContributingLetter[] {
  return contributingLetters.filter(
    (contributingLetter) => contributingLetter.wordId !== wordId
  );
}

function removeRandomLetters(
  contributingLetters: ContributingLetter[]
): ContributingLetter[] {
  return isRandomLetterContribution(contributingLetters)
    ? []
    : contributingLetters;
}

export function updateWordGridForWordChange(
  oldWord: PositionedWord,
  newWord: PositionedWord,
  numRows: number,
  numColumns: number,
  wordGrid: WordSearchGrid,
  fillWithRandomLetters: boolean
): WordSearchGrid {
  const oldLettersOnGrid = getLetterPositionsOnGrid(
    oldWord,
    numRows,
    numColumns
  );
  const newLettersOnGrid = getLetterPositionsOnGrid(
    newWord,
    numRows,
    numColumns
  );
  const getLetterAtPosition = (
    lettersWithPosition: GridCellPositionAndLetter[],
    rowIndex: number,
    colIndex: number
  ) => {
    return lettersWithPosition.find((letterOnGrid) => {
      if (letterOnGrid.row === rowIndex && letterOnGrid.col === colIndex) {
        return true;
      }
      return false;
    });
  };
  const newWordGrid = wordGrid.map((row, rowIndex) => {
    // eslint-disable-next-line complexity
    return row.map((cell, colIndex) => {
      const oldLetter = getLetterAtPosition(
        oldLettersOnGrid,
        rowIndex,
        colIndex
      )?.letter;
      const newLetter = getLetterAtPosition(
        newLettersOnGrid,
        rowIndex,
        colIndex
      )?.letter;

      if (oldLetter && newLetter) {
        if (oldLetter === newLetter) {
          return cell;
        }
        const newCell = { ...cell };
        newCell.contributingLetters = updateContributingLetter(
          newCell.contributingLetters,
          newWord.id,
          newLetter
        );
        return newCell;
      } else {
        if (oldLetter) {
          const newCell = { ...cell };
          newCell.contributingLetters = removeContributingLetter(
            newCell.contributingLetters,
            newWord.id
          );
          if (
            fillWithRandomLetters &&
            newCell.contributingLetters.length === 0
          ) {
            newCell.contributingLetters = getRandomLetterContribution();
          }
          return newCell;
        }
        if (newLetter) {
          const newCell = { ...cell };
          newCell.contributingLetters = [
            { letter: newLetter, wordId: newWord.id },
            ...removeRandomLetters(newCell.contributingLetters),
          ];
          return newCell;
        }
        return cell;
      }
    });
  });
  return newWordGrid;
}
