#nullable enable

using CribAzureFunctionApp.Matches.Card;

namespace CribAzureFunctionApp.Matches.Scoring.Scorer.Show
{
    public record ThreeOfAKind(PlayingCard Card1, PlayingCard Card2, PlayingCard Card3);

}