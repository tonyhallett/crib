export function inBounds(
  rect: { left: number; right: number; top: number; bottom: number },
  x: number,
  y: number
) {
  if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
    return true;
  }
  return false;
}
