import { Node } from "@tiptap/core";

export const styledLetterRootNode = "styledLetterRootNode";
export const styledLetterName = "styledLetter";

// Don't need a Paragraph node
export const StyledLetterRootNode = Node.create({
  name: styledLetterRootNode,
  topNode: true,
  content: "styledLetter+",
});

export interface StyledLetterNodeOptions {
  textChanged(text: string): void;
  id: string;
}

export const StyledLetterNode = Node.create<StyledLetterNodeOptions>({
  name: styledLetterName,
  inline: true,
  group: "inline",
  content: "text*",
  addAttributes() {
    return {
      style: { default: null },
      class: { default: null },
    };
  },
  parseHTML() {
    return [
      {
        tag: "span",
        // could further filter by an identifying dom attribute name
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
  onUpdate() {
    const text = this.editor.getText();
    this.options.textChanged(text);
  },
});
