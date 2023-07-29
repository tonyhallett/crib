import { MyMatch } from "../generatedTypes";
import { fill } from "../utilities/arrayHelpers";

export interface Size {
  width: number;
  height: number;
}

/*
    todo - ideas
    Other players cards to be mostly off screen
    Consistent positions regardless of number of players
    -
    Could also have different card sizes
*/

export interface MatchPositionsOptions {
  peggingOverlayPercentage: number;
  cardHeightWidthRatio: number;
  paddingCardPercentage: number;
  deckAndBoxInMiddle: boolean;
}

export interface MatchLayoutManager {
  getPositionsAndCardSize(
    width: number,
    height: number,
    match: MyMatch,
    options: MatchPositionsOptions
  ): [Positions, Size];
}

export interface Point {
  x: number;
  y: number;
}

export interface DiscardPositions {
  positions: Point[];
  isHorizontal: boolean;
}

export interface DeckPosition {
  isHorizontal: boolean;
  position: Point;
}

export interface Box {
  isHorizontal: boolean;
  position: Point;
}

export interface PlayerPositions {
  deck: DeckPosition;
  box: Box;
  discard: DiscardPositions;
}

export interface ShowPositions {
  card1: Point;
  card2: Point;
  card3: Point;
  card4: Point;
}

export interface PeggingPositions {
  inPlay: Point[];
  turnedOver: Point;
}

export interface Positions {
  playerPositions: PlayerPositions[]; // 0 is me then clockwise
  peggingPositions: PeggingPositions;
  showPositions: ShowPositions;
}

interface SizeOptions {
  padding: number;
  cardWidth: number;
  cardHeight: number;
}

interface IPositionsCalculator<TSizeOptions, TPositionOptions, TPositions> {
  getSize(sizeOptions: TSizeOptions): Size;
  getPositions(positionOptions: TPositionOptions): TPositions;
}

interface PlayerPositionsOptions extends SizeOptions {
  bounds: PlayerBounds[];
}

function getDeckAndBoxWidth(
  sizeOptions: SizeOptions,
  hasDeckAndBox: boolean
): number {
  if (!hasDeckAndBox) {
    return 0;
  }
  const boxRotationShift = (sizeOptions.cardHeight - sizeOptions.cardWidth) / 2;
  const deckAndBoxWidth =
    2 * sizeOptions.padding +
    sizeOptions.cardWidth +
    sizeOptions.cardHeight +
    boxRotationShift;
  return deckAndBoxWidth;
}

class PlayerPositionsCalculator
  implements
    IPositionsCalculator<
      SizeOptions,
      PlayerPositionsOptions,
      PlayerPositions[]
    >
{
  constructor(private deckAndBoxInMiddle: boolean, private numCards: number) {}
  getPositions(positionOptions: PlayerPositionsOptions): PlayerPositions[] {
    return positionOptions.bounds.map((bound) => {
      return this.getBoundedPlayerPositions(bound, positionOptions);
    });
  }

  private getBoundedPlayerPositions(
    playerBounds: PlayerBounds,
    sizeOptions: SizeOptions
  ): PlayerPositions {
    const rotationShift = (sizeOptions.cardHeight - sizeOptions.cardWidth) / 2;
    const paddedCardsWidth = this.getPaddedCardsWidth(sizeOptions);
    const space = (playerBounds.bounds - paddedCardsWidth) / 2;
    if (playerBounds.isHorizontal) {
      return {
        deck: {
          isHorizontal: true,
          position: {
            x: rotationShift,
            y: -rotationShift,
          },
        },
        box: {
          isHorizontal: false,
          position: {
            x: rotationShift,
            y: sizeOptions.padding + sizeOptions.cardWidth,
          },
        },
        discard: {
          positions: fill(6, (i) => {
            return {
              x: rotationShift,
              y:
                space +
                (i + 1) * sizeOptions.padding +
                i * sizeOptions.cardWidth -
                rotationShift,
            };
          }),
          isHorizontal: true,
        },
      };
    }
    const paddedDeck = 2 * sizeOptions.padding + sizeOptions.cardWidth;

    return {
      deck: {
        isHorizontal: false,
        position: {
          x: sizeOptions.padding,
          y: 0,
        },
      },
      box: {
        isHorizontal: true,
        position: {
          x: paddedDeck + rotationShift,
          y: 0,
        },
      },
      discard: {
        positions: fill(6, (i) => {
          return {
            x:
              space + (i + 1) * sizeOptions.padding + i * sizeOptions.cardWidth,
            y: 0,
          };
        }),
        isHorizontal: false,
      },
    };
  }

  getSize(sizeOptions: SizeOptions): Size {
    return {
      height: sizeOptions.cardHeight,
      width: this.getSizeWidth(sizeOptions),
    };
  }

  private getSizeWidth(sizeOptions: SizeOptions): number {
    const deckAndBoxWidth = getDeckAndBoxWidth(
      sizeOptions,
      !this.deckAndBoxInMiddle
    );
    const paddedCardsWidth = this.getPaddedCardsWidth(sizeOptions);
    return this.applyCentering(deckAndBoxWidth, paddedCardsWidth);
  }

  private getPaddedCardsWidth(sizeOptions: SizeOptions): number {
    return (
      sizeOptions.cardWidth * this.numCards +
      sizeOptions.padding * (this.numCards + 1)
    );
  }

  private applyCentering(
    deckAndBoxWidth: number,
    paddedCardsWidth: number
  ): number {
    return 2 * deckAndBoxWidth + paddedCardsWidth;
  }
}

