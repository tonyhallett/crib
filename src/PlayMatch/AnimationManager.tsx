import { FlipCardDatas } from "./PlayMatchTypes";

export type AnimationCompletionRegistration = (callback: () => void) => void;

type AnimationProvider = (
  animationCompletedCallback: () => void,
  prevFlipCardDatas: FlipCardDatas | undefined
) => FlipCardDatas;

export class AnimationManager {
  private animating = false;
  private queue: AnimationProvider[] = [];
  constructor(
    private setCardDatas: (
      setter: (cardDatas: FlipCardDatas | undefined) => FlipCardDatas
    ) => void
  ) {}
  private animationCompletedHander = () => {
    const next = this.queue.shift();
    this.animating = next !== undefined;
    if (next) {
      this.handleAndSetCardDatas(next);
    }
  };
  private handleAndSetCardDatas(animationProvider: AnimationProvider) {
    this.animating = true;
    this.setCardDatas((prevFlipCardDatas) => {
      return animationProvider(
        this.animationCompletedHander,
        prevFlipCardDatas
      );
    });
  }
  animate(animationProvider: AnimationProvider) {
    if (!this.animating) {
      this.handleAndSetCardDatas(animationProvider);
    } else {
      this.queue.push(animationProvider);
    }
  }
}
