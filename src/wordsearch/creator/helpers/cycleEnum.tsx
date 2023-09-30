export function cycleEnum<T extends number>(
  currentEnum: T,
  enumValues: T[]
): T {
  const currentIndex = enumValues.indexOf(currentEnum);

  if (currentIndex === -1) {
    // Handle the case where the currentEnum is not found.
    return enumValues[0];
  }

  const nextIndex = (currentIndex + 1) % enumValues.length;
  return enumValues[nextIndex];
}