interface CalculatedPeggingPositions extends PeggingPositions {
  deck: DeckPosition;
  box: Box;
}

interface PeggingPositionsOptions extends PeggingSizeOptions {
  bounds: number;
}

interface PeggingSizeOptions extends SizeOptions {
  overlay: number;
}

class PeggingPositionsCalculator
  implements
    IPositionsCalculator<
      PeggingSizeOptions,
      PeggingPositionsOptions,
      CalculatedPeggingPositions
    >
{
  private maxNumberOfPeggingCards: number;
  constructor(private deckAndBoxInMiddle: boolean, numPlayers: NumPlayers) {
    this.maxNumberOfPeggingCards = this.getMaxPeggingCards(numPlayers);
  }

  private getMaxPeggingCards(numPlayers: NumPlayers) {
    switch (numPlayers) {
      case 2:
        return 8;
      case 3:
        return 12;
      case 4:
        return 13;
    }
  }
  //#region size

  getSize(sizeOptions: PeggingSizeOptions): Size {
    return {
      height: sizeOptions.cardHeight,
      width: this.getSizeWidth(sizeOptions),
    };
  }

  private getSizeWidth(sizeOptions: PeggingSizeOptions): number {
    const peggingWidth = this.getPaddedPeggingWidth(sizeOptions);
    const deckAndBoxWidth = getDeckAndBoxWidth(
      sizeOptions,
      this.deckAndBoxInMiddle
    );
    const getTurnedOverWidth = this.getTurnedOverWidth(sizeOptions);
    return this.applyCentering(
      peggingWidth,
      deckAndBoxWidth,
      getTurnedOverWidth
    );
  }

  private applyCentering(
    peggingWidth: number,
    deckAndBoxWidth: number,
    turnedOverWidth: number
  ): number {
    const sideWidth =
      deckAndBoxWidth > turnedOverWidth ? deckAndBoxWidth : turnedOverWidth;
    return 2 * sideWidth + peggingWidth;
  }

  private getPaddedPeggingWidth(sizeOptions: PeggingSizeOptions): number {
    return (
      2 * sizeOptions.padding +
      (this.maxNumberOfPeggingCards - 1) * sizeOptions.overlay +
      sizeOptions.cardWidth
    );
  }

  private getTurnedOverWidth(sizeOptions: SizeOptions): number {
    return sizeOptions.cardWidth + sizeOptions.padding;
  }
  //#endregion

  getPositions(
    positionOptions: PeggingPositionsOptions
  ): CalculatedPeggingPositions {
    const availableWidth = positionOptions.bounds;
    const peggingWidth = this.getPaddedPeggingWidth(positionOptions);
    const rotationShift =
      (positionOptions.cardHeight - positionOptions.cardWidth) / 2;
    const paddedDeck = 2 * positionOptions.padding + positionOptions.cardWidth;
    const left = (availableWidth - peggingWidth) / 2;
    return {
      deck: {
        isHorizontal: false,
        position: {
          x: positionOptions.padding,
          y: 0,
        },
      },
      box: {
        isHorizontal: true,
        position: {
          x: paddedDeck + rotationShift,
          y: 0,
        },
      },
      inPlay: fill(this.maxNumberOfPeggingCards, (i) => {
        return {
          x: left + i * positionOptions.overlay,
          y: 0,
        };
      }),
      turnedOver: {
        x: availableWidth - positionOptions.cardWidth - positionOptions.padding,
        y: 0,
      },
    };
  }
}

