import { wordSearchLocalStorage } from "../../../wordSearchLocalStorage";
import { createLoaderFunctionAndUseLoaderData } from "../../helpers";

export const createLoaderAndUseLoaderData =
  createLoaderFunctionAndUseLoaderData(() => {
    const wordSearchCreatorState =
      wordSearchLocalStorage.getWordSearchCreatorState();
    return wordSearchCreatorState ?? null;
  });
