import { WordSearchCreatorCalculatedState } from "./creator/hook/reducer/state-types";
import { LocalStorage } from "./localStorage";
import { WordSearchState } from "./play";

export const wordSearchLocalStorage = new LocalStorage<
  WordSearchCreatorCalculatedState,
  WordSearchState,
  []
>([]);
