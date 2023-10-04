import { WordSearchState } from "../../../play";
import { wordSearchLocalStorage } from "../../../wordSearchLocalStorage";
import {
  createLoaderFunctionAndUseLoaderData,
  getIntParam,
} from "../../helpers";

export interface WordSearchAndId {
  id: number;
  wordSearch: WordSearchState;
}

export const playLoaderAndUseLoaderData = createLoaderFunctionAndUseLoaderData(
  ({ params }) => {
    const id = getIntParam(params.wordSearchId);
    const wordSearch = wordSearchLocalStorage.getWordSearch(id);
    if (wordSearch === undefined) {
      throw new Error("not found");
    }
    const wordSearchAndId: WordSearchAndId = {
      id,
      wordSearch,
    };
    return wordSearchAndId;
  }
);
