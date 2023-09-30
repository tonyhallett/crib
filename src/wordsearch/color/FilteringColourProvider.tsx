import { ColorProvider } from "./ContrastedBackgroundColorProvider";
import {
  ColourRestriction as ColourRestriction,
  isBlack,
  isTripleA,
} from "./ColorRestriction";
import chroma from "chroma-js";

export abstract class FilteringColorProviderBase implements ColorProvider {
  private applicableColourIndex = 0;
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
      this.applicableColors = this.colors;
      if (this.colourRestriction !== ColourRestriction.None) {
        this.applicableColors = this.filterColours(
          isBlack(this.colourRestriction),
          isTripleA(this.colourRestriction)
        );
      }
      this.exhausted = this.applicableColors.length === 0;
    }
  }

  changeColourRestriction(colourRestriction: ColourRestriction): void {
    this.colourRestriction = colourRestriction;
    this.updateColors();
  }

  private updateColors() {
    this.applicableColourIndex = 0;
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
    return this.colors.filter((color) => {
      return chroma.contrast(color, textColor) >= ratio;
    });
  }

  getColor(): string {
    this.exhausted =
      this.applicableColourIndex === this.applicableColors.length - 1;
    return this.applicableColors[this.applicableColourIndex++];
  }
}
