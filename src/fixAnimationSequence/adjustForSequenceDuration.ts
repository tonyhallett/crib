import { AnimationSegmentInfo } from "./createAnimationsFromSegments";

export function adjustForSequenceDuration(
  animationSegmentInfos: AnimationSegmentInfo[],
  sequenceDuration: number | undefined,
  totalDuration: number
) {
  if (sequenceDuration !== undefined && sequenceDuration !== totalDuration) {
    const ratio = sequenceDuration / totalDuration;
    animationSegmentInfos.forEach((animationSegmentInfo) => {
      animationSegmentInfo.startTime = animationSegmentInfo.startTime * ratio;
      animationSegmentInfo.totalDuration =
        animationSegmentInfo.totalDuration * ratio;
      const motionValue = animationSegmentInfo.motionValue;
      if (motionValue !== undefined) {
        motionValue.delay = motionValue.delay * ratio;
        motionValue.duration = motionValue.duration * ratio;
      }
      animationSegmentInfo.elementValueInfoMap.forEach((elementValueInfo) => {
        for (const key in elementValueInfo.values) {
          const valueInfo = elementValueInfo.values[key];
          valueInfo.delay = valueInfo.delay * ratio;
          valueInfo.duration = valueInfo.duration * ratio;
        }
      });
    });
  }
}
