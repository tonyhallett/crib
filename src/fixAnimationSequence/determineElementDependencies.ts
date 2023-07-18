import { ArrayMapGet } from "./ArrayMapGet";
import { hasStringsInCommon } from "./hasStringsInCommon";
import {
  AnimationSegmentInfo,
  AnimationSegmentMotionValue,
  ElementValueInfo,
} from "./createAnimationsFromSegments";
import { DOMKeyframesDefinition } from "framer-motion";

export interface ElementSegmentInfo extends ElementValueInfo {
  // could instead have own start time / end time - would be better...
  segmentStartTime: number;
  segmentTotalDuration: number;

  keys: string[];
  keyframes: DOMKeyframesDefinition;
  dependent?: ElementSegmentInfo; // comes later and is starting from onComplete of a dependency
  dependency?: ElementSegmentInfo;
}

export interface ResolvedDependencies {
  elementSegmentInfoMap: Map<Element, ElementSegmentInfo[]>;
  motionValues: AnimationSegmentMotionValue[];
}

const overlap = (
  before: ElementSegmentInfo,
  after: ElementSegmentInfo
): boolean => {
  const beforeEndTime = before.segmentStartTime + before.segmentTotalDuration;
  const afterStartTime = after.segmentStartTime;
  return beforeEndTime > afterStartTime;
};

export const throwIfOverlap = (
  before: ElementSegmentInfo,
  after: ElementSegmentInfo
) => {
  if (overlap(before, after)) {
    throw new Error("Overlapping segments");
  }
};

export function determineElementDependencies(
  animationSegmentInfos: AnimationSegmentInfo[]
): ResolvedDependencies {
  const resolvedDependencies: ResolvedDependencies = {
    elementSegmentInfoMap: new Map<Element, ElementSegmentInfo[]>(),
    motionValues: [],
  };
  const orderedAnimationSegmentInfos = animationSegmentInfos.sort(
    (a, b) => a.startTime - b.startTime
  );
  const mapped = orderedAnimationSegmentInfos.reduce<ResolvedDependencies>(
    (agg, animationSegmentInfo) => {
      const elementSegmentInfoMap = agg.elementSegmentInfoMap;
      if (animationSegmentInfo.motionValue) {
        agg.motionValues.push(animationSegmentInfo.motionValue);
      } else {
        Array.from(animationSegmentInfo.elementValueInfoMap.entries()).forEach(
          ([element, elementValueInfo]) => {
            const elementSegmentInfos = ArrayMapGet(
              elementSegmentInfoMap,
              element
            );
            elementSegmentInfos.push({
              ...elementValueInfo,
              segmentStartTime: animationSegmentInfo.startTime,
              segmentTotalDuration: animationSegmentInfo.totalDuration,
              keyframes: animationSegmentInfo.keyframes,
              keys: animationSegmentInfo.keys,
            });
          }
        );
      }
      return agg;
    },
    resolvedDependencies
  );
  //setting the dependencies
  mapped.elementSegmentInfoMap.forEach((elementSegmentInfos) => {
    for (
      let dependencyIndex = 0;
      dependencyIndex < elementSegmentInfos.length;
      dependencyIndex++
    ) {
      const dependency = elementSegmentInfos[dependencyIndex];
      for (
        let dependentIndex = dependencyIndex + 1;
        dependentIndex < elementSegmentInfos.length;
        dependentIndex++
      ) {
        // due to the ordering, we know that the dependent starts at same time or after the dependency
        const dependent = elementSegmentInfos[dependentIndex];
        if (hasStringsInCommon(dependent.keys, dependency.keys)) {
          throwIfOverlap(dependency, dependent);
          dependency.dependent = dependent;
          dependent.dependency = dependency;
          break;
        }
      }
    }
  });
  return resolvedDependencies;
}
