#nullable enable

namespace CribAzureFunctionApp.Matches.Scoring
{
    public interface IScoreIncrementer
    {
        void Increment(Score score, int increment);
    }
}
