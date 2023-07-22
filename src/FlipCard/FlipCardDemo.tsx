import { useState } from "react";
import { WoodWhenPlaying } from "../WoodWhenPlaying";
import { Pips, Suit } from "../generatedTypes";
import {
  FlipCardProps,
  FlipCard,
  FlipAnimation,
  DomSegmentOptionalElementOrSelectorWithOptions,
} from "./FlipCard";
import { Size } from "../PlayMatch/matchLayoutManager";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Input,
  MenuItem,
  Select,
} from "@mui/material";

const magnification = 3;
const size: Size = { width: 63 * magnification, height: 88 * magnification };

interface AnimationParameters {
  description: string;
  amount: number;
}
interface IAnimationWithParameters {
  description: string;
  parameters: AnimationParameters[];
  getAnimationSequence(): FlipCardProps["animationSequence"];
}

class SingleValueAnimation implements IAnimationWithParameters {
  description: string;
  parameters: AnimationParameters[];
  constructor(
    private filter: string,
    private filterSuffix = "",
    private initialAmount: number = 0
  ) {
    this.description = filter;
    this.parameters = [
      {
        description: "amount",
        amount: initialAmount,
      },
    ];
  }
  getAnimationSequence(): FlipCardProps["animationSequence"] {
    const segment: DomSegmentOptionalElementOrSelectorWithOptions = [
      undefined,
      {
        filter: `${this.filter}(${this.parameters[0].amount}${this.filterSuffix})`,
      },
      {
        duration: 2,
      },
    ];
    return [segment];
  }
}

class NoParametersAnimation implements IAnimationWithParameters {
  constructor(
    public description: string,
    private animationSequence: FlipCardProps["animationSequence"]
  ) {}
  parameters = [];
  getAnimationSequence() {
    return this.animationSequence;
  }
}

class BoxShadowAnimation implements IAnimationWithParameters {
  description = "boxShadow";
  parameters = [
    {
      description: "blur",
      amount: 0,
    },
    {
      description: "spread",
      amount: 5,
    },
  ];
  getAnimationSequence() {
    const segment: DomSegmentOptionalElementOrSelectorWithOptions = [
      undefined,
      {
        boxShadow: `0px 0px ${this.parameters[0].amount}px  ${this.parameters[1].amount}px #CCFF00`, // blur and spread values
      },
      {
        duration: 2,
      },
    ];
    return [segment];
  }
}

const flipAnimation: FlipAnimation = {
  flip: true,
  duration: 1,
};

const movementSegment: DomSegmentOptionalElementOrSelectorWithOptions = [
  undefined,
  {
    x: 900,
  },
  {
    x: { duration: 5 },
  },
];

const animationsWithParameters: IAnimationWithParameters[] = [
  new BoxShadowAnimation(),

  new SingleValueAnimation("blur", "px", 2), // interesting animation with large values - 100

  new SingleValueAnimation("opacity", undefined, 0.2),
  new SingleValueAnimation("brightness", undefined, 0.7), // looks good
  new SingleValueAnimation("contrast", undefined, 0.6), // not for low values
  new SingleValueAnimation("sepia", undefined, 0.6), // this looks good

  new SingleValueAnimation("invert", undefined, 1), // works but have to look at the suit to determine - only good for value 1

  new NoParametersAnimation("flip move flip", [
    flipAnimation,
    movementSegment,
    flipAnimation,
  ]),
  //new SingleValueAnimation("saturate",undefined,0.6), // not suitable for non picture black card
  //new SingleValueAnimation("grayscale",undefined,0.5), not suitable for non picture black card
  //new SingleValueAnimation("hue-rotate","deg",90), not suitable for non picture black card
];
export function FlipCardDemo() {
  return (
    <>
      <WoodWhenPlaying playing />
      <FlipCardDemoX top />
      <FlipCardDemoX top={false} />
    </>
  );
}

interface StateAnimationParameters {
  description: string;
  amount: number | string;
}
function cloneParameters(
  parameters: AnimationParameters[]
): StateAnimationParameters[] {
  return parameters.map((parameter) => {
    return { ...parameter };
  });
}
// eslint-disable-next-line complexity
export function FlipCardDemoX(props: { top: boolean }) {
  const [
    selectedAnimationWithParametersIndex,
    setSelectedAnimationWithParametersIndex,
  ] = useState(0);
  const [animationParameters, setAnimationParameters] = useState(
    cloneParameters(animationsWithParameters[0].parameters)
  );
  const [redSuit, setRedSuit] = useState(true);
  const [pictureCard, setPictureCard] = useState(true);
  const [animationSequence, setAnimationSequence] = useState<
    FlipCardProps["animationSequence"] | undefined
  >(undefined);
  const redSuitChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRedSuit(event.target.checked);
  };
  const pictureCardChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPictureCard(event.target.checked);
  };
  const playingCard = {
    pips: pictureCard ? Pips.King : Pips.Ace,
    suit: redSuit ? Suit.Hearts : Suit.Spades,
  };
  return (
    <>
      <div
        style={{
          backgroundColor: "white",
          position: "absolute",
          top: props.top ? 0 : undefined,
          bottom: props.top ? undefined : 0,
        }}
      >
        <FormControlLabel
          control={<Checkbox checked={redSuit} onChange={redSuitChanged} />}
          label="Red Suit ?"
        />
        <FormControlLabel
          control={
            <Checkbox checked={pictureCard} onChange={pictureCardChanged} />
          }
          label="Picture card ?"
        />
        <Select
          value={selectedAnimationWithParametersIndex}
          onChange={(event) => {
            setSelectedAnimationWithParametersIndex(
              event.target.value as number
            );
            const parameters =
              animationsWithParameters[event.target.value as number].parameters;
            setAnimationParameters(cloneParameters(parameters));
            //
          }}
        >
          {animationsWithParameters.map((animationWithParameters, i) => {
            return (
              <MenuItem key={i} value={i}>
                {animationWithParameters.description}
              </MenuItem>
            );
          })}
        </Select>

        <div>
          {animationParameters.map((parameter, i) => {
            return (
              <div
                key={`${animationsWithParameters[selectedAnimationWithParametersIndex].description}_${i}`}
              >
                <div>{parameter.description}</div>
                <Input
                  type="number"
                  key={i}
                  value={parameter.amount}
                  onChange={(event) => {
                    const newParameters = animationParameters.map(
                      (parameter, j) => {
                        if (j === i) {
                          const amount =
                            event.target.value === ""
                              ? ""
                              : Number(event.target.value);
                          if (amount !== "") {
                            animationsWithParameters[
                              selectedAnimationWithParametersIndex
                            ].parameters[i].amount = amount;
                          }
                          return { ...parameter, amount };
                        }
                        return parameter;
                      }
                    );
                    setAnimationParameters(newParameters);
                  }}
                />
              </div>
            );
          })}
        </div>
        <Button
          onClick={() => {
            setAnimationSequence(
              animationsWithParameters[
                selectedAnimationWithParametersIndex
              ].getAnimationSequence()
            );
          }}
        >
          Animate
        </Button>
      </div>
      <div style={{ perspective: 5000 }}>
        <FlipCard
          key={playingCard.suit + playingCard.pips}
          playingCard={playingCard}
          size={size}
          startFaceUp
          isHorizontal={false}
          position={{ x: 200, y: props.top ? 200 : 480 }}
          animationSequence={animationSequence}
        />
      </div>
    </>
  );
}
