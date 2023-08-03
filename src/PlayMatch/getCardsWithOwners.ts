import { OtherPlayer, PlayingCard } from "../generatedTypes";
import { FlipCardData, FlipCardDatas, FlipCardState } from "./PlayMatchTypes";

export type CardsAndOwner = { cards: FlipCardData[]; owner: string };
export type CardsAndOwners = {
  playerCards: CardsAndOwner[];
  boxCards: FlipCardData[];
};

export function getCardsWithOwners(
  newFlipCardDatas: FlipCardDatas,
  myId: string,
  otherPlayers: OtherPlayer[],
  additionalBoxCard: FlipCardData | undefined,
  box: PlayingCard[] | undefined | null
): CardsAndOwners {
  const boxCards: FlipCardData[] = [];
  if (additionalBoxCard) {
    boxCards.push(additionalBoxCard);
  }

  const splitBoxCards = (flipCardDatas: FlipCardData[]) => {
    const nonBoxCards: FlipCardData[] = [];
    flipCardDatas.forEach((card) => {
      if (card.state === FlipCardState.Box) {
        boxCards.push(card);
      } else {
        nonBoxCards.push(card);
      }
    });
    return nonBoxCards;
  };
  const playerCardsAndOwners: CardsAndOwner[] = [
    {
      cards: splitBoxCards(newFlipCardDatas.myCards),
      owner: myId,
    },
  ];
  otherPlayers.forEach((otherPlayer, index) => {
    playerCardsAndOwners.push({
      owner: otherPlayer.id,
      cards: splitBoxCards(newFlipCardDatas.otherPlayersCards[index]),
    });
  });

  if (box) {
    boxCards.forEach((boxCard, i) => {
      boxCard.playingCard = box[i];
    });
  }

  return {
    playerCards: playerCardsAndOwners,
    boxCards,
  };
}
