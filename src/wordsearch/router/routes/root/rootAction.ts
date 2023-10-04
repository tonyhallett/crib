import { ActionFunction, FetcherSubmitFunction } from "react-router-dom";
import { wordSearchLocalStorage } from "../../../wordSearchLocalStorage";

interface DeleteWordSearchJson {
  id: number;
  type: "deleteWordSearch";
}
interface AddWordSearchesJson {
  type: "addWordSearches";
}

type SubmitJson = DeleteWordSearchJson | AddWordSearchesJson;

export const submitDeleteWordSearch = (
  submit: FetcherSubmitFunction,
  id: number
) => {
  submitJson(submit, { id, type: "deleteWordSearch" });
};

const submitJson = (submit: FetcherSubmitFunction, json: SubmitJson) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submit(json as any, {
    method: "post",
    action: "/",
    encType: "application/json",
  });
};

export const submitAddWordSearches = (submit: FetcherSubmitFunction) => {
  submitJson(submit, { type: "addWordSearches" });
};
// can I submit to action with dynamic params when there is no path with dynamic params ?
// should the action expose how it wants to be sumitted ?
export const action: ActionFunction = async ({ request }) => {
  const json: SubmitJson = await request.json();
  switch (json.type) {
    case "deleteWordSearch":
      wordSearchLocalStorage.deleteWordSearch(json.id);
      break;
    case "addWordSearches":
      wordSearchLocalStorage.newWordSearch({
        canTemplate: true,
        firstSelectedCell: undefined,
        guessedWords: [
          {
            isGuessed: false,
            start: {
              row: 0,
              col: 0,
            },
            end: {
              row: 0,
              col: 3,
            },
            word: "test",
          },
        ],
        wordGrid: [
          [
            { isGuessed: false, isSelected: false, letter: "t" },
            { isGuessed: false, isSelected: false, letter: "e" },
            { isGuessed: false, isSelected: false, letter: "s" },
            { isGuessed: false, isSelected: false, letter: "t" },
          ],
        ],
      });
  }

  return null;
};
