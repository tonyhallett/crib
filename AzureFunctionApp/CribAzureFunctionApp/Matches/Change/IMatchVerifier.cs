#nullable enable

using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.State;

namespace CribAzureFunctionApp.Matches.Change
{
    public interface IMatchVerifier
    {
        void VerifyPegging(CribMatch cribMatch, string playerId, PlayingCard pegCard);
        void VerifyDiscard(CribMatch match, string playerId, PlayingCard discard1, PlayingCard? discard2);
        void VerifyGo(CribMatch match, string playerId);
        void VerifyReady(CribMatch match, string playerId);
    }
}
