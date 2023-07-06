import { useEffect, useState } from "react";

export const getSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

export function useWindowResize() {
  const [size, setSize] = useState(getSize());
  useEffect(() => {
    window.onresize = function () {
      const newSize = getSize();
      if (newSize.height !== size.height || newSize.width !== size.width) {
        // chrome 1 pixel when not active window
        if (Math.abs(newSize.height - size.height) !== 1) {
          setSize(newSize);
        }
      }
    };

    return () => {
      window.onresize = null;
    };
  });
  return size;
}
