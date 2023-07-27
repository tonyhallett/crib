import { KeyboardOptions } from "react-simple-keyboard";
import { SwitchableAlphabetKeyboard } from "./SwitchableAlphabetKeyboard";
import { Checkbox, FormControlLabel, styled } from "@mui/material";
import { useState } from "react";

export const correctGuessClassName = "correctguess";
export const incorrectGuessClassName = "incorrectguess";
const buttonSelector = "& .hg-button";
export const KeyboardWrapper = styled("div")(({ theme }) => {
  const guess = theme.guess;
  const incorrectGuessSelector = `${buttonSelector}.${incorrectGuessClassName}`;
  const correctGuessSelector = `${buttonSelector}.${correctGuessClassName}`;
  return {
    "& .hg-theme-default": {
      fontFamily: theme.typography.fontFamily,
      color: "black",
    },
    [incorrectGuessSelector]: {
      backgroundColor: guess.failure,
    },
    [correctGuessSelector]: {
      backgroundColor: guess.success,
    },
  };
});

interface HangmanKeyboardProps {
  keyboardHandler: KeyboardOptions["onKeyReleased"];
  correctGuessButtons: string;
  incorrectGuessButtons: string;
  isQwerty?: boolean;
}
export function HangmanKeyboard({
  keyboardHandler,
  correctGuessButtons,
  incorrectGuessButtons,
  isQwerty,
}: HangmanKeyboardProps) {
  return (
    <KeyboardWrapper>
      <SwitchableAlphabetKeyboard
        isQwerty={isQwerty}
        onKeyReleased={keyboardHandler}
        buttonTheme={[
          {
            class: correctGuessClassName,
            buttons: correctGuessButtons,
          },
          {
            class: incorrectGuessClassName,
            buttons: incorrectGuessButtons,
          },
        ]}
      />
    </KeyboardWrapper>
  );
}

export function useHangmanKeyboard(
  hangmanKeyboardProps: Omit<HangmanKeyboardProps, "isQwerty">
) {
  const [isQwerty, setIsQwerty] = useState(true);
  return [
    <FormControlLabel
      key="isQwertyCheckbox"
      control={
        <Checkbox
          checked={isQwerty}
          onChange={() => {
            setIsQwerty((isQwerty) => !isQwerty);
          }}
        />
      }
      label="QWERTY ?"
    />,
    <HangmanKeyboard
      key="hangmanKeyboard"
      {...hangmanKeyboardProps}
      isQwerty={isQwerty}
    />,
  ];
}
