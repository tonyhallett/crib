import { LoaderFunction } from "react-router-dom";
import { WordSearchState } from "../../../play";
import { wordSearchLocalStorage } from "../../../wordSearchLocalStorage";
import { getIntParam } from "../../getIntParam";

export interface WordSearchAndId {
  id: number;
  wordSearch: WordSearchState;
}

export const playLoader: LoaderFunction = ({ params }) => {
  const id = getIntParam(params.wordSearchId);
  const wordSearch = wordSearchLocalStorage.getWordSearch(id);
  if (wordSearch === undefined) {
    throw new Error("not found");
  }
  const wordSearchAndId: WordSearchAndId = {
    id,
    wordSearch
  };
  return wordSearchAndId;
};
