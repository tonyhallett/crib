import { useEffect, useState } from "react";

export function useImagePreload(imageUrl: string) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;

    const loadHandler = () => {
      setImageLoaded(true);
    };
    img.addEventListener("load", loadHandler);

    return () => {
      img.removeEventListener("load", loadHandler);
    };
  }, [imageUrl]);

  return imageLoaded;
}
