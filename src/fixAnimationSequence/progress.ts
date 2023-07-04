export function progress(from: number, to: number, value: number) {
  const toFromDifference = to - from;

  return toFromDifference === 0 ? 1 : (value - from) / toFromDifference;
}
