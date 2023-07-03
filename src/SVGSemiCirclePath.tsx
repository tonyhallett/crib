import { SVGProps } from "react";

type SVGSemiCirclePathProps = Omit<SVGProps<SVGPathElement>, "d"> & { x: number; y: number; radius: number; top: boolean; };
export function SVGSemiCirclePath(props: SVGSemiCirclePathProps) {
    const { x, y, radius, top, ...remainder } = props;
    const d = `M${x},${y} A${radius},${radius} 0 0,${(top ? 1 : 0)} ${x + 2 * radius},${y}`;
    return <path d={d} {...remainder} />;
}
