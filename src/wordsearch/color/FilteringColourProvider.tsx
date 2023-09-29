import { ColorProvider } from "./ContrastedBackgroundColorProvider";
import {
  ColourRestriction as ColourRestriction,
  isBlack,
  isTripleA,
} from "./ColorRestriction";
import chroma from "chroma-js";

export abstract class FilteringColorProviderBase implements ColorProvider {
  private count = -1;
  public exhausted = false;
  private applicableColors: string[] = [];
  private colors: string[] = [];
  private coloursChangedListener: (() => void) | undefined;
  private colourRestriction: ColourRestriction | undefined;

  initialize(colourRestriction: ColourRestriction): void {
    this.colors = this.getColors();
    this.colourRestriction = colourRestriction;
    this.setApplicableColours();
  }

  private setApplicableColours() {
    if (this.colourRestriction !== undefined) {
      if (this.colourRestriction === ColourRestriction.None) {
        this.applicableColors = this.colors;
      } else {
        this.filterColours(
          isBlack(this.colourRestriction),
          isTripleA(this.colourRestriction)
        );
      }
    }
  }

  changeColourRestriction(colourRestriction: ColourRestriction): void {
    this.colourRestriction = colourRestriction;
    this.updateColors();
  }

  private updateColors() {
    this.exhausted = false;
    this.count = -1;
    this.setApplicableColours();
    this.coloursChangedListener?.();
  }

  onColorsChanged(listener: () => void) {
    this.coloursChangedListener = listener;
  }

  protected abstract getColors(): string[];
  protected setColors(newColors: string[]) {
    this.colors = newColors;
    this.updateColors();
  }

  private filterColours(textBlack: boolean, tripleA: boolean) {
    const textColor = textBlack ? "black" : "white";
    const ratio = tripleA ? 7 : 4.5;
    // change the system so that it can just return done ?
    this.applicableColors = this.colors.filter((color) => {
      return chroma.contrast(color, textColor) >= ratio;
    });
  }

  getColor(): string {
    this.exhausted = this.count === this.applicableColors.length - 1;
    return this.applicableColors[++this.count];
  }
}
