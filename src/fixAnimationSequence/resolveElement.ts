import { DOMKeyframesDefinition, ValueKeyframesDefinition } from "framer-motion";
import { ElementAnimationDefinition, ElementValueInfo, NewResolvedAnimationDefinition } from "./createAnimationsFromSegments";
import { getKeyFramesAndTransition } from "./getKeyFramesAndTransition";

type KeyFramesAndTransition = Omit<ElementAnimationDefinition,"transitionEnd">;
function getElementKeyframesAndTransition(
    elementValues:ElementValueInfo["values"],
    delay:number,
    domKeyFramesDefinition:DOMKeyframesDefinition
):KeyFramesAndTransition{
    const keyframesAndTransition:KeyFramesAndTransition = {
        keyframes:{},
        transition:{},
        isMotionValue:false
    }
    // eslint-disable-next-line complexity
    Object.keys(elementValues).forEach((key) => {
        const {delay:elementDelay, duration, ease,onComplete,onUpdate} = elementValues[key];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const valueKeyframes = (domKeyFramesDefinition as any)[key] as ValueKeyframesDefinition;
        const {keyframes, transition} = getKeyFramesAndTransition(elementDelay + delay,duration,ease,valueKeyframes,onComplete,onUpdate);
        

        keyframesAndTransition.keyframes[key] = keyframes;
        keyframesAndTransition.transition[key] = transition;
    });
    return keyframesAndTransition;
}

export function resolveElement(
    elementValueInfo: ElementValueInfo,
    delay: number,
    domKeyFramesDefinition: DOMKeyframesDefinition
): NewResolvedAnimationDefinition {
    return {
        ...getElementKeyframesAndTransition(elementValueInfo.values, delay, domKeyFramesDefinition),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transitionEnd: elementValueInfo.transitionEnd as any
    };
}
