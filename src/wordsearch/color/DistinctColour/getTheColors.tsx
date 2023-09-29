import chroma from "chroma-js";

const saturations = [1, 0.7, 0.4];
const normalLightness = 0.5;
const lightnessRatios = [0.8, 0.6, 0.4, 1, 1.25, 1.5];
//const lightnesses = lightnessRatios.map(ratio => normalLightness * ratio);
const lightnesses = [0.1, 0.5, 0.9];
export function getTheColors(): chroma.Color[] {
  // problem with using scale is that what get is weighted - can see by increasing the number of colors
  const rgbScaledColors = chroma
    .scale(["red", "yellow", "blue", "red"])
    .colors(12, null);
  const finalColors: chroma.Color[] = [];
  const huesVarieties = rgbScaledColors.map((color) => {
    return chroma.scale(["white", color]).padding([0.2, 0]).colors(10, null);
  });

  const numVarieties = huesVarieties[0].length;
  for (let variety = 0; variety < numVarieties; variety++) {
    for (let hueIndex = 0; hueIndex < rgbScaledColors.length; hueIndex++) {
      finalColors.push(huesVarieties[hueIndex][variety]);
    }
  }

  return finalColors;
}
