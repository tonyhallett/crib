/* eslint-disable */
import {
  motion,
  useAnimate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import AceSpades from "./cards/SPADE-2.svg";

export function TestMotion() {
  return (
    <>
      <AnimateProp />
    </>
  );
}

/*
    initial?: boolean | Target | VariantLabels;
        declare type VariantLabels = string | string[];
        declare type MakeCustomValueType<T> = {
            [K in keyof T]: T[K] | CustomValueType;
                interface CustomValueType {
                    mix: (from: any, to: any) => (p: number) => number | string;
                    toValue: () => number | string;
                }
            };
        declare type Target = MakeCustomValueType<TargetProperties>;


    surely boolean should be false
    *** initial can be a fn - can even be an array
*/

export function AnimationDelaySequence() {
  const arr = [0, 1, 2, 3, 4, 5];
  const motionDivs = arr.map((i) => {
    const x = 100 + 10 * i;
    const y = 200 + 10 * i;
    const duration = 1; //second
    return (
      <motion.div
        style={{ width: 200 }}
        onAnimationComplete={() => {
          if (i === 5) {
            console.log("All animations complete");
          }
        }}
        key={i}
        transition={{
          duration: duration,
          delay: i * duration,
        }}
        animate={{ x: x, y: y }}
      >
        X,Y
      </motion.div>
    );
  });
  return <>{motionDivs}</>;
}

export function UseAnimate() {
  const [scope, animate] = useAnimate();
}

export function AnimationComplete() {
  return (
    <motion.div
      onAnimationComplete={() => {
        //what is the arg
        console.log("Animation complete");
      }}
      animate={{ x: 100, y: 200 }}
    >
      X,Y
    </motion.div>
  );
}

export function AnimateSameAsInitial() {
  return (
    <motion.div initial={{ x: 100 }} animate={{ x: 100 }}>
      Animate same as initial
    </motion.div>
  );
}

export function AnimateDifferentToInitial() {
  return (
    <motion.div initial={{ x: 100 }} animate={{ x: 200 }}>
      Animate different to initial
    </motion.div>
  );
}

export function InitialFn() {
  const initialFn: any = (cust: number) => ({ x: cust });
  return (
    <motion.div custom={200} initial={initialFn}>
      Initial variant
    </motion.div>
  );
}

export function InitialVariant() {
  return (
    <motion.div
      variants={{
        initialVariant: {
          x: 50,
        },
      }}
      initial="initialVariant"
    >
      Initial variant
    </motion.div>
  );
}

export function JustInitial() {
  return <motion.div initial={{ x: 100 }}>initial prop</motion.div>;
}
export function AnimateProp() {
  return (
    <motion.div
      style={{ width: 100, height: 139.6 }}
      transition={{ duration: 2 }}
      animate={{ x: 600, rotateZ: 45 }}
    >
      <AceSpades style={{ width: 100, height: 139.6 }} />
    </motion.div>
  );
}

export function ManualMotionValueSet() {
  const motionValue = useRef(0);
  const x = useMotionValue(motionValue.current);
  useMotionValueEvent(x, "change", (v) =>
    console.log(`change for UseMotionValue50ForStyleX - ${v}`)
  );
  // animationStart and animationStart / animationComplete events will not be raised
  // as there is no startAnimation fn passed to MotionValue.start()
  return (
    <>
      <motion.div style={{ x }}>style x from useMotionValue</motion.div>
      <button
        onClick={() => {
          motionValue.current = motionValue.current + 50;
          x.set(motionValue.current);
        }}
      >
        Increase motion value
      </button>
    </>
  );
}

export function DragExample() {
  const x = useMotionValue(0);
  // there is an animationStart / complete - drag creates an inertial animation when complete dragging
  useMotionValueEvent(x, "change", (v) => {
    console.log(`change for drag style x - ${v}`);
  });

  const input = [-200, 0, 200];
  const output = [0, 1, 0];
  const opacity = useTransform(x, input, output);
  useMotionValueEvent(opacity, "change", (v) =>
    console.log(`change for drag transformed - ${v}`)
  );
  // there is no animationStart/Complete for a MotionValue created with a transform

  // drag will result in two motion values being required, keys are x and y.
  // by adding motion value via style prop the internal code will use
  // existing - setting the value and calling render on the VisualElement
  return (
    <motion.div drag="x" style={{ x, opacity }}>
      Drag example
    </motion.div>
  );
}
