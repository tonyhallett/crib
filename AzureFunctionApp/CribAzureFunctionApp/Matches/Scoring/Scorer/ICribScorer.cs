using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Scoring.Scorer.Show;
using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.Scoring.Scorer
{
    public interface ICribScorer
    {
        PegScoring GetPegging(List<PlayingCard> playingCards, bool scoreLastGo);
        ShowScore GetShow(List<PlayingCard> handOrBox, PlayingCard cutCard, bool isBox);
    }
}