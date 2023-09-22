import Text from "@tiptap/extension-text";
import { Content, EditorContent, useEditor } from "@tiptap/react";
import {
  StyledLetterRootNode,
  StyledLetterNode,
  StyledLetterNodeOptions,
} from "../TipTap/Schema";
import { useEffect } from "react";
import { EnterAWordPlaceholder } from "../TipTap/enterAWordPlaceholder";

export interface TipTapWordProps {
  content: Content;
  textChanged: StyledLetterNodeOptions["textChanged"];
  focused: () => void;
  doFocus:boolean,
  id:number
}



export function TipTapWord(props: TipTapWordProps) {
  const { content, textChanged } = props;
  const tipTapEditor = useEditor({
    extensions: [
      StyledLetterRootNode,
      Text,
      StyledLetterNode.configure({ textChanged }),
      EnterAWordPlaceholder
    ],
    content,
    onFocus: props.focused,
  });
  useEffect(() => {
    tipTapEditor?.commands.setContent(content);
  }, [content, tipTapEditor]);

  useEffect(() => {
    if (props.doFocus) {
      tipTapEditor?.commands.focus();
    }
  }, [props, tipTapEditor]);

  if (!tipTapEditor) {
    return null;
  }

  return (
    <>
      <EditorContent editor={tipTapEditor} />
    </>
  );
}
