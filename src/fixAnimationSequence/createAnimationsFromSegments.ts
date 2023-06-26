/* eslint-disable @typescript-eslint/no-var-requires */
import { AnimationPlaybackLifecycles, DOMKeyframesDefinition, DynamicOption, Easing, ElementOrSelector, KeyframeOptions, MotionValue, SVGPathTransitions, SVGTransitions, SpringOptions, StyleTransitions, Target, Transition, UnresolvedValueKeyframe, ValueKeyframesDefinition, VariableTransitions, isMotionValue } from "framer-motion";
import { At, DOMSegment, MotionValueSegment, MotionValueSegmentWithTransition, SequenceLabel, SequenceLabelWithTime, SequenceTime } from "./motion-types";
import { getValueTransition } from "./getValueTransition";
const fm: {
    resolveElements(
        elements: ElementOrSelector,
        scope?: SegmentScope,
        selectorCache?: { [key: string]: NodeListOf<Element>; }
    ): Element[];
} = require("..\\..\\node_modules\\framer-motion\\dist\\es\\render\\dom\\utils\\resolve-element.mjs");
const fm6: {
    calcNextTime(
        current: number,
        next: SequenceTime,
        prev: number,
        labels: Map<string, number>

    ): number;
} = require("..\\..\\node_modules\\framer-motion\\dist\\es\\animation\\sequence\\utils\\calc-time.mjs");

const fm7: {
    createGeneratorEasing(options: Transition, scale?:number):{
        ease: Easing | Easing[],
        duration: number,
    };
} = require("..\\..\\node_modules\\framer-motion\\dist\\es\\easing\\utils\\create-generator-easing.mjs");

import { determineDependencies } from "./determineDependencies";
import { resolveDependencies } from "./resolveDependencies";
import { adjustForSequenceDuration } from "./adjustForSequenceDuration";
import { OnComplete, OnUpdate } from "./common-motion-types";
import { keyframesAsList } from "./keyframesAsList";
import { secondsToMilliseconds } from "./secondsToMilliseconds";
import { isNumberKeyframesArray } from "./isNumberKeyframesArray";
import { SegmentScope, SegmentScopeInternal } from "./useAnimateSegments";

export type SegmentTransitionWithTransitionEnd = SegmentTransition &  { transitionEnd?: Target | DynamicOption<Target> };

type SegmentTransition = SegmentPlaybackLifecycles<unknown> & {
    delay?: number | DynamicOption<number>
    duration?:number,
    ease?:KeyframeOptions["ease"],
    type?:"decay" | "spring" | "keyframes" | "tween" | "inertia"
} & Omit<SpringOptions, "keyframes">

type SegmentAnimationStyleTransitions = {
    [K in keyof StyleTransitions]?: SegmentTransition;
};
type SegmentAnimationSVGPathTransitions = {
    [K in keyof SVGPathTransitions]?: SegmentTransition;
};
type SegmentAnimationSVGTransitions = {
    [K in keyof SVGTransitions]?: SegmentTransition;
}
type SegmentAnimationVariableTransitions = {
    [K in keyof VariableTransitions]?: SegmentTransition;
}
interface SegmentPlaybackLifecycles<V> {
    onUpdate?: (latest: V, element:Element) => void
    onPlay?: () => void
    onComplete?: (element:Element) => void
    onRepeat?: () => void
    onStop?: () => void
}
type SegmentAnimationOptions = SegmentAnimationStyleTransitions &
SegmentAnimationSVGPathTransitions &
SegmentAnimationSVGTransitions &
SegmentAnimationVariableTransitions &
SegmentTransition

export interface SegmentAnimationOptionsWithValueOverrides
    extends Omit<SegmentAnimationOptions, "delay"> {
    delay?: number | DynamicOption<number>
}

//SVGPathProperties not exported

export type SegmentAnimationOptionsWithTransitionEnd = 
SegmentAnimationOptionsWithValueOverrides & { transitionEnd?: Target | DynamicOption<Target> }
export type SmartDomSegmentWithTransition = [ElementOrSelector, DOMKeyframesDefinition, SegmentAnimationOptionsWithTransitionEnd & At ]
export type SmartSegment =
| MotionValueSegment
| MotionValueSegmentWithTransition
| DOMSegment
| SmartDomSegmentWithTransition
| SequenceLabel
| SequenceLabelWithTime
export type SmartAnimationSequence = SmartSegment[]



export type ElementValueInfo = {
    transitionEnd?:Transition,
    values:{
        [key:string]:{
            delay:number,
            duration:number,
            onUpdate?:OnUpdate,
            onComplete?:OnComplete,
            ease:Easing | Easing[],
        }
    },
}

