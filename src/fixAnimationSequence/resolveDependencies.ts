import { AnimationPlaybackControls } from "framer-motion";
import { ArrayMapGet } from "./ArrayMapGet";
import { getKeyFramesAndTransition } from "./getKeyFramesAndTransition";
import {
  ElementAnimationDefinition,
  NewResolvedAnimationDefinition,
  NewResolvedAnimationDefinitions,
} from "./createAnimationsFromSegments";
import {
  ElementSegmentInfo,
  ResolvedDependencies,
} from "./determineElementDependencies";
import { animateElements } from "./animateElements";
import { resolveElement } from "./resolveElement";

function startDependentAnimationsOnUpdate(
  elementSegmentInfo: ElementSegmentInfo,
  element: Element,
  resolvedAnimationDefinition: ElementAnimationDefinition,

  totalTime: number,
  sequenceDuration: number | undefined,
  animationPlaybackControls: AnimationPlaybackControls[]
) {
  let endingKey = "";
  let maxEnd = 0;
  Object.entries(elementSegmentInfo.values).forEach(([key, value]) => {
    const end = value.delay + value.duration;
    if (end > maxEnd) {
      maxEnd = end;
      endingKey = key;
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const endingTransition = resolvedAnimationDefinition.transition[
    endingKey
  ] as any;
  const currentOnComplete = endingTransition.onComplete;
  const dependent = elementSegmentInfo.dependent as ElementSegmentInfo;
  const segmentDelay =
    dependent.segmentStartTime -
    (elementSegmentInfo.segmentStartTime +
      elementSegmentInfo.segmentTotalDuration);
  const resolvedDependencies = resolveElementDependencies(
    [dependent],
    element,
    totalTime,
    sequenceDuration,
    segmentDelay,
    true
  );

  endingTransition.onComplete = () => {
    //console.log(`key ${keyToOnUpdate} on ${animationSegmentInfo.elementKeyTotalTime!.element.className} onComplete`)
    currentOnComplete?.();
    resolvedDependencies.forEach((def) => {
      //console.log(`animateElements ${(key as Element).className}`)
      def = def as ElementAnimationDefinition;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const animation = animateElements(element, def.keyframes, {
        ...(def.transition as any),
        transitionEnd: def.transitionEnd,
      });
      animationPlaybackControls.push(animation);
    });
  };
}

function resolveElementDependencies(
  elementSegmentInfos: ElementSegmentInfo[],
  element: Element,
  totalTime: number,
  sequenceDuration: number | undefined,
  delay = 0,
  force = false,
  animationPlaybackControls: AnimationPlaybackControls[] = []
): NewResolvedAnimationDefinition[] {
  // the map is only first level
  const animationDefinitions: NewResolvedAnimationDefinition[] = [];
  elementSegmentInfos.forEach((elementSegmentInfo) => {
    if (elementSegmentInfo.dependency === undefined || force) {
      const resolvedAnimationDefinition = resolveElement(
        elementSegmentInfo,
        force ? delay : delay + elementSegmentInfo.segmentStartTime,
        elementSegmentInfo.keyframes
      );
      if (elementSegmentInfo.dependent !== undefined) {
        startDependentAnimationsOnUpdate(
          elementSegmentInfo,
          element,
          resolvedAnimationDefinition as ElementAnimationDefinition,
          totalTime,
          sequenceDuration,
          animationPlaybackControls
        );
      }
      animationDefinitions.push(resolvedAnimationDefinition);
    }
  });
  return animationDefinitions;
}

export function createDefinitions(
  tbd: ResolvedDependencies,
  totalTime: number,
  sequenceDuration: number | undefined,
  delay = 0,
  force = false,
  animationPlaybackControls: AnimationPlaybackControls[] = []
): NewResolvedAnimationDefinitions {
  // the map is only first level
  const map: NewResolvedAnimationDefinitions = new Map();
  const { elementSegmentInfoMap, motionValues } = tbd;
  motionValues.forEach((motionValue) => {
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
  });
  elementSegmentInfoMap.forEach((elementSegmentInfos, element) => {
    const defns = resolveElementDependencies(
      elementSegmentInfos,
      element,
      totalTime,
      sequenceDuration,
      delay,
      force,
      animationPlaybackControls
    );
    map.set(element, defns);
  });
  return map;
}
