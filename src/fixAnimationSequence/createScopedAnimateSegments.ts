import { animateSegments } from "./animateSegments";
import {
  SegmentsAnimationOptions,
  SmartAnimationSequence,
} from "./createAnimationsFromSegments";
import { SegmentScopeInternal } from "./useAnimateSegments";

export function createScopedAnimateSegments(scope: SegmentScopeInternal) {
  /**
   * Animate sequences
   */
  function scopedAnimate(
    sequence: SmartAnimationSequence,
    options?: SegmentsAnimationOptions
  ): void {
    //const animation:AnimationPlaybackControls =
    animateSegments(sequence, options, scope);

    //return animation
  }

  return scopedAnimate;
}
