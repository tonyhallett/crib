import Text from "@tiptap/extension-text";
import { Content, EditorContent, useEditor } from "@tiptap/react";
import {
  StyledLetterRootNode,
  StyledLetterNode,
  StyledLetterNodeOptions,
} from "../TipTap/Schema";
import { useEffect } from "react";

export interface TipTapWordProps {
  content: Content;
  textChanged: StyledLetterNodeOptions["textChanged"];
  focused: () => void;
}

export function TipTapWord(props: TipTapWordProps) {
  const { content, textChanged } = props;
  const tipTapEditor = useEditor({
    extensions: [
      StyledLetterRootNode,
      Text,
      StyledLetterNode.configure({ textChanged }),
    ],
    content,
    onFocus: props.focused,
  });
  useEffect(() => {
    tipTapEditor?.commands.setContent(content);
  }, [content, tipTapEditor]);

  if (!tipTapEditor) {
    return null;
  }

  return (
    <>
      <EditorContent editor={tipTapEditor} />
    </>
  );
}
