export function hasDuplicates(arr: unknown[]) {
  return arr.length !== new Set(arr).size;
}

export function distinct<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
