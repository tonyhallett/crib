using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.Creation
{
    public record MatchOptions(List<string> OtherPlayers, string MatchWinDeterminant, string Title);
}