interface PlayerBounds {
  bounds: number;
  isHorizontal: boolean;
}

interface Positioner {
  getBounds(): [number, PlayerBounds[]];
  withinBounds(playerSize: Size, peggingSize: Size, padding: number): boolean;
  getPositions(
    peggingPositions: CalculatedPeggingPositions,
    playerPositions: PlayerPositions[]
  ): Positions;
}

abstract class PositionerBase implements Positioner {
  protected maxPlayerSize!: Size;
  protected maxPeggingSize!: Size;
  protected maxPadding!: number;

  constructor(
    protected width: number,
    protected height: number,
    protected deckAndBoxInMiddle: boolean
  ) {}

  abstract getBounds(): [number, PlayerBounds[]];

  withinBounds(playerSize: Size, peggingSize: Size, padding: number): boolean {
    const isWithinBounds = this.isWithinBounds(
      playerSize,
      peggingSize,
      padding
    );
    if (isWithinBounds) {
      this.maxPlayerSize = playerSize;
      this.maxPeggingSize = peggingSize;
      this.maxPadding = padding;
    }
    return isWithinBounds;
  }
  abstract isWithinBounds(
    playerSize: Size,
    peggingSize: Size,
    padding: number
  ): boolean;
  abstract getPositions(
    peggingPositions: CalculatedPeggingPositions,
    playerPositions: PlayerPositions[]
  ): Positions;
}

class TwoPlayerPositioner extends PositionerBase {
  constructor(width: number, height: number, deckAndBoxInMiddle: boolean) {
    super(width, height, deckAndBoxInMiddle);
  }

  getBounds(): [number, PlayerBounds[]] {
    const bounds = this.width;
    return [
      bounds,
      [
        {
          isHorizontal: false,
          bounds,
        },
      ],
    ];
  }

  isWithinBounds(
    playerSize: Size,
    peggingSize: Size,
    padding: number
  ): boolean {
    return (
      this.height > 2 * playerSize.height + peggingSize.height + 4 * padding &&
      this.width > playerSize.width &&
      this.width > peggingSize.width
    );
  }

  getPositions(
    peggingPositions: CalculatedPeggingPositions,
    playerPositions: PlayerPositions[]
  ): Positions {
    playerPositions = [playerPositions[0], playerPositions[0]];
    const centeredPeggingPositions =
      this.centerPeggingPositions(peggingPositions);
    return {
      playerPositions: playerPositions.map((playerPosition, i) => {
        playerPosition = this.shiftPlayerPositions(playerPosition, i !== 0);
        return {
          deck: this.deckAndBoxInMiddle
            ? (centeredPeggingPositions.deck as DeckPosition)
            : playerPosition.deck,
          box: this.deckAndBoxInMiddle
            ? (centeredPeggingPositions.box as Box)
            : playerPosition.box,
          discard: playerPosition.discard,
        };
      }),
      showPositions: null as unknown as ShowPositions,
      peggingPositions: centeredPeggingPositions,
    };
  }

  private centerPeggingPositions(
    peggingPositions: CalculatedPeggingPositions
  ): CalculatedPeggingPositions {
    const peggingY = (this.height - this.maxPeggingSize.height) / 2;
    return {
      deck: {
        isHorizontal: peggingPositions.deck.isHorizontal,
        position: {
          x: peggingPositions.deck.position.x,
          y: peggingY,
        },
      },
      box: {
        isHorizontal: peggingPositions.box.isHorizontal,
        position: {
          x: peggingPositions.box.position.x,
          y: peggingY,
        },
      },
      inPlay: peggingPositions.inPlay.map((position) => {
        return {
          x: position.x,
          y: peggingY,
        };
      }),
      turnedOver: {
        x: peggingPositions.turnedOver.x,
        y: peggingY,
      },
    };
  }

