import { wordSearchLocalStorage } from "../../../wordSearchLocalStorage";
import { createLoaderFunctionAndUseLoaderData } from "../../helpers";

export const rootLoaderAndUseLoaderData = createLoaderFunctionAndUseLoaderData(
  () => {
    return wordSearchLocalStorage.getWordSearchOverviews();
  }
);
