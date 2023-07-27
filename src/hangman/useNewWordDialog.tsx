import {
  Button,
  Dialog,
  DialogTitle,
  TextField,
  DialogActions,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";

export function useNewWordDialog(
  addNewWord: (word: string, clue: string, andPlay: boolean) => void
) {
  const [openNewWordDialog, setOpenNewWordDialog] = useState<boolean>(false);
  const [newWord, setNewWord] = useState<string>("");
  const [newClue, setNewClue] = useState<string>("");
  const acceptNewWord = newWord.trim().length > 0 && newClue.trim().length > 0;

  const closeAndReset = () => {
    setOpenNewWordDialog(false);
    setNewWord("");
    setNewClue("");
  };
  addNewWord = (word: string, clue: string, andPlay: boolean) => {
    closeAndReset();
    addNewWord(word, clue, andPlay);
  };

  return [
    <Dialog
      key="addNewWordDialog"
      open={openNewWordDialog}
      onClose={() => setOpenNewWordDialog(false)}
    >
      <DialogTitle>Add New Word</DialogTitle>
      <div style={{ padding: "16px" }}>
        <TextField
          label="Word"
          variant="outlined"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          fullWidth
        />
        <TextField
          label="Clue"
          variant="outlined"
          value={newClue}
          onChange={(e) => setNewClue(e.target.value)}
          fullWidth
          style={{ marginTop: "16px" }}
        />
      </div>
      <DialogActions>
        <Button onClick={closeAndReset}>Cancel</Button>
        <Button
          disabled={!acceptNewWord}
          onClick={() => addNewWord(newWord, newClue, false)}
          color="primary"
        >
          Add
        </Button>
        <Button
          disabled={!acceptNewWord}
          onClick={() => addNewWord(newWord, newClue, true)}
          color="primary"
        >
          Add and play
        </Button>
      </DialogActions>
    </Dialog>,
    <IconButton
      key="openNewWordDialogButton"
      onClick={() => setOpenNewWordDialog(true)}
      color="inherit"
      aria-label="edit words"
    >
      <EditIcon />
    </IconButton>,
  ];
}
