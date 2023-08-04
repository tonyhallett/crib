export const getAppendMessage = () => {
  let message = "";
  const apppendMessage = (messageToAppend: string) => {
    if (message.length > 0) {
      //lowercase the first letter
      messageToAppend =
        messageToAppend[0].toLowerCase() + messageToAppend.slice(1);
      messageToAppend = `, ${messageToAppend}`;
    }
    message += messageToAppend;
  };
  return [apppendMessage, () => message] as const;
};
