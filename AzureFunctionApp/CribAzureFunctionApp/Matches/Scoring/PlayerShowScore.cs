#nullable enable

using CribAzureFunctionApp.Matches.Scoring.Scorer.Show;

namespace CribAzureFunctionApp.Matches.Scoring
{
    public record PlayerShowScore(ShowScore ShowScore, string PlayerId);
}
