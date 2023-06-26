#nullable enable

using CribAzureFunctionApp.Matches.Scoring.Scorer.Show;
using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.Scoring
{
    public record ShowScoring(ShowScore? BoxScore, List<PlayerShowScore> PlayerShowScores);
}
