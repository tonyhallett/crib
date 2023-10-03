import { NonIndexRouteObject } from "react-router-dom";
import { WordSearchCreator } from "../../../creator/components/WordSearchCreator/WordSearchCreator";
import { createAction } from "./createAction";
import { createLoader } from "./createLoader";

export const createRoute: NonIndexRouteObject = {
  path: "/create",
  element: <WordSearchCreator />,
  action: createAction,
  loader: createLoader,
};
