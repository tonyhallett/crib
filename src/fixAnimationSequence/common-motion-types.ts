import { AnimationPlaybackLifecycles } from "framer-motion"

export type OnUpdate = AnimationPlaybackLifecycles<unknown>["onUpdate"]
export type OnComplete =AnimationPlaybackLifecycles<unknown>["onComplete"]