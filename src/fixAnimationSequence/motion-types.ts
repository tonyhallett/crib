import {
  AnimationOptionsWithValueOverrides,
  DynamicOption,
  MotionValue,
  UnresolvedValueKeyframe,
  ElementOrSelector,
  DOMKeyframesDefinition,
  AnimationPlaybackOptions,
  Easing,
  SpringOptions,
  DecayOptions,
  KeyframeOptions,
} from "framer-motion";

export interface DynamicAnimationOptions
  extends Omit<AnimationOptionsWithValueOverrides, "delay"> {
  delay?: number | DynamicOption<number>;
}
interface DriverControls {
  start: () => void;
  stop: () => void;
  now: () => number;
}
declare type Update = (timestamp: number) => void;
declare type Driver = (update: Update) => DriverControls;
interface InertiaOptions$1 extends DecayOptions {
  bounceStiffness?: number;
  bounceDamping?: number;
  min?: number;
  max?: number;
}
interface Transition
  extends AnimationPlaybackOptions,
    Omit<SpringOptions, "keyframes">,
    Omit<InertiaOptions$1, "keyframes">,
    KeyframeOptions {
  delay?: number;
  elapsed?: number;
  driver?: Driver;
  type?: "decay" | "spring" | "keyframes" | "tween" | "inertia";
  duration?: number;
  autoplay?: boolean;
}

export type SequenceTime =
  | number
  | "<"
  | `+${number}`
  | `-${number}`
  | `${string}`;

export type SequenceLabel = string;

export interface SequenceLabelWithTime {
  name: SequenceLabel;
  at: SequenceTime;
}

export interface At {
  at?: SequenceTime;
}

export type MotionValueSegment = [
  MotionValue,
  UnresolvedValueKeyframe | UnresolvedValueKeyframe[]
];

export type MotionValueSegmentWithTransition = [
  MotionValue,
  UnresolvedValueKeyframe | UnresolvedValueKeyframe[],
  Transition & At
];

export type DOMSegment = [ElementOrSelector, DOMKeyframesDefinition];

export type DOMSegmentWithTransition = [
  ElementOrSelector,
  DOMKeyframesDefinition,
  DynamicAnimationOptions & At
];

export type Segment =
  | MotionValueSegment
  | MotionValueSegmentWithTransition
  | DOMSegment
  | DOMSegmentWithTransition
  | SequenceLabel
  | SequenceLabelWithTime;

export type AnimationSequence = Segment[];

export interface SequenceOptions extends AnimationPlaybackOptions {
  delay?: number;
  duration?: number;
  defaultTransition?: Transition;
}

export interface AbsoluteKeyframe {
  value: string | number | null;
  at: number;
  easing?: Easing;
}

export type ValueSequence = AbsoluteKeyframe[];

export interface SequenceMap {
  [key: string]: ValueSequence;
}

export type ResolvedAnimationDefinition = {
  keyframes: { [key: string]: UnresolvedValueKeyframe[] };
  transition: { [key: string]: Transition };
};

export type ResolvedAnimationDefinitions = Map<
  Element | MotionValue,
  ResolvedAnimationDefinition
>;
