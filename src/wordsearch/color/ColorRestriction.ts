export enum ColourRestriction {
  BlackAA,
  BlackAAA,
  WhiteAA,
  WhiteAAA,
  None,
}
export function isBlack(colourRestriction: ColourRestriction) {
  return (
    colourRestriction === ColourRestriction.BlackAA ||
    colourRestriction === ColourRestriction.BlackAAA
  );
}

export function isTripleA(colourRestriction: ColourRestriction) {
  return (
    colourRestriction === ColourRestriction.WhiteAAA ||
    colourRestriction === ColourRestriction.BlackAAA
  );
}
