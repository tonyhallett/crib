import { useLoaderData, NavLink, Link } from "react-router-dom";

interface WordSearchOverview {
  id: number;
  numWords: number;
  percentComplete: number;
  camTemplate: boolean;
  rows: number;
  columns: number;
}

export function Root() {
  const wordSearchOverviews = useLoaderData() as WordSearchOverview[];

  return (
    <div>
      <NavLink
        to="create"
        style={({ isActive }) => {
          return {
            display: "block",
            color: isActive ? "green" : "inherit",
          };
        }}
      >
        Create
      </NavLink>
      {wordSearchOverviews.map((wordSearchOverview) => {
        return (
          <Link
            style={{ display: "block" }}
            key={wordSearchOverview.id}
            to={`/play/${wordSearchOverview.id}`}
          >
            {wordSearchOverview.id}
          </Link>
        );
      })}
    </div>
  );
}
