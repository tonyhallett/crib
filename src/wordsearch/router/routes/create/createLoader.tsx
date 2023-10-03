import { LoaderFunction } from "react-router-dom";
import { wordSearchLocalStorage } from "../../../wordSearchLocalStorage";

export const createLoader: LoaderFunction = () => {
  const wordSearchCreatorState =
    wordSearchLocalStorage.getWordSearchCreatorState();
  return wordSearchCreatorState ?? null;
};
