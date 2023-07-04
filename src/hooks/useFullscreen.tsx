import { useEffect, useState } from "react";

/* export function useFullscreen() {
  const [fullscreen, setFullscreen] = useState(
    document.fullscreenElement !== null
  );
  useEffect(() => {
    // this does not work with F11 in chrome !
    document.documentElement.onfullscreenchange = () => {
      setFullscreen(document.fullscreenElement !== null);
    };
    
    // this does not work as there is no event for F11 when F11 has already been pressed !
    window.onkeyup = function (event) {
      if(event.key === "F11"){
        setFullscreen(!fullscreen);
      }
    }
    return () => {
      document.documentElement.onfullscreenchange = null;
      window.onkeyup = null;
    };
  });
  return fullscreen;
} */

// when the window does not have focus there is an additional 1 pixel vertically
// https://bugs.chromium.org/p/chromium/issues/detail?id=1123233&q=F11&can=2
function getIsFullScreenWithHeightTolerance(tolerance: number) {
  return () => {
    return (
      window.innerWidth === screen.width &&
      screen.height - window.innerHeight <= tolerance
    );
  };
}

const getIsFullScreen = getIsFullScreenWithHeightTolerance(1);

export function useFullscreenHack() {
  const [fullscreen, setFullscreen] = useState(getIsFullScreen());
  useEffect(() => {
    window.onresize = function () {
      // cannot use document.hasFocus() as can F11 when not in focus
      // nor visibility api - document.hidden

      const isFullScreen = getIsFullScreen();
      if (isFullScreen !== fullscreen) {
        setFullscreen(isFullScreen);
      }
    };

    return () => {
      window.onresize = null;
    };
  });
  return fullscreen;
}

// this works on windows ( android calculations are odd ) aside from when press escape - which the browser suggests
// will no longer be in full screen mode in terms of events but will look like it is
export function useFullscreenFullscreenElement() {
  const [fullscreen, setFullscreen] = useState(
    document.fullscreenElement !== null
  );
  useEffect(() => {
    // note that do not get the event when exit ( nor Escape key)
    // and of course cannot force an F11 event either
    window.onkeyup = function (event) {
      if (event.key === "F11") {
        event.preventDefault();
        document.documentElement.requestFullscreen();
      }
    };
    document.documentElement.onfullscreenchange = () => {
      const isFullScreen = document.fullscreenElement !== null;
      setFullscreen(isFullScreen);
    };

    return () => {
      window.onkeyup = null;
      document.documentElement.onfullscreenchange = null;
    };
  });
  return fullscreen;
}

export function useFullscreen() {
  const actual = navigator.userAgent.includes("Android")
    ? useFullscreenFullscreenElement
    : useFullscreenHack;
  return actual();
}
