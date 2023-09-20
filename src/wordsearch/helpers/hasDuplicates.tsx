export function hasDuplicates(arr: unknown[]) {
  return arr.length !== new Set(arr).size;
}
