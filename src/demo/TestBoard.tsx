/* eslint-disable */
import { Card } from "./Scorer";
import AceSpades from "./cards/SPADE-2.svg";
import { motion, useMotionValue, useTransform } from "framer-motion";

export function TestBoard() {
  /* return <div style={{
        position:"absolute",
        top:0,
        left:0,
        width:window.innerWidth,
        height:window.innerHeight,
        backgroundColor:"red"
    }}></div> */

  return <AceSpades style={{ width: 100, height: 139.7 }} />;
}

interface CardSize {
  width: number;
  height: number;
}

enum CardPlayer {
  me,
  opp,
  opp2,
  teamMate,
}

type ShowHideCard = Card & {
  showing: boolean;
};

type PeggingCard = Card & {
  showing: true;
  player: CardPlayer;
};

interface Area {
  width: number;
  height: number;
}

class PlayerArea {
  // needs to account for pegging dicarded
  public constructor(
    private numDealtCards: number,
    private isSide: boolean,
    private cardRatio: number
  ) {}

  public getArea(cardHeight: number): Area {
    let area = this.getAreaIfNotSide(cardHeight);
    if (this.isSide) {
      area = { width: area.height, height: area.width };
    }
    return area;
  }

  private getAreaIfNotSide(cardHeight: number): Area {
    throw new Error("Not implemented");
  }
}

class PegDeckBoxArea {
  private maxCardsInPile: number;
  public constructor(numPlayers: number, cardRatio: number) {
    switch (numPlayers) {
      case 2:
        this.maxCardsInPile = 8;
        break;
      case 3:
        this.maxCardsInPile = 12;
        break;
      default:
        this.maxCardsInPile = 13;
        break;
    }
  }

  public getArea(cardHeight: number): Area {
    throw new Error("Not implemented");
  }
}

export function Board(props: {
  myCards: ShowHideCard[]; // this will want to be able to show / hide / order

  yourCards: Card[];
  yourCards2: Card[];
  teamMateCards: Card[] | undefined;

  topCard: ShowHideCard;
  boxCards: Card[]; // where to put the box......

  peggingCards: PeggingCard[] | undefined;
}) {
  const { myCards, yourCards, yourCards2, teamMateCards } = props;
  // need to deal with score too

  if (yourCards2 == undefined) {
  }
}
