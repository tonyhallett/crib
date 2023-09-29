import { ColourRestriction } from "./ColorRestriction";

export interface ColorProvider {
  changeColourRestriction(colourRestriction: ColourRestriction): void;
  exhausted: boolean;
  initialize(colorRestriction: ColourRestriction): void;
  getColor(): string;
  onColorsChanged?: (listener: () => void) => void;
}

interface ColorDetail {
  color: string;
  providerIndex: number;
  colorIndex: number;
}

const exhaustedProviders = -1;
interface ColorProviderDetail {
  colorProvider: ColorProvider;
  initialized: boolean;
  providedCount: number;
}

export class ContrastedBackgroundColorProvider {
  private colorDetailsMap = new Map<number, ColorDetail>();
  private usedColorDetails: ColorDetail[] = [];
  private colorProviderDetails: ColorProviderDetail[];
  constructor(
    readonly colorProviders: ColorProvider[],
    public fallbackColor: string = "white",
    private colourRestriction: ColourRestriction = ColourRestriction.None
  ) {
    this.colorProviderDetails = this.colorProviders.map((colorProvider) => ({
      colorProvider,
      initialized: false,
      providedCount: 0,
    }));
  }

  // -----------------------------------------------------------------------------------------------
  private getColorProvider():
    | { colorProvider: ColorProvider; index: number }
    | undefined {
    let cp: ColorProvider | undefined;
    let index = 0;
    for (let i = 0; i < this.colorProviders.length; i++) {
      const colorProvider = this.colorProviders[i];
      if (!colorProvider.exhausted) {
        cp = colorProvider;
        index = i;
        break;
      }
    }

    if (cp) {
      this.initializeColorProviderIfUnitialized(cp, index);
    }

    return cp ? { colorProvider: cp, index } : undefined;
  }

  private initializeColorProviderIfUnitialized(
    colourProvider: ColorProvider,
    index: number
  ) {
    const colorProviderDetails = this.colorProviderDetails[index];
    if (!colorProviderDetails.initialized) {
      this.initializeColorProvider(colourProvider);
    }
    colorProviderDetails.initialized = true;
  }

  private initializeColorProvider(colorProvider: ColorProvider) {
    const colorProviderIndex = this.colorProviders.indexOf(colorProvider);
    colorProvider.initialize(this.colourRestriction);
    colorProvider.onColorsChanged?.(() => {
      this.coloursChanged(colorProvider, colorProviderIndex);
    });
  }

  // -----------------------------------------------------------------------------------

  getColor(id: number): string {
    return this.getStoredColor(id) || this.getUsedColorOrGenerateNew(id);
  }

  private getStoredColor(id: number): string | undefined {
    const colorDetails = this.colorDetailsMap.get(id);
    return colorDetails?.color;
  }

  private getUsedColorOrGenerateNew(id: number): string {
    const colorDetail =
      this.usedColorDetails.shift() ?? this.generateNewColor();
    this.colorDetailsMap.set(id, colorDetail);
    return colorDetail.color;
  }

  // when colors changed should also look at changing colors that have come from fallback ?
  private generateNewColor(): ColorDetail {
    const colorProviderAndIndex = this.getColorProvider();
    return colorProviderAndIndex
      ? this.generateColorFromColorProvider(
          colorProviderAndIndex.colorProvider,
          colorProviderAndIndex.index
        )
      : this.getFallback();
  }

  private getFallback() {
    return {
      color: this.fallbackColor,
      providerIndex: exhaustedProviders,
      colorIndex: 0,
    };
  }

  private generateColorFromColorProvider(
    colorProvider: ColorProvider,
    index: number
  ): ColorDetail {
    const colorProviderDetails = this.colorProviderDetails[index];
    const color = colorProvider.getColor();
    const colorDetails: ColorDetail = {
      color: color,
      providerIndex: index,
      colorIndex: colorProviderDetails.providedCount,
    };
    colorProviderDetails.providedCount++;
    return colorDetails;
  }

  //-------------------------------------------------------------------------------------------------------

