import { RouteObject } from "react-router-dom";
import { WordGrid } from "../../../play";
import { playLoaderAndUseLoaderData } from "./playLoader";
import { PlayError } from "./errorElement";

export function getPlayPath(wordSearchId: number) {
  return `/play/${wordSearchId}`;
}
export const playRoute: RouteObject = {
  path: "/play/:wordSearchId",
  element: <WordGrid />,
  loader: playLoaderAndUseLoaderData.loader,
  errorElement: <PlayError />,
};
