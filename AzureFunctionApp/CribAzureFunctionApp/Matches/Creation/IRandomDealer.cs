#nullable enable

using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.Creation
{
    public interface IRandomDealer
    {
        string Get(List<string> otherPlayers, string creator);

    }
}