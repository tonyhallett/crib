import { AnimationPlaybackControls } from "framer-motion";
import { animateElements } from "./animateElements";
import {
  AnimationSegmentInfo,
  ElementAnimationDefinition,
} from "./createAnimationsFromSegments";
import { resolveDependencies } from "./resolveDependencies";

export function startDependentAnimationsOnUpdate(
  keyToOnUpdate: string,
  animationSegmentInfo: AnimationSegmentInfo,
  resolvedAnimationDefinition: ElementAnimationDefinition,

  totalTime: number,
  sequenceDuration: number | undefined,
  animationPlaybackControls: AnimationPlaybackControls[]
) {
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const endingTransition = resolvedAnimationDefinition.transition[
    keyToOnUpdate
  ] as any;
  const currentOnComplete = endingTransition.onComplete;
  const dependent = animationSegmentInfo.dependent as AnimationSegmentInfo;
  const segmentDelay =
    dependent.startTime -
    (animationSegmentInfo.startTime + animationSegmentInfo.totalDuration);
  const resolvedDependencies = resolveDependencies(
    [dependent],
    totalTime,
    sequenceDuration,
    segmentDelay,
    true
  );

  endingTransition.onComplete = () => {
    console.log(`key ${keyToOnUpdate} on ${animationSegmentInfo.elementKeyTotalTime.element.className} onComplete`)
    currentOnComplete?.();
    resolvedDependencies.forEach((defs, key) => {
      defs.forEach((def) => {
        console.log(`animateElements ${(key as Element).className}`)
        def = def as ElementAnimationDefinition;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const animation = animateElements(key as Element, def.keyframes, {
          ...(def.transition as any),
          transitionEnd: def.transitionEnd,
        });
        animationPlaybackControls.push(animation);
      });
    });
  };
}
