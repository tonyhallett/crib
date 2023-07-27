import SimpleKeyboard, { KeyboardReactInterface } from "react-simple-keyboard";

export type SwitchableAlphabetKeyboardProps = Omit<
  KeyboardReactInterface["options"],
  "layout" | "layoutName"
> & {
  isQwerty?: boolean;
};
export const qwertyLayoutName = "default";
export const aToZLayoutName = "alphabetical";
export function SwitchableAlphabetKeyboard(
  props: SwitchableAlphabetKeyboardProps
) {
  const { isQwerty, ...rest } = props;
  const qwerty = isQwerty === undefined ? true : isQwerty;
  const layoutName = qwerty ? qwertyLayoutName : aToZLayoutName;
  return (
    <SimpleKeyboard
      {...rest}
      layout={{
        [qwertyLayoutName]: [
          "Q W E R T Y U I O P",
          "A S D F G H J K L",
          "Z X C V B N M",
        ],
        [aToZLayoutName]: [
          "A B C D E F G H I",
          "J K L M N O P Q R",
          "S T U V W X Y Z",
        ],
      }}
      layoutName={layoutName}
    />
  );
}
