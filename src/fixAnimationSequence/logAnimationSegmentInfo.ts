import { AnimationSegmentInfo } from "./createAnimationsFromSegments";

export function logAnimationSegmentInfo(
  animationSegmentInfo: AnimationSegmentInfo
) {
  if (animationSegmentInfo.elementKeyTotalTime !== undefined) {
    const totalTimeElement =
      animationSegmentInfo.elementKeyTotalTime.element.className;
    console.log("---------------------------------");
    console.log(
      `elementKeyTotalTime ${totalTimeElement}, key ${animationSegmentInfo.elementKeyTotalTime.key} `
    );
  } else {
    console.log("no elementKeyTotalTime *************");
  }

  console.log("elementvalueinfomap");
  animationSegmentInfo.elementValueInfoMap.forEach((info, key) => {
    console.log(`element ${key.className}`);
    Object.entries(info.values).forEach((e) => {
      const key = e[0];
      const info = e[1];
      console.log(`key ${key} - ${JSON.stringify(info)}`);
    });
  });

  //are these the same as above
  console.log(`keys ${JSON.stringify(animationSegmentInfo.keys)}`);
  console.log(
    `start time ${animationSegmentInfo.startTime}, total duration ${animationSegmentInfo.totalDuration}`
  );
  console.log(`keyframes - ${JSON.stringify(animationSegmentInfo.keyframes)}`);
  console.log("---------------------------------");
}
