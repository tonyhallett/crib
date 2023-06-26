export type JsonReviver = Parameters<typeof JSON.parse>[1];

// if C# only /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{7}Z$/
const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}(\d{4})?Z$/;
export const dateReviver: JsonReviver = (key, value) => {
  if (typeof value === "string") {
    const a = regex.exec(value);
    if (a) {
      return new Date(value);
    }
  }
  return value;
};
