import { JSONContent } from "@tiptap/react";
import { createContent } from "../../TipTap/createContent";
import { LetterAndState } from "../../hook/reducer/state-types";

export function getContent(
  letterStates: LetterAndState[],
  isSelected: boolean
): JSONContent {
  return createContent(
    letterStates.map((letterState) => {
      return {
        letter: letterState.letter,
        attrs: {
          class: `styledLetter ${letterState.state} ${
            isSelected ? "selected" : ""
          }`,
        },
      };
    })
  );
}
