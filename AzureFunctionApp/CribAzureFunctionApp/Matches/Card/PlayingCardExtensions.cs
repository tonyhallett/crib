namespace CribAzureFunctionApp.Matches.Card
{
    public static class PlayingCardExtensions
    {
        public static bool IsJack(this PlayingCard card)
        {
            return card.Pips == Pips.Jack;
        }
    }
}
