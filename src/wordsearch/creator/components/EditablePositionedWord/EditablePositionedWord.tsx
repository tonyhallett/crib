import { TipTapWord, TipTapWordProps } from "../TipTapWord";
import { getContent } from "./getContent";
import { PositionedWordAndLetterState } from "../../hook/reducer/state-types";
import { memo } from "react";

interface EditablePositionedWordProps {
  word: PositionedWordAndLetterState;
  textChanged: TipTapWordProps["textChanged"];
  focused: TipTapWordProps["focused"];
  isSelected: boolean;
  doFocus: boolean;
}
export function EditablePositionedWordImpl(props: EditablePositionedWordProps) {
  return (
    <div style={{ margin: 10 }}>
      <TipTapWord
        content={getContent(props.word.letterStates, props.isSelected)}
        textChanged={props.textChanged}
        focused={props.focused}
        doFocus={props.doFocus}
        id={props.word.id}
      />
    </div>
  );
}

function letterStatesNoRerender(
  prevProps: EditablePositionedWordProps,
  newProps: EditablePositionedWordProps
) {
  if (
    prevProps.word.letterStates.length !== newProps.word.letterStates.length
  ) {
    return false;
  }
  for (let i = 0; i < prevProps.word.letterStates.length; i++) {
    const prevLetterState = prevProps.word.letterStates[i];
    const newLetterState = newProps.word.letterStates[i];
    if (
      prevLetterState.letter !== newLetterState.letter ||
      prevLetterState.state !== newLetterState.state
    ) {
      return false;
    }
  }
  return true;
}
export const EditablePositionedWord = memo(
  EditablePositionedWordImpl,
  (prevProps, newProps) => {
    if (
      prevProps.isSelected !== newProps.isSelected ||
      prevProps.doFocus !== newProps.doFocus ||
      prevProps.word.id !== newProps.word.id
    ) {
      return false;
    }
    return letterStatesNoRerender(prevProps, newProps);
  }
);
