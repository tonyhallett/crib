export const getIntParam = (param: string | undefined) => {
  return Number.parseInt(param ?? "0");
};
