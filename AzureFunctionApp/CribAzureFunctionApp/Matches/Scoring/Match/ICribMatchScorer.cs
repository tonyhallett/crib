#nullable enable

using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Scoring.Scorer;
using CribAzureFunctionApp.Matches.State;
using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.Scoring.Match
{
    public interface ICribMatchScorer
    {
        bool ScoreCutCard(CribMatch match);
        bool ScoreGo(CribMatch match, string playerId);
        (PeggingResult, PegScoring) ScorePegging(CribMatch match,
            List<PlayingCard> peggedCards,
            bool isPeggingCompleted,
            string playerId);
        bool ScoreShow(CribMatch match);
    }
}
