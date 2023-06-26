#nullable enable

using CribAzureFunctionApp.Matches.Scoring;

namespace CribAzureFunctionApp.Matches.MyMatches
{
    public record OtherPlayer(string Id, bool Discarded, bool Ready, PlayerScoringHistory PlayerScoringHistory);
}