  private getColoursToChange(colorProviderIndex: number) {
    const providerColorDetailsToChange: ColorDetail[] = [];
    const fallbackColorDetailsToChange: ColorDetail[] = [];
    this.colorDetailsMap.forEach((colorDetail) => {
      switch (colorDetail.providerIndex) {
        case colorProviderIndex:
          providerColorDetailsToChange.push(colorDetail);
          break;
        case exhaustedProviders:
          fallbackColorDetailsToChange.push(colorDetail);
          break;
      }
    });
    return {
      providerColorDetailsToChange,
      fallbackColorDetailsToChange,
    };
  }

  private changeColorProviderColours(
    providerColorDetailsToChange: ColorDetail[],
    colorProviderDetail: ColorProviderDetail
  ) {
    const colorProvider = colorProviderDetail.colorProvider;
    let replacedColoursCount = 0; // have the color provider provide for its own
    for (let i = 0; i < providerColorDetailsToChange.length; i++) {
      const colorDetail = providerColorDetailsToChange[i];
      const newColor = colorProvider.getColor();
      colorDetail.color = newColor;
      colorDetail.colorIndex = colorProviderDetail.providedCount;
      colorProviderDetail.providedCount++;
      replacedColoursCount++;
      if (colorProvider.exhausted) {
        break;
      }
    }

    return providerColorDetailsToChange.splice(replacedColoursCount);
  }

  private changeColours(
    providerColorDetailsToChange: ColorDetail[],
    fallbackColorDetailsToChange: ColorDetail[],
    colorProviderDetail: ColorProviderDetail
  ) {
    colorProviderDetail.providedCount = 0;

    const unchanged = this.changeColorProviderColours(
      providerColorDetailsToChange,
      colorProviderDetail
    );

    // if there are no unchanged - the color provider that changed could replace if it is the current in the chain
    [...unchanged, ...fallbackColorDetailsToChange].forEach(
      (colorDetailToChange) => {
        const newColorDetail = this.generateNewColor();
        colorDetailToChange.color = newColorDetail.color;
        colorDetailToChange.colorIndex = newColorDetail.colorIndex;
        colorDetailToChange.providerIndex = newColorDetail.providerIndex;
      }
    );
  }

  private coloursChanged(
    colorProvider: ColorProvider,
    colorProviderIndex: number
  ) {
    if (colorProvider.exhausted) {
      throw new Error("color provider should have some colours when colour");
    }
    this.removeUsedColorsForColorProvider(colorProviderIndex);

    const colorProviderDetail = this.colorProviderDetails[colorProviderIndex];

    const { providerColorDetailsToChange, fallbackColorDetailsToChange } =
      this.getColoursToChange(colorProviderIndex);
    this.changeColours(
      providerColorDetailsToChange,
      fallbackColorDetailsToChange,
      colorProviderDetail
    );
  }

  private removeUsedColorsForColorProvider(colorProviderIndex: number) {
    this.usedColorDetails = this.usedColorDetails.filter((usedColorDetail) => {
      return usedColorDetail.providerIndex !== colorProviderIndex;
    });
  }

  // -------------------------------------------------------------------------------------
  private addToUsedColorDetails(colorDetail: ColorDetail): void {
    this.usedColorDetails.push(colorDetail);
    this.usedColorDetails = this.usedColorDetails.sort((a, b) => {
      if (a.providerIndex === b.providerIndex) {
        return a.colorIndex - b.colorIndex;
      }
      return a.providerIndex - b.providerIndex;
    });
  }

  private addToUsedColorDetailsIfNotFallback(colorDetail: ColorDetail) {
    if (colorDetail.providerIndex !== exhaustedProviders) {
      this.addToUsedColorDetails(colorDetail);
    }
  }

  remove(id: number): void {
    const colorDetail = this.colorDetailsMap.get(id) as ColorDetail;
    this.addToUsedColorDetailsIfNotFallback(colorDetail);
    this.colorDetailsMap.delete(id);
  }

  changeColourRestriction(colourRestriction: ColourRestriction) {
    if (colourRestriction !== this.colourRestriction) {
      this.colorProviders.forEach((colorProvider) =>
        colorProvider.changeColourRestriction(colourRestriction)
      );
    }
    this.colourRestriction = colourRestriction;
  }
}
