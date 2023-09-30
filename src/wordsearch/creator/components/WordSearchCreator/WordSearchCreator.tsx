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
import { getWordIndexOrIdentifierForCell } from "./getWordIndexOrIdentifierForCell";
import { GridCellState, getCellState } from "./getCellState";
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
import { useState } from "react";
import chroma from "chroma-js";
import { ColourRestriction, isBlack } from "../../../color/ColorRestriction";
import { ContrastedBackgroundColorProvider } from "../../../color/ContrastedBackgroundColorProvider";
import { demoChangingListColorProvider } from "../../../color/demoChangingListColorProvider";
import { useRefConstructorOnce } from "../../hook/useRefConstructorOnce";
import { cycleEnum } from "../../helpers/cycleEnum";
import {
  CellIdentifier,
  CellIdentifiers,
} from "./getWordIdOrIdentifierForCell";
import { getLetterAndStyle } from "./getLetterAndStyle";

function getBackgroundColor(cellIdentifier: CellIdentifier) {
  switch (cellIdentifier) {
    case CellIdentifiers.noLetters:
    case CellIdentifiers.randomLetters:
      return "white";
    case CellIdentifiers.multipleSameLetters:
      return "pink";
    case CellIdentifiers.conflictingLetters:
      return "red";
  }
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

const initialColourRestriction = ColourRestriction.WhiteAAA;

export function WordSearchCreator() {
  const [currentListIndex, setCurrentListIndex] = useState(0);
  const [currentColourRestriction, setCurrentColourRestriction] =
    useState<ColourRestriction>(initialColourRestriction);
  const colorProviderRef = useRefConstructorOnce(
    () =>
      new ContrastedBackgroundColorProvider(
        [demoChangingListColorProvider],
        "gray",
        initialColourRestriction
      )
  );
  const [state, dispatcher] = useWordSearchCreator();
  const [newWordRef, setNewWordRef] = useRefForOneRender<number>();

  const selectedOutlineColor = getSelectedOutlineColor(
    currentColourRestriction
  );
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
          const nextRestriction = cycleEnum(
            currentColourRestriction,
            colorRestrictions
          );
          colorProviderRef.current.changeColourRestriction(nextRestriction);
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
              const wordIndexOrIdentifier = getWordIndexOrIdentifierForCell(
                cell,
                state.words,
                state.selectedWordId
              );
              const backgroundColor = wordIndexOrIdentifier.isIndex
                ? colorProviderRef.current.getColor(
                    state.words[wordIndexOrIdentifier.index].id
                  )
                : getBackgroundColor(wordIndexOrIdentifier.cellIdentifier);

              const { letter, style } = getLetterAndStyle(
                cell,
                backgroundColor,
                state.selectedWordId,
                state.words
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
                      backgroundColor,
                    }}
                    elevation={3}
                  >
                    <Typography style={style}>{letter}</Typography>
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
