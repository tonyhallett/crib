function combinationUtil<T>(
  arr: T[],
  n: number,
  r: number,
  index: number,
  data: T[],
  i: number,
  container: T[][]
) {
  if (index == r) {
    container.push([...data]);
    return;
  }

  if (i >= n) return;

  data[index] = arr[i];
  combinationUtil(arr, n, r, index + 1, data, i + 1, container);

  combinationUtil(arr, n, r, index, data, i + 1, container);
}

export function permute<T>(arr: T[], r: number): T[][] {
  const data: T[] = new Array(r);

  const result: T[][] = [];
  combinationUtil(arr, arr.length, r, 0, data, 0, result);
  return result;
}
