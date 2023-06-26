using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.State;

namespace CribAzureFunctionApp.Matches.Change
{
    public interface IMatchLogic
    {
        void Discard(CribMatch match, string playerId, PlayingCard discard1, PlayingCard discard2);
        void Peg(CribMatch match, string playerId, PlayingCard pegCard);
        void Go(CribMatch match, string playerId);
        void Ready(CribMatch match, string playerId);
    }
}