  private shiftPlayerPositions(
    playerPositions: PlayerPositions,
    topPlayer: boolean
  ): PlayerPositions {
    const yshift = topPlayer
      ? this.maxPadding
      : this.height - this.maxPadding - this.maxPlayerSize.height;
    return {
      deck: {
        isHorizontal: playerPositions.deck.isHorizontal,
        position: {
          x: playerPositions.deck.position.x,
          y: playerPositions.deck.position.y + yshift,
        },
      },
      box: {
        isHorizontal: playerPositions.box.isHorizontal,
        position: {
          x: playerPositions.box.position.x,
          y: playerPositions.box.position.y + yshift,
        },
      },
      discard: {
        isHorizontal: playerPositions.discard.isHorizontal,
        positions: playerPositions.discard.positions.map((position) => {
          return {
            x: position.x,
            y: position.y + yshift,
          };
        }),
      },
    };
  }
}

class ThreePlayerPositioner extends PositionerBase {
  private maximizeLeft: boolean;
  constructor(width: number, height: number, deckAndBoxInMiddle: boolean) {
    super(width, height, deckAndBoxInMiddle);
    this.maximizeLeft = width > height;
  }

  getBounds(): [number, PlayerBounds[]] {
    const peggingBounds =
      this.width - this.maxPlayerSize.height - 2 * this.maxPadding;
    if (this.maximizeLeft) {
      return [
        peggingBounds,
        [
          //left
          { isHorizontal: true, bounds: this.height - 2 * this.maxPadding },
          // top and bottom
          {
            isHorizontal: false,
            bounds:
              this.width - 2 * this.maxPadding - this.maxPlayerSize.height,
          },
        ],
      ];
    }
    return [
      peggingBounds,
      [
        //left
        {
          isHorizontal: true,
          bounds: this.height - 4 * this.maxPadding - this.maxPlayerSize.height,
        },
        // top and bottom
        { isHorizontal: false, bounds: this.width - 2 * this.maxPadding },
      ],
    ];
  }

  private maximizeLeftWithinBounds(
    playerSize: Size,
    peggingSize: Size,
    padding: number
  ): boolean {
    const rightSpace = this.width - playerSize.height - padding * 2;
    const widthOk =
      rightSpace > playerSize.width && rightSpace > peggingSize.width;

    const heightOk =
      this.height > playerSize.width + 2 * padding &&
      this.height > 2 * playerSize.height + peggingSize.height + 4 * padding;

    return widthOk && heightOk;
  }

  private maximizeTopBottomWithinBounds(
    playerSize: Size,
    peggingSize: Size,
    padding: number
  ): boolean {
    const widthOk =
      this.width > playerSize.height + padding * 2 + peggingSize.width &&
      this.width > playerSize.width + padding;

    const heightSpace = this.height - 2 * playerSize.height - 4 * padding;
    const heightOk =
      heightSpace > peggingSize.height && heightSpace > playerSize.width;
    return widthOk && heightOk;
  }

  isWithinBounds(
    playerSize: Size,
    peggingSize: Size,
    padding: number
  ): boolean {
    if (this.maximizeLeft) {
      return this.maximizeLeftWithinBounds(playerSize, peggingSize, padding);
    }
    return this.maximizeTopBottomWithinBounds(playerSize, peggingSize, padding);
  }

  getPositions(
    peggingPositions: CalculatedPeggingPositions,
    playerPositions: PlayerPositions[]
  ): Positions {
    const leftPlayerPositions = playerPositions[0];
    const topBottomPlayerPositions = playerPositions[1];
    const shiftedPlayerPositions: PlayerPositions[] = [
      this.shiftTopBottomPlayerPositions(topBottomPlayerPositions, false),
      this.positionLeftPlayerPositions(leftPlayerPositions),
      this.shiftTopBottomPlayerPositions(topBottomPlayerPositions, true),
    ];
    const positionedPeggingPositions =
      this.positionPeggingPositions(peggingPositions);
    return {
      playerPositions: shiftedPlayerPositions.map((playerPosition) => {
        return {
          deck: this.deckAndBoxInMiddle
            ? (positionedPeggingPositions.deck as DeckPosition)
            : playerPosition.deck,
          box: this.deckAndBoxInMiddle
            ? (positionedPeggingPositions.box as Box)
            : playerPosition.box,
          discard: playerPosition.discard,
        };
      }),
      showPositions: null as unknown as ShowPositions,
      peggingPositions: positionedPeggingPositions,
    };
  }

