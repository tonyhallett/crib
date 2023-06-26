import { AnimationSegmentInfo } from "./createAnimationsFromSegments";

export function isPossibleDependentByStartTime(possibleDependency:AnimationSegmentInfo, possibleDependent:AnimationSegmentInfo):boolean{
    return possibleDependent.startTime > possibleDependency.startTime;
}


export function determineDependencies(animationSegmentInfos: AnimationSegmentInfo[]): void {
    animationSegmentInfos.forEach((animationSegmentInfo) => {
        // eslint-disable-next-line complexity
        animationSegmentInfos.forEach((otherAnimationSegmentInfo) => {
            if (otherAnimationSegmentInfo !== animationSegmentInfo && /* chain check todo */ isPossibleDependentByStartTime(otherAnimationSegmentInfo, animationSegmentInfo)) {
                const commonKeys = animationSegmentInfo.keys.filter((key) => otherAnimationSegmentInfo.keys.includes(key));
                // will need a test for overlap and exception
                if (commonKeys.length > 0) {
                    // the latter is the dependent
                    const dependent = animationSegmentInfo;
                    const dependency = otherAnimationSegmentInfo;
                    const currentDependency = dependent.dependency;
                    if (currentDependency !== undefined) {
                        const currentEndTime = currentDependency.startTime + currentDependency.totalDuration;
                        if (dependency.startTime + dependency.totalDuration > currentEndTime) {
                            currentDependency.dependent = undefined;
                            dependent.dependency = dependency;
                            dependency.dependent = dependent;
                        }
                    } else {
                        dependent.dependency = dependency;
                        dependency.dependent = dependent;
                    }
                }
            }
        });
    });
}
