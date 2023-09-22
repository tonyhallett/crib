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
import { ColorProvider, ColorResult, ContrastedBackgroundColorProvider } from "../../ContrastedBackgroundColorProvider";
import { useRef } from "react";
import chroma from "chroma-js";

class ColorProviderFromList implements ColorProvider {
  private count = -1;
  private applicableColors:string[] = [];
  constructor(private colors:string[]){}
  initialize(textBlack:boolean, tripleA:boolean): void {
      this.filterColours(textBlack, tripleA);
  }
  private filterColours(textBlack:boolean, tripleA:boolean){
    const textColor = textBlack ? "black" : "white";
    const ratio = tripleA ? 7 : 4.5;
    // change the system so that it can just return done ?
    this.applicableColors = this.colors.filter(color => {
      return chroma.contrast(color,textColor) >= ratio;
    })
  }
  getColor(): ColorResult {
      return {
          color:this.applicableColors[++this.count],
          done:this.count === this.applicableColors.length - 1
      }
  }
}

function getHues(numDivisions:number):number[] {
  const parts = [0, 120, 240];
  for(let i = 1;i<numDivisions;i++){
    const sortedParts = [...parts].sort((a,b) => a - b);
    const newParts:number[] = [];
    sortedParts.forEach((part,i) => {
      const end = sortedParts[i+1] ?? 360;
      newParts.push(part + ((end - part) / 2));
    });
    parts.push(...newParts)
    
  }
  return parts;
}



class ChromaColorProvider extends ColorProviderFromList{
  constructor(){
    //const startingColors = getHues(4).map(hue => chroma.hsl(hue,100,50));
    const startingColors = getHues(4).map(hue => `hsl(${hue},100%,50%)`);
   
    
    /* 
       const finalColors:chroma.Color[] = [];
      const scaledHues = startingColors.map(color => {
      return [
        color.luminance(0.17),
        color.luminance(0.1),
        color.luminance(0.05),

        color.luminance(0.2),
        color.luminance(0.3),
        color.luminance(0.4),

        color.brighten(3),
        color.brighten(2),
        color.brighten(1),
        color.darken(1),
        color.darken(2),
        color.desaturate(2),
        color.desaturate(1),
        color.saturate(1),
        color.saturate(2)

      ]
    });
        
      for(let j = 0; j < scaledHues[0].length; j++){
        for(let i = 0; i < startingColors.length; i++){
          // j = 0, i = 0; first luminance of the first colors
          // j = 0, i = 1; first luminance of the second color
          finalColors.push(scaledHues[i][j]);
        }
      } */
    
      // use distance or deltaE to filter


    //super(finalColors.map(color => color.hex()));
    //super(startingColors.map(color => color.hex()));
    super(startingColors);
  }
}

class ColorProviderDemo{
  constructor(
    readonly fallbackColor:string = "white",
    readonly textBlack:boolean = true,
    readonly tripleA:boolean = true){
      this.contrastedBackgroundColorProvider = new ContrastedBackgroundColorProvider([
        new ChromaColorProvider()
        /* new ColorProviderFromList([
          "#2f4f4f",
          "#7f0000",
          "#006400",
          "#000080",
          "#9acd32",
          "#8fbc8f",
          "#ff0000",
          "#ff8c00",
          "#ffd700",
          "#00ff00",
          "#ba55d3",
          "#00fa9a",
          "#00ffff",
          "#0000ff",
          "#ff00ff",
          "#1e90ff",
          "#dda0dd",
          "#ff1493",
          "#ffa07a",
          "#87cefa",
        ]) */
      ],fallbackColor,textBlack,tripleA);
  }
  private contrastedBackgroundColorProvider:ContrastedBackgroundColorProvider = new ContrastedBackgroundColorProvider([
    new ColorProviderFromList([
      "#2f4f4f",
      "#7f0000",
      "#006400",
      "#000080",
      "#9acd32",
      "#8fbc8f",
      "#ff0000",
      "#ff8c00",
      "#ffd700",
      "#00ff00",
      "#ba55d3",
      "#00fa9a",
      "#00ffff",
      "#0000ff",
      "#ff00ff",
      "#1e90ff",
      "#dda0dd",
      "#ff1493",
      "#ffa07a",
      "#87cefa",
  ])]);
  getColor(wordId:number):string{
    return this.contrastedBackgroundColorProvider.getColor(wordId);
  }
  remove(wordId:number){
    this.contrastedBackgroundColorProvider.remove(wordId);
  }
}

// eslint-disable-next-line complexity
function hueToRgb(p:number, q:number, t:number) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

const {round } = Math;
//Assumes h, s, and l are contained in the set [0, 1] and returns r, g, and b in the set [0, 255].
function hslToRgb(h:number, s:number, l:number) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1/3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1/3);
  }

  return [round(r * 255), round(g * 255), round(b * 255)];
}
export function HueDemo(){
  return <div>
    {
        getHues(5).map((hue,i) => {
          console.log(hue);
          const chromaColour = chroma.hsl(hue,50,50);
          console.log(chromaColour.css("hsl"));
          console.log(chromaColour.css());
          const rgb = hslToRgb(hue/360, 50/100, 50/100);
          const bgColor = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
          console.log(hslToRgb(hue/360, 50/100, 50/100));
          console.log(chromaColour.hsl())
          

          return <div key={i} style={{backgroundColor:bgColor,width:"100%",height:"10px"}}></div>;
        })
      }
  </div>
}

const textBlack = false;
export function WordSearchCreator() {
  const colorProviderRef = useRef(new ColorProviderDemo("gray",textBlack,false));
  const [state, dispatcher] = useWordSearchCreator();
  const [newWordRef,setNewWordRef] = useRefForOneRender<number>();
  const textColor = textBlack ? "black" : "white";
  const selectedOutlineColor = textBlack ? textColor : chroma(textColor).darken()
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
      <IconButton onClick={() => {
        const newWordId = nextWordId(state.words);
        setNewWordRef(newWordId);
        dispatcher.newWord();
      }}>
        <AddIcon />
      </IconButton>
      <IconButton
        disabled={state.selectedWordId === -1}
        onClick={() => {
          colorProviderRef.current.remove(state.selectedWordId)
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
              const cellState = getCellState(cell, state.selectedWordId)
              const isSelected = cellState === GridCellState.OkSelected || cellState === GridCellState.ConflictSelected;
              const wordIndex = getWordIndex(cell, state.words, state.selectedWordId);
              const backgroundColor = wordIndex === -1 ? "white" : colorProviderRef.current.getColor(
                state.words[wordIndex].id);
              return <Grid key={colIndex} item>
                <Paper
                  onClick={() => dispatcher.clickedSquare(rowIndex, colIndex)}
                  style={{
                    width: "40px", // Adjust this size
                    height: "40px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    outline:isSelected ?`5px solid ${selectedOutlineColor}` : undefined,
                    outlineOffset: isSelected ? "-5px" : undefined,
                    /* backgroundColor: getCellColor(
                      getCellState(cell, state.selectedWordId),
                      getWordIndex(cell, state.words, state.selectedWordId)
                    ), */
                    backgroundColor
                  }}
                  elevation={3}
                >
                  <Typography style={{color:textColor}}>{getLetter(cell)}</Typography>
                </Paper>
              </Grid>
              }
            )}
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
