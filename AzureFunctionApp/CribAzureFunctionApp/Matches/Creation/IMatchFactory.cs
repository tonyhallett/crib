using CribAzureFunctionApp.Matches.State;

namespace CribAzureFunctionApp.Matches.Creation
{
    public interface IMatchFactory
    {
        CribMatch Create(MatchOptions options, string creator);
    }
}