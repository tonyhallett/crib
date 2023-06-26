#nullable enable

using CribAzureFunctionApp.Matches.State;
using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.Utilities
{
    public interface INextPlayer
    {
        string ForNextStage(bool gameWon, DealerDetails dealerDetails, List<string> playerIds);
        string Get(string currentPlayer, List<string> playerIds, List<bool> cannotGoes);
        List<string> Turns(string dealerId, List<string> playerIds);
    }
}