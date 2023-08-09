import {
  HandAndBoxHighestScoringCards,
  HighestScoringCards,
  MyMatch,
  PlayerScoringHistory,
  PlayingCard,
} from "../../../generatedTypes";
import { cardMatch } from "../../playingCardUtilities";

type PlayerScoringHistoryAndHandResult = {
  playerScoringHistory: PlayerScoringHistory;
  handResult?: HighestScoringShowResult;
  handAndCutCard?: PlayingCard[];
};
export type PlayerScoringHistoriesWithHandResult = {
  [playerId: string]: PlayerScoringHistoryAndHandResult;
};

export interface HighestScoringShowResult {
  handOrBox: boolean;
  handAndBox: boolean;
  highestHandOrBoxOfAll: boolean;
  highestHandAndBoxOfAll: boolean;
  score: number;
  handAndBoxScore: number;
}

export class HighestScoringShow {
  private playerScoringHistoriesWithHandResult: PlayerScoringHistoriesWithHandResult;
  private highestHand = 0;
  private highestBox = 0;
  private highestHandAndBox = 0;
  constructor(private myMatch: MyMatch) {
    this.playerScoringHistoriesWithHandResult =
      this.getPlayerScoringHistories(myMatch);
  }

  private getPlayerScoringHistories(
    myMatch: MyMatch
  ): PlayerScoringHistoriesWithHandResult {
    const playerScoringHistories: PlayerScoringHistoriesWithHandResult = {};
    playerScoringHistories[myMatch.myId] = {
      playerScoringHistory: myMatch.myScoringHistory,
    };
    this.updateHighestScores(myMatch.myScoringHistory);
    myMatch.otherPlayers.forEach((player) => {
      playerScoringHistories[player.id] = {
        playerScoringHistory: player.playerScoringHistory,
      };
      this.updateHighestScores(player.playerScoringHistory);
    });
    return playerScoringHistories;
  }

  private updateHighestScores(scoringHistory: PlayerScoringHistory) {
    const handScoringCards = scoringHistory.handHistory.highestScoringCards;
    if (handScoringCards) {
      this.highestHand = Math.max(this.highestHand, handScoringCards.score);
    }
    const boxScoringCards = scoringHistory.boxHistory.highestScoringCards;
    if (boxScoringCards) {
      this.highestBox = Math.max(this.highestBox, boxScoringCards.score);
    }
    const handAndBoxScoringCards =
      scoringHistory.handAndBoxHistory.highestScoringCards;
    if (handAndBoxScoringCards) {
      this.highestHandAndBox = Math.max(
        this.highestHandAndBox,
        handAndBoxScoringCards.score
      );
    }
  }

  // eslint-disable-next-line complexity
  isHighestScoring(
    cards: PlayingCard[],
    playerId: string,
    isBox: boolean
  ): HighestScoringShowResult {
    const playerScoringHistoryAndResult =
      this.playerScoringHistoriesWithHandResult[playerId];
    if (!isBox) {
      playerScoringHistoryAndResult.handAndCutCard = cards;
    }
    const playerScoringHistory =
      playerScoringHistoryAndResult.playerScoringHistory;

    const { isPlayerHighestScoring, highestScoringCards } =
      this.determineHandOrBox(isBox, playerScoringHistory, cards);
    const score = isPlayerHighestScoring ? highestScoringCards.score : 0;
    const result: HighestScoringShowResult = {
      score,
      handOrBox: isPlayerHighestScoring,
      highestHandOrBoxOfAll: this.isHighestHandOrBoxOfAll(
        isPlayerHighestScoring,
        highestScoringCards.score,
        isBox
      ),

      handAndBoxScore: 0,
      handAndBox: false,
      highestHandAndBoxOfAll: false,
    };

    if (isBox) {
      // isBox is called last so can use previous result
      this.addBox(playerScoringHistoryAndResult, result, cards);
    } else {
      playerScoringHistoryAndResult.handResult = result;
    }
    return result;
  }

  private determineHandOrBox(
    isBox: boolean,
    playerScoringHistory: PlayerScoringHistory,
    cards: PlayingCard[]
  ) {
    const compareTo = isBox
      ? playerScoringHistory.boxHistory
      : playerScoringHistory.handHistory;
    // as will only be called for when there is a show
    const highestScoringCards =
      compareTo.highestScoringCards as HighestScoringCards;
    const compareToCards = [
      highestScoringCards.cutCard,
      ...highestScoringCards.handOrBox,
    ];

    const isPlayerHighestScoring = this.isHighest(cards, compareToCards);
    return {
      isPlayerHighestScoring,
      highestScoringCards,
    };
  }

  private isHighest(cards: PlayingCard[], compareToCards: PlayingCard[]) {
    return cards.every((card) =>
      compareToCards.some((compareToCard) => cardMatch(card, compareToCard))
    );
  }

  private addBox(
    playerScoringHistoryAndResult: PlayerScoringHistoryAndHandResult,
    result: HighestScoringShowResult,
    boxAndCutCard: PlayingCard[]
  ) {
    const handAndBoxHighestScoringCards = playerScoringHistoryAndResult
      .playerScoringHistory.handAndBoxHistory
      .highestScoringCards as HandAndBoxHighestScoringCards;
    if (
      this.isHighestHandAndBox(
        handAndBoxHighestScoringCards,
        boxAndCutCard,
        playerScoringHistoryAndResult.handAndCutCard as PlayingCard[]
      )
    ) {
      result.handAndBoxScore = handAndBoxHighestScoringCards.score;
      result.handAndBox = true;
      result.highestHandAndBoxOfAll =
        result.handAndBoxScore >= this.highestHandAndBox;
    }
  }

  private isHighestHandAndBox(
    handAndBoxHighestScoringCards: HandAndBoxHighestScoringCards,
    boxAndCutCard: PlayingCard[],
    handAndCutCard: PlayingCard[]
  ) {
    return (
      this.isHighest(boxAndCutCard, [
        handAndBoxHighestScoringCards.cutCard,
        ...handAndBoxHighestScoringCards.box,
      ]) &&
      this.isHighest(handAndCutCard, [
        handAndBoxHighestScoringCards.cutCard,
        ...handAndBoxHighestScoringCards.hand,
      ])
    );
  }

  private isHighestHandOrBoxOfAll(
    isPlayerHighestScoring: boolean,
    playerHighestScore: number,
    isBox: boolean
  ) {
    return (
      isPlayerHighestScoring &&
      playerHighestScore === (isBox ? this.highestBox : this.highestHand)
    );
  }
}
