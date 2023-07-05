import { useEffect, useState } from "react";

export function useImagePreload(imageUrl:string) {
    const [imageLoaded, setImageLoaded] = useState(false);
  
    useEffect(() => {
      const img = new Image();
      img.src = imageUrl;
  
      img.addEventListener('load', () => {
        setImageLoaded(true);
        console.log('Image preloaded successfully:', imageUrl);
      });
  
      img.addEventListener('error', () => {
        console.error('Error preloading image:', imageUrl);
      });
  
      // Clean up the image object to free memory
      return () => {
        console.log("removing event listener")
        img.removeEventListener('load', () => {});
        img.removeEventListener('error', () => {});
      };
    }, [imageUrl]);
  
    return imageLoaded;
  }