#nullable enable

using CribAzureFunctionApp.Matches.State;
using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.MyMatches
{
    public record MyPegging(
        List<PeggedCard> TurnedOverCards,
        List<PeggedCard> InPlayCards,
        string NextPlayer,
        bool MyCannotGo,
        List<bool> CannotGoes,
        List<Go> GoHistory);
}