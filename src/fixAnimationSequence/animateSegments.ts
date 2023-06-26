/* eslint-disable @typescript-eslint/no-var-requires */
import { AnimationPlaybackControls, MotionValue, ValueAnimationTransition } from "framer-motion";
import { animateElements } from "./animateElements";
import { SegmentsAnimationOptions, SmartAnimationSequence, createAnimationsFromSegments} from "./createAnimationsFromSegments";
import { SegmentScopeInternal } from "./useAnimateSegments";
const fm10: {
    animateSingleValue<V>(
        value: MotionValue<V> | V,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        keyframes: any,
        options?: ValueAnimationTransition
    ): AnimationPlaybackControls;
} = require("..\\..\\node_modules\\framer-motion\\dist\\es\\animation\\interfaces\\single-value.mjs");


export function animateSegments(
    sequence: SmartAnimationSequence,
    options: SegmentsAnimationOptions | undefined,
    scope: SegmentScopeInternal
): void {
    const animationDefinitions = createAnimationsFromSegments(sequence, options, scope);
    animationDefinitions.forEach((defns, subject) => {
        defns.forEach((def) => {
            if (def.isMotionValue) {
                const animation = fm10.animateSingleValue(subject, def.keyframes, def.transition);
                scope.animations.push(animation);
            }
            else {

                // ************************ error in their code
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const animation = animateElements(subject as any, def.keyframes, { ...def.transition, transitionEnd: def.transitionEnd });
                scope.animations.push(animation);
            }
        });
    });
}
