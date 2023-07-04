import { SVGProps } from "react";

export type SVGHorizontalVerticalLineProps = Omit<
  SVGProps<SVGLineElement>,
  "x1" | "x2" | "y1" | "y2"
> & { y?: number; x?: number; length: number };
