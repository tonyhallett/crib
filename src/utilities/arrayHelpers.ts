export function arrayOfEmptyArrays<T>(length: number): T[][] {
  const arr = [];
  for (let i = 0; i < length; i++) {
    arr.push([] as T[]);
  }
  return arr;
}

export function fill<T>(length: number, itemCreator: (i: number) => T) {
  return new Array(length).fill(0).map((_, i) => {
    return itemCreator(i);
  });
}

export const arrayLast = <T>(array: T[]): T => {
  return array[array.length - 1];
};
