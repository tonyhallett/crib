import { TipTapWord, TipTapWordProps } from "../TipTapWord";
import { getContent } from "./getContent";
import { PositionedWordAndLetterState } from "../../hook/reducer/state-types";

export function EditablePositionedWord(props: {
  word: PositionedWordAndLetterState;
  textChanged: TipTapWordProps["textChanged"];
  focused: TipTapWordProps["focused"];
  isSelected: boolean;
}) {
  return (
    <div style={{ margin: 10 }}>
      <TipTapWord
        content={getContent(props.word.letterStates, props.isSelected)}
        textChanged={props.textChanged}
        focused={props.focused}
      />
    </div>
  );
}