  private positionLeftPlayerPositions(
    leftPlayerPositions: PlayerPositions
  ): PlayerPositions {
    const verticalShift = this.maximizeLeft
      ? this.maxPadding
      : this.maxPlayerSize.height + 2 * this.maxPadding;
    return {
      deck: {
        isHorizontal: leftPlayerPositions.deck.isHorizontal,
        position: {
          x: leftPlayerPositions.deck.position.x + this.maxPadding,
          y: leftPlayerPositions.deck.position.y + verticalShift,
        },
      },
      box: {
        isHorizontal: leftPlayerPositions.box.isHorizontal,
        position: {
          x: leftPlayerPositions.box.position.x + this.maxPadding,
          y: leftPlayerPositions.box.position.y + verticalShift,
        },
      },
      discard: {
        isHorizontal: leftPlayerPositions.discard.isHorizontal,
        positions: leftPlayerPositions.discard.positions.map((position) => {
          return {
            x: position.x + this.maxPadding,
            y: position.y + verticalShift,
          };
        }),
      },
    };
  }

  private shiftTopBottomPlayerPositions(
    playerPositions: PlayerPositions,
    topPlayer: boolean
  ): PlayerPositions {
    const yShift = topPlayer
      ? this.maxPadding
      : this.height - this.maxPadding - this.maxPlayerSize.height;
    const xShift = this.maxPadding * 2 + this.maxPlayerSize.height;
    return {
      deck: {
        isHorizontal: playerPositions.deck.isHorizontal,
        position: {
          x: playerPositions.deck.position.x + xShift,
          y: playerPositions.deck.position.y + yShift,
        },
      },
      box: {
        isHorizontal: playerPositions.box.isHorizontal,
        position: {
          x: playerPositions.box.position.x + xShift,
          y: playerPositions.box.position.y + yShift,
        },
      },
      discard: {
        isHorizontal: playerPositions.discard.isHorizontal,
        positions: playerPositions.discard.positions.map((position) => {
          return {
            x: position.x + xShift,
            y: position.y + yShift,
          };
        }),
      },
    };
  }

  private positionPeggingPositions(
    peggingPositions: CalculatedPeggingPositions
  ): CalculatedPeggingPositions {
    const peggingY = (this.height - this.maxPeggingSize.height) / 2;
    const peggingXStart = this.maxPadding + this.maxPlayerSize.height;
    return {
      deck: {
        isHorizontal: peggingPositions.deck.isHorizontal,
        position: {
          x: peggingXStart + peggingPositions.deck.position.x,
          y: peggingY,
        },
      },
      box: {
        isHorizontal: peggingPositions.box.isHorizontal,
        position: {
          x: peggingXStart + peggingPositions.box.position.x,
          y: peggingY,
        },
      },
      inPlay: peggingPositions.inPlay.map((position) => {
        return {
          x: peggingXStart + position.x,
          y: peggingY,
        };
      }),
      turnedOver: {
        x: peggingXStart + peggingPositions.turnedOver.x,
        y: peggingY,
      },
    };
  }
}

class FourPlayerPositioner extends PositionerBase {
  private maximizeLeft: boolean;
  constructor(width: number, height: number, deckAndBoxInMiddle: boolean) {
    super(width, height, deckAndBoxInMiddle);
    this.maximizeLeft = width > height;
  }

  getBounds(): [number, PlayerBounds[]] {
    const peggingBounds =
      this.width - 2 * this.maxPlayerSize.height - 2 * this.maxPadding;
    if (this.maximizeLeft) {
      return [
        peggingBounds,
        [
          //left and right
          { isHorizontal: true, bounds: this.height - 2 * this.maxPadding },
          // top and bottom
          {
            isHorizontal: false,
            bounds:
              this.width - 2 * this.maxPadding - 2 * this.maxPlayerSize.height,
          },
        ],
      ];
    }
    return [
      peggingBounds,
      [
        //left
        {
          isHorizontal: true,
          bounds:
            this.height - 4 * this.maxPadding - 2 * this.maxPlayerSize.height,
        },
        // top and bottom
        { isHorizontal: false, bounds: this.width - 2 * this.maxPadding },
      ],
    ];
  }

