#nullable enable

using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Scoring.Scorer;

namespace CribAzureFunctionApp.Matches.State
{
    public record PeggedCard(string Owner, PlayingCard PlayingCard, PegScoring PeggingScore);
}