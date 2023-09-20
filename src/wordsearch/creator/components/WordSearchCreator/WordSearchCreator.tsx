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
import { OrientationState, Orientations } from "../OrientationToolbar";
import {
  Orientation,
  PositionedWordAndLetterState,
  WordSearchCreatorCalculatedState,
  WordSearchGrid,
} from "../../hook/reducer/state-types";
import ClearIcon from "@mui/icons-material/Clear";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import SaveIcon from "@mui/icons-material/Save";

const orientationOrder: Orientation[] = [
  Orientation.LeftToRight,
  Orientation.RightToLeft,
  Orientation.TopToBottom,
  Orientation.BottomToTop,
  Orientation.TopLeftToBottomRight,
  Orientation.BottomRightToTopLeft,
  Orientation.TopRightToBottomLeft,
  Orientation.BottomLeftToTopRight,
];
function getOrientationState(
  state: WordSearchCreatorCalculatedState
): OrientationState[] {
  return orientationOrder.map((orientation) => {
    return {
      orientation,
      enabled: state.selectedWordId !== -1,
    };
  });
}

function getCurrentOrientation(
  state: WordSearchCreatorCalculatedState
): Orientation {
  return (
    state.words.find((word) => word.id === state.selectedWordId)?.orientation ??
    Orientation.LeftToRight
  );
}

function gridHasLetters(wordGrid: WordSearchGrid): boolean {
  for (let row = 0; row < wordGrid.length; row++) {
    for (let col = 0; col < wordGrid[row].length; col++) {
      const cell = wordGrid[row][col];
      if (cell.contributingLetters.length === 0) {
        return false;
      }
    }
  }
  return true;
}

function wordsAreOk(words: PositionedWordAndLetterState[]): boolean {
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.letterStates.length; j++) {
      const letterState = word.letterStates[j].state;
      if (letterState !== "ok") {
        return false;
      }
    }
  }
  return true;
}

function gridHasLettersAndOkState(
  wordGrid: WordSearchGrid,
  words: PositionedWordAndLetterState[]
): boolean {
  return gridHasLetters(wordGrid) && wordsAreOk(words);
}
function canExport(state: WordSearchCreatorCalculatedState): boolean {
  const hasWordsWithLength =
    state.words.length > 0 && state.words.every((word) => word.word.length > 0);
  return (
    hasWordsWithLength && gridHasLettersAndOkState(state.wordGrid, state.words)
  );
}

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