  // commonality with 3 player
  private maximizeLeftRightWithinBounds(
    playerSize: Size,
    peggingSize: Size,
    padding: number
  ): boolean {
    const space = this.width - 2 * playerSize.height - padding * 2;
    const widthOk = space > playerSize.width && space > peggingSize.width;

    const heightOk =
      this.height > playerSize.width + 2 * padding &&
      this.height > 2 * playerSize.height + peggingSize.height + 4 * padding;

    return widthOk && heightOk;
  }

  private maximizeTopBottomWithinBounds(
    playerSize: Size,
    peggingSize: Size,
    padding: number
  ): boolean {
    const widthOk =
      this.width > playerSize.height + padding * 2 + peggingSize.width &&
      this.width > playerSize.width + padding;

    const heightSpace = this.height - 2 * playerSize.height - 4 * padding;
    const heightOk =
      heightSpace > peggingSize.height && heightSpace > playerSize.width;
    return widthOk && heightOk;
  }

  isWithinBounds(
    playerSize: Size,
    peggingSize: Size,
    padding: number
  ): boolean {
    if (this.maximizeLeft) {
      return this.maximizeLeftRightWithinBounds(
        playerSize,
        peggingSize,
        padding
      );
    }
    return this.maximizeTopBottomWithinBounds(playerSize, peggingSize, padding);
  }

  getPositions(
    peggingPositions: CalculatedPeggingPositions,
    playerPositions: PlayerPositions[]
  ): Positions {
    const leftRightPlayerPositions = playerPositions[0];
    const topBottomPlayerPositions = playerPositions[1];
    const shiftedPlayerPositions: PlayerPositions[] = [
      this.shiftTopBottomPlayerPositions(topBottomPlayerPositions, false),
      this.positionLeftRightPlayerPositions(leftRightPlayerPositions, true),
      this.shiftTopBottomPlayerPositions(topBottomPlayerPositions, true),
      this.positionLeftRightPlayerPositions(leftRightPlayerPositions, false),
    ];
    const positionedPeggingPositions =
      this.positionPeggingPositions(peggingPositions);
    return {
      playerPositions: shiftedPlayerPositions.map((playerPosition) => {
        return {
          deck: this.deckAndBoxInMiddle
            ? (positionedPeggingPositions.deck as DeckPosition)
            : playerPosition.deck,
          box: this.deckAndBoxInMiddle
            ? (positionedPeggingPositions.box as Box)
            : playerPosition.box,
          discard: playerPosition.discard,
        };
      }),
      showPositions: null as unknown as ShowPositions,
      peggingPositions: positionedPeggingPositions,
    };
  }

  private positionLeftRightPlayerPositions(
    leftPlayerPositions: PlayerPositions,
    isLeft: boolean
  ): PlayerPositions {
    const verticalShift = this.maximizeLeft
      ? this.maxPadding
      : this.maxPlayerSize.height + 2 * this.maxPadding;
    const horizontalShift = isLeft
      ? this.maxPadding
      : this.width - this.maxPlayerSize.height - this.maxPadding;
    return {
      deck: {
        isHorizontal: leftPlayerPositions.deck.isHorizontal,
        position: {
          x: leftPlayerPositions.deck.position.x + horizontalShift,
          y: leftPlayerPositions.deck.position.y + verticalShift,
        },
      },
      box: {
        isHorizontal: leftPlayerPositions.box.isHorizontal,
        position: {
          x: leftPlayerPositions.box.position.x + horizontalShift,
          y: leftPlayerPositions.box.position.y + verticalShift,
        },
      },
      discard: {
        isHorizontal: leftPlayerPositions.discard.isHorizontal,
        positions: leftPlayerPositions.discard.positions.map((position) => {
          return {
            x: position.x + horizontalShift,
            y: position.y + verticalShift,
          };
        }),
      },
    };
  }

  private shiftTopBottomPlayerPositions(
    playerPositions: PlayerPositions,
    topPlayer: boolean
  ): PlayerPositions {
    const yShift = topPlayer
      ? this.maxPadding
      : this.height - this.maxPadding - this.maxPlayerSize.height;
    const xShift = this.maxPadding * 2 + this.maxPlayerSize.height;
    return {
      deck: {
        isHorizontal: playerPositions.deck.isHorizontal,
        position: {
          x: playerPositions.deck.position.x + xShift,
          y: playerPositions.deck.position.y + yShift,
        },
      },
      box: {
        isHorizontal: playerPositions.box.isHorizontal,
        position: {
          x: playerPositions.box.position.x + xShift,
          y: playerPositions.box.position.y + yShift,
        },
      },
      discard: {
        isHorizontal: playerPositions.discard.isHorizontal,
        positions: playerPositions.discard.positions.map((position) => {
          return {
            x: position.x + xShift,
            y: position.y + yShift,
          };
        }),
      },
    };
  }

