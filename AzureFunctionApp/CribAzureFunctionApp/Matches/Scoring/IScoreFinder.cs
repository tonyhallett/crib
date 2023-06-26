#nullable enable

using CribAzureFunctionApp.Matches.State;

namespace CribAzureFunctionApp.Matches.Scoring
{
    public interface IScoreFinder
    {
        Score Find(CribMatch match, string playerId);
    }
}
