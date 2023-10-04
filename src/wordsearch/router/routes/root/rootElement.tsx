import { NavLink, Link, useFetcher } from "react-router-dom";
import { getPlayPath } from "../play/playRoute";
import { getCreatePath } from "../create/createRoute";
import { rootLoaderAndUseLoaderData } from "./rootLoader";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { submitAddWordSearches, submitDeleteWordSearch } from "./rootAction";
import { useState } from "react";

interface WordSearchOverview {
  id: number;
  //numWords: number;
  //percentComplete: number;
  //canTemplate: boolean;
  //rows: number;
  //columns: number;
}

const PlayLink = (props: { id: number }) => {
  return (
    <Link style={{ display: "block" }} to={`${getPlayPath(props.id)}`}>
      Play
    </Link>
  );
};

export default function WordSearchesLinks(props: {
  wordSearchOverviews: WordSearchOverview[];
}) {
  const fetcher = useFetcher();
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Play</TableCell>
            <TableCell>Delete</TableCell>
            <TableCell>New from template</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.wordSearchOverviews.map((overview) => (
            <TableRow
              key={overview.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell>
                <PlayLink id={overview.id} />
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => {
                    window.confirm(
                      "Are you sure you want to delete this word search?"
                    ) && submitDeleteWordSearch(fetcher.submit, overview.id);
                  }}
                >
                  Delete
                </Button>
              </TableCell>
              <TableCell>Todo</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const shownAddWordSearchKey = "shownAddWordSearch";
const modalBoxStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export function Root() {
  const [shownAddWordSearch, setShownAddWordSearch] = useState(
    localStorage.getItem(shownAddWordSearchKey) !== null
  );
  const fetcher = useFetcher();
  const shown = () => {
    localStorage.setItem(shownAddWordSearchKey, "true");
    setShownAddWordSearch(true);
  };
  const wordSearchOverviews = rootLoaderAndUseLoaderData.useLoaderData();
  const createPath = getCreatePath();
  return (
    <>
      {!shownAddWordSearch && (
        <Alert severity="info">
          <AlertTitle>Info</AlertTitle>
          <div>Add some wordsearches to get started</div>
          <Button
            onClick={() => {
              shown();
              submitAddWordSearches(fetcher.submit);
            }}
          >
            Add starting wordsearches
          </Button>
          <Button
            onClick={() => {
              shown();
            }}
          >
            Do not show again
          </Button>
        </Alert>
      )}
      <NavLink
        to={createPath}
        style={({ isActive }) => {
          return {
            display: "block",
            color: isActive ? "green" : "inherit",
          };
        }}
      >
        Create
      </NavLink>

      <WordSearchesLinks wordSearchOverviews={wordSearchOverviews} />
    </>
  );
}
