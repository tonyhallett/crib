import { SVGHorizontalVerticalLineProps } from "./SVGHorizontalVerticalLineProps";

export function SVGHorizontalLine(props: SVGHorizontalVerticalLineProps) {
  const { y, x, length, ...remainder } = props;
  const xValue = x ?? 0;
  return <line x1={x} x2={xValue + length} y1={y} y2={y} {...remainder} />;
}
