import { RouteObject } from "react-router-dom";
import { Root } from "./rootElement";
import { rootLoader } from "./rootLoader";

export const rootRoute: RouteObject = {
  path: "/",
  element: <Root />,
  loader: rootLoader,
};
