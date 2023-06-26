using CribAzureFunctionApp.Matches.Card;

namespace CribAzureFunctionApp.Matches.Deal
{
    public class CribDealer : ICribDealer
    {
        private readonly ICribPlayingCardsProvider<PlayingCard> playingCardsProvider;
        private readonly PlayingCard[] deck;

        public CribDealer(ICribPlayingCardsProvider<PlayingCard> playingCardsProvider, IDeck deck)
        {
            this.playingCardsProvider = playingCardsProvider;
            this.deck = deck.GetCards();
        }

        public ICribPlayingCards<PlayingCard> Deal(int numPlayers)
        {
            return playingCardsProvider.Provide(numPlayers, deck);
        }
    }
}