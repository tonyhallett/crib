import { NonIndexRouteObject } from "react-router-dom";
import { WordSearchCreator } from "../../../creator/components/WordSearchCreator/WordSearchCreator";
import { createAction } from "./createAction";
import { createLoaderAndUseLoaderData } from "./createLoader";

export function getCreatePath() {
  return "/create";
}
export const createRoute: NonIndexRouteObject = {
  path: "/create",
  element: <WordSearchCreator />,
  action: createAction,
  loader: createLoaderAndUseLoaderData.loader,
};
