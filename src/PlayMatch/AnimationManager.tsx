import { FlipCardDatas } from "./PlayMatch";

export type AnimationCompletionRegistration = (callback: () => void) => void;
export type FlipCardDatasWithCompletionRegistration = [
  FlipCardDatas,
  AnimationCompletionRegistration
];

export class AnimationManager {
  private queue: FlipCardDatasWithCompletionRegistration[] = [];
  constructor(private setCardDatas: (cardDatas: FlipCardDatas) => void) {}
  private animationCompletedHander = () => {
    this.queue.shift();
    const next = this.queue.shift();
    if (next) {
      this.handleAndSetCardDatas(next);
    }
  };
  private handleAndSetCardDatas(
    flipCardDatasWithCompletionRegistration: FlipCardDatasWithCompletionRegistration
  ) {
    flipCardDatasWithCompletionRegistration[1](this.animationCompletedHander);
    this.setCardDatas(flipCardDatasWithCompletionRegistration[0]);
  }
  animate(
    flipCardDatasWithCompletionRegistration: FlipCardDatasWithCompletionRegistration
  ) {
    if (this.queue.length === 0) {
      this.handleAndSetCardDatas(flipCardDatasWithCompletionRegistration);
      this.queue.push(flipCardDatasWithCompletionRegistration);
    } else {
      this.queue.push(flipCardDatasWithCompletionRegistration);
    }
  }
}
