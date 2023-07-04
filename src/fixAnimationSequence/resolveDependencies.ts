import { ArrayMapGet } from "./ArrayMapGet";
import {
  AnimationSegmentInfo,
  NewResolvedAnimationDefinitions,
  ElementAnimationDefinition,
} from "./createAnimationsFromSegments";
import { resolveElement } from "./resolveElement";
import { startDependentAnimationsOnUpdate } from "./startDependentAnimationsOnUpdate";
import { getKeyFramesAndTransition } from "./getKeyFramesAndTransition";
import { AnimationPlaybackControls } from "framer-motion";

export function resolveDependencies(
  animationSegmentInfos: AnimationSegmentInfo[],
  totalTime: number,
  sequenceDuration: number | undefined,
  delay = 0,
  force = false,
  animationPlaybackControls: AnimationPlaybackControls[] = []
): NewResolvedAnimationDefinitions {
  // the map is only first level
  const map: NewResolvedAnimationDefinitions = new Map();
  animationSegmentInfos.forEach((animationSegmentInfo) => {
    if (animationSegmentInfo.dependency === undefined || force) {
      const motionValue = animationSegmentInfo.motionValue;
      if (motionValue !== undefined) {
        const keyframesAndTransition = getKeyFramesAndTransition(
          motionValue.delay,
          motionValue.duration,
          motionValue.ease,
          motionValue.keyframes
        );
        ArrayMapGet(map, motionValue.motionValue).push({
          keyframes: keyframesAndTransition.keyframes,
          transition: keyframesAndTransition.transition,
          isMotionValue: true,
        });
      }
      animationSegmentInfo.elementValueInfoMap.forEach(
        (elementValueInfo, element) => {
          const resolvedAnimationDefinition = resolveElement(
            elementValueInfo,
            force ? delay : delay + animationSegmentInfo.startTime,
            animationSegmentInfo.keyframes
          );
          if (
            animationSegmentInfo.dependent !== undefined &&
            element === animationSegmentInfo.elementKeyTotalTime.element
          ) {
            startDependentAnimationsOnUpdate(
              animationSegmentInfo.elementKeyTotalTime.key,
              animationSegmentInfo,
              resolvedAnimationDefinition as ElementAnimationDefinition,
              totalTime,
              sequenceDuration,
              animationPlaybackControls
            );
          }
          ArrayMapGet(map, element).push(resolvedAnimationDefinition);
        }
      );
    }
  });
  return map;
}
