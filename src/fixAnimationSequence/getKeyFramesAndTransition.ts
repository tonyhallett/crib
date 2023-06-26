/* eslint-disable @typescript-eslint/no-var-requires */
import { Easing, UnresolvedValueKeyframe, ValueKeyframesDefinition } from "framer-motion";
import { ValueSequence } from "./motion-types";
import { progress } from "./progress";
import { keyframesAsList } from "./keyframesAsList";
import { OnComplete, OnUpdate } from "./common-motion-types";
const fm7: { defaultOffset(arr: unknown[]): number[]; } = require("..\\..\\node_modules\\framer-motion\\dist\\es\\utils\\offsets\\default.mjs");
const fm8: { fillOffset(offset: number[], remaining: number): void; } = require("..\\..\\node_modules\\framer-motion\\dist\\es\\utils\\offsets\\fill.mjs");
const fm9: {
    addKeyframes(
        sequence: ValueSequence,
        keyframes: UnresolvedValueKeyframe[],
        easing: Easing | Easing[],
        offset: number[],
        startTime: number,
        endTime: number
    ): void;
} = require("..\\..\\node_modules\\framer-motion\\dist\\es\\animation\\sequence\\utils\\edit.mjs");

// eslint-disable-next-line complexity
const defaultSegmentEasing = "easeInOut"
// eslint-disable-next-line complexity
export function getKeyFramesAndTransition(
    delay: number,
    duration: number,
    ease: Easing | Easing[],
    valueKeyframes: ValueKeyframesDefinition,
    onComplete?: OnComplete,
    onUpdate?: OnUpdate) {

    const valueKeyframesAsList = keyframesAsList(valueKeyframes);
    const times = fm7.defaultOffset(valueKeyframesAsList);

    const startTime = 0;
    const targetTime = startTime + duration;

    /**
     * If there's only one time offset of 0, fill in a second with length 1
     */
    if (times.length === 1 && times[0] === 0) {
        times[1] = 1;
    }

    /**
     * Fill out if offset if fewer offsets than keyframes
     */
    const remainder = times.length - valueKeyframesAsList.length;
    remainder > 0 && fm8.fillOffset(times, remainder);

    /**
     * If only one value has been set, ie [1], push a null to the start of
     * the keyframe array. This will let us mark a keyframe at this point
     * that will later be hydrated with the previous value.
     */
    valueKeyframesAsList.length === 1 &&
        valueKeyframesAsList.unshift(null);

    const valueSequence: ValueSequence = [];
    fm9.addKeyframes(valueSequence, valueKeyframesAsList, ease, times, startTime, targetTime);
    const keyframes: UnresolvedValueKeyframe[] = [];
    const valueOffset: number[] = [];
    const valueEasing: Easing[] = [];

    /**
     * For each keyframe, translate absolute times into
     * relative offsets based on the total duration of the timeline.
     */
    for (let i = 0; i < valueSequence.length; i++) {
        const { at, value, easing } = valueSequence[i];
        keyframes.push(value);
        //valueOffset.push(progress(0, totalDuration, at))
        valueOffset.push(progress(0, duration, at));
        valueEasing.push(easing || "easeOut");
    }

    /**
     * If the first keyframe doesn't land on offset: 0
     * provide one by duplicating the initial keyframe. This ensures
     * it snaps to the first keyframe when the animation starts.
     */
    if (valueOffset[0] !== 0) {
        valueOffset.unshift(0);
        keyframes.unshift(keyframes[0]);
        valueEasing.unshift(defaultSegmentEasing);
    }

    /**
     * If the last keyframe doesn't land on offset: 1
     * provide one with a null wildcard value. This will ensure it
     * stays static until the end of the animation.
     */
    if (valueOffset[valueOffset.length - 1] !== 1) {
        valueOffset.push(1);
        keyframes.push(null);
    }
    return {
        keyframes,
        transition: {
            duration,
            ease: valueEasing,
            times: valueOffset,
            onComplete,
            onUpdate,
            delay
        }
    };
}
