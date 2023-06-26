using CribAzureFunctionApp.Matches.Card;

namespace CribAzureFunctionApp.Matches.Deal
{
    public interface ICribDealer
    {
        ICribPlayingCards<PlayingCard> Deal(int numPlayers);
    }
}