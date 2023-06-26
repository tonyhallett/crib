#nullable enable

using CribAzureFunctionApp.Matches.Card;
using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.Scoring
{
    public class HighestScoringCards : IScoringCards
    {
        public HighestScoringCards(int score, List<PlayingCard> handOrBox, PlayingCard cutCard)
        {
            Score = score;
            HandOrBox = handOrBox;
            CutCard = cutCard;
        }

        public int Score { get; set; }
        public List<PlayingCard> HandOrBox { get; set; }
        public PlayingCard CutCard { get; set; }
    }
}