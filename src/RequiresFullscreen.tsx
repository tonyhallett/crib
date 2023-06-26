import { IconButton } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

export function RequiresFullscreen() {
  return (
    <>
      <div>The game requires full screen mode</div>
      <IconButton
        onClick={() => document.documentElement.requestFullscreen()}
        color="inherit"
      >
        <FullscreenIcon />
      </IconButton>
    </>
  );
}
