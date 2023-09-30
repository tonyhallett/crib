import chroma from "chroma-js";
import { same } from "../../../helpers/hasDuplicates";
import {
  ContributingLetter,
  GridCell,
  PositionedWordAndLetterState,
} from "../../hook/reducer/state-types";
import { findSelectedContributingLetter } from "./findSelectedContributingLetter";

function contributingLetterWordOffGrid(
  contributingLetter: ContributingLetter,
  words: PositionedWordAndLetterState[]
) {
  const wordId = contributingLetter.wordId;
  const word = words.find(
    (word) => word.id === wordId
  ) as PositionedWordAndLetterState;
  return word.letterStates.some(
    (letterAndState) => letterAndState.state === "offGrid"
  );
}

function singleContributingLetterTextDecoration(
  contributingLetter: ContributingLetter,
  words: PositionedWordAndLetterState[],
  offGridTextDecoration: string
) {
  const wordHasLettersOffGrid = contributingLetterWordOffGrid(
    contributingLetter,
    words
  );
  return wordHasLettersOffGrid ? offGridTextDecoration : undefined;
}

function multipleContributingLetterTextDecoration(
  cell: GridCell,
  words: PositionedWordAndLetterState[],
  selectedWordId: number,
  offGridTextDecoration: string,
  conflictTextDecoration: string
) {
  const contributingLetters = cell.contributingLetters;
  const sameLetters = same(contributingLetters.map((cl) => cl.letter));
  if (sameLetters) {
    const someOffGrid = contributingLetters
      .map((cl) => contributingLetterWordOffGrid(cl, words))
      .some((wordHasLettersOffGrid) => wordHasLettersOffGrid);
    return someOffGrid ? offGridTextDecoration : undefined;
  } else {
    if (findSelectedContributingLetter(cell, selectedWordId) !== undefined) {
      // when selected showing the letter from the selected word
      // display the off grid if off grid or that is conflict ?
      return conflictTextDecoration; // conflict
    } else {
      // we are already showing * for conflict but being consistent
      return conflictTextDecoration;
    }
  }
}

function getLetterTextDecoration(
  cell: GridCell,
  textColour: string,
  selectedWordId: number,
  words: PositionedWordAndLetterState[]
) {
  const contributingletters = cell.contributingLetters;
  if (contributingletters.length === 0) {
    return;
  }

  const offGridTextDecoration = `${textColour} wavy underline`;
  const conflictTextDecoration = `${textColour} underline`;

  if (contributingletters.length === 1) {
    return singleContributingLetterTextDecoration(
      contributingletters[0],
      words,
      offGridTextDecoration
    );
  }

  return multipleContributingLetterTextDecoration(
    cell,
    words,
    selectedWordId,
    offGridTextDecoration,
    conflictTextDecoration
  );
}

interface StyledLetter {
  letter: string;
  style: React.CSSProperties;
}

function getTextColour(backgroundColor: string) {
  const blackDistance = chroma.distance(backgroundColor, chroma("black"));
  const whiteDistance = chroma.distance(backgroundColor, chroma("white"));
  return blackDistance > 1.2 * whiteDistance ? "black" : "white";
}

function getLetter(cell: GridCell, selectedWordId: number): string {
  const letters = cell.contributingLetters.map((cl) => cl.letter);

  if (letters.length === 0) {
    return "";
  }
  if (letters.length === 1) {
    return letters[0];
  }
  const contributingFromSelected = findSelectedContributingLetter(
    cell,
    selectedWordId
  );
  return contributingFromSelected?.letter ?? same(letters) ? letters[0] : "*";
}

export function getLetterAndStyle(
  cell: GridCell,
  backgroundColor: string,
  selectedWordId: number,
  words: PositionedWordAndLetterState[]
): StyledLetter {
  const textColour = getTextColour(backgroundColor);
  return {
    letter: getLetter(cell, selectedWordId),
    style: {
      color: getTextColour(backgroundColor),
      textDecoration: getLetterTextDecoration(
        cell,
        textColour,
        selectedWordId,
        words
      ),
    },
  };
}
