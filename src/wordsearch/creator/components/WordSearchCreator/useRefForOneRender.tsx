import { useEffect, useRef } from "react";

export function useRefForOneRender<T>() {
  const ref = useRef<T | undefined>(undefined);
  const markerRef = useRef(false);
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current = false;
    } else {
      ref.current = undefined;
    }
  });
  return [ref, (newVal: T) => {
    ref.current = newVal;
    markerRef.current = true;
  }] as const;
}
