import { useEffect, useState } from "react";

export function useImagePreload(imageUrl: string) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;

    img.addEventListener("load", () => {
      setImageLoaded(true);
    });
  }, [imageUrl]);

  return imageLoaded;
}
