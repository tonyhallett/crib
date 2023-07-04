import {
  AnimationPlaybackControls,
  AnimationScope,
  useUnmountEffect,
} from "framer-motion";
import { useRef } from "react";
import { createScopedAnimateSegments } from "./createScopedAnimateSegments";

type Init<T> = () => T;

/**
 * Creates a constant value over the lifecycle of a component.
 *
 * Even if `useMemo` is provided an empty array as its final argument, it doesn't offer
 * a guarantee that it won't re-run for performance reasons later on. By using `useConstant`
 * you can ensure that initialisers don't execute twice or more.
 */
export function useConstant<T>(init: Init<T>) {
  const ref = useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = init();
  }

  return ref.current;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SegmentScope<T extends Element = any> {
  stopAnimations: () => void;
  readonly current: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class SegmentScopeInternal<T extends Element = any>
  implements SegmentScope<T>
{
  stopAnimations() {
    this.animations.forEach((animation) => animation.stop());
  }
  animations: AnimationPlaybackControls[] = [];
  current: T = null as unknown as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAnimateSegments<T extends Element = any>() {
  const scope: SegmentScopeInternal<T> = useConstant(
    () => new SegmentScopeInternal<T>()
  );

  const animate = useConstant(() => createScopedAnimateSegments(scope));

  useUnmountEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    scope.stopAnimations!();
  });

  return [scope, animate] as [SegmentScope<T>, typeof animate];
}
