#nullable enable

namespace CribAzureFunctionApp.Matches.Scoring
{
    public class ScoringHistory<T> where T : IScoringCards
    {
        public ScoringHistory(int numScores, int totalScore, T? highestScoringCards)
        {
            NumScores = numScores;
            TotalScore = totalScore;
            HighestScoringCards = highestScoringCards;
        }
        public int NumScores { get; set; }
        public int TotalScore { get; set; }
        public T? HighestScoringCards { get; set; }
    }
}