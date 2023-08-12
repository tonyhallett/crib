import { Card, CardContent } from "@mui/material";
import { motion, useAnimate } from "framer-motion";
import { memo, useEffect, useRef } from "react";

export interface GameWonProps {
  winner: string; // You won / They won / Other id won
}

export function GameWonInner(props: GameWonProps) {
  const lastPropsRef = useRef<GameWonProps | undefined>();
  const [scope, animate] = useAnimate();
  useEffect(() => {
    const element = scope.current as HTMLDivElement;
    element.style.bottom = `${
      (window.innerHeight - (scope.current as HTMLDivElement).offsetHeight) / 2
    }px`;
    if (props !== lastPropsRef.current) {
      animate([
        [
          scope.current,
          {
            left:
              (window.innerWidth -
                (scope.current as HTMLDivElement).offsetWidth) /
              2,
          },
          {
            duration: 0.5,
          },
        ],
        [
          scope.current,
          {
            opacity: 0,
          },
          {
            duration: 0.5,
            delay: 3,
          },
        ],
        [
          scope.current,
          {
            left: window.innerWidth,
          },
          {
            duration: 0.01,
          },
        ],
        [
          scope.current,
          {
            opacity: 1,
          },
          {
            duration: 0.01,
          },
        ],
      ]);
    }
    lastPropsRef.current = props;
  }, [animate, props, scope]);

  return (
    <motion.div
      initial={{
        left: window.innerWidth,
        position: "fixed",
        width: "max-content",
        zIndex: 100,
      }}
      ref={scope}
    >
      <Card>
        <CardContent>{`${props.winner} won !`}</CardContent>
      </Card>
    </motion.div>
  );
}

export const GameWon = memo(GameWonInner, (prev, next) => {
  return prev.winner === next.winner;
});
