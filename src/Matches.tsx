import { IconButton, Paper } from "@mui/material";
import { LocalMatch } from "./LocalMatch";
import { HeadCell, SortableTable, TableRowData } from "./SortableTable";
import { CribGameState, MyMatch, Score } from "./generatedTypes";
import GamesIcon from "@mui/icons-material/Games";
import { TableDisplayDate } from "./TableDisplayDate";
import { MatchDetail } from "./App";

interface MatchesData {
  gameState: CribGameState;
  matchWinDeterminant: string;
  gameCreated: TableDisplayDate;
  lastChanged: TableDisplayDate;
  canGo: boolean;
  isNew: boolean;
  newMoves: boolean;
  myScore: MatchDisplayScore;
  player2: string;
  player2Score: MatchDisplayScore;
  player3: string | undefined;
  player3Score: MatchDisplayScore | undefined;
  player4: string | undefined;
  player4Score: MatchDisplayScore | undefined;
  title: string;
}

class MatchDisplayScore {
  constructor(private score: Score) {}
  [Symbol.toPrimitive](hint: string) {
    if (hint === "number") {
      return this.score.games * 1000 + this.score.frontPeg;
    }
    return null;
  }
  toString() {
    return `${this.score.games} - ${this.score.frontPeg}`;
  }
}

function canGo(match: MyMatch): boolean {
  switch (match.gameState) {
    case CribGameState.Discard:
      return match.myCards.length !== 4;
    case CribGameState.Pegging:
      return match.pegging.nextPlayer === match.myId;
    default:
      return !match.myReady;
  }
}

function newMoves(match: MyMatch, localMatch: LocalMatch): boolean {
  return (
    match.changeHistory.numberOfActions >
    localMatch.changeHistory.numberOfActions
  );
}

const propertyNames: (keyof MatchesData)[] = [
  "title",
  "gameState",
  "matchWinDeterminant",
  "gameCreated",
  "lastChanged",
  "isNew",
  "newMoves",
  "canGo",
  "myScore",
  "player2",
  "player2Score",
  "player3",
  "player3Score",
  "player4",
  "player4Score",
];
const propertyHeadCells: HeadCell<MatchesData>[] = [
  {
    label: "Title",
    property: "title",
    numeric: false,
    disablePadding: false,
  },
  {
    label: "Win Rule",
    property: "matchWinDeterminant",
    numeric: false,
    disablePadding: false,
  },
  {
    label: "Game state",
    property: "gameState",
    numeric: false,
    disablePadding: false,
  },
  {
    label: "Created",
    property: "gameCreated",
    numeric: false,
    disablePadding: false,
  },
  {
    label: "Last change",
    property: "lastChanged",
    numeric: false,
    disablePadding: false,
  },

  {
    label: "New moves",
    property: "newMoves",
    numeric: false,
    disablePadding: false,
  },
  {
    label: "Can go",
    property: "canGo",
    numeric: false,
    disablePadding: false,
  },
  {
    label: "Is new",
    property: "isNew",
    numeric: false,
    disablePadding: false,
  },
  {
    label: "My score",
    property: "myScore",
    numeric: false,
    disablePadding: false,
  },
  {
    label: "Player 2",
    property: "player2",
    numeric: false,
    disablePadding: false,
  },
  {
    label: "Player 2 Score",
    property: "player2Score",
    numeric: false,
    disablePadding: false,
  },
  {
    label: "Player 3",
    property: "player3",
    numeric: false,
    disablePadding: false,
  },
  {
    label: "Player 3 Score",
    property: "player3Score",
    numeric: false,
    disablePadding: false,
  },
  {
    label: "Player 4",
    property: "player4",
    numeric: false,
    disablePadding: false,
  },
  {
    label: "Player 4 Score",
    property: "player4Score",
    numeric: false,
    disablePadding: false,
  },
];
//todo - Should internally sort the head cells to be in the same order as the rows
const sortedHeadCells = propertyNames.map((propertyName) => {
  const headCell = propertyHeadCells.find(
    (headCell) => headCell.property === propertyName
  );
  if (!headCell) {
    throw new Error("Could not find head cell for property " + propertyName);
  }
  return headCell;
});
sortedHeadCells.push({
  label: "Play match",
  numeric: false,
  disablePadding: false,
});

export interface PlayerDisplay {
  id: string;
  isMe: boolean;
}

function getPlayerScores(match: MyMatch): Score[] {
  const teamMatch = match.otherPlayers.length + 1 === 4;
  if (teamMatch) {
    return [match.scores[0], match.scores[1], match.scores[0], match.scores[1]];
  }
  return match.scores;
}

function getMatchWinDeterminantDisplay(matchWinDeterminant: string) {
  if (matchWinDeterminant === "Unlimited") {
    return matchWinDeterminant;
  }
  const parts = matchWinDeterminant.split("_");
  let firstPart = parts[0];
  if (firstPart === "BestOf") {
    firstPart = "Best of";
  }
  return `${firstPart} ${parts[1]}`;
}

export function Matches(props: {
  matchDetails: MatchDetail[];
  playMatch: (matchId: string) => void;
}) {
  const rows: TableRowData<MatchesData>[] = props.matchDetails.map(
    (matchDetail) => {
      const match = matchDetail.match;
      const localMatch = matchDetail.localMatch;
      const playerScores = getPlayerScores(match);
      return {
        key: match.id,
        value: {
          gameState: match.gameState,
          title: match.title,
          matchWinDeterminant: getMatchWinDeterminantDisplay(
            match.matchWinDeterminant
          ),
          gameCreated: new TableDisplayDate(
            match.changeHistory.matchCreationDate
          ),
          lastChanged: new TableDisplayDate(match.changeHistory.lastChangeDate),
          isNew: localMatch.changeHistory.lastChangeDate === undefined,
          newMoves: newMoves(match, localMatch),
          canGo: canGo(match),
          myScore: new MatchDisplayScore(playerScores[0]),
          player2: match.otherPlayers[0].id,
          player2Score: new MatchDisplayScore(playerScores[1]),
          player3:
            playerScores.length > 2 ? match.otherPlayers[1].id : undefined,
          player3Score:
            playerScores.length > 2
              ? new MatchDisplayScore(playerScores[2])
              : undefined,
          player4:
            playerScores.length === 4 ? match.otherPlayers[2].id : undefined,
          player4Score:
            playerScores.length === 4
              ? new MatchDisplayScore(playerScores[3])
              : undefined,
        },
        additionalElements: [
          <IconButton
            key={0}
            onClick={() => props.playMatch(matchDetail.match.id)}
          >
            <GamesIcon />
          </IconButton>,
        ],
      };
    }
  );
  // if a property is an object will need a way to compare

  return (
    <Paper>
      <SortableTable
        propertyNames={propertyNames}
        rows={rows}
        headCells={sortedHeadCells}
        initialOrderBy="gameState"
      />
    </Paper>
  );
}
