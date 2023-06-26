#nullable enable

using CribAzureFunctionApp.Matches.Card;

namespace CribAzureFunctionApp.Matches.Scoring.Scorer.Show
{
    public record FourOfAKind(PlayingCard Card1, PlayingCard Card2, PlayingCard Card3, PlayingCard Card4);

}