import { FlipCardDatas } from "./PlayMatch";

export type AnimationCompletionRegistration = (callback: () => void) => void;
/* export type FlipCardDatasWithCompletionRegistration = [
  FlipCardDatas,
  AnimationCompletionRegistration
]; */

type AnimationProvider = (animationCompletedCallback:() => void,prevFlipCardDatas:FlipCardDatas|undefined) => FlipCardDatas;

export class AnimationManager {
  private queue: AnimationProvider[] = [];
  constructor(private setCardDatas:(setter:(cardDatas: FlipCardDatas|undefined) => FlipCardDatas) => void) {}
  private animationCompletedHander = () => {
    this.queue.shift();
    const next = this.queue.shift();
    if (next) {
      this.handleAndSetCardDatas(next);
    }
  };
  private handleAndSetCardDatas(
    animationProvider: AnimationProvider
  ) {
    
    this.setCardDatas(prevFlipCardDatas => {
      return animationProvider(this.animationCompletedHander,prevFlipCardDatas);
    });
  }
  animate(
    animationProvider: AnimationProvider
  ) {
    if (this.queue.length === 0) {
      this.handleAndSetCardDatas(animationProvider);
      this.queue.push(animationProvider);
    } else {
      this.queue.push(animationProvider);
    }
  }
}
