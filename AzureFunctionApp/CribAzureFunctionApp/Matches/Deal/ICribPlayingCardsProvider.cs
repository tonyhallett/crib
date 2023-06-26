namespace CribAzureFunctionApp.Matches.Deal
{
    public interface ICribPlayingCardsProvider<TCard>
    {
        ICribPlayingCards<TCard> Provide(int numPlayers, TCard[] deck);
    }
}