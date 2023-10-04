import { ActionFunction, SubmitFunction, redirect } from "react-router-dom";
import {
  PositionedWord,
  WordSearchCreatorCalculatedState,
  WordSearchCreatorState,
} from "../../../creator/hook/reducer/state-types";
import { wordSearchLocalStorage } from "../../../wordSearchLocalStorage";
import { GridCellPosition } from "../../../common-types";
import { getLastLetterPosition } from "../../../creator/hook/reducer/getLastLetterPosition";
import { WordSearchState, GuessedWord, GuessedCell } from "../../../play";
import { getPlayPath } from "../play/playRoute";
import { getFormDataDeserialized, singleFormDataEntry } from "../../helpers";

const getEnd = (positionedWord: PositionedWord): GridCellPosition => {
  const letterPosition = getLastLetterPosition(positionedWord);
  return {
    row: letterPosition.row,
    col: letterPosition.col,
  };
};

const wordSearchFromCreated = (
  wordSearchCreatorState: WordSearchCreatorState
): WordSearchState => {
  // need to determine if templated whilst wordSearchCreatorState.wordGrid.map and based
  //on length of contributing letters
  const wordSearchState: WordSearchState = {
    canTemplate: false,
    firstSelectedCell: undefined,
    guessedWords: wordSearchCreatorState.words.map((positionedWord) => {
      //positionedWord.id will probably use this later
      const guessedWord: GuessedWord = {
        word: positionedWord.word,
        start: positionedWord.start,
        end: getEnd(positionedWord),
        isGuessed: false,
      };
      return guessedWord;
    }),
    wordGrid: wordSearchCreatorState.wordGrid.map((gridRow) => {
      return gridRow.map((gridCell) => {
        const guessedCell: GuessedCell = {
          isGuessed: false,
          isSelected: false,
          letter: gridCell.contributingLetters[0].letter,
        };
        return guessedCell;
      });
    }),
  };
  return wordSearchState;
};

export const createAction: ActionFunction = async ({ request }) => {
  const createJson: CreateJson = await request.json();
  //need to clear storage....
  const newWordSearchId = wordSearchLocalStorage.newWordSearch(
    wordSearchFromCreated(createJson.newWordSearch)
  );
  if (createJson.play) {
    return redirect(getPlayPath(newWordSearchId));
  }
  return null;
};

interface CreateJson {
  newWordSearch: WordSearchCreatorCalculatedState;
  play: boolean;
}

export function createSubmit(
  submit: SubmitFunction,
  state: WordSearchCreatorCalculatedState,
  play: boolean
) {
  const json: CreateJson = {
    newWordSearch: state,
    play,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submit(json as any, {
    method: "post",
    action: ".",
    encType: "application/json",
  });
}
