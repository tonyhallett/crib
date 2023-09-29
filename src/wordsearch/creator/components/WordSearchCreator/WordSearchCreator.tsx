import {
  Button,
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
import { GridCellState, getCellState } from "./getCellState";
import { getLetter } from "./getLetter";
import { OrientationToolbarWithFlip } from "../OrientationToolbar/OrientationToolbar";
import ClearIcon from "@mui/icons-material/Clear";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { getSelectedOrientation } from "./getCurrentOrientation";
import { getOrientationState } from "./getOrientationState";
import { canExport } from "./canExport";
import { nextWordId } from "../../hook/reducer/newWordReducer";
import { useRefForOneRender } from "./useRefForOneRender";
import { useRef, useState } from "react";
import chroma from "chroma-js";
import { ColourRestriction, isBlack } from "../../../color/ColorRestriction";
import { ContrastedBackgroundColorProvider } from "../../../color/ContrastedBackgroundColorProvider";
import { demoChangingListColorProvider } from "../../../color/demoChangingListColorProvider";
import { useForceRender } from "../../../../hooks/useForceRender";
import { useRefConstructorOnce } from "../../hook/useRefConstructorOnce";

function getTextColor(colourRestriction: ColourRestriction) {
  return isBlack(colourRestriction) ? "black" : "white"; //todo when is None
}

function getSelectedOutlineColor(colourRestriction: ColourRestriction) {
  return isBlack(colourRestriction) ? "black" : chroma("white").darken();
}

const colorRestrictions: ColourRestriction[] = [
  ColourRestriction.BlackAA,
  ColourRestriction.BlackAAA,
  ColourRestriction.WhiteAA,
  ColourRestriction.WhiteAAA,
  ColourRestriction.None,
];
function nextEnum<T extends number>(currentEnum: T, enumValues: T[]): T {
  const currentIndex = enumValues.indexOf(currentEnum);

  if (currentIndex === -1) {
    // Handle the case where the currentEnum is not found.
    return enumValues[0];
  }

  const nextIndex = (currentIndex + 1) % enumValues.length;
  return enumValues[nextIndex];
}

const colourRestriction = ColourRestriction.WhiteAAA;
export function WordSearchCreator() {
  const [currentListIndex, setCurrentListIndex] = useState(0);
  const [currentColourRestriction, setCurrentColourRestriction] =
    useState<ColourRestriction>(colourRestriction);
  const colorProviderRef = useRefConstructorOnce(() => (
    new ContrastedBackgroundColorProvider(
      [demoChangingListColorProvider],
      "gray",
      colourRestriction
    )
  ));
  const [state, dispatcher] = useWordSearchCreator();
  const [newWordRef, setNewWordRef] = useRefForOneRender<number>();

  const textColor = getTextColor(currentColourRestriction);
  const selectedOutlineColor = getSelectedOutlineColor(currentColourRestriction);
  return (
    <>
      <Button
        onClick={() => {
          const nextIndex = demoChangingListColorProvider.nextList();
          setCurrentListIndex(nextIndex);
        }}
      >
        <Typography>{`Next List ${currentListIndex}`}</Typography>
      </Button>
      <Button
        onClick={() => {
          const nextRestriction = nextEnum(
            currentColourRestriction,
            colorRestrictions
          );
          colorProviderRef.current.changeColourRestriction(
            nextRestriction
          );
          setCurrentColourRestriction(nextRestriction);
        }}
      >
        <Typography>{ColourRestriction[currentColourRestriction]}</Typography>
      </Button>
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
      <IconButton
        disabled={!canExport(state)}
        onClick={() => {
          //todo
        }}
      >
        <SaveIcon />
      </IconButton>
      <IconButton
        onClick={() => {
          const newWordId = nextWordId(state.words);
          setNewWordRef(newWordId);
          dispatcher.newWord();
        }}
      >
        <AddIcon />
      </IconButton>
      <IconButton
        disabled={state.selectedWordId === -1}
        onClick={() => {
          colorProviderRef.current.remove(state.selectedWordId);
          dispatcher.deleteWord();
        }}
      >
        <DeleteIcon />
      </IconButton>

      <OrientationToolbarWithFlip
        size="small"
        hasSelectedWord={state.selectedWordId !== -1}
        currentOrientation={getSelectedOrientation(state)}
        orientations={getOrientationState(state)}
        orientationChanged={dispatcher.orientationChanged}
        flipped={dispatcher.flipped}
      />

      <Grid container spacing={1} justifyContent="center">
        {state.wordGrid.map((row, rowIndex) => (
          <Grid key={rowIndex} item container justifyContent="center" xs={12}>
            {row.map((cell, colIndex) => {
              const cellState = getCellState(cell, state.selectedWordId);
              const isSelected =
                cellState === GridCellState.OkSelected ||
                cellState === GridCellState.ConflictSelected;
              const wordIndex = getWordIndex(
                cell,
                state.words,
                state.selectedWordId
              );
              const backgroundColor =
                wordIndex === -1
                  ? "white"
                  : colorProviderRef.current.getColor(
                      state.words[wordIndex].id
                    );
              return (
                <Grid key={colIndex} item>
                  <Paper
                    onClick={() => dispatcher.clickedSquare(rowIndex, colIndex)}
                    style={{
                      width: "40px", // Adjust this size
                      height: "40px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      outline: isSelected
                        ? `5px solid ${selectedOutlineColor}`
                        : undefined,
                      outlineOffset: isSelected ? "-5px" : undefined,
                      /* backgroundColor: getCellColor(
                      getCellState(cell, state.selectedWordId),
                      getWordIndex(cell, state.words, state.selectedWordId)
                    ), */
                      backgroundColor,
                    }}
                    elevation={3}
                  >
                    <Typography style={{ color: textColor }}>
                      {getLetter(cell)}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
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
        const doFocus = newWordRef.current === word.id;
        return (
          <EditablePositionedWord
            key={index}
            isSelected={isSelected}
            word={word}
            textChanged={textChanged}
            focused={focused}
            doFocus={doFocus}
          />
        );
      })}
    </>
  );
}
