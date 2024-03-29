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
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { getSelectedOrientation } from "./getCurrentOrientation";
import { getOrientationState } from "./getOrientationState";
import { canExport } from "./canExport";
import { nextWordId } from "../../hook/reducer/newWordReducer";
import { useRefForOneRender } from "./useRefForOneRender";
import { useEffect, useState } from "react";
import chroma from "chroma-js";
import { ColourRestriction, isBlack } from "../../../color/ColorRestriction";
import { ContrastedBackgroundColorProvider } from "../../../color/ContrastedBackgroundColorProvider";
import { demoChangingListColorProvider } from "../../../color/demoChangingListColorProvider";
import { useRefConstructorOnce } from "../../hook/useRefConstructorOnce";
import { cycleEnum } from "../../helpers/cycleEnum";
import { getLetterAndStyle } from "./getLetterAndStyle";
import { getCellIdentifierLetterBackgroundColor } from "./getCellIdentifierLetterBackgroundColor";
import { useSubmit } from "react-router-dom";
import { wordSearchLocalStorage } from "../../../wordSearchLocalStorage";
import { createSubmit } from "../../../router/routes/create/createAction";
import { createLoaderAndUseLoaderData } from "../../../router/routes/create/createLoader";

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
  const submit = useSubmit();
  const loaderState = createLoaderAndUseLoaderData.useLoaderData();
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
  const [state, dispatcher] = useWordSearchCreator(loaderState ?? undefined);
  const [newWordRef, setNewWordRef] = useRefForOneRender<number>();
  useEffect(() => {
    wordSearchLocalStorage.setWordSearchCreatorState(state);
  }, [state]);
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
          // do I need fetcher submit ?
          // use Form/fetcher.Form
          createSubmit(submit, state, false);
          dispatcher.newWordSearch();
        }}
      >
        <SaveIcon />
      </IconButton>
      <IconButton
        disabled={!canExport(state)}
        onClick={() => {
          // do I need fetcher submit ?
          // use Form/fetcher.Form
          createSubmit(submit, state, true);
          dispatcher.newWordSearch();
        }}
      >
        <PlayArrowIcon />
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
              const backgroundColorDetails = wordIndexOrIdentifier.isIndex
                ? {
                    isRadiant: false,
                    color: colorProviderRef.current.getColor(
                      state.words[wordIndexOrIdentifier.index].id
                    ),
                  }
                : getCellIdentifierLetterBackgroundColor(
                    wordIndexOrIdentifier.cellIdentifier,
                    currentColourRestriction
                  );

              const { letter, style } = getLetterAndStyle(
                cell,
                backgroundColorDetails,
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
                      background: backgroundColorDetails.color,
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
