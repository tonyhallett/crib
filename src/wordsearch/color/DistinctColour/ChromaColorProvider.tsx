import { ColorProviderFromList } from "../ColorProviderFromList";
import { getTheColors } from "./getTheColors";

export class ChromaColorProvider extends ColorProviderFromList {
  constructor() {
    super(getTheColors().map((color) => color.hex()));
  }
}
