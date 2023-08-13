import {
  Backdrop,
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { CribGameState } from "../generatedTypes";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
//import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

interface PlayerReady {
  id: string;
  ready: boolean;
}
interface MeReady extends PlayerReady {
  readyClickHandler?: () => void;
}

interface ReadyBackdropProps {
  meReady: MeReady;
  otherPlayersReady: PlayerReady[];
  zIndex: number;
}

export interface ReadyProps extends ReadyBackdropProps {
  gameState: CribGameState;
}

const readyStates: CribGameState[] = [
  CribGameState.Show,
  CribGameState.GameWon,
  CribGameState.MatchWon,
];
export function Ready(props: ReadyProps) {
  const { gameState, meReady, otherPlayersReady, zIndex } = props;

  if (readyStates.includes(gameState)) {
    return (
      <ReadyBackdrop
        zIndex={zIndex}
        meReady={meReady}
        otherPlayersReady={otherPlayersReady}
      />
    );
  }
  return null;
}

function OtherPlayerReadyRow({ playerReady }: { playerReady: PlayerReady }) {
  return (
    <TableRow>
      <TableCell>{playerReady.id}</TableCell>
      <TableCell align="right">{getReadyDisplay(playerReady.ready)}</TableCell>
    </TableRow>
  );
}
function getReadyDisplay(ready: boolean) {
  return ready ? <CheckBoxIcon color="success" /> : <CircularProgress />;
}

export function ReadyBackdrop(props: ReadyBackdropProps) {
  const myIcon = getReadyDisplay(props.meReady.ready);
  const iconOrButton =
    !props.meReady.ready && props.meReady.readyClickHandler ? (
      <IconButton onClick={props.meReady.readyClickHandler}>
        {myIcon}
      </IconButton>
    ) : (
      myIcon
    );
  return (
    <Backdrop open sx={{ zIndex: props.zIndex }}>
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateRows: `repeat(2, auto)`,
              gridTemplateColumns: "1fr",
            }}
          >
            <Typography margin="5px">
              Waiting for players to be ready
            </Typography>
            <Table sx={{ alignSelf: "end" }}>
              <TableBody>
                <TableRow key="myRow">
                  <TableCell>{props.meReady.id}</TableCell>
                  <TableCell align="right">{iconOrButton}</TableCell>
                </TableRow>
                {props.otherPlayersReady.map((otherReady) => (
                  <OtherPlayerReadyRow
                    key={otherReady.id}
                    playerReady={otherReady}
                  />
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
    </Backdrop>
  );
}
