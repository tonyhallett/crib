export interface CardDisplay {
  faceDown: boolean;
  playingCard?: PlayingCard;
}

import AceHearts from "./cards/HEART-1.svg";
import TwoHearts from "./cards/HEART-2.svg";
import ThreeHearts from "./cards/HEART-3.svg";
import FourHearts from "./cards/HEART-4.svg";
import FiveHearts from "./cards/HEART-5.svg";
import SixHearts from "./cards/HEART-6.svg";
import SevenHearts from "./cards/HEART-7.svg";
import EightHearts from "./cards/HEART-8.svg";
import NineHearts from "./cards/HEART-9.svg";
import TenHearts from "./cards/HEART-10.svg";
import JackHearts from "./cards/HEART-11-JACK.svg";
import QueenHearts from "./cards/HEART-12-QUEEN.svg";
import KingHearts from "./cards/HEART-13-KING.svg";
const hearts = [
  AceHearts,
  TwoHearts,
  ThreeHearts,
  FourHearts,
  FiveHearts,
  SixHearts,
  SevenHearts,
  EightHearts,
  NineHearts,
  TenHearts,
  JackHearts,
  QueenHearts,
  KingHearts,
];

import AceDiamonds from "./cards/DIAMOND-1.svg";
import TwoDiamonds from "./cards/DIAMOND-2.svg";
import ThreeDiamonds from "./cards/DIAMOND-3.svg";
import FourDiamonds from "./cards/DIAMOND-4.svg";
import FiveDiamonds from "./cards/DIAMOND-5.svg";
import SixDiamonds from "./cards/DIAMOND-6.svg";
import SevenDiamonds from "./cards/DIAMOND-7.svg";
import EightDiamonds from "./cards/DIAMOND-8.svg";
import NineDiamonds from "./cards/DIAMOND-9.svg";
import TenDiamonds from "./cards/DIAMOND-10.svg";
import JackDiamonds from "./cards/DIAMOND-11-JACK.svg";
import QueenDiamonds from "./cards/DIAMOND-12-QUEEN.svg";
import KingDiamonds from "./cards/DIAMOND-13-KING.svg";
const diamonds = [
  AceDiamonds,
  TwoDiamonds,
  ThreeDiamonds,
  FourDiamonds,
  FiveDiamonds,
  SixDiamonds,
  SevenDiamonds,
  EightDiamonds,
  NineDiamonds,
  TenDiamonds,
  JackDiamonds,
  QueenDiamonds,
  KingDiamonds,
];

import AceSpades from "./cards/SPADE-1.svg";
import TwoSpades from "./cards/SPADE-2.svg";
import ThreeSpades from "./cards/SPADE-3.svg";
import FourSpades from "./cards/SPADE-4.svg";
import FiveSpades from "./cards/SPADE-5.svg";
import SixSpades from "./cards/SPADE-6.svg";
import SevenSpades from "./cards/SPADE-7.svg";
import EightSpades from "./cards/SPADE-8.svg";
import NineSpades from "./cards/SPADE-9.svg";
import TenSpades from "./cards/SPADE-10.svg";
import JackSpades from "./cards/SPADE-11-JACK.svg";
import QueenSpades from "./cards/SPADE-12-QUEEN.svg";
import KingSpades from "./cards/SPADE-13-KING.svg";
const spades = [
  AceSpades,
  TwoSpades,
  ThreeSpades,
  FourSpades,
  FiveSpades,
  SixSpades,
  SevenSpades,
  EightSpades,
  NineSpades,
  TenSpades,
  JackSpades,
  QueenSpades,
  KingSpades,
];

import AceClubs from "./cards/CLUB-1.svg";
import TwoClubs from "./cards/CLUB-2.svg";
import ThreeClubs from "./cards/CLUB-3.svg";
import FourClubs from "./cards/CLUB-4.svg";
import FiveClubs from "./cards/CLUB-5.svg";
import SixClubs from "./cards/CLUB-6.svg";
import SevenClubs from "./cards/CLUB-7.svg";
import EightClubs from "./cards/CLUB-8.svg";
import NineClubs from "./cards/CLUB-9.svg";
import TenClubs from "./cards/CLUB-10.svg";
import JackClubs from "./cards/CLUB-11-JACK.svg";
import QueenClubs from "./cards/CLUB-12-QUEEN.svg";
import KingClubs from "./cards/CLUB-13-KING.svg";
const clubs = [
  AceClubs,
  TwoClubs,
  ThreeClubs,
  FourClubs,
  FiveClubs,
  SixClubs,
  SevenClubs,
  EightClubs,
  NineClubs,
  TenClubs,
  JackClubs,
  QueenClubs,
  KingClubs,
];

import Blank from "./cards/BLANK.svg";

import { Pips, PlayingCard, Suit } from "../generatedTypes";

function getPlayingCardSVG(
  playingCard: PlayingCard
): React.FunctionComponent<React.SVGProps<SVGSVGElement>> {
  let suitSVGs: React.FunctionComponent<React.SVGProps<SVGSVGElement>>[];
  switch (playingCard.suit) {
    case Suit.Spades:
      suitSVGs = spades;
      break;
    case Suit.Clubs:
      suitSVGs = clubs;
      break;
    case Suit.Diamonds:
      suitSVGs = diamonds;
      break;
    case Suit.Hearts:
      suitSVGs = hearts;
      break;
  }

  const index = Object.keys(Pips).indexOf(playingCard.pips);
  return suitSVGs[index];
}

export function getSVG(cardDisplay: CardDisplay) {
  let Svg: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  if (cardDisplay.faceDown || cardDisplay.playingCard === undefined) {
    Svg = Blank;
  } else {
    Svg = getPlayingCardSVG(cardDisplay.playingCard);
  }
  return Svg;
}
