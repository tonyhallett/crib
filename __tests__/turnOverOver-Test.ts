import { getTurnOverOrder } from "../src/PlayMatch/signalRPeg";
import { PlayingCard } from "../src/generatedTypes";
import {
  AceHearts,
  AceSpades,
  JackHearts,
  JackSpades,
  NineHearts,
  QueenHearts,
  QueenSpades,
  TenHearts,
  TenSpades,
  TwoHearts,
} from "../test-helpers/cards";

describe("turnOver", () => {
  it("should work when only turns over when 31", () => {
    const turnedOverCards: PlayingCard[] = [
      AceSpades,
      TenSpades,
      JackSpades,
      QueenSpades,
    ];
    const ordered = getTurnOverOrder(turnedOverCards);
    expect(ordered).toEqual([QueenSpades, JackSpades, TenSpades, AceSpades]);
  });

  it("should work with multiple 31 turn overs", () => {
    const turnedOverCards: PlayingCard[] = [
      AceSpades,
      TenSpades,
      JackSpades,
      QueenSpades,

      AceHearts,
      TenHearts,
      JackHearts,
      QueenHearts,
    ];
    const ordered = getTurnOverOrder(turnedOverCards);
    expect(ordered).toEqual([
      QueenSpades,
      JackSpades,
      TenSpades,
      AceSpades,

      QueenHearts,
      JackHearts,
      TenHearts,
      AceHearts,
    ]);
  });

  it("should work with Go then 31 turn overs", () => {
    const turnedOverCards: PlayingCard[] = [
      TenSpades,
      JackSpades,
      QueenSpades,

      TwoHearts,
      NineHearts,
      TenHearts,
      JackHearts,
    ];
    const ordered = getTurnOverOrder(turnedOverCards);
    expect(ordered).toEqual([
      QueenSpades,
      JackSpades,
      TenSpades,

      JackHearts,
      TenHearts,
      NineHearts,
      TwoHearts,
    ]);
  });
  it("should work with just Go", () => {
    const turnedOverCards: PlayingCard[] = [
      TenSpades,
      JackSpades,
      QueenSpades,
      // go is in InPlayCards
    ];
    const ordered = getTurnOverOrder(turnedOverCards);
    expect(ordered).toEqual([QueenSpades, JackSpades, TenSpades]);
  });
});
