import { useState } from "react";

export function useForceRender() {
  const [dummyForceRender, setDummyForceRender] = useState(0);
  return () => setDummyForceRender(dummyForceRender + 1);
}
