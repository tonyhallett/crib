import { FilteringColorProviderBase } from "./FilteringColourProvider";

export class ColorProviderFromList extends FilteringColorProviderBase {
  constructor(private listColors: string[]) {
    super();
  }

  protected getColors(): string[] {
    return this.listColors;
  }
}
