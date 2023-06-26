using CribAzureFunctionApp.Matches.State;

namespace CribAzureFunctionApp.Matches.MyMatches
{
    public interface IMyMatchFactory
    {
        MyMatch ToMyMatch(CribMatch match, string playerId);
    }
}
