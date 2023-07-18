export function hasStringsInCommon(keys1: string[], keys2: string[]) {
  return keys1.some((key) => keys2.includes(key));
}
