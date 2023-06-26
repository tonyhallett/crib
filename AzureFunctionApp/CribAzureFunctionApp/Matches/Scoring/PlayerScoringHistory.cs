#nullable enable

namespace CribAzureFunctionApp.Matches.Scoring
{
    public class PlayerScoringHistory
    {
        public PlayerScoringHistory(ScoringHistory<HighestScoringCards> handHistory, ScoringHistory<HighestScoringCards> boxHistory, ScoringHistory<HandAndBoxHighestScoringCards> handAndBoxHistory)
        {
            HandHistory = handHistory;
            BoxHistory = boxHistory;
            HandAndBoxHistory = handAndBoxHistory;
        }

        public ScoringHistory<HighestScoringCards> HandHistory { get; }
        public ScoringHistory<HighestScoringCards> BoxHistory { get; }
        public ScoringHistory<HandAndBoxHighestScoringCards> HandAndBoxHistory { get; }
    }
}