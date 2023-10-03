import { ColourRestriction, isBlack } from "../../../color/ColorRestriction";
import {
  CellIdentifier,
  CellIdentifiers,
} from "./getWordIdOrIdentifierForCell";
import { LetterBackground } from "./getLetterAndStyle";

export function getMultiCircleRadialBackroundColor(
  color: string,
  stop1: number,
  color2: string,
  stop2: number
) {
  return `radial-gradient(circle, ${color} ${stop1}%, ${color2} ${stop2}%)`;
}

const multiSameLight = "rgb(112, 230, 165)";
const multiSameDark = "rgb(3, 102, 47)";

const conflictingLight = "rgb(242, 119, 128)";
const conflictingDark = "rgb(89, 6, 12)";
// eslint-disable-next-line complexity
export function getCellIdentifierLetterBackgroundColor(
  cellIdentifier: CellIdentifier,
  colourRestriction: ColourRestriction
): LetterBackground {
  const multiSameRadialColor = isBlack(colourRestriction)
    ? multiSameLight
    : multiSameDark;
  const multiSameRadialColor2 = isBlack(colourRestriction)
    ? multiSameDark
    : multiSameLight;

  const conflictingRadialColor = isBlack(colourRestriction)
    ? conflictingLight
    : conflictingDark;
  const conflictingRadialColor2 = isBlack(colourRestriction)
    ? conflictingDark
    : conflictingLight;

  switch (cellIdentifier) {
    case CellIdentifiers.noLetters:
    case CellIdentifiers.randomLetters:
      return { color: "white", isRadiant: false };
    case CellIdentifiers.multipleSameLetters:
      return {
        color: getMultiCircleRadialBackroundColor(
          multiSameRadialColor,
          60,
          multiSameRadialColor2,
          61
        ),
        isRadiant: true,
        textContrastColor: multiSameRadialColor,
      };
    case CellIdentifiers.conflictingLetters:
      //return { color: getMultiCircleRadialBackroundColor("red", 10, "white", 40), isRadiant: true };
      return {
        color: getMultiCircleRadialBackroundColor(
          conflictingRadialColor,
          60,
          conflictingRadialColor2,
          61
        ),
        isRadiant: true,
        textContrastColor: conflictingRadialColor,
      };
  }
}
