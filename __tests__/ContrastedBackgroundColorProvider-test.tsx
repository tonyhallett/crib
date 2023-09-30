import {
  ContrastedBackgroundColorProvider,
  ColorProvider,
} from "../src/wordsearch/color/ContrastedBackgroundColorProvider";
import { ColourRestriction } from "../src/wordsearch/color/ColorRestriction";

describe("ContrastedBackgroundColorProvider", () => {
  it("should lazily initialize providers", () => {
    const initialize = jest.fn();
    new ContrastedBackgroundColorProvider([
      {
        initialize,
        getColor: jest.fn(),
        exhausted: false,
        changeColourRestriction() {
          //
        },
      },
    ]);
    expect(initialize).not.toHaveBeenCalled();
  });
  describe("first request for color", () => {
    const colorRestrictions = [
      ColourRestriction.BlackAA,
      ColourRestriction.BlackAAA,
      ColourRestriction.None,
      ColourRestriction.WhiteAA,
      ColourRestriction.WhiteAAA,
    ];
    colorRestrictions.forEach((colorRestriction) => {
      it("should initialize the first provider", () => {
        const initialize = jest.fn();
        const getColor = jest.fn().mockReturnValue("red");
        const initialize2 = jest.fn();
        const contrastedBackgroundColorProvider =
          new ContrastedBackgroundColorProvider(
            [
              {
                initialize,
                getColor,
                exhausted: false,
                changeColourRestriction() {
                  //
                },
              },
              {
                initialize: initialize2,
                getColor: jest.fn(),
                exhausted: false,
                changeColourRestriction() {
                  //
                },
              },
            ],
            "",
            colorRestriction
          );
        contrastedBackgroundColorProvider.getColor(1);
        expect(initialize).toHaveBeenCalledWith(colorRestriction);
      });
    });

    it("should return from the first provider", () => {
      const contrastedBackgroundColorProvider =
        new ContrastedBackgroundColorProvider([
          {
            initialize: jest.fn(),
            getColor: () => "red",
            exhausted: false,
            changeColourRestriction() {
              //
            },
          },
          {
            initialize: jest.fn(),
            getColor: jest.fn(),
            exhausted: false,
            changeColourRestriction() {
              //
            },
          },
        ]);
      const color = contrastedBackgroundColorProvider.getColor(1);
      expect(color).toBe("red");
    });
  });
  describe("request for color by same id", () => {
    it("should not ask a provider", () => {
      const thrower = jest.fn().mockImplementation(() => {
        throw new Error("should not be called");
      });
      const getColor = jest.fn().mockReturnValue({
        color: "red",
        done: false,
      });
      const contrastedBackgroundColorProvider =
        new ContrastedBackgroundColorProvider([
          {
            initialize: jest.fn(),
            getColor,
            exhausted: false,
            changeColourRestriction() {
              //
            },
          },
          {
            initialize: thrower,
            getColor: thrower,
            exhausted: false,
            changeColourRestriction() {
              //
            },
          },
        ]);
      contrastedBackgroundColorProvider.getColor(1);
      contrastedBackgroundColorProvider.getColor(1);
      expect(getColor).toHaveBeenCalledTimes(1);
    });
    it("should return the stored color", () => {
      const contrastedBackgroundColorProvider =
        new ContrastedBackgroundColorProvider([
          {
            initialize: jest.fn(),
            getColor: () => "red",
            exhausted: false,
            changeColourRestriction() {
              //
            },
          },
        ]);
      contrastedBackgroundColorProvider.getColor(1);
      const color = contrastedBackgroundColorProvider.getColor(1);
      expect(color).toBe("red");
    });
  });
  describe("subsequent requests with new id", () => {
    describe("no removals", () => {
      describe("provider not done", () => {
        it("should ask the provider again", () => {
          let first = true;
          const contrastedBackgroundColorProvider =
            new ContrastedBackgroundColorProvider([
              {
                initialize: jest.fn(),
                getColor() {
                  const color = first ? "red" : "blue";
                  first = false;
                  return color;
                },
                exhausted: false,
                changeColourRestriction() {
                  //
                },
              },
            ]);
          contrastedBackgroundColorProvider.getColor(1);
          const color = contrastedBackgroundColorProvider.getColor(2);
          expect(color).toBe("blue");
        });
      });
      describe("provider done", () => {
        describe("not exhausted", () => {
          it("should initialize the next provider", () => {
            const secondInitialize = jest.fn();
            const contrastedBackgroundColorProvider =
              new ContrastedBackgroundColorProvider(
                [
                  {
                    initialize: jest.fn(),
                    getColor() {
                      this.exhausted = true;
                      return "red";
                    },
                    exhausted: false,
                    changeColourRestriction() {
                      //
                    },
                  },
                  {
                    initialize: secondInitialize,
                    getColor: () => "blue",
                    exhausted: false,
                    changeColourRestriction() {
                      //
                    },
                  },
                ],
                "",
                ColourRestriction.BlackAA
              );
            contrastedBackgroundColorProvider.getColor(1);
            contrastedBackgroundColorProvider.getColor(2);
            expect(secondInitialize).toHaveBeenCalledWith(
              ColourRestriction.BlackAA
            );
          });
          it("should return from the next provider", () => {
            const contrastedBackgroundColorProvider =
              new ContrastedBackgroundColorProvider([
                {
                  initialize: jest.fn(),
                  getColor() {
                    this.exhausted = true;
                    return "red";
                  },
                  exhausted: false,
                  changeColourRestriction() {
                    //
                  },
                },
                {
                  initialize: jest.fn(),
                  getColor: () => "blue",
                  exhausted: false,
                  changeColourRestriction() {
                    //
                  },
                },
              ]);
            contrastedBackgroundColorProvider.getColor(1);
            const color = contrastedBackgroundColorProvider.getColor(2);
            expect(color).toBe("blue");
          });
        });
        describe("exhausted", () => {
          it("should return the fallback color", () => {
            const contrastedBackgroundColorProvider =
              new ContrastedBackgroundColorProvider(
                [
                  {
                    initialize: jest.fn(),
                    getColor() {
                      this.exhausted = true;
                      return "red";
                    },
                    exhausted: false,
                    changeColourRestriction() {
                      //
                    },
                  },
                ],
                "fallback"
              );
            contrastedBackgroundColorProvider.getColor(1);
            const fallbackColor = contrastedBackgroundColorProvider.getColor(2);
            expect(fallbackColor).toBe("fallback");
          });
        });
      });
    });
    describe("after removal colors should be reused in order", () => {
      class ColorProviderFromList implements ColorProvider {
        private count = -1;
        exhausted = false;
        constructor(private colors: string[]) {}
        initialize(): void {
          //
        }
        getColor(): string {
          const color = this.colors[++this.count];
          this.exhausted = this.count === this.colors.length - 1;
          return color;
        }
        changeColourRestriction() {
          //
        }
      }
      let contrastedBackgroundColorProvider: ContrastedBackgroundColorProvider;
      beforeEach(() => {
        contrastedBackgroundColorProvider =
          new ContrastedBackgroundColorProvider(
            [
              new ColorProviderFromList(["red", "blue"]),
              new ColorProviderFromList(["green", "yellow"]),
            ],
            "fallback"
          );
        contrastedBackgroundColorProvider.getColor(1);
        contrastedBackgroundColorProvider.getColor(2);
        contrastedBackgroundColorProvider.getColor(3);
        contrastedBackgroundColorProvider.getColor(4);
      });
      it("should return in order of provided for same provider", () => {
        contrastedBackgroundColorProvider.remove(2);
        contrastedBackgroundColorProvider.remove(1);
        const reusedColor = contrastedBackgroundColorProvider.getColor(5);
        expect(reusedColor).toBe("red");
      });

      it("should return in provider order", () => {
        contrastedBackgroundColorProvider.remove(4);
        contrastedBackgroundColorProvider.remove(2);
        const reusedColor = contrastedBackgroundColorProvider.getColor(5);
        expect(reusedColor).toBe("blue");
      });

      it("should not reuse when has been reused", () => {
        contrastedBackgroundColorProvider.remove(1);
        contrastedBackgroundColorProvider.getColor(5);
        const expectedFallback = contrastedBackgroundColorProvider.getColor(6);
        expect(expectedFallback).toBe("fallback");
      });
    });
  });
  describe("onColorsChanged raised", () => {
    // todo - colorIndex / clearing of used colors when remove
    describe("colours previously provided by the provider", () => {
      describe("colour provider has at least the same name number of colours", () => {
        it("should replace with new colours", () => {
          let colours = ["red", "blue"];
          let colorIndex = -1;

          let coloursChangedListener: () => void | undefined;
          const changeColours = () => {
            colours = ["yellow", "orange"];
            colorIndex = -1;
            coloursChangedListener();
          };
          const colorProvider: ColorProvider = {
            initialize: jest.fn(),
            getColor() {
              return colours[++colorIndex];
            },
            exhausted: false,
            onColorsChanged(ccListener) {
              coloursChangedListener = ccListener;
            },
            changeColourRestriction() {
              //
            },
          };
          const contrastedBackgroundColorProvider =
            new ContrastedBackgroundColorProvider([colorProvider]);
          contrastedBackgroundColorProvider.getColor(1);
          contrastedBackgroundColorProvider.getColor(2);
          changeColours();
          expect(contrastedBackgroundColorProvider.getColor(1)).toBe("yellow");
          expect(contrastedBackgroundColorProvider.getColor(2)).toBe("orange");
        });
      });
      describe("the color provider has less colours", () => {
        it("should ask the next provider in the chain to provide if not exhausted", () => {
          let colours = ["red", "blue"];
          let colorIndex = -1;

          let coloursChangedListener: () => void | undefined;
          const changeColours = () => {
            colours = ["yellow"];
            colorIndex = -1;
            coloursChangedListener();
          };
          const colorProvider: ColorProvider = {
            initialize: jest.fn(),
            getColor() {
              const colour = colours[++colorIndex];
              this.exhausted = colour === "yellow";
              return colour;
            },
            exhausted: false,
            onColorsChanged(ccListener) {
              coloursChangedListener = ccListener;
            },
            changeColourRestriction() {
              //
            },
          };
          const contrastedBackgroundColorProvider =
            new ContrastedBackgroundColorProvider([
              colorProvider,
              {
                exhausted: false,
                initialize() {
                  //
                },
                getColor() {
                  return "pink";
                },
                changeColourRestriction() {
                  //
                },
              },
            ]);
          contrastedBackgroundColorProvider.getColor(1);
          contrastedBackgroundColorProvider.getColor(2);
          changeColours();
          expect(contrastedBackgroundColorProvider.getColor(2)).toBe("pink");
        });
        it("should fallback if exhausted", () => {
          let colours = ["red", "blue"];
          let colorIndex = -1;

          let coloursChangedListener: () => void | undefined;
          const changeColours = () => {
            colours = ["yellow"];
            colorIndex = -1;
            coloursChangedListener();
          };
          const colorProvider: ColorProvider = {
            initialize: jest.fn(),
            getColor() {
              const colour = colours[++colorIndex];
              this.exhausted = colour === "yellow";
              return colour;
            },
            exhausted: false,
            onColorsChanged(ccListener) {
              coloursChangedListener = ccListener;
            },
            changeColourRestriction() {
              //
            },
          };
          const contrastedBackgroundColorProvider =
            new ContrastedBackgroundColorProvider(
              [
                colorProvider,
                {
                  exhausted: true,
                  initialize() {
                    //
                  },
                  getColor() {
                    return "pink";
                  },
                  changeColourRestriction() {
                    //
                  },
                },
              ],
              "fallback"
            );
          contrastedBackgroundColorProvider.getColor(1);
          contrastedBackgroundColorProvider.getColor(2);
          changeColours();
          expect(contrastedBackgroundColorProvider.getColor(2)).toBe(
            "fallback"
          );
        });
      });
      describe("the color provider is exhausted", () => {
        it("should not ask the color provider to update", () => {
          let coloursChangedListener: () => void | undefined;
          const changeColours = () => {
            colorProvider.exhausted = true;
            coloursChangedListener();
          };
          const getColor = jest.fn().mockImplementation(() => {
            colorProvider.exhausted = true;
            return "red";
          });
          const colorProvider: ColorProvider = {
            initialize: jest.fn(),
            getColor,
            exhausted: false,
            onColorsChanged(ccListener) {
              coloursChangedListener = ccListener;
            },
            changeColourRestriction() {
              //
            },
          };
          const contrastedBackgroundColorProvider =
            new ContrastedBackgroundColorProvider([colorProvider]);
          contrastedBackgroundColorProvider.getColor(1);
          changeColours();
          expect(getColor).toHaveBeenCalledTimes(1);
        });
      });
    });
    describe("fallback colours should attempt to be replaced", () => {
      it("the first non exhausted provider should change the color", () => {
        let colours = ["red"];

        let coloursChangedListener: () => void | undefined;
        const changeColours = () => {
          colours = ["yellow", "orange"];
          colorProvider.exhausted = false;
          coloursChangedListener();
        };
        const colorProvider: ColorProvider = {
          initialize: jest.fn(),
          getColor() {
            const colour = colours.shift();
            this.exhausted = colours.length === 0;
            return colour as string;
          },
          exhausted: false,
          onColorsChanged(ccListener) {
            coloursChangedListener = ccListener;
          },
          changeColourRestriction() {
            //
          },
        };
        const contrastedBackgroundColorProvider =
          new ContrastedBackgroundColorProvider([colorProvider], "fallback");
        contrastedBackgroundColorProvider.getColor(1);
        expect(contrastedBackgroundColorProvider.getColor(2)).toBe("fallback");
        changeColours();
        expect(contrastedBackgroundColorProvider.getColor(2)).toBe("orange");
      });
      it("should remain unchanged if a fallback is still required", () => {
        let colours = ["red"];

        let coloursChangedListener: () => void | undefined;
        const changeColours = () => {
          colours = ["yellow"];
          colorProvider.exhausted = false;
          coloursChangedListener();
        };
        const colorProvider: ColorProvider = {
          initialize: jest.fn(),
          getColor() {
            const colour = colours.shift();
            this.exhausted = colours.length === 0;
            return colour as string;
          },
          exhausted: false,
          onColorsChanged(ccListener) {
            coloursChangedListener = ccListener;
          },
          changeColourRestriction() {
            //
          },
        };
        const contrastedBackgroundColorProvider =
          new ContrastedBackgroundColorProvider([colorProvider], "fallback");
        contrastedBackgroundColorProvider.getColor(1);
        expect(contrastedBackgroundColorProvider.getColor(2)).toBe("fallback");
        changeColours();
        expect(contrastedBackgroundColorProvider.getColor(2)).toBe("fallback");
      });
    });
  });
});
