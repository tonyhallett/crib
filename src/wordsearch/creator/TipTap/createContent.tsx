import { Attrs } from "@tiptap/pm/model";
import { styledLetterName, styledLetterRootNode } from "./Schema";
import { JSONContent } from "@tiptap/react";

function createStyledLetterNode(letter: string, attrs: Attrs): JSONContent {
  return {
    type: styledLetterName,
    attrs,
    content: [{ type: "text", text: letter }],
  };
}

export interface AttributedLetter {
  letter: string;
  attrs: Attrs;
}

export function createContent(
  attributedLetters: AttributedLetter[]
): JSONContent {
  const content: JSONContent = {
    type: styledLetterRootNode,
    content: attributedLetters.map((attributedLetter) => {
      return createStyledLetterNode(
        attributedLetter.letter,
        attributedLetter.attrs
      );
    }),
  };
  return content;
}
