#nullable enable

using CribAzureFunctionApp.Matches.Card;
using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.Scoring
{
    public class HandAndBoxHighestScoringCards : IScoringCards
    {
        public HandAndBoxHighestScoringCards(
            int handScore,
            int boxScore,
            List<PlayingCard> hand,
            List<PlayingCard> box,
            PlayingCard cutCard
        )
        {
            HandScore = handScore;
            BoxScore = boxScore;
            Hand = hand;
            Box = box;
            CutCard = cutCard;
        }

        public int Score => HandScore + BoxScore;
        public int HandScore { get; }
        public int BoxScore { get; }
        public List<PlayingCard> Hand { get; }
        public List<PlayingCard>? Box { get; set; }
        public PlayingCard CutCard { get; }
    }
}