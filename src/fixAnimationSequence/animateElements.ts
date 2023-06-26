/* eslint-disable @typescript-eslint/no-var-requires */
import { AnimationPlaybackControls, AnimationScope, AnimationType, DOMKeyframesDefinition, ElementOrSelector, Target, TargetAndTransition, Transition, VisualElement, visualElementStore } from "framer-motion";
import { DynamicAnimationOptions } from "./motion-types";

type VisualElementAnimationOptions = {
    delay?: number
    transitionOverride?: Transition
    custom?: unknown
    type?: AnimationType
}

const fm: {
    resolveElements(
        elements: ElementOrSelector,
        scope?: AnimationScope,
        selectorCache?: { [key: string]: NodeListOf<Element>; }
    ): Element[];
} = require("..\\..\\node_modules\\framer-motion\\dist\\es\\render\\dom\\utils\\resolve-element.mjs");
const fm3: { createVisualElement(element: HTMLElement | SVGElement): void; } = require("..\\..\\node_modules\\framer-motion\\dist\\es\\animation\\utils\\create-visual-element.mjs");
const fm4: {
    animateTarget(
        visualElement: VisualElement,
        definition: TargetAndTransition,
        options?: VisualElementAnimationOptions
    ): AnimationPlaybackControls[];
} = require("..\\..\\node_modules\\framer-motion\\dist\\es\\animation\\interfaces\\visual-element-target.mjs");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fm5: { GroupPlaybackControls: any; } = require("..\\..\\node_modules\\framer-motion\\dist\\es\\animation\\GroupPlaybackControls.mjs");

// eslint-disable-next-line complexity
export function animateElements(
    elementOrSelector: ElementOrSelector,
    keyframes: DOMKeyframesDefinition,
    options?: DynamicAnimationOptions & { transitionEnd?: Target; },
    scope?: AnimationScope
): AnimationPlaybackControls {
    const elements = fm.resolveElements(elementOrSelector, scope);
    const numElements = elements.length;

    //invariant(Boolean(numElements), "No valid element provided.")
    const animations: AnimationPlaybackControls[] = [];

    for (let i = 0; i < numElements; i++) {
        const element = elements[i];

        /**
         * Check each element for an associated VisualElement. If none exists,
         * we need to create one.
         */
        if (!visualElementStore.has(element)) {
            /**
             * TODO: We only need render-specific parts of the VisualElement.
             * With some additional work the size of the animate() function
             * could be reduced significantly.
             */
            fm3.createVisualElement(element as HTMLElement | SVGElement);
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const visualElement = visualElementStore.get(element)!;

        const transition = { ...options };

        /**
         * Resolve stagger function if provided.
         */
        if (typeof transition.delay === "function") {
            transition.delay = transition.delay(i, numElements);
        }

        animations.push(
            ...fm4.animateTarget(
                visualElement,
                { ...keyframes, transition, transitionEnd: options?.transitionEnd } as TargetAndTransition,
                {}
            )
        );
    }

    return new fm5.GroupPlaybackControls(animations);
}
