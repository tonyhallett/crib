import { LoaderFunction } from "react-router-dom";
import { wordSearchLocalStorage } from "../../../wordSearchLocalStorage";

export const rootLoader: LoaderFunction = () => {
  return wordSearchLocalStorage.getWordSearchOverviews();
};
