import { AnimationSegmentInfo } from "./createAnimationsFromSegments";

export function isPossibleDependentByStartTime(
  possibleDependency: AnimationSegmentInfo,
  possibleDependent: AnimationSegmentInfo
): boolean {
  return possibleDependent.startTime > possibleDependency.startTime;
}

function setDependency(dependent:AnimationSegmentInfo,dependency:AnimationSegmentInfo){
  dependent.dependency = dependency;
  dependency.dependent = dependent;
}

function hasKeysInCommon(keys1:string[], keys2:string[]){
  return keys1.some(key => keys2.includes(key))
}

function newDependencyEndsLater(currentDependency:AnimationSegmentInfo, dependency:AnimationSegmentInfo){
  const currentEndTime = currentDependency.startTime + currentDependency.totalDuration;
  return dependency.startTime + dependency.totalDuration >
  currentEndTime;
}

export function determineDependencies(
  animationSegmentInfos: AnimationSegmentInfo[]
): void {
  animationSegmentInfos.forEach((dependent) => {
    // eslint-disable-next-line complexity
    animationSegmentInfos.forEach((dependency) => {
      if (
        dependency !== dependent &&
        isPossibleDependentByStartTime(
          dependency,
          dependent
        ) &&
        hasKeysInCommon(dependent.keys,dependency.keys)
      ) {
        // the dependent runs later and is dependent
        const currentDependency = dependent.dependency;
        if (currentDependency !== undefined) {
          if (
            newDependencyEndsLater(currentDependency,dependency)
          ) {
            currentDependency.dependent = undefined;
            setDependency(dependent, dependency);
          }
        } else {
          setDependency(dependent, dependency);
        }

        //setDependency(dependent, dependency);
      }
    });
  });
}