export interface AnimationSegmentInfo{
    startTime:number,
    totalDuration:number,
    elementValueInfoMap:Map<Element, ElementValueInfo>
    keys:string[],
    keyframes:DOMKeyframesDefinition,
    dependency?:AnimationSegmentInfo,
    dependent?:AnimationSegmentInfo
    elementKeyTotalTime:{element:Element,key:string}
    motionValue?:{
        duration:number,
        delay:number,
        ease: Easing | Easing[],
        motionValue:MotionValue,
        keyframes:ValueKeyframesDefinition
    }
}

export type IntermediateAnimationSegmentInfo = Omit<AnimationSegmentInfo,"elementKeyTotalTime"|"totalDuration">

interface SegmentAnimationTransition {
    duration:number,
    delay:number,
    ease:KeyframeOptions["ease"],
    times:KeyframeOptions["times"]
    onComplete?:AnimationPlaybackLifecycles<unknown>["onComplete"]
    onUpdate?:AnimationPlaybackLifecycles<unknown>["onUpdate"]
}

export type ElementAnimationDefinition = {
    keyframes: { [key: string]: UnresolvedValueKeyframe[] };
    transition: { [key: string]: SegmentAnimationTransition };
    transitionEnd?: Target;
    isMotionValue:false
};
export type MotionValueAnimationDefinition = {
    keyframes:UnresolvedValueKeyframe[],
    transition:SegmentAnimationTransition,
    isMotionValue:true
}
export type NewResolvedAnimationDefinition = ElementAnimationDefinition | MotionValueAnimationDefinition;
export type NewResolvedAnimationDefinitions = Map<Element | MotionValue,NewResolvedAnimationDefinition[]>

