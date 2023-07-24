import { CSSProperties, Fragment } from "react";
import { useAnimateSegments } from "../fixAnimationSequence/useAnimateSegments";
import { fill } from "../utilities/arrayHelpers";
import { motion } from "framer-motion";

const colours: CSSProperties["color"][] = ["red", "blue", "green"];

export function SvgAnimation() {
  const [scope, animate] = useAnimateSegments();
  return (
    <>
      <button
        onClick={() => {
          animate([
            ["#circle0", { attrX: [0, 100] } as any, { duration: 3 }],
            ["#circle20", { x: [0, 100] }, { duration: 3, at: 0 }],
          ]);
        }}
      >
        Animate
      </button>
      <svg
        ref={scope}
        width="500"
        height="500"
        style={{ transform: "translate(400,400)" }}
      >
        <defs>
          <symbol id="circle">
            <circle stroke="none" r={10} cx={5} cy={5} />
          </symbol>
        </defs>
        {fill(3, (i) => {
          return (
            <Fragment key={i}>
              <use
                x={i * 100}
                href="#circle"
                id={`circle${i}`}
                fill={colours[i]}
              />
              <svg y="200">
                <motion.circle
                  id={`circle2${i}`}
                  transform={`translate(${i * 100},0)`}
                  stroke="none"
                  r={10}
                  cx={5}
                  cy={5}
                  fill={colours[i]}
                />
              </svg>
            </Fragment>
          );
        })}
      </svg>
    </>
  );
}
