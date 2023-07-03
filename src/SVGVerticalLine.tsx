import { SVGHorizontalVerticalLineProps } from "./SVGHorizontalVerticalLineProps";

export function SVGVerticalLine(props: SVGHorizontalVerticalLineProps) {
    const { y, x, length, ...remainder } = props;
    const yValue = y ?? 0;
    return <line x1={x} x2={x} y1={y} y2={yValue + length} {...remainder} />;
}