// eslint-disable-next-line complexity
function getAnimationSegments(
    sequence: SmartAnimationSequence,
    scope: SegmentScope|undefined,
    defaultDuration:number,
    defaultEasing:Easing | Easing[]
){
    const timeLabels = new Map<string, number>();
    const elementCache = {};
    let prevTime = 0;
    let currentTime = 0;
    let totalDuration = 0;

    const animationSegmentInfos: AnimationSegmentInfo[] = [];

    for (let i = 0; i < sequence.length; i++) {
        const segment = sequence[i];

        /**
         * If this is a timeline label, mark it and skip the rest of this iteration.
         */
        if (typeof segment === "string") {
            timeLabels.set(segment, currentTime);
            continue;
        } else if (!Array.isArray(segment)) {
            timeLabels.set(
                segment.name,
                fm6.calcNextTime(currentTime, segment.at, prevTime, timeLabels)
            );
            continue;
        }

        // eslint-disable-next-line prefer-const
        let [subject, keyframes, transition = {}] = segment;

        /**
         * If a relative or absolute time value has been specified we need to resolve
         * it in relation to the currentTime.
         */
        if (transition.at !== undefined) {
            currentTime = fm6.calcNextTime(
                currentTime,
                transition.at,
                prevTime,
                timeLabels
            );
        }

        let maxDuration = 0;
        const animationSegmentInfo: IntermediateAnimationSegmentInfo = {
            startTime: currentTime,
            elementValueInfoMap: new Map<Element, ElementValueInfo>(),
            keys: [],
            keyframes: keyframes as DOMKeyframesDefinition
        };
        let elementKeyTotalTime: { element: Element; key: string; } | undefined;
        // eslint-disable-next-line no-inner-declarations, complexity
        function resolveTime(
            valueKeyframes: UnresolvedValueKeyframe | UnresolvedValueKeyframe[],
            valueTransition: SegmentTransitionWithTransitionEnd,
            elementIndex: number,
            numElements: number,
            key: string,
            element: Element | undefined
        ) {
            const valueKeyframesAsList = keyframesAsList(valueKeyframes)
            let { ease = defaultEasing } = valueTransition;

            const {
                delay = 0, type = "keyframes", onComplete, onUpdate, ...remainingTransition
            } = valueTransition;
            let transitionEnd = valueTransition.transitionEnd;
            let { duration } = valueTransition;
            if(key === "zIndex"){
                duration = 0;
            }
            /**
             * Resolve stagger() if defined.
             */
            const calculatedDelay = typeof delay === "function"
                ? delay(elementIndex, numElements)
                : delay;

            const numKeyframes = valueKeyframesAsList.length
            if (numKeyframes <= 2 && type === "spring") {
                /**
                 * As we're creating an easing function from a spring,
                 * ideally we want to generate it using the real distance
                 * between the two keyframes. However this isn't always
                 * possible - in these situations we use 0-100.
                 */
                let absoluteDelta = 100
                if (
                    numKeyframes === 2 &&
                    isNumberKeyframesArray(valueKeyframesAsList)
                ) {
                    const delta =
                        valueKeyframesAsList[1] - valueKeyframesAsList[0]
                    absoluteDelta = Math.abs(delta)
                }

                const springTransition = { ...remainingTransition }
                if (duration !== undefined) {
                    springTransition.duration = secondsToMilliseconds(duration)
                }

                const springEasing = fm7.createGeneratorEasing(
                    springTransition,
                    absoluteDelta
                )

                ease = springEasing.ease
                duration = springEasing.duration
            }
            duration ??= defaultDuration;

            const startTime = currentTime + calculatedDelay;
            const targetTime = startTime + duration;

            maxDuration = Math.max(calculatedDelay + duration, maxDuration);
            if (element) {
                let elementValueInfo: ElementValueInfo;
                if (animationSegmentInfo.elementValueInfoMap.has(element)) {
                    elementValueInfo = animationSegmentInfo.elementValueInfoMap.get(element) as ElementValueInfo;
                } else {
                    elementValueInfo = {
                        values: {}
                    };
                    animationSegmentInfo.elementValueInfoMap.set(element, elementValueInfo);
                }
                elementValueInfo.values[key] = {
                    duration,
                    delay: calculatedDelay,
                    ease,
                    onUpdate: onUpdate ? (v: unknown) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (onUpdate as any)(v, element);
                    } : undefined,
                    onComplete: onComplete ? () => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (onComplete as any)(element);
                    } : undefined
                };

                if (transitionEnd) {
                    if (typeof transitionEnd === 'function') {
                        transitionEnd = transitionEnd(elementIndex, numElements);
                    }
                    elementValueInfo.transitionEnd = transitionEnd;
                }
            } else {
                animationSegmentInfo.motionValue = {
                    duration,
                    ease,
                    delay: calculatedDelay,
                    motionValue: subject as MotionValue,
                    keyframes: keyframes as ValueKeyframesDefinition
                };
            }


            const prevTotalDuration = totalDuration;
            totalDuration = Math.max(targetTime, totalDuration);
            if (prevTotalDuration !== totalDuration && element) {
                elementKeyTotalTime = { element, key };
            }
        }

        if (isMotionValue(subject)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            resolveTime(keyframes as ValueKeyframesDefinition,transition as any, 0, 1, '', undefined);

        } else {
            /**
             * Find all the elements specified in the definition and parse value
             * keyframes from their timeline definitions.
             */
            const elements = fm.resolveElements(subject, scope, elementCache);
            const numElements = elements.length;

            keyframes = keyframes as DOMKeyframesDefinition;
            transition = transition as SegmentAnimationOptionsWithTransitionEnd;

            /**
             * For every element in this segment, process the defined values.
             */
            for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
                for (const key in keyframes) {
                    animationSegmentInfo.keys.push(key);
                    // probably want to change the return type
                    const valueTransition = getValueTransition(transition, key);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolveTime((keyframes as any)[key],valueTransition, elementIndex, numElements, key, elements[elementIndex]);
                }
            }

            prevTime = currentTime;
            currentTime += maxDuration;
        }
        
        animationSegmentInfos.push({
            ...animationSegmentInfo,
            totalDuration: maxDuration,
            elementKeyTotalTime: elementKeyTotalTime as { element: Element; key: string; } // todo: fix this
        });
    }

    return {
        animationSegmentInfos,
        totalDuration
    }
}

export type SegmentsAnimationOptions = {
    duration?:number,
    delay?:number,
    defaultTransition?:{
        duration?:number,
        ease?:Easing | Easing[];
    }
}
export function createAnimationsFromSegments(
    sequence: SmartAnimationSequence,
    { defaultTransition = {}, ...sequenceTransition }: SegmentsAnimationOptions = {},
    scope?: SegmentScopeInternal
): NewResolvedAnimationDefinitions {
    const {animationSegmentInfos, totalDuration} = getAnimationSegments(
        sequence, 
        scope,
        defaultTransition.duration || 0.3,
        defaultTransition.ease || "easeOut"
    );

    determineDependencies(animationSegmentInfos);
    adjustForSequenceDuration(animationSegmentInfos, sequenceTransition.duration, totalDuration);
    return resolveDependencies(animationSegmentInfos, totalDuration, sequenceTransition.duration, sequenceTransition.delay,false,scope === undefined ? [] : scope.animations);
}