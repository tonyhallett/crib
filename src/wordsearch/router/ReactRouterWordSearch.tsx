import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { createRoute } from "./routes/create/createRoute";
import { rootRoute } from "./routes/root/rootRoute";
import { playRoute } from "./routes/play/playRoute";

// in reality will do this in the element in useEffect
/* function getOverview(wordSearchState:WordSearchState, id:number):WordSearchOverview{
    const numGuessedWords = wordSearchState.guessedWords.filter(gw => gw.isGuessed).length;
    return {
        id,
        numWords:wordSearchState.guessedWords.length,
        rows:wordSearchState.wordGrid.length,
        columns:wordSearchState.wordGrid[0].length,
        percentComplete:numGuessedWords / wordSearchState.guessedWords.length * 100, // truncate
        camTemplate:false // will come from when creating the word search
    }
} */

const router = createBrowserRouter([rootRoute, createRoute, playRoute]);

export function ReactRouterWordSearch() {
  return <RouterProvider router={router} />;
}
