using System;
using System.Collections.Generic;
using System.Linq;

namespace CribAzureFunctionApp.Matches.Deal
{
    public class CribPlayingCardsProvider<TCard> : ICribPlayingCardsProvider<TCard>
    {
        private readonly IShuffler<TCard> shuffler;

        public CribPlayingCardsProvider(IShuffler<TCard> shuffler)
        {
            this.shuffler = shuffler;
        }

        public ICribPlayingCards<TCard> Provide(int numPlayers, TCard[] deck)
        {
            if (numPlayers < 2 || numPlayers > 4)
            {
                throw new Exception("Incorrect number of players");
            }

            shuffler.Shuffle(deck);

            var cutCard = deck[0];
            var startIndex = 1;
            CribPlayingCards<TCard> cribPlayingCards;
            if (numPlayers == 3)
            {
                cribPlayingCards = new CribPlayingCards<TCard>(cutCard, deck[1]);
                startIndex = 2;
            }
            else
            {
                cribPlayingCards = new CribPlayingCards<TCard>(cutCard);
            }

            var numberOfCardsPerPlayer = numPlayers == 2 ? 6 : 5;

            var hands = cribPlayingCards.GetHands(numPlayers);
            FillHands(deck, startIndex, numberOfCardsPerPlayer, hands);
            return cribPlayingCards;
        }

        private static void FillHands(TCard[] deck, int startIndex, int numberOfCardsPerHand, List<List<TCard>> hands)
        {
            foreach (var hand in hands)
            {
                hand.AddRange(deck.Take(new Range(startIndex, startIndex + numberOfCardsPerHand)));
                startIndex += numberOfCardsPerHand;
            }
        }


    }
}