import { Dialog, DialogTitle, IconButton } from "@mui/material";
import { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";

export function useSettingsDialog({
  isQwertyCheckbox,
}: {
  isQwertyCheckbox: JSX.Element;
}) {
  const [openSettingsDialog, setOpenSettingsDialog] = useState<boolean>(false);
  return [
    <Dialog
      key="settingsDialog"
      open={openSettingsDialog}
      onClose={() => setOpenSettingsDialog(false)}
    >
      <DialogTitle>Settings</DialogTitle>
      {isQwertyCheckbox}
    </Dialog>,
    <IconButton
      key="settingsButton"
      onClick={() => setOpenSettingsDialog(true)}
      color="inherit"
      aria-label="settings"
    >
      <SettingsIcon />
    </IconButton>,
  ];
}
