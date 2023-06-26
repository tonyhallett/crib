#nullable enable

namespace CribAzureFunctionApp.Matches.State
{
    public record Go(string playerId, int afterPegged);
}