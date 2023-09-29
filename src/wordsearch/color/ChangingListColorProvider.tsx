import { FilteringColorProviderBase } from "./FilteringColourProvider";


export class ChangingListColorProvider extends FilteringColorProviderBase {
  private currentListIndex = 0;
  constructor(private listColors: string[][]) {
    super();
  }

  protected getColors(): string[] {
    return this.listColors[this.currentListIndex];
  }

  private getNextListIndex() {
    if (this.currentListIndex < this.listColors.length - 1) {
      this.currentListIndex++;
    } else {
      this.currentListIndex = 0;
    }
    return this.currentListIndex;
  }

  nextList() {
    const nextIndex = this.getNextListIndex();
    this.setColors(this.listColors[nextIndex]);
    return nextIndex;
  }
}
