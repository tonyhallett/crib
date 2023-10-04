import { RouteObject } from "react-router-dom";
import { Root } from "./rootElement";
import { rootLoaderAndUseLoaderData } from "./rootLoader";
import { action } from "./rootAction";

export const rootRoute: RouteObject = {
  path: "/",
  element: <Root />,
  loader: rootLoaderAndUseLoaderData.loader,
  action,
};
