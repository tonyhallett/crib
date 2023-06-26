#nullable enable

using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.State;
using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.Scoring.Match.Utilities
{
    public interface IHandReconstructor
    {
        IEnumerable<(string, IEnumerable<PlayingCard>)> Reconstruct(Pegging pegging, string dealerId, List<string> playerIds);
    }
}