  private positionPeggingPositions(
    peggingPositions: CalculatedPeggingPositions
  ): CalculatedPeggingPositions {
    const peggingY = (this.height - this.maxPeggingSize.height) / 2;
    const peggingXStart = this.maxPadding + this.maxPlayerSize.height;
    return {
      deck: {
        isHorizontal: peggingPositions.deck.isHorizontal,
        position: {
          x: peggingXStart + peggingPositions.deck.position.x,
          y: peggingY,
        },
      },
      box: {
        isHorizontal: peggingPositions.box.isHorizontal,
        position: {
          x: peggingXStart + peggingPositions.box.position.x,
          y: peggingY,
        },
      },
      inPlay: peggingPositions.inPlay.map((position) => {
        return {
          x: peggingXStart + position.x,
          y: peggingY,
        };
      }),
      turnedOver: {
        x: peggingXStart + peggingPositions.turnedOver.x,
        y: peggingY,
      },
    };
  }
}

function getPositioner(
  numPlayers: number,
  width: number,
  height: number,
  deckAndBoxInMiddle: boolean
): Positioner {
  // width and height will determine final bounds if 3 or 4 players
  switch (numPlayers) {
    case 2:
      return new TwoPlayerPositioner(width, height, deckAndBoxInMiddle);
    case 3:
      return new ThreePlayerPositioner(width, height, deckAndBoxInMiddle);
    case 4:
      return new FourPlayerPositioner(width, height, deckAndBoxInMiddle);
    default:
      throw new Error("Invalid number of players");
  }
}

function getSizes(
  cardSize: number,
  options: MatchPositionsOptions
): PeggingSizeOptions {
  return {
    padding: cardSize * options.paddingCardPercentage,
    cardWidth: cardSize,
    cardHeight: cardSize * options.cardHeightWidthRatio,
    overlay: cardSize * options.peggingOverlayPercentage,
  };
}
export type NumPlayers = 2 | 3 | 4;
export function positioning(
  width: number,
  height: number,
  options: MatchPositionsOptions,
  numPlayers: NumPlayers
): [Positions, Size] {
  let withinBounds = true;
  let cardSize = 1;
  const numPlayerCards = numPlayers === 2 ? 6 : 5;
  const playerPositionsCalculator = new PlayerPositionsCalculator(
    options.deckAndBoxInMiddle,
    numPlayerCards
  );
  const peggingPositionsCalculator = new PeggingPositionsCalculator(
    options.deckAndBoxInMiddle,
    numPlayers
  );
  const positioner = getPositioner(
    numPlayers,
    width,
    height,
    options.deckAndBoxInMiddle
  );

  while (withinBounds) {
    const sizeOptions = getSizes(cardSize, options);
    const playerSize = playerPositionsCalculator.getSize(sizeOptions);
    const peggingSize = peggingPositionsCalculator.getSize(sizeOptions);
    withinBounds = positioner.withinBounds(
      playerSize,
      peggingSize,
      sizeOptions.padding
    );
    cardSize++;
  }
  const sizeOptions = getSizes(cardSize - 1, options);

  const [peggingBounds, playerBounds] = positioner.getBounds();
  const peggingPositions = peggingPositionsCalculator.getPositions({
    ...sizeOptions,
    bounds: peggingBounds,
  });
  const playerPositions = playerPositionsCalculator.getPositions({
    ...sizeOptions,
    bounds: playerBounds,
  });
  return [
    positioner.getPositions(peggingPositions, playerPositions),
    { width: sizeOptions.cardWidth, height: sizeOptions.cardHeight },
  ];
}

export const matchLayoutManager: MatchLayoutManager = {
  getPositionsAndCardSize(
    screenWidth: number,
    screenHeight: number,
    match: MyMatch,
    options: MatchPositionsOptions
  ): [Positions, Size] {
    return positioning(
      screenWidth,
      screenHeight,
      options,
      (match.otherPlayers.length + 1) as NumPlayers
    );
  },
};
