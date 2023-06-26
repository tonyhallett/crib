import { useEffect, useState } from "react";

function getIsLandscape() {
  const type = window.screen.orientation.type;
  return type === "landscape-primary" || type === "landscape-secondary";
}

export function useOrientation() {
  const [landscape, setLandscape] = useState(getIsLandscape());
  useEffect(() => {
    const handler: ScreenOrientation["onchange"] = () => {
      const isLandscape = getIsLandscape();
      console.log(`landscape changed - ${isLandscape}`);
      if (landscape !== isLandscape) {
        setLandscape(isLandscape);
      }
    };
    window.screen.orientation.onchange = handler;
    return () => {
      window.screen.orientation.onchange = null;
    };
  });
  return landscape;
}
