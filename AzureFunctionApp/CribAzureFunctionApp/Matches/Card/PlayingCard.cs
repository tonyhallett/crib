namespace CribAzureFunctionApp.Matches.Card
{
    public record PlayingCard(Suit Suit, Pips Pips)
    {
        public int Value()
        {
            return Pips switch
            {
                Pips.Jack or Pips.Queen or Pips.King => 10,
                _ => (int)Pips + 1,
            };
        }
    }
}
