import {
  Grid,
  IconButton,
  Paper,
  ToggleButton,
  Typography,
} from "@mui/material";
import { EditablePositionedWord } from "../EditablePositionedWord/EditablePositionedWord";
import { useWordSearchCreator } from "../../hook/useWordSearchCreator";
import { getCellColor } from "./getCellColor";
import { getWordIndex } from "./getWordIndex";
import { getCellState } from "./getCellState";
import { getLetter } from "./getLetter";
import { Orientations } from "../OrientationToolbar";
import ClearIcon from "@mui/icons-material/Clear";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { getCurrentOrientation } from "./getCurrentOrientation";
import { getOrientationState } from "./getOrientationState";
import { canExport } from "./canExport";

export function WordSearchCreator() {
  const [state, dispatcher] = useWordSearchCreator();
  return (
    <>
      <IconButton onClick={dispatcher.newWordSearch}>
        <ClearIcon />
      </IconButton>
      <ToggleButton
        value="check"
        selected={state.fillWithRandomLetters}
        onChange={() => dispatcher.toggleFillWithRandomLetters()}
      >
        <ShuffleIcon />
      </ToggleButton>
      <IconButton disabled={!canExport(state)} onClick={() => alert("todo")}>
        <SaveIcon />
      </IconButton>
      <IconButton onClick={() => dispatcher.newWord()}>
        <AddIcon />
      </IconButton>
      <IconButton
        disabled={state.selectedWordId === -1}
        onClick={() => dispatcher.deleteWord()}
      >
        <DeleteIcon />
      </IconButton>

      <Orientations
        size="small"
        hasSelectedWord={state.selectedWordId !== -1}
        currentOrientation={getCurrentOrientation(state)}
        orientations={getOrientationState(state)}
        orientationChanged={dispatcher.orientationChanged}
      />

      <Grid container spacing={1} justifyContent="center">
        {state.wordGrid.map((row, rowIndex) => (
          <Grid key={rowIndex} item container justifyContent="center" xs={12}>
            {row.map((cell, colIndex) => (
              <Grid key={colIndex} item>
                <Paper
                  onClick={() => dispatcher.clickedSquare(rowIndex, colIndex)}
                  style={{
                    width: "40px", // Adjust this size
                    height: "40px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: getCellColor(
                      getCellState(cell, state.selectedWordId),
                      getWordIndex(cell, state.words, state.selectedWordId)
                    ),
                  }}
                  elevation={3}
                >
                  <Typography>{getLetter(cell)}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
      {state.words.map((word, index) => {
        const textChanged = (newText: string) => {
          dispatcher.wordTextChanged(index, newText);
        };
        const focused = () => {
          dispatcher.wordSelected(word.id);
        };
        const isSelected = word.id === state.selectedWordId;
        return (
          <EditablePositionedWord
            key={index}
            isSelected={isSelected}
            word={word}
            textChanged={textChanged}
            focused={focused}
          />
        );
      })}
    </>
  );
}
