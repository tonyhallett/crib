import { getLetterPositionsOnGrid } from "../../components/WordSearchCreator/getLetterPositionsOnGrid";
import { GridCellPositionAndLetter } from "../getLetterPositions";
import randomLetterWordId from "./randomLetterWordId";
import {
  ContributingLetter,
  GridCell,
  PositionedWord,
  WordSearchCreatorState,
  WordSearchGrid,
} from "./state-types";

export interface WordUpdate {
  oldWord: PositionedWord;
  newWord: PositionedWord;
  newWords: PositionedWord[];
}

export function updateWord(
  words: PositionedWord[],
  wordToUpdateId: number,
  updater: (word: PositionedWord) => PositionedWord
): WordUpdate {
  let oldWord: PositionedWord | undefined;
  let newWord: PositionedWord | undefined;
  const newWords = words.map((word) => {
    if (word.id === wordToUpdateId) {
      newWord = updater(word);
      oldWord = word;
      return newWord;
    }
    return word;
  });
  return {
    newWords,
    oldWord: oldWord as PositionedWord,
    newWord: newWord as PositionedWord,
  };
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

function getWordId(
  oldWord: PossiblePositionedWord,
  newWord: PossiblePositionedWord
) {
  const id = oldWord?.id ?? newWord?.id;
  if (id === undefined) {
    throw new Error("Words are undefined");
  }
  return id;
}

function updateContributingLetterIfLettersChanges(
  cell: GridCell,
  oldLetter: string,
  newLetter: string,
  wordId: number
) {
  if (oldLetter === newLetter) {
    return cell;
  }
  const newCell = { ...cell };
  newCell.contributingLetters = updateContributingLetter(
    newCell.contributingLetters,
    wordId,
    newLetter
  );
  return newCell;
}

function removeContributingLetterAndPossiblyFillWithRandom(
  cell: GridCell,
  wordId: number,
  fillWithRandomLetters: boolean
) {
  const newCell = { ...cell };
  newCell.contributingLetters = removeContributingLetter(
    newCell.contributingLetters,
    wordId
  );
  if (fillWithRandomLetters && newCell.contributingLetters.length === 0) {
    newCell.contributingLetters = getRandomLetterContribution();
  }
  return newCell;
}

function addContributingLetterAndRemoveRandomLetters(
  cell: GridCell,
  newLetter: string,
  wordId: number
) {
  const newCell = { ...cell };
  newCell.contributingLetters = [
    { letter: newLetter, wordId: wordId },
    ...removeRandomLetters(newCell.contributingLetters),
  ];
  return newCell;
}

type PossiblePositionedWord = PositionedWord | undefined;
export function updateWordGridForWordChange(
  oldWord: PossiblePositionedWord,
  newWord: PossiblePositionedWord,
  numRows: number,
  numColumns: number,
  wordGrid: WordSearchGrid,
  fillWithRandomLetters: boolean
): WordSearchGrid {
  const wordId = getWordId(oldWord, newWord);
  const getPossibleLetterPositionsOnGrid = (word: PossiblePositionedWord) => {
    return word ? getLetterPositionsOnGrid(word, numRows, numColumns) : [];
  };
  const oldLettersOnGrid = getPossibleLetterPositionsOnGrid(oldWord);
  const newLettersOnGrid = getPossibleLetterPositionsOnGrid(newWord);

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
        return updateContributingLetterIfLettersChanges(
          cell,
          oldLetter,
          newLetter,
          wordId
        );
      } else {
        if (oldLetter) {
          return removeContributingLetterAndPossiblyFillWithRandom(
            cell,
            wordId,
            fillWithRandomLetters
          );
        }
        if (newLetter) {
          return addContributingLetterAndRemoveRandomLetters(
            cell,
            newLetter,
            wordId
          );
        }
        return cell;
      }
    });
  });
  return newWordGrid;
}

export function getWordById(
  words: PositionedWord[],
  wordId: number
): PositionedWord {
  return words.find((word) => word.id === wordId) as PositionedWord;
}

export function getSelectedWord(state: WordSearchCreatorState): PositionedWord {
  return getWordById(state.words, state.selectedWordId);
}
