import { RouteObject } from "react-router-dom";
import { WordGrid } from "../../../play";
import { playLoader } from "./playLoader";

export const playRoute: RouteObject = {
  path: "/play/:wordSearchId",
  element: <WordGrid />,
  loader: playLoader,
};
