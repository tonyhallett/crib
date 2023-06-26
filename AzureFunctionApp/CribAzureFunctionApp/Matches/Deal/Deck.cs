#nullable enable

using CribAzureFunctionApp;
using CribAzureFunctionApp.Matches.Card;
using System;
using System.Linq;

namespace CribAzureFunctionApp.Matches.Deal
{
    public class Deck : IDeck
    {
        private readonly PlayingCard[] playingCards = new PlayingCard[52];
        public Deck()
        {
            var suits = Enum.GetValues(typeof(Suit)).OfType<Suit>();
            var pips = Enum.GetValues(typeof(Pips)).OfType<Pips>();
            var counter = 0;
            foreach (var suit in suits)
            {
                foreach (var pip in pips)
                {
                    playingCards[counter] = new PlayingCard(suit, pip);
                    counter++;
                }
            }
        }

        public PlayingCard[] GetCards()
        {
            return playingCards;// should be ok to reuse

        }
    }
}