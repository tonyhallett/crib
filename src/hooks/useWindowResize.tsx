import { useEffect, useState } from "react";

export const getSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export function useWindowResize() {
  const [size, setSize] = useState(getSize());
  useEffect(() => {
    window.onresize = function () {
      setSize(getSize());
    };

    return () => {
      window.onresize = null;
    };
  });
  return size;
}
